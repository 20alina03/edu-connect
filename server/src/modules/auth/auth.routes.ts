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
  // Optional: frontend can pass its own origin so the confirmation link
  // redirects back to the correct environment (local dev vs production).
  redirectTo: z.string().url().optional(),
});

authRouter.post(
  "/signup",
  validate({ body: SignupSchema }),
  asyncHandler(async (req, res) => {
    const { email, password, fullName, role, redirectTo } = req.body;

    // ✅ Use the ANON client's signUp() — this is the only method that
    // triggers Supabase to send the confirmation email through your
    // configured SMTP (Brevo).  The admin.createUser() path intentionally
    // skips the email flow regardless of the email_confirm flag.
    const { data, error } = await supabaseAnon.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
        // If the caller didn't supply a redirectTo we fall back to the
        // Supabase project's "Site URL" setting, which is fine for prod.
        ...(redirectTo ? { emailRedirectTo: redirectTo } : {}),
      },
    });

    if (error) throw badRequest(error.message);

    // Supabase returns an identities array that is empty when the address
    // is already registered but unconfirmed.  Surface a clear message so
    // the frontend can prompt the user to check their inbox.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      throw badRequest("An account with this email already exists. Please check your inbox for a confirmation email or try signing in.");
    }

    res.status(201).json({
      user: { id: data.user?.id, email: data.user?.email },
      // Tells the frontend that the user still needs to confirm their email.
      confirmationRequired: !data.user?.confirmed_at,
    });
  }),
);

const RoleSchema = z.enum(["student", "teacher", "admin"]);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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