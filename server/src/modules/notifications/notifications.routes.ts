import { Router } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../../lib/supabase.js";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { badRequest } from "../../lib/http-error.js";

export const notificationsRouter = Router();
notificationsRouter.use(requireAuth);

notificationsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from("notifications")
      .select("*")
      .eq("user_id", req.user!.id)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw badRequest(error.message);
    res.json({ notifications: data ?? [] });
  }),
);

notificationsRouter.patch(
  "/:id/read",
  validate({ params: z.object({ id: z.string().uuid() }) }),
  asyncHandler(async (req, res) => {
    await supabaseAdmin
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", req.params.id)
      .eq("user_id", req.user!.id);
    res.json({ ok: true });
  }),
);

notificationsRouter.patch(
  "/read-all",
  asyncHandler(async (req, res) => {
    await supabaseAdmin
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", req.user!.id)
      .is("read_at", null);
    res.json({ ok: true });
  }),
);
