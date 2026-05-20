import { supabase } from "@/integrations/supabase/client";

const isLocalDev = typeof window !== "undefined" && /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);
const API_URL = import.meta.env.VITE_API_URL ?? (isLocalDev ? "http://localhost:4000/api" : "/api");

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (session?.access_token) headers.set("Authorization", `Bearer ${session.access_token}`);

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  const text = await res.text();
  let body: any = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { error: text };
    }
  }

  if (!res.ok) throw new ApiError(res.status, body?.error ?? res.statusText, body?.details);
  return body as T;
}

export const api = {
  get: <T>(p: string) => request<T>(p),
  post: <T>(p: string, body?: unknown) => request<T>(p, { method: "POST", body: JSON.stringify(body ?? {}) }),
  patch: <T>(p: string, body?: unknown) => request<T>(p, { method: "PATCH", body: JSON.stringify(body ?? {}) }),
  put: <T>(p: string, body?: unknown) => request<T>(p, { method: "PUT", body: JSON.stringify(body ?? {}) }),
  delete: <T>(p: string) => request<T>(p, { method: "DELETE" }),
};
