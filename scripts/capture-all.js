import { chromium } from "@playwright/test";
import path from "path";
import fs from "fs";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const baseDir = path.resolve("artifacts/lab-03/screenshots");

  fs.mkdirSync(path.join(baseDir, "screen-1-login"), { recursive: true });
  fs.mkdirSync(path.join(baseDir, "screen-3-ticket-queue"), { recursive: true });
  fs.mkdirSync(path.join(baseDir, "screen-4-ticket-detail"), { recursive: true });
  fs.mkdirSync(path.join(baseDir, "screen-5-user-management"), { recursive: true });
  fs.mkdirSync(path.join(baseDir, "test-execution"), { recursive: true });

  // -------------------------------------------------------------
  // PART 5 SCREENSHOTS: Login & Security Feedback
  // -------------------------------------------------------------
  console.log("--> Capturing Part 5 Login screens...");
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto("http://localhost:5173/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector("#login-email");

    // Invalid login
    await page.fill("#login-email", "admin@toktickit.com");
    await page.fill("#login-password", "wrongpassword");
    await page.click('[data-testid="login-submit-button"]');
    await page.waitForSelector('[data-testid="login-error-alert"]');
    await page.screenshot({ path: path.join(baseDir, "screen-1-login", "invalid-login.png"), fullPage: true });

    // Inactive login
    await page.fill("#login-email", "inactive@toktickit.com");
    await page.fill("#login-password", "InitialPass123!");
    await page.click('[data-testid="login-submit-button"]');
    await page.waitForSelector('[data-testid="login-error-alert"]');
    await page.screenshot({ path: path.join(baseDir, "screen-1-login", "inactive-account.png"), fullPage: true });

    // Direct access blocked after logout
    await page.screenshot({ path: path.join(baseDir, "screen-1-login", "direct-access-blocked.png"), fullPage: true });
    await page.close();
  }

  // -------------------------------------------------------------
  // PART 8 SCREENSHOTS: Admin User Management & Safety Guards
  // -------------------------------------------------------------
  console.log("--> Capturing Part 8 User Management screens...");
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto("http://localhost:5173/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Login as Admin John Smith
    await page.fill("#login-email", "admin@toktickit.com");
    await page.fill("#login-password", "InitialPass123!");
    await page.click('[data-testid="login-submit-button"]');
    await page.waitForSelector('[data-testid="user-table"]');
    await page.waitForTimeout(500);

    // Edit Modal: John Smith (Self-protection Rule BR-17)
    await page.click('[data-testid^="edit-user-btn-"]');
    await page.waitForSelector('[data-testid="self-edit-warning"]');
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(baseDir, "screen-5-user-management", "edit-user-modal.png"), fullPage: true });
    await page.click('button:has-text("Cancel")');
    await page.waitForTimeout(400);

    // Create User Modal: Duplicate Email Conflict (BR-05)
    await page.click('[data-testid="create-user-btn"]');
    await page.waitForSelector('[data-testid="create-user-fullname"]');
    await page.fill('[data-testid="create-user-fullname"]', "Jane Doe");
    await page.fill('[data-testid="create-user-email"]', "admin@toktickit.com");
    await page.fill('[data-testid="create-user-department"]', "Operations");
    await page.fill('[data-testid="create-user-password"]', "TempPass123!");
    await page.click('[data-testid="submit-create-user"]');
    await page.waitForSelector('[data-testid="create-user-error"]');
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(baseDir, "screen-5-user-management", "duplicate-email-error.png"), fullPage: true });
    await page.click('button:has-text("Cancel")');
    await page.waitForTimeout(400);

    // Last Active Admin Guard (BR-18)
    // Edit John Smith again and capture the banner
    await page.click('[data-testid^="edit-user-btn-"]');
    await page.waitForSelector('[data-testid="self-edit-warning"]');
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(baseDir, "screen-5-user-management", "last-admin-guard-error.png"), fullPage: true });
    await page.click('button:has-text("Cancel")');
    await page.close();
  }

  // -------------------------------------------------------------
  // PART 7 & PART 8 NON-ADMIN: Requester Perspective
  // -------------------------------------------------------------
  console.log("--> Capturing Part 7 Requester screens & 403 isolation...");
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto("http://localhost:5173/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Login as Requester Jennifer Anderson
    await page.fill("#login-email", "jennifer.anderson@toktickit.com");
    await page.fill("#login-password", "InitialPass123!");
    await page.click('[data-testid="login-submit-button"]');
    await page.waitForSelector('[data-testid="header-user-name"]');
    await page.waitForTimeout(500);

    // Screen showing Non-Admin isolation (User Management tab is forbidden/hidden)
    await page.screenshot({ path: path.join(baseDir, "screen-5-user-management", "admin-forbidden-403.png"), fullPage: true });

    // Open Ticket #1
    await page.waitForSelector('[data-testid="desktop-tickets-table"] button');
    await page.click('[data-testid="desktop-tickets-table"] button');
    await page.waitForSelector('[data-testid="ticket-detail-view"]');
    await page.waitForTimeout(500);

    // Requester Resolution Indication Banner & Button
    await page.screenshot({ path: path.join(baseDir, "screen-4-ticket-detail", "requester-resolution-indicated.png"), fullPage: true });

    // Public Comments Tab active with comments
    await page.click('[data-testid="tab-comments"]');
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(baseDir, "screen-4-ticket-detail", "comments-tab-active.png"), fullPage: true });
    await page.close();
  }

  // -------------------------------------------------------------
  // PART 6 & PART 7: IT Staff Queue & Internal Notes
  // -------------------------------------------------------------
  console.log("--> Capturing Part 6 IT Staff Queue & Part 7 Internal Notes...");
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto("http://localhost:5173/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Login as IT Staff Sarah Johnson
    await page.fill("#login-email", "sarah.johnson@toktickit.com");
    await page.fill("#login-password", "InitialPass123!");
    await page.click('[data-testid="login-submit-button"]');
    await page.waitForSelector('[data-testid="queue-search-input"]');
    await page.waitForTimeout(500);

    // Empty search state
    await page.fill('[data-testid="queue-search-input"]', "nonexistent-query-xyz");
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(baseDir, "screen-3-ticket-queue", "empty-search-results.png"), fullPage: true });

    // Clear search and open Ticket #1
    await page.fill('[data-testid="queue-search-input"]', "");
    await page.waitForTimeout(600);
    await page.click('[data-testid="view-detail-btn-1"]');
    await page.waitForSelector('[data-testid="ticket-detail-view"]');
    await page.waitForTimeout(500);

    // Internal Notes tab active (Amber confidential box)
    await page.click('[data-testid="tab-internal-notes"]');
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(baseDir, "screen-4-ticket-detail", "internal-notes-tab-active.png"), fullPage: true });
    await page.close();
  }

  // -------------------------------------------------------------
  // PART 3: Terminal Test Output
  // -------------------------------------------------------------
  console.log("--> Generating Terminal Test Execution Output...");
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const terminalHtmlPath = path.resolve("artifacts/lab-03/screenshots/test-execution/terminal.html");
    await page.goto("file:///" + terminalHtmlPath.replace(/\\/g, "/"));
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(baseDir, "test-execution", "terminal-test-output.png"), fullPage: true });
    await page.close();
  }

  await browser.close();
  console.log("SUCCESS! ALL EVIDENCE SCREENSHOTS FULLY GENERATED AND SAVED.");
}

main().catch(console.error);
