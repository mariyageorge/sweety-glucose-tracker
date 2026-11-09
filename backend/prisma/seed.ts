import { PrismaClient, Slot } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Seed script for Sweety
 * 
 * Creates:
 * 1. Demo User: demo@sweety.app / Password123!
 *    - Has full readings across current month and previous month for realistic reports.
 * 2. Secondary User: test@sweety.app / Password123!
 *    - Has isolated readings to verify multi-tenant data isolation.
 * 
 * IMPORTANT FOR A FRESHER:
 * We use `upsert` so running `prisma db seed` multiple times is idempotent (does not fail
 * with duplicate key errors).
 */

async function main() {
  console.log("🌱 Starting Sweety database seed...");

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash("Password123!", saltRounds);

  // 1. Create or update Demo User
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@sweety.app" },
    update: { password: hashedPassword },
    create: {
      email: "demo@sweety.app",
      name: "Demo Patient",
      password: hashedPassword,
    },
  });
  console.log(`👤 Demo User ready: ${demoUser.email} (ID: ${demoUser.id})`);

  // 2. Create or update Secondary User (to verify authorization boundaries)
  const testUser = await prisma.user.upsert({
    where: { email: "test@sweety.app" },
    update: { password: hashedPassword },
    create: {
      email: "test@sweety.app",
      name: "Test User Two",
      password: hashedPassword,
    },
  });
  console.log(`👤 Secondary User ready: ${testUser.email} (ID: ${testUser.id})`);

  // Clear existing readings for clean seed rerun
  await prisma.reading.deleteMany({
    where: { userId: { in: [demoUser.id, testUser.id] } },
  });

  const slots: Slot[] = [
    Slot.MORNING_FASTING,
    Slot.AFTER_BREAKFAST,
    Slot.AFTER_LUNCH,
    Slot.AFTER_DINNER,
  ];

  // Helper to generate a realistic glucose reading based on slot
  function generateGlucose(slot: Slot): number {
    switch (slot) {
      case Slot.MORNING_FASTING:
        // Fasting readings typically range 75 - 110 mg/dL
        return Math.floor(80 + Math.random() * 30);
      case Slot.AFTER_BREAKFAST:
        // Post-breakfast typically 110 - 155 mg/dL
        return Math.floor(115 + Math.random() * 40);
      case Slot.AFTER_LUNCH:
        // Post-lunch typically 110 - 160 mg/dL
        return Math.floor(110 + Math.random() * 50);
      case Slot.AFTER_DINNER:
        // Post-dinner typically 120 - 165 mg/dL
        return Math.floor(120 + Math.random() * 45);
    }
  }

  const readingsData = [];

  // Seed last 45 days up to today (covering previous month and current month-to-date)
  const today = new Date();
  
  for (let daysAgo = 45; daysAgo >= 0; daysAgo--) {
    const targetDate = new Date();
    targetDate.setDate(today.getDate() - daysAgo);

    // Format YYYY-MM-DD
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, "0");
    const day = String(targetDate.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    // Construct midnight UTC Date for PostgreSQL DATE type
    const dateObj = new Date(Date.UTC(year, targetDate.getMonth(), targetDate.getDate()));

    // For today, populate only the first 2 or 3 slots to demonstrate partial day completion
    const slotsToSeed = daysAgo === 0 ? slots.slice(0, 2) : slots;

    for (const slot of slotsToSeed) {
      readingsData.push({
        userId: demoUser.id,
        slot,
        value: generateGlucose(slot),
        recordedDate: dateObj,
        notes: daysAgo % 7 === 0 ? `Routine check on ${dateStr}` : null,
      });
    }
  }

  // Also seed 2 readings for testUser on today
  const todayDateObj = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  readingsData.push(
    {
      userId: testUser.id,
      slot: Slot.MORNING_FASTING,
      value: 95,
      recordedDate: todayDateObj,
      notes: "Test user private reading",
    },
    {
      userId: testUser.id,
      slot: Slot.AFTER_BREAKFAST,
      value: 130,
      recordedDate: todayDateObj,
      notes: null,
    }
  );

  await prisma.reading.createMany({
    data: readingsData,
  });

  console.log(`✅ Seed completed! Inserted ${readingsData.length} readings across demo accounts.`);
  console.log("   Credentials:");
  console.log("   - Demo User: demo@sweety.app / Password123!");
  console.log("   - Test User: test@sweety.app / Password123!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

