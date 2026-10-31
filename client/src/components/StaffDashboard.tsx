import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext.js";
import {
  fetchStaffDashboard,
  fetchAdminDashboard,
  StaffOperationalMetrics,
  DashboardTicket,
  SystemUserStats,
} from "../api.js";

interface StaffDashboardProps {
  onNavigateQueue: (filters?: {
    owner?: string;
    status?: string;
    priority?: string;
  }) => void;
  onNavigateUserManagement?: () => void;
  onSelectTicket: (ticketId: number) => void;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
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

const PRIORITY_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  LOW: { bg: "#F3F4F6", text: "#4B5563", label: "Low" },
  MEDIUM: { bg: "#E0F2FE", text: "#0284C7", label: "Medium" },
  HIGH: { bg: "#FEF3C7", text: "#D97706", label: "High" },
  URGENT: { bg: "#FEE2E2", text: "#DC2626", label: "Urgent" },
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

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  onNavigateQueue,
  onNavigateUserManagement,
  onSelectTicket,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMINISTRATOR";

  const [metrics, setMetrics] = useState<StaffOperationalMetrics>({
    unassignedTickets: 0,
    myAssignedTickets: 0,
    byStatus: {
      NEW: 0,
      OPEN: 0,
      IN_PROGRESS: 0,
      WAITING_FOR_REQUESTER: 0,
      PENDING: 0,
      RESOLVED: 0,
      CLOSED: 0,
      REOPENED: 0,
      CANCELLED: 0,
    },
    byPriority: {
      URGENT: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
    },
    recentlyUpdatedCount: 0,
  });

  const [urgentTickets, setUrgentTickets] = useState<DashboardTicket[]>([]);
  const [recentTickets, setRecentTickets] = useState<DashboardTicket[]>([]);
  const [systemUserStats, setSystemUserStats] = useState<SystemUserStats | null>(null);

  const [activeQueueTab, setActiveQueueTab] = useState<"urgent" | "recent">("urgent");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (isAdmin) {
        const adminData = await fetchAdminDashboard();
        setMetrics(adminData.operationalMetrics);
        setUrgentTickets(adminData.urgentTickets || []);
        setRecentTickets(adminData.recentTickets || []);
        setSystemUserStats(adminData.systemUserStats || null);
      } else {
        const staffData = await fetchStaffDashboard();
        setMetrics(staffData.metrics);
        setUrgentTickets(staffData.urgentTickets || []);
        setRecentTickets(staffData.recentTickets || []);
        setSystemUserStats(null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load staff dashboard metrics");
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const displayedTickets = activeQueueTab === "urgent" ? urgentTickets : recentTickets;

  return (
    <div className="staff-dashboard" data-testid="staff-dashboard">
      {/* 1. Welcome & Operational Header */}
      <div className="card shadow-sm border-0 mb-4" style={{ backgroundColor: "#FFFFFF" }} data-testid="dashboard-welcome-banner">
        <div className="card-body p-3 p-md-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <h1 className="h4 fw-bold mb-0 text-dark">
                Welcome back, {user?.fullName || "Staff Member"}!
              </h1>
              <span
                className="badge rounded-pill fw-semibold px-2 py-1"
                style={{
                  backgroundColor: isAdmin ? "#F3E8FF" : "#EAF6EF",
                  color: isAdmin ? "#7E22CE" : "#006B3C",
                  fontSize: "0.75rem",
                }}
                data-testid="user-role-badge"
              >
                {isAdmin ? "Administrator" : "IT Staff"}
              </span>
            </div>
            <p className="text-muted small mb-0">
              Operational triage overview, active workloads, and queue metrics.
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

      {/* Error Banner */}
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

      {/* 2. System User Administration Row (Admin Only) */}
      {isAdmin && systemUserStats && (
        <div className="card shadow-sm border-0 mb-4" style={{ backgroundColor: "#FAF5FF", border: "1px solid #E9D5FF" }} data-testid="admin-system-stats">
          <div className="card-body p-3">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <div className="d-flex align-items-center gap-2">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#7E22CE"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span className="fw-bold text-dark small text-uppercase tracking-wider">
                  System User Overview
                </span>
              </div>
              {onNavigateUserManagement && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary py-1 px-2 fw-medium d-inline-flex align-items-center gap-1"
                  style={{ borderColor: "#A855F7", color: "#7E22CE" }}
                  onClick={onNavigateUserManagement}
                  data-testid="admin-manage-users-btn"
                >
                  <span>User Directory</span>
                  <span>→</span>
                </button>
              )}
            </div>

            <div className="row g-2 text-center">
              <div className="col-6 col-sm-4 col-md-2">
                <div className="p-2 bg-white rounded border">
                  <div className="small text-muted">Total Users</div>
                  <div className="fs-5 fw-bold text-dark" data-testid="stat-total-users">{systemUserStats.totalUsers}</div>
                </div>
              </div>
              <div className="col-6 col-sm-4 col-md-2">
                <div className="p-2 bg-white rounded border">
                  <div className="small text-muted">Requesters</div>
                  <div className="fs-5 fw-bold text-primary" data-testid="stat-active-requesters">{systemUserStats.activeRequesters}</div>
                </div>
              </div>
              <div className="col-6 col-sm-4 col-md-2">
                <div className="p-2 bg-white rounded border">
                  <div className="small text-muted">IT Staff</div>
                  <div className="fs-5 fw-bold text-success" data-testid="stat-active-staff">{systemUserStats.activeStaff}</div>
                </div>
              </div>
              <div className="col-6 col-sm-4 col-md-2">
                <div className="p-2 bg-white rounded border">
                  <div className="small text-muted">Admins</div>
                  <div className="fs-5 fw-bold" style={{ color: "#7E22CE" }} data-testid="stat-administrators">{systemUserStats.administrators}</div>
                </div>
              </div>
              <div className="col-6 col-sm-4 col-md-2">
                <div className="p-2 bg-white rounded border">
                  <div className="small text-muted">Inactive</div>
                  <div className="fs-5 fw-bold text-secondary" data-testid="stat-inactive-users">{systemUserStats.inactiveUsers}</div>
                </div>
              </div>
              <div className="col-6 col-sm-4 col-md-2">
                <div className="p-2 bg-white rounded border">
                  <div className="small text-muted">Active Staff Ratio</div>
                  <div className="fs-5 fw-bold text-success">
                    {systemUserStats.totalUsers > 0
                      ? Math.round(((systemUserStats.activeStaff + systemUserStats.administrators) / systemUserStats.totalUsers) * 100) + "%"
                      : "0%"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Operational Metric Cards Grid (5 Cards: Desktop 5-col / 3+2, Tablet 2x2, Mobile 1-col) */}
      <div className="row g-3 mb-4">
        {/* Card 1: Unassigned Tickets */}
        <div className="col-12 col-sm-6 col-lg">
          <div
            className="card h-100 shadow-sm border-0"
            style={{
              borderLeft: "4px solid var(--primary-green, #006B3C)",
              backgroundColor: "#FFFFFF",
            }}
            data-testid="card-unassigned-tickets"
          >
            <div className="card-body p-3 d-flex flex-column justify-content-between">
              <div>
                <span className="text-muted small text-uppercase fw-semibold tracking-wider">
                  Unassigned
                </span>
                <div
                  className="display-6 fw-bold mt-1"
                  style={{ color: metrics.unassignedTickets > 0 ? "var(--primary-green, #006B3C)" : "#64748B" }}
                  data-testid="metric-unassigned-tickets"
                >
                  {metrics.unassignedTickets}
                </div>
                <div className="small text-muted mt-1">Queue triage backlog</div>
              </div>
              <div className="mt-3 pt-2 border-top">
                <button
                  type="button"
                  className="btn btn-link btn-sm text-decoration-none p-0 fw-semibold d-inline-flex align-items-center gap-1"
                  style={{ color: "var(--primary-green, #006B3C)" }}
                  onClick={() => onNavigateQueue({ owner: "unassigned" })}
                >
                  <span>View unassigned</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: My Assigned Tickets */}
        <div className="col-12 col-sm-6 col-lg">
          <div
            className="card h-100 shadow-sm border-0"
            style={{
              borderLeft: "4px solid #0284C7",
              backgroundColor: "#FFFFFF",
            }}
            data-testid="card-my-assigned-tickets"
          >
            <div className="card-body p-3 d-flex flex-column justify-content-between">
              <div>
                <span className="text-muted small text-uppercase fw-semibold tracking-wider">
                  My Assigned
                </span>
                <div
                  className="display-6 fw-bold mt-1"
                  style={{ color: metrics.myAssignedTickets > 0 ? "#0284C7" : "#64748B" }}
                  data-testid="metric-my-assigned-tickets"
                >
                  {metrics.myAssignedTickets}
                </div>
                <div className="small text-muted mt-1">Assigned to you</div>
              </div>
              <div className="mt-3 pt-2 border-top">
                <button
                  type="button"
                  className="btn btn-link btn-sm text-decoration-none p-0 fw-semibold d-inline-flex align-items-center gap-1"
                  style={{ color: "#0284C7" }}
                  onClick={() => onNavigateQueue({ owner: "me" })}
                >
                  <span>View my queue</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: In Progress */}
        <div className="col-12 col-sm-6 col-lg">
          <div
            className="card h-100 shadow-sm border-0"
            style={{
              borderLeft: "4px solid #D97706",
              backgroundColor: "#FFFFFF",
            }}
            data-testid="card-in-progress-tickets"
          >
            <div className="card-body p-3 d-flex flex-column justify-content-between">
              <div>
                <span className="text-muted small text-uppercase fw-semibold tracking-wider">
                  In Progress
                </span>
                <div
                  className="display-6 fw-bold mt-1"
                  style={{ color: (metrics.byStatus.IN_PROGRESS || 0) > 0 ? "#B45309" : "#64748B" }}
                  data-testid="metric-in-progress-tickets"
                >
                  {metrics.byStatus.IN_PROGRESS || 0}
                </div>
                <div className="small text-muted mt-1">Active technical work</div>
              </div>
              <div className="mt-3 pt-2 border-top">
                <button
                  type="button"
                  className="btn btn-link btn-sm text-decoration-none p-0 fw-semibold d-inline-flex align-items-center gap-1"
                  style={{ color: "#D97706" }}
                  onClick={() => onNavigateQueue({ status: "IN_PROGRESS" })}
                >
                  <span>View in-progress</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Waiting for Requester */}
        <div className="col-12 col-sm-6 col-lg">
          <div
            className="card h-100 shadow-sm border-0"
            style={{
              borderLeft: "4px solid #7C3AED",
              backgroundColor: "#FFFFFF",
            }}
            data-testid="card-waiting-tickets"
          >
            <div className="card-body p-3 d-flex flex-column justify-content-between">
              <div>
                <span className="text-muted small text-uppercase fw-semibold tracking-wider">
                  Waiting Input
                </span>
                <div
                  className="display-6 fw-bold mt-1"
                  style={{ color: (metrics.byStatus.WAITING_FOR_REQUESTER || 0) > 0 ? "#6D28D9" : "#64748B" }}
                  data-testid="metric-waiting-tickets"
                >
                  {metrics.byStatus.WAITING_FOR_REQUESTER || 0}
                </div>
                <div className="small text-muted mt-1">Pending user reply</div>
              </div>
              <div className="mt-3 pt-2 border-top">
                <button
                  type="button"
                  className="btn btn-link btn-sm text-decoration-none p-0 fw-semibold d-inline-flex align-items-center gap-1"
                  style={{ color: "#7C3AED" }}
                  onClick={() => onNavigateQueue({ status: "WAITING_FOR_REQUESTER" })}
                >
                  <span>View waiting</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Card 5: Urgent Attention */}
        <div className="col-12 col-sm-6 col-lg">
          <div
            className="card h-100 shadow-sm border-0"
            style={{
              borderLeft: (metrics.byPriority.URGENT || 0) > 0 ? "4px solid #DC2626" : "4px solid #CBD5E1",
              backgroundColor: (metrics.byPriority.URGENT || 0) > 0 ? "#FEF2F2" : "#FFFFFF",
            }}
            data-testid="card-urgent-tickets"
          >
            <div className="card-body p-3 d-flex flex-column justify-content-between">
              <div>
                <span className="text-muted small text-uppercase fw-semibold tracking-wider">
                  Urgent
                </span>
                <div
                  className="display-6 fw-bold mt-1"
                  style={{ color: (metrics.byPriority.URGENT || 0) > 0 ? "#DC2626" : "#64748B" }}
                  data-testid="metric-urgent-tickets"
                >
                  {metrics.byPriority.URGENT || 0}
                </div>
                <div className="small text-muted mt-1">High attention triage</div>
              </div>
              <div className="mt-3 pt-2 border-top">
                <button
                  type="button"
                  className="btn btn-link btn-sm text-decoration-none p-0 fw-semibold d-inline-flex align-items-center gap-1"
                  style={{ color: (metrics.byPriority.URGENT || 0) > 0 ? "#DC2626" : "#64748B" }}
                  onClick={() => onNavigateQueue({ priority: "URGENT" })}
                >
                  <span>View urgent</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Main Operational Layout (2-Column Grid on Desktop) */}
      <div className="row g-4">
        {/* Left Column (70%): Triage Queue (Urgent & Recent Tabs) */}
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-2 px-3 d-flex flex-wrap justify-content-between align-items-center border-bottom gap-2">
              {/* Tab Navigation */}
              <ul className="nav nav-pills card-header-pills">
                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link btn-sm py-1 px-3 fw-semibold ${
                      activeQueueTab === "urgent" ? "active bg-danger text-white" : "text-muted"
                    }`}
                    onClick={() => setActiveQueueTab("urgent")}
                    data-testid="tab-urgent-tickets"
                  >
                    <span>Urgent Queue</span>
                    <span className="badge rounded-pill bg-white text-dark ms-1">
                      {urgentTickets.length}
                    </span>
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link btn-sm py-1 px-3 fw-semibold ${
                      activeQueueTab === "recent" ? "active bg-success text-white" : "text-muted"
                    }`}
                    style={activeQueueTab === "recent" ? { backgroundColor: "var(--primary-green, #006B3C)" } : {}}
                    onClick={() => setActiveQueueTab("recent")}
                    data-testid="tab-recent-tickets"
                  >
                    <span>Recent Activity</span>
                    <span className="badge rounded-pill bg-white text-dark ms-1">
                      {recentTickets.length}
                    </span>
                  </button>
                </li>
              </ul>

              <button
                type="button"
                className="btn btn-sm btn-link text-decoration-none p-0 fw-medium"
                style={{ color: "var(--primary-green, #006B3C)" }}
                onClick={() => onNavigateQueue()}
              >
                Go to full queue →
              </button>
            </div>

            <div className="card-body p-0">
              {displayedTickets.length === 0 ? (
                <div
                  className="p-4 p-md-5 text-center text-muted"
                  data-testid={activeQueueTab === "urgent" ? "empty-urgent-queue" : "empty-recent-tickets"}
                >
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                    style={{
                      width: "56px",
                      height: "56px",
                      backgroundColor: activeQueueTab === "urgent" ? "#DCFCE7" : "#F3F4F6",
                      color: activeQueueTab === "urgent" ? "#16A34A" : "#6B7280",
                    }}
                  >
                    {activeQueueTab === "urgent" ? (
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
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    ) : (
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
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                    )}
                  </div>
                  <h3 className="h6 fw-semibold mb-2">
                    {activeQueueTab === "urgent"
                      ? "Queue is clear"
                      : "No recent activity found"}
                  </h3>
                  <p className="small text-muted mb-0" style={{ maxWidth: 400, margin: "0 auto" }}>
                    {activeQueueTab === "urgent"
                      ? "Queue is clear. No urgent tickets require immediate attention."
                      : "No tickets have been updated in the queue recently."}
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0" data-testid="triage-tickets-table">
                    <thead className="table-light">
                      <tr className="small text-muted text-uppercase">
                        <th style={{ minWidth: "120px" }}>Ticket No</th>
                        <th style={{ minWidth: "170px" }}>Summary</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Owner</th>
                        <th>Updated</th>
                        <th className="text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedTickets.map((t: DashboardTicket) => {
                        const statusBadge = STATUS_CONFIG[t.status] || {
                          bg: "#E2E8F0",
                          text: "#334155",
                          label: t.status,
                        };
                        const priorityBadge = PRIORITY_CONFIG[t.itPriority] || {
                          bg: "#F3F4F6",
                          text: "#4B5563",
                          label: t.itPriority,
                        };

                        return (
                          <tr key={t.id} data-testid={`triage-ticket-row-${t.id}`}>
                            <td>
                              <span className="font-monospace fw-semibold small text-dark">
                                {t.ticketNumber}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex flex-column">
                                <span className="small fw-semibold text-dark text-truncate" style={{ maxWidth: "240px" }}>
                                  {t.summary}
                                </span>
                                <div className="d-flex align-items-center gap-1 mt-1">
                                  <span className="badge rounded-pill bg-light text-secondary border small" style={{ fontSize: "0.68rem" }}>
                                    {t.category}
                                  </span>
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
                              <span
                                className="badge rounded-pill fw-semibold px-2 py-1"
                                style={{
                                  backgroundColor: priorityBadge.bg,
                                  color: priorityBadge.text,
                                  fontSize: "0.75rem",
                                }}
                              >
                                {priorityBadge.label}
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
                              {t.owner?.fullName ? (
                                <span className="text-dark fw-medium">{t.owner.fullName}</span>
                              ) : (
                                <span className="badge bg-light text-muted border">Unassigned</span>
                              )}
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
                                data-testid={`view-detail-btn-${t.id}`}
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

        {/* Right Column (30%): Quick Actions & Workload Breakdown */}
        <div className="col-12 col-lg-4">
          {/* Quick Actions Card */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white py-3 px-3 border-bottom">
              <h2 className="h6 fw-bold mb-0 text-dark">Queue Shortcuts</h2>
            </div>
            <div className="card-body p-3">
              <button
                type="button"
                className="btn-zen-primary w-100 py-2 mb-2 d-flex align-items-center justify-content-center gap-2"
                onClick={() => onNavigateQueue()}
                data-testid="quick-queue-btn"
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
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                </svg>
                <span>Full Ticket Queue</span>
              </button>

              <button
                type="button"
                className="btn-zen-secondary w-100 py-2 mb-2 d-flex align-items-center justify-content-center gap-2"
                onClick={() => onNavigateQueue({ owner: "me" })}
                data-testid="quick-my-queue-btn"
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
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>My Assigned Queue</span>
              </button>

              <button
                type="button"
                className="btn-zen-secondary w-100 py-2 mb-2 d-flex align-items-center justify-content-center gap-2"
                onClick={() => onNavigateQueue({ owner: "unassigned" })}
                data-testid="quick-unassigned-btn"
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
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                </svg>
                <span>Unassigned Triage</span>
              </button>

              {isAdmin && onNavigateUserManagement && (
                <button
                  type="button"
                  className="btn btn-outline-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                  style={{ borderColor: "#A855F7", color: "#7E22CE" }}
                  onClick={onNavigateUserManagement}
                  data-testid="quick-user-mgmt-btn"
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
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span>User Management</span>
                </button>
              )}
            </div>
          </div>

          {/* Active Priority Breakdown Card */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white py-3 px-3 border-bottom d-flex justify-content-between align-items-center">
              <h2 className="h6 fw-bold mb-0 text-dark">Active Priority Workload</h2>
              <span className="small text-muted">(Excl. closed)</span>
            </div>
            <div className="card-body p-3">
              {/* URGENT */}
              <div className="mb-2">
                <div className="d-flex justify-content-between small mb-1">
                  <span className="fw-semibold text-danger">Urgent</span>
                  <span className="fw-bold">{metrics.byPriority.URGENT || 0}</span>
                </div>
                <div className="progress" style={{ height: "6px" }}>
                  <div
                    className="progress-bar bg-danger"
                    role="progressbar"
                    style={{
                      width: `${Math.min(100, ((metrics.byPriority.URGENT || 0) / Math.max(1, (metrics.byPriority.URGENT || 0) + (metrics.byPriority.HIGH || 0) + (metrics.byPriority.MEDIUM || 0) + (metrics.byPriority.LOW || 0))) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* HIGH */}
              <div className="mb-2">
                <div className="d-flex justify-content-between small mb-1">
                  <span className="fw-semibold text-warning">High</span>
                  <span className="fw-bold">{metrics.byPriority.HIGH || 0}</span>
                </div>
                <div className="progress" style={{ height: "6px" }}>
                  <div
                    className="progress-bar bg-warning"
                    role="progressbar"
                    style={{
                      width: `${Math.min(100, ((metrics.byPriority.HIGH || 0) / Math.max(1, (metrics.byPriority.URGENT || 0) + (metrics.byPriority.HIGH || 0) + (metrics.byPriority.MEDIUM || 0) + (metrics.byPriority.LOW || 0))) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* MEDIUM */}
              <div className="mb-2">
                <div className="d-flex justify-content-between small mb-1">
                  <span className="fw-semibold text-info">Medium</span>
                  <span className="fw-bold">{metrics.byPriority.MEDIUM || 0}</span>
                </div>
                <div className="progress" style={{ height: "6px" }}>
                  <div
                    className="progress-bar bg-info"
                    role="progressbar"
                    style={{
                      width: `${Math.min(100, ((metrics.byPriority.MEDIUM || 0) / Math.max(1, (metrics.byPriority.URGENT || 0) + (metrics.byPriority.HIGH || 0) + (metrics.byPriority.MEDIUM || 0) + (metrics.byPriority.LOW || 0))) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* LOW */}
              <div>
                <div className="d-flex justify-content-between small mb-1">
                  <span className="fw-semibold text-secondary">Low</span>
                  <span className="fw-bold">{metrics.byPriority.LOW || 0}</span>
                </div>
                <div className="progress" style={{ height: "6px" }}>
                  <div
                    className="progress-bar bg-secondary"
                    role="progressbar"
                    style={{
                      width: `${Math.min(100, ((metrics.byPriority.LOW || 0) / Math.max(1, (metrics.byPriority.URGENT || 0) + (metrics.byPriority.HIGH || 0) + (metrics.byPriority.MEDIUM || 0) + (metrics.byPriority.LOW || 0))) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Status Breakdown Chips Card */}
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3 px-3 border-bottom">
              <h2 className="h6 fw-bold mb-0 text-dark">Queue Status Breakdown</h2>
            </div>
            <div className="card-body p-3">
              <div className="d-flex flex-wrap gap-2">
                {Object.entries(metrics.byStatus).map(([statusKey, count]) => {
                  const cfg = STATUS_CONFIG[statusKey] || { bg: "#F3F4F6", text: "#374151", label: statusKey };
                  return (
                    <div
                      key={statusKey}
                      className="d-flex align-items-center justify-content-between p-2 rounded border"
                      style={{ flex: "1 1 calc(50% - 0.5rem)", minWidth: "120px", backgroundColor: "#FFFFFF" }}
                      data-testid={`status-chip-${statusKey}`}
                    >
                      <span className="small text-muted text-truncate me-1">{cfg.label}</span>
                      <span
                        className="badge rounded-pill fw-bold"
                        style={{ backgroundColor: cfg.bg, color: cfg.text, fontSize: "0.75rem" }}
                      >
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

