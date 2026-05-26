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

    const { data: existing, error: existErr } = await supabaseAdmin
      .from("reviews")
      .select("id")
      .eq("booking_id", booking.id)
      .eq("student_id", req.user!.id)
      .limit(1);
    if (existErr) throw badRequest(existErr.message);
    if (existing && existing.length > 0) throw badRequest("Booking already reviewed");

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
    // Recalculate teacher aggregate rating and total reviews
    const { data: teacherReviews } = await supabaseAdmin
      .from("reviews")
      .select("rating")
      .eq("teacher_id", booking.teacher_id);
    const ratings = (teacherReviews ?? []).map((r: any) => Number(r.rating));
    const total = ratings.length;
    const avg = total > 0 ? Math.round((ratings.reduce((s: number, v: number) => s + v, 0) / total) * 10) / 10 : null;
    const { error: updateError } = await supabaseAdmin
      .from("teacher_profiles")
      .update({ total_reviews: total, rating: avg })
      .eq("user_id", booking.teacher_id);
    if (updateError) console.warn("Failed to update teacher aggregates:", updateError.message);

    res.status(201).json({ review: data });
  }),
);
