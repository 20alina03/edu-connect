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

export interface SetStatusResult {
  booking: Booking;
  /** Populated for teacher when status → confirmed */
  teacherCalendarLink?: string;
  /** Populated for student when status → confirmed */
  studentCalendarLink?: string;
}

export interface CreateBookingResult {
  booking: Booking;
  /** "Add to Google Calendar" link for the student */
  studentCalendarLink: string;
}

export const bookingsApi = {
  list: () => api.get<{ bookings: Booking[] }>("/bookings"),

  create: (data: {
    teacher_id: string;
    subject: string;
    start_at: string;
    duration_min: number;
    mode: "online" | "home_visit" | "both";
    notes?: string;
    price_usd: number;
  }) => api.post<CreateBookingResult>("/bookings", data),

  setStatus: (id: string, status: Booking["status"]) =>
    api.patch<SetStatusResult>(`/bookings/${id}/status`, { status }),
};