import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthProvider } from "../../src/context/AuthContext.js";
import { LoginView } from "../../src/components/LoginView.js";
import * as api from "../../src/api.js";

const renderLoginView = (onSuccess?: () => void) => {
  return render(
    <AuthProvider>
      <LoginView onSuccess={onSuccess} />
    </AuthProvider>
  );
};

describe("LoginView Component (Issue 20 - UI-01)", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("renders the Zen Green login card with email, password fields, and submit button", () => {
    renderLoginView();

    expect(screen.getByRole("heading", { name: /Sign in to TokTickIT/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sign In/i })).toBeInTheDocument();
  });

  it("displays client-side validation error when submitting with empty email or password", async () => {
    renderLoginView();

    const submitBtn = screen.getByRole("button", { name: /Sign In/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByTestId("login-error-alert")).toBeInTheDocument();
    expect(screen.getByText(/Please enter your email address/i)).toBeInTheDocument();

    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: "user@example.com" } });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/Please enter your password/i)).toBeInTheDocument();
  });

  it("displays inline error banner when backend rejects credentials with 401", async () => {
    vi.spyOn(api, "login").mockRejectedValue(new Error("Invalid email or password"));

    renderLoginView();

    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitBtn = screen.getByRole("button", { name: /Sign In/i });

    fireEvent.change(emailInput, { target: { value: "wrong@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "WrongPass123!" } });
    fireEvent.click(submitBtn);

    expect(await screen.findByTestId("login-error-alert")).toBeInTheDocument();
    expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument();
  });

  it("shows busy loading state and disables inputs during form submission", async () => {
    let resolveLogin: (val: any) => void = () => {};
    const pendingPromise = new Promise((resolve) => {
      resolveLogin = resolve;
    });
    vi.spyOn(api, "login").mockReturnValue(pendingPromise as any);

    renderLoginView();

    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitBtn = screen.getByRole("button", { name: /Sign In/i });

    fireEvent.change(emailInput, { target: { value: "jennifer.anderson@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "InitialPass123!" } });
    fireEvent.click(submitBtn);

    // Verify busy state
    expect(screen.getByText(/Signing In/i)).toBeInTheDocument();
    expect(submitBtn).toBeDisabled();
    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();

    // Resolve login
    resolveLogin({
      user: {
        id: 1,
        email: "jennifer.anderson@example.com",
        fullName: "Jennifer Anderson",
        role: "REQUESTER",
        mustChangePassword: false,
      },
      token: "fake-jwt-token",
    });

    await waitFor(() => {
      expect(submitBtn).not.toBeDisabled();
    });
  });

  it("successfully calls login API and triggers onSuccess callback upon authentication", async () => {
    const onSuccessMock = vi.fn();
    const loginSpy = vi.spyOn(api, "login").mockResolvedValue({
      user: {
        id: 1,
        email: "jennifer.anderson@example.com",
        fullName: "Jennifer Anderson",
        role: "REQUESTER",
        mustChangePassword: false,
      },
      token: "fake-jwt-token",
    });

    renderLoginView(onSuccessMock);

    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitBtn = screen.getByRole("button", { name: /Sign In/i });

    fireEvent.change(emailInput, { target: { value: "jennifer.anderson@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "InitialPass123!" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(loginSpy).toHaveBeenCalledWith("jennifer.anderson@example.com", "InitialPass123!");
      expect(onSuccessMock).toHaveBeenCalled();
    });
  });
});
