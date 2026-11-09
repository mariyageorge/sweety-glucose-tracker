import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma.js";
import { parseDateOnly, formatDateOnly } from "../utils/date.js";
import { CreateReadingInput, UpdateReadingInput } from "../schemas/reading.schema.js";

/**
 * Blood Glucose Reading Controller
 * 
 * CORE ARCHITECTURAL & BUSINESS RULES:
 * 1. Zero Trust / Multi-Tenant Isolation: Every query is strictly scoped to `userId: req.user!.id`.
 *    A user can never view, update, or delete another user's reading.
 * 2. 404 on Missing / Foreign Records: If a reading does not belong to the user, we return 404
 *    rather than 403 to prevent resource enumeration attacks.
 * 3. 409 on Duplicate Slots: Max 1 reading per slot per day. Attempts to log a duplicate slot
 *    on the same day return HTTP 409 Conflict.
 * 4. Value Boundaries: Whole numbers between 40 and 600 mg/dL.
 * 5. Future Date Protection: Future calendar dates are rejected.
 * 6. Deterministic Slot Sorting: Readings on the same date are sorted chronologically:
 *    Morning (fasting) -> After breakfast -> After lunch -> After dinner.
 */

const SLOT_SEQUENCE: Record<string, number> = {
  MORNING_FASTING: 1,
  AFTER_BREAKFAST: 2,
  AFTER_LUNCH: 3,
  AFTER_DINNER: 4,
};

export async function createReading(
  req: Request<{}, {}, CreateReadingInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { value, slot, recordedDate, notes } = req.body;
    const dateObj = parseDateOnly(recordedDate);

    // 1. Proactive slot collision check for friendly error message
    const existingReading = await prisma.reading.findFirst({
      where: {
        userId,
        recordedDate: dateObj,
        slot,
      },
    });

    if (existingReading) {
      res.status(409).json({
        success: false,
        error: `A reading for slot '${slot}' on ${recordedDate} has already been recorded. Each slot can only have one reading per day.`,
      });
      return;
    }

    // 2. Persist new reading
    const reading = await prisma.reading.create({
      data: {
        userId,
        value,
        slot,
        recordedDate: dateObj,
        notes: notes || null,
      },
    });

    res.status(201).json({
      success: true,
      message: "Blood glucose reading recorded successfully.",
      data: {
        id: reading.id,
        userId: reading.userId,
        value: reading.value,
        slot: reading.slot,
        recordedDate: formatDateOnly(reading.recordedDate),
        notes: reading.notes,
        createdAt: reading.createdAt,
        updatedAt: reading.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getReadings(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const dateFilter = (req.query.recordedDate || req.query.date) as string | undefined;

    const whereClause: any = { userId };

    if (dateFilter) {
      whereClause.recordedDate = parseDateOnly(dateFilter);
    }

    const readings = await prisma.reading.findMany({
      where: whereClause,
      orderBy: [
        { recordedDate: "desc" },
        { createdAt: "asc" },
      ],
    });

    // Consistent chronological sort by date (desc) and slot (asc: fasting -> breakfast -> lunch -> dinner)
    readings.sort((a, b) => {
      const dateComparison = b.recordedDate.getTime() - a.recordedDate.getTime();
      if (dateComparison !== 0) return dateComparison;
      return (SLOT_SEQUENCE[a.slot] || 0) - (SLOT_SEQUENCE[b.slot] || 0);
    });

    const formatted = readings.map((r) => ({
      id: r.id,
      userId: r.userId,
      value: r.value,
      slot: r.slot,
      recordedDate: formatDateOnly(r.recordedDate),
      notes: r.notes,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (err) {
    next(err);
  }
}

export async function getReadingById(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // Strict multi-tenant query: must belong to the authenticated user
    const reading = await prisma.reading.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!reading) {
      res.status(404).json({
        success: false,
        error: "Blood glucose reading not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: reading.id,
        userId: reading.userId,
        value: reading.value,
        slot: reading.slot,
        recordedDate: formatDateOnly(reading.recordedDate),
        notes: reading.notes,
        createdAt: reading.createdAt,
        updatedAt: reading.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateReading(
  req: Request<{ id: string }, {}, UpdateReadingInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { value, slot, recordedDate, notes } = req.body;

    // 1. Strict multi-tenant verification: reading must exist and belong to this user
    const existing = await prisma.reading.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: "Blood glucose reading not found.",
      });
      return;
    }

    // 2. If recordedDate or slot is being changed, verify no collision with another reading
    const targetDateObj = recordedDate ? parseDateOnly(recordedDate) : existing.recordedDate;
    const targetSlot = slot || existing.slot;

    if (recordedDate !== undefined || slot !== undefined) {
      const collision = await prisma.reading.findFirst({
        where: {
          userId,
          recordedDate: targetDateObj,
          slot: targetSlot,
          id: { not: id }, // Exclude current reading being updated
        },
      });

      if (collision) {
        res.status(409).json({
          success: false,
          error: `Cannot update reading: A reading for slot '${targetSlot}' on ${formatDateOnly(targetDateObj)} already exists.`,
        });
        return;
      }
    }

    // 3. Perform update
    const updated = await prisma.reading.update({
      where: { id },
      data: {
        ...(value !== undefined ? { value } : {}),
        ...(slot !== undefined ? { slot } : {}),
        ...(recordedDate !== undefined ? { recordedDate: targetDateObj } : {}),
        ...(notes !== undefined ? { notes: notes || null } : {}),
      },
    });

    res.status(200).json({
      success: true,
      message: "Blood glucose reading updated successfully.",
      data: {
        id: updated.id,
        userId: updated.userId,
        value: updated.value,
        slot: updated.slot,
        recordedDate: formatDateOnly(updated.recordedDate),
        notes: updated.notes,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteReading(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // Strict multi-tenant check before deletion
    const existing = await prisma.reading.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: "Blood glucose reading not found.",
      });
      return;
    }

    await prisma.reading.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Blood glucose reading deleted successfully.",
    });
  } catch (err) {
    next(err);
  }
}
