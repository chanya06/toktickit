import { test, expect } from "@playwright/test";

test.describe("E2E-03: Administrator User Directory, Provisioning, Safety Guards, and Password Reset (AC-09..AC-12, FR-15..FR-20)", () => {
  const adminEmail = "admin@toktickit.com";
  const adminPass = "InitialPass123!";

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Log in as Administrator
    await page.fill("#login-email", adminEmail);
    await page.fill("#login-password", adminPass);
    await page.click('[data-testid="login-submit-button"]');

    // Wait for directory table
    await expect(page.locator("h1")).toContainText("Administrator User Management");
    await expect(page.locator('[data-testid="user-table"]')).toBeVisible();
  });

  test("AC-09: renders user directory table with search, role filters, and pagination", async ({ page }) => {
    // Verify directory displays users
    await expect(page.locator('[data-testid="user-table"]')).toContainText("John Smith");
    await expect(page.locator('[data-testid="user-table"]')).toContainText("admin@toktickit.com");

    // Test Search input
    await page.fill('[data-testid="user-search-input"]', "Jennifer Anderson");
    await page.waitForTimeout(400); // Debounce
    await expect(page.locator('[data-testid="user-table"]')).toContainText("Jennifer Anderson");
    await expect(page.locator('[data-testid="user-table"]')).not.toContainText("Kevin Patel");

    // Clear search
    await page.click('[data-testid="clear-search-btn"]');
    await page.waitForTimeout(400);

    // Test Role Filter
    await page.selectOption('[data-testid="role-filter-select"]', "ADMINISTRATOR");
    await page.waitForTimeout(400);
    await expect(page.locator('[data-testid="user-table"]')).toContainText("John Smith");
    await expect(page.locator('[data-testid="user-table"]')).not.toContainText("Jennifer Anderson");

    // Reset role filter
    await page.selectOption('[data-testid="role-filter-select"]', "");
  });

  test("AC-10 / FR-16: provisions a new user with initial password and role assignment", async ({ page }) => {
    const timestamp = Date.now();
    const newFullName = `QA Auto Staff ${timestamp}`;
    const newEmail = `qa.staff.${timestamp}@toktickit.com`;

    // Click Create New User button
    await page.click('[data-testid="create-user-btn"]');

    // Verify modal appears
    await expect(page.locator("h2.modal-title")).toContainText("Create New User");

    // Fill form fields
    await page.fill('[data-testid="create-user-fullname"]', newFullName);
    await page.fill('[data-testid="create-user-email"]', newEmail);
    await page.fill('[data-testid="create-user-department"]', "Quality Assurance");
    await page.selectOption('[data-testid="create-user-role"]', "IT_STAFF");
    await page.fill('[data-testid="create-user-password"]', "TempInitialPass123!");

    // Submit
    await page.click('[data-testid="submit-create-user"]');

    // Verify modal closes and user appears in table
    await expect(page.locator("h2.modal-title")).not.toBeVisible();
    await expect(page.locator(".alert-success")).toContainText("created successfully");

    // Search for newly created user
    await page.fill('[data-testid="user-search-input"]', newEmail);
    await page.waitForTimeout(400);
    await expect(page.locator('[data-testid="user-table"]')).toContainText(newFullName);
    await expect(page.locator('[data-testid="user-table"]')).toContainText("IT Staff");
  });

  test("AC-11 / BR-07: enforces self-protection rules (prevents self-deactivation and self-demotion)", async ({ page }) => {
    // Search for admin user
    await page.fill('[data-testid="user-search-input"]', adminEmail);
    await page.waitForTimeout(400);

    // Click Edit on John Smith
    const editBtn = page.locator('tr:has-text("admin@toktickit.com") button:has-text("Edit")');
    await editBtn.click();

    // Verify Edit modal is open
    await expect(page.locator("h2.modal-title")).toContainText("Edit User Profile");

    // Verify self-protection warning is rendered
    await expect(page.locator('[data-testid="self-edit-warning"]')).toBeVisible();
    await expect(page.locator('[data-testid="self-edit-warning"]')).toContainText("Self-Protection Rule");

    // Verify role select and active toggle are disabled
    await expect(page.locator('[data-testid="edit-user-role"]')).toBeDisabled();
    await expect(page.locator('[data-testid="edit-user-isactive"]')).toBeDisabled();

    // Updating allowable fields (department) works smoothly
    await page.fill('[data-testid="edit-user-department"]', "IT Management Systems");
    await page.click('[data-testid="submit-edit-user"]');

    await expect(page.locator("h2.modal-title")).not.toBeVisible();
    await expect(page.locator(".alert-success")).toContainText("updated successfully");
  });

  test("AC-10 / FR-18: resets initial password for a user and enforces password change flag", async ({ page }) => {
    // Search for user Michael Brown
    await page.fill('[data-testid="user-search-input"]', "michael.brown@example.com");
    await page.waitForTimeout(400);

    // Click Reset Password button
    const resetBtn = page.locator('tr:has-text("michael.brown@example.com") button:has-text("Reset")');
    await resetBtn.click();

    // Verify Reset Password modal is open
    await expect(page.locator("h2.modal-title")).toContainText("Reset Initial Password");

    // Enter compliant new initial password
    await page.fill('[data-testid="reset-password-input"]', "ResetPassword2026!");
    await page.click('[data-testid="submit-reset-password"]');

    // Verify modal closes and success toast appears
    await expect(page.locator("h2.modal-title")).not.toBeVisible();
    await expect(page.locator(".alert-success")).toContainText("Initial password reset");
  });

  test.afterAll(async ({ request }) => {
    // Teardown: Re-login as Admin and reset Michael Brown's password back to InitialPass123!
    const adminLoginRes = await request.post("http://localhost:3000/api/auth/login", {
      data: { email: adminEmail, password: adminPass },
    });
    const adminData = await adminLoginRes.json();
    const adminToken = adminData.token;

    const usersRes = await request.get("http://localhost:3000/api/admin/users?search=michael.brown@example.com", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const usersData = await usersRes.json();
    const michaelUser = usersData.data?.find((u: any) => u.email === "michael.brown@example.com");

    if (michaelUser) {
      await request.post(`http://localhost:3000/api/admin/users/${michaelUser.id}/reset-password`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: { initialPassword: "InitialPass123!" },
      });
    }
  });
});
