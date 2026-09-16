import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.js";

interface ChangePasswordViewProps {
  onSuccess?: () => void;
}

export const ChangePasswordView: React.FC<ChangePasswordViewProps> = ({ onSuccess }) => {
  const { user, changePassword, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Criteria validation checks
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const isFormValid =
    currentPassword.length > 0 &&
    hasMinLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSpecialChar &&
    passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isFormValid) {
      if (!currentPassword) {
        setErrorMessage("Please enter your current password.");
        return;
      }
      if (!passwordsMatch) {
        setErrorMessage("New password and confirmation do not match.");
        return;
      }
      setErrorMessage("Please meet all password requirements before continuing.");
      return;
    }

    setIsLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      onSuccess?.();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update password. Please check your current password.");
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
          maxWidth: "480px",
          borderRadius: "12px",
          border: "1px solid #E5E7EB",
        }}
      >
        <div className="card-body p-4 p-sm-5">
          {/* Header */}
          <div className="text-center mb-4">
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
              style={{
                width: "48px",
                height: "48px",
                backgroundColor: "#FEF3C7",
                color: "#B45309",
              }}
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h1 className="h4 fw-bold text-dark mb-1">Set New Password</h1>
            <p className="text-muted small mb-0">
              Welcome, <span className="fw-semibold text-dark">{user?.fullName || user?.email}</span>
            </p>
          </div>

          {/* Mandatory notice banner */}
          <div
            className="alert alert-warning py-2 px-3 small d-flex align-items-center gap-2 mb-3"
            role="status"
            data-testid="password-change-notice"
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
            <span>You must change your initial password before continuing.</span>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div
              className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3"
              role="alert"
              data-testid="change-password-error-alert"
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

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="current-password" className="form-label small fw-semibold text-secondary">
                Current (Initial) Password
              </label>
              <input
                id="current-password"
                type="password"
                className="form-control"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="current-password"
                autoFocus
              />
            </div>

            <div className="mb-3">
              <label htmlFor="new-password" className="form-label small fw-semibold text-secondary">
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                className="form-control"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="new-password"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="confirm-password" className="form-label small fw-semibold text-secondary">
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                type="password"
                className={`form-control ${
                  confirmPassword && !passwordsMatch ? "is-invalid" : ""
                }`}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="new-password"
              />
              {confirmPassword && !passwordsMatch && (
                <div className="invalid-feedback small">Passwords do not match</div>
              )}
            </div>

            {/* Checklist of Password Requirements */}
            <div className="card bg-light border-0 mb-4 p-3 rounded">
              <p className="fw-semibold small text-secondary mb-2">Password Requirements:</p>
              <ul className="list-unstyled mb-0 small d-flex flex-column gap-1">
                <li
                  className={`d-flex align-items-center gap-2 ${
                    hasMinLength ? "text-success fw-medium" : "text-muted"
                  }`}
                  data-testid="rule-min-length"
                >
                  <span className="badge-icon">{hasMinLength ? "✓" : "○"}</span>
                  <span>Minimum 8 characters</span>
                </li>
                <li
                  className={`d-flex align-items-center gap-2 ${
                    hasUppercase ? "text-success fw-medium" : "text-muted"
                  }`}
                  data-testid="rule-uppercase"
                >
                  <span className="badge-icon">{hasUppercase ? "✓" : "○"}</span>
                  <span>At least one uppercase letter (A-Z)</span>
                </li>
                <li
                  className={`d-flex align-items-center gap-2 ${
                    hasLowercase ? "text-success fw-medium" : "text-muted"
                  }`}
                  data-testid="rule-lowercase"
                >
                  <span className="badge-icon">{hasLowercase ? "✓" : "○"}</span>
                  <span>At least one lowercase letter (a-z)</span>
                </li>
                <li
                  className={`d-flex align-items-center gap-2 ${
                    hasNumber ? "text-success fw-medium" : "text-muted"
                  }`}
                  data-testid="rule-number"
                >
                  <span className="badge-icon">{hasNumber ? "✓" : "○"}</span>
                  <span>At least one number (0-9)</span>
                </li>
                <li
                  className={`d-flex align-items-center gap-2 ${
                    hasSpecialChar ? "text-success fw-medium" : "text-muted"
                  }`}
                  data-testid="rule-special"
                >
                  <span className="badge-icon">{hasSpecialChar ? "✓" : "○"}</span>
                  <span>At least one special character (!@#$%^&*...)</span>
                </li>
                <li
                  className={`d-flex align-items-center gap-2 ${
                    passwordsMatch ? "text-success fw-medium" : "text-muted"
                  }`}
                  data-testid="rule-match"
                >
                  <span className="badge-icon">{passwordsMatch ? "✓" : "○"}</span>
                  <span>Passwords match</span>
                </li>
              </ul>
            </div>

            <button
              type="submit"
              className="btn btn-zen-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
              disabled={isLoading || !isFormValid}
              data-testid="change-password-submit-button"
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span>Updating Password…</span>
                </>
              ) : (
                <span>Update Password & Continue</span>
              )}
            </button>
          </form>

          {/* Logout Action */}
          <div className="mt-4 pt-3 border-top text-center">
            <button
              type="button"
              className="btn btn-link text-muted text-decoration-none small p-0"
              onClick={logout}
              disabled={isLoading}
              data-testid="change-password-logout-button"
            >
              ← Sign out and return to login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
