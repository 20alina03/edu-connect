CREATE TABLE IF NOT EXISTS public.teacher_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_type TEXT NOT NULL CHECK (lesson_type IN ('note', 'template')),
  title TEXT NOT NULL,
  subject TEXT,
  drive_url TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.teacher_lesson_students (
  lesson_id UUID NOT NULL REFERENCES public.teacher_lessons(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (lesson_id, student_id)
);

CREATE TABLE IF NOT EXISTS public.teacher_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  file_url TEXT,
  file_name TEXT,
  file_type TEXT CHECK (file_type IN ('pdf', 'image')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.teacher_assessment_students (
  assessment_id UUID NOT NULL REFERENCES public.teacher_assessments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (assessment_id, student_id)
);

CREATE TABLE IF NOT EXISTS public.teacher_assessment_solutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.teacher_assessments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  marks NUMERIC(8,2),
  max_marks NUMERIC(8,2) NOT NULL DEFAULT 100,
  feedback TEXT,
  graded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_teacher_lessons_teacher_id ON public.teacher_lessons(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assessments_teacher_id ON public.teacher_assessments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assessment_solutions_assessment_id ON public.teacher_assessment_solutions(assessment_id);

ALTER TABLE public.teacher_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_lesson_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_assessment_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_assessment_solutions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'teacher_lessons' AND policyname = 'Teacher lessons own'
  ) THEN
    CREATE POLICY "Teacher lessons own" ON public.teacher_lessons FOR ALL USING (auth.uid() = teacher_id) WITH CHECK (auth.uid() = teacher_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'teacher_lesson_students' AND policyname = 'Teacher lesson students own'
  ) THEN
    CREATE POLICY "Teacher lesson students own" ON public.teacher_lesson_students FOR ALL USING (
      EXISTS (
        SELECT 1 FROM public.teacher_lessons l
        WHERE l.id = lesson_id AND l.teacher_id = auth.uid()
      )
    ) WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.teacher_lessons l
        WHERE l.id = lesson_id AND l.teacher_id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'teacher_assessments' AND policyname = 'Teacher assessments own'
  ) THEN
    CREATE POLICY "Teacher assessments own" ON public.teacher_assessments FOR ALL USING (auth.uid() = teacher_id) WITH CHECK (auth.uid() = teacher_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'teacher_assessment_students' AND policyname = 'Teacher assessment students own'
  ) THEN
    CREATE POLICY "Teacher assessment students own" ON public.teacher_assessment_students FOR ALL USING (
      EXISTS (
        SELECT 1 FROM public.teacher_assessments a
        WHERE a.id = assessment_id AND a.teacher_id = auth.uid()
      )
    ) WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.teacher_assessments a
        WHERE a.id = assessment_id AND a.teacher_id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'teacher_assessment_solutions' AND policyname = 'Teacher assessment solutions own'
  ) THEN
    CREATE POLICY "Teacher assessment solutions own" ON public.teacher_assessment_solutions FOR ALL USING (
      EXISTS (
        SELECT 1 FROM public.teacher_assessments a
        WHERE a.id = assessment_id AND a.teacher_id = auth.uid()
      )
    ) WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.teacher_assessments a
        WHERE a.id = assessment_id AND a.teacher_id = auth.uid()
      )
    );
  END IF;
END $$;

WITH note_items AS (
  SELECT
    tp.user_id AS teacher_id,
    COALESCE((item->>'id')::uuid, gen_random_uuid()) AS lesson_id,
    item
  FROM public.teacher_profiles tp
  CROSS JOIN LATERAL jsonb_array_elements(COALESCE(tp.lesson_notes, '[]'::jsonb)) AS item
)
INSERT INTO public.teacher_lessons (id, teacher_id, lesson_type, title, subject, drive_url, description, created_at, updated_at)
SELECT
  lesson_id,
  teacher_id,
  'note',
  item->>'title',
  NULLIF(item->>'subject', ''),
  item->>'driveUrl',
  COALESCE(item->>'description', ''),
  COALESCE((item->>'createdAt')::timestamptz, now()),
  COALESCE((item->>'createdAt')::timestamptz, now())
FROM note_items
ON CONFLICT (id) DO NOTHING;

WITH note_items AS (
  SELECT
    COALESCE((item->>'id')::uuid, gen_random_uuid()) AS lesson_id,
    item
  FROM public.teacher_profiles tp
  CROSS JOIN LATERAL jsonb_array_elements(COALESCE(tp.lesson_notes, '[]'::jsonb)) AS item
)
INSERT INTO public.teacher_lesson_students (lesson_id, student_id)
SELECT
  lesson_id,
  student_id::uuid
FROM note_items
CROSS JOIN LATERAL jsonb_array_elements_text(COALESCE(item->'assignedStudents', '[]'::jsonb)) AS student_id
ON CONFLICT DO NOTHING;

WITH template_items AS (
  SELECT
    tp.user_id AS teacher_id,
    COALESCE((item->>'id')::uuid, gen_random_uuid()) AS lesson_id,
    item
  FROM public.teacher_profiles tp
  CROSS JOIN LATERAL jsonb_array_elements(COALESCE(tp.template_lessons, '[]'::jsonb)) AS item
)
INSERT INTO public.teacher_lessons (id, teacher_id, lesson_type, title, subject, drive_url, description, created_at, updated_at)
SELECT
  lesson_id,
  teacher_id,
  'template',
  item->>'title',
  NULLIF(item->>'subject', ''),
  item->>'driveUrl',
  COALESCE(item->>'description', ''),
  COALESCE((item->>'createdAt')::timestamptz, now()),
  COALESCE((item->>'createdAt')::timestamptz, now())
FROM template_items
ON CONFLICT (id) DO NOTHING;

WITH assessment_items AS (
  SELECT
    tp.user_id AS teacher_id,
    COALESCE((item->>'id')::uuid, gen_random_uuid()) AS assessment_id,
    item
  FROM public.teacher_profiles tp
  CROSS JOIN LATERAL jsonb_array_elements(COALESCE(tp.assessments, '[]'::jsonb)) AS item
)
INSERT INTO public.teacher_assessments (id, teacher_id, title, description, file_url, file_name, file_type, created_at, updated_at)
SELECT
  assessment_id,
  teacher_id,
  item->>'title',
  COALESCE(item->>'description', ''),
  NULLIF(item->>'fileUrl', ''),
  NULLIF(item->>'fileName', ''),
  NULLIF(item->>'fileType', ''),
  COALESCE((item->>'createdAt')::timestamptz, now()),
  COALESCE((item->>'createdAt')::timestamptz, now())
FROM assessment_items
ON CONFLICT (id) DO NOTHING;

WITH assessment_items AS (
  SELECT
    COALESCE((item->>'id')::uuid, gen_random_uuid()) AS assessment_id,
    item
  FROM public.teacher_profiles tp
  CROSS JOIN LATERAL jsonb_array_elements(COALESCE(tp.assessments, '[]'::jsonb)) AS item
)
INSERT INTO public.teacher_assessment_students (assessment_id, student_id)
SELECT
  assessment_id,
  student_id::uuid
FROM assessment_items
CROSS JOIN LATERAL jsonb_array_elements_text(COALESCE(item->'assignedStudents', '[]'::jsonb)) AS student_id
ON CONFLICT DO NOTHING;

WITH assessment_items AS (
  SELECT
    COALESCE((item->>'id')::uuid, gen_random_uuid()) AS assessment_id,
    item
  FROM public.teacher_profiles tp
  CROSS JOIN LATERAL jsonb_array_elements(COALESCE(tp.assessments, '[]'::jsonb)) AS item
), solution_items AS (
  SELECT
    assessment_id,
    COALESCE((solution->>'id')::uuid, gen_random_uuid()) AS solution_id,
    solution
  FROM assessment_items
  CROSS JOIN LATERAL jsonb_array_elements(COALESCE(item->'solutions', '[]'::jsonb)) AS solution
)
INSERT INTO public.teacher_assessment_solutions (id, assessment_id, student_id, file_url, file_name, submitted_at, marks, max_marks, feedback, graded_at, created_at, updated_at)
SELECT
  solution_id,
  assessment_id,
  (solution->>'studentId')::uuid,
  solution->>'fileUrl',
  solution->>'fileName',
  COALESCE((solution->>'submittedAt')::timestamptz, now()),
  NULLIF(solution->>'marks', '')::numeric,
  COALESCE(NULLIF(solution->>'maxMarks', '')::numeric, 100),
  NULLIF(solution->>'feedback', ''),
  NULLIF(solution->>'gradedAt', '')::timestamptz,
  COALESCE((solution->>'submittedAt')::timestamptz, now()),
  COALESCE((solution->>'submittedAt')::timestamptz, now())
FROM solution_items
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.teacher_profiles
DROP COLUMN IF EXISTS lesson_notes,
DROP COLUMN IF EXISTS template_lessons,
DROP COLUMN IF EXISTS assessments;
