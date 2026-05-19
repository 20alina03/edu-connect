import type { Request, Response, NextFunction } from "express";
import { supabaseAnon, supabaseAdmin } from "../lib/supabase.js";
import { unauthorized, forbidden } from "../lib/http-error.js";

export type AppRole = "student" | "teacher" | "admin";

export interface AuthedUser {
  id: string;
  email: string | null;
  role: AppRole;
  roles: AppRole[];
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthedUser;
    }
  }
}

export const requireAuth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) throw unauthorized("Missing bearer token");
    const token = header.slice(7);

    const { data, error } = await supabaseAnon.auth.getUser(token);
    if (error || !data.user) throw unauthorized("Invalid token");

    const { data: roleRow } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .order("role", { ascending: true })
      .limit(10);

    const roles = (roleRow ?? []).map((entry) => entry.role as AppRole);
    const primaryRole = roles.find((value) => value === "admin") ?? roles.find((value) => value === "teacher") ?? roles.find((value) => value === "student") ?? "student";

    req.user = {
      id: data.user.id,
      email: data.user.email ?? null,
      role: primaryRole,
      roles: roles.length ? roles : ["student"],
    };
    next();
  } catch (e) {
    next(e);
  }
};

export const requireRole = (...roles: AppRole[]) => (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) return next(unauthorized());
  if (!roles.includes(req.user.role) && req.user.role !== "admin") return next(forbidden());
  next();
};
