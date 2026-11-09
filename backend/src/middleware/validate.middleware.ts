import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";

/**
 * Higher-order middleware factory to validate incoming request data using Zod.
 * 
 * DESIGN DECISION EXPLAINED:
 * Validating inputs at the API gateway level before touching any business logic or
 * database queries prevents garbage data from corrupting system state and gives
 * the frontend clear, field-level error messages.
 */
export function validateBody(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        res.status(400).json({
          success: false,
          error: "Validation failed",
          details: issues,
        });
        return;
      }
      next(error);
    }
  };
}

export function validateQuery(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.query = await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        res.status(400).json({
          success: false,
          error: "Invalid query parameters",
          details: issues,
        });
        return;
      }
      next(error);
    }
  };
}

