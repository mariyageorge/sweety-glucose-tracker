import { Router } from "express";
import {
  createReading,
  getReadings,
  getReadingById,
  updateReading,
  deleteReading,
} from "../controllers/reading.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { validateBody, validateQuery } from "../middleware/validate.middleware.js";
import {
  createReadingSchema,
  updateReadingSchema,
  getReadingsQuerySchema,
} from "../schemas/reading.schema.js";

const router = Router();

// All reading endpoints require authentication
router.use(authenticateToken);

// Reading CRUD endpoints
router.post("/", validateBody(createReadingSchema), createReading);
router.get("/", validateQuery(getReadingsQuerySchema), getReadings);
router.get("/:id", getReadingById);
router.patch("/:id", validateBody(updateReadingSchema), updateReading);
router.put("/:id", validateBody(updateReadingSchema), updateReading);
router.delete("/:id", deleteReading);

export default router;
