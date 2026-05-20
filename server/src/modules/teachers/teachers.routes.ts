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
    let q = supabaseAdmin.from("teacher_profiles").select("*").eq("is_active", true);
    if (subject) q = q.contains("subjects", [subject]);
    if (mode) q = q.eq("mode", mode);
    if (gender) q = q.eq("gender", gender);
    if (min !== undefined) q = q.gte("hourly_rate_usd", min);
    if (max !== undefined) q = q.lte("hourly_rate_usd", max);
    const { data, error } = await q.order("rating", { ascending: false }).limit(100);
    if (error) throw badRequest(error.message);

    const ids = (data ?? []).map((t) => t.user_id);
    const { data: profs } = ids.length
      ? await supabaseAdmin.from("profiles").select("id, full_name, avatar_url").in("id", ids)
      : { data: [] as Array<{ id: string; full_name: string | null; avatar_url: string | null }> };
    const profMap = new Map((profs ?? []).map((p) => [p.id, p]));
    const teachers = (data ?? []).map((t) => ({ ...t, profile: profMap.get(t.user_id) ?? null }));
    res.json({ teachers });
  }),
);

teachersRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // ── Safety net ────────────────────────────────────────────────────────
    // If route order is ever misconfigured and "me" falls through to here,
    // return a clear error instead of passing "me" to Supabase as a UUID.
    if (id === "me" || id === "me%2F" || !/^[0-9a-f-]{36}$/i.test(id)) {
      throw badRequest(
        id === "me"
          ? 'Route conflict: "me" reached /:id — check route registration order in routes.ts'
          : `Invalid teacher ID format: "${id}"`,
      );
    }

    const { data, error } = await supabaseAdmin
      .from("teacher_profiles")
      .select("*")
      .eq("user_id", id)
      .maybeSingle();
    if (error) throw badRequest(error.message);
    if (!data) throw notFound("Teacher not found");
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, avatar_url, phone")
      .eq("id", id)
      .maybeSingle();
    res.json({ teacher: { ...data, profile: profile ?? null } });
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