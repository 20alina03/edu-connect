import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { badRequest } from "../lib/http-error.js";

export const validate =
  (schemas: { body?: ZodSchema; query?: ZodSchema; params?: ZodSchema }) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.query) req.query = schemas.query.parse(req.query) as any;
      if (schemas.params) req.params = schemas.params.parse(req.params) as any;
      next();
    } catch (e: any) {
      next(badRequest("Validation failed", e.flatten?.() ?? e.message));
    }
  };
