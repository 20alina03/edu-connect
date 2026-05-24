ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS meeting_link TEXT,
  ADD COLUMN IF NOT EXISTS attendance_status TEXT,
  ADD COLUMN IF NOT EXISTS attendance_marked_at TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'bookings_attendance_status_check'
  ) THEN
    ALTER TABLE public.bookings
      ADD CONSTRAINT bookings_attendance_status_check
      CHECK (attendance_status IS NULL OR attendance_status IN ('present', 'absent', 'late'));
  END IF;
END $$;