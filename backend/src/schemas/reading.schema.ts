import { z } from "zod";
import { isFutureDate } from "../utils/date.js";

export const slotEnum = z.enum(
  ["MORNING_FASTING", "AFTER_BREAKFAST", "AFTER_LUNCH", "AFTER_DINNER"],
  {
    errorMap: () => ({
      message: "Slot must be one of: MORNING_FASTING, AFTER_BREAKFAST, AFTER_LUNCH, AFTER_DINNER",
    }),
  }
);

export const createReadingSchema = z.object({
  value: z
    .number({ required_error: "Blood glucose reading value is required" })
    .int("Blood glucose value must be a whole number (no decimals)")
    .min(40, "Blood glucose value cannot be below 40 mg/dL")
    .max(600, "Blood glucose value cannot exceed 600 mg/dL"),
  slot: slotEnum,
  recordedDate: z
    .string({ required_error: "Recorded date is required" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .refine((dateStr) => !isFutureDate(dateStr), {
      message: "Future dates are not allowed. Please select today or a past date.",
    }),
  notes: z
    .string()
    .trim()
    .max(250, "Notes cannot exceed 250 characters")
    .optional()
    .nullable(),
});

export const updateReadingSchema = z
  .object({
    value: z
      .number()
      .int("Blood glucose value must be a whole number (no decimals)")
      .min(40, "Blood glucose value cannot be below 40 mg/dL")
      .max(600, "Blood glucose value cannot exceed 600 mg/dL")
      .optional(),
    slot: slotEnum.optional(),
    recordedDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
      .refine((dateStr) => !isFutureDate(dateStr), {
        message: "Future dates are not allowed. Please select today or a past date.",
      })
      .optional(),
    notes: z
      .string()
      .trim()
      .max(250, "Notes cannot exceed 250 characters")
      .optional()
      .nullable(),
  })
  .refine(
    (data) =>
      data.value !== undefined ||
      data.slot !== undefined ||
      data.recordedDate !== undefined ||
      data.notes !== undefined,
    {
      message: "At least one field (value, slot, recordedDate, or notes) must be provided to update.",
    }
  );

export const getReadingsQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),
  recordedDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),
});

export type CreateReadingInput = z.infer<typeof createReadingSchema>;
export type UpdateReadingInput = z.infer<typeof updateReadingSchema>;
export type GetReadingsQueryInput = z.infer<typeof getReadingsQuerySchema>;
