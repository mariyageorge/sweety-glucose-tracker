import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma.js";
import {
  getTodayDateString,
  isFutureDate,
  parseDateOnly,
  formatDateOnly,
  calculateReportRanges,
} from "../utils/date.js";

/**
 * Health Reports Controller
 * 
 * CORE CLINICAL & COMPUTATIONAL PRINCIPLES:
 * 1. Neutral presentation: Results clearly display mg/dL without speculative diagnostic labels.
 * 2. Deterministic calendar ranges based on the client's selected date:
 *    - Daily: Selected date.
 *    - Month-to-date: 1st of selected date's month through selected date.
 *    - Previous month: Full preceding calendar month.
 * 3. Graceful Empty States: When no readings are present, returns clean neutral empty structures
 *    (averages as null, completion counts as 0) for friendly frontend rendering.
 * 4. Multi-Tenant Scoped: Queries strictly filter by `userId: req.user!.id`.
 */

export const SLOTS_METADATA = [
  { slot: "MORNING_FASTING", label: "Morning (fasting)" },
  { slot: "AFTER_BREAKFAST", label: "After breakfast" },
  { slot: "AFTER_LUNCH", label: "After lunch" },
  { slot: "AFTER_DINNER", label: "After dinner" },
] as const;

/**
 * Helper to compute statistical metrics from a list of readings
 */
function computeSummary(readings: Array<{ value: number; slot: string; recordedDate: Date }>) {
  if (readings.length === 0) {
    return {
      totalReadings: 0,
      average: null,
      min: null,
      max: null,
      unit: "mg/dL",
    };
  }

  const values = readings.map((r) => r.value);
  const sum = values.reduce((acc, v) => acc + v, 0);
  const avg = Math.round((sum / values.length) * 10) / 10;

  // Find min and max reading instances
  let minReading = readings[0];
  let maxReading = readings[0];

  for (const r of readings) {
    if (r.value < minReading.value) minReading = r;
    if (r.value > maxReading.value) maxReading = r;
  }

  return {
    totalReadings: readings.length,
    average: avg,
    min: {
      value: minReading.value,
      slot: minReading.slot,
      recordedDate: formatDateOnly(minReading.recordedDate),
    },
    max: {
      value: maxReading.value,
      slot: maxReading.slot,
      recordedDate: formatDateOnly(maxReading.recordedDate),
    },
    unit: "mg/dL",
  };
}

/**
 * Helper to calculate per-slot averages
 */
function computeSlotBreakdown(readings: Array<{ value: number; slot: string }>) {
  const breakdown: Record<string, { label: string; count: number; average: number | null }> = {};

  for (const meta of SLOTS_METADATA) {
    const slotReadings = readings.filter((r) => r.slot === meta.slot);
    const count = slotReadings.length;
    const average =
      count > 0
        ? Math.round((slotReadings.reduce((acc, r) => acc + r.value, 0) / count) * 10) / 10
        : null;

    breakdown[meta.slot] = {
      label: meta.label,
      count,
      average,
    };
  }

  return breakdown;
}

/**
 * 1. GET /api/reports/daily?date=YYYY-MM-DD
 */
export async function getDailyReport(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const selectedDate = (req.query.date as string) || getTodayDateString();

    if (isFutureDate(selectedDate)) {
      res.status(400).json({
        success: false,
        error: "Report date cannot be in the future.",
      });
      return;
    }

    const dateObj = parseDateOnly(selectedDate);

    // Fetch readings for this date
    const readings = await prisma.reading.findMany({
      where: {
        userId,
        recordedDate: dateObj,
      },
      orderBy: { createdAt: "asc" },
    });

    // Map each of the 4 defined slots to whether it was logged or missing
    const slots = SLOTS_METADATA.map((meta) => {
      const match = readings.find((r) => r.slot === meta.slot);
      return {
        slot: meta.slot,
        label: meta.label,
        logged: Boolean(match),
        reading: match
          ? {
              id: match.id,
              value: match.value,
              notes: match.notes,
              createdAt: match.createdAt,
            }
          : null,
      };
    });

    const values = readings.map((r) => r.value);
    const totalLogged = readings.length;
    const average =
      totalLogged > 0
        ? Math.round((values.reduce((acc, v) => acc + v, 0) / totalLogged) * 10) / 10
        : null;
    const min = totalLogged > 0 ? Math.min(...values) : null;
    const max = totalLogged > 0 ? Math.max(...values) : null;

    res.status(200).json({
      success: true,
      data: {
        date: selectedDate,
        summary: {
          totalLogged,
          totalSlots: 4,
          completionRate: Math.round((totalLogged / 4) * 100),
          average,
          min,
          max,
          unit: "mg/dL",
        },
        slots,
        hasReadings: totalLogged > 0,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 2. GET /api/reports/month-to-date?date=YYYY-MM-DD
 */
export async function getMonthToDateReport(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const selectedDate = (req.query.date as string) || getTodayDateString();

    if (isFutureDate(selectedDate)) {
      res.status(400).json({
        success: false,
        error: "Report date cannot be in the future.",
      });
      return;
    }

    const ranges = calculateReportRanges(selectedDate);
    const { startDate, endDate } = ranges.monthToDate;

    const startObj = parseDateOnly(startDate);
    const endObj = parseDateOnly(endDate);

    const readings = await prisma.reading.findMany({
      where: {
        userId,
        recordedDate: {
          gte: startObj,
          lte: endObj,
        },
      },
      orderBy: [{ recordedDate: "asc" }, { createdAt: "asc" }],
    });

    // Calculate days elapsed in the month up to selectedDate
    const [, , day] = selectedDate.split("-").map(Number);
    const totalDays = day;
    const expectedReadings = totalDays * 4;

    const summary = computeSummary(readings);
    const slotAverages = computeSlotBreakdown(readings);

    // Count distinct calendar days with readings
    const distinctDays = new Set(readings.map((r) => formatDateOnly(r.recordedDate))).size;
    const complianceRate =
      expectedReadings > 0 ? Math.round((readings.length / expectedReadings) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        period: {
          type: "month-to-date",
          startDate,
          endDate,
          selectedDate,
          totalDays,
          expectedReadings,
        },
        summary: {
          ...summary,
          daysWithReadings: distinctDays,
          complianceRate,
        },
        slotAverages,
        hasReadings: readings.length > 0,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 3. GET /api/reports/previous-month?date=YYYY-MM-DD
 */
export async function getPreviousMonthReport(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const selectedDate = (req.query.date as string) || getTodayDateString();

    if (isFutureDate(selectedDate)) {
      res.status(400).json({
        success: false,
        error: "Report date cannot be in the future.",
      });
      return;
    }

    const ranges = calculateReportRanges(selectedDate);
    const { startDate, endDate, year, month } = ranges.previousMonth;

    const startObj = parseDateOnly(startDate);
    const endObj = parseDateOnly(endDate);

    const readings = await prisma.reading.findMany({
      where: {
        userId,
        recordedDate: {
          gte: startObj,
          lte: endObj,
        },
      },
      orderBy: [{ recordedDate: "asc" }, { createdAt: "asc" }],
    });

    // Number of days in previous month
    const totalDays = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const expectedReadings = totalDays * 4;

    const summary = computeSummary(readings);
    const slotAverages = computeSlotBreakdown(readings);

    const distinctDays = new Set(readings.map((r) => formatDateOnly(r.recordedDate))).size;
    const complianceRate =
      expectedReadings > 0 ? Math.round((readings.length / expectedReadings) * 100) : 0;

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    const monthName = `${monthNames[month - 1]} ${year}`;

    res.status(200).json({
      success: true,
      data: {
        period: {
          type: "previous-month",
          startDate,
          endDate,
          year,
          month,
          monthName,
          totalDays,
          expectedReadings,
        },
        summary: {
          ...summary,
          daysWithReadings: distinctDays,
          complianceRate,
        },
        slotAverages,
        hasReadings: readings.length > 0,
      },
    });
  } catch (err) {
    next(err);
  }
}
