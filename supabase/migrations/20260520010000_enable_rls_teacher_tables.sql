-- Enable RLS and add policies for teacher-related tables
BEGIN;

-- Enable RLS
ALTER TABLE IF EXISTS public.teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.teacher_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.teacher_lesson_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.teacher_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.teacher_assessment_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.teacher_assessment_solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.availability ENABLE ROW LEVEL SECURITY;

-- teacher_profiles: users can manage their own teacher_profiles row
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p WHERE p.policyname = 'profiles_manage_own' AND p.schemaname = 'public' AND p.tablename = 'teacher_profiles'
  ) THEN
    CREATE POLICY profiles_manage_own ON public.teacher_profiles
      FOR ALL
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END
$$;

-- availability: teacher can manage their own availability rows
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p WHERE p.policyname = 'availability_manage_own' AND p.schemaname = 'public' AND p.tablename = 'availability'
  ) THEN
    CREATE POLICY availability_manage_own ON public.availability
      FOR ALL
      USING (teacher_id = auth.uid())
      WITH CHECK (teacher_id = auth.uid());
  END IF;
END
$$;

-- teacher_lessons: teachers manage own lessons
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p WHERE p.policyname = 'lessons_manage_own' AND p.schemaname = 'public' AND p.tablename = 'teacher_lessons'
  ) THEN
    CREATE POLICY lessons_manage_own ON public.teacher_lessons
      FOR ALL
      USING (teacher_id = auth.uid())
      WITH CHECK (teacher_id = auth.uid());
  END IF;
END
$$;

-- teacher_lesson_students: allow teachers to manage assignments for their lessons
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p WHERE p.policyname = 'lesson_students_manage_by_teacher' AND p.schemaname = 'public' AND p.tablename = 'teacher_lesson_students'
  ) THEN
    CREATE POLICY lesson_students_manage_by_teacher ON public.teacher_lesson_students
      FOR ALL
      USING (EXISTS (SELECT 1 FROM public.teacher_lessons tl WHERE tl.id = teacher_lesson_students.lesson_id AND tl.teacher_id = auth.uid()))
      WITH CHECK (EXISTS (SELECT 1 FROM public.teacher_lessons tl WHERE tl.id = teacher_lesson_students.lesson_id AND tl.teacher_id = auth.uid()));
  END IF;
END
$$;

-- teacher_assessments: teachers manage own assessments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p WHERE p.policyname = 'assessments_manage_own' AND p.schemaname = 'public' AND p.tablename = 'teacher_assessments'
  ) THEN
    CREATE POLICY assessments_manage_own ON public.teacher_assessments
      FOR ALL
      USING (teacher_id = auth.uid())
      WITH CHECK (teacher_id = auth.uid());
  END IF;
END
$$;

-- teacher_assessment_students: allow teachers to manage assignment rows for their assessments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p WHERE p.policyname = 'assessment_students_manage_by_teacher' AND p.schemaname = 'public' AND p.tablename = 'teacher_assessment_students'
  ) THEN
    CREATE POLICY assessment_students_manage_by_teacher ON public.teacher_assessment_students
      FOR ALL
      USING (EXISTS (SELECT 1 FROM public.teacher_assessments ta WHERE ta.id = teacher_assessment_students.assessment_id AND ta.teacher_id = auth.uid()))
      WITH CHECK (EXISTS (SELECT 1 FROM public.teacher_assessments ta WHERE ta.id = teacher_assessment_students.assessment_id AND ta.teacher_id = auth.uid()));
  END IF;
END
$$;

-- teacher_assessment_solutions: two policies
-- 1) Students can insert/select their own solutions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p WHERE p.policyname = 'solutions_students_insert_select' AND p.schemaname = 'public' AND p.tablename = 'teacher_assessment_solutions'
  ) THEN
    CREATE POLICY solutions_students_insert_select ON public.teacher_assessment_solutions
      FOR SELECT USING (student_id = auth.uid());
    CREATE POLICY solutions_students_insert_select_insert ON public.teacher_assessment_solutions
      FOR INSERT WITH CHECK (student_id = auth.uid());
  END IF;
END
$$;

-- 2) Teachers can select/update/delete solutions for assessments they own
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p WHERE p.policyname = 'solutions_teachers_manage' AND p.schemaname = 'public' AND p.tablename = 'teacher_assessment_solutions'
  ) THEN
    CREATE POLICY solutions_teachers_manage ON public.teacher_assessment_solutions
      FOR ALL
      USING (EXISTS (SELECT 1 FROM public.teacher_assessments ta WHERE ta.id = teacher_assessment_solutions.assessment_id AND ta.teacher_id = auth.uid()))
      WITH CHECK (EXISTS (SELECT 1 FROM public.teacher_assessments ta WHERE ta.id = teacher_assessment_solutions.assessment_id AND ta.teacher_id = auth.uid()));
  END IF;
END
$$;

COMMIT;
