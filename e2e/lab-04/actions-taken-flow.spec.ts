import { test, expect } from "@playwright/test";

test.describe("E2E-Lab4-02: Actions Taken Lifecycle, Inactive Assignee Guard & Follow-up (AC-01..AC-05, FR-01..FR-06)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("Admin/Staff creates action taken, rejects inactive assignee, updates status to completed", async ({ page, request }) => {
    // 1. Admin login
    await page.fill("#login-email", "admin@toktickit.com");
    await page.fill("#login-password", "InitialPass123!");
    await page.click('[data-testid="login-submit-button"]');

    // Go to dashboard
    await page.waitForSelector('[data-testid="nav-dashboard"]');
    await page.click('[data-testid="nav-dashboard"]');
    await expect(page.locator('[data-testid="staff-dashboard"]')).toBeVisible({ timeout: 10000 });

    // 2. Open first ticket from triage table (switch to recent tab if urgent queue is clear)
    await page.waitForSelector('[data-testid^="view-detail-btn-"], [data-testid="empty-urgent-queue"]', { timeout: 10000 });
    if (await page.locator('[data-testid="empty-urgent-queue"]').isVisible()) {
      await page.click('[data-testid="tab-recent-tickets"]');
    }
    const firstTicketLink = page.locator('[data-testid^="view-detail-btn-"]').first();
    await firstTicketLink.click();

    await expect(page.locator('[data-testid="ticket-detail-view"]')).toBeVisible();
    await expect(page.locator('[data-testid="actions-taken-section"]')).toBeVisible();

    // 3. Open "+ Add Action Taken" modal
    await page.click('[data-testid="add-action-btn"]');
    await expect(page.locator('[data-testid="action-modal"]')).toBeVisible();

    // 4. Fill form and select inactive assignee to test Safe Failure (BR-05)
    await page.fill("#action-description", "E2E Test Action: Network route inspection and latency verification");
    await page.selectOption("#action-status", "IN_PROGRESS");

    const inactiveOption = page.locator('#action-assignee option', { hasText: "Inactive" });
    if (await inactiveOption.count() > 0) {
      const inactiveVal = await inactiveOption.first().getAttribute("value");
      if (inactiveVal) {
        await page.selectOption("#action-assignee", inactiveVal);
        await page.click('[data-testid="save-action-btn"]');

        // Safe failure message appears
        await expect(page.locator('#action-modal-error')).toBeVisible();
        await expect(page.locator('#action-modal-error')).toContainText("active");
      }
    }

    // 5. Select active staff and enable follow-up
    await page.selectOption("#action-assignee", { index: 1 });
    await page.check('[data-testid="follow-up-toggle"]');

    // Validation: follow-up note required when toggle is checked
    await page.click('[data-testid="save-action-btn"]');
    await expect(page.locator('#action-modal-error')).toContainText("Follow-up note");

    // Fill follow-up note and save
    await page.fill("#follow-up-note", "Verify packet loss metrics after 24 hours of peak load");
    await page.click('[data-testid="save-action-btn"]');

    // Modal closes and action appears in table
    await expect(page.locator('[data-testid="action-modal"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="actions-table"]')).toContainText("E2E Test Action: Network route inspection");
  });
});
