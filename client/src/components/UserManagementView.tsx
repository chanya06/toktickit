import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  AdminUserResponse,
  fetchAdminUsers,
  createAdminUser,
  updateAdminUser,
  resetAdminUserPassword,
  CreateAdminUserPayload,
  UpdateAdminUserPayload,
} from "../api.js";
import { useAuth } from "../context/AuthContext.js";
import { getPaginationItems } from "../utils/pagination.js";

// Role Badges Configuration (from ui-spec.md)
const ROLE_BADGE_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  REQUESTER: { bg: "#E0F2FE", text: "#0369A1", label: "Requester" },
  IT_STAFF: { bg: "#EAF6EF", text: "#006B3C", label: "IT Staff" },
  ADMINISTRATOR: { bg: "#F3E8FF", text: "#7E22CE", label: "Administrator" },
};

function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export function UserManagementView() {
  const { user: currentUser, refreshUser } = useAuth();

  // Directory state
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchInput, setSearchInput] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("");

  // Pagination state
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [paginationMeta, setPaginationMeta] = useState<{
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  }>({ totalItems: 0, totalPages: 1, currentPage: 1, pageSize: 10 });

  // Notifications
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<AdminUserResponse | null>(null);
  const [resettingUser, setResettingUser] = useState<AdminUserResponse | null>(null);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Auto-dismiss toast after 4s
  useEffect(() => {
    if (!successToast) return;
    const timer = setTimeout(() => setSuccessToast(null), 4000);
    return () => clearTimeout(timer);
  }, [successToast]);

  // Load users callback
  const loadUsers = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchAdminUsers(
          {
            search: debouncedSearch.trim() || undefined,
            role: roleFilter || undefined,
            page,
            pageSize,
            sortBy: "createdAt",
            sortOrder: "desc",
          },
          signal
        );
        setUsers(res.data);
        setPaginationMeta(res.pagination);
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        setError(err.message || "Failed to load user directory. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, roleFilter, page, pageSize]
  );

  useEffect(() => {
    const controller = new AbortController();
    loadUsers(controller.signal);
    return () => controller.abort();
  }, [loadUsers]);

  // Handle clear search
  const handleClearSearch = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setPage(1);
  };

  return (
    <div className="container-fluid px-0" data-testid="user-management-view">
      {/* Toast Notification Banner */}
      {successToast && (
        <div
          className="alert alert-success alert-dismissible fade show d-flex align-items-center mb-4 shadow-sm border-0"
          role="alert"
          style={{ backgroundColor: "#DCFCE7", color: "#15803D" }}
          data-testid="success-toast"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="me-2 flex-shrink-0"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <div className="fw-semibold">{successToast}</div>
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccessToast(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      {/* Screen Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4 pb-2 border-bottom">
        <div>
          <h1 className="h3 fw-bold text-dark mb-1" style={{ letterSpacing: "-0.02em" }}>
            Administrator User Management
          </h1>
          <p className="text-muted small mb-0">
            Manage user accounts, roles, access permissions, and initial credentials with Zen Green administration.
          </p>
        </div>
        <button
          type="button"
          className="btn text-white fw-semibold px-3 py-2 d-inline-flex align-items-center gap-2 shadow-sm"
          style={{ backgroundColor: "#006B3C", borderColor: "#006B3C" }}
          onClick={() => setIsCreateModalOpen(true)}
          data-testid="create-user-btn"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Create New User</span>
        </button>
      </div>

      {/* Search & Filter Control Bar */}
      <div className="card shadow-sm border-0 mb-4" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="card-body p-3">
          <div className="row g-3 align-items-center">
            {/* Search Input */}
            <div className="col-12 col-md-7 col-lg-8">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted ps-3 pe-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-1"
                  placeholder="Search by name or email..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  data-testid="user-search-input"
                  aria-label="Search users"
                />
                {searchInput && (
                  <button
                    className="btn btn-outline-secondary border-start-0 border-end"
                    type="button"
                    onClick={handleClearSearch}
                    data-testid="clear-search-btn"
                    title="Clear search"
                  >
                    &times;
                  </button>
                )}
              </div>
            </div>

            {/* Role Filter Dropdown */}
            <div className="col-12 col-md-5 col-lg-4">
              <div className="d-flex align-items-center gap-2">
                <label
                  htmlFor="role-filter-select"
                  className="small fw-semibold text-muted text-nowrap mb-0"
                >
                  Role:
                </label>
                <select
                  id="role-filter-select"
                  className="form-select"
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setPage(1);
                  }}
                  data-testid="role-filter-select"
                  aria-label="Filter by role"
                >
                  <option value="">All Roles</option>
                  <option value="REQUESTER">Requester</option>
                  <option value="IT_STAFF">IT Staff</option>
                  <option value="ADMINISTRATOR">Administrator</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="card shadow-sm border-0 py-5 text-center" data-testid="loading-indicator">
          <div className="spinner-border text-success mx-auto mb-3" role="status" style={{ color: "#006B3C" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted small mb-0">Loading user directory...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger shadow-sm border-0 d-flex align-items-center justify-content-between p-3">
          <div>
            <strong className="d-block mb-1">Error Loading Users</strong>
            <span className="small">{error}</span>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={() => loadUsers()}
          >
            Retry
          </button>
        </div>
      ) : users.length === 0 ? (
        <div className="card shadow-sm border-0 py-5 text-center p-4" data-testid="no-users-message">
          <div
            className="rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-3"
            style={{ width: 64, height: 64, backgroundColor: "#EAF6EF", color: "#006B3C" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h2 className="h5 fw-bold text-dark mb-1">No Users Found</h2>
          <p className="text-muted small mb-3">
            {searchInput || roleFilter
              ? "No user accounts match your active search and filter criteria."
              : "No user accounts are registered in the directory."}
          </p>
          {(searchInput || roleFilter) && (
            <div>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => {
                  setSearchInput("");
                  setDebouncedSearch("");
                  setRoleFilter("");
                  setPage(1);
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="card shadow-sm border-0 overflow-hidden mb-4">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" data-testid="user-table">
              <thead style={{ backgroundColor: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                <tr>
                  <th scope="col" className="ps-3 text-muted small fw-bold text-uppercase py-3">
                    Full Name
                  </th>
                  <th scope="col" className="text-muted small fw-bold text-uppercase py-3">
                    Email Address
                  </th>
                  <th scope="col" className="text-muted small fw-bold text-uppercase py-3">
                    Department
                  </th>
                  <th scope="col" className="text-muted small fw-bold text-uppercase py-3">
                    Role
                  </th>
                  <th scope="col" className="text-muted small fw-bold text-uppercase py-3">
                    Status
                  </th>
                  <th scope="col" className="text-muted small fw-bold text-uppercase py-3 text-end pe-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const roleCfg = ROLE_BADGE_CONFIG[u.role] || {
                    bg: "#E2E8F0",
                    text: "#334155",
                    label: u.role,
                  };
                  const isCurrent = currentUser?.id === u.id;

                  return (
                    <tr
                      key={u.id}
                      data-testid={`user-row-${u.id}`}
                      className="user-table-row"
                      style={{ transition: "background-color 0.15s ease" }}
                    >
                      {/* Name */}
                      <td className="ps-3 py-3">
                        <div className="d-flex align-items-center gap-2">
                          <span className="fw-semibold text-dark" data-testid={`user-name-${u.id}`}>
                            {u.fullName || u.name || "-"}
                          </span>
                          {isCurrent && (
                            <span
                              className="badge rounded-pill bg-light text-secondary border small"
                              title="You are currently logged in as this user"
                            >
                              You
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3">
                        <span className="text-muted small font-monospace" data-testid={`user-email-${u.id}`}>
                          {u.email}
                        </span>
                      </td>

                      {/* Department */}
                      <td className="py-3">
                        {u.department ? (
                          <span className="badge bg-light text-dark border fw-normal" data-testid={`user-dept-${u.id}`}>
                            {u.department}
                          </span>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>

                      {/* Role Badge */}
                      <td className="py-3">
                        <span
                          className="badge rounded-pill fw-semibold px-2 py-1"
                          style={{
                            backgroundColor: roleCfg.bg,
                            color: roleCfg.text,
                            fontSize: "0.75rem",
                          }}
                          data-testid={`user-role-badge-${u.id}`}
                        >
                          {roleCfg.label}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3">
                        {u.isActive ? (
                          <span
                            className="badge rounded-pill fw-semibold px-2 py-1"
                            style={{ backgroundColor: "#DCFCE7", color: "#15803D", fontSize: "0.75rem" }}
                            data-testid={`user-status-${u.id}`}
                          >
                            Active
                          </span>
                        ) : (
                          <span
                            className="badge rounded-pill fw-semibold px-2 py-1"
                            style={{ backgroundColor: "#FEE2E2", color: "#B91C1C", fontSize: "0.75rem" }}
                            data-testid={`user-status-${u.id}`}
                          >
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="text-end pe-3 py-3">
                        <div className="d-inline-flex align-items-center gap-1">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
                            onClick={() => setEditingUser(u)}
                            data-testid={`edit-user-btn-${u.id}`}
                            title="Edit user details"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-warning d-inline-flex align-items-center gap-1 text-dark"
                            onClick={() => setResettingUser(u)}
                            data-testid={`reset-password-btn-${u.id}`}
                            title="Reset initial password"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            <span>Reset Password</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {paginationMeta.totalPages > 1 && (
            <div
              className="d-flex flex-column flex-sm-row align-items-center justify-content-between p-3 border-top gap-2"
              style={{ backgroundColor: "#FFFFFF" }}
              data-testid="pagination-footer"
            >
              <div className="small text-muted" data-testid="pagination-info">
                Showing{" "}
                <span className="fw-semibold">
                  {(paginationMeta.currentPage - 1) * paginationMeta.pageSize + 1}
                </span>{" "}
                to{" "}
                <span className="fw-semibold">
                  {Math.min(
                    paginationMeta.currentPage * paginationMeta.pageSize,
                    paginationMeta.totalItems
                  )}
                </span>{" "}
                of <span className="fw-semibold">{paginationMeta.totalItems}</span> users
              </div>

              <div className="d-flex align-items-center gap-1">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  disabled={paginationMeta.currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  data-testid="prev-page-btn"
                >
                  &larr; Prev
                </button>

                {getPaginationItems(paginationMeta.currentPage, paginationMeta.totalPages).map((item, idx) => {
                  if (item === "...") {
                    return (
                      <span key={`ellipsis-${idx}`} className="px-2 text-muted small">
                        &hellip;
                      </span>
                    );
                  }
                  const p = item as number;
                  return (
                    <button
                      key={p}
                      type="button"
                      className={`btn btn-sm ${
                        p === paginationMeta.currentPage ? "text-white fw-bold" : "btn-outline-secondary"
                      }`}
                      style={
                        p === paginationMeta.currentPage
                          ? { backgroundColor: "#006B3C", borderColor: "#006B3C" }
                          : {}
                      }
                      onClick={() => setPage(p)}
                      data-testid={`page-btn-${p}`}
                    >
                      {p}
                    </button>
                  );
                })}

                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  disabled={paginationMeta.currentPage >= paginationMeta.totalPages}
                  onClick={() => setPage((p) => Math.min(paginationMeta.totalPages, p + 1))}
                  data-testid="next-page-btn"
                >
                  Next &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 1. Create User Modal */}
      {/* ------------------------------------------------------------------- */}
      {isCreateModalOpen && (
        <CreateUserModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={(created) => {
            setIsCreateModalOpen(false);
            setSuccessToast(`User "${created.fullName || created.name}" created successfully.`);
            loadUsers();
          }}
        />
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 2. Edit User Modal */}
      {/* ------------------------------------------------------------------- */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          currentUserId={currentUser?.id}
          onClose={() => setEditingUser(null)}
          onSuccess={async (updated) => {
            setEditingUser(null);
            setSuccessToast(`User "${updated.fullName || updated.name}" updated successfully.`);
            if (updated.id === currentUser?.id) {
              await refreshUser?.();
            }
            loadUsers();
          }}
        />
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 3. Reset Initial Password Modal */}
      {/* ------------------------------------------------------------------- */}
      {resettingUser && (
        <ResetPasswordModal
          user={resettingUser}
          onClose={() => setResettingUser(null)}
          onSuccess={() => {
            setResettingUser(null);
            setSuccessToast(`Initial password reset for "${resettingUser.fullName || resettingUser.name}".`);
            loadUsers();
          }}
        />
      )}
    </div>
  );
}

// =============================================================================
// Helper Component: Create User Modal
// =============================================================================
interface CreateUserModalProps {
  onClose: () => void;
  onSuccess: (user: AdminUserResponse) => void;
}

function CreateUserModal({ onClose, onSuccess }: CreateUserModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState<"REQUESTER" | "IT_STAFF" | "ADMINISTRATOR">("REQUESTER");
  const [initialPassword, setInitialPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Criteria validation checks
  const hasMinLength = initialPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(initialPassword);
  const hasLowercase = /[a-z]/.test(initialPassword);
  const hasNumber = /[0-9]/.test(initialPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/]/.test(initialPassword);
  const isPasswordValid =
    hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage("Full name must be at least 2 characters.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage("Please provide a valid email address.");
      return;
    }
    if (!isPasswordValid) {
      setErrorMessage("Password must satisfy all complexity criteria.");
      return;
    }

    setLoading(true);
    try {
      const payload: CreateAdminUserPayload = {
        fullName: fullName.trim(),
        email: email.trim(),
        department: department.trim() || null,
        role,
        initialPassword,
        isActive,
      };

      const res = await createAdminUser(payload);
      onSuccess(res.user);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal show d-block"
      tabIndex={-1}
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1055 }}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow-lg border-0">
          <form onSubmit={handleSubmit}>
            {/* Modal Header */}
            <div className="modal-header border-bottom pb-3" style={{ backgroundColor: "#F9FAFB" }}>
              <div>
                <h2 className="modal-title h5 fw-bold text-dark mb-0">Create New User</h2>
                <p className="text-muted small mb-0">
                  Provision a user account with role assignment and initial password.
                </p>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>

            {/* Modal Body */}
            <div className="modal-body p-4">
              {/* Notice */}
              <div
                className="alert alert-info border-0 small d-flex align-items-start gap-2 mb-3"
                style={{ backgroundColor: "#E0F2FE", color: "#0369A1" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="flex-shrink-0 mt-1"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <div>
                  <strong>Mandatory First-Login Password Change:</strong> The user will be required to set a permanent password upon logging in with this temporary password (AC-10 / FR-16).
                </div>
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div
                  className="alert alert-danger border-0 small mb-3"
                  data-testid="create-user-error"
                >
                  {errorMessage}
                </div>
              )}

              {/* Full Name */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark mb-1">
                  Full Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Supaporn Srisuk"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  data-testid="create-user-fullname"
                />
              </div>

              {/* Email Address */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark mb-1">
                  Email Address <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="e.g. supaporn.s@toktickit.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="create-user-email"
                />
              </div>

              {/* Department */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark mb-1">
                  Department <span className="text-muted fw-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. IT Operations, Support, Marketing"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  data-testid="create-user-department"
                />
              </div>

              {/* Role */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark mb-1">
                  Role <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  data-testid="create-user-role"
                >
                  <option value="REQUESTER">Requester (Create and track own tickets)</option>
                  <option value="IT_STAFF">IT Staff (Claim, resolve, manage queue)</option>
                  <option value="ADMINISTRATOR">Administrator (Full operational control)</option>
                </select>
              </div>

              {/* Initial Password */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark mb-1">
                  Initial Password <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="Enter temporary password"
                    value={initialPassword}
                    onChange={(e) => setInitialPassword(e.target.value)}
                    required
                    data-testid="create-user-password"
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {/* Password Criteria Checklist */}
                <div className="mt-2 p-2 rounded bg-light border">
                  <div className="small fw-semibold text-muted mb-1" style={{ fontSize: "0.75rem" }}>
                    Password Requirements:
                  </div>
                  <div className="d-flex flex-column gap-1" style={{ fontSize: "0.75rem" }}>
                    <CriteriaCheck passed={hasMinLength} label="At least 8 characters" />
                    <CriteriaCheck passed={hasUppercase} label="At least 1 uppercase letter (A-Z)" />
                    <CriteriaCheck passed={hasLowercase} label="At least 1 lowercase letter (a-z)" />
                    <CriteriaCheck passed={hasNumber} label="At least 1 numeric digit (0-9)" />
                    <CriteriaCheck passed={hasSpecialChar} label="At least 1 special character (!@#$%...)" />
                  </div>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="form-check form-switch mt-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="create-user-isactive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  data-testid="create-user-isactive"
                />
                <label className="form-check-label small fw-semibold text-dark" htmlFor="create-user-isactive">
                  Account is Active (Immediate login permitted)
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer border-top bg-light p-3">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-sm text-white fw-semibold px-3"
                style={{ backgroundColor: "#006B3C", borderColor: "#006B3C" }}
                disabled={loading}
                data-testid="submit-create-user"
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                    Creating...
                  </>
                ) : (
                  "Create User"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Helper Component: Edit User Modal
// =============================================================================
interface EditUserModalProps {
  user: AdminUserResponse;
  currentUserId?: number;
  onClose: () => void;
  onSuccess: (user: AdminUserResponse) => void;
}

function EditUserModal({ user, currentUserId, onClose, onSuccess }: EditUserModalProps) {
  const [fullName, setFullName] = useState(user.fullName || user.name || "");
  const [email, setEmail] = useState(user.email);
  const [department, setDepartment] = useState(user.department || "");
  const [role, setRole] = useState<"REQUESTER" | "IT_STAFF" | "ADMINISTRATOR">(user.role);
  const [isActive, setIsActive] = useState<boolean>(user.isActive);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isSelf = currentUserId === user.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage("Full name must be at least 2 characters.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage("Please provide a valid email address.");
      return;
    }

    // Client-side Safety Check for Self-Deactivation (BR-07 / AC-11)
    if (isSelf && !isActive) {
      setErrorMessage("Safety Rule BR-07: You cannot deactivate your own account.");
      return;
    }

    // Client-side Safety Check for Self-Demotion
    if (isSelf && role !== "ADMINISTRATOR") {
      setErrorMessage("Safety Rule: You cannot change or demote your own role.");
      return;
    }

    setLoading(true);
    try {
      const payload: UpdateAdminUserPayload = {
        fullName: fullName.trim(),
        email: email.trim(),
        department: department.trim() || null,
        role,
        isActive,
      };

      const res = await updateAdminUser(user.id, payload);
      onSuccess(res.user);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal show d-block"
      tabIndex={-1}
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1055 }}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow-lg border-0">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="modal-header border-bottom pb-3" style={{ backgroundColor: "#F9FAFB" }}>
              <div>
                <h2 className="modal-title h5 fw-bold text-dark mb-0">Edit User Profile</h2>
                <p className="text-muted small mb-0">
                  User ID: #{user.id} • {user.email}
                </p>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>

            {/* Body */}
            <div className="modal-body p-4">
              {/* Self Warning (BR-07) */}
              {isSelf && (
                <div
                  className="alert alert-warning border-0 small d-flex align-items-start gap-2 mb-3"
                  style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}
                  data-testid="self-edit-warning"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="flex-shrink-0 mt-1"
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <div>
                    <strong>Self-Protection Rule (BR-07 / AC-11):</strong> You are currently logged in as this Administrator. Disabling your own account is prohibited to ensure uninterrupted system access.
                  </div>
                </div>
              )}

              {/* Admin Safety Reminder (BR-08) */}
              {user.role === "ADMINISTRATOR" && !isSelf && (
                <div
                  className="alert alert-info border-0 small d-flex align-items-start gap-2 mb-3"
                  style={{ backgroundColor: "#F3E8FF", color: "#6B21A8" }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="flex-shrink-0 mt-1"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <div>
                    <strong>Last Administrator Protection (BR-08 / AC-12):</strong> TokTickIT requires at least one active Administrator at all times. Attempting to deactivate or demote the sole remaining Administrator will be rejected.
                  </div>
                </div>
              )}

              {/* Error Banner */}
              {errorMessage && (
                <div
                  className="alert alert-danger border-0 small mb-3"
                  data-testid="edit-user-error"
                >
                  {errorMessage}
                </div>
              )}

              {/* Full Name */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark mb-1">
                  Full Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  data-testid="edit-user-fullname"
                />
              </div>

              {/* Email Address */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark mb-1">
                  Email Address <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="edit-user-email"
                />
              </div>

              {/* Department */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark mb-1">
                  Department <span className="text-muted fw-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. IT Operations, Marketing"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  data-testid="edit-user-department"
                />
              </div>

              {/* Role */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark mb-1">
                  Role <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  value={role}
                  disabled={isSelf} // Self cannot change role
                  onChange={(e) => setRole(e.target.value as any)}
                  data-testid="edit-user-role"
                >
                  <option value="REQUESTER">Requester</option>
                  <option value="IT_STAFF">IT Staff</option>
                  <option value="ADMINISTRATOR">Administrator</option>
                </select>
                {isSelf && (
                  <div className="text-muted small mt-1" style={{ fontSize: "0.75rem" }}>
                    (Role change disabled on your own logged-in account)
                  </div>
                )}
              </div>

              {/* Active Toggle */}
              <div className="form-check form-switch mt-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="edit-user-isactive"
                  checked={isActive}
                  disabled={isSelf} // Self cannot deactivate
                  onChange={(e) => setIsActive(e.target.checked)}
                  data-testid="edit-user-isactive"
                />
                <label className="form-check-label small fw-semibold text-dark" htmlFor="edit-user-isactive">
                  Account is Active
                </label>
                {isSelf && (
                  <div className="text-muted small mt-1" style={{ fontSize: "0.75rem" }}>
                    (Deactivation disabled on your own logged-in account)
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer border-top bg-light p-3">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-sm text-white fw-semibold px-3"
                style={{ backgroundColor: "#006B3C", borderColor: "#006B3C" }}
                disabled={loading}
                data-testid="submit-edit-user"
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Helper Component: Reset Password Modal
// =============================================================================
interface ResetPasswordModalProps {
  user: AdminUserResponse;
  onClose: () => void;
  onSuccess: () => void;
}

function ResetPasswordModal({ user, onClose, onSuccess }: ResetPasswordModalProps) {
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Criteria validation checks
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/]/.test(newPassword);
  const isPasswordValid =
    hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isPasswordValid) {
      setErrorMessage("Please meet all password criteria requirements.");
      return;
    }

    setLoading(true);
    try {
      await resetAdminUserPassword(user.id, newPassword);
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal show d-block"
      tabIndex={-1}
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1055 }}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow-lg border-0">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="modal-header border-bottom pb-3" style={{ backgroundColor: "#F9FAFB" }}>
              <div>
                <h2 className="modal-title h5 fw-bold text-dark mb-0">Reset Initial Password</h2>
                <p className="text-muted small mb-0">
                  User: {user.fullName || user.name} ({user.email})
                </p>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>

            {/* Body */}
            <div className="modal-body p-4">
              <div
                className="alert alert-warning border-0 small d-flex align-items-start gap-2 mb-3"
                style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="flex-shrink-0 mt-1"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <div>
                  <strong>Mandatory Password Reset (FR-18):</strong> The user&apos;s initial password will be updated and their <code>mustChangePassword</code> status will be reset to <code>true</code>. They will be forced to configure a new password upon their next login.
                </div>
              </div>

              {errorMessage && (
                <div
                  className="alert alert-danger border-0 small mb-3"
                  data-testid="reset-password-error"
                >
                  {errorMessage}
                </div>
              )}

              {/* New Password Input */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark mb-1">
                  New Initial Password <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="Enter new temporary password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    data-testid="reset-password-input"
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {/* Criteria Checklist */}
                <div className="mt-2 p-2 rounded bg-light border">
                  <div className="small fw-semibold text-muted mb-1" style={{ fontSize: "0.75rem" }}>
                    Password Requirements:
                  </div>
                  <div className="d-flex flex-column gap-1" style={{ fontSize: "0.75rem" }}>
                    <CriteriaCheck passed={hasMinLength} label="At least 8 characters" />
                    <CriteriaCheck passed={hasUppercase} label="At least 1 uppercase letter (A-Z)" />
                    <CriteriaCheck passed={hasLowercase} label="At least 1 lowercase letter (a-z)" />
                    <CriteriaCheck passed={hasNumber} label="At least 1 numeric digit (0-9)" />
                    <CriteriaCheck passed={hasSpecialChar} label="At least 1 special character (!@#$%...)" />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer border-top bg-light p-3">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-sm btn-warning text-dark fw-semibold px-3"
                disabled={loading}
                data-testid="submit-reset-password"
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Helper: Criteria Item Component
// =============================================================================
function CriteriaCheck({ passed, label }: { passed: boolean; label: string }) {
  return (
    <div className={`d-flex align-items-center gap-1 ${passed ? "text-success fw-medium" : "text-muted"}`}>
      {passed ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="9" />
        </svg>
      )}
      <span>{label}</span>
    </div>
  );
}
