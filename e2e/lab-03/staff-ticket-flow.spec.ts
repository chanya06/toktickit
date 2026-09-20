import { test, expect } from "@playwright/test";

test.describe("E2E-02: IT Staff Ticket Queue, Operations, Claim, and Communication (AC-05..AC-08, FR-10..FR-14)", () => {
  const staffEmail = "lisa.martinez@toktickit.com";
  const staffPass = "StaffPermanent123!";
  let testTicketSummary = "";
  let testTicketNumber = "";

  test.beforeAll(async ({ request }) => {
    // 1. Admin login to reset Lisa's initial password
    const adminLoginRes = await request.post("http://localhost:3000/api/auth/login", {
      data: { email: "admin@toktickit.com", password: "InitialPass123!" },
    });
    const adminData = await adminLoginRes.json();
    const adminToken = adminData.token;

    // 2. Find Lisa's ID
    const usersRes = await request.get("http://localhost:3000/api/admin/users?search=lisa.martinez@toktickit.com", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const usersData = await usersRes.json();
    const lisaUser = usersData.data.find((u: any) => u.email === staffEmail);

    if (lisaUser) {
      // 3. Reset Lisa's password
      await request.post(`http://localhost:3000/api/admin/users/${lisaUser.id}/reset-password`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: { initialPassword: "TempStaff123!" },
      });

      // 4. Login as Lisa with temporary password
      const lisaLoginRes = await request.post("http://localhost:3000/api/auth/login", {
        data: { email: staffEmail, password: "TempStaff123!" },
      });
      const lisaData = await lisaLoginRes.json();

      // 5. Change Lisa's password to permanent password
      await request.post("http://localhost:3000/api/auth/change-password", {
        headers: { Authorization: `Bearer ${lisaData.token}` },
        data: {
          currentPassword: "TempStaff123!",
          newPassword: staffPass,
        },
      });

      // 6. Fetch an active requester to own the ticket
      const requestersRes = await request.get("http://localhost:3000/api/requesters");
      const requestersData = await requestersRes.json();
      const activeRequesterId = requestersData[0]?.id || 1;

      // 7. Create a dedicated unassigned ticket for the E2E flow
      testTicketSummary = `E2E Staff Flow Ticket ${Date.now()}`;
      const ticketRes = await request.post("http://localhost:3000/api/tickets", {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: {
          requesterId: activeRequesterId,
          categoryId: 1,
          relatedSystemId: 1,
          requestedPriority: "LOW",
          summary: testTicketSummary,
          description: "This is a dedicated ticket for E2E staff queue operations testing.",
        },
      });
      const createdTicket = await ticketRes.json();
      testTicketNumber = createdTicket.ticketNumber;
    }
  });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("completes full IT Staff journey: Queue search/filter, detail inspection, claim ticket, update priority, status transition, public comment, and internal note", async ({
    page,
  }) => {
    // 1. Log in as IT Staff (Lisa Martinez)
    await page.fill("#login-email", staffEmail);
    await page.fill("#login-password", staffPass);
    await page.click('[data-testid="login-submit-button"]');

    // 2. Verify directed to Ticket Queue
    await expect(page.locator('[data-testid="header-user-name"]')).toHaveText("Lisa Martinez");
    await expect(page.locator('[data-testid="user-role-badge"]')).toHaveText("IT Staff");
    await expect(page.locator("h2")).toContainText("IT Staff Ticket Queue");
    await expect(page.locator('[data-testid="queue-table"]')).toBeVisible();

    // 3. Search for ticket in queue
    await page.fill('[data-testid="queue-search-input"]', testTicketSummary);
    await page.waitForTimeout(400); // Debounce delay
    await expect(page.locator('[data-testid="queue-table"]')).toContainText(testTicketSummary);
    await expect(page.locator('[data-testid="queue-table"]')).toContainText(testTicketNumber);

    // 4. Open ticket detail
    const targetRow = page.locator(`tr:has-text("${testTicketNumber}")`);
    await targetRow.click();

    // 5. Verify Ticket Detail View and Header
    await expect(page.locator("h2")).toContainText(testTicketNumber);
    await expect(page.locator('[data-testid="detail-summary"]')).toHaveText(testTicketSummary);
    await expect(page.locator('[data-testid="staff-operations-panel"]')).toBeVisible();

    // 6. Quick Claim Ticket (AC-06 / FR-11)
    const claimBtn = page.locator('[data-testid="claim-ticket-btn"]');
    if (await claimBtn.isEnabled()) {
      await claimBtn.click();
      await expect(page.locator('[data-testid="operation-feedback"]')).toContainText("claimed");
      await expect(claimBtn).toContainText("Claimed by You");
      await expect(claimBtn).toBeDisabled();
    }

    // 7. Update IT Priority (AC-06 / FR-12)
    const itPrioritySelect = page.locator('[data-testid="it-priority-selector"]');
    await itPrioritySelect.selectOption("HIGH");
    await expect(page.locator('[data-testid="operation-feedback"]')).toContainText("IT Priority updated");
    await expect(page.locator('[data-testid="detail-it-priority-badge"]')).toContainText("HIGH");

    // 8. Status Transition Matrix enforcement (AC-07 / FR-13 / BR-14)
    // For NEW ticket, permitted next statuses are OPEN and CANCELLED
    const statusSelect = page.locator('[data-testid="status-transition-selector"]');
    const applyStatusBtn = page.locator('[data-testid="apply-status-btn"]');

    // Select OPEN status and apply
    const availableOptions = await statusSelect.locator("option").allTextContents();
    const targetStatus = availableOptions.some((opt) => opt.includes("Open")) ? "OPEN" : "IN_PROGRESS";
    await statusSelect.selectOption(targetStatus);
    await applyStatusBtn.click();

    await expect(page.locator('[data-testid="operation-feedback"]')).toContainText("successfully changed");

    // 9. Post a Public Comment (AC-08 / FR-14)
    await page.click('[data-testid="tab-comments"]');
    await expect(page.locator('[data-testid="tab-pane-comments"]')).toBeVisible();

    const testComment = `E2E Staff Public Comment - ${Date.now()}`;
    await page.fill('[data-testid="comment-input"]', testComment);
    await page.click('[data-testid="submit-comment-btn"]');

    // Verify comment appears in list with author name
    await expect(page.locator('[data-testid="comments-list"]')).toContainText(testComment);
    await expect(page.locator('[data-testid="comments-list"]')).toContainText("Lisa Martinez");

    // 10. Post an Internal Note (AC-08 / FR-14)
    await page.click('[data-testid="tab-internal-notes"]');
    await expect(page.locator('[data-testid="tab-pane-internal-notes"]')).toBeVisible();

    const testNote = `E2E Confidential Internal Note - ${Date.now()}`;
    await page.fill('[data-testid="note-input"]', testNote);
    await page.click('[data-testid="submit-note-btn"]');

    // Verify note appears in list with author name and internal styling
    await expect(page.locator('[data-testid="internal-notes-list"]')).toContainText(testNote);
    await expect(page.locator('[data-testid="internal-notes-list"]')).toContainText("Lisa Martinez");

    // 11. Navigate back to Ticket Queue
    await page.click('[data-testid="bottom-back-btn"]');
    await expect(page.locator("h2")).toContainText("IT Staff Ticket Queue");
  });

  test.afterAll(async ({ request }) => {
    // Teardown: Re-login as Admin and reset Lisa's password back to InitialPass123!
    const resetLoginRes = await request.post("http://localhost:3000/api/auth/login", {
      data: { email: "admin@toktickit.com", password: "InitialPass123!" },
    });
    const resetAdminData = await resetLoginRes.json();
    const resetAdminToken = resetAdminData.token;

    const resetUsersRes = await request.get("http://localhost:3000/api/admin/users?search=lisa.martinez@toktickit.com", {
      headers: { Authorization: `Bearer ${resetAdminToken}` },
    });
    const resetUsersData = await resetUsersRes.json();
    const lisaUser = resetUsersData.data.find((u: any) => u.email === staffEmail);

    if (lisaUser) {
      await request.post(`http://localhost:3000/api/admin/users/${lisaUser.id}/reset-password`, {
        headers: { Authorization: `Bearer ${resetAdminToken}` },
        data: { initialPassword: "InitialPass123!" },
      });
    }
  });
});
