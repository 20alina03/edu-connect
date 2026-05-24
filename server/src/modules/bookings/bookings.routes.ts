import { Router } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../../lib/supabase.js";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { badRequest, forbidden, notFound } from "../../lib/http-error.js";

export const bookingsRouter = Router();

const timeToMinutes = (value: string) => {
  const [hours, minutes] = value.split(":").map(Number);
  return (hours * 60) + minutes;
};

const overlaps = (
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date,
) => startA.getTime() < endB.getTime() && startB.getTime() < endA.getTime();

const localDateKey = (value: Date) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isMissingColumnError = (error: { message?: string } | null | undefined, column: string) =>
  Boolean(error?.message?.toLowerCase().includes(`column \"${column}\" does not exist`) || error?.message?.toLowerCase().includes(column.toLowerCase()));

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
    const startAt = new Date(req.body.start_at);
    const endAt = new Date(startAt.getTime() + (req.body.duration_min * 60_000));

    const { data: teacher, error: teacherError } = await supabaseAdmin
      .from("teacher_profiles")
      .select("user_id, is_active")
      .eq("user_id", req.body.teacher_id)
      .maybeSingle();
    if (teacherError) throw badRequest(teacherError.message);
    if (!teacher || teacher.is_active === false) throw notFound("Teacher not found");

    const { data: availabilityWithDates, error: availabilityError } = await supabaseAdmin
      .from("availability")
      .select("day_of_week, start_time, end_time, available_date")
      .eq("teacher_id", req.body.teacher_id);
    const availability = availabilityError && isMissingColumnError(availabilityError, "available_date")
      ? await supabaseAdmin
          .from("availability")
          .select("day_of_week, start_time, end_time")
          .eq("teacher_id", req.body.teacher_id)
      : { data: availabilityWithDates, error: availabilityError };

    if (availability.error) throw badRequest(availability.error.message);

    if ((availability.data ?? []).length > 0) {
      const bookingDateKey = localDateKey(startAt);
      const dateSlots = (availability.data ?? []).filter((slot) => (slot as { available_date?: string | null }).available_date === bookingDateKey);
      const daySlots = dateSlots.length > 0 ? dateSlots : (availability.data ?? []).filter((slot) => !(slot as { available_date?: string | null }).available_date && slot.day_of_week === startAt.getDay());
      const startMinutes = startAt.getHours() * 60 + startAt.getMinutes();
      const endMinutes = endAt.getHours() * 60 + endAt.getMinutes();
      const hasMatchingSlot = daySlots.some((slot) => {
        const slotStart = timeToMinutes(slot.start_time);
        const slotEnd = timeToMinutes(slot.end_time);
        return startMinutes >= slotStart && endMinutes <= slotEnd;
      });

      if (!hasMatchingSlot) {
        throw badRequest("Teacher is unavailable at the selected time");
      }
    }

    const { data: existingBookings, error: conflictError } = await supabaseAdmin
      .from("bookings")
      .select("id, start_at, duration_min, status")
      .eq("teacher_id", req.body.teacher_id)
      .neq("status", "cancelled");
    if (conflictError) throw badRequest(conflictError.message);

    const hasConflict = (existingBookings ?? []).some((booking) => {
      const bookingStart = new Date(booking.start_at);
      const bookingEnd = new Date(bookingStart.getTime() + (booking.duration_min * 60_000));
      return overlaps(startAt, endAt, bookingStart, bookingEnd);
    });
    if (hasConflict) {
      throw badRequest("Selected slot is already booked");
    }

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
      body: `${req.body.subject} session requested for ${startAt.toLocaleString()}`,
      data: { booking_id: data.id, notes: req.body.notes ?? null },
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
