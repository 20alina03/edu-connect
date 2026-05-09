import { api } from "../api";

export interface Review {
  id: string;
  booking_id: string;
  student_id: string;
  teacher_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export const reviewsApi = {
  byTeacher: (teacherId: string) => api.get<{ reviews: Review[] }>(`/reviews/teacher/${teacherId}`),
  create: (data: { booking_id: string; rating: number; comment?: string }) =>
    api.post<{ review: Review }>(`/reviews`, data),
};
