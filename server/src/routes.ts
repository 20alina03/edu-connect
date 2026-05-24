import { Router } from "express";
import { authRouter } from "./modules/auth/auth.routes.js";
import { teachersRouter } from "./modules/teachers/teachers.routes.js";
import { teacherDashboardRouter } from "./modules/teachers/dashboard.routes.js";
import { bookingsRouter } from "./modules/bookings/bookings.routes.js";
import { communityRouter } from "./modules/community/community.routes.js";
import { reviewsRouter } from "./modules/reviews/reviews.routes.js";
import { messagesRouter } from "./modules/messages/messages.routes.js";
import { notificationsRouter } from "./modules/notifications/notifications.routes.js";
import { profileRouter } from "./modules/profile/profile.routes.js";
import { studentsRouter } from "./modules/students/students.routes.js";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => res.json({ status: "ok", time: new Date().toISOString() }));
apiRouter.use("/auth", authRouter);

// ─── IMPORTANT: teacherDashboardRouter MUST be registered BEFORE teachersRouter.
// teachersRouter has a wildcard GET /:id route. If it is registered first, Express
// will match GET /teachers/me as id="me" and pass "me" to Supabase as a UUID →
// "invalid input syntax for type uuid: me" (400 error).
// By registering the dashboard router first, all /me and /me/* routes are matched
// before the /:id wildcard ever sees the request.
apiRouter.use("/teachers", teacherDashboardRouter); // ← specific /me routes first
apiRouter.use("/teachers", teachersRouter);          // ← wildcard /:id second

apiRouter.use("/bookings", bookingsRouter);
apiRouter.use("/community", communityRouter);
apiRouter.use("/students", studentsRouter);
apiRouter.use("/reviews", reviewsRouter);
apiRouter.use("/messages", messagesRouter);
apiRouter.use("/notifications", notificationsRouter);
apiRouter.use("/profile", profileRouter);