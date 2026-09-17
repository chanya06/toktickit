import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { getPrisma } from "../prisma.js";
import { Role } from "@prisma/client";
import {
  requireAuth,
  requirePasswordChanged,
  requireRole,
} from "../middleware/auth.js";
import { validatePasswordStrength } from "./auth.js";

export const usersRouter = Router();

// Enforce authentication, completed password change, and ADMINISTRATOR role on all endpoints
usersRouter.use(requireAuth);
usersRouter.use(requirePasswordChanged);
usersRouter.use(requireRole(Role.ADMINISTRATOR));

const SAFE_USER_SELECT = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  isActive: true,
  mustChangePassword: true,
  createdAt: true,
  updatedAt: true,
};

function isPositiveInteger(val: any): boolean {
  if (typeof val === "number") {
    return Number.isInteger(val) && val > 0;
  }
  if (typeof val === "string") {
    const trimmed = val.trim();
    return /^\d+$/.test(trimmed) && Number(trimmed) > 0;
  }
  return false;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const ALLOWED_SORT_FIELDS = ["id", "fullName", "email", "role", "isActive", "createdAt", "updatedAt"];

// ---------------------------------------------------------------------------
// GET /api/admin/users — List Users with Search, Role Filter & Pagination (API-10 / FR-15 / AC-09)
// ---------------------------------------------------------------------------
usersRouter.get("/", async (req: Request, res: Response) => {
  try {
    const { search, role, page, limit, pageSize, sortBy, sortOrder } = req.query;

    const where: any = {};

    // Role filter
    if (role !== undefined && role !== null && role !== "") {
      const roleStr = String(role).trim().toUpperCase();
      if (!Object.values(Role).includes(roleStr as Role)) {
        return res.status(400).json({
          error: `Invalid role filter: ${role}. Permitted values: ${Object.values(Role).join(", ")}`,
        });
      }
      where.role = roleStr as Role;
    }

    // Substring search across fullName and email (case-insensitive)
    if (search !== undefined && search !== null && search !== "") {
      const searchStr = String(search).trim();
      if (searchStr.length > 0) {
        where.OR = [
          { fullName: { contains: searchStr, mode: "insensitive" } },
          { email: { contains: searchStr, mode: "insensitive" } },
        ];
      }
    }

    // Pagination
    let currentPage = 1;
    if (page !== undefined && page !== null && page !== "") {
      if (!isPositiveInteger(page)) {
        return res.status(400).json({ error: "page must be a valid positive integer" });
      }
      currentPage = Number(page);
    }

    let perPage = 10;
    const rawLimit = pageSize !== undefined && pageSize !== null && pageSize !== "" ? pageSize : limit;
    if (rawLimit !== undefined && rawLimit !== null && rawLimit !== "") {
      if (!isPositiveInteger(rawLimit)) {
        return res.status(400).json({ error: "limit/pageSize must be a valid positive integer" });
      }
      perPage = Math.min(Number(rawLimit), 100);
    }

    // Sorting
    let sortField = "createdAt";
    if (sortBy !== undefined && sortBy !== null && sortBy !== "") {
      if (typeof sortBy !== "string" || !ALLOWED_SORT_FIELDS.includes(sortBy)) {
        return res.status(400).json({
          error: `Invalid sortBy parameter. Permitted fields: ${ALLOWED_SORT_FIELDS.join(", ")}`,
        });
      }
      sortField = sortBy;
    }

    let sortDirection: "asc" | "desc" = "desc";
    if (sortOrder !== undefined && sortOrder !== null && sortOrder !== "") {
      if (typeof sortOrder !== "string" || !["asc", "desc"].includes(sortOrder.toLowerCase())) {
        return res.status(400).json({ error: "Invalid sortOrder parameter: must be 'asc' or 'desc'" });
      }
      sortDirection = sortOrder.toLowerCase() as "asc" | "desc";
    }

    const skip = (currentPage - 1) * perPage;
    const prisma = getPrisma();

    const [users, totalItems] = await Promise.all([
      prisma.user.findMany({
        where,
        select: SAFE_USER_SELECT,
        orderBy: [
          { [sortField]: sortDirection },
          { id: sortDirection }, // Deterministic secondary sorting
        ],
        skip,
        take: perPage,
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / perPage);

    return res.status(200).json({
      data: users,
      pagination: {
        totalItems,
        totalPages,
        currentPage,
        pageSize: perPage,
      },
    });
  } catch (error) {
    console.error("Error fetching users for admin:", error);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
});

// ---------------------------------------------------------------------------
// POST /api/admin/users — Create User with Initial Password (API-11 / FR-16 / AC-10)
// ---------------------------------------------------------------------------
usersRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { fullName, email, role, initialPassword, isActive } = req.body;

    // Full name validation
    if (!fullName || typeof fullName !== "string") {
      return res.status(400).json({ error: "Full name is required" });
    }
    const trimmedName = fullName.trim();
    if (trimmedName.length < 2 || trimmedName.length > 100) {
      return res.status(400).json({ error: "Full name must be between 2 and 100 characters" });
    }

    // Email validation
    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email address is required" });
    }
    const trimmedEmail = email.trim().toLowerCase();
    if (!isValidEmail(trimmedEmail) || trimmedEmail.length > 255) {
      return res.status(400).json({ error: "A valid email address is required" });
    }

    // Role validation (BR-06)
    if (!role || typeof role !== "string") {
      return res.status(400).json({ error: "User role is required" });
    }
    const roleUpper = role.trim().toUpperCase();
    if (!Object.values(Role).includes(roleUpper as Role)) {
      return res.status(400).json({
        error: `Invalid role: ${role}. Permitted roles: ${Object.values(Role).join(", ")}`,
      });
    }

    // Initial password complexity validation
    if (!initialPassword || typeof initialPassword !== "string") {
      return res.status(400).json({ error: "Initial password is required" });
    }
    const passwordCheck = validatePasswordStrength(initialPassword);
    if (!passwordCheck.valid) {
      return res.status(400).json({ error: passwordCheck.message });
    }

    // Active status validation (defaults to true)
    let activeStatus = true;
    if (isActive !== undefined) {
      if (typeof isActive !== "boolean") {
        return res.status(400).json({ error: "isActive must be a boolean value" });
      }
      activeStatus = isActive;
    }

    const prisma = getPrisma();

    // Check email uniqueness (BR-05)
    const existing = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });
    if (existing) {
      return res.status(409).json({ error: "A user with this email address already exists" });
    }

    // Hash password with bcrypt (BR-04)
    const passwordHash = await bcrypt.hash(initialPassword, 10);

    // Create user record with mustChangePassword = true (AC-10 / FR-16)
    const newUser = await prisma.user.create({
      data: {
        fullName: trimmedName,
        email: trimmedEmail,
        role: roleUpper as Role,
        passwordHash,
        isActive: activeStatus,
        mustChangePassword: true,
      },
      select: SAFE_USER_SELECT,
    });

    return res.status(201).json({
      message: "User created successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ error: "Failed to create user" });
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/admin/users/:id — Update User & Enforce Safety Rules (API-12, API-13 / FR-17, FR-19, FR-20)
// ---------------------------------------------------------------------------
usersRouter.patch("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!isPositiveInteger(id)) {
      return res.status(400).json({ error: "User id must be a valid positive integer" });
    }

    const targetId = Number(id);
    const prisma = getPrisma();

    // Lookup target user
    const targetUser = await prisma.user.findUnique({
      where: { id: targetId },
      select: SAFE_USER_SELECT,
    });

    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const { fullName, email, role, isActive } = req.body;

    if (
      fullName === undefined &&
      email === undefined &&
      role === undefined &&
      isActive === undefined
    ) {
      return res.status(400).json({ error: "At least one field to update is required" });
    }

    const updateData: any = {};

    // Validate full name
    if (fullName !== undefined) {
      if (typeof fullName !== "string") {
        return res.status(400).json({ error: "Full name must be a string" });
      }
      const trimmedName = fullName.trim();
      if (trimmedName.length < 2 || trimmedName.length > 100) {
        return res.status(400).json({ error: "Full name must be between 2 and 100 characters" });
      }
      updateData.fullName = trimmedName;
    }

    // Validate email
    if (email !== undefined) {
      if (typeof email !== "string") {
        return res.status(400).json({ error: "Email must be a string" });
      }
      const trimmedEmail = email.trim().toLowerCase();
      if (!isValidEmail(trimmedEmail) || trimmedEmail.length > 255) {
        return res.status(400).json({ error: "A valid email address is required" });
      }

      // Uniqueness check
      const duplicate = await prisma.user.findFirst({
        where: {
          email: trimmedEmail,
          NOT: { id: targetId },
        },
      });
      if (duplicate) {
        return res.status(409).json({ error: "A user with this email address already exists" });
      }
      updateData.email = trimmedEmail;
    }

    // Validate role
    let nextRole: Role | undefined;
    if (role !== undefined) {
      if (typeof role !== "string") {
        return res.status(400).json({ error: "Role must be a string" });
      }
      const roleUpper = role.trim().toUpperCase();
      if (!Object.values(Role).includes(roleUpper as Role)) {
        return res.status(400).json({
          error: `Invalid role: ${role}. Permitted roles: ${Object.values(Role).join(", ")}`,
        });
      }
      nextRole = roleUpper as Role;
      updateData.role = nextRole;
    }

    // Validate active status
    let nextIsActive: boolean | undefined;
    if (isActive !== undefined) {
      if (typeof isActive !== "boolean") {
        return res.status(400).json({ error: "isActive must be a boolean" });
      }
      nextIsActive = isActive;
      updateData.isActive = nextIsActive;
    }

    // -------------------------------------------------------------------------
    // SAFETY RULE 1: Self-deactivation prevention (BR-07 / AC-11 / FR-19)
    // -------------------------------------------------------------------------
    if (req.user!.id === targetId && nextIsActive === false) {
      return res.status(422).json({
        error: "Administrators cannot deactivate their own account",
      });
    }

    // -------------------------------------------------------------------------
    // SAFETY RULE 2: Sole active administrator protection (BR-08 / AC-12 / FR-20)
    // -------------------------------------------------------------------------
    const isTargetCurrentlyActiveAdmin =
      targetUser.role === Role.ADMINISTRATOR && targetUser.isActive === true;

    if (isTargetCurrentlyActiveAdmin) {
      // If deactivating target active admin
      if (nextIsActive === false) {
        const activeAdminCount = await prisma.user.count({
          where: { role: Role.ADMINISTRATOR, isActive: true },
        });
        if (activeAdminCount <= 1) {
          return res.status(422).json({
            error: "Cannot deactivate the sole remaining active administrator",
          });
        }
      }

      // If demoting target active admin to a non-admin role
      if (nextRole !== undefined && nextRole !== Role.ADMINISTRATOR) {
        const otherActiveAdminsCount = await prisma.user.count({
          where: {
            role: Role.ADMINISTRATOR,
            isActive: true,
            NOT: { id: targetId },
          },
        });
        if (otherActiveAdminsCount === 0) {
          return res.status(422).json({
            error: "Cannot demote or change the role of the sole remaining active administrator",
          });
        }
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetId },
      data: updateData,
      select: SAFE_USER_SELECT,
    });

    return res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ error: "Failed to update user" });
  }
});

// ---------------------------------------------------------------------------
// POST /api/admin/users/:id/reset-password — Reset User Initial Password (FR-18)
// ---------------------------------------------------------------------------
usersRouter.post("/:id/reset-password", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!isPositiveInteger(id)) {
      return res.status(400).json({ error: "User id must be a valid positive integer" });
    }

    const targetId = Number(id);
    const prisma = getPrisma();

    const targetUser = await prisma.user.findUnique({
      where: { id: targetId },
      select: { id: true },
    });

    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const passwordToSet = req.body.initialPassword || req.body.newPassword;
    if (!passwordToSet || typeof passwordToSet !== "string") {
      return res.status(400).json({ error: "New initial password is required" });
    }

    const passwordCheck = validatePasswordStrength(passwordToSet);
    if (!passwordCheck.valid) {
      return res.status(400).json({ error: passwordCheck.message });
    }

    const passwordHash = await bcrypt.hash(passwordToSet, 10);

    // Update password and enforce mustChangePassword = true (FR-18)
    const updatedUser = await prisma.user.update({
      where: { id: targetId },
      data: {
        passwordHash,
        mustChangePassword: true,
      },
      select: SAFE_USER_SELECT,
    });

    return res.status(200).json({
      message: "User password reset successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error resetting user password:", error);
    return res.status(500).json({ error: "Failed to reset user password" });
  }
});
