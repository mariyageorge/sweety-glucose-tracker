import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { prisma } from "../src/config/prisma.js";
import { generateToken, AUTH_COOKIE_NAME } from "../src/utils/token.js";
import { formatDateOnly } from "../src/utils/date.js";

describe("Glucose Reading CRUD API (/api/readings)", () => {
  let userA: { id: string; email: string };
  let userB: { id: string; email: string };
  let cookieA: string;
  let cookieB: string;

  const testDate = "2026-11-01"; // Safe past date
  let readingAId: string;
  let readingLunchAId: string;

  beforeAll(async () => {
    // 1. Create User A and User B
    const emailA = `crud_user_a_${Date.now()}@sweety.app`;
    const emailB = `crud_user_b_${Date.now()}@sweety.app`;

    const bcrypt = await import("bcryptjs");
    const passwordHash = await bcrypt.hash("Password123!", 10);

    userA = await prisma.user.create({
      data: { name: "Patient Alpha", email: emailA, password: passwordHash },
      select: { id: true, email: true },
    });

    userB = await prisma.user.create({
      data: { name: "Patient Beta", email: emailB, password: passwordHash },
      select: { id: true, email: true },
    });

    // 2. Generate HttpOnly cookies
    const tokenA = generateToken({ userId: userA.id, email: userA.email });
    const tokenB = generateToken({ userId: userB.id, email: userB.email });

    cookieA = `${AUTH_COOKIE_NAME}=${tokenA}`;
    cookieB = `${AUTH_COOKIE_NAME}=${tokenB}`;
  });

  afterAll(async () => {
    // Clean up test data
    if (userA?.id && userB?.id) {
      await prisma.reading.deleteMany({
        where: { userId: { in: [userA.id, userB.id] } },
      });
      await prisma.user.deleteMany({
        where: { id: { in: [userA.id, userB.id] } },
      });
    }
    await prisma.$disconnect();
  });

  describe("1. POST /api/readings — Creation & Validation", () => {
    it("creates a valid glucose reading successfully", async () => {
      const res = await request(app)
        .post("/api/readings")
        .set("Cookie", [cookieA])
        .send({
          value: 95,
          slot: "MORNING_FASTING",
          recordedDate: testDate,
          notes: "Woke up feeling good",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.value).toBe(95);
      expect(res.body.data.slot).toBe("MORNING_FASTING");
      expect(res.body.data.recordedDate).toBe(testDate);
      expect(res.body.data.notes).toBe("Woke up feeling good");

      readingAId = res.body.data.id;
    });

    it("rejects glucose value below 40 mg/dL with 400 Bad Request", async () => {
      const res = await request(app)
        .post("/api/readings")
        .set("Cookie", [cookieA])
        .send({
          value: 39,
          slot: "AFTER_BREAKFAST",
          recordedDate: testDate,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(JSON.stringify(res.body.details)).toMatch(/cannot be below 40/i);
    });

    it("rejects glucose value above 600 mg/dL with 400 Bad Request", async () => {
      const res = await request(app)
        .post("/api/readings")
        .set("Cookie", [cookieA])
        .send({
          value: 601,
          slot: "AFTER_BREAKFAST",
          recordedDate: testDate,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(JSON.stringify(res.body.details)).toMatch(/cannot exceed 600/i);
    });

    it("rejects decimal glucose values with 400 Bad Request", async () => {
      const res = await request(app)
        .post("/api/readings")
        .set("Cookie", [cookieA])
        .send({
          value: 110.5,
          slot: "AFTER_BREAKFAST",
          recordedDate: testDate,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(JSON.stringify(res.body.details)).toMatch(/whole number/i);
    });

    it("rejects missing glucose value with 400 Bad Request", async () => {
      const res = await request(app)
        .post("/api/readings")
        .set("Cookie", [cookieA])
        .send({
          slot: "AFTER_BREAKFAST",
          recordedDate: testDate,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("rejects invalid slot enum value with 400 Bad Request", async () => {
      const res = await request(app)
        .post("/api/readings")
        .set("Cookie", [cookieA])
        .send({
          value: 120,
          slot: "MIDNIGHT_SNACK",
          recordedDate: testDate,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(JSON.stringify(res.body.details)).toMatch(/Slot must be one of/i);
    });

    it("rejects future dates with 400 Bad Request", async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = formatDateOnly(tomorrow);

      const res = await request(app)
        .post("/api/readings")
        .set("Cookie", [cookieA])
        .send({
          value: 115,
          slot: "AFTER_BREAKFAST",
          recordedDate: tomorrowStr,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(JSON.stringify(res.body.details)).toMatch(/Future dates are not allowed/i);
    });

    it("rejects duplicate slot on same date for the same user with 409 Conflict", async () => {
      const res = await request(app)
        .post("/api/readings")
        .set("Cookie", [cookieA])
        .send({
          value: 100,
          slot: "MORNING_FASTING", // Already logged earlier
          recordedDate: testDate,
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/already been recorded/i);
    });

    it("allows logging all 4 distinct slots on the same date", async () => {
      // 2nd slot: AFTER_BREAKFAST
      const resBreakfast = await request(app)
        .post("/api/readings")
        .set("Cookie", [cookieA])
        .send({
          value: 135,
          slot: "AFTER_BREAKFAST",
          recordedDate: testDate,
        });
      expect(resBreakfast.status).toBe(201);

      // 3rd slot: AFTER_LUNCH
      const resLunch = await request(app)
        .post("/api/readings")
        .set("Cookie", [cookieA])
        .send({
          value: 140,
          slot: "AFTER_LUNCH",
          recordedDate: testDate,
        });
      expect(resLunch.status).toBe(201);
      readingLunchAId = resLunch.body.data.id;

      // 4th slot: AFTER_DINNER
      const resDinner = await request(app)
        .post("/api/readings")
        .set("Cookie", [cookieA])
        .send({
          value: 145,
          slot: "AFTER_DINNER",
          recordedDate: testDate,
        });
      expect(resDinner.status).toBe(201);
    });

    it("enforces a strict maximum of four readings per day", async () => {
      // Attempting any 5th reading on testDate must fail because all 4 slots are occupied
      const res5th = await request(app)
        .post("/api/readings")
        .set("Cookie", [cookieA])
        .send({
          value: 160,
          slot: "AFTER_DINNER",
          recordedDate: testDate,
        });

      expect(res5th.status).toBe(409);
      expect(res5th.body.success).toBe(false);

      // Verify total count for testDate is exactly 4
      const listRes = await request(app)
        .get(`/api/readings?date=${testDate}`)
        .set("Cookie", [cookieA]);

      expect(listRes.body.count).toBe(4);
    });
  });

  describe("2. GET /api/readings — Multi-Tenant Isolation & Filtering", () => {
    beforeAll(async () => {
      // User B logs 1 reading on testDate
      await request(app)
        .post("/api/readings")
        .set("Cookie", [cookieB])
        .send({
          value: 105,
          slot: "MORNING_FASTING",
          recordedDate: testDate,
          notes: "User B private check",
        });
    });

    it("lists only the authenticated user's readings", async () => {
      const resA = await request(app)
        .get(`/api/readings?date=${testDate}`)
        .set("Cookie", [cookieA]);

      expect(resA.status).toBe(200);
      expect(resA.body.count).toBe(4);
      resA.body.data.forEach((r: any) => {
        expect(r.userId).toBe(userA.id);
      });

      const resB = await request(app)
        .get(`/api/readings?date=${testDate}`)
        .set("Cookie", [cookieB]);

      expect(resB.status).toBe(200);
      expect(resB.body.count).toBe(1);
      expect(resB.body.data[0].userId).toBe(userB.id);
      expect(resB.body.data[0].notes).toBe("User B private check");
    });

    it("sorts readings chronologically by slot within the same date", async () => {
      const res = await request(app)
        .get(`/api/readings?date=${testDate}`)
        .set("Cookie", [cookieA]);

      const slots = res.body.data.map((r: any) => r.slot);
      expect(slots).toEqual([
        "MORNING_FASTING",
        "AFTER_BREAKFAST",
        "AFTER_LUNCH",
        "AFTER_DINNER",
      ]);
    });
  });

  describe("3. GET /api/readings/:id — Ownership & 404 Protection", () => {
    it("returns own reading by ID", async () => {
      const res = await request(app)
        .get(`/api/readings/${readingAId}`)
        .set("Cookie", [cookieA]);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(readingAId);
      expect(res.body.data.value).toBe(95);
    });

    it("returns 404 when requesting another user's reading (prevents data enumeration)", async () => {
      const res = await request(app)
        .get(`/api/readings/${readingAId}`)
        .set("Cookie", [cookieB]);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/not found/i);
    });

    it("returns 404 for nonexistent reading ID", async () => {
      const res = await request(app)
        .get("/api/readings/nonexistent-uuid-1234")
        .set("Cookie", [cookieA]);

      expect(res.status).toBe(404);
    });
  });

  describe("4. PATCH /api/readings/:id — Updates & Conflict Protection", () => {
    it("successfully updates own reading value and notes", async () => {
      const res = await request(app)
        .patch(`/api/readings/${readingAId}`)
        .set("Cookie", [cookieA])
        .send({
          value: 98,
          notes: "Updated after a short walk",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.value).toBe(98);
      expect(res.body.data.notes).toBe("Updated after a short walk");
    });

    it("rejects update when changing slot into an already occupied slot with 409 Conflict", async () => {
      // User A tries to change Lunch reading's slot to MORNING_FASTING (which is already occupied)
      const res = await request(app)
        .patch(`/api/readings/${readingLunchAId}`)
        .set("Cookie", [cookieA])
        .send({
          slot: "MORNING_FASTING",
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/already exists/i);
    });

    it("returns 404 when attempting to update another user's reading", async () => {
      const res = await request(app)
        .patch(`/api/readings/${readingAId}`)
        .set("Cookie", [cookieB])
        .send({
          value: 200,
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe("5. DELETE /api/readings/:id — Deletion & Ownership", () => {
    it("returns 404 when attempting to delete another user's reading", async () => {
      const res = await request(app)
        .delete(`/api/readings/${readingAId}`)
        .set("Cookie", [cookieB]);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("successfully deletes own reading", async () => {
      const res = await request(app)
        .delete(`/api/readings/${readingAId}`)
        .set("Cookie", [cookieA]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify it is no longer retrievable
      const getRes = await request(app)
        .get(`/api/readings/${readingAId}`)
        .set("Cookie", [cookieA]);
      expect(getRes.status).toBe(404);
    });
  });

  describe("6. Unauthenticated Access Protection", () => {
    it("rejects POST /api/readings without auth with 401 Unauthorized", async () => {
      const res = await request(app)
        .post("/api/readings")
        .send({
          value: 100,
          slot: "MORNING_FASTING",
          recordedDate: testDate,
        });

      expect(res.status).toBe(401);
    });

    it("rejects GET /api/readings without auth with 401 Unauthorized", async () => {
      const res = await request(app).get("/api/readings");
      expect(res.status).toBe(401);
    });
  });

  describe("7. Pagination & Query Validation", () => {
    it("supports pagination with page and limit parameters", async () => {
      const res = await request(app)
        .get(`/api/readings?date=${testDate}&page=1&limit=2`)
        .set("Cookie", [cookieA]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.data.length).toBe(2);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(2);
      expect(res.body.pagination.total).toBe(3); // 4 originally created, 1 deleted
      expect(res.body.pagination.totalPages).toBe(2);
      expect(res.body.pagination.hasNextPage).toBe(true);
      expect(res.body.pagination.hasPrevPage).toBe(false);
    });

    it("fetches the second page correctly without duplicate records", async () => {
      const page1 = await request(app)
        .get(`/api/readings?date=${testDate}&page=1&limit=2`)
        .set("Cookie", [cookieA]);

      const page2 = await request(app)
        .get(`/api/readings?date=${testDate}&page=2&limit=2`)
        .set("Cookie", [cookieA]);

      expect(page2.status).toBe(200);
      expect(page2.body.count).toBe(1);
      expect(page2.body.pagination.page).toBe(2);
      expect(page2.body.pagination.hasNextPage).toBe(false);
      expect(page2.body.pagination.hasPrevPage).toBe(true);

      const page1Ids = page1.body.data.map((r: any) => r.id);
      const page2Ids = page2.body.data.map((r: any) => r.id);
      expect(page1Ids).not.toContain(page2Ids[0]);
    });

    it("rejects non-positive page number with 400 Bad Request", async () => {
      const res = await request(app)
        .get("/api/readings?page=0")
        .set("Cookie", [cookieA]);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(JSON.stringify(res.body.details)).toMatch(/at least 1/i);
    });

    it("rejects limit exceeding 100 with 400 Bad Request", async () => {
      const res = await request(app)
        .get("/api/readings?limit=101")
        .set("Cookie", [cookieA]);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(JSON.stringify(res.body.details)).toMatch(/cannot exceed 100/i);
    });

    it("rejects non-integer page with 400 Bad Request", async () => {
      const res = await request(app)
        .get("/api/readings?page=abc")
        .set("Cookie", [cookieA]);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("preserves strict multi-tenant isolation in paginated requests", async () => {
      const resB = await request(app)
        .get(`/api/readings?date=${testDate}&page=1&limit=10`)
        .set("Cookie", [cookieB]);

      expect(resB.status).toBe(200);
      expect(resB.body.pagination.total).toBe(1);
      expect(resB.body.data.length).toBe(1);
      expect(resB.body.data[0].userId).toBe(userB.id);
    });
  });
});

