ALTER TABLE public.teacher_profiles
ADD COLUMN IF NOT EXISTS education TEXT[] NOT NULL DEFAULT '{}';

CREATE OR REPLACE VIEW public.teachers AS
SELECT
  id,
  user_id,
  subjects,
  hourly_rate_usd,
  mode,
  bio,
  quran_level,
  gender,
  country,
  city,
  languages,
  experience_years,
  rating,
  total_reviews,
  is_verified,
  is_active,
  created_at,
  updated_at,
  education
FROM public.teacher_profiles;