import { test } from "@playwright/test";
import path from "path";
import fs from "fs";

const outputDir = path.join(process.cwd(), "artifacts", "lab-02", "screenshots", "ticket-detail");
const rootDir = path.join(process.cwd(), "artifacts", "lab-02", "screenshots");

test("captures 403 Forbidden unauthorized access state", async ({ page }) => {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  await page.route("**/api/tickets/999*", async (route) => {
    await route.fulfill({
      status: 403,
      contentType: "application/json",
      body: JSON.stringify({ error: "Forbidden: You do not have permission to view or modify this ticket." }),
    });
  });

  await page.goto("/");
  await page.evaluate(() => {
    localStorage.setItem("toktickit_dev_requester_id", "2");
  });
  await page.reload();

  await page.waitForSelector(".modal-card button:has-text('Continue')", { state: "attached" }).catch(() => {});
  if (await page.locator(".modal-card button:has-text('Continue')").isVisible()) {
    await page.selectOption("#requesterSelect", "2");
    await page.click(".modal-card button:has-text('Continue')");
  }

  // Navigate to ticket detail view with 403 response
  await page.evaluate(() => {
    window.location.hash = "#ticket-999";
  });
  await page.waitForTimeout(600);

  const target1 = path.join(outputDir, "forbidden-access.png");
  const target2 = path.join(rootDir, "forbidden-access.png");
  await page.screenshot({ path: target1, fullPage: true });
  fs.copyFileSync(target1, target2);
});
