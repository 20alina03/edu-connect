import { api } from "../api";

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
}

export const messagesApi = {
  list: (withUser?: string) =>
    api.get<{ messages: Message[] }>(`/messages${withUser ? `?with=${withUser}` : ""}`),
  send: (recipient_id: string, body: string) =>
    api.post<{ message: Message }>(`/messages`, { recipient_id, body }),
  markRead: (id: string) => api.patch<{ ok: true }>(`/messages/${id}/read`),
};
