import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import multer from "multer";
import { getPrisma } from "./prisma.js";
import { createTicketAtomically } from "./utils/ticketNumber.js";
import { RequestedPriority } from "@prisma/client";

export const app = express();

app.use(cors());
app.use(express.json());

const uploadDir = path.join(process.cwd(), "uploads", "attachments");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${crypto.randomUUID()}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 + 1024 * 1024 }, // Max buffer allowance for multer
});

// ---------------------------------------------------------------------------
// Health check endpoint
// ---------------------------------------------------------------------------
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", service: "TokTickIT API" });
});

// ---------------------------------------------------------------------------
// Categories endpoint
// ---------------------------------------------------------------------------
app.get("/api/categories", async (_req: Request, res: Response) => {
  try {
    const categories = await getPrisma().category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        id: "asc",
      },
    });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// ---------------------------------------------------------------------------
// Related Systems endpoint
// ---------------------------------------------------------------------------
app.get("/api/related-systems", async (_req: Request, res: Response) => {
  try {
    const systems = await getPrisma().relatedSystem.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        id: "asc",
      },
    });
    res.status(200).json(systems);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch related systems" });
  }
});

// ---------------------------------------------------------------------------
// Development Requesters endpoint (Issue 7)
// ---------------------------------------------------------------------------
app.get("/api/requesters", async (_req: Request, res: Response) => {
  try {
    const requesters = await getPrisma().developmentRequester.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        isActive: true,
      },
      orderBy: {
        id: "asc",
      },
    });
    res.status(200).json(requesters);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch active development requesters" });
  }
});

// Helper to validate positive integer IDs (prevents NaN / invalid string formats causing 500 errors)
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

const VALID_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const VALID_STATUSES = ["NEW", "OPEN", "IN_PROGRESS", "PENDING", "RESOLVED", "CLOSED"];
const ALLOWED_SORT_FIELDS = ["createdAt", "ticketNumber", "summary", "status", "requestedPriority", "itPriority", "updatedAt"];

// Helper to parse multi-select query params (comma-separated string or array of strings)
function parseMultiSelectParam(val: any): string[] {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.flatMap((item) => String(item).split(",")).map((s) => s.trim()).filter(Boolean);
  }
  if (typeof val === "string") {
    return val.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [String(val).trim()].filter(Boolean);
}

// ---------------------------------------------------------------------------
// Get Owned Tickets (My Tickets) endpoint (Issue 10)
// ---------------------------------------------------------------------------
app.get("/api/tickets", async (req: Request, res: Response) => {
  try {
    const {
      requesterId,
      search,
      categoryId,
      relatedSystemId,
      requestedPriority,
      priority,
      status,
      sortBy,
      sortOrder,
      page,
      pageSize,
      limit,
    } = req.query;

    // 1. Mandatory requesterId parameter validation -> 400 Bad Request
    if (requesterId === undefined || requesterId === null || requesterId === "") {
      return res.status(400).json({ error: "requesterId parameter is required" });
    }

    if (!isPositiveInteger(requesterId)) {
      return res.status(400).json({ error: "requesterId must be a valid positive integer" });
    }

    const numericRequesterId = Number(requesterId);

    // 2. Pagination parameter validation -> 400 Bad Request
    let currentPage = 1;
    if (page !== undefined && page !== null && page !== "") {
      if (!isPositiveInteger(page)) {
        return res.status(400).json({ error: "page must be a valid positive integer" });
      }
      currentPage = Number(page);
    }

    let perPage = 10;
    const rawSize = pageSize !== undefined && pageSize !== null && pageSize !== "" ? pageSize : limit;
    if (rawSize !== undefined && rawSize !== null && rawSize !== "") {
      if (!isPositiveInteger(rawSize)) {
        return res.status(400).json({ error: "pageSize must be a valid positive integer" });
      }
      perPage = Math.min(Number(rawSize), 100);
    }

    // 3. Sorting parameter validation -> 400 Bad Request
    let sortField = "createdAt";
    if (sortBy !== undefined && sortBy !== null && sortBy !== "") {
      if (typeof sortBy !== "string" || !ALLOWED_SORT_FIELDS.includes(sortBy)) {
        return res.status(400).json({ error: "Invalid sortBy parameter" });
      }
      sortField = sortBy;
    }

    let sortDirection: "asc" | "desc" = "desc";
    if (sortOrder !== undefined && sortOrder !== null && sortOrder !== "") {
      if (typeof sortOrder !== "string" || !["asc", "desc"].includes(sortOrder.toLowerCase())) {
        return res.status(400).json({ error: "Invalid sortOrder parameter" });
      }
      sortDirection = sortOrder.toLowerCase() as "asc" | "desc";
    }

    // Build filter criteria
    const where: any = {
      requesterId: numericRequesterId,
    };

    // Category filter (supports multi-select comma-separated or array)
    if (categoryId !== undefined && categoryId !== null && categoryId !== "") {
      const categoryStrList = parseMultiSelectParam(categoryId);
      if (categoryStrList.length === 0 || !categoryStrList.every(isPositiveInteger)) {
        return res.status(400).json({ error: "categoryId must be valid positive integer(s)" });
      }
      const categoryIds = categoryStrList.map(Number);
      where.categoryId = categoryIds.length === 1 ? categoryIds[0] : { in: categoryIds };
    }

    // Related System filter (supports multi-select comma-separated or array)
    if (relatedSystemId !== undefined && relatedSystemId !== null && relatedSystemId !== "") {
      const systemStrList = parseMultiSelectParam(relatedSystemId);
      if (systemStrList.length === 0 || !systemStrList.every(isPositiveInteger)) {
        return res.status(400).json({ error: "relatedSystemId must be valid positive integer(s)" });
      }
      const systemIds = systemStrList.map(Number);
      where.relatedSystemId = systemIds.length === 1 ? systemIds[0] : { in: systemIds };
    }

    // Priority filter (supports multi-select comma-separated or array for requestedPriority / priority)
    const priorityRaw = requestedPriority || priority;
    if (priorityRaw !== undefined && priorityRaw !== null && priorityRaw !== "") {
      const priorityStrList = parseMultiSelectParam(priorityRaw).map((s) => s.toUpperCase());
      if (priorityStrList.length === 0 || !priorityStrList.every((p) => VALID_PRIORITIES.includes(p))) {
        return res.status(400).json({ error: "Invalid priority filter value" });
      }
      where.requestedPriority = priorityStrList.length === 1 ? priorityStrList[0] : { in: priorityStrList };
    }

    // Status filter (supports multi-select comma-separated or array)
    if (status !== undefined && status !== null && status !== "") {
      const statusStrList = parseMultiSelectParam(status).map((s) => s.toUpperCase());
      if (statusStrList.length === 0 || !statusStrList.every((s) => VALID_STATUSES.includes(s))) {
        return res.status(400).json({ error: "Invalid status filter value" });
      }
      where.status = statusStrList.length === 1 ? statusStrList[0] : { in: statusStrList };
    }

    // Search query filter (contract specified: across ticketNumber and summary ONLY)
    if (search !== undefined && search !== null && search !== "") {
      const searchStr = String(search).trim();
      if (searchStr !== "") {
        where.OR = [
          { ticketNumber: { contains: searchStr, mode: "insensitive" } },
          { summary: { contains: searchStr, mode: "insensitive" } },
        ];
      }
    }

    const skip = (currentPage - 1) * perPage;
    const take = perPage;

    const prisma = getPrisma();

    const [tickets, totalItems] = await Promise.all([
      prisma.ticket.findMany({
        where,
        orderBy: [
          { [sortField]: sortDirection },
          { id: sortDirection }, // Deterministic secondary sorting
        ],
        skip,
        take,
        select: {
          id: true,
          ticketNumber: true,
          requesterId: true,
          categoryId: true,
          relatedSystemId: true,
          summary: true,
          description: true,
          requestedPriority: true,
          itPriority: true,
          status: true,
          ticketOwner: true,
          createdAt: true,
          updatedAt: true,
          requester: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          relatedSystem: {
            select: {
              id: true,
              name: true,
            },
          },
          attachments: {
            where: {
              isRemoved: false,
            },
            select: {
              id: true,
            },
          },
        },
      }),
      prisma.ticket.count({ where }),
    ]);

    const formattedData = tickets.map((ticket) => {
      const { attachments, ...rest } = ticket;
      return {
        ...rest,
        attachmentCount: attachments ? attachments.length : 0,
      };
    });

    const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / perPage);

    return res.status(200).json({
      data: formattedData,
      pagination: {
        totalItems,
        totalPages,
        currentPage,
        pageSize: perPage,
      },
    });
  } catch (error) {
    console.error("Get tickets error:", error);
    return res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

// ---------------------------------------------------------------------------
// Get Owned Ticket Detail endpoint with Ownership Guard (Issue 12)
// ---------------------------------------------------------------------------
app.get("/api/tickets/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const queryRequesterId = req.query.requesterId;
    const headerRequesterId = req.headers["x-requester-id"];

    // 1. Ticket ID format validation -> 400 Bad Request
    if (!isPositiveInteger(id)) {
      return res.status(400).json({ error: "Ticket id must be a valid positive integer" });
    }

    // 2. Requester ID query parameter mandatory validation -> 400 Bad Request
    if (queryRequesterId === undefined || queryRequesterId === null || queryRequesterId === "") {
      return res.status(400).json({ error: "requesterId query parameter is required" });
    }

    if (!isPositiveInteger(queryRequesterId)) {
      return res.status(400).json({ error: "requesterId must be a valid positive integer" });
    }

    // 3. Conflict check: if header is also supplied, ensure it matches query parameter
    if (
      headerRequesterId !== undefined &&
      headerRequesterId !== null &&
      headerRequesterId !== "" &&
      String(headerRequesterId) !== String(queryRequesterId)
    ) {
      return res.status(400).json({ error: "Conflicting requester identity between query parameter and header" });
    }

    const rawRequesterId = queryRequesterId;

    const ticketId = Number(id);
    const numericRequesterId = Number(rawRequesterId);

    const prisma = getPrisma();

    // 3. Find target ticket
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: {
        id: true,
        ticketNumber: true,
        requesterId: true,
        categoryId: true,
        relatedSystemId: true,
        summary: true,
        description: true,
        requestedPriority: true,
        itPriority: true,
        status: true,
        ticketOwner: true,
        createdAt: true,
        updatedAt: true,
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        relatedSystem: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // 4. Enforce strict requester ownership check -> 403 Forbidden
    if (ticket.requesterId !== numericRequesterId) {
      return res.status(403).json({ error: "Forbidden: You do not have access to this ticket" });
    }

    return res.status(200).json(ticket);
  } catch (error) {
    console.error("Get ticket detail error:", error);
    return res.status(500).json({ error: "Failed to fetch ticket detail" });
  }
});

app.post("/api/tickets", async (req: Request, res: Response) => {
  try {
    const { requesterId, categoryId, relatedSystemId, requestedPriority, summary, description } = req.body;

    // 1. Missing fields validation -> 400 Bad Request
    if (
      requesterId === undefined ||
      categoryId === undefined ||
      relatedSystemId === undefined ||
      !requestedPriority ||
      summary === undefined ||
      description === undefined
    ) {
      return res.status(400).json({ error: "Missing required ticket fields" });
    }

    // 2. ID format validation -> 400 Bad Request
    if (
      !isPositiveInteger(requesterId) ||
      !isPositiveInteger(categoryId) ||
      !isPositiveInteger(relatedSystemId)
    ) {
      return res.status(400).json({ error: "requesterId, categoryId, and relatedSystemId must be valid positive integers" });
    }

    // 2. Enum validation -> 400 Bad Request
    if (!VALID_PRIORITIES.includes(requestedPriority)) {
      return res.status(400).json({ error: "Invalid requestedPriority value" });
    }

    const trimmedSummary = String(summary).trim();
    const trimmedDescription = String(description).trim();

    // 3. String length validation -> 422 Unprocessable Entity
    if (trimmedSummary.length < 5 || trimmedSummary.length > 120) {
      return res.status(422).json({ error: "Ticket Summary must be between 5 and 120 characters" });
    }

    if (trimmedDescription.length < 10 || trimmedDescription.length > 2000) {
      return res.status(422).json({ error: "Ticket Description must be between 10 and 2000 characters" });
    }

    const prisma = getPrisma();

    // 4. Active entities validation -> 422 Unprocessable Entity
    const requester = await prisma.developmentRequester.findFirst({
      where: { id: Number(requesterId), isActive: true },
    });
    if (!requester) {
      return res.status(422).json({ error: "Active Development Requester not found" });
    }

    const category = await prisma.category.findFirst({
      where: { id: Number(categoryId), isActive: true },
    });
    if (!category) {
      return res.status(422).json({ error: "Active Category not found" });
    }

    const relatedSystem = await prisma.relatedSystem.findFirst({
      where: { id: Number(relatedSystemId), isActive: true },
    });
    if (!relatedSystem) {
      return res.status(422).json({ error: "Active Related System not found" });
    }

    // 5. Generate Ticket Number & create Ticket atomically (handles concurrency & collisions via transaction retry)
    const newTicket = await createTicketAtomically(prisma, {
      requesterId: Number(requesterId),
      categoryId: Number(categoryId),
      relatedSystemId: Number(relatedSystemId),
      requestedPriority: requestedPriority as RequestedPriority,
      summary: trimmedSummary,
      description: trimmedDescription,
      itPriority: "MEDIUM",
      status: "NEW",
    });

    return res.status(201).json(newTicket);
  } catch (error) {
    console.error("Create ticket error:", error);
    return res.status(500).json({ error: "Failed to create ticket" });
  }
});

function validateFileBufferSignature(filePath: string, ext: string): boolean {
  try {
    const fd = fs.openSync(filePath, "r");
    const buffer = Buffer.alloc(12);
    fs.readSync(fd, buffer, 0, 12, 0);
    fs.closeSync(fd);

    const cleanExt = ext.toLowerCase();
    if (cleanExt === ".pdf") {
      return buffer.slice(0, 5).toString("ascii") === "%PDF-";
    }
    if (cleanExt === ".jpg" || cleanExt === ".jpeg") {
      return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    }
    if (cleanExt === ".png") {
      return (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47 &&
        buffer[4] === 0x0d &&
        buffer[5] === 0x0a &&
        buffer[6] === 0x1a &&
        buffer[7] === 0x0a
      );
    }
    if (cleanExt === ".webp") {
      const isRiff = buffer.slice(0, 4).toString("ascii") === "RIFF";
      const isWebp = buffer.slice(8, 12).toString("ascii") === "WEBP";
      return isRiff && isWebp;
    }
    return false;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Attachment Endpoints (Issue 13)
// ---------------------------------------------------------------------------

// 1. List Ticket Attachment Metadata
app.get("/api/tickets/:id/attachments", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const queryRequesterId = req.query.requesterId;
    const headerRequesterId = req.headers["x-requester-id"];

    if (!isPositiveInteger(id)) {
      return res.status(400).json({ error: "Ticket id must be a valid positive integer" });
    }

    if (queryRequesterId === undefined || queryRequesterId === null || queryRequesterId === "") {
      return res.status(400).json({ error: "requesterId query parameter is required" });
    }

    if (!isPositiveInteger(queryRequesterId)) {
      return res.status(400).json({ error: "requesterId must be a valid positive integer" });
    }

    if (
      headerRequesterId !== undefined &&
      headerRequesterId !== null &&
      headerRequesterId !== "" &&
      String(headerRequesterId) !== String(queryRequesterId)
    ) {
      return res.status(400).json({ error: "Conflicting requester identity between query parameter and header" });
    }

    const ticketId = Number(id);
    const numericRequesterId = Number(queryRequesterId);

    const prisma = getPrisma();
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { id: true, requesterId: true },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    if (ticket.requesterId !== numericRequesterId) {
      return res.status(403).json({ error: "Forbidden: You do not have access to this ticket's attachments" });
    }

    const attachments = await prisma.attachment.findMany({
      where: { ticketId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        ticketId: true,
        originalName: true,
        mimeType: true,
        sizeBytes: true,
        isRemoved: true,
        removalReason: true,
        removedAt: true,
        createdAt: true,
      },
    });

    return res.status(200).json(attachments);
  } catch (error) {
    console.error("Fetch attachments error:", error);
    return res.status(500).json({ error: "Failed to fetch attachment metadata" });
  }
});

// 2. Upload Attachment
app.post("/api/tickets/:id/attachments", (req: Request, res: Response, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(413).json({ error: "File size exceeds maximum allowed limit of 5 MB" });
        }
        return res.status(400).json({ error: err.message });
      }
      return res.status(400).json({ error: err.message || "File upload error" });
    }
    next();
  });
}, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const bodyRequesterId = req.body?.requesterId || req.query?.requesterId;

    if (!isPositiveInteger(id)) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Ticket id must be a valid positive integer" });
    }

    if (!bodyRequesterId || !isPositiveInteger(bodyRequesterId)) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "requesterId parameter is required" });
    }

    const ticketId = Number(id);
    const numericRequesterId = Number(bodyRequesterId);

    const prisma = getPrisma();
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { id: true, requesterId: true },
    });

    if (!ticket) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: "Ticket not found" });
    }

    if (ticket.requesterId !== numericRequesterId) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(403).json({ error: "Forbidden: You do not have access to upload attachments to this ticket" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "File payload is required" });
    }

    // Allowed extensions & MIME types check (.jpg, .jpeg, .png, .webp, .pdf)
    const allowedMap: Record<string, string[]> = {
      ".jpg": ["image/jpeg", "image/jpg"],
      ".jpeg": ["image/jpeg", "image/jpg"],
      ".png": ["image/png"],
      ".webp": ["image/webp"],
      ".pdf": ["application/pdf"],
    };

    const ext = path.extname(req.file.originalname).toLowerCase();
    const mime = (req.file.mimetype || "").toLowerCase();
    const validMimes = allowedMap[ext];

    if (!validMimes || !validMimes.includes(mime)) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "File type not supported. Allowed formats: .jpg, .jpeg, .png, .webp, .pdf with matching content type" });
    }

    // 5MB size check (5,242,880 bytes)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (req.file.size > MAX_SIZE) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(413).json({ error: "File size exceeds maximum allowed limit of 5 MB" });
    }

    // Binary file signature / magic bytes validation
    if (!validateFileBufferSignature(req.file.path, ext)) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "File type not supported. Binary content signature does not match extension" });
    }

    // Check active attachments limit & create record atomically via Prisma transaction with row-level locking
    let newAttachment;
    try {
      newAttachment = await prisma.$transaction(async (tx) => {
        // Lock ticket row to serialize concurrent upload transactions for this ticket
        try {
          await tx.$queryRaw`SELECT id FROM "Ticket" WHERE id = ${ticketId} FOR UPDATE`;
        } catch {
          // Fallback if db driver / provider does not support raw FOR UPDATE lock
        }

        const activeCount = await tx.attachment.count({
          where: {
            ticketId,
            isRemoved: false,
          },
        });

        if (activeCount >= 5) {
          throw { status: 422, message: "Maximum active attachments limit (5) reached" };
        }

        return await tx.attachment.create({
          data: {
            ticketId,
            filename: req.file!.filename,
            originalName: req.file!.originalname,
            mimeType: req.file!.mimetype || "application/octet-stream",
            sizeBytes: req.file!.size,
            filepath: req.file!.path,
            isRemoved: false,
          },
          select: {
            id: true,
            ticketId: true,
            originalName: true,
            mimeType: true,
            sizeBytes: true,
            isRemoved: true,
            createdAt: true,
          },
        });
      });
    } catch (txError: any) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      if (txError?.status === 422) {
        return res.status(422).json({ error: txError.message });
      }
      throw txError;
    }

    return res.status(201).json(newAttachment);
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error("Upload attachment error:", error);
    return res.status(500).json({ error: "Failed to upload attachment" });
  }
});

// 3. Download Attachment Stream
app.get("/api/attachments/:id/download", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const queryRequesterId = req.query.requesterId;

    if (!isPositiveInteger(id)) {
      return res.status(400).json({ error: "Attachment id must be a valid positive integer" });
    }

    if (queryRequesterId === undefined || queryRequesterId === null || queryRequesterId === "") {
      return res.status(400).json({ error: "requesterId query parameter is required" });
    }

    if (!isPositiveInteger(queryRequesterId)) {
      return res.status(400).json({ error: "requesterId must be a valid positive integer" });
    }

    const attachmentId = Number(id);
    const numericRequesterId = Number(queryRequesterId);

    const prisma = getPrisma();
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: {
        ticket: {
          select: {
            requesterId: true,
          },
        },
      },
    });

    if (!attachment) {
      return res.status(404).json({ error: "Attachment not found" });
    }

    if (attachment.ticket.requesterId !== numericRequesterId) {
      return res.status(403).json({ error: "Forbidden: You do not have access to download this attachment" });
    }

    if (attachment.isRemoved) {
      return res.status(403).json({ error: "Attachment has been soft-removed and cannot be downloaded" });
    }

    if (!fs.existsSync(attachment.filepath)) {
      return res.status(404).json({ error: "Attachment binary file not found on disk" });
    }

    res.setHeader("Content-Type", attachment.mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(attachment.originalName)}"`);
    return res.sendFile(path.resolve(attachment.filepath));
  } catch (error) {
    console.error("Download attachment error:", error);
    return res.status(500).json({ error: "Failed to download attachment" });
  }
});

// 4. Soft-remove Attachment
const handleSoftRemove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const rawRequesterId = req.body?.requesterId || req.query?.requesterId;
    const rawRemovalReason = req.body?.removalReason || req.query?.removalReason;

    if (!isPositiveInteger(id)) {
      return res.status(400).json({ error: "Attachment id must be a valid positive integer" });
    }

    if (!rawRequesterId || !isPositiveInteger(rawRequesterId)) {
      return res.status(400).json({ error: "requesterId parameter is required" });
    }

    if (!rawRemovalReason || typeof rawRemovalReason !== "string") {
      return res.status(400).json({ error: "Soft-removal reason is required" });
    }

    const trimmedReason = rawRemovalReason.trim();
    if (trimmedReason.length < 3 || trimmedReason.length > 250) {
      return res.status(400).json({ error: "Soft-removal reason must be between 3 and 250 characters" });
    }

    const attachmentId = Number(id);
    const numericRequesterId = Number(rawRequesterId);

    const prisma = getPrisma();
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: {
        ticket: {
          select: {
            requesterId: true,
          },
        },
      },
    });

    if (!attachment) {
      return res.status(404).json({ error: "Attachment not found" });
    }

    if (attachment.ticket.requesterId !== numericRequesterId) {
      return res.status(403).json({ error: "Forbidden: You do not have access to remove this attachment" });
    }

    if (attachment.isRemoved) {
      return res.status(409).json({ error: "Attachment is already soft-removed" });
    }

    const updatedAttachment = await prisma.attachment.update({
      where: { id: attachmentId },
      data: {
        isRemoved: true,
        removalReason: trimmedReason,
        removedAt: new Date(),
        removedByRequesterId: numericRequesterId,
      },
      select: {
        id: true,
        ticketId: true,
        originalName: true,
        isRemoved: true,
        removalReason: true,
        removedAt: true,
      },
    });

    return res.status(200).json(updatedAttachment);
  } catch (error) {
    console.error("Soft-remove attachment error:", error);
    return res.status(500).json({ error: "Failed to soft-remove attachment" });
  }
};

app.delete("/api/attachments/:id/soft-remove", handleSoftRemove);
app.delete("/api/attachments/:id", handleSoftRemove);

export default app;
