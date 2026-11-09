import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { prisma } from "../src/config/prisma.js";
import { generateToken, AUTH_COOKIE_NAME } from "../src/utils/token.js";
import { parseDateOnly } from "../src/utils/date.js";
import { Slot } from "@prisma/client";

describe("Health Reports Engine API (/api/reports)", () => {
  let userReport: { id: string; email: string };
  let userEmpty: { id: string; email: string };
  let cookieReport: string;
  let cookieEmpty: string;

  beforeAll(async () => {
    // 1. Create two isolated test users
    const emailReport = `report_user_${Date.now()}@sweety.app`;
    const emailEmpty = `report_empty_${Date.now()}@sweety.app`;

    const bcrypt = await import("bcryptjs");
    const passwordHash = await bcrypt.hash("Password123!", 10);

    userReport = await prisma.user.create({
      data: { name: "Report Patient", email: emailReport, password: passwordHash },
      select: { id: true, email: true },
    });

    userEmpty = await prisma.user.create({
      data: { name: "Empty Patient", email: emailEmpty, password: passwordHash },
      select: { id: true, email: true },
    });

    const tokenReport = generateToken({ userId: userReport.id, email: userReport.email });
    const tokenEmpty = generateToken({ userId: userEmpty.id, email: userEmpty.email });

    cookieReport = `${AUTH_COOKIE_NAME}=${tokenReport}`;
    cookieEmpty = `${AUTH_COOKIE_NAME}=${tokenEmpty}`;

    // 2. Seed deterministic readings for userReport across:
    // - Specific target day: 2026-05-15 (3 readings: 90, 135, 145 -> avg: 123.3)
    // - MTD range (2026-05-01 to 2026-05-15):
    //     - 2026-05-01: 85 (Fasting)
    //     - 2026-05-10: 160 (Lunch)
    //     - Plus the 3 on 2026-05-15 -> Total 5 readings (85, 90, 135, 145, 160 -> sum: 615 / 5 = 123.0)
    // - Readings AFTER selected date in same month (should be excluded from MTD):
    //     - 2026-05-20: 210
    // - Previous Month range (2026-04-01 to 2026-04-30):
    //     - 2026-04-05: 92 (Fasting)
    //     - 2026-04-18: 128 (Lunch)
    //     - 2026-04-30: 142 (Dinner) -> Total 3 readings (92, 128, 142 -> avg: 120.7)
    // - Edge case: January 2026 selected date (2026-01-10) with previous month readings in Dec 2025:
    //     - 2025-12-15: 100
    //     - 2025-12-31: 150
    // - Leap year edge case: March 2024 selected date (2024-03-05) with previous month in Feb 2024:
    //     - 2024-02-29: 110 (on leap day)
    await prisma.reading.createMany({
      data: [
        // 2026-05-15 (Daily target)
        { userId: userReport.id, value: 90, slot: Slot.MORNING_FASTING, recordedDate: parseDateOnly("2026-05-15") },
        { userId: userReport.id, value: 135, slot: Slot.AFTER_BREAKFAST, recordedDate: parseDateOnly("2026-05-15") },
        { userId: userReport.id, value: 145, slot: Slot.AFTER_DINNER, recordedDate: parseDateOnly("2026-05-15") },

        // Earlier in May (MTD)
        { userId: userReport.id, value: 85, slot: Slot.MORNING_FASTING, recordedDate: parseDateOnly("2026-05-01") },
        { userId: userReport.id, value: 160, slot: Slot.AFTER_LUNCH, recordedDate: parseDateOnly("2026-05-10") },

        // Later in May (After selected date 2026-05-15, must be excluded from MTD)
        { userId: userReport.id, value: 210, slot: Slot.AFTER_DINNER, recordedDate: parseDateOnly("2026-05-20") },

        // Previous month (April 2026)
        { userId: userReport.id, value: 92, slot: Slot.MORNING_FASTING, recordedDate: parseDateOnly("2026-04-05") },
        { userId: userReport.id, value: 128, slot: Slot.AFTER_LUNCH, recordedDate: parseDateOnly("2026-04-18") },
        { userId: userReport.id, value: 142, slot: Slot.AFTER_DINNER, recordedDate: parseDateOnly("2026-04-30") },

        // Year boundary (December 2025 for Jan 2026)
        { userId: userReport.id, value: 100, slot: Slot.MORNING_FASTING, recordedDate: parseDateOnly("2025-12-15") },
        { userId: userReport.id, value: 150, slot: Slot.AFTER_DINNER, recordedDate: parseDateOnly("2025-12-31") },

        // Leap day (Feb 29, 2024 for March 2024)
        { userId: userReport.id, value: 110, slot: Slot.AFTER_BREAKFAST, recordedDate: parseDateOnly("2024-02-29") },
      ],
    });
  });

  afterAll(async () => {
    if (userReport?.id && userEmpty?.id) {
      await prisma.reading.deleteMany({
        where: { userId: { in: [userReport.id, userEmpty.id] } },
      });
      await prisma.user.deleteMany({
        where: { id: { in: [userReport.id, userEmpty.id] } },
      });
    }
    await prisma.$disconnect();
  });

  describe("1. GET /api/reports/daily", () => {
    it("calculates accurate daily statistics (min, max, average to 1 decimal) and groups by slot", async () => {
      const res = await request(app)
        .get("/api/reports/daily?date=2026-05-15")
        .set("Cookie", [cookieReport]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const { data } = res.body;
      expect(data.date).toBe("2026-05-15");
      expect(data.hasReadings).toBe(true);

      // Summary
      expect(data.summary.totalLogged).toBe(3);
      expect(data.summary.totalSlots).toBe(4);
      expect(data.summary.completionRate).toBe(75); // 3 out of 4 = 75%
      // Average of 90, 135, 145 is 370 / 3 = 123.333... -> 123.3
      expect(data.summary.average).toBe(123.3);
      expect(data.summary.min).toBe(90);
      expect(data.summary.max).toBe(145);
      expect(data.summary.unit).toBe("mg/dL");

      // Slot breakdown (all 4 slots present)
      expect(data.slots).toHaveLength(4);
      const fasting = data.slots.find((s: any) => s.slot === "MORNING_FASTING");
      expect(fasting.logged).toBe(true);
      expect(fasting.reading.value).toBe(90);

      const lunch = data.slots.find((s: any) => s.slot === "AFTER_LUNCH");
      expect(lunch.logged).toBe(false);
      expect(lunch.reading).toBeNull();
    });

    it("returns clean empty state for days with no readings", async () => {
      const res = await request(app)
        .get("/api/reports/daily?date=2026-05-02")
        .set("Cookie", [cookieReport]);

      expect(res.status).toBe(200);
      const { data } = res.body;
      expect(data.hasReadings).toBe(false);
      expect(data.summary.totalLogged).toBe(0);
      expect(data.summary.average).toBeNull();
      expect(data.summary.min).toBeNull();
      expect(data.summary.max).toBeNull();
      expect(data.summary.completionRate).toBe(0);
      expect(data.slots.every((s: any) => s.logged === false)).toBe(true);
    });

    it("rejects future dates with 400 Bad Request", async () => {
      const res = await request(app)
        .get("/api/reports/daily?date=2099-01-01")
        .set("Cookie", [cookieReport]);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/future/i);
    });
  });

  describe("2. GET /api/reports/month-to-date", () => {
    it("respects MTD boundary: includes May 1 to May 15 inclusive, excluding May 20", async () => {
      const res = await request(app)
        .get("/api/reports/month-to-date?date=2026-05-15")
        .set("Cookie", [cookieReport]);

      expect(res.status).toBe(200);
      const { data } = res.body;

      expect(data.period.startDate).toBe("2026-05-01");
      expect(data.period.endDate).toBe("2026-05-15");
      expect(data.period.totalDays).toBe(15);
      expect(data.period.expectedReadings).toBe(60); // 15 days * 4 slots

      // Exactly 5 readings in range: 85 (May 1), 160 (May 10), 90, 135, 145 (May 15)
      // Reading on May 20 (210) MUST be excluded!
      expect(data.summary.totalReadings).toBe(5);
      // (85 + 160 + 90 + 135 + 145) = 615 / 5 = 123.0
      expect(data.summary.average).toBe(123);
      expect(data.summary.min.value).toBe(85);
      expect(data.summary.min.recordedDate).toBe("2026-05-01");
      expect(data.summary.max.value).toBe(160);
      expect(data.summary.max.recordedDate).toBe("2026-05-10");
      expect(data.summary.daysWithReadings).toBe(3); // May 1, May 10, May 15
    });

    it("returns clean empty state when user has 0 readings in the month", async () => {
      const res = await request(app)
        .get("/api/reports/month-to-date?date=2026-05-15")
        .set("Cookie", [cookieEmpty]);

      expect(res.status).toBe(200);
      const { data } = res.body;
      expect(data.hasReadings).toBe(false);
      expect(data.summary.totalReadings).toBe(0);
      expect(data.summary.average).toBeNull();
      expect(data.summary.min).toBeNull();
      expect(data.summary.max).toBeNull();
    });
  });

  describe("3. GET /api/reports/previous-month", () => {
    it("calculates entire preceding calendar month (April 2026 for selected date May 2026)", async () => {
      const res = await request(app)
        .get("/api/reports/previous-month?date=2026-05-15")
        .set("Cookie", [cookieReport]);

      expect(res.status).toBe(200);
      const { data } = res.body;

      expect(data.period.startDate).toBe("2026-04-01");
      expect(data.period.endDate).toBe("2026-04-30");
      expect(data.period.monthName).toBe("April 2026");
      expect(data.period.totalDays).toBe(30);

      // Readings: 92, 128, 142 -> 362 / 3 = 120.666... -> 120.7
      expect(data.summary.totalReadings).toBe(3);
      expect(data.summary.average).toBe(120.7);
      expect(data.summary.min.value).toBe(92);
      expect(data.summary.max.value).toBe(142);
    });

    it("handles year transition boundary (January 2026 -> December 2025)", async () => {
      const res = await request(app)
        .get("/api/reports/previous-month?date=2026-01-10")
        .set("Cookie", [cookieReport]);

      expect(res.status).toBe(200);
      const { data } = res.body;

      expect(data.period.startDate).toBe("2025-12-01");
      expect(data.period.endDate).toBe("2025-12-31");
      expect(data.period.year).toBe(2025);
      expect(data.period.month).toBe(12);
      expect(data.period.monthName).toBe("December 2025");

      // 2 readings: 100, 150 -> avg: 125.0
      expect(data.summary.totalReadings).toBe(2);
      expect(data.summary.average).toBe(125);
    });

    it("handles leap year February calculation (March 2024 -> February 2024, 29 days)", async () => {
      const res = await request(app)
        .get("/api/reports/previous-month?date=2024-03-05")
        .set("Cookie", [cookieReport]);

      expect(res.status).toBe(200);
      const { data } = res.body;

      expect(data.period.startDate).toBe("2024-02-01");
      expect(data.period.endDate).toBe("2024-02-29"); // Leap day!
      expect(data.period.totalDays).toBe(29);
      expect(data.summary.totalReadings).toBe(1);
      expect(data.summary.average).toBe(110);
    });
  });

  describe("4. Security & Multi-Tenant Isolation", () => {
    it("ensures reports never leak data across users", async () => {
      // Empty user requests reports for May 2026 where Report user has data
      const resDaily = await request(app)
        .get("/api/reports/daily?date=2026-05-15")
        .set("Cookie", [cookieEmpty]);
      expect(resDaily.body.data.summary.totalLogged).toBe(0);

      const resMtd = await request(app)
        .get("/api/reports/month-to-date?date=2026-05-15")
        .set("Cookie", [cookieEmpty]);
      expect(resMtd.body.data.summary.totalReadings).toBe(0);

      const resPrev = await request(app)
        .get("/api/reports/previous-month?date=2026-05-15")
        .set("Cookie", [cookieEmpty]);
      expect(resPrev.body.data.summary.totalReadings).toBe(0);
    });

    it("rejects unauthenticated requests to all reporting endpoints with 401 Unauthorized", async () => {
      const resDaily = await request(app).get("/api/reports/daily");
      expect(resDaily.status).toBe(401);

      const resMtd = await request(app).get("/api/reports/month-to-date");
      expect(resMtd.status).toBe(401);

      const resPrev = await request(app).get("/api/reports/previous-month");
      expect(resPrev.status).toBe(401);
    });
  });
});

