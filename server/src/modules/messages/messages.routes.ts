import { Router } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../../lib/supabase.js";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { badRequest, forbidden } from "../../lib/http-error.js";

export const messagesRouter = Router();
messagesRouter.use(requireAuth);

messagesRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const uid = req.user!.id;
    const other = (req.query.with as string | undefined) ?? null;
    let q = supabaseAdmin.from("messages").select("*");
    if (other) {
      q = q.or(
        `and(sender_id.eq.${uid},recipient_id.eq.${other}),and(sender_id.eq.${other},recipient_id.eq.${uid})`,
      );
    } else {
      q = q.or(`sender_id.eq.${uid},recipient_id.eq.${uid}`);
    }
    const { data, error } = await q.order("created_at", { ascending: true }).limit(500);
    if (error) throw badRequest(error.message);
    res.json({ messages: data ?? [] });
  }),
);

messagesRouter.post(
  "/",
  validate({ body: z.object({ recipient_id: z.string().uuid(), body: z.string().min(1).max(4000) }) }),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from("messages")
      .insert({ sender_id: req.user!.id, recipient_id: req.body.recipient_id, body: req.body.body })
      .select()
      .single();
    if (error) throw badRequest(error.message);
    res.status(201).json({ message: data });
  }),
);

messagesRouter.patch(
  "/:id/read",
  validate({ params: z.object({ id: z.string().uuid() }) }),
  asyncHandler(async (req, res) => {
    const { data: msg } = await supabaseAdmin.from("messages").select("recipient_id").eq("id", req.params.id).maybeSingle();
    if (!msg || msg.recipient_id !== req.user!.id) throw forbidden();
    await supabaseAdmin.from("messages").update({ read_at: new Date().toISOString() }).eq("id", req.params.id);
    res.json({ ok: true });
  }),
);
