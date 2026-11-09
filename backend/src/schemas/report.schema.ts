import { z } from "zod";
import { isFutureDate } from "../utils/date.js";

export const reportQuerySchema = z.object({
  date: z
    .string({ required_error: "Selected date parameter 'date' is required (YYYY-MM-DD)" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .refine((dateStr) => !isFutureDate(dateStr), {
      message: "Report date cannot be in the future",
    })
    .optional(),
});

export type ReportQueryInput = z.infer<typeof reportQuerySchema>;

