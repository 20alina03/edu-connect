## Goal
Wire up Lovable Cloud (Supabase) backend, add real auth with role selection (student/teacher), gate protected routes, build the remaining pages, and fix navigation flow.

## 1. Enable Lovable Cloud
- Provision Supabase via `supabase--enable`.
- Auth: Email/Password + Google.

## 2. Database schema (migrations)
- `app_role` enum: `student | teacher | admin`
- `profiles` (id=auth.users.id, full_name, avatar_url, phone, portal `islamic|school`, created_at) — auto-created via trigger on `auth.users` insert.
- `user_roles` (id, user_id, role) + `has_role()` SECURITY DEFINER function.
- `teacher_profiles` (per spec: subjects[], hourly_rate_usd, mode, bio, quran_level, gender, country, languages[], rating, total_reviews, is_verified).
- `availability` (teacher_id, day_of_week, start_time, end_time).
- `bookings` (id, student_id, teacher_id, subject, start_at, duration_min, mode, status `pending|confirmed|completed|cancelled`, notes, price_usd).
- `reviews` (id, booking_id, student_id, teacher_id, rating, comment).
- `messages` (id, sender_id, recipient_id, body, read_at).
- `notifications` (id, user_id, type, title, body, data jsonb, read_at).
- RLS on every table: users access only their own rows; teachers read their bookings; public read for `teacher_profiles` + `reviews`.

## 3. Auth + role selection
- Replace mock `AuthContext` with real Supabase client (`src/integrations/supabase/client.ts` is auto-generated).
- New `useAuth` hook using `onAuthStateChange` + `getSession`.
- Login & Signup pages: add **role tabs** (Student / Teacher). On signup, write role to `user_roles` and create `teacher_profiles` row if teacher.
- Add Google OAuth button (Lovable Cloud managed).
- `/reset-password` page.

## 4. Route protection & flow
- `<ProtectedRoute>` wrapper redirecting unauthenticated users to `/login?redirect=...`.
- Gate: `/book/:id`, `/dashboard/*`, `/messages`, `/profile/edit`, `/teacher/onboarding`.
- After login: redirect by role → `/dashboard/teacher` or `/dashboard/student`.
- "Book" button on TeacherProfile: if logged out → `/login?redirect=/book/:id`.

## 5. Remaining pages
- `/dashboard/student` — upcoming bookings, past sessions, recommended teachers.
- `/dashboard/teacher` — today's schedule, booking requests (accept/decline), earnings stub, profile completeness.
- `/teacher/onboarding` — multi-step form to fill teacher_profiles + availability.
- `/messages` and `/messages/:userId` — inbox + thread (realtime via Supabase channel).
- `/notifications` — list with mark-as-read.
- `/profile` (view) and `/profile/edit`.
- `/bookings/:id` — booking detail + review form when status=completed.
- `/reset-password`.
- `/about`, `/how-it-works`, `/pricing`, `/contact` — static marketing pages.
- `/404` already exists.

## 6. Replace mock data
- `TeachersList` + `TeacherProfile` query Supabase instead of `src/data/teachers.ts`.
- Booking form inserts into `bookings`.
- Reviews insert + aggregate teacher rating via trigger.

## 7. Navigation cleanup
- Header shows Login/Signup when logged out; avatar menu (Dashboard, Profile, Logout) when logged in.
- Remove direct deep-links to booking from public landing for guests (they get redirected to login).

## Technical notes
- Stack: existing React + Vite + Tailwind + shadcn. Add `@supabase/supabase-js` (auto by Cloud).
- Roles MUST live in `user_roles` table — never on profiles (privilege-escalation safe).
- All policies use `public.has_role(auth.uid(), 'role')`.
- Realtime enabled on `messages` and `notifications`.
- No payments, no video — per earlier decision.

## Out of scope
- Stripe / Agora / SMS.
- Admin moderation UI (table exists, page deferred).
