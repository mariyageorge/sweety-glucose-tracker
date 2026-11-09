import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { generateToken, setAuthCookie, clearAuthCookie } from "../utils/token.js";
import { SignupInput, LoginInput } from "../schemas/auth.schema.js";

/**
 * Authentication Controller
 * 
 * SECURITY BEST PRACTICES:
 * 1. Password hashing with bcrypt cost factor of 10.
 * 2. Prisma queries explicitly use `select` to exclude `password` from the retrieved user object.
 * 3. Identical generic error message ("Invalid email or password") for both non-existent users
 *    and wrong passwords to prevent user enumeration attacks.
 * 4. Tokens are stored in HttpOnly cookies to defend against XSS token theft.
 */

export async function signup(
  req: Request<{}, {}, SignupInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, email, password } = req.body;

    // 1. Check if email is already in use
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        error: "An account with this email address already exists.",
      });
      return;
    }

    // 2. Hash password with bcrypt cost factor 10
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. Create user in PostgreSQL (never select password in response)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    // 4. Issue JWT inside an HttpOnly cookie
    const token = generateToken({ userId: user.id, email: user.email });
    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      data: user,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(
  req: Request<{}, {}, LoginInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body;

    // 1. Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // 2. If user doesn't exist, return generic error (prevents username enumeration)
    if (!user) {
      res.status(401).json({
        success: false,
        error: "Invalid email or password.",
      });
      return;
    }

    // 3. Compare password with bcrypt hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: "Invalid email or password.",
      });
      return;
    }

    // 4. Issue JWT inside an HttpOnly cookie
    const token = generateToken({ userId: user.id, email: user.email });
    setAuthCookie(res, token);

    // 5. Return sanitized user profile
    res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

export function logout(_req: Request, res: Response): void {
  clearAuthCookie(res);
  res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
}

export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        error: "Authentication required.",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: "User account not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
}

