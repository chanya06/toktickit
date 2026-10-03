import { test } from "@playwright/test";
import path from "path";
import fs from "fs";

const outputDir = path.join(process.cwd(), "artifacts", "lab-02", "screenshots", "create-ticket");
const rootScreenshotsDir = path.join(process.cwd(), "artifacts", "lab-02", "screenshots");

test.describe("Requester Selector UI States", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test.beforeAll(() => {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
  });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
    });
  });

  test("1. Loading state", async ({ page }) => {
    await page.route("**/api/requesters*", async () => {
      await new Promise(() => {});
    });

    await page.goto("/");
    await page.waitForSelector(".spinner-border", { state: "visible", timeout: 10000 });
    await page.waitForTimeout(400);

    const targetPath1 = path.join(outputDir, "requester-selector-loading.png");
    const targetPath2 = path.join(rootScreenshotsDir, "requester-selector-loading.png");
    await page.screenshot({ path: targetPath1, fullPage: true });
    fs.copyFileSync(targetPath1, targetPath2);
  });

  test("2. API failure state", async ({ page }) => {
    await page.route("**/api/requesters*", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Failed to connect to IT Desk database service" }),
      });
    });

    await page.goto("/");
    await page.waitForSelector(".alert-danger", { state: "visible", timeout: 10000 });
    await page.waitForTimeout(400);

    const targetPath1 = path.join(outputDir, "requester-selector-api-failure.png");
    const targetPath2 = path.join(rootScreenshotsDir, "requester-selector-api-failure.png");
    await page.screenshot({ path: targetPath1, fullPage: true });
    fs.copyFileSync(targetPath1, targetPath2);
  });

  test("3. Empty state", async ({ page }) => {
    await page.route("**/api/requesters*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    await page.goto("/");
    await page.waitForSelector(".alert-warning", { state: "visible", timeout: 10000 });
    await page.waitForTimeout(400);

    const targetPath1 = path.join(outputDir, "requester-selector-empty.png");
    const targetPath2 = path.join(rootScreenshotsDir, "requester-selector-empty.png");
    await page.screenshot({ path: targetPath1, fullPage: true });
    fs.copyFileSync(targetPath1, targetPath2);
  });
});
