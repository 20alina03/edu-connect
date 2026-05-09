import { Router } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../../lib/supabase.js";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { badRequest, forbidden, notFound } from "../../lib/http-error.js";

export const reviewsRouter = Router();

reviewsRouter.get(
  "/teacher/:id",
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from("reviews")
      .select("*")
      .eq("teacher_id", req.params.id)
      .order("created_at", { ascending: false });
    if (error) throw badRequest(error.message);
    res.json({ reviews: data ?? [] });
  }),
);

const CreateSchema = z.object({
  booking_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

reviewsRouter.post(
  "/",
  requireAuth,
  validate({ body: CreateSchema }),
  asyncHandler(async (req, res) => {
    const { data: booking } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("id", req.body.booking_id)
      .maybeSingle();
    if (!booking) throw notFound("Booking not found");
    if (booking.student_id !== req.user!.id) throw forbidden("Only the student can review");
    if (booking.status !== "completed") throw badRequest("Booking must be completed");

    const { data, error } = await supabaseAdmin
      .from("reviews")
      .insert({
        booking_id: booking.id,
        student_id: req.user!.id,
        teacher_id: booking.teacher_id,
        rating: req.body.rating,
        comment: req.body.comment,
      })
      .select()
      .single();
    if (error) throw badRequest(error.message);
    res.status(201).json({ review: data });
  }),
);
