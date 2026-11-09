import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { prisma } from "../src/config/prisma.js";

describe("Authentication & Security API (/api/auth)", () => {
  const testEmail = `auth_test_${Date.now()}@sweety.app`;
  const testPassword = "SecurePassword123!";
  const testName = "Auth Tester";

  let authCookie: string;

  beforeAll(async () => {
    // Clean up test user if exists from previous test run
    await prisma.user.deleteMany({
      where: { email: testEmail },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: testEmail },
    });
    await prisma.$disconnect();
  });

  describe("POST /api/auth/signup", () => {
    it("1. Successfully registers a new user, sets HttpOnly cookie, and omits password hash", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send({
          name: testName,
          email: testEmail,
          password: testPassword,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.name).toBe(testName);
      expect(res.body.data.email).toBe(testEmail);

      // SECURITY CHECK: password hash must NEVER be present in response
      expect(res.body.data.password).toBeUndefined();
      expect(res.body.password).toBeUndefined();

      // Check HttpOnly JWT cookie was issued
      const cookies = res.headers["set-cookie"];
      expect(cookies).toBeDefined();
      const jwtCookie = Array.isArray(cookies) ? cookies.find((c: string) => c.startsWith("jwt=")) : cookies;
      expect(jwtCookie).toBeDefined();
      expect(jwtCookie).toContain("HttpOnly");
      expect(jwtCookie).toContain("SameSite=Lax");

      authCookie = jwtCookie!.split(";")[0]; // "jwt=eyJhbGci..."
    });

    it("2. Rejects duplicate email registration with 409 Conflict", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send({
          name: "Duplicate User",
          email: testEmail,
          password: "AnotherPassword123!",
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/already exists/i);
    });

    it("3. Rejects invalid signup inputs with 400 Bad Request", async () => {
      // Short password (< 8 chars)
      const resShortPass = await request(app)
        .post("/api/auth/signup")
        .send({
          name: "Short Pass",
          email: "shortpass@sweety.app",
          password: "123",
        });
      expect(resShortPass.status).toBe(400);
      expect(resShortPass.body.success).toBe(false);

      // Invalid email format
      const resInvalidEmail = await request(app)
        .post("/api/auth/signup")
        .send({
          name: "Invalid Email",
          email: "not-an-email",
          password: "ValidPassword123!",
        });
      expect(resInvalidEmail.status).toBe(400);

      // Missing required fields
      const resMissing = await request(app)
        .post("/api/auth/signup")
        .send({});
      expect(resMissing.status).toBe(400);
    });
  });

  describe("POST /api/auth/login", () => {
    it("4. Successfully logs in with valid credentials, sets HttpOnly cookie, and omits password hash", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: testEmail,
          password: testPassword,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(testEmail);
      expect(res.body.data.password).toBeUndefined();

      const cookies = res.headers["set-cookie"];
      expect(cookies).toBeDefined();
      const jwtCookie = Array.isArray(cookies) ? cookies.find((c: string) => c.startsWith("jwt=")) : cookies;
      expect(jwtCookie).toContain("HttpOnly");
      expect(jwtCookie).toContain("SameSite=Lax");
    });

    it("5. Rejects wrong password with generic 401 Unauthorized", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: testEmail,
          password: "WrongPassword999!",
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Invalid email or password.");
    });

    it("6. Rejects non-existent email with generic 401 Unauthorized (prevents user enumeration)", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "nonexistent_ghost_user@sweety.app",
          password: "SomePassword123!",
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Invalid email or password.");
    });
  });

  describe("GET /api/auth/me", () => {
    it("7. Returns authenticated user profile when valid HttpOnly cookie is attached", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Cookie", [authCookie]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(testEmail);
      expect(res.body.data.name).toBe(testName);
      expect(res.body.data.password).toBeUndefined();
    });

    it("8. Rejects request without authentication with 401 Unauthorized", async () => {
      const res = await request(app).get("/api/auth/me");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/authentication required/i);
    });

    it("9. Rejects tampered / invalid cookie with 401 Unauthorized", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Cookie", ["jwt=tampered_invalid_token_value"]);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/logout", () => {
    it("10. Successfully clears the authentication cookie", async () => {
      const res = await request(app)
        .post("/api/auth/logout")
        .set("Cookie", [authCookie]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/logged out/i);

      // Verify cookie is cleared (Expires in past or Max-Age=0)
      const cookies = res.headers["set-cookie"];
      expect(cookies).toBeDefined();
      const jwtCookie = Array.isArray(cookies) ? cookies.find((c: string) => c.startsWith("jwt=")) : cookies;
      expect(jwtCookie).toBeDefined();
      // An expired cookie has Max-Age=0 or Expires=Thu, 01 Jan 1970
      expect(
        jwtCookie!.includes("Expires=Thu, 01 Jan 1970") || jwtCookie!.includes("Max-Age=0")
      ).toBe(true);
    });
  });
});
