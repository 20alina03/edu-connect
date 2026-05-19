import { Router } from "express";
import { z } from "zod";
import { supabaseAdmin, supabaseAnon } from "../../lib/supabase.js";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { badRequest } from "../../lib/http-error.js";

export const authRouter = Router();

const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1),
  role: z.enum(["student", "teacher"]),
});

authRouter.post(
  "/signup",
  validate({ body: SignupSchema }),
  asyncHandler(async (req, res) => {
    const { email, password, fullName, role } = req.body;
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { full_name: fullName, role },
    });

    if (error) throw badRequest(error.message);
    res.status(201).json({ user: { id: data.user?.id, email: data.user?.email } });
  }),
);

const RoleSchema = z.enum(["student", "teacher", "admin"]);

const getUserRoles = async (userId: string) => {
  const { data } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((entry) => RoleSchema.parse(entry.role));
  const uniqueRoles = [...new Set(roles)];
  return uniqueRoles.length ? uniqueRoles : ["student"];
};

authRouter.post(
  "/reset",
  validate({ body: z.object({ email: z.string().email(), redirectTo: z.string().url().optional() }) }),
  asyncHandler(async (req, res) => {
    const { email, redirectTo } = req.body;
    const { error } = await supabaseAnon.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw badRequest(error.message);
    res.json({ ok: true });
  }),
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { data: profile } = await supabaseAdmin.from("profiles").select("*").eq("id", req.user!.id).maybeSingle();
    res.json({ user: req.user, profile, roles: req.user!.roles });
  }),
);
