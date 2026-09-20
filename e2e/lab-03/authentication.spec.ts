import { test, expect } from "@playwright/test";

test.describe("E2E-01: Authentication, Inactive Rejection, and Mandatory Password Change (AC-01, AC-02, FR-01..FR-03)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("API-01 / AC-01: successfully authenticates active Administrator and displays user profile and navigation", async ({ page }) => {
    // 1. Verify login view is visible
    await expect(page.locator("h1")).toContainText("Sign in to TokTickIT");
    await expect(page.locator("#login-email")).toBeVisible();

    // 2. Fill Administrator credentials
    await page.fill("#login-email", "admin@toktickit.com");
    await page.fill("#login-password", "InitialPass123!");
    await page.click('[data-testid="login-submit-button"]');

    // 3. Verify successful entry into application
    await expect(page.locator('[data-testid="header-user-name"]')).toHaveText("John Smith");
    await expect(page.locator('[data-testid="user-role-badge"]')).toHaveText("Administrator");

    // 4. Default view for Administrator is User Management
    await expect(page.locator("h1")).toContainText("Administrator User Management");

    // 5. Test logout flow
    await page.click('[data-testid="header-logout-button"]');
    await expect(page.locator("h1")).toContainText("Sign in to TokTickIT");
  });

  test("API-02 / AC-01: rejects login for deactivated accounts with informative error", async ({ page }) => {
    await page.fill("#login-email", "robert.wilson@toktickit.com");
    await page.fill("#login-password", "InitialPass123!");
    await page.click('[data-testid="login-submit-button"]');

    const alert = page.locator('[data-testid="login-error-alert"]');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText("inactive");
  });

  test("AC-01: rejects login with invalid password", async ({ page }) => {
    await page.fill("#login-email", "admin@toktickit.com");
    await page.fill("#login-password", "WrongPassword999!");
    await page.click('[data-testid="login-submit-button"]');

    const alert = page.locator('[data-testid="login-error-alert"]');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText("Invalid email or password");
  });

  test("E2E-01 / AC-02: forces initial password change, enforces complexity rules, and allows login with new password", async ({ page, request }) => {
    // 0. Ensure Kevin has mustChangePassword: true by resetting initial password via Admin API
    const adminLoginRes = await request.post("http://localhost:3000/api/auth/login", {
      data: { email: "admin@toktickit.com", password: "InitialPass123!" },
    });
    const adminData = await adminLoginRes.json();
    const adminToken = adminData.token;

    const usersRes = await request.get("http://localhost:3000/api/admin/users?search=kevin.patel@toktickit.com", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const usersData = await usersRes.json();
    const kevinUser = usersData.data.find((u: any) => u.email === "kevin.patel@toktickit.com");

    if (kevinUser) {
      await request.post(`http://localhost:3000/api/admin/users/${kevinUser.id}/reset-password`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: { initialPassword: "InitialPass123!" },
      });
    }

    // 1. Log in with Kevin Patel whose mustChangePassword is true
    await page.fill("#login-email", "kevin.patel@toktickit.com");
    await page.fill("#login-password", "InitialPass123!");
    await page.click('[data-testid="login-submit-button"]');

    // 2. Forced password change screen appears
    await expect(page.locator("h1")).toContainText("Set New Password");
    await expect(page.locator('[data-testid="password-change-notice"]')).toBeVisible();

    // 3. Verify interactive validation rules checklist
    const submitBtn = page.locator('[data-testid="change-password-submit-button"]');
    await expect(submitBtn).toBeDisabled();

    // Fill current password
    await page.fill("#current-password", "InitialPass123!");

    // Enter weak password (missing special char and number)
    await page.fill("#new-password", "Password");
    await page.fill("#confirm-password", "Password");
    await expect(submitBtn).toBeDisabled();

    // Enter valid new password meeting all complexity criteria
    const newPassword = "KevinNewSecure2026!";
    await page.fill("#new-password", newPassword);
    await page.fill("#confirm-password", newPassword);

    // Verify all criteria indicators are satisfied
    await expect(page.locator('[data-testid="rule-min-length"]')).toHaveClass(/text-success/);
    await expect(page.locator('[data-testid="rule-uppercase"]')).toHaveClass(/text-success/);
    await expect(page.locator('[data-testid="rule-lowercase"]')).toHaveClass(/text-success/);
    await expect(page.locator('[data-testid="rule-number"]')).toHaveClass(/text-success/);
    await expect(page.locator('[data-testid="rule-special"]')).toHaveClass(/text-success/);
    await expect(page.locator('[data-testid="rule-match"]')).toHaveClass(/text-success/);
    await expect(submitBtn).toBeEnabled();

    // 4. Submit password update
    await submitBtn.click();

    // 5. Successfully redirected to Ticket Queue for IT Staff
    await expect(page.locator('[data-testid="header-user-name"]')).toHaveText("Kevin Patel");
    await expect(page.locator('[data-testid="user-role-badge"]')).toHaveText("IT Staff");
    await expect(page.locator("h2")).toContainText("IT Staff Ticket Queue");

    // 6. Sign out
    await page.click('[data-testid="header-logout-button"]');
    await expect(page.locator("h1")).toContainText("Sign in to TokTickIT");

    // 7. Old password no longer works
    await page.fill("#login-email", "kevin.patel@toktickit.com");
    await page.fill("#login-password", "InitialPass123!");
    await page.click('[data-testid="login-submit-button"]');
    await expect(page.locator('[data-testid="login-error-alert"]')).toBeVisible();

    // 8. New password logs in immediately without password prompt
    await page.fill("#login-password", newPassword);
    await page.click('[data-testid="login-submit-button"]');
    await expect(page.locator('[data-testid="header-user-name"]')).toHaveText("Kevin Patel");
    await expect(page.locator("h2")).toContainText("IT Staff Ticket Queue");

    // Teardown: Reset Kevin's password back to InitialPass123! via Admin login
    const resetLoginRes = await request.post("http://localhost:3000/api/auth/login", {
      data: { email: "admin@toktickit.com", password: "InitialPass123!" },
    });
    const resetAdminData = await resetLoginRes.json();
    const resetAdminToken = resetAdminData.token;

    // Find Kevin's user ID
    const resetUsersRes = await request.get("http://localhost:3000/api/admin/users?search=kevin.patel", {
      headers: { Authorization: `Bearer ${resetAdminToken}` },
    });
    const resetUsersData = await resetUsersRes.json();
    const kevinUserToReset = resetUsersData.data.find((u: any) => u.email === "kevin.patel@toktickit.com");

    if (kevinUserToReset) {
      await request.post(`http://localhost:3000/api/admin/users/${kevinUserToReset.id}/reset-password`, {
        headers: { Authorization: `Bearer ${resetAdminToken}` },
        data: { initialPassword: "InitialPass123!" },
      });
    }
  });
});
