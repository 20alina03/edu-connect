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

    // ── 1. Fetch roles from user_roles table ──────────────────────────────
    const { data: roleRow } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .order("role", { ascending: true })
      .limit(10);

    // ── 2. Check for existing teacher_profile row ─────────────────────────
    const { data: teacherProfile } = await supabaseAdmin
      .from("teacher_profiles")
      .select("user_id")
      .eq("user_id", data.user.id)
      .maybeSingle();

    // ── 3. Determine if user is a teacher from any signal ─────────────────
    const metadataRole =
      (data.user.user_metadata?.role as AppRole | undefined) ??
      (data.user.app_metadata?.role as AppRole | undefined);
    const inferredTeacher = metadataRole === "teacher" || Boolean(teacherProfile);

    let roles = (roleRow ?? []).map((entry) => entry.role as AppRole);

    // ── 4. Auto-insert teacher role if inferred but missing ───────────────
    //    This handles users who signed up before the DB trigger existed
    if (inferredTeacher && !roles.includes("teacher")) {
      await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: data.user.id, role: "teacher" }, { onConflict: "user_id,role" });
      roles.push("teacher");
    }

    // ── 5. Also auto-insert student role if missing entirely ──────────────
    if (roles.length === 0) {
      roles = ["student"];
    }

    // ── 6. Resolve primary role — highest privilege wins ──────────────────
    //    Priority: admin > teacher > student
    //    inferredTeacher is the final fallback so a brand-new teacher whose
    //    user_roles row was just inserted always gets role="teacher" here.
    const primaryRole: AppRole =
      roles.includes("admin")
        ? "admin"
        : roles.includes("teacher")
          ? "teacher"
          : inferredTeacher
            ? "teacher"
            : "student";

    req.user = {
      id: data.user.id,
      email: data.user.email ?? null,
      role: primaryRole,
      roles,
    };
    next();
  } catch (e) {
    next(e);
  }
};

// ── requireRole ─────────────────────────────────────────────────────────────
// Checks BOTH req.user.role (primary) AND req.user.roles (all roles).
// This means a user with roles=["student","teacher"] will pass requireRole("teacher")
// even if their primary role resolved to something else during the request.
export const requireRole =
  (...allowedRoles: AppRole[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(unauthorized());

    const isAdmin = req.user.role === "admin" || req.user.roles.includes("admin");
    const hasRole =
      allowedRoles.includes(req.user.role) ||
      req.user.roles.some((r) => allowedRoles.includes(r));

    if (!isAdmin && !hasRole) return next(forbidden());
    next();
  };