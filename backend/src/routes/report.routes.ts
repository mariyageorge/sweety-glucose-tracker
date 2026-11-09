import { Router } from "express";
import {
  getDailyReport,
  getMonthToDateReport,
  getPreviousMonthReport,
} from "../controllers/report.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

// All report endpoints require authentication
router.use(authenticateToken);

router.get("/daily", getDailyReport);
router.get("/month-to-date", getMonthToDateReport);
router.get("/previous-month", getPreviousMonthReport);

export default router;
