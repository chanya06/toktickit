import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

const baseDir = path.join(process.cwd(), "artifacts", "lab-02", "screenshots");
const dirs = {
  createTicket: path.join(baseDir, "create-ticket"),
  myTickets: path.join(baseDir, "my-tickets"),
  ticketDetail: path.join(baseDir, "ticket-detail"),
};

test.beforeAll(() => {
  for (const dir of Object.values(dirs)) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
});

const viewports = [
  { name: "desktop", width: 1280, height: 800 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 375, height: 667 },
];

// 1. Capture Responsive Layout Screenshots for all 3 viewports
for (const vp of viewports) {
  test.describe(`Responsive Layout Screenshots (${vp.name} ${vp.width}x${vp.height})`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test(`captures responsive views for ${vp.name}`, async ({ page }) => {
      // Clear storage
      await page.goto("/");
      await page.evaluate(() => localStorage.clear());
      await page.reload();

      await page.waitForSelector("#requesterSelect option", { state: "attached" });
      await page.selectOption("#requesterSelect", "1");
      await page.click(".modal-card button:has-text('Continue')");

      // Capture My Tickets responsive view
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(dirs.myTickets, `${vp.name}.png`), fullPage: true });

      // Navigate to Create Ticket
      await page.click("nav button:has-text('Create Ticket')");
      await page.waitForSelector("#ticketCategory option", { state: "attached" });
      await page.fill("#ticketSummary", `Responsive UI Test (${vp.name})`);
      await page.fill("#ticketDescription", "Capturing responsive visual design system inspection screenshot with initial attachment.");

      const fileInput = page.locator('[data-testid="initial-file-input"]');
      await fileInput.setInputFiles({
        name: "sample-doc.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.from("%PDF-1.4 Sample Screenshot Attachment"),
      });
      await page.waitForTimeout(300);

      // Capture Create Ticket responsive view
      await page.screenshot({ path: path.join(dirs.createTicket, `${vp.name}.png`), fullPage: true });

      // Submit ticket
      await page.selectOption("#ticketCategory", { index: 0 });
      await page.selectOption("#ticketSystem", { index: 0 });
      await page.check("#priority-HIGH");
      await page.click("button[type='submit']:has-text('Submit Ticket')");
      await page.waitForTimeout(400);

      // View Ticket Detail
      await page.click("button:has-text('View My Tickets')");
      await page.waitForTimeout(400);

      const viewBtn = vp.name === "mobile"
        ? page.locator("[data-testid='mobile-tickets-cards'] button:has-text('View Details')").first()
        : page.locator("[data-testid='desktop-tickets-table'] button:has-text('View')").first();

      if (await viewBtn.isVisible()) {
        await viewBtn.click();
        await page.waitForTimeout(400);
        await page.screenshot({ path: path.join(dirs.ticketDetail, `${vp.name}.png`), fullPage: true });
      }
    });
  });
}

// 2. Capture Working State & Feature Screenshots (Desktop 1280px)
test.describe("Working State & Action Screenshots", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("captures simulated login requester selector modal", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector("#modal-title");
    await page.screenshot({ path: path.join(dirs.createTicket, "requester-selector.png"), fullPage: true });
  });

  test("captures create ticket validation error state with inline red messages", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector("#requesterSelect option", { state: "attached" });
    await page.selectOption("#requesterSelect", "1");
    await page.click(".modal-card button:has-text('Continue')");

    await page.click("nav button:has-text('Create Ticket')");
    await page.waitForSelector("#ticketCategory option", { state: "attached" });

    // Enter short summary <5 chars and description <10 chars
    await page.fill("#ticketSummary", "Bad");
    await page.fill("#ticketDescription", "Short");
    await page.click("button[type='submit']:has-text('Submit Ticket')");
    await page.waitForTimeout(300);

    await page.screenshot({ path: path.join(dirs.createTicket, "validation-error.png"), fullPage: true });
  });

  test("captures create ticket submitting busy state", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector("#requesterSelect option", { state: "attached" });
    await page.selectOption("#requesterSelect", "1");
    await page.click(".modal-card button:has-text('Continue')");

    await page.click("nav button:has-text('Create Ticket')");
    await page.waitForSelector("#ticketCategory option", { state: "attached" });
    await page.selectOption("#ticketCategory", { index: 0 });
    await page.selectOption("#ticketSystem", { index: 0 });
    await page.fill("#ticketSummary", "Testing Busy Loading State Submission");
    await page.fill("#ticketDescription", "Describing problem to test submit button busy spinner and disabled state.");

    // Intercept POST /api/tickets to introduce artificial delay
    await page.route("**/api/tickets", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await route.continue();
    });

    await page.click("button[type='submit']:has-text('Submit Ticket')");
    await page.waitForTimeout(300); // Capture while route is pending

    await page.screenshot({ path: path.join(dirs.createTicket, "submitting-busy.png"), fullPage: true });
  });

  test("captures create ticket success confirmation with TKT-YYYY-XXXXXX number from DB", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector("#requesterSelect option", { state: "attached" });
    await page.selectOption("#requesterSelect", "1");
    await page.click(".modal-card button:has-text('Continue')");

    await page.click("nav button:has-text('Create Ticket')");
    await page.waitForSelector("#ticketCategory option", { state: "attached" });
    await page.selectOption("#ticketCategory", { index: 0 });
    await page.selectOption("#ticketSystem", { index: 0 });
    await page.fill("#ticketSummary", "Successful Ticket Creation Display Test");
    await page.fill("#ticketDescription", "Testing ticket creation confirmation card showing official ticket number from database.");
    await page.click("button[type='submit']:has-text('Submit Ticket')");

    await expect(page.locator(".border-success")).toContainText("Ticket Created Successfully!");
    await page.screenshot({ path: path.join(dirs.createTicket, "success-confirmation.png"), fullPage: true });
  });

  test("captures backend failure state with preserved form values", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector("#requesterSelect option", { state: "attached" });
    await page.selectOption("#requesterSelect", "1");
    await page.click(".modal-card button:has-text('Continue')");

    await page.click("nav button:has-text('Create Ticket')");
    await page.waitForSelector("#ticketCategory option", { state: "attached" });
    await page.selectOption("#ticketCategory", { index: 0 });
    await page.selectOption("#ticketSystem", { index: 0 });
    const preservedSummary = "Preserved Summary Text on Server Error";
    const preservedDesc = "Preserved detailed description content after backend database failure simulation.";
    await page.fill("#ticketSummary", preservedSummary);
    await page.fill("#ticketDescription", preservedDesc);

    // Intercept POST /api/tickets and return 500 error
    await page.route("**/api/tickets", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Simulated Internal Server Database Error" }),
      });
    });

    await page.click("button[type='submit']:has-text('Submit Ticket')");
    await page.waitForTimeout(300);

    await page.screenshot({ path: path.join(dirs.createTicket, "api-failure-retained.png"), fullPage: true });
  });

  test("captures my tickets search filter and cross requester isolation", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector("#requesterSelect option", { state: "attached" });
    await page.selectOption("#requesterSelect", "1");
    await page.click(".modal-card button:has-text('Continue')");

    // Search and filter
    await page.fill('[data-testid="search-input"]', "laptop");
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(dirs.myTickets, "search-filter.png"), fullPage: true });

    // Switch requester to Michael Brown
    await page.click("header button:has-text('Change Requester')");
    await page.selectOption("#requesterSelect", "2");
    await page.click(".modal-card button:has-text('Continue')");
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(dirs.myTickets, "cross-requester-isolation.png"), fullPage: true });
  });

  test("captures soft remove modal pop-up and soft-removed attachment status", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector("#requesterSelect option", { state: "attached" });
    await page.selectOption("#requesterSelect", "1");
    await page.click(".modal-card button:has-text('Continue')");

    // Create ticket with initial attachment first
    await page.click("nav button:has-text('Create Ticket')");
    await page.waitForSelector("#ticketCategory option", { state: "attached" });
    await page.selectOption("#ticketCategory", { index: 0 });
    await page.selectOption("#ticketSystem", { index: 0 });
    await page.fill("#ticketSummary", "Ticket for Attachment Removal Capture");
    await page.fill("#ticketDescription", "Testing soft removal modal prompt and soft-removed attachment badge state.");

    const fileInput = page.locator('[data-testid="initial-file-input"]');
    await fileInput.setInputFiles({
      name: "file-to-remove.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 File To Remove Content"),
    });

    await page.click("button[type='submit']:has-text('Submit Ticket')");
    await page.waitForTimeout(400);

    await page.click("button:has-text('View My Tickets')");
    await page.waitForTimeout(400);

    const viewBtn = page.locator("[data-testid='desktop-tickets-table'] button:has-text('View')").first();
    await viewBtn.click();
    await page.waitForTimeout(400);

    // Open Soft Remove Modal
    await page.click('button:has-text("Soft Remove")');
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(dirs.ticketDetail, "soft-remove-modal.png"), fullPage: true });

    // Fill reason and confirm
    await page.fill('[data-testid="removal-reason-input"]', "Uploaded wrong file version");
    await page.click('[data-testid="confirm-soft-remove-btn"]');
    await page.waitForTimeout(400);

    await page.screenshot({ path: path.join(dirs.ticketDetail, "soft-removed-status.png"), fullPage: true });
  });
});
