import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.js";

interface LoginViewProps {
  onSuccess?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setIsLoading(true);
    try {
      await login(trimmedEmail, password);
      onSuccess?.();
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100 py-5 px-3"
      style={{ backgroundColor: "var(--page-bg, #F5F7F6)" }}
    >
      <div
        className="card shadow-sm border-0 w-100"
        style={{
          maxWidth: "420px",
          borderRadius: "12px",
          border: "1px solid #E5E7EB",
        }}
      >
        <div className="card-body p-4 p-sm-5">
          {/* Brand Logo & Header */}
          <div className="text-center mb-4">
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
              style={{
                width: "48px",
                height: "48px",
                backgroundColor: "var(--primary-green, #006B3C)",
                color: "#FFFFFF",
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h1 className="h4 fw-bold text-dark mb-1">Sign in to TokTickIT</h1>
            <p className="text-muted small mb-0">Enter your credentials to access your support workspace</p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div
              className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3"
              role="alert"
              data-testid="login-error-alert"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="flex-shrink-0"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="login-email" className="form-label small fw-semibold text-secondary">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                className="form-control"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="mb-4">
              <label htmlFor="login-password" className="form-label small fw-semibold text-secondary">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-zen-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
              disabled={isLoading}
              data-testid="login-submit-button"
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span>Signing In…</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Quick Helper Credentials Note */}
          <div className="mt-4 pt-3 border-top text-center">
            <p className="text-muted small mb-1">Sprint 3 Seed Accounts:</p>
            <p className="text-muted font-monospace small mb-0" style={{ fontSize: "0.75rem" }}>
              admin@toktickit.com | InitialPass123!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
