import { test, expect } from "@playwright/test";

test.describe("Requester Ticket Lifecycle End-to-End Flow (Issue 14 / AC-01..AC-10)", () => {
  test("completes full requester journey: select context, initial attachment upload, create ticket, filter, download, soft removal with reason, and ownership boundary", async ({
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
    const testSummary = `E2E Full Journey Ticket - ${Date.now()}`;
    await page.fill("#ticketSummary", testSummary);
    await page.fill("#ticketDescription", "This is an automated end-to-end integration test ticket with initial attachment.");

    // Upload initial file attachment during ticket creation (FR-07, BR-15)
    const fileInput = page.locator('[data-testid="initial-file-input"]');
    await fileInput.setInputFiles({
      name: "e2e-initial-doc.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 E2E Initial Attachment Sample Content"),
    });
    await expect(page.locator("main")).toContainText("e2e-initial-doc.pdf");

    // Submit ticket
    await page.click("button[type='submit']:has-text('Submit Ticket')");

    // 4. Success confirmation screen & navigation to My Tickets
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
    await expect(page.locator('[data-testid="attachment-section"]')).toContainText("e2e-initial-doc.pdf");

    // 8. Test attachment download stream (AC-05)
    const downloadPromise = page.waitForEvent("download");
    await page.click('button:has-text("Download")');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("e2e-initial-doc.pdf");

    // 9. Test soft removal modal with reason validation (AC-05, BR-12, BR-13)
    await page.click('button:has-text("Soft Remove")');
    await expect(page.locator('[data-testid="soft-remove-modal"]')).toBeVisible();

    // Confirm button should be disabled when reason is less than 3 chars
    const confirmRemoveBtn = page.locator('[data-testid="confirm-soft-remove-btn"]');
    await expect(confirmRemoveBtn).toBeDisabled();

    // Fill removal reason (min 3 chars)
    await page.fill('[data-testid="removal-reason-input"]', "File uploaded by mistake");
    await expect(confirmRemoveBtn).toBeEnabled();
    await confirmRemoveBtn.click();

    // Verify attachment is marked as soft-removed in UI
    await expect(page.locator('[data-testid="attachment-section"]')).toContainText("Soft-Removed");
    await expect(page.locator('[data-testid="attachment-section"]')).toContainText("File uploaded by mistake");

    // Verify download button is no longer present for soft-removed attachment
    await expect(page.locator('button:has-text("Download")')).toHaveCount(0);

    // Verify direct download endpoint request returns HTTP 403 for soft-removed attachment (BR-12 Stream Blocking)
    const currentUrl = page.url();
    const ticketIdMatch = currentUrl.match(/tickets[=/](\d+)/) || currentUrl.match(/id=(\d+)/);
    if (ticketIdMatch) {
      const ticketId = ticketIdMatch[1];
      const attachListRes = await page.request.get(`/api/tickets/${ticketId}/attachments?requesterId=1`);
      if (attachListRes.ok()) {
        const attachments = await attachListRes.json();
        if (attachments && attachments.length > 0) {
          const removedAttachId = attachments[0].id;
          const downloadRes = await page.request.get(`/api/attachments/${removedAttachId}/download?requesterId=1`);
          expect(downloadRes.status()).toBe(403);
          const errData = await downloadRes.json();
          expect(errData.error).toContain("soft-removed");
        }
      }
    }

    // 10. Verify switching active requester to Michael Brown (ID 2) clears ticket detail view (AC-04)
    await page.click("header button:has-text('Change Requester')");
    await expect(page.locator("#modal-title")).toBeVisible();
    await page.selectOption("#requesterSelect", "2");
    await page.click(".modal-card button:has-text('Continue')");

    // Michael Brown should see My Tickets view without Jennifer's ticket detail
    await expect(page.locator("header")).toContainText("Michael Brown");
    await expect(page.locator("body")).not.toContainText(testSummary);
  });
});
