import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

const baseDir = path.join(process.cwd(), "artifacts", "lab-03", "screenshots");
const dirs = {
  screen1Login: path.join(baseDir, "screen-1-login"),
  screen2ChangePassword: path.join(baseDir, "screen-2-change-password"),
  screen3TicketQueue: path.join(baseDir, "screen-3-ticket-queue"),
  screen4TicketDetail: path.join(baseDir, "screen-4-ticket-detail"),
  screen5UserManagement: path.join(baseDir, "screen-5-user-management"),
};

test.beforeAll(async ({ request }) => {
  for (const dir of Object.values(dirs)) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  // Ensure Emily Davis has mustChangePassword: true and initial password
  const adminLoginRes = await request.post("http://localhost:3000/api/auth/login", {
    data: { email: "admin@toktickit.com", password: "InitialPass123!" },
  });
  if (adminLoginRes.ok()) {
    const adminData = await adminLoginRes.json();
    const usersRes = await request.get("http://localhost:3000/api/admin/users?search=emily.davis@toktickit.com", {
      headers: { Authorization: `Bearer ${adminData.token}` },
    });
    const usersData = await usersRes.json();
    const emilyUser = usersData.data.find((u: any) => u.email === "emily.davis@toktickit.com");
    if (emilyUser) {
      await request.post(`http://localhost:3000/api/admin/users/${emilyUser.id}/reset-password`, {
        headers: { Authorization: `Bearer ${adminData.token}` },
        data: { initialPassword: "InitialPass123!" },
      });
    }
  }
});

const viewports = [
  { name: "desktop", width: 1280, height: 800 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 375, height: 667 },
];

for (const vp of viewports) {
  test.describe(`Responsive Screenshot Capture: ${vp.name} (${vp.width}x${vp.height})`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test(`captures Screens 1-5 for ${vp.name}`, async ({ page }) => {
      // -------------------------------------------------------------
      // Screen 1: Login Screen
      // -------------------------------------------------------------
      await page.goto("/");
      await page.evaluate(() => localStorage.clear());
      await page.reload();

      await expect(page.locator("h1")).toContainText("Sign in to TokTickIT");
      await page.waitForTimeout(300);
      await page.screenshot({
        path: path.join(dirs.screen1Login, `${vp.name}.png`),
        fullPage: true,
      });

      // -------------------------------------------------------------
      // Screen 2: Mandatory Password Change Screen
      // -------------------------------------------------------------
      // Use emily.davis@toktickit.com who has mustChangePassword: true
      await page.fill("#login-email", "emily.davis@toktickit.com");
      await page.fill("#login-password", "InitialPass123!");
      await page.click('[data-testid="login-submit-button"]');

      await expect(page.locator("h1")).toContainText("Set New Password");
      // Partially fill new password to demonstrate interactive checklist
      await page.fill("#new-password", "PartPass1");
      await page.waitForTimeout(300);
      await page.screenshot({
        path: path.join(dirs.screen2ChangePassword, `${vp.name}.png`),
        fullPage: true,
      });

      // Logout and reset back to Login
      await page.click('[data-testid="change-password-logout-button"]');
      await expect(page.locator("h1")).toContainText("Sign in to TokTickIT");

      // -------------------------------------------------------------
      // Screen 3: IT Staff Ticket Queue
      // -------------------------------------------------------------
      await page.fill("#login-email", "admin@toktickit.com");
      await page.fill("#login-password", "InitialPass123!");
      await page.click('[data-testid="login-submit-button"]');

      // Navigate to Ticket Queue tab
      await page.click('nav button:has-text("Ticket Queue")');
      await expect(page.locator("h2")).toContainText("IT Staff Ticket Queue");
      await page.waitForSelector('[data-testid="queue-search-input"]', { state: "visible" });
      await page.waitForTimeout(400);
      await page.screenshot({
        path: path.join(dirs.screen3TicketQueue, `${vp.name}.png`),
        fullPage: true,
      });

      // -------------------------------------------------------------
      // Screen 4: Ticket Detail & Operations Panel
      // -------------------------------------------------------------
      const firstRowOrCard = page.locator('[data-testid^="queue-row-"]:visible, [data-testid^="queue-card-"]:visible').first();
      await firstRowOrCard.click();

      await expect(page.locator("h2")).toContainText("TKT-2026-");
      await expect(page.locator('[data-testid="staff-operations-panel"]')).toBeVisible();
      await page.waitForTimeout(400);
      await page.screenshot({
        path: path.join(dirs.screen4TicketDetail, `${vp.name}.png`),
        fullPage: true,
      });

      // Additional desktop captures for tabs
      if (vp.name === "desktop") {
        // Comments tab
        await page.click('[data-testid="tab-comments"]');
        await page.waitForTimeout(300);
        await page.screenshot({
          path: path.join(dirs.screen4TicketDetail, "comments-tab.png"),
          fullPage: true,
        });

        // Internal Notes tab
        await page.click('[data-testid="tab-internal-notes"]');
        await page.waitForTimeout(300);
        await page.screenshot({
          path: path.join(dirs.screen4TicketDetail, "internal-notes-tab.png"),
          fullPage: true,
        });

        // Attachments tab
        await page.click('[data-testid="tab-attachments"]');
        await page.waitForTimeout(300);
        await page.screenshot({
          path: path.join(dirs.screen4TicketDetail, "attachments-tab.png"),
          fullPage: true,
        });
      }

      // -------------------------------------------------------------
      // Screen 5: User Management Directory
      // -------------------------------------------------------------
      await page.click('nav button:has-text("User Management")');
      await page.waitForSelector('[data-testid="user-table"]', { state: "visible" });
      await page.waitForTimeout(400);
      await page.screenshot({
        path: path.join(dirs.screen5UserManagement, `${vp.name}.png`),
        fullPage: true,
      });

      // Additional desktop captures for modals
      if (vp.name === "desktop") {
        // Create User Modal
        await page.click('[data-testid="create-user-btn"]');
        await expect(page.locator("h2.modal-title")).toContainText("Create New User");
        await page.waitForTimeout(300);
        await page.screenshot({
          path: path.join(dirs.screen5UserManagement, "create-user-modal.png"),
          fullPage: true,
        });
        await page.click('.modal-header button[aria-label="Close"]');

        // Edit User Modal (on first user)
        const firstEditBtn = page.locator('[data-testid^="edit-user-btn-"]').first();
        await firstEditBtn.click();
        await expect(page.locator("h2.modal-title")).toContainText("Edit User Profile");
        await page.waitForTimeout(300);
        await page.screenshot({
          path: path.join(dirs.screen5UserManagement, "edit-user-modal.png"),
          fullPage: true,
        });
        await page.click('.modal-header button[aria-label="Close"]');

        // Reset Password Modal
        const firstResetBtn = page.locator('[data-testid^="reset-password-btn-"]').first();
        await firstResetBtn.click();
        await expect(page.locator("h2.modal-title")).toContainText("Reset Initial Password");
        await page.waitForTimeout(300);
        await page.screenshot({
          path: path.join(dirs.screen5UserManagement, "reset-password-modal.png"),
          fullPage: true,
        });
        await page.click('.modal-header button[aria-label="Close"]');
      }
    });
  });
}
