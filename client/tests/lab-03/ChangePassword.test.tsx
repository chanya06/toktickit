import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthProvider } from "../../src/context/AuthContext.js";
import { ChangePasswordView } from "../../src/components/ChangePasswordView.js";
import * as api from "../../src/api.js";

const renderChangePasswordView = (onSuccess?: () => void) => {
  return render(
    <AuthProvider>
      <ChangePasswordView onSuccess={onSuccess} />
    </AuthProvider>
  );
};

describe("ChangePasswordView Component (Issue 20 - UI-02)", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("renders mandatory password change screen with notice banner, inputs, and requirements checklist", () => {
    renderChangePasswordView();

    expect(screen.getByRole("heading", { name: /Set New Password/i })).toBeInTheDocument();
    expect(screen.getByTestId("password-change-notice")).toBeInTheDocument();
    expect(screen.getByText(/You must change your initial password before continuing/i)).toBeInTheDocument();

    expect(screen.getByLabelText(/Current \(Initial\) Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^New Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm New Password/i)).toBeInTheDocument();

    // Checklist elements
    expect(screen.getByTestId("rule-min-length")).toBeInTheDocument();
    expect(screen.getByTestId("rule-uppercase")).toBeInTheDocument();
    expect(screen.getByTestId("rule-lowercase")).toBeInTheDocument();
    expect(screen.getByTestId("rule-number")).toBeInTheDocument();
    expect(screen.getByTestId("rule-special")).toBeInTheDocument();
    expect(screen.getByTestId("rule-match")).toBeInTheDocument();

    // Submit button initially disabled
    expect(screen.getByTestId("change-password-submit-button")).toBeDisabled();
  });

  it("dynamically evaluates password checklist criteria as user inputs new password", () => {
    renderChangePasswordView();

    const newPasswordInput = screen.getByLabelText(/^New Password/i);
    const confirmInput = screen.getByLabelText(/Confirm New Password/i);

    // Initial state: all rules unmet
    expect(screen.getByTestId("rule-min-length")).toHaveTextContent("○");
    expect(screen.getByTestId("rule-uppercase")).toHaveTextContent("○");
    expect(screen.getByTestId("rule-number")).toHaveTextContent("○");
    expect(screen.getByTestId("rule-special")).toHaveTextContent("○");

    // Type lowercase only
    fireEvent.change(newPasswordInput, { target: { value: "password" } });
    expect(screen.getByTestId("rule-min-length")).toHaveTextContent("✓");
    expect(screen.getByTestId("rule-lowercase")).toHaveTextContent("✓");
    expect(screen.getByTestId("rule-uppercase")).toHaveTextContent("○");

    // Add uppercase and number
    fireEvent.change(newPasswordInput, { target: { value: "Password123" } });
    expect(screen.getByTestId("rule-uppercase")).toHaveTextContent("✓");
    expect(screen.getByTestId("rule-number")).toHaveTextContent("✓");
    expect(screen.getByTestId("rule-special")).toHaveTextContent("○");

    // Add special character
    fireEvent.change(newPasswordInput, { target: { value: "Password123!" } });
    expect(screen.getByTestId("rule-special")).toHaveTextContent("✓");
    expect(screen.getByTestId("rule-match")).toHaveTextContent("○");

    // Type matching confirmation
    fireEvent.change(confirmInput, { target: { value: "Password123!" } });
    expect(screen.getByTestId("rule-match")).toHaveTextContent("✓");
  });

  it("enables submit button only when all criteria and current password are provided", () => {
    renderChangePasswordView();

    const currentPasswordInput = screen.getByLabelText(/Current \(Initial\) Password/i);
    const newPasswordInput = screen.getByLabelText(/^New Password/i);
    const confirmInput = screen.getByLabelText(/Confirm New Password/i);
    const submitBtn = screen.getByTestId("change-password-submit-button");

    expect(submitBtn).toBeDisabled();

    fireEvent.change(currentPasswordInput, { target: { value: "InitialPass123!" } });
    fireEvent.change(newPasswordInput, { target: { value: "BrandNewPass999!" } });
    fireEvent.change(confirmInput, { target: { value: "BrandNewPass999!" } });

    expect(submitBtn).not.toBeDisabled();
  });

  it("displays inline error alert if password change API rejects request", async () => {
    vi.spyOn(api, "changePassword").mockRejectedValue(new Error("Current password is incorrect"));

    renderChangePasswordView();

    const currentPasswordInput = screen.getByLabelText(/Current \(Initial\) Password/i);
    const newPasswordInput = screen.getByLabelText(/^New Password/i);
    const confirmInput = screen.getByLabelText(/Confirm New Password/i);
    const submitBtn = screen.getByTestId("change-password-submit-button");

    fireEvent.change(currentPasswordInput, { target: { value: "WrongPass123!" } });
    fireEvent.change(newPasswordInput, { target: { value: "BrandNewPass999!" } });
    fireEvent.change(confirmInput, { target: { value: "BrandNewPass999!" } });
    fireEvent.click(submitBtn);

    expect(await screen.findByTestId("change-password-error-alert")).toBeInTheDocument();
    expect(screen.getByText(/Current password is incorrect/i)).toBeInTheDocument();
  });

  it("successfully calls changePassword API and triggers onSuccess callback", async () => {
    const onSuccessMock = vi.fn();
    const changeSpy = vi.spyOn(api, "changePassword").mockResolvedValue({
      message: "Password changed successfully",
      user: {
        id: 1,
        email: "david.lee@example.com",
        fullName: "David Lee",
        role: "REQUESTER",
        mustChangePassword: false,
      },
    });

    renderChangePasswordView(onSuccessMock);

    const currentPasswordInput = screen.getByLabelText(/Current \(Initial\) Password/i);
    const newPasswordInput = screen.getByLabelText(/^New Password/i);
    const confirmInput = screen.getByLabelText(/Confirm New Password/i);
    const submitBtn = screen.getByTestId("change-password-submit-button");

    fireEvent.change(currentPasswordInput, { target: { value: "InitialPass123!" } });
    fireEvent.change(newPasswordInput, { target: { value: "BrandNewPass999!" } });
    fireEvent.change(confirmInput, { target: { value: "BrandNewPass999!" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(changeSpy).toHaveBeenCalledWith("InitialPass123!", "BrandNewPass999!");
      expect(onSuccessMock).toHaveBeenCalled();
    });
  });

  it("persists new token to storage when api.changePassword returns a new token", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        message: "Password changed successfully",
        user: {
          id: 1,
          email: "david.lee@example.com",
          fullName: "David Lee",
          role: "REQUESTER",
          mustChangePassword: false,
        },
        token: "brand-new-jwt-token-777",
      }),
    } as any);

    const result = await api.changePassword("Current123!", "NewPass123!");
    expect(result.token).toBe("brand-new-jwt-token-777");
    expect(api.getStoredToken()).toBe("brand-new-jwt-token-777");
  });
});
