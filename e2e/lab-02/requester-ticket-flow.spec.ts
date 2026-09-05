import { test, expect } from "@playwright/test";

test.describe("Requester Ticket Lifecycle End-to-End Flow (Issue 14 / AC-01..AC-10)", () => {
  test("completes full requester journey: select context, create ticket, filter tickets, inspect detail, and ownership boundary", async ({
    page,
  }) => {
    // 1. Clear localStorage and navigate to client app home
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // 2. Requester selector modal should appear automatically if unselected
    const modalHeader = page.locator("#modal-title");
    await expect(modalHeader).toBeVisible();

    // Wait for dropdown to be populated from API (attached state)
    await page.waitForSelector("#requesterSelect option", { state: "attached" });

    // Select Jennifer Anderson (ID: 1)
    await page.selectOption("#requesterSelect", "1");
    await page.click(".modal-card button:has-text('Continue')");
    await expect(modalHeader).not.toBeVisible();

    // Verify header displays Jennifer Anderson
    await expect(page.locator("header")).toContainText("Jennifer Anderson");

    // 3. Navigate to Create Ticket Form
    await page.click("nav button:has-text('Create Ticket')");
    await expect(page.locator("h2")).toContainText("Create IT Support Ticket");

    // Wait for categories and systems to load
    await page.waitForSelector("#ticketCategory option", { state: "attached" });
    await page.waitForSelector("#ticketSystem option", { state: "attached" });

    // Fill form inputs
    await page.selectOption("#ticketCategory", { index: 0 });
    await page.selectOption("#ticketSystem", { index: 0 });
    await page.check("#priority-HIGH");
    const testSummary = `E2E Test Ticket - ${Date.now()}`;
    await page.fill("#ticketSummary", testSummary);
    await page.fill("#ticketDescription", "This is an automated end-to-end integration test ticket description.");

    // Submit ticket
    await page.click("button[type='submit']:has-text('Submit Ticket')");

    // 4. Success confirmation screen or navigation to My Tickets
    await expect(page.locator(".border-success")).toContainText("Ticket Created Successfully!");
    await page.click("button:has-text('View My Tickets')");

    // 5. Verify My Tickets table displays created ticket
    await expect(page.locator("main")).toContainText("My Tickets — View and track support tickets");
    await expect(page.locator("table")).toContainText(testSummary);
    await expect(page.locator("table")).toContainText("TKT-2026-");

    // 6. Search for the ticket using data-testid="search-input"
    await page.fill('[data-testid="search-input"]', testSummary);
    await page.waitForTimeout(400); // Debounce delay
    await expect(page.locator("table")).toContainText(testSummary);

    // 7. Inspect ticket detail view
    const viewButton = page.locator("tr", { hasText: testSummary }).locator("button:has-text('View')").first();
    await viewButton.click();

    await expect(page.locator("h2")).toContainText("TKT-2026-");
    await expect(page.locator("main")).toContainText(testSummary);
    await expect(page.locator("main")).toContainText("Ticket Date:");

    // 8. Verify switching active requester to Michael Brown (ID 2) clears ticket detail view
    await page.click("header button:has-text('Change Requester')");
    await expect(page.locator("#modal-title")).toBeVisible();
    await page.selectOption("#requesterSelect", "2");
    await page.click(".modal-card button:has-text('Continue')");

    // Michael Brown should see My Tickets view without Jennifer's ticket detail
    await expect(page.locator("header")).toContainText("Michael Brown");
    await expect(page.locator("body")).not.toContainText(testSummary);
  });
});
