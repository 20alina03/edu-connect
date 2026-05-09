import { api } from "../api";

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  read_at: string | null;
  data: Record<string, unknown>;
  created_at: string;
}

export const notificationsApi = {
  list: () => api.get<{ notifications: Notification[] }>(`/notifications`),
  markRead: (id: string) => api.patch<{ ok: true }>(`/notifications/${id}/read`),
  markAllRead: () => api.patch<{ ok: true }>(`/notifications/read-all`),
};
