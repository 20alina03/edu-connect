import { Router } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../../lib/supabase.js";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { badRequest, forbidden, notFound } from "../../lib/http-error.js";
import { scheduleReminderEmails } from "../../lib/reminder.js";
import { buildGoogleCalendarLink } from "../../lib/google-calendar.js";

export const bookingsRouter = Router();

const ALLOWED_SESSION_DURATIONS = [30, 60, 90, 120] as const;
const BOOKING_CUTOFF_MINUTES = 60;

const timeToMinutes = (value: string) => {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
};

const overlaps = (startA: Date, endA: Date, startB: Date, endB: Date) =>
  startA.getTime() < endB.getTime() && startB.getTime() < endA.getTime();

const localDateKey = (value: Date) => {
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, "0");
  const d = String(value.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const isMissingColumnError = (error: { message?: string } | null | undefined, column: string) =>
  Boolean(
    error?.message?.toLowerCase().includes(`column \"${column}\" does not exist`) ||
    error?.message?.toLowerCase().includes(column.toLowerCase()),
  );

const isAllowedDuration = (v: number): v is (typeof ALLOWED_SESSION_DURATIONS)[number] =>
  ALLOWED_SESSION_DURATIONS.includes(v as (typeof ALLOWED_SESSION_DURATIONS)[number]);

const priceForDuration = (baseRate: number, durationMin: (typeof ALLOWED_SESSION_DURATIONS)[number]) =>
  Number(((baseRate * durationMin) / 60).toFixed(2));

const isVisibleStart = (startAt: Date) =>
  startAt.getTime() > Date.now() + BOOKING_CUTOFF_MINUTES * 60_000;

/** Fetch names + emails for teacher and student */
const fetchParties = async (teacherUserId: string, studentUserId: string) => {
  const [teacherProfile, studentProfile, teacherAuth, studentAuth] = await Promise.all([
    supabaseAdmin.from("profiles").select("id, full_name").eq("id", teacherUserId).maybeSingle(),
    supabaseAdmin.from("profiles").select("id, full_name").eq("id", studentUserId).maybeSingle(),
    supabaseAdmin.auth.admin.getUserById(teacherUserId),
    supabaseAdmin.auth.admin.getUserById(studentUserId),
  ]);
  return {
    teacherName:  teacherProfile.data?.full_name ?? "Teacher",
    studentName:  studentProfile.data?.full_name ?? "Student",
    teacherEmail: teacherAuth.data?.user?.email  ?? null,
    studentEmail: studentAuth.data?.user?.email  ?? null,
  };
};

/** Build calendar links for both parties */
const buildCalendarLinks = ({
  subject, startAt, durationMin, teacherName, studentName, mode, notes,
}: {
  subject: string; startAt: Date; durationMin: number;
  teacherName: string; studentName: string; mode: string; notes?: string | null;
}) => ({
  teacherCalendarLink: buildGoogleCalendarLink({
    subject, startAt, durationMin, attendeeName: studentName, notes, mode,
  }),
  studentCalendarLink: buildGoogleCalendarLink({
    subject, startAt, durationMin, attendeeName: teacherName, notes, mode,
  }),
});

bookingsRouter.use(requireAuth);

// ── GET /bookings ──────────────────────────────────────────────────────────────
bookingsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .or(`student_id.eq.${req.user!.id},teacher_id.eq.${req.user!.id}`)
      .order("start_at", { ascending: false });
    if (error) throw badRequest(error.message);
    res.json({ bookings: data ?? [] });
  }),
);

const CreateSchema = z.object({
  teacher_id:   z.string().uuid(),
  subject:      z.string().min(1),
  start_at:     z.string().datetime(),
  duration_min: z.number().int().refine(isAllowedDuration, { message: "Duration must be 30, 60, 90, or 120 minutes" }),
  mode:         z.enum(["online", "home_visit", "both"]).default("online"),
  notes:        z.string().optional(),
  price_usd:    z.number().nonnegative().optional(),
});

// ── POST /bookings ─────────────────────────────────────────────────────────────
bookingsRouter.post(
  "/",
  validate({ body: CreateSchema }),
  asyncHandler(async (req, res) => {
    const startAt = new Date(req.body.start_at);
    const endAt   = new Date(startAt.getTime() + req.body.duration_min * 60_000);

    if (!isVisibleStart(startAt))
      throw badRequest("This time slot is no longer available. Please choose a later slot.");

    // Fetch teacher
    const { data: teacher, error: teacherError } = await supabaseAdmin
      .from("teacher_profiles").select("user_id, is_active, hourly_rate_usd")
      .eq("user_id", req.body.teacher_id).maybeSingle();
    if (teacherError) throw badRequest(teacherError.message);
    if (!teacher || !teacher.is_active) throw notFound("Teacher not found");

    // Fetch availability
    const { data: avWithDates, error: avError } = await supabaseAdmin
      .from("availability").select("day_of_week, start_time, end_time, available_date")
      .eq("teacher_id", req.body.teacher_id);
    const av = avError && isMissingColumnError(avError, "available_date")
      ? await supabaseAdmin.from("availability").select("day_of_week, start_time, end_time").eq("teacher_id", req.body.teacher_id)
      : { data: avWithDates, error: avError };
    if (av.error) throw badRequest(av.error.message);

    // Validate slot
    if ((av.data ?? []).length > 0) {
      const dk = localDateKey(startAt);
      const dateSlots = (av.data ?? []).filter((s) => (s as any).available_date === dk);
      const daySlots  = dateSlots.length > 0 ? dateSlots
        : (av.data ?? []).filter((s) => !(s as any).available_date && s.day_of_week === startAt.getDay());
      const sm = startAt.getHours() * 60 + startAt.getMinutes();
      const em = endAt.getHours()   * 60 + endAt.getMinutes();
      const ok = daySlots.some((s) => sm >= timeToMinutes(s.start_time) && em <= timeToMinutes(s.end_time));
      if (!ok) throw badRequest("Teacher is unavailable at the selected time");
    }

    // Check conflicts
    const { data: existing, error: cErr } = await supabaseAdmin
      .from("bookings").select("id, start_at, duration_min, status")
      .eq("teacher_id", req.body.teacher_id).neq("status", "cancelled");
    if (cErr) throw badRequest(cErr.message);
    if ((existing ?? []).some((b) => {
      const bs = new Date(b.start_at);
      return overlaps(startAt, endAt, bs, new Date(bs.getTime() + b.duration_min * 60_000));
    })) throw badRequest("Selected slot is already booked");

    const price = priceForDuration(Number(teacher.hourly_rate_usd ?? 0), req.body.duration_min);

    // Insert booking
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .insert({ ...req.body, student_id: req.user!.id, status: "pending", price_usd: price })
      .select().single();
    if (error) throw badRequest(error.message);

    // Fetch names/emails
    const parties = await fetchParties(teacher.user_id, req.user!.id);

    // Build calendar links
    const { teacherCalendarLink, studentCalendarLink } = buildCalendarLinks({
      subject: req.body.subject, startAt, durationMin: req.body.duration_min,
      teacherName: parties.teacherName, studentName: parties.studentName,
      mode: req.body.mode, notes: req.body.notes,
    });

    // Notify teacher (with their calendar link)
    await supabaseAdmin.from("notifications").insert({
      user_id: teacher.user_id,
      type: "booking_request",
      title: "New booking request",
      body: `${req.body.subject} session requested for ${startAt.toLocaleString()}`,
      data: { booking_id: data.id, notes: req.body.notes ?? null, calendar_link: teacherCalendarLink },
    });

    // Schedule reminder emails (fire & forget)
    void scheduleReminderEmails({
      bookingId: data.id, startAt, durationMin: req.body.duration_min,
      subject: req.body.subject,
      teacherEmail: parties.teacherEmail, teacherName: parties.teacherName, teacherCalendarLink,
      studentEmail: parties.studentEmail, studentName: parties.studentName, studentCalendarLink,
    });

    res.status(201).json({ booking: data, studentCalendarLink });
  }),
);

const StatusSchema = z.object({ status: z.enum(["pending", "confirmed", "completed", "cancelled"]) });

// ── PATCH /bookings/:id/status ─────────────────────────────────────────────────
bookingsRouter.patch(
  "/:id/status",
  validate({ body: StatusSchema, params: z.object({ id: z.string().uuid() }) }),
  asyncHandler(async (req, res) => {
    const { data: existing } = await supabaseAdmin
      .from("bookings").select("*").eq("id", req.params.id).maybeSingle();
    if (!existing) throw notFound();
    if (existing.teacher_id !== req.user!.id && existing.student_id !== req.user!.id) throw forbidden();

    const { data, error } = await supabaseAdmin
      .from("bookings")
      .update({ status: req.body.status, updated_at: new Date().toISOString() })
      .eq("id", req.params.id).select().single();
    if (error) throw badRequest(error.message);

    // ── When teacher CONFIRMS: send confirmation emails with calendar links to BOTH parties ──
    if (req.body.status === "confirmed") {
      const startAt = new Date(existing.start_at);
      const parties = await fetchParties(existing.teacher_id, existing.student_id);

      const { teacherCalendarLink, studentCalendarLink } = buildCalendarLinks({
        subject: existing.subject, startAt, durationMin: existing.duration_min,
        teacherName: parties.teacherName, studentName: parties.studentName,
        mode: existing.mode, notes: existing.notes,
      });

      // Send confirmation email to student with their calendar link
      void sendConfirmationEmails({
        startAt,
        durationMin: existing.duration_min,
        subject: existing.subject,
        teacherEmail: parties.teacherEmail, teacherName: parties.teacherName, teacherCalendarLink,
        studentEmail: parties.studentEmail, studentName: parties.studentName, studentCalendarLink,
      });

      // In-app notification to student with their calendar link
      await supabaseAdmin.from("notifications").insert({
        user_id: existing.student_id,
        type: "booking_confirmed",
        title: "Booking confirmed!",
        body: `Your ${existing.subject} session on ${startAt.toLocaleString()} has been confirmed.`,
        data: {
          booking_id: existing.id,
          calendar_link: studentCalendarLink,
          teacher_calendar_link: teacherCalendarLink,
        },
      });

      // In-app notification to teacher with their calendar link
      await supabaseAdmin.from("notifications").insert({
        user_id: existing.teacher_id,
        type: "booking_confirmed_teacher",
        title: "Session confirmed",
        body: `You confirmed the ${existing.subject} session on ${startAt.toLocaleString()}.`,
        data: {
          booking_id: existing.id,
          calendar_link: teacherCalendarLink,
          student_calendar_link: studentCalendarLink,
        },
      });

      // Schedule reminder emails 30 min before (fire & forget)
      void scheduleReminderEmails({
        bookingId: existing.id, startAt, durationMin: existing.duration_min,
        subject: existing.subject,
        teacherEmail: parties.teacherEmail, teacherName: parties.teacherName, teacherCalendarLink,
        studentEmail: parties.studentEmail, studentName: parties.studentName, studentCalendarLink,
      });

      res.json({ booking: data, teacherCalendarLink, studentCalendarLink });
      return;
    }

    res.json({ booking: data });
  }),
);

/** Send confirmation emails to both teacher and student */
async function sendConfirmationEmails({
  startAt, durationMin, subject,
  teacherEmail, teacherName, teacherCalendarLink,
  studentEmail, studentName, studentCalendarLink,
}: {
  startAt: Date; durationMin: number; subject: string;
  teacherEmail: string | null; teacherName: string; teacherCalendarLink: string;
  studentEmail: string | null; studentName: string; studentCalendarLink: string;
}) {
  const apiKey    = process.env.BREVO_API_KEY;
  const fromEmail = process.env.EMAIL_FROM      ?? "noreply@ilmrise.com";
  const fromName  = process.env.EMAIL_FROM_NAME ?? "IlmRise";
  if (!apiKey) { console.warn("[bookings] BREVO_API_KEY not set — skipping confirmation emails"); return; }

  const timeStr = startAt.toLocaleString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  const buildHtml = (recipientName: string, otherParty: string, otherRole: string, calLink: string) => `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1a1a2e;">
      <div style="background:linear-gradient(135deg,#2d6a4f,#1b4332);border-radius:12px;padding:24px;color:white;margin-bottom:24px;">
        <h1 style="margin:0 0 4px;font-size:22px;">✅ Session Confirmed</h1>
        <p style="margin:0;opacity:0.85;font-size:14px;">IlmRise</p>
      </div>
      <p style="font-size:16px;">Hi <strong>${recipientName}</strong>,</p>
      <p>Your <strong>${subject}</strong> session has been confirmed. Here are the details:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
        <tr style="border-bottom:1px solid #eee;"><td style="padding:8px 4px;color:#666;">Subject</td><td style="padding:8px 4px;font-weight:600;">${subject}</td></tr>
        <tr style="border-bottom:1px solid #eee;"><td style="padding:8px 4px;color:#666;">When</td><td style="padding:8px 4px;font-weight:600;">${timeStr}</td></tr>
        <tr style="border-bottom:1px solid #eee;"><td style="padding:8px 4px;color:#666;">Duration</td><td style="padding:8px 4px;font-weight:600;">${durationMin} minutes</td></tr>
        <tr><td style="padding:8px 4px;color:#666;">${otherRole}</td><td style="padding:8px 4px;font-weight:600;">${otherParty}</td></tr>
      </table>
      <div style="margin:20px 0;">
        <a href="${calLink}" target="_blank"
          style="display:inline-flex;align-items:center;gap:8px;background:#4285F4;color:white;text-decoration:none;padding:12px 20px;border-radius:8px;font-size:14px;font-weight:600;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/></svg>
          Add to Google Calendar
        </a>
      </div>
      <p style="font-size:13px;color:#666;">You will also receive a reminder email 30 minutes before the session.</p>
      <div style="margin-top:24px;padding-top:16px;border-top:1px solid #eee;font-size:12px;color:#999;">Automated email from IlmRise. Do not reply.</div>
    </div>`;

  const send = async (to: string, toName: string, html: string) => {
    try {
      await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "Content-Type": "application/json", "api-key": apiKey },
        body: JSON.stringify({ sender: { name: fromName, email: fromEmail }, to: [{ name: toName, email: to }], subject: `✅ Session confirmed: ${subject}`, htmlContent: html }),
      });
    } catch (e) { console.error("[bookings] confirmation email error:", e); }
  };

  const tasks: Promise<void>[] = [];
  if (studentEmail) tasks.push(send(studentEmail, studentName, buildHtml(studentName, teacherName, "Your teacher", studentCalendarLink)));
  if (teacherEmail) tasks.push(send(teacherEmail, teacherName, buildHtml(teacherName, studentName, "Your student", teacherCalendarLink)));
  await Promise.allSettled(tasks);
}