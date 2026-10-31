import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext.js";
import {
  fetchRequesterDashboard,
  RequesterDashboardResponse,
  DashboardTicket,
} from "../api.js";

interface RequesterDashboardProps {
  onNavigateCreate: () => void;
  onNavigateMyTickets: (filter?: { status?: string }) => void;
  onSelectTicket: (ticketId: number) => void;
}

const STATUS_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  NEW: { bg: "#DBEAFE", text: "#1E40AF", label: "New" },
  OPEN: { bg: "#DCFCE7", text: "#15803D", label: "Open" },
  IN_PROGRESS: { bg: "#FEF3C7", text: "#B45309", label: "In Progress" },
  WAITING_FOR_REQUESTER: { bg: "#F3E8FF", text: "#6B21A8", label: "Waiting for Requester" },
  PENDING: { bg: "#EDE9FE", text: "#5B21B6", label: "Pending" },
  RESOLVED: { bg: "#D1FAE5", text: "#065F46", label: "Resolved" },
  CLOSED: { bg: "#E2E8F0", text: "#334155", label: "Closed" },
  REOPENED: { bg: "#FFEDD5", text: "#C2410C", label: "Reopened" },
  CANCELLED: { bg: "#FEE2E2", text: "#B91C1C", label: "Cancelled" },
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

export const RequesterDashboard: React.FC<RequesterDashboardProps> = ({
  onNavigateCreate,
  onNavigateMyTickets,
  onSelectTicket,
}) => {
  const { user } = useAuth();
  const [data, setData] = useState<RequesterDashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchRequesterDashboard();
      setData(result);
    } catch (err: any) {
      setError(err.message || "Failed to load requester dashboard metrics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const metrics = data?.metrics || {
    myOpenTickets: 0,
    waitingForRequester: 0,
    recentlyUpdated: 0,
    recentlyResolved: 0,
  };

  const recentTickets = data?.recentTickets || [];

  return (
    <div className="requester-dashboard" data-testid="requester-dashboard">
      {/* 1. Welcome Banner */}
      <div className="card shadow-sm border-0 mb-4" style={{ backgroundColor: "#FFFFFF" }} data-testid="dashboard-welcome-banner">
        <div className="card-body p-3 p-md-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <h1 className="h4 fw-bold mb-0 text-dark">
                Welcome, {user?.fullName || "Requester"}!
              </h1>
              <span
                className="badge rounded-pill fw-semibold px-2 py-1"
                style={{ backgroundColor: "#E0F2FE", color: "#0369A1", fontSize: "0.75rem" }}
                data-testid="user-role-badge"
              >
                Requester
              </span>
            </div>
            <p className="text-muted small mb-0">
              Track the status of your submitted support requests and review recent activity.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
            onClick={loadDashboard}
            disabled={loading}
            data-testid="refresh-dashboard-btn"
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
            ) : (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
            )}
            <span>{loading ? "Refreshing…" : "Refresh Metrics"}</span>
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="alert alert-danger shadow-sm d-flex align-items-center justify-content-between mb-4" role="alert">
          <div>
            <strong>Error:</strong> {error}
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={loadDashboard}
          >
            Retry
          </button>
        </div>
      )}

      {/* 2. Zen Green Metric Cards Grid (4 Cards: Desktop 4-col, Tablet 2x2, Mobile 1-col) */}
      <div className="row g-3 mb-4">
        {/* Card 1: My Open Tickets */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div
            className="card h-100 shadow-sm border-0"
            style={{
              borderLeft: "4px solid var(--primary-green, #006B3C)",
              backgroundColor: "#FFFFFF",
            }}
            data-testid="card-my-open-tickets"
          >
            <div className="card-body p-3 d-flex flex-column justify-content-between">
              <div>
                <span className="text-muted small text-uppercase fw-semibold tracking-wider">
                  My Open Tickets
                </span>
                <div
                  className="display-6 fw-bold mt-1"
                  style={{ color: metrics.myOpenTickets > 0 ? "var(--primary-green, #006B3C)" : "#64748B" }}
                  data-testid="metric-my-open-tickets"
                >
                  {metrics.myOpenTickets}
                </div>
                <div className="small text-muted mt-1">Active support requests</div>
              </div>
              <div className="mt-3 pt-2 border-top">
                <button
                  type="button"
                  className="btn btn-link btn-sm text-decoration-none p-0 fw-semibold d-inline-flex align-items-center gap-1"
                  style={{ color: "var(--primary-green, #006B3C)" }}
                  onClick={() => onNavigateMyTickets({ status: "open" })}
                >
                  <span>View all</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Waiting for Your Input */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div
            className="card h-100 shadow-sm border-0"
            style={{
              borderLeft: metrics.waitingForRequester > 0 ? "4px solid #D97706" : "4px solid #CBD5E1",
              backgroundColor: metrics.waitingForRequester > 0 ? "#FFFBEB" : "#FFFFFF",
            }}
            data-testid="card-waiting-for-requester"
          >
            <div className="card-body p-3 d-flex flex-column justify-content-between">
              <div>
                <span className="text-muted small text-uppercase fw-semibold tracking-wider">
                  Waiting for Input
                </span>
                <div
                  className="display-6 fw-bold mt-1"
                  style={{ color: metrics.waitingForRequester > 0 ? "#B45309" : "#64748B" }}
                  data-testid="metric-waiting-for-requester"
                >
                  {metrics.waitingForRequester}
                </div>
                <div className="small text-muted mt-1">Requires your response</div>
              </div>
              <div className="mt-3 pt-2 border-top">
                <button
                  type="button"
                  className="btn btn-link btn-sm text-decoration-none p-0 fw-semibold d-inline-flex align-items-center gap-1"
                  style={{ color: metrics.waitingForRequester > 0 ? "#B45309" : "#64748B" }}
                  onClick={() => onNavigateMyTickets({ status: "WAITING_FOR_REQUESTER" })}
                >
                  <span>{metrics.waitingForRequester > 0 ? "Respond now" : "View waiting"}</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Recently Updated */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div
            className="card h-100 shadow-sm border-0"
            style={{
              borderLeft: "4px solid var(--secondary-green, #0B7A46)",
              backgroundColor: "#FFFFFF",
            }}
            data-testid="card-recently-updated"
          >
            <div className="card-body p-3 d-flex flex-column justify-content-between">
              <div>
                <span className="text-muted small text-uppercase fw-semibold tracking-wider">
                  Recently Updated
                </span>
                <div
                  className="display-6 fw-bold mt-1"
                  style={{ color: metrics.recentlyUpdated > 0 ? "#0F172A" : "#64748B" }}
                  data-testid="metric-recently-updated"
                >
                  {metrics.recentlyUpdated}
                </div>
                <div className="small text-muted mt-1">Updated in last 7 days</div>
              </div>
              <div className="mt-3 pt-2 border-top">
                <button
                  type="button"
                  className="btn btn-link btn-sm text-decoration-none p-0 fw-semibold d-inline-flex align-items-center gap-1"
                  style={{ color: "var(--primary-green, #006B3C)" }}
                  onClick={() => onNavigateMyTickets()}
                >
                  <span>View all</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Recently Resolved */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div
            className="card h-100 shadow-sm border-0"
            style={{
              borderLeft: "4px solid #16A34A",
              backgroundColor: "#FFFFFF",
            }}
            data-testid="card-recently-resolved"
          >
            <div className="card-body p-3 d-flex flex-column justify-content-between">
              <div>
                <span className="text-muted small text-uppercase fw-semibold tracking-wider">
                  Recently Resolved
                </span>
                <div
                  className="display-6 fw-bold mt-1"
                  style={{ color: metrics.recentlyResolved > 0 ? "#16A34A" : "#64748B" }}
                  data-testid="metric-recently-resolved"
                >
                  {metrics.recentlyResolved}
                </div>
                <div className="small text-muted mt-1">Resolved in last 30 days</div>
              </div>
              <div className="mt-3 pt-2 border-top">
                <button
                  type="button"
                  className="btn btn-link btn-sm text-decoration-none p-0 fw-semibold d-inline-flex align-items-center gap-1"
                  style={{ color: "var(--primary-green, #006B3C)" }}
                  onClick={() => onNavigateMyTickets({ status: "RESOLVED" })}
                >
                  <span>View history</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Operational Section (2-Column Grid on Desktop) */}
      <div className="row g-4">
        {/* Left Column (70%): My Recent Tickets */}
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3 px-3 px-md-4 d-flex justify-content-between align-items-center border-bottom">
              <div className="d-flex align-items-center gap-2">
                <h2 className="h6 fw-bold mb-0 text-dark">My Recent Tickets</h2>
                {recentTickets.length > 0 && (
                  <span className="badge rounded-pill bg-light text-muted border">
                    {recentTickets.length}
                  </span>
                )}
              </div>
              <button
                type="button"
                className="btn btn-sm btn-link text-decoration-none p-0 fw-medium"
                style={{ color: "var(--primary-green, #006B3C)" }}
                onClick={() => onNavigateMyTickets()}
              >
                View full list →
              </button>
            </div>

            <div className="card-body p-0">
              {recentTickets.length === 0 ? (
                <div
                  className="p-4 p-md-5 text-center text-muted"
                  data-testid="empty-recent-tickets"
                >
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                    style={{ width: "56px", height: "56px", backgroundColor: "var(--pale-green, #EAF6EF)", color: "var(--primary-green, #006B3C)" }}
                  >
                    <svg
                      width="28"
                      height="28"
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
                  </div>
                  <h3 className="h6 fw-semibold mb-2">No support requests found</h3>
                  <p className="small text-muted mb-3" style={{ maxWidth: 400, margin: "0 auto" }}>
                    No support requests found. Click '+ Submit New Request' to get IT support.
                  </p>
                  <button
                    type="button"
                    className="btn-zen-primary btn-sm"
                    onClick={onNavigateCreate}
                  >
                    + Submit New Request
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0" data-testid="recent-tickets-table">
                    <thead className="table-light">
                      <tr className="small text-muted text-uppercase">
                        <th style={{ minWidth: "120px" }}>Ticket No</th>
                        <th style={{ minWidth: "180px" }}>Summary</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Updated</th>
                        <th className="text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTickets.map((t: DashboardTicket) => {
                        const statusBadge = STATUS_BADGES[t.status] || {
                          bg: "#E2E8F0",
                          text: "#334155",
                          label: t.status,
                        };

                        return (
                          <tr key={t.id} data-testid={`recent-ticket-row-${t.id}`}>
                            <td>
                              <span className="font-monospace fw-semibold small text-dark">
                                {t.ticketNumber}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex flex-column">
                                <span className="small fw-semibold text-dark text-truncate" style={{ maxWidth: "260px" }}>
                                  {t.summary}
                                </span>
                                <div className="d-flex align-items-center gap-1 mt-1">
                                  {t.isResolutionIndicated && (
                                    <span
                                      className="badge rounded-pill fw-medium"
                                      style={{ backgroundColor: "#DCFCE7", color: "#15803D", fontSize: "0.68rem" }}
                                      data-testid={`resolution-indicated-badge-${t.id}`}
                                    >
                                      Resolution Indicated
                                    </span>
                                  )}
                                  {t.actionsCount > 0 && (
                                    <span
                                      className="badge rounded-pill bg-light text-muted border"
                                      style={{ fontSize: "0.68rem" }}
                                    >
                                      {t.actionsCount} {t.actionsCount === 1 ? "action" : "actions"}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="badge rounded-pill bg-light text-secondary border small">
                                {t.category}
                              </span>
                            </td>
                            <td>
                              <span
                                className="badge rounded-pill fw-semibold px-2 py-1"
                                style={{
                                  backgroundColor: statusBadge.bg,
                                  color: statusBadge.text,
                                  fontSize: "0.75rem",
                                }}
                              >
                                {statusBadge.label}
                              </span>
                            </td>
                            <td className="small text-muted text-nowrap">
                              {formatDate(t.updatedAt)}
                            </td>
                            <td className="text-end">
                              <button
                                type="button"
                                className="btn btn-outline-success btn-sm py-1 px-2"
                                style={{ fontSize: "0.8rem" }}
                                onClick={() => onSelectTicket(t.id)}
                                data-testid={`view-ticket-btn-${t.id}`}
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (30%): Quick Help & Actions */}
        <div className="col-12 col-lg-4">
          {/* Quick Actions Card */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white py-3 px-3 border-bottom">
              <h2 className="h6 fw-bold mb-0 text-dark">Quick Actions</h2>
            </div>
            <div className="card-body p-3">
              <button
                type="button"
                className="btn-zen-primary w-100 py-2 mb-2 d-flex align-items-center justify-content-center gap-2"
                onClick={onNavigateCreate}
                data-testid="quick-create-ticket-btn"
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
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                <span>+ Submit New Request</span>
              </button>

              <button
                type="button"
                className="btn-zen-secondary w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                onClick={() => onNavigateMyTickets()}
                data-testid="quick-my-tickets-btn"
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
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                <span>View All My Tickets</span>
              </button>
            </div>
          </div>

          {/* Need Assistance Card */}
          <div
            className="card shadow-sm border-0"
            style={{ backgroundColor: "var(--pale-green, #EAF6EF)", border: "1px solid #C7E2D1" }}
          >
            <div className="card-body p-3">
              <div className="d-flex align-items-center gap-2 mb-2" style={{ color: "var(--primary-green, #006B3C)" }}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <h3 className="h6 fw-bold mb-0">Need Urgent Assistance?</h3>
              </div>
              <p className="small text-muted mb-2">
                For mission-critical outages or urgent hardware failures, call our internal IT Helpdesk:
              </p>
              <div className="p-2 bg-white rounded border small fw-semibold text-dark text-center mb-2">
                📞 Internal Ext: <span className="text-success">1234</span>
              </div>
              <p className="small text-muted mb-0">
                Operating Hours: Monday – Friday, 08:30 – 17:30
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

