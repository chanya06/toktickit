import React from "react";
import { useAuth } from "../context/AuthContext.js";
import { useRequester } from "../context/RequesterContext.js";

export type NavTab =
  | "my-tickets"
  | "create-ticket"
  | "ticket-queue"
  | "user-management"
  | "ticket-detail";

interface HeaderProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onSelectTab }) => {
  const { user, logout } = useAuth();
  const { selectedRequester, openSelectorModal } = useRequester();

  const handleBrandClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user?.role === "ADMINISTRATOR") {
      onSelectTab("user-management");
    } else if (user?.role === "IT_STAFF") {
      onSelectTab("ticket-queue");
    } else {
      onSelectTab("my-tickets");
    }
  };

  const renderRoleBadge = (role?: string) => {
    switch (role) {
      case "REQUESTER":
        return (
          <span
            className="badge rounded-pill fw-semibold px-2 py-1"
            style={{ backgroundColor: "#E0F2FE", color: "#0369A1", fontSize: "0.75rem" }}
            data-testid="user-role-badge"
          >
            Requester
          </span>
        );
      case "IT_STAFF":
        return (
          <span
            className="badge rounded-pill fw-semibold px-2 py-1"
            style={{ backgroundColor: "#EAF6EF", color: "#006B3C", fontSize: "0.75rem" }}
            data-testid="user-role-badge"
          >
            IT Staff
          </span>
        );
      case "ADMINISTRATOR":
        return (
          <span
            className="badge rounded-pill fw-semibold px-2 py-1"
            style={{ backgroundColor: "#F3E8FF", color: "#7E22CE", fontSize: "0.75rem" }}
            data-testid="user-role-badge"
          >
            Administrator
          </span>
        );
      default:
        return null;
    }
  };

  const isRequesterRole = !user || user.role === "REQUESTER";
  const isItStaffRole = user?.role === "IT_STAFF";
  const isAdminRole = user?.role === "ADMINISTRATOR";

  return (
    <header
      className="app-header py-2 px-3 mb-4 shadow-sm"
      style={{ backgroundColor: "var(--primary-green, #006B3C)" }}
    >
      <div className="container-fluid d-flex align-items-center justify-content-between">
        {/* Application Brand Logo & Navigation */}
        <div className="d-flex align-items-center gap-4">
          <a
            href="#"
            className="fs-4 fw-bold text-white d-flex align-items-center gap-2 text-decoration-none"
            onClick={handleBrandClick}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="tracking-tight">TokTickIT</span>
          </a>

          <nav className="d-flex gap-2">
            {/* Requester Navigation Links */}
            {isRequesterRole && (
              <>
                <button
                  type="button"
                  className={`btn btn-link text-white text-decoration-none fw-medium d-flex align-items-center gap-1 ${
                    activeTab === "my-tickets"
                      ? "opacity-100 fw-bold border-bottom border-2 border-white pb-1"
                      : "opacity-75"
                  }`}
                  onClick={() => onSelectTab("my-tickets")}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  <span>My Tickets</span>
                </button>
                <button
                  type="button"
                  className={`btn btn-link text-white text-decoration-none fw-medium d-flex align-items-center gap-1 ${
                    activeTab === "create-ticket"
                      ? "opacity-100 fw-bold border-bottom border-2 border-white pb-1"
                      : "opacity-75"
                  }`}
                  onClick={() => onSelectTab("create-ticket")}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                  <span>Create Ticket</span>
                </button>
              </>
            )}

            {/* IT Staff Navigation Links */}
            {isItStaffRole && (
              <button
                type="button"
                className={`btn btn-link text-white text-decoration-none fw-medium d-flex align-items-center gap-1 ${
                  activeTab === "ticket-queue"
                    ? "opacity-100 fw-bold border-bottom border-2 border-white pb-1"
                    : "opacity-75"
                }`}
                onClick={() => onSelectTab("ticket-queue")}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                </svg>
                <span>Ticket Queue</span>
              </button>
            )}

            {/* Administrator Navigation Links */}
            {isAdminRole && (
              <>
                <button
                  type="button"
                  className={`btn btn-link text-white text-decoration-none fw-medium d-flex align-items-center gap-1 ${
                    activeTab === "user-management"
                      ? "opacity-100 fw-bold border-bottom border-2 border-white pb-1"
                      : "opacity-75"
                  }`}
                  onClick={() => onSelectTab("user-management")}
                >
                  <svg
                    width="16"
                    height="16"
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
                  <span>User Management</span>
                </button>
                <button
                  type="button"
                  className={`btn btn-link text-white text-decoration-none fw-medium d-flex align-items-center gap-1 ${
                    activeTab === "ticket-queue"
                      ? "opacity-100 fw-bold border-bottom border-2 border-white pb-1"
                      : "opacity-75"
                  }`}
                  onClick={() => onSelectTab("ticket-queue")}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                  </svg>
                  <span>Ticket Queue</span>
                </button>
              </>
            )}
          </nav>
        </div>

        {/* User Identity & Logout / Dev Switcher */}
        <div className="d-flex align-items-center gap-2">
          {user ? (
            <div className="d-flex align-items-center gap-2">
              <div
                className="user-profile-badge bg-white bg-opacity-10 border border-white border-opacity-25 rounded-pill px-3 py-1 text-white d-flex align-items-center gap-2"
                data-testid="header-user-profile"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span className="fw-semibold text-white" data-testid="header-user-name">
                  {user.fullName}
                </span>
                {renderRoleBadge(user.role)}
              </div>

              <button
                type="button"
                className="btn btn-sm btn-outline-light d-flex align-items-center gap-1 ms-2"
                onClick={logout}
                data-testid="header-logout-button"
                title="Sign out of TokTickIT"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          ) : selectedRequester ? (
            <div className="requester-badge bg-white bg-opacity-10 border border-white border-opacity-25 rounded-pill px-3 py-1 text-white d-flex align-items-center gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className="fw-medium">{selectedRequester.name}</span>
              {selectedRequester.department && (
                <span className="badge bg-light text-dark small">{selectedRequester.department}</span>
              )}
              <button
                type="button"
                className="btn btn-sm text-white text-decoration-underline p-0 ms-2"
                onClick={openSelectorModal}
                title="Change Development Requester identity"
              >
                Change Requester
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-sm btn-outline-light d-flex align-items-center gap-1"
              onClick={openSelectorModal}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Select Requester Context</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
