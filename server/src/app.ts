import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { env } from "./config/env.js";
import { apiRouter } from "./routes.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || env.corsOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  }),
);
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));

app.use("/api", apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);
