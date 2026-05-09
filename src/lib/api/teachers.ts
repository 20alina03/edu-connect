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
  rating: number | null;
  total_reviews: number | null;
  is_verified: boolean | null;
  experience_years: number | null;
  profile?: { full_name: string | null; avatar_url: string | null; phone?: string | null };
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
};
