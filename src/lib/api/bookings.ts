import { api } from "../api";

export interface Booking {
  id: string;
  student_id: string;
  teacher_id: string;
  subject: string;
  start_at: string;
  duration_min: number;
  mode: "online" | "home_visit" | "both";
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes: string | null;
  price_usd: number;
  meeting_link: string | null;
  attendance_status: "present" | "absent" | "late" | null;
  attendance_marked_at: string | null;
  created_at: string;
  updated_at: string;
}

export const bookingsApi = {
  list: () => api.get<{ bookings: Booking[] }>(`/bookings`),
  create: (data: {
    teacher_id: string;
    subject: string;
    start_at: string;
    duration_min: number;
    mode: "online" | "home_visit" | "both";
    notes?: string;
    price_usd: number;
  }) => api.post<{ booking: Booking }>(`/bookings`, data),
  setStatus: (id: string, status: Booking["status"]) =>
    api.patch<{ booking: Booking }>(`/bookings/${id}/status`, { status }),
};
