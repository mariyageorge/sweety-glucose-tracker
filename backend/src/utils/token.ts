import { Response, CookieOptions } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const AUTH_COOKIE_NAME = "jwt";

export interface JwtPayload {
  userId: string;
  email: string;
}

/**
 * Standard Cookie Options
 * 
 * DESIGN DECISION EXPLAINED:
 * 1. `httpOnly: true` prevents client-side scripts from reading the token (XSS protection).
 * 2. `sameSite: "lax"` provides strong CSRF protection while permitting top-level navigations.
 * 3. `secure: true` in production ensures cookies travel exclusively across HTTPS.
 * 4. `path: "/"` ensures authentication applies to all API routes.
 */
export const getCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
});

/**
 * Generates a signed JWT with user identity payload.
 */
export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

/**
 * Sets the signed JWT inside an HttpOnly cookie on the response.
 */
export function setAuthCookie(res: Response, token: string): void {
  res.cookie(AUTH_COOKIE_NAME, token, getCookieOptions());
}

/**
 * Clears the authentication cookie on logout.
 */
export function clearAuthCookie(res: Response): void {
  const options = getCookieOptions();
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: options.httpOnly,
    secure: options.secure,
    sameSite: options.sameSite,
    path: options.path,
  });
}

