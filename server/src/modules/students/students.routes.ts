import { Router } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { badRequest } from "../../lib/http-error.js";
import { supabaseAdmin } from "../../lib/supabase.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";

export const studentsRouter = Router();

const ISLAMIC_SUBJECTS = new Set(["Quran", "Tajweed", "Hifz", "Noorani Qaida", "Arabic", "Islamic Studies"]);

const inferPortal = (subjects: string[] | null | undefined) => (
  (subjects ?? []).some((subject) => ISLAMIC_SUBJECTS.has(subject)) ? "islamic" : "school"
);

const normalizeTeacherName = (value: string | null | undefined) => value?.trim() || "Teacher";

const supportsDueAt = async () => {
  const probe = await supabaseAdmin.from("teacher_assessments").select("due_at").limit(1);
  return !probe.error || !probe.error.message.toLowerCase().includes("due_at");
};

studentsRouter.use(requireAuth, requireRole("student"));

studentsRouter.get(
  "/me/assignments",
  asyncHandler(async (req, res) => {
    const studentId = req.user!.id;

    const [bookingResult, assignmentLinkResult, templateLessonResult] = await Promise.all([
      supabaseAdmin
        .from("bookings")
        .select("teacher_id, start_at, duration_min, status")
        .eq("student_id", studentId)
        .order("start_at", { ascending: false }),
      supabaseAdmin
        .from("teacher_assessment_students")
        .select("assessment_id, created_at")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("teacher_lessons")
        .select("id, teacher_id, lesson_type, title, subject, drive_url, description, created_at")
        .eq("lesson_type", "template")
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
    ]);

    if (bookingResult.error) throw badRequest(bookingResult.error.message);
    if (assignmentLinkResult.error) throw badRequest(assignmentLinkResult.error.message);
    if (templateLessonResult.error) throw badRequest(templateLessonResult.error.message);

    const bookedTeacherIds = [...new Set((bookingResult.data ?? [])
      .filter((booking) => booking.status !== "cancelled")
      .map((booking) => booking.teacher_id))];
    const templateLessons = templateLessonResult.data ?? [];
    const noteLessonsResult = bookedTeacherIds.length > 0
      ? await supabaseAdmin
          .from("teacher_lessons")
          .select("id, teacher_id, lesson_type, title, subject, drive_url, description, created_at")
          .eq("lesson_type", "note")
          .is("deleted_at", null)
          .in("teacher_id", bookedTeacherIds)
          .order("created_at", { ascending: false })
      : { data: [], error: null };

    if (noteLessonsResult.error) throw badRequest(noteLessonsResult.error.message);

    const assessmentLinks = assignmentLinkResult.data ?? [];
    const assessmentIds = [...new Set(assessmentLinks.map((row) => row.assessment_id))];
    const hasDueAt = await supportsDueAt();

    const [assessmentResult, solutionResult] = assessmentIds.length > 0
      ? await Promise.all([
          supabaseAdmin
            .from("teacher_assessments")
            .select(hasDueAt
              ? "id, teacher_id, title, description, file_url, file_name, file_type, created_at, due_at"
              : "id, teacher_id, title, description, file_url, file_name, file_type, created_at")
            .in("id", assessmentIds)
            .is("deleted_at", null)
            .order("created_at", { ascending: false }),
          supabaseAdmin
            .from("teacher_assessment_solutions")
            .select("assessment_id, student_id, submitted_at, marks, max_marks, feedback, graded_at, file_url, file_name")
            .eq("student_id", studentId)
            .in("assessment_id", assessmentIds)
            .order("submitted_at", { ascending: false }),
        ])
      : [{ data: [], error: null }, { data: [], error: null }];

    if (assessmentResult.error) throw badRequest(assessmentResult.error.message);
    if (solutionResult.error) throw badRequest(solutionResult.error.message);

    const teacherIds = [...new Set([
      ...bookedTeacherIds,
      ...templateLessons.map((lesson) => lesson.teacher_id),
      ...(noteLessonsResult.data ?? []).map((lesson) => lesson.teacher_id),
      ...(assessmentResult.data ?? []).map((assessment) => assessment.teacher_id),
    ])];

    const [profileResult, teacherProfileResult] = teacherIds.length > 0
      ? await Promise.all([
          supabaseAdmin.from("profiles").select("id, full_name, avatar_url").in("id", teacherIds),
          supabaseAdmin.from("teacher_profiles").select("user_id, subjects").in("user_id", teacherIds),
        ])
      : [{ data: [], error: null }, { data: [], error: null }];

    if (profileResult.error) throw badRequest(profileResult.error.message);
    if (teacherProfileResult.error) throw badRequest(teacherProfileResult.error.message);

    const profileMap = new Map((profileResult.data ?? []).map((profile) => [profile.id, profile]));
    const teacherProfileMap = new Map((teacherProfileResult.data ?? []).map((teacher) => [teacher.user_id, teacher]));
    const teacherName = (teacherId: string) => normalizeTeacherName(profileMap.get(teacherId)?.full_name);
    const teacherAvatar = (teacherId: string) => profileMap.get(teacherId)?.avatar_url ?? null;
    const teacherPortal = (teacherId: string) => inferPortal(teacherProfileMap.get(teacherId)?.subjects);

    const solutionMap = new Map((solutionResult.data ?? []).map((solution) => [solution.assessment_id, solution]));

    const assignments = (assessmentResult.data ?? [])
      .map((assessment) => {
        const assignmentLink = assessmentLinks.find((row) => row.assessment_id === assessment.id);
        const solution = solutionMap.get(assessment.id) ?? null;
        const status = solution?.graded_at ? "graded" : solution ? "submitted" : "upcoming";
        const subject = teacherProfileMap.get(assessment.teacher_id)?.subjects?.[0] ?? "Assignment";
        return {
          id: assessment.id,
          title: assessment.title,
          subject,
          portal: teacherPortal(assessment.teacher_id),
          teacher: teacherName(assessment.teacher_id),
          teacherId: assessment.teacher_id,
          teacherAvatar: teacherAvatar(assessment.teacher_id),
          dueAt: (assessment as { due_at?: string | null }).due_at ?? assessment.created_at,
          assignedAt: assignmentLink?.created_at ?? assessment.created_at,
          submittedAt: solution?.submitted_at ?? null,
          score: solution?.marks ?? null,
          maxScore: solution?.max_marks ?? 100,
          status,
          note: assessment.description || "Open the assignment to review teacher instructions.",
          fileUrl: assessment.file_url ?? null,
          fileName: assessment.file_name ?? null,
          fileType: (assessment as { file_type?: "pdf" | "image" | null }).file_type ?? null,
        };
      })
      .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());

    const resources = {
      template_lessons: (templateLessons ?? []).map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        subject: lesson.subject ?? null,
        teacherId: lesson.teacher_id,
        teacher: teacherName(lesson.teacher_id),
        teacherAvatar: teacherAvatar(lesson.teacher_id),
        portal: teacherPortal(lesson.teacher_id),
        driveUrl: lesson.drive_url,
        description: lesson.description ?? "",
        lessonType: lesson.lesson_type,
        createdAt: lesson.created_at,
      })),
      lesson_notes: (noteLessonsResult.data ?? []).map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        subject: lesson.subject ?? null,
        teacherId: lesson.teacher_id,
        teacher: teacherName(lesson.teacher_id),
        teacherAvatar: teacherAvatar(lesson.teacher_id),
        portal: teacherPortal(lesson.teacher_id),
        driveUrl: lesson.drive_url,
        description: lesson.description ?? "",
        lessonType: lesson.lesson_type,
        createdAt: lesson.created_at,
      })),
    };

    res.json({ assignments, resources });
  }),
);

studentsRouter.post(
  "/me/assignments/:id/solutions",
  asyncHandler(async (req, res) => {
    const studentId = req.user!.id;
    const assessmentId = req.params.id;
    const { fileUrl, fileName } = req.body as { fileUrl: string; fileName: string };

    if (!fileUrl || !fileName) throw badRequest("fileUrl and fileName are required");

    // Verify student is assigned to this assessment
    const { data: assignedRows, error: assignErr } = await supabaseAdmin
      .from("teacher_assessment_students")
      .select("student_id")
      .eq("assessment_id", assessmentId)
      .eq("student_id", studentId);
    if (assignErr) throw badRequest(assignErr.message);
    if (!assignedRows || assignedRows.length === 0) throw badRequest("Student not assigned to this assessment");

    // Fetch assessment to check due date
    const { data: [assessment], error: assessmentErr } = await supabaseAdmin
      .from("teacher_assessments")
      .select("id, teacher_id, due_at")
      .eq("id", assessmentId)
      .limit(1);
    if (assessmentErr) throw badRequest(assessmentErr.message);
    if (!assessment) throw badRequest("Assessment not found");

    const dueAt = (assessment as any).due_at ? new Date((assessment as any).due_at).getTime() : null;
    const now = Date.now();
    if (dueAt && now > dueAt) throw badRequest("Cannot submit after due date");

    // Check existing solution
    const { data: existing } = await supabaseAdmin
      .from("teacher_assessment_solutions")
      .select("id, submitted_at")
      .eq("assessment_id", assessmentId)
      .eq("student_id", studentId)
      .limit(1);

    if (existing && existing.length > 0) {
      // existing solution exists, allow update only before due date
      const rowId = existing[0].id;
      const { error: updateErr } = await supabaseAdmin
        .from("teacher_assessment_solutions")
        .update({ file_url: fileUrl, file_name: fileName, submitted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq("id", rowId);
      if (updateErr) throw badRequest(updateErr.message);
      const { data: updated } = await supabaseAdmin
        .from("teacher_assessment_solutions")
        .select("*")
        .eq("id", rowId)
        .single();
      res.status(200).json({ solution: updated });
      return;
    }

    // Insert new solution
    const insertRow = {
      id: undefined,
      assessment_id: assessmentId,
      student_id: studentId,
      file_url: fileUrl,
      file_name: fileName,
      submitted_at: new Date().toISOString(),
    };
    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from("teacher_assessment_solutions")
      .insert(insertRow)
      .select()
      .single();
    if (insertErr) throw badRequest(insertErr.message);
    res.status(201).json({ solution: inserted });
  }),
);