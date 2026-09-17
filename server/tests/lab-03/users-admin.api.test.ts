import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";
import { JWT_SECRET } from "../../src/middleware/auth.js";
import { Role } from "@prisma/client";

describe("Administrator User Management & Safety Validations (Issue 26 / API-10..13)", () => {
  let adminToken: string;
  let adminUserId: number;
  let staffToken: string;
  let requesterToken: string;
  let mustChangeToken: string;

  const createdUserIds: number[] = [];
  const prisma = getPrisma();

  beforeAll(async () => {
    // 1. Fetch seed users
    const adminUser = await prisma.user.findFirstOrThrow({
      where: { email: "admin@toktickit.com" },
    });
    const staffUser = await prisma.user.findFirstOrThrow({
      where: { email: "kevin.patel@toktickit.com" },
    });
    const requesterUser = await prisma.user.findFirstOrThrow({
      where: { email: "jennifer.anderson@example.com" },
    });
    const mustChangeUser = await prisma.user.findFirstOrThrow({
      where: { email: "emily.davis@toktickit.com" },
    });

    adminUserId = adminUser.id;

    // Ensure baseline states
    await prisma.user.update({
      where: { id: adminUserId },
      data: { mustChangePassword: false, isActive: true, role: Role.ADMINISTRATOR },
    });
    await prisma.user.update({
      where: { id: staffUser.id },
      data: { mustChangePassword: false, isActive: true, role: Role.IT_STAFF },
    });
    await prisma.user.update({
      where: { id: requesterUser.id },
      data: { mustChangePassword: false, isActive: true, role: Role.REQUESTER },
    });
    await prisma.user.update({
      where: { id: mustChangeUser.id },
      data: { mustChangePassword: true, isActive: true },
    });

    // Generate test JWTs with userId payload
    adminToken = jwt.sign(
      { userId: adminUserId, email: adminUser.email, role: Role.ADMINISTRATOR },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    staffToken = jwt.sign(
      { userId: staffUser.id, email: staffUser.email, role: Role.IT_STAFF },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    requesterToken = jwt.sign(
      { userId: requesterUser.id, email: requesterUser.email, role: Role.REQUESTER },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    mustChangeToken = jwt.sign(
      { userId: mustChangeUser.id, email: mustChangeUser.email, role: Role.IT_STAFF },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
  });

  afterAll(async () => {
    // Cleanup any test created users
    for (const uid of createdUserIds) {
      await prisma.user.delete({ where: { id: uid } }).catch(() => {});
    }
  });

  // ===========================================================================
  // 1. GET /api/admin/users — List Users with Search, Role Filter & Pagination (API-10)
  // ===========================================================================
  describe("GET /api/admin/users (API-10 / AC-09 / FR-15)", () => {
    it("returns paginated user list with safe attributes and pagination metadata", async () => {
      const res = await request(app)
        .get("/api/admin/users?page=1&limit=5")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(res.body).toHaveProperty("pagination");
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.length).toBeLessThanOrEqual(5);

      expect(res.body.pagination.currentPage).toBe(1);
      expect(res.body.pagination.pageSize).toBe(5);
      expect(res.body.pagination.totalItems).toBeGreaterThanOrEqual(1);
      expect(res.body.pagination.totalPages).toBeGreaterThanOrEqual(1);

      // Verify safe fields; passwordHash must NOT be leaked
      for (const u of res.body.data) {
        expect(u).toHaveProperty("id");
        expect(u).toHaveProperty("email");
        expect(u).toHaveProperty("fullName");
        expect(u).toHaveProperty("role");
        expect(u).toHaveProperty("isActive");
        expect(u).toHaveProperty("mustChangePassword");
        expect(u.passwordHash).toBeUndefined();
      }
    });

    it("filters users by role (e.g. role=REQUESTER)", async () => {
      const res = await request(app)
        .get("/api/admin/users?role=REQUESTER")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      for (const u of res.body.data) {
        expect(u.role).toBe(Role.REQUESTER);
      }
    });

    it("searches users by name or email substring (case-insensitive)", async () => {
      const res = await request(app)
        .get("/api/admin/users?search=admin")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      const found = res.body.data.some(
        (u: any) =>
          u.email.toLowerCase().includes("admin") ||
          u.fullName.toLowerCase().includes("admin")
      );
      expect(found).toBe(true);
    });

    it("rejects invalid role filter parameter with 400 Bad Request", async () => {
      const res = await request(app)
        .get("/api/admin/users?role=SUPERUSER")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Invalid role");
    });
  });

  // ===========================================================================
  // 2. POST /api/admin/users — Create User with Initial Password (API-11)
  // ===========================================================================
  describe("POST /api/admin/users (API-11 / AC-10 / FR-16)", () => {
    it("creates a user with mustChangePassword=true and allows login with initial password", async () => {
      const testEmail = `test.user.${Date.now()}@toktickit.com`;
      const initialPass = "TemporaryPass2026!";

      const res = await request(app)
        .post("/api/admin/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          fullName: "New Staff Member",
          email: testEmail,
          role: "IT_STAFF",
          initialPassword: initialPass,
          isActive: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("User created successfully");
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(testEmail);
      expect(res.body.user.fullName).toBe("New Staff Member");
      expect(res.body.user.role).toBe(Role.IT_STAFF);
      expect(res.body.user.isActive).toBe(true);
      expect(res.body.user.mustChangePassword).toBe(true);
      expect(res.body.user.passwordHash).toBeUndefined();

      createdUserIds.push(res.body.user.id);

      // Verify the new user can log in with initial password
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({
          email: testEmail,
          password: initialPass,
        });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.user.mustChangePassword).toBe(true);
    });

    it("rejects duplicate email with 409 Conflict (BR-05)", async () => {
      const res = await request(app)
        .post("/api/admin/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          fullName: "Duplicate User",
          email: "admin@toktickit.com", // existing admin email
          role: "IT_STAFF",
          initialPassword: "StrongPassword123!",
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toContain("already exists");
    });

    it("rejects weak initial passwords with 400 Bad Request", async () => {
      const testCases = [
        { pass: "short1!", reason: "too short" },
        { pass: "nouppercase123!", reason: "no uppercase" },
        { pass: "NOLOWERCASE123!", reason: "no lowercase" },
        { pass: "NoNumbersHere!", reason: "no digit" },
        { pass: "NoSpecialChar123", reason: "no special char" },
      ];

      for (const tc of testCases) {
        const res = await request(app)
          .post("/api/admin/users")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({
            fullName: "Weak Password User",
            email: `weak.${Date.now()}.${Math.random()}@toktickit.com`,
            role: "IT_STAFF",
            initialPassword: tc.pass,
          });

        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
      }
    });

    it("rejects invalid role with 400 Bad Request", async () => {
      const res = await request(app)
        .post("/api/admin/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          fullName: "Invalid Role User",
          email: `invalid.role.${Date.now()}@toktickit.com`,
          role: "SUPER_ADMIN",
          initialPassword: "StrongPassword123!",
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Invalid role");
    });
  });

  // ===========================================================================
  // 3. PATCH /api/admin/users/:id — Safety Validations (API-12, API-13)
  // ===========================================================================
  describe("PATCH /api/admin/users/:id & Safety Rules (API-12, API-13)", () => {
    it("API-12: rejects Administrator self-deactivation with 422 Unprocessable Entity (BR-07 / AC-11 / FR-19)", async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${adminUserId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          isActive: false,
        });

      expect(res.status).toBe(422);
      expect(res.body.error).toContain("cannot deactivate their own account");
    });

    it("API-13: rejects deactivating or demoting the sole active Administrator with 422 (BR-08 / AC-12 / FR-20)", async () => {
      // Ensure only 1 active admin exists in DB before this test
      const otherAdmins = await prisma.user.findMany({
        where: {
          role: Role.ADMINISTRATOR,
          isActive: true,
          NOT: { id: adminUserId },
        },
      });
      for (const oa of otherAdmins) {
        await prisma.user.update({
          where: { id: oa.id },
          data: { isActive: false },
        });
      }

      // 1. Attempt to demote sole active administrator to IT_STAFF
      const demoteRes = await request(app)
        .patch(`/api/admin/users/${adminUserId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          role: "IT_STAFF",
        });

      expect(demoteRes.status).toBe(422);
      expect(demoteRes.body.error).toContain("sole remaining active administrator");

      // Verify admin role is preserved
      const dbAdmin = await prisma.user.findUniqueOrThrow({ where: { id: adminUserId } });
      expect(dbAdmin.role).toBe(Role.ADMINISTRATOR);
    });

    it("allows deactivating a non-admin user or an admin when other active admins exist", async () => {
      // 1. Create a 2nd active Administrator
      const secondAdminRes = await request(app)
        .post("/api/admin/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          fullName: "Second Active Admin",
          email: `second.admin.${Date.now()}@toktickit.com`,
          role: "ADMINISTRATOR",
          initialPassword: "AdminPassword2026!",
          isActive: true,
        });

      expect(secondAdminRes.status).toBe(201);
      const secondAdminId = secondAdminRes.body.user.id;
      createdUserIds.push(secondAdminId);

      // 2. Now deactivating the 2nd Administrator is permitted (since adminUserId remains active)
      const deactivateRes = await request(app)
        .patch(`/api/admin/users/${secondAdminId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          isActive: false,
        });

      expect(deactivateRes.status).toBe(200);
      expect(deactivateRes.body.user.isActive).toBe(false);

      // Verify in DB
      const dbUser = await prisma.user.findUniqueOrThrow({ where: { id: secondAdminId } });
      expect(dbUser.isActive).toBe(false);
    });

    it("updates user fullName and role successfully", async () => {
      // Create a staff user to update
      const createRes = await request(app)
        .post("/api/admin/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          fullName: "Updatable User",
          email: `updatable.${Date.now()}@toktickit.com`,
          role: "REQUESTER",
          initialPassword: "InitialPass123!",
        });
      const uid = createRes.body.user.id;
      createdUserIds.push(uid);

      // Update to IT_STAFF and new name
      const patchRes = await request(app)
        .patch(`/api/admin/users/${uid}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          fullName: "Promoted Staff User",
          role: "IT_STAFF",
        });

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.user.fullName).toBe("Promoted Staff User");
      expect(patchRes.body.user.role).toBe(Role.IT_STAFF);
    });

    it("returns 404 Not Found when updating a non-existent user", async () => {
      const res = await request(app)
        .patch("/api/admin/users/999999")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ fullName: "Ghost User" });

      expect(res.status).toBe(404);
      expect(res.body.error).toContain("User not found");
    });
  });

  // ===========================================================================
  // 4. POST /api/admin/users/:id/reset-password (FR-18)
  // ===========================================================================
  describe("POST /api/admin/users/:id/reset-password (FR-18)", () => {
    it("resets user password, sets mustChangePassword=true, and allows login", async () => {
      // Create user
      const userRes = await request(app)
        .post("/api/admin/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          fullName: "Password Reset Target",
          email: `reset.target.${Date.now()}@toktickit.com`,
          role: "REQUESTER",
          initialPassword: "InitialPass123!",
        });
      const targetUser = userRes.body.user;
      createdUserIds.push(targetUser.id);

      // Change password initially so mustChangePassword becomes false
      await prisma.user.update({
        where: { id: targetUser.id },
        data: { mustChangePassword: false },
      });

      // Admin resets password to a new initial password
      const newResetPass = "NewlyResetPassword2026!";
      const resetRes = await request(app)
        .post(`/api/admin/users/${targetUser.id}/reset-password`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ initialPassword: newResetPass });

      expect(resetRes.status).toBe(200);
      expect(resetRes.body.message).toBe("User password reset successfully");
      expect(resetRes.body.user.mustChangePassword).toBe(true);

      // Target user logs in with new password
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({
          email: targetUser.email,
          password: newResetPass,
        });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.user.mustChangePassword).toBe(true);
    });

    it("rejects weak reset password with 400 Bad Request", async () => {
      const res = await request(app)
        .post(`/api/admin/users/${adminUserId}/reset-password`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ initialPassword: "weak" });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("at least 8 characters");
    });
  });

  // ===========================================================================
  // 5. Role Security & Authorization Guards (RBAC)
  // ===========================================================================
  describe("Role Security & Authorization Guards (RBAC)", () => {
    it("rejects unauthenticated requests with 401 Unauthorized", async () => {
      const res = await request(app).get("/api/admin/users");
      expect(res.status).toBe(401);
    });

    it("blocks users with mustChangePassword: true with 403 Forbidden", async () => {
      const res = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${mustChangeToken}`);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe("MUST_CHANGE_PASSWORD");
    });

    it("rejects IT Staff users with 403 Forbidden", async () => {
      const res = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toContain("Forbidden");
    });

    it("rejects Requester users with 403 Forbidden", async () => {
      const res = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${requesterToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toContain("Forbidden");
    });

    it("enforces soft deactivation (BR-09): DELETE /api/admin/users/:id is not supported", async () => {
      const res = await request(app)
        .delete(`/api/admin/users/${adminUserId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect([404, 405]).toContain(res.status);
    });
  });
});
