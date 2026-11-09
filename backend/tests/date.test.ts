import { describe, it, expect } from "vitest";
import {
  getTodayDateString,
  isFutureDate,
  calculateReportRanges,
  parseDateOnly,
  formatDateOnly,
} from "../src/utils/date.js";

describe("Date Utilities & Timezone Handling", () => {
  it("formats today as YYYY-MM-DD", () => {
    const today = getTodayDateString();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("identifies future dates correctly", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = formatDateOnly(tomorrow);
    expect(isFutureDate(tomorrowStr)).toBe(true);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDateOnly(yesterday);
    expect(isFutureDate(yesterdayStr)).toBe(false);

    const todayStr = getTodayDateString();
    expect(isFutureDate(todayStr)).toBe(false);
  });

  it("calculates report date ranges for a standard mid-month date", () => {
    const ranges = calculateReportRanges("2026-11-15");
    expect(ranges.selectedDate).toBe("2026-11-15");
    expect(ranges.monthToDate.startDate).toBe("2026-11-01");
    expect(ranges.monthToDate.endDate).toBe("2026-11-15");
    expect(ranges.previousMonth.startDate).toBe("2026-10-01");
    expect(ranges.previousMonth.endDate).toBe("2026-10-31");
    expect(ranges.previousMonth.year).toBe(2026);
    expect(ranges.previousMonth.month).toBe(10);
  });

  it("calculates previous month correctly across year boundary (January)", () => {
    const ranges = calculateReportRanges("2026-01-08");
    expect(ranges.selectedDate).toBe("2026-01-08");
    expect(ranges.monthToDate.startDate).toBe("2026-01-01");
    expect(ranges.monthToDate.endDate).toBe("2026-01-08");
    // January's previous month is December of previous year (31 days)
    expect(ranges.previousMonth.startDate).toBe("2025-12-01");
    expect(ranges.previousMonth.endDate).toBe("2025-12-31");
    expect(ranges.previousMonth.year).toBe(2025);
    expect(ranges.previousMonth.month).toBe(12);
  });

  it("handles leap year February in previous month calculation", () => {
    // 2024 is a leap year (Feb 29)
    const ranges = calculateReportRanges("2024-03-10");
    expect(ranges.previousMonth.startDate).toBe("2024-02-01");
    expect(ranges.previousMonth.endDate).toBe("2024-02-29");
  });

  it("preserves exact calendar date when converting between string and Date", () => {
    const sample = "2026-05-18";
    const dateObj = parseDateOnly(sample);
    const formatted = formatDateOnly(dateObj);
    expect(formatted).toBe(sample);
  });
});

