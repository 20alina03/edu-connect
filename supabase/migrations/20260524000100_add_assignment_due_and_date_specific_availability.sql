ALTER TABLE public.availability
  ADD COLUMN IF NOT EXISTS available_date DATE;

ALTER TABLE public.teacher_assessments
  ADD COLUMN IF NOT EXISTS due_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_availability_teacher_date
  ON public.availability(teacher_id, available_date);

CREATE INDEX IF NOT EXISTS idx_teacher_assessments_due_at
  ON public.teacher_assessments(due_at);