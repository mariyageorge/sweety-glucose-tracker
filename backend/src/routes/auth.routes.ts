import { Router } from "express";
import { signup, login, logout, getMe } from "../controllers/auth.controller.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { signupSchema, loginSchema } from "../schemas/auth.schema.js";

const router = Router();

// Public routes
router.post("/signup", validateBody(signupSchema), signup);
router.post("/login", validateBody(loginSchema), login);
router.post("/logout", logout);

// Protected routes (requires valid HttpOnly JWT cookie)
router.get("/me", authenticateToken, getMe);

export default router;

