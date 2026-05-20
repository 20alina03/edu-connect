import { randomUUID } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { badRequest, notFound } from "../../lib/http-error.js";
import { supabaseAdmin } from "../../lib/supabase.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";

export const teacherDashboardRouter = Router();

const TeachingModeSchema = z.enum(["online", "home_visit", "both"]);
const GenderSchema = z.enum(["male", "female"]);

const AvailabilityItemSchema = z.object({
  id: z.string().uuid().optional(),
  day_of_week: z.coerce.number().int().min(0).max(6),
  start_time: z.string().min(1),
  end_time: z.string().min(1),
});

const LessonItemSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1),
  subject: z.string().optional(),
  driveUrl: z.string().url(),
  description: z.string().default(""),
  assignedStudents: z.array(z.string().uuid()).default([]),
  createdAt: z.string().optional(),
});

const SolutionSchema = z.object({
  id: z.string().uuid().optional(),
  studentId: z.string().uuid(),
  fileUrl: z.string().url(),
  fileName: z.string().min(1),
  submittedAt: z.string().optional(),
  marks: z.number().nullable().optional(),
  maxMarks: z.number().min(0).default(100),
  feedback: z.string().nullable().optional(),
  gradedAt: z.string().nullable().optional(),
});

const AssessmentItemSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1),
  description: z.string().default(""),
  fileUrl: z.string().url().nullable().optional(),
  fileName: z.string().nullable().optional(),
  fileType: z.enum(["pdf", "image"]).nullable().optional(),
  createdAt: z.string().optional(),
  assignedStudents: z.array(z.string().uuid()).default([]),
  solutions: z.array(SolutionSchema).default([]),
});

const TeacherProfilePatchSchema = z.object({
  full_name: z.string().min(1).optional(),
  phone: z.string().optional(),
  avatar_url: z.string().url().optional(),
  hourly_rate_usd: z.number().nonnegative().optional(),
  subjects: z.array(z.string()).optional(),
  education: z.array(z.string()).optional(),
  mode: TeachingModeSchema.optional(),
  bio: z.string().optional(),
  quran_level: z.string().optional(),
  gender: GenderSchema.optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  experience_years: z.number().int().min(0).optional(),
});

const PortfolioSchema = z.object({
  lesson_notes: z.array(LessonItemSchema).default([]),
  template_lessons: z.array(LessonItemSchema).default([]),
  assessments: z.array(AssessmentItemSchema).default([]),
});

const toISO = (value?: string) => value ?? new Date().toISOString();

const normalizeLesson = (item: z.infer<typeof LessonItemSchema>) => ({
  id: item.id ?? randomUUID(),
  title: item.title,
  subject: item.subject ?? null,
  driveUrl: item.driveUrl,
  description: item.description ?? "",
  assignedStudents: item.assignedStudents ?? [],
  createdAt: toISO(item.createdAt),
});

const normalizeAssessment = (item: z.infer<typeof AssessmentItemSchema>) => ({
  id: item.id ?? randomUUID(),
  title: item.title,
  description: item.description ?? "",
  fileUrl: item.fileUrl ?? null,
  fileName: item.fileName ?? null,
  fileType: item.fileType ?? null,
  createdAt: toISO(item.createdAt),
  assignedStudents: item.assignedStudents ?? [],
  solutions: (item.solutions ?? []).map((solution) => ({
    id: solution.id ?? randomUUID(),
    studentId: solution.studentId,
    fileUrl: solution.fileUrl,
    fileName: solution.fileName,
    submittedAt: toISO(solution.submittedAt),
    marks: solution.marks ?? null,
    maxMarks: solution.maxMarks ?? 100,
    feedback: solution.feedback ?? null,
    gradedAt: solution.gradedAt ?? null,
  })),
});

const getTeacher = async (userId: string) => {
  const [profileResult, teacherResult, availabilityResult, lessonResult, lessonStudentResult, assessmentResult, assessmentStudentResult, solutionResult] = await Promise.all([
    // Use limit(1) and handle the array result to avoid errors when duplicate
    // rows exist temporarily (race conditions) which would make `.maybeSingle()`
    // fail with "Cannot coerce the result to a single JSON object".
    supabaseAdmin.from("profiles").select("id, full_name, phone, avatar_url").eq("id", userId).limit(1),
    supabaseAdmin.from("teacher_profiles").select("*").eq("user_id", userId).limit(1),
    supabaseAdmin.from("availability").select("*").eq("teacher_id", userId).order("day_of_week", { ascending: true }).order("start_time", { ascending: true }),
    supabaseAdmin.from("teacher_lessons").select("*").eq("teacher_id", userId).is("deleted_at", null).order("created_at", { ascending: false }),
    supabaseAdmin.from("teacher_lesson_students").select("lesson_id, student_id"),
    supabaseAdmin.from("teacher_assessments").select("*").eq("teacher_id", userId).is("deleted_at", null).order("created_at", { ascending: false }),
    supabaseAdmin.from("teacher_assessment_students").select("assessment_id, student_id"),
    supabaseAdmin.from("teacher_assessment_solutions").select("*").order("submitted_at", { ascending: false }),
  ]);

  if (profileResult.error) throw badRequest(profileResult.error.message);
  if (teacherResult.error) throw badRequest(teacherResult.error.message);
  if (availabilityResult.error) throw badRequest(availabilityResult.error.message);
  if (lessonResult.error) throw badRequest(lessonResult.error.message);
  if (lessonStudentResult.error) throw badRequest(lessonStudentResult.error.message);
  if (assessmentResult.error) throw badRequest(assessmentResult.error.message);
  if (assessmentStudentResult.error) throw badRequest(assessmentStudentResult.error.message);
  if (solutionResult.error) throw badRequest(solutionResult.error.message);

  const lessonStudents = lessonStudentResult.data ?? [];
  const lessons = (lessonResult.data ?? []).map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    subject: lesson.subject ?? null,
    driveUrl: lesson.drive_url,
    description: lesson.description ?? "",
    assignedStudents: lessonStudents.filter((row) => row.lesson_id === lesson.id).map((row) => row.student_id),
    createdAt: lesson.created_at,
  }));

  const assessmentStudents = assessmentStudentResult.data ?? [];
  const solutions = solutionResult.data ?? [];
  const assessments = (assessmentResult.data ?? []).map((assessment) => ({
    id: assessment.id,
    title: assessment.title,
    description: assessment.description ?? "",
    fileUrl: assessment.file_url,
    fileName: assessment.file_name,
    fileType: assessment.file_type,
    createdAt: assessment.created_at,
    assignedStudents: assessmentStudents.filter((row) => row.assessment_id === assessment.id).map((row) => row.student_id),
    solutions: solutions.filter((solution) => solution.assessment_id === assessment.id).map((solution) => ({
      id: solution.id,
      assessmentId: solution.assessment_id,
      studentId: solution.student_id,
      fileUrl: solution.file_url,
      fileName: solution.file_name,
      submittedAt: solution.submitted_at,
      marks: solution.marks,
      maxMarks: solution.max_marks,
      feedback: solution.feedback,
      gradedAt: solution.graded_at,
    })),
  }));

  // Extract single rows from the limited selects (take first row if present)
  const profileRow = (profileResult.data ?? [])[0] ?? null;
  const teacherRow = (teacherResult.data ?? [])[0] ?? null;

  return {
    profile: profileRow,
    teacher: teacherRow,
    availability: availabilityResult.data ?? [],
    lesson_notes: lessons.filter((lesson) => !lesson.subject),
    template_lessons: lessons.filter((lesson) => Boolean(lesson.subject)),
    assessments,
  };
};

const replaceLessons = async (userId: string, lessonNotes: z.infer<typeof LessonItemSchema>[], templateLessons: z.infer<typeof LessonItemSchema>[]) => {
  const normalizedNotes = lessonNotes.map((item) => ({ ...normalizeLesson(item), lesson_type: "note" as const }));
  const normalizedTemplates = templateLessons.map((item) => ({ ...normalizeLesson(item), lesson_type: "template" as const }));
  const allLessons = [...normalizedNotes, ...normalizedTemplates];

  const { error: deleteStudentsError } = await supabaseAdmin.from("teacher_lesson_students").delete().in(
    "lesson_id",
    (await supabaseAdmin.from("teacher_lessons").select("id").eq("teacher_id", userId)).data?.map((row) => row.id) ?? [],
  );
  if (deleteStudentsError) throw badRequest(deleteStudentsError.message);

  const { error: deleteError } = await supabaseAdmin.from("teacher_lessons").delete().eq("teacher_id", userId);
  if (deleteError) throw badRequest(deleteError.message);

  if (allLessons.length === 0) return;

  const { error: insertError } = await supabaseAdmin.from("teacher_lessons").insert(
    allLessons.map((lesson) => ({
      id: lesson.id,
      teacher_id: userId,
      lesson_type: lesson.lesson_type,
      title: lesson.title,
      subject: lesson.subject,
      drive_url: lesson.driveUrl,
      description: lesson.description,
      created_at: lesson.createdAt,
      updated_at: new Date().toISOString(),
    })),
  );
  if (insertError) throw badRequest(insertError.message);

  const assignments = [
    ...normalizedNotes.flatMap((item, index) => (lessonNotes[index].assignedStudents ?? []).map((studentId) => ({ lesson_id: item.id, student_id: studentId }))),
    ...normalizedTemplates.flatMap((item, index) => (templateLessons[index].assignedStudents ?? []).map((studentId) => ({ lesson_id: item.id, student_id: studentId }))),
  ];
  if (assignments.length > 0) {
    const { error: assignmentError } = await supabaseAdmin.from("teacher_lesson_students").insert(assignments);
    if (assignmentError) throw badRequest(assignmentError.message);
  }
};

const replaceAssessments = async (userId: string, assessmentsInput: z.infer<typeof AssessmentItemSchema>[]) => {
  const assessmentIds = (await supabaseAdmin.from("teacher_assessments").select("id").eq("teacher_id", userId)).data?.map((row) => row.id) ?? [];
  if (assessmentIds.length > 0) {
    const { error: solutionDeleteError } = await supabaseAdmin.from("teacher_assessment_solutions").delete().in("assessment_id", assessmentIds);
    if (solutionDeleteError) throw badRequest(solutionDeleteError.message);
    const { error: assignmentDeleteError } = await supabaseAdmin.from("teacher_assessment_students").delete().in("assessment_id", assessmentIds);
    if (assignmentDeleteError) throw badRequest(assignmentDeleteError.message);
  }

  const { error: deleteError } = await supabaseAdmin.from("teacher_assessments").delete().eq("teacher_id", userId);
  if (deleteError) throw badRequest(deleteError.message);

  if (assessmentsInput.length === 0) return;

  const assessments = assessmentsInput.map((item) => normalizeAssessment(item));
  const { error: insertError } = await supabaseAdmin.from("teacher_assessments").insert(
    assessments.map((assessment) => ({
      id: assessment.id,
      teacher_id: userId,
      title: assessment.title,
      description: assessment.description,
      file_url: assessment.fileUrl,
      file_name: assessment.fileName,
      file_type: assessment.fileType,
      created_at: assessment.createdAt,
      updated_at: new Date().toISOString(),
    })),
  );
  if (insertError) throw badRequest(insertError.message);

  const assignments = assessments.flatMap((assessment) => assessment.assignedStudents.map((studentId) => ({ assessment_id: assessment.id, student_id: studentId })));
  if (assignments.length > 0) {
    const { error: assignmentError } = await supabaseAdmin.from("teacher_assessment_students").insert(assignments);
    if (assignmentError) throw badRequest(assignmentError.message);
  }

  const solutions = assessments.flatMap((assessment) =>
    assessment.solutions.map((solution) => ({
      id: solution.id,
      assessment_id: assessment.id,
      student_id: solution.studentId,
      file_url: solution.fileUrl,
      file_name: solution.fileName,
      submitted_at: solution.submittedAt,
      marks: solution.marks,
      max_marks: solution.maxMarks,
      feedback: solution.feedback,
      graded_at: solution.gradedAt,
      created_at: solution.submittedAt,
      updated_at: solution.submittedAt,
    })),
  );
  if (solutions.length > 0) {
    const { error: solutionInsertError } = await supabaseAdmin.from("teacher_assessment_solutions").insert(solutions);
    if (solutionInsertError) throw badRequest(solutionInsertError.message);
  }
};

teacherDashboardRouter.use(requireAuth, requireRole("teacher"));

teacherDashboardRouter.get(
  "/me",
  asyncHandler(async (req, res) => {
    let data = await getTeacher(req.user!.id);

    // Auto-create the teacher_profiles row if it was somehow missed at signup.
    // This makes the dashboard resilient to existing users who signed up before
    // the trigger was hardened, or whose metadata didn't include role='teacher'.
    if (!data.teacher) {
      const { error: upsertError } = await supabaseAdmin
        .from("teacher_profiles")
        .upsert({ user_id: req.user!.id, is_active: true }, { onConflict: "user_id" });
      if (upsertError) throw badRequest(upsertError.message);
      // Re-fetch after creating the row
      data = await getTeacher(req.user!.id);
    }

    if (!data.teacher) throw notFound("Teacher profile could not be created");

    res.json({
      teacher: {
        ...data.teacher,
        profile: data.profile,
        availability: data.availability,
        lesson_notes: data.lesson_notes,
        template_lessons: data.template_lessons,
        assessments: data.assessments,
      },
    });
  }),
);

teacherDashboardRouter.patch(
  "/me/profile",
  validate({ body: TeacherProfilePatchSchema }),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof TeacherProfilePatchSchema>;

    // Only send fields that were actually provided – sending `undefined`
    // causes Supabase to return 422 Unprocessable Content.
    const profilePatch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.full_name  !== undefined) profilePatch.full_name  = body.full_name;
    if (body.phone      !== undefined) profilePatch.phone      = body.phone;
    if (body.avatar_url !== undefined) profilePatch.avatar_url = body.avatar_url;

    const { data: profileData, error: profileError } = await supabaseAdmin
      .from("profiles")
      .update(profilePatch)
      .eq("id", req.user!.id)
      .select("id, full_name, phone, avatar_url")
      .single();
    if (profileError) throw badRequest(profileError.message);

    // Build teacher_profiles patch with only provided fields
    const teacherPatch: Record<string, unknown> = {
      user_id: req.user!.id,
      is_active: true,
      deleted_at: null,
      updated_at: new Date().toISOString(),
    };
    if (body.subjects         !== undefined) teacherPatch.subjects         = body.subjects;
    if (body.hourly_rate_usd  !== undefined) teacherPatch.hourly_rate_usd  = body.hourly_rate_usd;
    if (body.mode             !== undefined) teacherPatch.mode             = body.mode;
    if (body.bio              !== undefined) teacherPatch.bio              = body.bio;
    if (body.quran_level      !== undefined) teacherPatch.quran_level      = body.quran_level;
    if (body.gender           !== undefined) teacherPatch.gender           = body.gender;
    if (body.country          !== undefined) teacherPatch.country          = body.country;
    if (body.city             !== undefined) teacherPatch.city             = body.city;
    if (body.experience_years !== undefined) teacherPatch.experience_years = body.experience_years;
    if (body.education        !== undefined) teacherPatch.education        = body.education;

    const { data, error } = await supabaseAdmin
      .from("teacher_profiles")
      .upsert(teacherPatch, { onConflict: "user_id" })
      .select("*")
      .single();
    if (error) throw badRequest(error.message);

    res.json({ teacher: { ...data, profile: profileData } });
  }),
);

teacherDashboardRouter.delete(
  "/me/profile",
  asyncHandler(async (req, res) => {
    const now = new Date().toISOString();
    const { error: availabilityError } = await supabaseAdmin.from("availability").delete().eq("teacher_id", req.user!.id);
    if (availabilityError) throw badRequest(availabilityError.message);

    const lessonIds = (await supabaseAdmin.from("teacher_lessons").select("id").eq("teacher_id", req.user!.id)).data?.map((row) => row.id) ?? [];
    if (lessonIds.length > 0) {
      const { error: lessonStudentError } = await supabaseAdmin.from("teacher_lesson_students").delete().in("lesson_id", lessonIds);
      if (lessonStudentError) throw badRequest(lessonStudentError.message);
      const { error: lessonError } = await supabaseAdmin.from("teacher_lessons").delete().eq("teacher_id", req.user!.id);
      if (lessonError) throw badRequest(lessonError.message);
    }

    const assessmentIds = (await supabaseAdmin.from("teacher_assessments").select("id").eq("teacher_id", req.user!.id)).data?.map((row) => row.id) ?? [];
    if (assessmentIds.length > 0) {
      const { error: solutionError } = await supabaseAdmin.from("teacher_assessment_solutions").delete().in("assessment_id", assessmentIds);
      if (solutionError) throw badRequest(solutionError.message);
      const { error: assessmentStudentError } = await supabaseAdmin.from("teacher_assessment_students").delete().in("assessment_id", assessmentIds);
      if (assessmentStudentError) throw badRequest(assessmentStudentError.message);
      const { error: assessmentError } = await supabaseAdmin.from("teacher_assessments").delete().eq("teacher_id", req.user!.id);
      if (assessmentError) throw badRequest(assessmentError.message);
    }

    const { data, error } = await supabaseAdmin
      .from("teacher_profiles")
      .update({ is_active: false, deleted_at: now, updated_at: now })
      .eq("user_id", req.user!.id)
      .select("*")
      .single();
    if (error) throw badRequest(error.message);

    res.json({ teacher: data });
  }),
);

teacherDashboardRouter.get(
  "/me/availability",
  asyncHandler(async (req, res) => {
    const { availability } = await getTeacher(req.user!.id);
    res.json({ availability });
  }),
);

teacherDashboardRouter.put(
  "/me/availability",
  validate({ body: z.object({ availability: z.array(AvailabilityItemSchema) }) }),
  asyncHandler(async (req, res) => {
    const availability = req.body.availability.map((slot: z.infer<typeof AvailabilityItemSchema>) => ({
      teacher_id: req.user!.id,
      day_of_week: slot.day_of_week,
      start_time: slot.start_time,
      end_time: slot.end_time,
    }));

    const { error: deleteError } = await supabaseAdmin.from("availability").delete().eq("teacher_id", req.user!.id);
    if (deleteError) throw badRequest(deleteError.message);

    if (availability.length > 0) {
      const { data, error } = await supabaseAdmin.from("availability").insert(availability).select();
      if (error) throw badRequest(error.message);
      res.json({ availability: data ?? [] });
      return;
    }

    res.json({ availability: [] });
  }),
);

teacherDashboardRouter.get(
  "/me/portfolio",
  asyncHandler(async (req, res) => {
    const { lesson_notes, template_lessons, assessments } = await getTeacher(req.user!.id);
    res.json({ lesson_notes, template_lessons, assessments });
  }),
);

teacherDashboardRouter.put(
  "/me/portfolio",
  validate({ body: PortfolioSchema }),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof PortfolioSchema>;
    await replaceLessons(req.user!.id, body.lesson_notes ?? [], body.template_lessons ?? []);
    await replaceAssessments(req.user!.id, body.assessments ?? []);
    const refreshed = await getTeacher(req.user!.id);
    res.json({ teacher: refreshed });
  }),
);