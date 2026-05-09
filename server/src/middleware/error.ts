import type { ErrorRequestHandler } from "express";
import { HttpError } from "../lib/http-error.js";
import { logger } from "../lib/logger.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }
  logger.error({ err }, "Unhandled error");
  res.status(500).json({ error: "Internal server error" });
};

export const notFoundHandler = (_req: any, res: any) => res.status(404).json({ error: "Route not found" });
