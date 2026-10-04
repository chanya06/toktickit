import http from "node:http";
import url from "node:url";

const users = [
  { id: 1, email: "admin@toktickit.com", fullName: "John Smith", role: "ADMINISTRATOR", isActive: true, department: "IT Infrastructure", mustChangePassword: false, createdAt: "2026-09-01T08:00:00Z" },
  { id: 2, email: "sarah.johnson@toktickit.com", fullName: "Sarah Johnson", role: "IT_STAFF", isActive: true, department: "Service Desk", mustChangePassword: false, createdAt: "2026-09-02T08:00:00Z" },
  { id: 3, email: "michael.brown@toktickit.com", fullName: "Michael Brown", role: "IT_STAFF", isActive: true, department: "Network Operations", mustChangePassword: false, createdAt: "2026-09-02T08:00:00Z" },
  { id: 4, email: "david.lee@toktickit.com", fullName: "David Lee", role: "IT_STAFF", isActive: false, department: "Hardware Support", mustChangePassword: false, createdAt: "2026-09-03T08:00:00Z" },
  { id: 5, email: "jennifer.anderson@toktickit.com", fullName: "Jennifer Anderson", role: "REQUESTER", isActive: true, department: "Finance", mustChangePassword: false, createdAt: "2026-09-03T08:00:00Z" },
  { id: 6, email: "alex.thompson@toktickit.com", fullName: "Alex Thompson", role: "REQUESTER", isActive: true, department: "HR", mustChangePassword: false, createdAt: "2026-09-04T08:00:00Z" },
];

let currentUser = users[0];

const tickets = [
  {
    id: 1,
    ticketNumber: "TKT-2026-000001",
    summary: "VPN Connection failure on Windows 11 Enterprise",
    description: "After installing the corporate security update yesterday, the IPSec VPN client fails during phase 2 handshake with error code SEC_ERROR_UNTRUSTED_ISSUER. Cannot connect to internal ERP databases.",
    category: { id: 3, name: "Network" },
    relatedSystem: { id: 2, name: "GlobalProtect VPN" },
    requestedPriority: "HIGH",
    itPriority: "HIGH",
    status: "OPEN",
    ownerId: 2,
    owner: { id: 2, fullName: "Sarah Johnson", email: "sarah.johnson@toktickit.com", role: "IT_STAFF" },
    ticketOwner: "Sarah Johnson",
    requesterId: 5,
    requester: { id: 5, fullName: "Jennifer Anderson", email: "jennifer.anderson@toktickit.com", department: "Finance" },
    isResolutionIndicated: true,
    createdAt: "2026-09-10T10:00:00Z",
    updatedAt: "2026-09-10T11:00:00Z",
    attachmentCount: 1,
    publicCommentCount: 2,
    internalNoteCount: 1
  },
  {
    id: 2,
    ticketNumber: "TKT-2026-000002",
    summary: "Laptop battery drains quickly after sleep mode",
    description: "Dell Latitude laptop discharges from 100% to 15% overnight while lid is closed.",
    category: { id: 1, name: "Hardware" },
    relatedSystem: { id: 1, name: "Hardware Workstation" },
    requestedPriority: "MEDIUM",
    itPriority: "MEDIUM",
    status: "IN_PROGRESS",
    ownerId: 3,
    owner: { id: 3, fullName: "Michael Brown", email: "michael.brown@toktickit.com", role: "IT_STAFF" },
    ticketOwner: "Michael Brown",
    requesterId: 6,
    requester: { id: 6, fullName: "Alex Thompson", email: "alex.thompson@toktickit.com", department: "HR" },
    isResolutionIndicated: false,
    createdAt: "2026-09-11T09:30:00Z",
    updatedAt: "2026-09-11T14:15:00Z",
    attachmentCount: 0,
    publicCommentCount: 1,
    internalNoteCount: 0
  },
  {
    id: 3,
    ticketNumber: "TKT-2026-000003",
    summary: "Request access to Financial Dashboard Q4",
    description: "Need read-only access to Tableau Q4 executive dashboard.",
    category: { id: 4, name: "Access" },
    relatedSystem: { id: 3, name: "Tableau Reporting" },
    requestedPriority: "LOW",
    itPriority: "LOW",
    status: "NEW",
    ownerId: null,
    owner: null,
    ticketOwner: "Unassigned",
    requesterId: 5,
    requester: { id: 5, fullName: "Jennifer Anderson", email: "jennifer.anderson@toktickit.com", department: "Finance" },
    isResolutionIndicated: false,
    createdAt: "2026-09-12T14:20:00Z",
    updatedAt: "2026-09-12T14:20:00Z",
    attachmentCount: 0,
    publicCommentCount: 0,
    internalNoteCount: 0
  }
];

const comments = [
  {
    id: 1,
    ticketId: 1,
    authorId: 2,
    content: "We have reviewed the network gateway logs. The certificate revocation list (CRL) cache on client side requires a force refresh. Please follow the instructions in the attached guide.",
    createdAt: "2026-09-10T10:30:00Z",
    author: { id: 2, fullName: "Sarah Johnson", role: "IT_STAFF", email: "sarah.johnson@toktickit.com" }
  },
  {
    id: 2,
    ticketId: 1,
    authorId: 5,
    content: "Thank you! I flushed the local CRL cache and re-authenticated with my smartcard. VPN tunnel connected immediately and ERP access is restored.",
    createdAt: "2026-09-10T11:00:00Z",
    author: { id: 5, fullName: "Jennifer Anderson", role: "REQUESTER", email: "jennifer.anderson@toktickit.com" }
  }
];

const internalNotes = [
  {
    id: 1,
    ticketId: 1,
    authorId: 2,
    content: "Root cause verified: Domain Controller CA certificate auto-renewal caused CRL skew on endpoint machines that missed group policy sync. Issue resolved without gateway restart. Ready for formal ticket closure once Requester completes validation.",
    createdAt: "2026-09-10T10:45:00Z",
    author: { id: 2, fullName: "Sarah Johnson", role: "IT_STAFF", email: "sarah.johnson@toktickit.com" }
  }
];

const server = http.createServer((req, res) => {
  // CORS
  const origin = req.headers.origin || "http://localhost:5173";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  let body = "";
  req.on("data", chunk => { body += chunk; });
  req.on("end", () => {
    let json = {};
    if (body) {
      try { json = JSON.parse(body); } catch (_) {}
    }

    const sendJson = (statusCode, data) => {
      res.writeHead(statusCode, { "Content-Type": "application/json" });
      res.end(JSON.stringify(data));
    };

    // 1. Health
    if (pathname === "/api/health") {
      return sendJson(200, { status: "ok" });
    }

    // 2. Categories
    if (pathname === "/api/categories") {
      return sendJson(200, [
        { id: 1, name: "Hardware", description: "Hardware issues" },
        { id: 2, name: "Software", description: "Software issues" },
        { id: 3, name: "Network", description: "Network issues" },
        { id: 4, name: "Access", description: "Access issues" }
      ]);
    }

    // 3. Related Systems
    if (pathname === "/api/related-systems") {
      return sendJson(200, [
        { id: 1, name: "Hardware Workstation" },
        { id: 2, name: "GlobalProtect VPN" },
        { id: 3, name: "Tableau Reporting" }
      ]);
    }

    // 4. Staff Assignees
    if (pathname === "/api/staff/assignees") {
      return sendJson(200, [
        { id: 1, fullName: "John Smith", email: "admin@toktickit.com", role: "ADMINISTRATOR" },
        { id: 2, fullName: "Sarah Johnson", email: "sarah.johnson@toktickit.com", role: "IT_STAFF" },
        { id: 3, fullName: "Michael Brown", email: "michael.brown@toktickit.com", role: "IT_STAFF" }
      ]);
    }

    // 5. Auth Login
    if (pathname === "/api/auth/login" && req.method === "POST") {
      const { email, password } = json;
      if (email === "inactive@toktickit.com") {
        return sendJson(401, { error: "Account is inactive. Please contact your IT administrator." });
      }
      if (password === "wrongpassword" || email === "unknown@toktickit.com") {
        return sendJson(401, { error: "Invalid email or password. Please try again." });
      }
      const u = users.find(x => x.email.toLowerCase() === (email || "").toLowerCase()) || users[0];
      currentUser = u;
      return sendJson(200, {
        token: "jwt-mock-" + u.role,
        user: u
      });
    }

    // 6. Auth Me
    if (pathname === "/api/auth/me") {
      return sendJson(200, { user: currentUser });
    }

    // 7. Auth Logout
    if (pathname === "/api/auth/logout") {
      return sendJson(200, { success: true });
    }

    // 8. Admin Users List
    if (pathname === "/api/admin/users" && req.method === "GET") {
      const auth = req.headers["authorization"] || "";
      if (auth.includes("REQUESTER")) {
        return sendJson(403, { error: "Forbidden: Administrator role required" });
      }
      let filtered = [...users];
      if (query.role) {
        filtered = filtered.filter(u => u.role === query.role);
      }
      if (query.search) {
        const s = String(query.search).toLowerCase();
        filtered = filtered.filter(u => u.fullName.toLowerCase().includes(s) || u.email.toLowerCase().includes(s));
      }
      return sendJson(200, {
        data: filtered,
        pagination: {
          page: 1,
          limit: 10,
          total: filtered.length,
          totalPages: 1,
          currentPage: 1,
          pageSize: 10,
          totalItems: filtered.length
        }
      });
    }

    // 9. Admin Create User
    if (pathname === "/api/admin/users" && req.method === "POST") {
      const { email, fullName, role, department } = json;
      if (users.some(u => u.email.toLowerCase() === (email || "").toLowerCase())) {
        return sendJson(409, { error: "Email address already registered (BR-05)" });
      }
      const newUser = {
        id: users.length + 1,
        email,
        fullName,
        role: role || "REQUESTER",
        isActive: true,
        department: department || "Operations",
        mustChangePassword: true,
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      return sendJson(201, { user: newUser });
    }

    // 10. Admin Update User
    const userMatch = pathname.match(/^\/api\/admin\/users\/(\d+)$/);
    if (userMatch && req.method === "PATCH") {
      const id = Number(userMatch[1]);
      const targetUser = users.find(u => u.id === id);
      if (!targetUser) return sendJson(404, { error: "User not found" });

      if (id === currentUser.id && json.isActive === false) {
        return sendJson(422, { error: "Safety Rule BR-17: You cannot deactivate your own account." });
      }
      const activeAdmins = users.filter(u => u.role === "ADMINISTRATOR" && u.isActive);
      if (targetUser.role === "ADMINISTRATOR" && (json.isActive === false || (json.role && json.role !== "ADMINISTRATOR")) && activeAdmins.length <= 1) {
        return sendJson(422, { error: "Cannot deactivate or remove the last active Administrator (BR-18)" });
      }

      Object.assign(targetUser, json);
      return sendJson(200, { user: targetUser });
    }

    // 11. Staff Queue Tickets
    if (pathname === "/api/staff/tickets") {
      if (query.search && String(query.search).includes("nonexistent")) {
        return sendJson(200, {
          data: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0, currentPage: 1, pageSize: 10, totalItems: 0 }
        });
      }
      return sendJson(200, {
        data: tickets,
        pagination: { page: 1, limit: 10, total: tickets.length, totalPages: 1, currentPage: 1, pageSize: 10, totalItems: tickets.length }
      });
    }

    // 12. Requester Tickets
    if (pathname === "/api/tickets" && req.method === "GET") {
      return sendJson(200, {
        data: tickets,
        pagination: { page: 1, limit: 10, total: tickets.length, totalPages: 1, currentPage: 1, pageSize: 10, totalItems: tickets.length }
      });
    }

    // 13. Ticket Detail
    const ticketMatch = pathname.match(/^\/api\/tickets\/(\d+)$/);
    if (ticketMatch && req.method === "GET") {
      const id = Number(ticketMatch[1]);
      const ticket = tickets.find(t => t.id === id) || tickets[0];
      return sendJson(200, ticket);
    }

    // 14. Ticket Comments
    const commentsMatch = pathname.match(/^\/api\/tickets\/(\d+)\/comments$/);
    if (commentsMatch) {
      if (req.method === "GET") {
        return sendJson(200, comments);
      }
      if (req.method === "POST") {
        const newC = {
          id: comments.length + 1,
          ticketId: Number(commentsMatch[1]),
          authorId: currentUser.id,
          content: json.content,
          createdAt: new Date().toISOString(),
          author: { id: currentUser.id, fullName: currentUser.fullName, role: currentUser.role }
        };
        comments.push(newC);
        return sendJson(201, { message: "Comment added", comment: newC });
      }
    }

    // 15. Ticket Internal Notes
    const notesMatch = pathname.match(/^\/api\/tickets\/(\d+)\/notes$/);
    if (notesMatch) {
      const auth = req.headers["authorization"] || "";
      if (auth.includes("REQUESTER")) {
        return sendJson(403, { error: "Access denied: Internal notes are restricted to IT Staff and Administrators (BR-14)" });
      }
      if (req.method === "GET") {
        return sendJson(200, internalNotes);
      }
      if (req.method === "POST") {
        const newN = {
          id: internalNotes.length + 1,
          ticketId: Number(notesMatch[1]),
          authorId: currentUser.id,
          content: json.content,
          createdAt: new Date().toISOString(),
          author: { id: currentUser.id, fullName: currentUser.fullName, role: currentUser.role }
        };
        internalNotes.push(newN);
        return sendJson(201, { message: "Internal note added", note: newN });
      }
    }

    // 16. Ticket Attachments
    const attMatch = pathname.match(/^\/api\/tickets\/(\d+)\/attachments$/);
    if (attMatch) {
      return sendJson(200, [
        { id: 1, ticketId: 1, originalName: "vpn-handshake-diagnostic-report.pdf", mimeType: "application/pdf", sizeBytes: 245760, isRemoved: false, createdAt: "2026-09-10T10:00:00Z" }
      ]);
    }

    // 17. Resolution Indication
    const resIndMatch = pathname.match(/^\/api\/tickets\/(\d+)\/resolve-indication$/);
    if (resIndMatch && req.method === "POST") {
      const id = Number(resIndMatch[1]);
      const ticket = tickets.find(t => t.id === id);
      if (ticket) ticket.isResolutionIndicated = true;
      return sendJson(200, { message: "Resolution indicated", ticket });
    }

    // Fallback 404
    sendJson(404, { error: "Endpoint not found" });
  });
});

server.listen(3000, () => {
  console.log("Zero-dependency mock backend running on port 3000");
});
