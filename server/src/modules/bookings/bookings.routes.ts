import { Router } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../../lib/supabase.js";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { badRequest, forbidden, notFound } from "../../lib/http-error.js";

export const bookingsRouter = Router();

bookingsRouter.use(requireAuth);

bookingsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const uid = req.user!.id;
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .or(`student_id.eq.${uid},teacher_id.eq.${uid}`)
      .order("start_at", { ascending: false });
    if (error) throw badRequest(error.message);
    res.json({ bookings: data ?? [] });
  }),
);

const CreateSchema = z.object({
  teacher_id: z.string().uuid(),
  subject: z.string().min(1),
  start_at: z.string().datetime(),
  duration_min: z.number().int().min(15).max(480),
  mode: z.enum(["online", "home_visit", "both"]).default("online"),
  notes: z.string().optional(),
  price_usd: z.number().nonnegative(),
});

bookingsRouter.post(
  "/",
  validate({ body: CreateSchema }),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .insert({ ...req.body, student_id: req.user!.id, status: "pending" })
      .select()
      .single();
    if (error) throw badRequest(error.message);

    // Notify teacher
    await supabaseAdmin.from("notifications").insert({
      user_id: req.body.teacher_id,
      type: "booking_confirm",
      title: "New booking request",
      body: `${req.body.subject} session requested`,
      data: { booking_id: data.id },
    });

    res.status(201).json({ booking: data });
  }),
);

const StatusSchema = z.object({ status: z.enum(["pending", "confirmed", "completed", "cancelled"]) });

bookingsRouter.patch(
  "/:id/status",
  validate({ body: StatusSchema, params: z.object({ id: z.string().uuid() }) }),
  asyncHandler(async (req, res) => {
    const { data: existing } = await supabaseAdmin.from("bookings").select("*").eq("id", req.params.id).maybeSingle();
    if (!existing) throw notFound();
    if (existing.teacher_id !== req.user!.id && existing.student_id !== req.user!.id) throw forbidden();

    const { data, error } = await supabaseAdmin
      .from("bookings")
      .update({ status: req.body.status, updated_at: new Date().toISOString() })
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) throw badRequest(error.message);
    res.json({ booking: data });
  }),
);
