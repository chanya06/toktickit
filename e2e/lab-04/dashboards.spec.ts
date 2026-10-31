import { test, expect } from "@playwright/test";

test.describe("E2E-Lab4-01: Multi-Role Dashboards, Metrics & Drill-Down (AC-06..AC-08, FR-07..FR-10)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("Requester Dashboard: renders 4 metric cards, triage table, and executes drill-down", async ({ page, request }) => {
    // 1. Admin login to reset Jennifer's password so she can log in
    const adminLoginRes = await request.post("http://localhost:3000/api/auth/login", {
      data: { email: "admin@toktickit.com", password: "InitialPass123!" },
    });
    const { token: adminToken } = await adminLoginRes.json();

    const usersRes = await request.get("http://localhost:3000/api/admin/users?search=jennifer.anderson@example.com", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const usersData = await usersRes.json();
    const jennifer = usersData.data[0];

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

    // Login via UI
    await page.fill("#login-email", "jennifer.anderson@example.com");
    await page.fill("#login-password", "PermanentPass123!");
    await page.click('[data-testid="login-submit-button"]');

    // Lands on Requester Dashboard
    await page.waitForSelector('[data-testid="nav-dashboard"]');
    await page.click('[data-testid="nav-dashboard"]');
    await expect(page.locator('[data-testid="requester-dashboard"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="dashboard-welcome-banner"]')).toBeVisible();

    // Verify Metric Cards
    await expect(page.locator('[data-testid="card-my-open-tickets"]')).toBeVisible();
    await expect(page.locator('[data-testid="card-waiting-for-requester"]')).toBeVisible();
    await expect(page.locator('[data-testid="card-recently-updated"]')).toBeVisible();
    await expect(page.locator('[data-testid="card-recently-resolved"]')).toBeVisible();

    // Click "Waiting for Requester" card to Drill-Down
    await page.click('[data-testid="card-waiting-for-requester"] button');

    // Navigates to MyTicketsView with filter active
    await expect(page.locator('[data-testid="my-tickets-view"]')).toBeVisible();
  });

  test("IT Staff Dashboard: renders operational cards, urgent queue, and executes drill-down", async ({ page, request }) => {
    // 1. Admin login to reset Emily's password
    const adminLoginRes = await request.post("http://localhost:3000/api/auth/login", {
      data: { email: "admin@toktickit.com", password: "InitialPass123!" },
    });
    const { token: adminToken } = await adminLoginRes.json();

    const usersRes = await request.get("http://localhost:3000/api/admin/users?search=emily.davis@toktickit.com", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const usersData = await usersRes.json();
    const emily = usersData.data[0];

    if (emily) {
      await request.post(`http://localhost:3000/api/admin/users/${emily.id}/reset-password`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: { initialPassword: "TempStaff123!" },
      });

      const loginRes = await request.post("http://localhost:3000/api/auth/login", {
        data: { email: "emily.davis@toktickit.com", password: "TempStaff123!" },
      });
      const loginData = await loginRes.json();

      await request.post("http://localhost:3000/api/auth/change-password", {
        headers: { Authorization: `Bearer ${loginData.token}` },
        data: { currentPassword: "TempStaff123!", newPassword: "EmilyPermanent123!" },
      });
    }

    // Login as Emily Davis
    await page.fill("#login-email", "emily.davis@toktickit.com");
    await page.fill("#login-password", "EmilyPermanent123!");
    await page.click('[data-testid="login-submit-button"]');

    // Lands on Staff Dashboard
    await page.waitForSelector('[data-testid="nav-dashboard"]');
    await page.click('[data-testid="nav-dashboard"]');
    await expect(page.locator('[data-testid="staff-dashboard"]')).toBeVisible({ timeout: 10000 });

    // Verify Metric Cards
    await expect(page.locator('[data-testid="card-unassigned-tickets"]')).toBeVisible();
    await expect(page.locator('[data-testid="card-my-assigned-tickets"]')).toBeVisible();
    await expect(page.locator('[data-testid="card-in-progress-tickets"]')).toBeVisible();
    await expect(page.locator('[data-testid="card-waiting-tickets"]')).toBeVisible();
    await expect(page.locator('[data-testid="card-urgent-tickets"]')).toBeVisible();

    // Verify Triage Queue and tabs
    await expect(page.locator('[data-testid="tab-urgent-tickets"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-recent-tickets"]')).toBeVisible();

    // Click "Unassigned Tickets" card to Drill-Down
    await page.click('[data-testid="card-unassigned-tickets"] button');

    // Navigates to Staff Queue
    await expect(page.locator('[data-testid="staff-ticket-queue-view"]')).toBeVisible();
  });
});
