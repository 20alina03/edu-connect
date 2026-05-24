import { Router } from "express";
import { z } from "zod";
import { supabaseAdmin, supabaseAnon } from "../../lib/supabase.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { notFound, badRequest } from "../../lib/http-error.js";

export const teachersRouter = Router();

const isMissingColumnError = (error: { message?: string } | null | undefined, column: string) =>
  Boolean(error?.message?.toLowerCase().includes(`column \"${column}\" does not exist`) || error?.message?.toLowerCase().includes(column.toLowerCase()));

const ISLAMIC_SUBJECTS = new Set(["Quran", "Tajweed", "Hifz", "Noorani Qaida", "Arabic", "Islamic Studies"]);

const inferTeacherPortals = (subjects: string[] | null | undefined) => {
  const subjectList = subjects ?? [];
  const hasIslamic = subjectList.some((subject) => ISLAMIC_SUBJECTS.has(subject));
  const hasSchool = subjectList.some((subject) => !ISLAMIC_SUBJECTS.has(subject));
  const portals: Array<"islamic" | "school"> = [];
  if (hasIslamic) portals.push("islamic");
  if (hasSchool || portals.length === 0) portals.push("school");
  return portals;
};

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
    const { data: availabilityWithDates, error: availabilityError } = await supabaseAdmin
      .from("availability")
      .select("id, day_of_week, start_time, end_time, available_date")
      .eq("teacher_id", id)
      .order("available_date", { ascending: true, nullsFirst: false })
      .order("day_of_week", { ascending: true })
      .order("start_time", { ascending: true });
    const availability = availabilityError && isMissingColumnError(availabilityError, "available_date")
      ? await supabaseAdmin
          .from("availability")
          .select("id, day_of_week, start_time, end_time")
          .eq("teacher_id", id)
          .order("day_of_week", { ascending: true })
          .order("start_time", { ascending: true })
      : { data: availabilityWithDates, error: availabilityError };

    if (availability.error) throw badRequest(availability.error.message);

    const { data: bookings, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .select("start_at, duration_min, status")
      .eq("teacher_id", id)
      .neq("status", "cancelled")
      .order("start_at", { ascending: true });
    if (bookingError) throw badRequest(bookingError.message);

    const { data: lessonRows, error: lessonError } = await supabaseAdmin
      .from("teacher_lessons")
      .select("id, teacher_id, lesson_type, title, subject, drive_url, description, created_at")
      .eq("teacher_id", id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    if (lessonError) throw badRequest(lessonError.message);

    const lessonStudentRows = lessonRows?.length
      ? await supabaseAdmin.from("teacher_lesson_students").select("lesson_id, student_id").in("lesson_id", lessonRows.map((lesson) => lesson.id))
      : { data: [], error: null };
    if (lessonStudentRows.error) throw badRequest(lessonStudentRows.error.message);

    const header = req.headers.authorization;
    const viewer = header?.startsWith("Bearer ") ? await supabaseAnon.auth.getUser(header.slice(7)).then(({ data, error }) => (error || !data.user ? null : data.user)) : null;
    const hasNoteAccess = Boolean(viewer && (viewer.id === id || (await supabaseAdmin.from("bookings").select("id").eq("student_id", viewer.id).eq("teacher_id", id).neq("status", "cancelled").limit(1)).data?.length));

    const lessonStudents = lessonStudentRows.data ?? [];
    const templateLessons = (lessonRows ?? [])
      .filter((lesson) => lesson.lesson_type === "template")
      .map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        subject: lesson.subject ?? null,
        driveUrl: lesson.drive_url,
        description: lesson.description ?? "",
        assignedStudents: lessonStudents.filter((row) => row.lesson_id === lesson.id).map((row) => row.student_id),
        createdAt: lesson.created_at,
      }));

    const lessonNotes = hasNoteAccess
      ? (lessonRows ?? [])
          .filter((lesson) => lesson.lesson_type === "note")
          .map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
            subject: lesson.subject ?? null,
            driveUrl: lesson.drive_url,
            description: lesson.description ?? "",
            assignedStudents: lessonStudents.filter((row) => row.lesson_id === lesson.id).map((row) => row.student_id),
            createdAt: lesson.created_at,
          }))
      : [];

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, avatar_url, phone")
      .eq("id", id)
      .maybeSingle();
    res.json({
      teacher: {
        ...data,
        profile: profile ?? null,
        availability: (availability.data ?? []).map((slot) => ({ ...slot, available_date: (slot as Record<string, unknown>).available_date ?? null })),
        booked_slots: bookings ?? [],
        lesson_notes: lessonNotes,
        template_lessons: templateLessons,
        note_access: hasNoteAccess,
        portals: inferTeacherPortals(data.subjects),
      },
    });
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