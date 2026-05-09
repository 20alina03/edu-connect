import { api } from "../api";

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  portal: "islamic" | "school" | null;
}

export const profileApi = {
  get: () => api.get<{ profile: Profile | null }>(`/profile`),
  update: (data: Partial<Profile>) => api.patch<{ profile: Profile }>(`/profile`, data),
};
