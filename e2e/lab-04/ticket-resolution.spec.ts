import { test, expect } from "@playwright/test";

test.describe("E2E-Lab4-03: Resolution Gate Preconditions & Requester Reopen Flow (AC-09..AC-10, BR-07, BR-08)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("Resolution gate blocks resolving ticket with active child actions, succeeds once completed, and allows requester reopen", async ({ page, request }) => {
    // 1. Admin login to ensure Jennifer & Emily credentials
    const adminLoginRes = await request.post("http://localhost:3000/api/auth/login", {
      data: { email: "admin@toktickit.com", password: "InitialPass123!" },
    });
    const { token: adminToken } = await adminLoginRes.json();

    // Reset Jennifer Anderson
    const usersRes = await request.get("http://localhost:3000/api/admin/users?search=jennifer.anderson@example.com", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const { data: usersData } = await usersRes.json();
    const jennifer = usersData[0];
    if (jennifer) {
      await request.post(`http://localhost:3000/api/admin/users/${jennifer.id}/reset-password`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: { initialPassword: "Requester123!" },
      });
      const loginRes = await request.post("http://localhost:3000/api/auth/login", {
        data: { email: "jennifer.anderson@example.com", password: "Requester123!" },
      });
      const loginData = await loginRes.json();
      await request.post("http://localhost:3000/api/auth/change-password", {
        headers: { Authorization: `Bearer ${loginData.token}` },
        data: { currentPassword: "Requester123!", newPassword: "PermanentPass123!" },
      });
    }

    // 2. Requester creates a new ticket
    const reqLoginRes = await request.post("http://localhost:3000/api/auth/login", {
      data: { email: "jennifer.anderson@example.com", password: "PermanentPass123!" },
    });
    const { token: requesterToken } = await reqLoginRes.json();

    // Get categories & systems
    const catRes = await request.get("http://localhost:3000/api/tickets/categories", {
      headers: { Authorization: `Bearer ${requesterToken}` },
    });
    const categories = await catRes.json();
    const sysRes = await request.get("http://localhost:3000/api/tickets/systems", {
      headers: { Authorization: `Bearer ${requesterToken}` },
    });
    const systems = await sysRes.json();

    const createTicketRes = await request.post("http://localhost:3000/api/tickets", {
      headers: { Authorization: `Bearer ${requesterToken}` },
      data: {
        categoryId: categories[0]?.id || 1,
        relatedSystemId: systems[0]?.id || 1,
        requestedPriority: "HIGH",
        summary: "E2E Resolution Gate Verification Ticket",
        description: "Testing child action blocking resolution and requester reopen workflow",
      },
    });
    const newTicket = await createTicketRes.json();
    const ticketId = newTicket.id;

    // Transition ticket to IN_PROGRESS so it is ready for resolution
    await request.patch(`http://localhost:3000/api/tickets/${ticketId}/status`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { status: "OPEN" },
    });
    await request.patch(`http://localhost:3000/api/tickets/${ticketId}/status`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { status: "IN_PROGRESS" },
    });

    // Create an active (IN_PROGRESS) action taken for this ticket
    await request.post(`http://localhost:3000/api/tickets/${ticketId}/actions`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        actionDescription: "Investigating database lock contention",
        status: "IN_PROGRESS",
      },
    });

    // 3. Admin logs into UI and navigates to the ticket
    await page.fill("#login-email", "admin@toktickit.com");
    await page.fill("#login-password", "InitialPass123!");
    await page.click('[data-testid="login-submit-button"]');

    await expect(page.locator('[data-testid="header-user-profile"]')).toBeVisible({ timeout: 10000 });
    await page.goto(`/tickets/${ticketId}`);
    await expect(page.locator('[data-testid="ticket-detail-view"]')).toBeVisible();

    // 4. Test BR-08: Staff tries to resolve ticket while action is IN_PROGRESS -> blocked
    await page.selectOption('[data-testid="status-transition-selector"]', "RESOLVED");
    await expect(page.locator('[data-testid="resolution-note-container"]')).toBeVisible();
    await page.fill('[data-testid="resolution-note-input"]', "Attempting premature resolution");
    await page.click('[data-testid="apply-status-btn"]');

    // Feedback displays error indicating active child actions
    await expect(page.locator('[data-testid="operation-feedback"]')).toBeVisible();
    await expect(page.locator('[data-testid="operation-feedback"]')).toContainText("Cannot resolve ticket: all child actions taken must be completed");

    // 5. Complete the child action via the quick transition button in UI
    const statusBtn = page.locator('[data-testid^="transition-action-btn-"]').first();
    await statusBtn.click();

    // Fill result input and confirm transition
    const resultInput = page.locator('[data-testid^="transition-result-input-"]').first();
    await expect(resultInput).toBeVisible();
    await resultInput.fill("Contention cleared by tuning isolation level");

    const confirmBtn = page.locator('[data-testid^="transition-confirm-btn-"]').first();
    await confirmBtn.click();

    // Now resolve the ticket successfully
    await page.selectOption('[data-testid="status-transition-selector"]', "RESOLVED");
    await page.fill('[data-testid="resolution-note-input"]', "Issue successfully mitigated and verified");
    await page.click('[data-testid="apply-status-btn"]');

    // Verify ticket is now RESOLVED
    await expect(page.locator('[data-testid="detail-status-badge"]')).toContainText("RESOLVED");

    // 6. Logout Admin, Login as Requester (Jennifer)
    await page.click('[data-testid="header-logout-button"]');

    await page.fill("#login-email", "jennifer.anderson@example.com");
    await page.fill("#login-password", "PermanentPass123!");
    await page.click('[data-testid="login-submit-button"]');
    await expect(page.locator('[data-testid="header-user-profile"]')).toBeVisible({ timeout: 10000 });

    // Navigate to the resolved ticket
    await page.goto(`/tickets/${ticketId}`);
    await expect(page.locator('[data-testid="ticket-detail-view"]')).toBeVisible();

    // 7. Verify Requester Reopen controls (BR-07 / FR-13 / AC-10)
    await expect(page.locator('[data-testid="requester-reopen-banner"]')).toBeVisible();
    await expect(page.locator('[data-testid="reopen-ticket-btn"]')).toBeVisible();

    // Click Reopen and open modal
    await page.click('[data-testid="reopen-ticket-btn"]');
    await expect(page.locator('[data-testid="reopen-ticket-modal"]')).toBeVisible();

    // Fill reason and confirm reopen
    await page.fill('[data-testid="reopen-reason-input"]', "Issue recurred after system restart");
    await page.click('[data-testid="confirm-reopen-btn"]');

    // Modal closes and status changes to REOPENED
    await expect(page.locator('[data-testid="reopen-ticket-modal"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="detail-status-badge"]')).toContainText("REOPENED");

    // Cleanup: Reset Jennifer's password back to InitialPass123! to preserve test idempotence
    if (jennifer) {
      await request.post(`http://localhost:3000/api/admin/users/${jennifer.id}/reset-password`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: { initialPassword: "InitialPass123!" },
      });
    }
  });
});

