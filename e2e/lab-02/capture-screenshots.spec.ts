import { test } from "@playwright/test";
import fs from "fs";
import path from "path";

const outputDir = path.join(process.cwd(), "artifacts", "lab-02", "screenshots");

test.beforeAll(() => {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
});

const viewports = [
  { name: "desktop", width: 1280, height: 800 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 375, height: 667 },
];

for (const vp of viewports) {
  test.describe(`Screenshot Generation (${vp.name} ${vp.width}x${vp.height})`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test(`captures Create Ticket, My Tickets, and Ticket Detail views for ${vp.name}`, async ({ page }) => {
      // 1. Clear localStorage and load app
      await page.goto("/");
      await page.evaluate(() => localStorage.clear());
      await page.reload();

      // Wait for requester selector dropdown to populate
      await page.waitForSelector("#requesterSelect option", { state: "attached" });

      // Select Jennifer Anderson
      await page.selectOption("#requesterSelect", "1");
      await page.click(".modal-card button:has-text('Continue')");

      // Capture My Tickets screen
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(outputDir, `my-tickets-${vp.name}.png`), fullPage: true });

      // Capture Create Ticket screen with Initial Attachment dropzone
      await page.click("nav button:has-text('Create Ticket')");
      await page.waitForSelector("#ticketCategory option", { state: "attached" });
      await page.fill("#ticketSummary", `Responsive UI Test (${vp.name})`);
      await page.fill("#ticketDescription", "Capturing responsive visual design system inspection screenshot with initial attachment.");

      const fileInput = page.locator('[data-testid="initial-file-input"]');
      await fileInput.setInputFiles({
        name: "sample-attachment.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.from("%PDF-1.4 Sample Screenshot Attachment"),
      });
      await page.waitForTimeout(300);

      await page.screenshot({ path: path.join(outputDir, `create-ticket-${vp.name}.png`), fullPage: true });

      // Submit form
      await page.selectOption("#ticketCategory", { index: 0 });
      await page.selectOption("#ticketSystem", { index: 0 });
      await page.check("#priority-HIGH");
      await page.click("button[type='submit']:has-text('Submit Ticket')");
      await page.waitForTimeout(500);

      await page.click("button:has-text('View My Tickets')");
      await page.waitForTimeout(400);

      // Select visible button based on layout container
      const viewBtn = vp.name === "mobile"
        ? page.locator("[data-testid='mobile-tickets-cards'] button:has-text('View Details')").first()
        : page.locator("[data-testid='desktop-tickets-table'] button:has-text('View')").first();

      if (await viewBtn.isVisible()) {
        await viewBtn.click();
        await page.waitForTimeout(400);
        await page.screenshot({ path: path.join(outputDir, `ticket-detail-${vp.name}.png`), fullPage: true });
      }
    });
  });
}
