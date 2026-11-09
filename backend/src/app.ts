import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import readingRoutes from "./routes/reading.routes.js";
import reportRoutes from "./routes/report.routes.js";

/**
 * Express Application Configuration
 * 
 * DESIGN DECISION EXPLAINED:
 * Separating Express app initialization (`app.ts`) from server listen (`server.ts`)
 * is an industry best practice.
 * It allows integration test suites (Supertest/Vitest) to import `app` and execute
 * fast in-memory HTTP requests without binding to a physical network port.
 */
export function createApp(): Application {
  const app: Application = express();

  // 1. Cross-Origin Resource Sharing (CORS) configured for frontend with credentials
  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true, // Required for HttpOnly session cookies
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // 2. Cookie parser for extracting HttpOnly JWTs
  app.use(cookieParser());

  // 3. Body parsing middleware
  app.use(express.json());

  // 4. Root & Health Check Endpoints
  app.get("/", (_req: Request, res: Response) => {
    res.status(200).json({
      name: "Sweety API - Blood Glucose Tracker",
      status: "online",
      health: "/api/health",
      version: "1.0.0",
    });
  });

  app.get("/api/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: "ok" });
  });

  // 5. Authentication, Reading & Report Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/readings", readingRoutes);
  app.use("/api/reports", reportRoutes);

  // 6. Centralized Error Handling Middleware (must be after all routes)
  app.use(errorHandler);

  return app;
}

export const app = createApp();

