-- ============================================================
-- FIX 1: Auto-create teacher_profile row on signup
--
-- The existing handle_new_user() trigger already does this,
-- but ONLY when role = 'teacher' is passed in raw_user_meta_data
-- at sign-up time. If the row is missing for any existing
-- teacher users, this migration back-fills it.
-- ============================================================

INSERT INTO public.teacher_profiles (user_id)
SELECT ur.user_id
FROM public.user_roles ur
WHERE ur.role = 'teacher'
  AND NOT EXISTS (
    SELECT 1 FROM public.teacher_profiles tp
    WHERE tp.user_id = ur.user_id
  )
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================
-- FIX 2: Harden the trigger so teacher_profiles is ALWAYS
-- created when a teacher role row is inserted, even if the
-- signup didn't include role='teacher' in metadata (e.g. an
-- admin later assigns the teacher role via user_roles insert).
-- ============================================================

CREATE OR REPLACE FUNCTION public.ensure_teacher_profile_on_role()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.role = 'teacher' THEN
    INSERT INTO public.teacher_profiles (user_id)
    VALUES (NEW.user_id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_teacher_role_assigned ON public.user_roles;
CREATE TRIGGER on_teacher_role_assigned
  AFTER INSERT ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.ensure_teacher_profile_on_role();

-- ============================================================
-- FIX 3: supabaseAdmin bypasses RLS but the Supabase dashboard
-- shows "Disabled" in the Realtime column (NOT in the RLS
-- column). RLS is already ON. These statements are safe no-ops
-- if already enabled, included for certainty.
-- ============================================================

ALTER TABLE IF EXISTS public.teacher_profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.teacher_lessons          ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.teacher_lesson_students  ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.teacher_assessments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.teacher_assessment_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.teacher_assessment_solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.availability             ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_roles               ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- FIX 4: The "Disabled" label in the Supabase Table Editor is
-- the REALTIME replication status, not RLS.
-- Enable realtime for teacher-related tables so the dashboard
-- can receive live updates (optional but recommended).
-- ============================================================

-- Add tables to realtime publication (idempotent)
DO $$
BEGIN
  -- teacher_profiles
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'teacher_profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.teacher_profiles;
  END IF;

  -- teacher_lessons
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'teacher_lessons'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.teacher_lessons;
  END IF;

  -- teacher_assessments
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'teacher_assessments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.teacher_assessments;
  END IF;

  -- availability
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'availability'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.availability;
  END IF;
END $$;

-- ============================================================
-- FIX 5: Ensure the admin service-role key can always read
-- teacher_lesson_students even when teacher_id filter is used
-- via a JOIN. supabaseAdmin already bypasses RLS, but add an
-- explicit SELECT policy for completeness.
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'teacher_lesson_students'
      AND policyname = 'Students view own lesson assignments'
  ) THEN
    CREATE POLICY "Students view own lesson assignments"
      ON public.teacher_lesson_students
      FOR SELECT
      USING (student_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'teacher_assessment_students'
      AND policyname = 'Students view own assessment assignments'
  ) THEN
    CREATE POLICY "Students view own assessment assignments"
      ON public.teacher_assessment_students
      FOR SELECT
      USING (student_id = auth.uid());
  END IF;
END $$;