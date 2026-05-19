# EduConnect

A two-portal tutoring platform (Islamic + School) built with **React + Vite** on the frontend and a **Node.js + Express + TypeScript** backend that talks to **Supabase Postgres**.

```text
repo/
├── src/        ← React + Vite frontend
├── server/     ← Express REST API (talks to Supabase via service-role)
└── supabase/   ← SQL migrations to apply to your Supabase project
```

The frontend uses Supabase only for **auth** (sign in / sign up / Google OAuth) and **realtime** subscriptions. All data reads/writes go through the `/server` REST API.

---

## 1 · Create your Supabase project

1. Sign up at <https://supabase.com>, create a new project.
2. **Project Settings → API**, copy:
   - Project URL (`SUPABASE_URL`)
   - `anon` public key (`SUPABASE_ANON_KEY`)
   - `service_role` secret key (`SUPABASE_SERVICE_ROLE_KEY`) — keep server-side only.
3. **SQL Editor → New query**, paste the contents of `supabase/migrations/*.sql` and run.
4. **Authentication → Providers**: enable **Email** (and **Google** if you want OAuth).
5. **Authentication → URL Configuration**: add `http://localhost:5173` to Site URL and Redirect URLs.

## 2 · Run the backend

```bash
cd server
cp .env.example .env
# fill SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
npm install
npm run dev          # → http://localhost:4000
```

Health check: <http://localhost:4000/api/health>

## 3 · Run the frontend

In a **separate terminal**, from the repo root:

```bash
cp .env.example .env   # see file for required vars
npm install
npm run dev            # → http://localhost:5173
```

Required frontend env vars (`.env`):

```
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_API_URL=http://localhost:4000/api
```

---

## Architecture & conventions

### Backend (`/server`)
- **Layered modules** under `src/modules/<name>/`: `*.routes.ts` is the only file Express mounts; controllers/services can be added per module as logic grows.
- **Auth middleware** (`middleware/auth.ts`) verifies the Supabase JWT from `Authorization: Bearer <token>` and attaches `req.user = { id, email, role }`.
- **Service-role client** (`lib/supabase.ts`) bypasses RLS — every endpoint enforces ownership in code (e.g. `student_id === req.user.id`).
- **Validation** with Zod via `middleware/validate.ts` — all inputs are parsed before reaching handlers.
- **Error handling** is centralized: throw `HttpError`/`badRequest()`/`forbidden()` and the global handler shapes the response.
- **Logging** uses `pino` (pretty in dev, JSON in prod).
- **Security**: `helmet`, configurable CORS allow-list, JSON body size limit.

### REST endpoints

```
POST   /api/auth/reset              { email, redirectTo? }
GET    /api/auth/me                 (auth)

// Signup and email verification are handled directly by Supabase from the frontend.

GET    /api/teachers                ?subject&mode&gender&min&max
GET    /api/teachers/:id
POST   /api/teachers/onboarding     (auth, role=teacher)

GET    /api/bookings                (auth) — student or teacher view
POST   /api/bookings                (auth)
PATCH  /api/bookings/:id/status     (auth, participant only)

POST   /api/reviews                 (auth, student of completed booking)
GET    /api/reviews/teacher/:id

GET    /api/messages?with=<userId>  (auth)
POST   /api/messages                (auth)
PATCH  /api/messages/:id/read       (auth, recipient)

GET    /api/notifications           (auth)
PATCH  /api/notifications/:id/read  (auth)
PATCH  /api/notifications/read-all  (auth)

GET    /api/profile                 (auth)
PATCH  /api/profile                 (auth)
```

### Frontend (`/src`)
- `src/lib/api.ts` — typed `fetch` wrapper that auto-attaches the Supabase JWT.
- `src/lib/api/<module>.ts` — typed clients per resource (teachers, bookings, …).
- Pages call these clients; **no `supabase.from(...)` calls in pages** except for realtime subscriptions on `messages` and `notifications`.

### Realtime
We keep Supabase Realtime on the client for `messages` and `notifications` since channels are auth-scoped via the user's JWT and RLS.

---

## Production build

```bash
# backend
cd server && npm run build && npm start

# frontend
npm run build && npm run preview
```

Deploy the API to Render / Railway / Fly / your own VM. Set the env vars there. Set `VITE_API_URL` on the frontend to the deployed API URL.

---

## Security notes
- **Never commit `.env`** — both `.env` files are git-ignored.
- The `service_role` key lives **only** in `server/.env`.
- RLS on every table is a defense-in-depth safety net; primary authorization happens in the API layer.
- Add rate-limiting (`express-rate-limit`) before going to production.
