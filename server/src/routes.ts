import { Router } from "express";
import { authRouter } from "./modules/auth/auth.routes.js";
import { teachersRouter } from "./modules/teachers/teachers.routes.js";
import { teacherDashboardRouter } from "./modules/teachers/dashboard.routes.js";
import { bookingsRouter } from "./modules/bookings/bookings.routes.js";
import { reviewsRouter } from "./modules/reviews/reviews.routes.js";
import { messagesRouter } from "./modules/messages/messages.routes.js";
import { notificationsRouter } from "./modules/notifications/notifications.routes.js";
import { profileRouter } from "./modules/profile/profile.routes.js";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => res.json({ status: "ok", time: new Date().toISOString() }));
apiRouter.use("/auth", authRouter);
apiRouter.use("/teachers", teachersRouter);
apiRouter.use("/teachers", teacherDashboardRouter);
apiRouter.use("/bookings", bookingsRouter);
apiRouter.use("/reviews", reviewsRouter);
apiRouter.use("/messages", messagesRouter);
apiRouter.use("/notifications", notificationsRouter);
apiRouter.use("/profile", profileRouter);
