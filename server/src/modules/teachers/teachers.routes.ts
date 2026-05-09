import { Router } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../../lib/supabase.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { notFound, badRequest } from "../../lib/http-error.js";

export const teachersRouter = Router();

const ListQuery = z.object({
  subject: z.string().optional(),
  mode: z.enum(["online", "home_visit", "both"]).optional(),
  gender: z.enum(["male", "female"]).optional(),
  min: z.coerce.number().optional(),
  max: z.coerce.number().optional(),
});

teachersRouter.get(
  "/",
  validate({ query: ListQuery }),
  asyncHandler(async (req, res) => {
    const { subject, mode, gender, min, max } = req.query as z.infer<typeof ListQuery>;
    let q = supabaseAdmin
      .from("teacher_profiles")
      .select("*, profile:profiles!teacher_profiles_user_id_fkey(full_name, avatar_url)")
      .eq("is_active", true);
    if (subject) q = q.contains("subjects", [subject]);
    if (mode) q = q.eq("mode", mode);
    if (gender) q = q.eq("gender", gender);
    if (min !== undefined) q = q.gte("hourly_rate_usd", min);
    if (max !== undefined) q = q.lte("hourly_rate_usd", max);
    const { data, error } = await q.order("rating", { ascending: false }).limit(100);
    if (error) throw badRequest(error.message);
    res.json({ teachers: data ?? [] });
  }),
);

teachersRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from("teacher_profiles")
      .select("*, profile:profiles!teacher_profiles_user_id_fkey(full_name, avatar_url, phone)")
      .eq("user_id", req.params.id)
      .maybeSingle();
    if (error) throw badRequest(error.message);
    if (!data) throw notFound("Teacher not found");
    res.json({ teacher: data });
  }),
);

const OnboardingSchema = z.object({
  subjects: z.array(z.string()).min(1),
  hourly_rate_usd: z.number().positive(),
  mode: z.enum(["online", "home_visit", "both"]),
  bio: z.string().optional(),
  quran_level: z.string().optional(),
  gender: z.enum(["male", "female"]).optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  languages: z.array(z.string()).optional(),
  experience_years: z.number().int().min(0).optional(),
});

teachersRouter.post(
  "/onboarding",
  requireAuth,
  requireRole("teacher"),
  validate({ body: OnboardingSchema }),
  asyncHandler(async (req, res) => {
    const { error, data } = await supabaseAdmin
      .from("teacher_profiles")
      .upsert({ user_id: req.user!.id, ...req.body, updated_at: new Date().toISOString() }, { onConflict: "user_id" })
      .select()
      .single();
    if (error) throw badRequest(error.message);
    res.json({ teacher: data });
  }),
);
