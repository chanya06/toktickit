import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";

describe("Authentication API Endpoints (Issue 19 - Lab 3)", () => {
  const activeRequester = {
    email: "jennifer.anderson@example.com",
    password: "InitialPass123!",
  };

  const inactiveRequester = {
    email: "alex.taylor@example.com",
    password: "InitialPass123!",
  };

  const adminUser = {
    email: "admin@toktickit.com",
    password: "InitialPass123!",
  };

  describe("POST /api/auth/login", () => {
    it("API-01: authenticates an active user with valid credentials, sets cookie, and returns safe user data with token", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send(activeRequester);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(typeof res.body.token).toBe("string");
      expect(res.body).toHaveProperty("user");
      expect(res.body.user.email).toBe(activeRequester.email.toLowerCase());
      expect(res.body.user.role).toBe("REQUESTER");
      expect(res.body.user).not.toHaveProperty("passwordHash");
      expect(res.body.user).not.toHaveProperty("password");

      // Verify Set-Cookie header contains auth_token
      const setCookie = res.headers["set-cookie"];
      expect(setCookie).toBeDefined();
      const setCookies = Array.isArray(setCookie) ? setCookie : [setCookie || ""];
      expect(setCookies.some((c: string) => c.includes("auth_token="))).toBe(true);
    });

    it("API-02: rejects login for inactive accounts with 401 and safe message", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send(inactiveRequester);

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toMatch(/inactive|invalid/i);
    });

    it("rejects login with incorrect password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: activeRequester.email,
          password: "WrongPassword999!",
        });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "Invalid email or password" });
    });

    it("rejects login with non-existent email", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "nobody@example.com",
          password: "SomePassword123!",
        });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "Invalid email or password" });
    });

    it("rejects login when missing email or password", async () => {
      const res1 = await request(app).post("/api/auth/login").send({ email: "test@example.com" });
      expect(res1.status).toBe(400);

      const res2 = await request(app).post("/api/auth/login").send({ password: "Password123!" });
      expect(res2.status).toBe(400);
    });
  });

  describe("GET /api/auth/me", () => {
    it("returns current authenticated user when valid Bearer token is provided", async () => {
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send(adminUser);

      const token = loginRes.body.token;

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(adminUser.email);
      expect(res.body.user.role).toBe("ADMINISTRATOR");
      expect(res.body.user).not.toHaveProperty("passwordHash");
    });

    it("returns 401 Unauthorized when no token or cookie is provided", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("POST /api/auth/logout", () => {
    it("clears the auth_token cookie and returns success message", async () => {
      const res = await request(app).post("/api/auth/logout");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: "Logged out successfully" });
    });
  });

  describe("POST /api/auth/change-password", () => {
    const testUser = {
      email: "david.lee@example.com",
      password: "InitialPass123!",
    };

    afterAll(async () => {
      const salt = await bcrypt.genSalt(10);
      const defaultHash = await bcrypt.hash(testUser.password, salt);
      await getPrisma().user.update({
        where: { email: testUser.email },
        data: {
          passwordHash: defaultHash,
          mustChangePassword: true,
        },
      });
    });

    it("rejects password change if unauthenticated", async () => {
      const res = await request(app)
        .post("/api/auth/change-password")
        .send({
          currentPassword: "InitialPass123!",
          newPassword: "NewSecretPassword123!",
        });

      expect(res.status).toBe(401);
    });

    it("rejects password change if current password is wrong", async () => {
      const loginRes = await request(app).post("/api/auth/login").send(testUser);
      const token = loginRes.body.token;

      const res = await request(app)
        .post("/api/auth/change-password")
        .set("Authorization", `Bearer ${token}`)
        .send({
          currentPassword: "WrongCurrentPassword123!",
          newPassword: "NewValidPassword123!",
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Current password is incorrect" });
    });

    it("rejects weak new passwords (missing number, special char, or too short)", async () => {
      const loginRes = await request(app).post("/api/auth/login").send(testUser);
      const token = loginRes.body.token;

      // Too short
      const resShort = await request(app)
        .post("/api/auth/change-password")
        .set("Authorization", `Bearer ${token}`)
        .send({
          currentPassword: testUser.password,
          newPassword: "Aa1!",
        });
      expect(resShort.status).toBe(400);

      // No special char
      const resNoSpecial = await request(app)
        .post("/api/auth/change-password")
        .set("Authorization", `Bearer ${token}`)
        .send({
          currentPassword: testUser.password,
          newPassword: "Password1234",
        });
      expect(resNoSpecial.status).toBe(400);
    });

    it("API-03: successfully changes password, updates mustChangePassword flag to false, and allows login with new password", async () => {
      const loginRes = await request(app).post("/api/auth/login").send(testUser);
      const token = loginRes.body.token;
      expect(loginRes.body.user.mustChangePassword).toBe(true);

      const newPassword = "BrandNewSecurePassword123!";

      const changeRes = await request(app)
        .post("/api/auth/change-password")
        .set("Authorization", `Bearer ${token}`)
        .send({
          currentPassword: testUser.password,
          newPassword,
        });

      expect(changeRes.status).toBe(200);
      expect(changeRes.body.user.mustChangePassword).toBe(false);

      // Verify login with new password works
      const reLoginRes = await request(app)
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: newPassword,
        });

      expect(reLoginRes.status).toBe(200);
      expect(reLoginRes.body.user.mustChangePassword).toBe(false);

      // Verify old password no longer works
      const oldLoginRes = await request(app)
        .post("/api/auth/login")
        .send(testUser);

      expect(oldLoginRes.status).toBe(401);
    });
  });
});
