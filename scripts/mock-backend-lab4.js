import http from "node:http";
import url from "node:url";

const users = [
  { id: 1, email: "admin@toktickit.com", fullName: "John Smith", role: "ADMINISTRATOR", isActive: true, department: "IT Infrastructure", mustChangePassword: false, createdAt: "2026-09-01T08:00:00Z" },
  { id: 2, email: "sarah.johnson@toktickit.com", fullName: "Sarah Johnson", role: "IT_STAFF", isActive: true, department: "Service Desk", mustChangePassword: false, createdAt: "2026-09-02T08:00:00Z" },
  { id: 3, email: "michael.brown@toktickit.com", fullName: "Michael Brown", role: "IT_STAFF", isActive: true, department: "Network Operations", mustChangePassword: false, createdAt: "2026-09-02T08:00:00Z" },
  { id: 4, email: "david.lee@toktickit.com", fullName: "David Lee (Inactive)", role: "IT_STAFF", isActive: false, department: "Hardware Support", mustChangePassword: false, createdAt: "2026-09-03T08:00:00Z" },
  { id: 5, email: "jennifer.anderson@example.com", fullName: "Jennifer Anderson", role: "REQUESTER", isActive: true, department: "Finance", mustChangePassword: false, createdAt: "2026-09-03T08:00:00Z" },
  { id: 6, email: "alex.thompson@example.com", fullName: "Alex Thompson", role: "REQUESTER", isActive: true, department: "HR", mustChangePassword: false, createdAt: "2026-09-04T08:00:00Z" },
];

let currentUser = users[0];

const tickets = [
  {
    id: 1,
    ticketNumber: "TKT-2026-000001",
    summary: "VPN Handshake Gateway Authentication Failure",
    description: "After the corporate security policy update, IPSec VPN fails during handshake with error code SEC_ERROR_UNTRUSTED_ISSUER. Requester cannot access financial reporting tools.",
    category: { id: 3, name: "Network" },
    relatedSystem: { id: 2, name: "GlobalProtect VPN" },
    requestedPriority: "HIGH",
    itPriority: "HIGH",
    status: "IN_PROGRESS",
    ownerId: 2,
    owner: { id: 2, fullName: "Sarah Johnson", email: "sarah.johnson@toktickit.com", role: "IT_STAFF" },
    ticketOwner: "Sarah Johnson",
    requesterId: 5,
    requester: { id: 5, fullName: "Jennifer Anderson", email: "jennifer.anderson@example.com", department: "Finance" },
    isResolutionIndicated: true,
    createdAt: "2026-10-25T10:00:00Z",
    updatedAt: "2026-10-31T14:30:00Z",
    attachmentCount: 1,
    publicCommentCount: 2,
    internalNoteCount: 1
  },
  {
    id: 2,
    ticketNumber: "TKT-2026-000002",
    summary: "Dell Latitude Battery Drainage and Power State Fault",
    description: "Battery drains from 100% to critical in under 2 hours while running standard office suite.",
    category: { id: 1, name: "Hardware" },
    relatedSystem: { id: 1, name: "Hardware Workstation" },
    requestedPriority: "MEDIUM",
    itPriority: "MEDIUM",
    status: "OPEN",
    ownerId: 3,
    owner: { id: 3, fullName: "Michael Brown", email: "michael.brown@toktickit.com", role: "IT_STAFF" },
    ticketOwner: "Michael Brown",
    requesterId: 5,
    requester: { id: 5, fullName: "Jennifer Anderson", email: "jennifer.anderson@example.com", department: "Finance" },
    isResolutionIndicated: false,
    createdAt: "2026-10-26T09:30:00Z",
    updatedAt: "2026-10-26T14:15:00Z",
    attachmentCount: 0,
    publicCommentCount: 1,
    internalNoteCount: 0
  },
  {
    id: 3,
    ticketNumber: "TKT-2026-000003",
    summary: "Production SAP ERP Connection Timeout on Payroll Module",
    description: "Finance team encountering continuous HTTP 504 gateway timeouts when generating monthly payroll batches.",
    category: { id: 2, name: "Software" },
    relatedSystem: { id: 2, name: "SAP ERP Production" },
    requestedPriority: "URGENT",
    itPriority: "URGENT",
    status: "OPEN",
    ownerId: null,
    owner: null,
    ticketOwner: "Unassigned",
    requesterId: 5,
    requester: { id: 5, fullName: "Jennifer Anderson", email: "jennifer.anderson@example.com", department: "Finance" },
    isResolutionIndicated: false,
    createdAt: "2026-10-28T08:15:00Z",
    updatedAt: "2026-10-28T08:15:00Z",
    attachmentCount: 0,
    publicCommentCount: 0,
    internalNoteCount: 0
  },
  {
    id: 4,
    ticketNumber: "TKT-2026-000004",
    summary: "Request Access to Tableau Executive Financial Dashboard",
    description: "Requesting quarterly read access to Tableau finance reports for board audit preparation.",
    category: { id: 4, name: "Access" },
    relatedSystem: { id: 3, name: "Tableau Reporting" },
    requestedPriority: "LOW",
    itPriority: "LOW",
    status: "WAITING_FOR_REQUESTER",
    ownerId: null,
    owner: null,
    ticketOwner: "Unassigned",
    requesterId: 5,
    requester: { id: 5, fullName: "Jennifer Anderson", email: "jennifer.anderson@example.com", department: "Finance" },
    isResolutionIndicated: false,
    createdAt: "2026-10-29T11:00:00Z",
    updatedAt: "2026-10-29T15:20:00Z",
    attachmentCount: 0,
    publicCommentCount: 1,
    internalNoteCount: 0
  },
  {
    id: 5,
    ticketNumber: "TKT-2026-000005",
    summary: "Exchange Online Mailbox Archive Quota Exceeded",
    description: "Outlook displays mailbox full prompt. IT Staff completed archive tier migration.",
    category: { id: 2, name: "Software" },
    relatedSystem: { id: 1, name: "Microsoft Exchange" },
    requestedPriority: "MEDIUM",
    itPriority: "MEDIUM",
    status: "RESOLVED",
    ownerId: 2,
    owner: { id: 2, fullName: "Sarah Johnson", email: "sarah.johnson@toktickit.com", role: "IT_STAFF" },
    ticketOwner: "Sarah Johnson",
    requesterId: 5,
    requester: { id: 5, fullName: "Jennifer Anderson", email: "jennifer.anderson@example.com", department: "Finance" },
    isResolutionIndicated: true,
    createdAt: "2026-10-20T10:00:00Z",
    updatedAt: "2026-10-30T16:00:00Z",
    attachmentCount: 0,
    publicCommentCount: 2,
    internalNoteCount: 1
  }
];

const actionsTaken = [
  {
    id: 1,
    ticketId: 1,
    actionDateTime: "2026-10-25T11:00:00.000Z",
    actionDescription: "Inspected network gateway RADIUS logs and validated intermediate CA certificate revocation list",
    result: "Discovered expired intermediate certificate CRL cache on client machine",
    performedById: 2,
    performedBy: { id: 2, fullName: "Sarah Johnson", email: "sarah.johnson@toktickit.com" },
    assigneeId: 3,
    assignee: { id: 3, fullName: "Michael Brown", email: "michael.brown@toktickit.com" },
    status: "COMPLETED",
    followUpRequired: false,
    followUpNote: null,
    attachmentNotes: "RADIUS-log-dump-20261025.txt",
    createdAt: "2026-10-25T11:05:00.000Z",
    updatedAt: "2026-10-25T11:45:00.000Z"
  },
  {
    id: 2,
    ticketId: 1,
    actionDateTime: "2026-10-25T14:30:00.000Z",
    actionDescription: "Pushed group policy certificate store refresh and tested client tunnel establishment",
    result: "Tunnel re-established successfully; monitored connection latency for 30 minutes",
    performedById: 3,
    performedBy: { id: 3, fullName: "Michael Brown", email: "michael.brown@toktickit.com" },
    assigneeId: 2,
    assignee: { id: 2, fullName: "Sarah Johnson", email: "sarah.johnson@toktickit.com" },
    status: "COMPLETED",
    followUpRequired: true,
    followUpNote: "Verify certificate auto-enrollment persists through next scheduled domain sync",
    attachmentNotes: "gpo-result-report.pdf",
    createdAt: "2026-10-25T14:35:00.000Z",
    updatedAt: "2026-10-25T15:10:00.000Z"
  },
  {
    id: 3,
    ticketId: 1,
    actionDateTime: "2026-10-31T09:00:00.000Z",
    actionDescription: "Final gateway validation and stability verification under sustained VPN traffic",
    result: null,
    performedById: 2,
    performedBy: { id: 2, fullName: "Sarah Johnson", email: "sarah.johnson@toktickit.com" },
    assigneeId: 2,
    assignee: { id: 2, fullName: "Sarah Johnson", email: "sarah.johnson@toktickit.com" },
    status: "IN_PROGRESS",
    followUpRequired: false,
    followUpNote: null,
    attachmentNotes: null,
    createdAt: "2026-10-31T09:05:00.000Z",
    updatedAt: "2026-10-31T09:05:00.000Z"
  }
];

const comments = [
  {
    id: 1,
    ticketId: 1,
    authorId: 2,
    content: "We have reviewed the network gateway logs. The certificate revocation list (CRL) cache on client side requires a force refresh.",
    createdAt: "2026-10-25T10:30:00Z",
    author: { id: 2, fullName: "Sarah Johnson", role: "IT_STAFF", email: "sarah.johnson@toktickit.com" }
  },
  {
    id: 2,
    ticketId: 1,
    authorId: 5,
    content: "I refreshed the certificate store and connected successfully. ERP access is functioning normally now!",
    createdAt: "2026-10-31T14:30:00Z",
    author: { id: 5, fullName: "Jennifer Anderson", role: "REQUESTER", email: "jennifer.anderson@example.com" }
  }
];

const internalNotes = [
  {
    id: 1,
    ticketId: 1,
    authorId: 2,
    content: "Root cause verified: Domain Controller CA certificate auto-renewal caused CRL skew on endpoint machines that missed group policy sync. Issue resolved without gateway restart. Ready for formal ticket closure once Requester completes validation.",
    createdAt: "2026-10-25T10:45:00Z",
    author: { id: 2, fullName: "Sarah Johnson", role: "IT_STAFF", email: "sarah.johnson@toktickit.com" }
  }
];

const server = http.createServer((req, res) => {
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

    // Health
    if (pathname === "/api/health") {
      return sendJson(200, { status: "ok" });
    }

    // Auth Login
    if (pathname === "/api/auth/login" && req.method === "POST") {
      const { email, password } = json;
      if (email === "inactive@toktickit.com") {
        return sendJson(401, { error: "Account is inactive. Please contact your IT administrator." });
      }
      if (password === "wrongpassword") {
        return sendJson(401, { error: "Invalid email or password. Please try again." });
      }
      const u = users.find(x => x.email.toLowerCase() === (email || "").toLowerCase()) || users[0];
      currentUser = u;
      return sendJson(200, {
        token: "jwt-mock-" + u.role,
        user: u
      });
    }

    // Auth Me
    if (pathname === "/api/auth/me") {
      return sendJson(200, { user: currentUser });
    }

    // Auth Logout
    if (pathname === "/api/auth/logout") {
      return sendJson(200, { success: true });
    }

    // Categories
    if (pathname === "/api/categories" || pathname === "/api/tickets/categories") {
      return sendJson(200, [
        { id: 1, name: "Hardware", description: "Hardware issues" },
        { id: 2, name: "Software", description: "Software issues" },
        { id: 3, name: "Network", description: "Network issues" },
        { id: 4, name: "Access", description: "Access issues" }
      ]);
    }

    // Related Systems
    if (pathname === "/api/related-systems" || pathname === "/api/tickets/systems") {
      return sendJson(200, [
        { id: 1, name: "Hardware Workstation" },
        { id: 2, name: "GlobalProtect VPN" },
        { id: 3, name: "Tableau Reporting" }
      ]);
    }

    // Staff Assignees
    if (pathname === "/api/staff/assignees") {
      return sendJson(200, [
        { id: 1, fullName: "John Smith", email: "admin@toktickit.com", role: "ADMINISTRATOR", isActive: true },
        { id: 2, fullName: "Sarah Johnson", email: "sarah.johnson@toktickit.com", role: "IT_STAFF", isActive: true },
        { id: 3, fullName: "Michael Brown", email: "michael.brown@toktickit.com", role: "IT_STAFF", isActive: true },
        { id: 4, fullName: "David Lee (Inactive)", email: "david.lee@toktickit.com", role: "IT_STAFF", isActive: false },
      ]);
    }

    // Requester Dashboard
    if (pathname === "/api/dashboard/requester") {
      const dashboardTickets = tickets.filter(t => t.requesterId === 5).map(t => ({
        id: t.id,
        ticketNumber: t.ticketNumber,
        summary: t.summary,
        category: t.category.name,
        status: t.status,
        itPriority: t.itPriority,
        isResolutionIndicated: t.isResolutionIndicated,
        owner: t.owner ? { fullName: t.owner.fullName } : null,
        actionsCount: t.id === 1 ? 3 : 0,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      }));

      return sendJson(200, {
        metrics: {
          myOpenTickets: 2,
          waitingForRequester: 1,
          recentlyUpdated: 4,
          recentlyResolved: 1
        },
        recentTickets: dashboardTickets
      });
    }

    // Staff Dashboard
    if (pathname === "/api/dashboard/staff") {
      const dashboardTickets = tickets.map(t => ({
        id: t.id,
        ticketNumber: t.ticketNumber,
        summary: t.summary,
        category: t.category.name,
        status: t.status,
        itPriority: t.itPriority,
        isResolutionIndicated: t.isResolutionIndicated,
        owner: t.owner ? { fullName: t.owner.fullName } : null,
        actionsCount: t.id === 1 ? 3 : 0,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      }));

      return sendJson(200, {
        metrics: {
          unassignedTickets: 2,
          myAssignedTickets: 3,
          byStatus: {
            NEW: 0,
            OPEN: 2,
            IN_PROGRESS: 1,
            WAITING_FOR_REQUESTER: 1,
            PENDING: 0
          },
          byPriority: {
            URGENT: 1,
            HIGH: 2,
            MEDIUM: 1,
            LOW: 1
          },
          recentlyUpdatedCount: 4
        },
        urgentTickets: dashboardTickets.filter(t => t.itPriority === "URGENT" || t.itPriority === "HIGH"),
        recentTickets: dashboardTickets
      });
    }

    // Admin Dashboard
    if (pathname === "/api/dashboard/admin") {
      const dashboardTickets = tickets.map(t => ({
        id: t.id,
        ticketNumber: t.ticketNumber,
        summary: t.summary,
        category: t.category.name,
        status: t.status,
        itPriority: t.itPriority,
        isResolutionIndicated: t.isResolutionIndicated,
        owner: t.owner ? { fullName: t.owner.fullName } : null,
        actionsCount: t.id === 1 ? 3 : 0,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      }));

      return sendJson(200, {
        systemUserStats: {
          totalUsers: 6,
          activeRequesters: 2,
          activeStaff: 2,
          administrators: 1,
          inactiveUsers: 1
        },
        operationalMetrics: {
          unassignedTickets: 2,
          myAssignedTickets: 3,
          byStatus: {
            NEW: 0,
            OPEN: 2,
            IN_PROGRESS: 1,
            WAITING_FOR_REQUESTER: 1,
            PENDING: 0
          },
          byPriority: {
            URGENT: 1,
            HIGH: 2,
            MEDIUM: 1,
            LOW: 1
          },
          recentlyUpdatedCount: 4
        },
        urgentTickets: dashboardTickets.filter(t => t.itPriority === "URGENT" || t.itPriority === "HIGH"),
        recentTickets: dashboardTickets
      });
    }

    // Ticket Actions
    const actionsMatch = pathname.match(/^\/api\/tickets\/(\d+)\/actions$/);
    if (actionsMatch) {
      const ticketId = Number(actionsMatch[1]);
      if (req.method === "GET") {
        const filtered = actionsTaken.filter(a => a.ticketId === ticketId);
        return sendJson(200, filtered);
      }
      if (req.method === "POST") {
        if (json.assigneeId === 4) {
          return sendJson(422, { error: "Cannot assign to inactive account (David Lee is inactive - BR-05)" });
        }
        if (json.followUpRequired && (!json.followUpNote || json.followUpNote.trim().length < 5)) {
          return sendJson(422, { error: "Follow-up note is required (minimum 5 characters) when follow-up is checked (BR-04)" });
        }
        const newA = {
          id: actionsTaken.length + 1,
          ticketId,
          actionDateTime: json.actionDateTime || new Date().toISOString(),
          actionDescription: json.actionDescription,
          result: json.result || null,
          performedById: currentUser.id,
          performedBy: { id: currentUser.id, fullName: currentUser.fullName, email: currentUser.email },
          assigneeId: json.assigneeId ? Number(json.assigneeId) : null,
          assignee: json.assigneeId ? users.find(u => u.id === Number(json.assigneeId)) : null,
          status: json.status || "PENDING",
          followUpRequired: !!json.followUpRequired,
          followUpNote: json.followUpNote || null,
          attachmentNotes: json.attachmentNotes || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        actionsTaken.push(newA);
        return sendJson(201, newA);
      }
    }

    // Ticket Actions Status Transition
    const actionStatusMatch = pathname.match(/^\/api\/tickets\/(\d+)\/actions\/(\d+)\/status$/);
    if (actionStatusMatch && req.method === "PATCH") {
      const actionId = Number(actionStatusMatch[2]);
      const act = actionsTaken.find(a => a.id === actionId);
      if (!act) return sendJson(404, { error: "Action taken not found" });
      if (json.status === "COMPLETED" && (!json.result || !json.result.trim())) {
        return sendJson(422, { error: "Result/Outcome is required when status is marked as Completed." });
      }
      act.status = json.status;
      if (json.result) act.result = json.result;
      act.updatedAt = new Date().toISOString();
      return sendJson(200, act);
    }

    // Ticket Actions Edit
    const singleActionMatch = pathname.match(/^\/api\/tickets\/(\d+)\/actions\/(\d+)$/);
    if (singleActionMatch && req.method === "PATCH") {
      const actionId = Number(singleActionMatch[2]);
      const act = actionsTaken.find(a => a.id === actionId);
      if (!act) return sendJson(404, { error: "Action taken not found" });
      if (json.assigneeId === 4) {
        return sendJson(422, { error: "Cannot assign to inactive account (BR-05)" });
      }
      Object.assign(act, json, { updatedAt: new Date().toISOString() });
      return sendJson(200, act);
    }

    // Ticket Status Transition with Resolution Gate
    const ticketStatusMatch = pathname.match(/^\/api\/tickets\/(\d+)\/status$/);
    if (ticketStatusMatch && req.method === "PATCH") {
      const ticketId = Number(ticketStatusMatch[1]);
      const t = tickets.find(x => x.id === ticketId);
      if (!t) return sendJson(404, { error: "Ticket not found" });

      if (json.status === "RESOLVED") {
        const activeActions = actionsTaken.filter(a => a.ticketId === ticketId && (a.status === "PENDING" || a.status === "IN_PROGRESS"));
        if (activeActions.length > 0) {
          return sendJson(409, {
            error: `Cannot resolve ticket: ticket has ${activeActions.length} pending or in-progress action(s) taken. All actions must be completed or cancelled before resolution (BR-08).`
          });
        }
      }

      t.status = json.status;
      t.updatedAt = new Date().toISOString();
      if (json.resolutionNote) {
        comments.push({
          id: comments.length + 1,
          ticketId,
          authorId: currentUser.id,
          content: `Resolution note: ${json.resolutionNote}`,
          createdAt: new Date().toISOString(),
          author: { id: currentUser.id, fullName: currentUser.fullName, role: currentUser.role }
        });
      }
      return sendJson(200, { message: "Status updated successfully", ticket: t });
    }

    // Staff Tickets
    if (pathname === "/api/staff/tickets") {
      let filtered = [...tickets];
      if (query.status) {
        const statuses = String(query.status).split(",");
        filtered = filtered.filter(t => statuses.includes(t.status));
      }
      if (query.unassigned === "true") {
        filtered = filtered.filter(t => t.ownerId === null);
      }
      return sendJson(200, {
        data: filtered,
        pagination: { page: 1, limit: 10, total: filtered.length, totalPages: 1, currentPage: 1, pageSize: 10, totalItems: filtered.length }
      });
    }

    // Requester Tickets
    if (pathname === "/api/tickets" && req.method === "GET") {
      let filtered = tickets.filter(t => t.requesterId === 5);
      if (query.status) {
        const statuses = String(query.status).split(",");
        filtered = filtered.filter(t => statuses.includes(t.status));
      }
      return sendJson(200, {
        data: filtered,
        pagination: { page: 1, limit: 10, total: filtered.length, totalPages: 1, currentPage: 1, pageSize: 10, totalItems: filtered.length }
      });
    }

    // Ticket Detail
    const ticketMatch = pathname.match(/^\/api\/tickets\/(\d+)$/);
    if (ticketMatch && req.method === "GET") {
      const id = Number(ticketMatch[1]);
      const ticket = tickets.find(t => t.id === id) || tickets[0];
      return sendJson(200, ticket);
    }

    // Ticket Comments
    const commentsMatch = pathname.match(/^\/api\/tickets\/(\d+)\/comments$/);
    if (commentsMatch) {
      if (req.method === "GET") {
        return sendJson(200, comments.filter(c => c.ticketId === Number(commentsMatch[1])));
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

    // Ticket Notes
    const notesMatch = pathname.match(/^\/api\/tickets\/(\d+)\/notes$/);
    if (notesMatch) {
      if (req.method === "GET") {
        return sendJson(200, internalNotes.filter(n => n.ticketId === Number(notesMatch[1])));
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

    // Ticket Attachments
    const attMatch = pathname.match(/^\/api\/tickets\/(\d+)\/attachments$/);
    if (attMatch) {
      return sendJson(200, [
        { id: 1, ticketId: 1, originalName: "vpn-handshake-diagnostic-report.pdf", mimeType: "application/pdf", sizeBytes: 245760, isRemoved: false, createdAt: "2026-10-25T10:00:00Z" }
      ]);
    }

    // Resolution Indication
    const resIndMatch = pathname.match(/^\/api\/tickets\/(\d+)\/resolve-indication$/);
    if (resIndMatch && req.method === "POST") {
      const id = Number(resIndMatch[1]);
      const ticket = tickets.find(t => t.id === id);
      if (ticket) ticket.isResolutionIndicated = true;
      return sendJson(200, { message: "Resolution indicated", ticket });
    }

    // Default 404
    sendJson(404, { error: "Endpoint not found" });
  });
});

server.listen(3000, () => {
  console.log("TokTickIT Lab 4 Mock Backend listening on http://localhost:3000");
});

