## Goal
Replace direct Supabase calls in the frontend with a dedicated Node.js/Express backend (`/server` folder, outside `src`) that talks to **your own Supabase Postgres project**. Frontend communicates only via REST APIs. Provide step-by-step local-run instructions.

> Note: "Lovable Cloud" is just a managed Supabase project. Switching to your own Supabase project means you'll create one at supabase.com and use those credentials — the code patterns are identical, only the URL/keys change.

---

## Architecture

```text
repo/
├── src/                  ← React + Vite frontend (no direct DB calls)
│   └── lib/api.ts        ← typed fetch wrapper → http://localhost:4000/api
├── server/               ← Node.js + Express + TypeScript backend
│   ├── src/
│   │   ├── index.ts              app entry
│   │   ├── config/env.ts         dotenv + zod validation
│   │   ├── lib/supabase.ts       admin client (service-role key)
│   │   ├── middleware/
│   │   │   ├── auth.ts           verifies Supabase JWT from Authorization header
│   │   │   ├── error.ts          centralized error handler
│   │   │   └── validate.ts       zod request validation
│   │   ├── modules/
│   │   │   ├── auth/             signup, login, reset, me
│   │   │   ├── teachers/         list, get, onboarding
│   │   │   ├── bookings/         create, list, update status
│   │   │   ├── reviews/          create, list by teacher
│   │   │   ├── messages/         list threads, send
│   │   │   ├── notifications/    list, mark read
│   │   │   └── profile/          get, update
│   │   └── routes.ts             mounts /api/*
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── supabase/
│   └── migrations/       ← keep existing schema; apply to your own Supabase
└── src/.env              ← VITE_API_URL=http://localhost:4000/api
```

### Layered structure (per module)
- `*.routes.ts` — Express router
- `*.controller.ts` — req/res handling, validation
- `*.service.ts` — business logic (uses Supabase admin client)
- `*.schema.ts` — Zod schemas

---

## Backend stack
- **express**, **cors**, **helmet**, **morgan**, **compression**
- **@supabase/supabase-js** (service-role for trusted ops, anon for token verify)
- **zod** for validation
- **dotenv** + **zod-based env validator**
- **tsx** for dev, **typescript** for build
- **pino** structured logging

## Auth flow
1. Frontend uses `@supabase/supabase-js` **only for auth** (signup/login/Google OAuth) → gets JWT.
2. Every API call includes `Authorization: Bearer <jwt>`.
3. Backend `auth` middleware calls `supabase.auth.getUser(token)` to validate, attaches `req.user`.
4. All DB reads/writes done by the backend with the **service-role key** + explicit ownership checks (no reliance on RLS at the API layer; RLS still enabled as a safety net).

## API endpoints (REST)
```text
POST   /api/auth/signup           { email, password, fullName, role }
POST   /api/auth/login            { email, password }
POST   /api/auth/reset            { email }
GET    /api/auth/me               (auth)
GET    /api/teachers              ?subject&mode&gender&min&max
GET    /api/teachers/:id
POST   /api/teachers/onboarding   (auth, teacher)
GET    /api/bookings              (auth) — student or teacher view
POST   /api/bookings              (auth, student)
PATCH  /api/bookings/:id/status   (auth, teacher)
POST   /api/reviews               (auth, student)
GET    /api/messages              (auth)
POST   /api/messages              (auth)
PATCH  /api/messages/:id/read     (auth)
GET    /api/notifications         (auth)
PATCH  /api/notifications/:id/read(auth)
GET    /api/profile               (auth)
PATCH  /api/profile               (auth)
```

## Frontend changes
- Add `src/lib/api.ts`: fetch wrapper that auto-injects Supabase JWT, handles JSON + errors.
- Add typed clients per module: `src/lib/api/teachers.ts`, `bookings.ts`, etc.
- Refactor pages to use these clients (replacing direct `supabase.from(...)` calls). Auth context keeps using supabase-js for sign-in/up.
- New env: `VITE_API_URL`.

## Realtime
Keep using Supabase Realtime channels directly from the frontend for `messages` and `notifications` (it's auth-scoped via JWT and works fine alongside the REST backend).

---

## Local setup instructions (will be put in `README.md`)

### 1. Create your Supabase project
- Go to https://supabase.com → New project
- Copy: Project URL, `anon` key, `service_role` key
- SQL Editor → run the migration in `supabase/migrations/*.sql`
- Authentication → Providers → enable Email + Google

### 2. Backend
```bash
cd server
cp .env.example .env   # fill SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY, PORT=4000
npm install
npm run dev            # http://localhost:4000
```

### 3. Frontend
```bash
# in repo root
cp .env.example .env   # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL=http://localhost:4000/api
npm install
npm run dev            # http://localhost:5173
```

---

## Important caveats
- **The Lovable preview cannot run the Express server** — it only runs the Vite frontend. The backend will work on your local machine (and any host like Railway/Render/Fly). In Lovable's preview, frontend pages that need the API will show errors until you run the server locally.
- The existing Supabase migration SQL is reused as-is — you run it in your own Supabase SQL editor.
- Service-role key must **never** be exposed to the frontend; it lives only in `server/.env`.

---

## Out of scope
- Deploying the backend (instructions only).
- Payments, video, admin UI.
- Migrating off the existing Lovable Cloud Supabase instance — you'll point your local frontend at your new Supabase project via `.env`.

Approve and I'll implement.