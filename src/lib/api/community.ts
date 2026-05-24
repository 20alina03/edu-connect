import { api } from "../api";

export type CommunityPortal = "islamic" | "school";

export interface CommunityPost {
  id: string;
  portal: CommunityPortal;
  author_id: string;
  author_name: string;
  author_avatar: string | null;
  body: string;
  image_url: string | null;
  caption: string | null;
  created_at: string;
  updated_at: string;
}

export interface CommunityListResponse {
  posts: CommunityPost[];
  available?: boolean;
}

export const communityApi = {
  list: (portal?: CommunityPortal) => api.get<CommunityListResponse>(`/community${portal ? `?portal=${portal}` : ""}`),
  create: (data: { portal: CommunityPortal; body?: string; image_url?: string | null; caption?: string | null }) =>
    api.post<{ post: CommunityPost }>(`/community`, data),
  update: (id: string, data: { body?: string; image_url?: string | null; caption?: string | null }) =>
    api.patch<{ post: CommunityPost }>(`/community/${id}`, data),
  delete: (id: string) => api.delete<void>(`/community/${id}`),
};