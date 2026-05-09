import { Router } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../../lib/supabase.js";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { badRequest } from "../../lib/http-error.js";

export const profileRouter = Router();
profileRouter.use(requireAuth);

profileRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from("profiles").select("*").eq("id", req.user!.id).maybeSingle();
    if (error) throw badRequest(error.message);
    res.json({ profile: data });
  }),
);

const UpdateSchema = z.object({
  full_name: z.string().min(1).optional(),
  phone: z.string().optional(),
  avatar_url: z.string().url().optional(),
  portal: z.enum(["islamic", "school"]).optional(),
});

profileRouter.patch(
  "/",
  validate({ body: UpdateSchema }),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq("id", req.user!.id)
      .select()
      .single();
    if (error) throw badRequest(error.message);
    res.json({ profile: data });
  }),
);
