import { api } from "../api";

export type StudentAssignmentStatus = "upcoming" | "submitted" | "graded";
export type StudentPortal = "islamic" | "school";

export interface StudentAssignmentItem {
  id: string;
  title: string;
  subject: string;
  portal: StudentPortal;
  teacher: string;
  teacherId: string;
  teacherAvatar?: string | null;
  dueAt: string;
  assignedAt: string;
  submittedAt?: string | null;
  score?: number | null;
  maxScore: number;
  status: StudentAssignmentStatus;
  note: string;
  fileUrl?: string | null;
  fileName?: string | null;
  fileType?: "pdf" | "image" | null;
}

export interface StudentResourceItem {
  id: string;
  title: string;
  subject: string | null;
  teacherId: string;
  teacher: string;
  teacherAvatar?: string | null;
  portal: StudentPortal;
  driveUrl: string;
  description: string;
  lessonType: "note" | "template";
  createdAt: string;
}

export interface StudentAssignmentsResponse {
  assignments: StudentAssignmentItem[];
  resources: {
    lesson_notes: StudentResourceItem[];
    template_lessons: StudentResourceItem[];
  };
}

export const studentsApi = {
  getAssignments: () => api.get<StudentAssignmentsResponse>("/students/me/assignments"),
  submitSolution: (assessmentId: string, data: { fileUrl: string; fileName: string }) =>
    api.post<{ solution: { id: string } }>(`/students/me/assignments/${assessmentId}/solutions`, data),
};