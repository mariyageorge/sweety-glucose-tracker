/**
 * Date and calendar utilities for Sweety
 * 
 * DESIGN DECISION EXPLAINED:
 * In blood glucose tracking, a reading belongs to a specific calendar day (e.g. 2026-11-09).
 * If we use UTC Date objects naively, users in timezones like IST (UTC+5:30) or PST (UTC-8)
 * can have their readings shift to yesterday or tomorrow when serialized.
 * 
 * To prevent timezone drift:
 * 1. Calendar dates are validated and manipulated as ISO strings: "YYYY-MM-DD".
 * 2. Database stores PostgreSQL DATE type (@db.Date), which has no time component.
 * 3. ISO date strings sort lexicographically ("2026-11-09" > "2026-11-08"), making range
 *    and future date comparisons rock-solid without UTC offset side-effects.
 */

export const APP_TIMEZONE = process.env.APP_TIMEZONE || "Asia/Kolkata";

/**
 * Returns today's calendar date as a "YYYY-MM-DD" string in the configured timezone.
 */
export function getTodayDateString(timeZone: string = APP_TIMEZONE): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(now); // en-CA locale formats natively as YYYY-MM-DD
}

/**
 * Checks whether a "YYYY-MM-DD" string represents a future date relative to today.
 */
export function isFutureDate(dateStr: string, timeZone: string = APP_TIMEZONE): boolean {
  const today = getTodayDateString(timeZone);
  return dateStr > today;
}

/**
 * Parses a YYYY-MM-DD string into a Date object at UTC midnight for Prisma @db.Date fields.
 */
export function parseDateOnly(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Formats a Date object into a YYYY-MM-DD string.
 */
export function formatDateOnly(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Report date boundary calculator based on a selected date.
 * Requirements:
 * - Daily: exactly the selected date.
 * - Month-to-date: from 1st day of selected date's month through selected date.
 * - Previous month: entire calendar month preceding selected date's month.
 */
export interface ReportDateRanges {
  selectedDate: string;
  monthToDate: {
    startDate: string; // YYYY-MM-01
    endDate: string;   // selectedDate
  };
  previousMonth: {
    startDate: string; // prevYear-prevMonth-01
    endDate: string;   // prevYear-prevMonth-lastDay
    year: number;
    month: number;     // 1-12
  };
}

export function calculateReportRanges(selectedDateStr: string): ReportDateRanges {
  const [year, month, day] = selectedDateStr.split("-").map(Number);

  // Month-to-date: from YYYY-MM-01 to selectedDate
  const mtdStart = `${year}-${String(month).padStart(2, "0")}-01`;
  const mtdEnd = selectedDateStr;

  // Previous month calculation:
  // If month is 1 (January), previous month is December of (year - 1)
  const prevYear = month === 1 ? year - 1 : year;
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevMonthStr = String(prevMonth).padStart(2, "0");

  // Number of days in previous month: day 0 of month (1-indexed) gives last day of prev month in JS Date
  const daysInPrevMonth = new Date(Date.UTC(prevYear, prevMonth, 0)).getUTCDate();
  const prevMonthStart = `${prevYear}-${prevMonthStr}-01`;
  const prevMonthEnd = `${prevYear}-${prevMonthStr}-${String(daysInPrevMonth).padStart(2, "0")}`;

  return {
    selectedDate: selectedDateStr,
    monthToDate: {
      startDate: mtdStart,
      endDate: mtdEnd,
    },
    previousMonth: {
      startDate: prevMonthStart,
      endDate: prevMonthEnd,
      year: prevYear,
      month: prevMonth,
    },
  };
}

