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
    let { data, error } = await supabaseAdmin.from("profiles").select("*").eq("id", req.user!.id).maybeSingle();
    if (error) throw badRequest(error.message);

    if (!data) {
      const { data: upsertData, error: upsertError } = await supabaseAdmin
        .from("profiles")
        .upsert({
          id: req.user!.id,
          full_name: req.user!.email ? req.user!.email.split("@")[0] : "User",
        }, { onConflict: "id" })
        .select()
        .single();
      if (upsertError) throw badRequest(upsertError.message);
      data = upsertData;
    }

    res.json({ profile: data });
  }),
);

const UpdateSchema = z.object({
  full_name: z.string().optional().transform((v) => (v === "" ? undefined : v)),
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
      .upsert({ ...req.body, id: req.user!.id, updated_at: new Date().toISOString() }, { onConflict: "id" })
      .select()
      .single();
    if (error) throw badRequest(error.message);
    res.json({ profile: data });
  }),
);
