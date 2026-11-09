import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient, Slot } from "@prisma/client";

const prisma = new PrismaClient();

describe("Database Connection & Schema Verification", () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("successfully connects to PostgreSQL database", async () => {
    const result = await prisma.$queryRaw<Array<{ current_database: string }>>`
      SELECT current_database();
    `;
    expect(result).toHaveLength(1);
    expect(result[0].current_database).toBe("sweety_db");
  });

  it("finds the seeded demo user", async () => {
    const demoUser = await prisma.user.findUnique({
      where: { email: "demo@sweety.app" },
    });
    expect(demoUser).toBeDefined();
    expect(demoUser?.name).toBe("Demo Patient");
    expect(demoUser?.email).toBe("demo@sweety.app");
    // Password hash should start with $2a$ or $2b$ (bcrypt)
    expect(demoUser?.password.startsWith("$2")).toBe(true);
  });

  it("has seeded readings with proper slot and date types", async () => {
    const demoUser = await prisma.user.findUnique({
      where: { email: "demo@sweety.app" },
    });
    const readings = await prisma.reading.findMany({
      where: { userId: demoUser!.id },
      take: 5,
    });
    expect(readings.length).toBeGreaterThan(0);
    const reading = readings[0];
    expect(reading.value).toBeGreaterThanOrEqual(40);
    expect(reading.value).toBeLessThanOrEqual(600);
    expect(Object.values(Slot)).toContain(reading.slot);
    expect(reading.recordedDate).toBeInstanceOf(Date);
  });

  it("enforces unique constraint on [userId, recordedDate, slot]", async () => {
    const testUser = await prisma.user.findUnique({
      where: { email: "test@sweety.app" },
    });

    const fixedDate = new Date(Date.UTC(2026, 0, 15)); // 2026-01-15

    // Delete if existing from a previous test run
    await prisma.reading.deleteMany({
      where: {
        userId: testUser!.id,
        recordedDate: fixedDate,
        slot: Slot.MORNING_FASTING,
      },
    });

    // 1st insert should succeed
    const firstReading = await prisma.reading.create({
      data: {
        userId: testUser!.id,
        value: 105,
        slot: Slot.MORNING_FASTING,
        recordedDate: fixedDate,
      },
    });
    expect(firstReading.id).toBeDefined();

    // 2nd insert with identical user, date, and slot MUST throw P2002 error
    await expect(
      prisma.reading.create({
        data: {
          userId: testUser!.id,
          value: 120,
          slot: Slot.MORNING_FASTING,
          recordedDate: fixedDate,
        },
      })
    ).rejects.toThrow();

    // Clean up test reading
    await prisma.reading.delete({
      where: { id: firstReading.id },
    });
  });
});

