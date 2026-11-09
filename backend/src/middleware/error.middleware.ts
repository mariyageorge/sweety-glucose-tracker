import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";

/**
 * Centralized Express Error Handling Middleware
 * 
 * DESIGN DECISION EXPLAINED:
 * 1. Consistent JSON error envelopes for all errors across the app.
 * 2. Translates low-level Prisma database errors (like P2002 unique constraint collision)
 *    into appropriate HTTP status codes (like 409 Conflict) with human-friendly messages.
 * 3. Never leaks internal database schemas or sensitive stack traces in production.
 */
export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error("Unhandled Error:", err);

  // Prisma Unique Constraint Violation (e.g. unique_user_date_slot collision)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      res.status(409).json({
        success: false,
        error: "Conflict: A reading for this time slot on this date has already been recorded.",
      });
      return;
    }
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "An unexpected internal server error occurred.";

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
}

