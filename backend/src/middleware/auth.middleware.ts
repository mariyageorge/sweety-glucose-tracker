import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AUTH_COOKIE_NAME, JwtPayload } from "../utils/token.js";

/**
 * Authentication Middleware
 * 
 * DESIGN DECISION EXPLAINED:
 * 1. Reads the JWT primarily from the secure HttpOnly cookie.
 * 2. As an industry-standard testing convenience, also accepts `Authorization: Bearer <token>`.
 * 3. Never trusts `userId` from request body or query params — identity is ALWAYS extracted
 *    from the verified, cryptographically signed token payload.
 * 4. Rejects missing, tampered, or expired tokens with HTTP 401 Unauthorized.
 */
export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // 1. Extract token from HttpOnly cookie or Authorization header
  let token = req.cookies?.[AUTH_COOKIE_NAME];

  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(" ");
    if (parts.length === 2 && parts[0] === "Bearer") {
      token = parts[1];
    }
  }

  if (!token) {
    res.status(401).json({
      success: false,
      error: "Authentication required. Please log in.",
    });
    return;
  }

  // 2. Verify token signature and expiration
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    if (!decoded || !decoded.userId) {
      res.status(401).json({
        success: false,
        error: "Invalid token payload.",
      });
      return;
    }

    // Attach authenticated identity to req.user
    req.user = {
      id: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (err: any) {
    const isExpired = err.name === "TokenExpiredError";
    res.status(401).json({
      success: false,
      error: isExpired
        ? "Session expired. Please log in again."
        : "Invalid authentication token. Please log in.",
    });
  }
}

