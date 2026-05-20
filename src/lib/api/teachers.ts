import { api } from "../api";

export interface TeacherProfile {
  id: string;
  user_id: string;
  subjects: string[];
  hourly_rate_usd: number;
  mode: "online" | "home_visit" | "both";
  bio: string | null;
  quran_level: string | null;
  gender: "male" | "female" | null;
  country: string | null;
  city: string | null;
  languages: string[] | null;
  education?: string[];
  rating: number | null;
  total_reviews: number | null;
  is_verified: boolean | null;
  experience_years: number | null;
  profile?: { full_name: string | null; avatar_url: string | null; phone?: string | null };
  lesson_notes?: TeacherLessonItem[];
  template_lessons?: TeacherLessonItem[];
  assessments?: TeacherAssessmentItem[];
  deleted_at?: string | null;
}

export interface TeacherAvailabilityItem {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface TeacherLessonItem {
  id?: string;
  title: string;
  subject?: string;
  driveUrl: string;
  description: string;
  assignedStudents: string[];
  createdAt?: string;
}

export interface TeacherAssessmentSolution {
  id?: string;
  assessmentId?: string;
  studentId: string;
  fileUrl: string;
  fileName: string;
  submittedAt?: string;
  marks?: number | null;
  maxMarks?: number;
  feedback?: string | null;
  gradedAt?: string | null;
}

export interface TeacherAssessmentItem {
  id?: string;
  title: string;
  description: string;
  fileUrl?: string | null;
  fileName?: string | null;
  fileType?: "pdf" | "image" | null;
  createdAt?: string;
  assignedStudents: string[];
  solutions: TeacherAssessmentSolution[];
}

export interface TeacherDashboardRecord {
  profile: { full_name: string | null; avatar_url: string | null; phone?: string | null; email?: string | null } | null;
  id: string;
  user_id: string;
  subjects: string[];
  hourly_rate_usd: number;
  mode: "online" | "home_visit" | "both";
  bio: string | null;
  quran_level: string | null;
  gender: "male" | "female" | null;
  country: string | null;
  city: string | null;
  languages: string[] | null;
  education?: string[];
  rating: number | null;
  total_reviews: number | null;
  is_verified: boolean | null;
  experience_years: number | null;
  availability: TeacherAvailabilityItem[];
  lesson_notes: TeacherLessonItem[];
  template_lessons: TeacherLessonItem[];
  assessments: TeacherAssessmentItem[];
  deleted_at?: string | null;
}

export interface TeacherFilters {
  subject?: string;
  mode?: "online" | "home_visit" | "both";
  gender?: "male" | "female";
  min?: number;
  max?: number;
}

export const teachersApi = {
  list: (f: TeacherFilters = {}) => {
    const q = new URLSearchParams(Object.entries(f).filter(([, v]) => v !== undefined && v !== "") as any);
    return api.get<{ teachers: TeacherProfile[] }>(`/teachers?${q}`);
  },
  get: (id: string) => api.get<{ teacher: TeacherProfile }>(`/teachers/${id}`),
  onboarding: (data: Partial<TeacherProfile>) => api.post<{ teacher: TeacherProfile }>(`/teachers/onboarding`, data),
  getDashboard: () => api.get<{ teacher: TeacherDashboardRecord }>(`/teachers/me`),
  updateProfile: (data: Record<string, unknown>) => api.patch<{ teacher: TeacherDashboardRecord }>(`/teachers/me/profile`, data),
  deleteProfile: () => api.delete<{ teacher: TeacherDashboardRecord }>(`/teachers/me/profile`),
  getAvailability: () => api.get<{ availability: TeacherAvailabilityItem[] }>(`/teachers/me/availability`),
  saveAvailability: (availability: TeacherAvailabilityItem[]) => api.put<{ availability: TeacherAvailabilityItem[] }>(`/teachers/me/availability`, { availability }),
  getPortfolio: () => api.get<{ lesson_notes: TeacherLessonItem[]; template_lessons: TeacherLessonItem[]; assessments: TeacherAssessmentItem[] }>(`/teachers/me/portfolio`),
  savePortfolio: (data: { lesson_notes: TeacherLessonItem[]; template_lessons: TeacherLessonItem[]; assessments: TeacherAssessmentItem[] }) => api.put<{ teacher: TeacherProfile }>(`/teachers/me/portfolio`, data),
};
