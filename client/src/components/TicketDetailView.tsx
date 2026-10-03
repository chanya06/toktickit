import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext.js";
import { useRequester } from "../context/RequesterContext.js";
import {
  fetchTicketDetail,
  indicateResolution,
  claimTicket,
  assignTicket,
  updateTicketITPriority,
  updateTicketStatus,
  fetchStaffAssignees,
  TicketResponse,
  StaffAssignee,
} from "../api.js";
import { AttachmentSection } from "./AttachmentSection.js";
import { CommentsSection } from "./CommentsSection.js";
import { InternalNotesSection } from "./InternalNotesSection.js";

const PERMITTED_NEXT_STATUSES: Record<string, string[]> = {
  NEW: ["OPEN", "CANCELLED"],
  OPEN: ["IN_PROGRESS", "WAITING_FOR_REQUESTER", "RESOLVED", "CANCELLED"],
  IN_PROGRESS: ["WAITING_FOR_REQUESTER", "RESOLVED", "CANCELLED"],
  WAITING_FOR_REQUESTER: ["IN_PROGRESS", "RESOLVED", "CANCELLED"],
  RESOLVED: ["CLOSED", "REOPENED"],
  CLOSED: ["REOPENED"],
  REOPENED: ["IN_PROGRESS", "RESOLVED", "CANCELLED"],
  CANCELLED: ["OPEN"],
  PENDING: ["IN_PROGRESS", "RESOLVED", "CANCELLED"],
};

const STATUS_LABELS: Record<string, string> = {
  NEW: "New",
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  WAITING_FOR_REQUESTER: "Waiting for Requester",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
  REOPENED: "Reopened",
  CANCELLED: "Cancelled",
  PENDING: "Pending",
};

interface TicketDetailViewProps {
  ticketId: number;
  onBack: () => void;
}

export function TicketDetailView({ ticketId, onBack }: TicketDetailViewProps) {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const { selectedRequester } = useRequester();

  const isStaffOrAdmin = user?.role === "IT_STAFF" || user?.role === "ADMINISTRATOR";

  const effectiveRequesterId = user ? user.id : selectedRequester?.id;
  const effectiveRequesterName = user ? user.fullName : selectedRequester?.name;

  const [ticket, setTicket] = useState<TicketResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [retryToken, setRetryToken] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"comments" | "internalNotes" | "attachments" | "actions" | "log">("comments");
  const [commentsCount, setCommentsCount] = useState<number>(0);
  const [notesCount, setNotesCount] = useState<number>(0);

  // Requester resolution indication state
  const [showResolutionModal, setShowResolutionModal] = useState<boolean>(false);
  const [resolutionComment, setResolutionComment] = useState<string>("");
  const [isSubmittingResolution, setIsSubmittingResolution] = useState<boolean>(false);
  const [resolutionError, setResolutionError] = useState<string | null>(null);

  // IT Staff & Admin operational state (Issue 24)
  const [assignees, setAssignees] = useState<StaffAssignee[]>([]);
  const [isOperating, setIsOperating] = useState<boolean>(false);
  const [operationMessage, setOperationMessage] = useState<{ type: "success" | "danger"; text: string } | null>(null);
  const [selectedNextStatus, setSelectedNextStatus] = useState<string>("");

  useEffect(() => {
    if (!isStaffOrAdmin) return;
    const controller = new AbortController();
    fetchStaffAssignees(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setAssignees(data);
        }
      })
      .catch((err) => {
        if (err?.name === "AbortError" || controller.signal.aborted) return;
        console.error("Failed to load staff assignees:", err);
      });

    return () => {
      controller.abort();
    };
  }, [isStaffOrAdmin]);

  const canIndicateResolution =
    (!user || user.role === "REQUESTER") &&
    (ticket?.status === "OPEN" || ticket?.status === "IN_PROGRESS") &&
    !ticket?.isResolutionIndicated;

  const handleIndicateResolution = async () => {
    setIsSubmittingResolution(true);
    setResolutionError(null);
    try {
      const res = await indicateResolution(ticketId, resolutionComment.trim() || undefined);
      setTicket((prev) => (prev ? { ...prev, ...res.ticket } : res.ticket));
      setShowResolutionModal(false);
      setResolutionComment("");
    } catch (err: any) {
      setResolutionError(err.message || "Failed to submit resolution indication");
    } finally {
      setIsSubmittingResolution(false);
    }
  };

  const handleClaim = async () => {
    setIsOperating(true);
    setOperationMessage(null);
    try {
      const res = await claimTicket(ticketId);
      setTicket((prev) => (prev ? { ...prev, ...res.ticket } : res.ticket));
      setOperationMessage({ type: "success", text: "You have successfully claimed this ticket." });
    } catch (err: any) {
      setOperationMessage({ type: "danger", text: err.message || "Failed to claim ticket" });
    } finally {
      setIsOperating(false);
    }
  };

  const handleAssign = async (targetOwnerId: number | null) => {
    setIsOperating(true);
    setOperationMessage(null);
    try {
      const res = await assignTicket(ticketId, targetOwnerId);
      setTicket((prev) => (prev ? { ...prev, ...res.ticket } : res.ticket));
      setOperationMessage({
        type: "success",
        text: targetOwnerId ? "Ticket assigned successfully." : "Ticket unassigned successfully.",
      });
    } catch (err: any) {
      setOperationMessage({ type: "danger", text: err.message || "Failed to assign ticket" });
    } finally {
      setIsOperating(false);
    }
  };

  const handleITPriorityChange = async (newPriority: string) => {
    setIsOperating(true);
    setOperationMessage(null);
    try {
      const res = await updateTicketITPriority(ticketId, newPriority);
      setTicket((prev) => (prev ? { ...prev, ...res.ticket } : res.ticket));
      setOperationMessage({ type: "success", text: `IT Priority updated to ${newPriority}.` });
    } catch (err: any) {
      setOperationMessage({ type: "danger", text: err.message || "Failed to update IT Priority" });
    } finally {
      setIsOperating(false);
    }
  };

  const handleExecuteStatusTransition = async () => {
    if (!selectedNextStatus) return;
    setIsOperating(true);
    setOperationMessage(null);
    try {
      const res = await updateTicketStatus(ticketId, selectedNextStatus);
      setTicket((prev) => (prev ? { ...prev, ...res.ticket } : res.ticket));
      setSelectedNextStatus("");
      setOperationMessage({
        type: "success",
        text: `Ticket status successfully changed to ${STATUS_LABELS[res.ticket.status] || res.ticket.status}.`,
      });
    } catch (err: any) {
      setOperationMessage({ type: "danger", text: err.message || "Failed to update ticket status" });
    } finally {
      setIsOperating(false);
    }
  };

  useEffect(() => {
    if (!effectiveRequesterId) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setStatusCode(null);
    setTicket(null);

    fetchTicketDetail(ticketId, effectiveRequesterId, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setTicket(data);
          setLoading(false);
        }
      })
      .catch((err: any) => {
        if (err?.name === "AbortError" || controller.signal.aborted) {
          return;
        }
        if (!controller.signal.aborted) {
          setError(err.message || "Failed to fetch ticket detail");
          setStatusCode(err.status || 500);
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [ticketId, effectiveRequesterId, retryToken]);

  function getStatusBadgeStyle(status: string): React.CSSProperties {
    switch (status?.toUpperCase()) {
      case "NEW":
        return { backgroundColor: "#DBEAFE", color: "#1E40AF" };
      case "OPEN":
        return { backgroundColor: "#DCFCE7", color: "#15803D" };
      case "IN_PROGRESS":
        return { backgroundColor: "#FEF3C7", color: "#B45309" };
      case "WAITING_FOR_REQUESTER":
        return { backgroundColor: "#F3E8FF", color: "#6B21A8" };
      case "RESOLVED":
        return { backgroundColor: "#D1FAE5", color: "#065F46" };
      case "CLOSED":
        return { backgroundColor: "#E2E8F0", color: "#334155" };
      case "REOPENED":
        return { backgroundColor: "#FFEDD5", color: "#C2410C" };
      case "CANCELLED":
        return { backgroundColor: "#FEE2E2", color: "#B91C1C" };
      case "PENDING":
        return { backgroundColor: "#E2E8F0", color: "#475569" };
      default:
        return {};
    }
  }

  function getStatusBadgeClass(ticketStatus: string) {
    switch (ticketStatus?.toUpperCase()) {
      case "NEW":
        return "badge bg-primary text-white";
      case "OPEN":
        return "badge bg-success text-white";
      case "IN_PROGRESS":
        return "badge bg-warning text-dark";
      case "WAITING_FOR_REQUESTER":
        return "badge bg-info text-dark";
      case "PENDING":
        return "badge bg-secondary text-white";
      case "RESOLVED":
        return "badge bg-success text-white";
      case "CLOSED":
        return "badge bg-dark text-white";
      case "REOPENED":
        return "badge bg-warning text-dark";
      case "CANCELLED":
        return "badge bg-danger text-white";
      default:
        return "badge bg-secondary text-white";
    }
  }

  function getPriorityBadgeClass(priority: string) {
    switch (priority?.toUpperCase()) {
      case "LOW":
        return "badge bg-light text-dark border";
      case "MEDIUM":
        return "badge bg-warning text-dark";
      case "HIGH":
        return "badge bg-danger text-white";
      case "URGENT":
        return "badge bg-danger text-white";
      default:
        return "badge bg-secondary text-white";
    }
  }

  function formatDate(dateStr: string) {
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

  if (!effectiveRequesterId) {
    return (
      <div className="alert alert-info shadow-sm" data-testid="no-requester-alert">
        <h5 className="alert-heading fw-bold mb-2">Requester Context Required</h5>
        <p className="mb-0">
          Please select a Development Requester identity from the top header selector to view ticket details.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card shadow-sm text-center py-5" data-testid="ticket-detail-loading">
        <div className="card-body">
          <div className="spinner-border text-success mb-3" role="status">
            <span className="visually-hidden">Loading ticket details...</span>
          </div>
          <p className="text-muted mb-0">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (statusCode === 403) {
    return (
      <div className="card shadow-sm border-danger mb-4" data-testid="forbidden-error-card">
        <div className="card-body py-5 text-center">
          <div className="d-inline-flex align-items-center justify-content-center p-3 rounded-circle bg-danger bg-opacity-10 text-danger mb-3">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h3 className="h4 fw-bold text-danger mb-2">403 Forbidden — Access Denied</h3>
          <p className="text-muted mb-4" style={{ maxWidth: "500px", margin: "0 auto" }}>
            You do not have permission to view this ticket. This ticket belongs strictly to another Requester context.
          </p>
          <button
            type="button"
            className="btn-zen-primary"
            onClick={onBack}
            data-testid="forbidden-back-btn"
          >
            &laquo; {isStaffOrAdmin ? "Back to Ticket Queue" : "Back to My Tickets"}
          </button>
        </div>
      </div>
    );
  }

  if (statusCode === 404) {
    return (
      <div className="card shadow-sm mb-4" data-testid="notfound-error-card">
        <div className="card-body py-5 text-center">
          <div className="d-inline-flex align-items-center justify-content-center p-3 rounded-circle bg-light text-muted mb-3">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <h3 className="h4 fw-bold text-dark mb-2">404 Not Found — Ticket Not Found</h3>
          <p className="text-muted mb-4">
            The requested ticket does not exist or has been removed.
          </p>
          <button
            type="button"
            className="btn-zen-secondary"
            onClick={onBack}
            data-testid="notfound-back-btn"
          >
            &laquo; {isStaffOrAdmin ? "Back to Ticket Queue" : "Back to My Tickets"}
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger shadow-sm d-flex justify-content-between align-items-center mb-4" data-testid="ticket-detail-error">
        <div>
          <strong>Error:</strong> {error}
        </div>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={() => setRetryToken((t) => t + 1)}
            data-testid="retry-detail-btn"
          >
            Retry
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={onBack}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="ticket-detail-container mb-4" data-testid="ticket-detail-view">
      {/* Top Header & Breadcrumb Navigation (Matching Figure 1 of Lab 2 Handout) */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0 small">
              <li className="breadcrumb-item text-muted">
                {isStaffOrAdmin ? "Ticket Queue" : "My Tickets"}
              </li>
              <li className="breadcrumb-item active fw-semibold text-dark" aria-current="page">
                Ticket Details
              </li>
            </ol>
          </nav>
          <div className="d-flex align-items-center gap-2">
            <h2 className="h4 fw-bold text-dark mb-0">{ticket.ticketNumber}</h2>
            {ticket.isResolutionIndicated && (
              <span className="badge bg-info text-dark" data-testid="resolution-indicated-badge">
                Resolution Indicated
              </span>
            )}
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          {canIndicateResolution && (
            <button
              type="button"
              className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
              onClick={() => setShowResolutionModal(true)}
              data-testid="indicate-resolution-btn"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Problem Appears Resolved</span>
            </button>
          )}
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
            onClick={onBack}
            data-testid="back-to-tickets-btn"
          >
            <span>&larr;</span> {isStaffOrAdmin ? "Back to Ticket Queue" : "Back to My Tickets"}
          </button>
        </div>
      </div>

      {ticket.isResolutionIndicated && (
        <div className="alert alert-info d-flex align-items-center gap-2 mb-3" data-testid="resolution-indicated-banner">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-info flex-shrink-0">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <div>
            <strong>Problem Appears Resolved:</strong> The requester indicated that the problem appears resolved. Awaiting IT Staff confirmation and formal closure.
          </div>
        </div>
      )}

      {/* Main Ticket Details Card (Matching Figure 1 Layout) */}
      <div className="card shadow-sm mb-4">
        <div className="card-body p-4">
          {/* Row 1: Ticket No | Ticket Date | Category | Related System */}
          <div className="row g-3 mb-3">
            <div className="col-12 col-sm-6 col-md-3">
              <label className="form-label fw-semibold text-muted small mb-1">Ticket No.</label>
              <div className="form-control form-control-sm bg-light text-dark fw-bold">
                {ticket.ticketNumber}
              </div>
            </div>
            <div className="col-12 col-sm-6 col-md-3">
              <label className="form-label fw-semibold text-muted small mb-1">Ticket Date</label>
              <div className="form-control form-control-sm bg-light text-dark">
                {formatDate(ticket.createdAt)}
              </div>
            </div>
            <div className="col-12 col-sm-6 col-md-3">
              <label className="form-label fw-semibold text-muted small mb-1">Category</label>
              <div className="form-control form-control-sm bg-light text-dark">
                {ticket.category?.name || "N/A"}
              </div>
            </div>
            <div className="col-12 col-sm-6 col-md-3">
              <label className="form-label fw-semibold text-muted small mb-1">Related System</label>
              <div className="form-control form-control-sm bg-light text-dark">
                {ticket.relatedSystem?.name || "N/A"}
              </div>
            </div>
          </div>

          {/* Row 2: Requester | Requested Priority | IT Priority | Current Status */}
          <div className="row g-3 mb-3">
            <div className="col-12 col-sm-6 col-md-3">
              <label className="form-label fw-semibold text-muted small mb-1">Requester</label>
              <div className="form-control form-control-sm bg-light text-dark" data-testid="detail-requester-name">
                {ticket.requester?.fullName || ticket.requester?.name || effectiveRequesterName}
              </div>
            </div>
            <div className="col-12 col-sm-6 col-md-3">
              <label className="form-label fw-semibold text-muted small mb-1">Requested Priority</label>
              <div>
                <span className={getPriorityBadgeClass(ticket.requestedPriority)} data-testid="detail-priority-badge">
                  Priority: {ticket.requestedPriority}
                </span>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-md-3">
              <label className="form-label fw-semibold text-muted small mb-1">IT Priority</label>
              <div>
                <span className={getPriorityBadgeClass(ticket.itPriority || ticket.requestedPriority)} data-testid="detail-it-priority-badge">
                  Priority: {ticket.itPriority || ticket.requestedPriority}
                </span>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-md-3">
              <label className="form-label fw-semibold text-muted small mb-1">Current Status</label>
              <div>
                <span
                  className={getStatusBadgeClass(ticket.status)}
                  style={getStatusBadgeStyle(ticket.status)}
                  data-testid="detail-status-badge"
                >
                  Status: {ticket.status}
                </span>
              </div>
            </div>
          </div>

          {/* Row 3: Ticket Owner | Summary */}
          <div className="row g-3 mb-3">
            <div className="col-12 col-md-3">
              <label className="form-label fw-semibold text-muted small mb-1">Ticket Owner</label>
              <div className="form-control form-control-sm bg-light text-muted" data-testid="detail-ticket-owner">
                {ticket.ticketOwner || ticket.owner?.fullName || "Unassigned"}
              </div>
            </div>
            <div className="col-12 col-md-9">
              <label className="form-label fw-semibold text-muted small mb-1">Summary</label>
              <div
                className="form-control form-control-sm bg-light text-dark fw-medium"
                data-testid="detail-summary"
              >
                {ticket.summary}
              </div>
            </div>
          </div>

          {/* Row 4: Description */}
          <div className="mb-3">
            <label className="form-label fw-semibold text-muted small mb-1">Description</label>
            <div
              className="form-control form-control-sm bg-light text-dark"
              style={{ whiteSpace: "pre-wrap", minHeight: "80px" }}
              data-testid="detail-description"
            >
              {ticket.description}
            </div>
          </div>

          {/* Row 5: Resolution Summary */}
          <div className="mb-0">
            <label className="form-label fw-semibold text-muted small mb-1">Resolution Summary</label>
            <div className="form-control form-control-sm bg-light text-muted fst-italic">
              No resolution summary available yet.
            </div>
          </div>
        </div>
      </div>

      {/* IT Staff & Administrator Operations Panel (Issue 24) */}
      {isStaffOrAdmin && (
        <div className="card shadow-sm mb-4 border-success border-opacity-25" data-testid="staff-operations-panel">
          <div className="card-header bg-success bg-opacity-10 py-2 px-3 d-flex justify-content-between align-items-center">
            <span className="fw-bold text-success small d-flex align-items-center gap-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              IT Staff Ticket Operations
            </span>
            <span className="badge bg-success text-white small">Staff Control</span>
          </div>
          <div className="card-body p-3">
            {operationMessage && (
              <div
                className={`alert alert-${operationMessage.type} alert-dismissible py-2 px-3 mb-3 small d-flex justify-content-between align-items-center`}
                role="alert"
                data-testid="operation-feedback"
              >
                <span>{operationMessage.text}</span>
                <button
                  type="button"
                  className="btn-close py-2"
                  aria-label="Close"
                  onClick={() => setOperationMessage(null)}
                />
              </div>
            )}

            <div className="row g-3 align-items-end">
              {/* Claim Action */}
              <div className="col-12 col-md-3">
                <label className="form-label fw-semibold text-muted small mb-1">Quick Claim</label>
                <div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-success w-100 d-flex align-items-center justify-content-center gap-1"
                    disabled={isOperating || ticket.ownerId === user?.id}
                    onClick={handleClaim}
                    data-testid="claim-ticket-btn"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span>{ticket.ownerId === user?.id ? "Claimed by You" : "Claim Ticket"}</span>
                  </button>
                </div>
              </div>

              {/* Owner Assignment Selector */}
              <div className="col-12 col-md-3">
                <label htmlFor="staff-owner-select" className="form-label fw-semibold text-muted small mb-1">
                  Assign Owner
                </label>
                <select
                  id="staff-owner-select"
                  className="form-select form-select-sm"
                  disabled={isOperating}
                  value={ticket.ownerId ? String(ticket.ownerId) : ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    handleAssign(val ? Number(val) : null);
                  }}
                  data-testid="owner-selector"
                >
                  <option value="">Unassigned</option>
                  {assignees.map((assignee) => (
                    <option key={assignee.id} value={assignee.id}>
                      {assignee.fullName} ({assignee.role === "ADMINISTRATOR" ? "Admin" : "Staff"})
                    </option>
                  ))}
                </select>
              </div>

              {/* IT Priority Selector */}
              <div className="col-12 col-md-3">
                <label htmlFor="staff-it-priority-select" className="form-label fw-semibold text-muted small mb-1">
                  IT Priority
                </label>
                <select
                  id="staff-it-priority-select"
                  className="form-select form-select-sm"
                  disabled={isOperating}
                  value={ticket.itPriority || ticket.requestedPriority}
                  onChange={(e) => handleITPriorityChange(e.target.value)}
                  data-testid="it-priority-selector"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="URGENT">URGENT</option>
                </select>
              </div>

              {/* Status Transition Control */}
              <div className="col-12 col-md-3">
                <label htmlFor="staff-status-select" className="form-label fw-semibold text-muted small mb-1">
                  Change Status
                </label>
                <div className="input-group input-group-sm">
                  <select
                    id="staff-status-select"
                    className="form-select form-select-sm"
                    disabled={isOperating || (PERMITTED_NEXT_STATUSES[ticket.status] || []).length === 0}
                    value={selectedNextStatus}
                    onChange={(e) => setSelectedNextStatus(e.target.value)}
                    data-testid="status-transition-selector"
                  >
                    <option value="">Select Next Status...</option>
                    {(PERMITTED_NEXT_STATUSES[ticket.status] || []).map((st) => (
                      <option key={st} value={st}>
                        {STATUS_LABELS[st] || st}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-zen-primary btn-sm"
                    disabled={isOperating || !selectedNextStatus}
                    onClick={handleExecuteStatusTransition}
                    data-testid="apply-status-btn"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feature Tabs Navigation Bar (Matching Figure 1 of Handout) */}
      <ul className="nav nav-tabs mb-3 border-bottom">
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link small d-flex align-items-center gap-1 ${activeTab === "comments" ? "active text-success fw-bold border-top border-3 border-success" : "text-muted"}`}
            onClick={() => setActiveTab("comments")}
            data-testid="tab-comments"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>Public Comments</span>
            <span className="badge bg-secondary rounded-pill ms-1" data-testid="tab-comments-count">
              {commentsCount}
            </span>
          </button>
        </li>
        {isStaffOrAdmin && (
          <li className="nav-item">
            <button
              type="button"
              className={`nav-link small d-flex align-items-center gap-1 ${activeTab === "internalNotes" ? "active text-warning fw-bold border-top border-3 border-warning" : "text-muted"}`}
              onClick={() => setActiveTab("internalNotes")}
              data-testid="tab-internal-notes"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Internal Notes</span>
              <span className="badge bg-warning text-dark rounded-pill ms-1" data-testid="tab-notes-count">
                {notesCount}
              </span>
            </button>
          </li>
        )}
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link small d-flex align-items-center gap-1 ${activeTab === "attachments" ? "active text-success fw-bold border-top border-3 border-success" : "text-muted"}`}
            onClick={() => setActiveTab("attachments")}
            data-testid="tab-attachments"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
            <span>Attachments</span>
          </button>
        </li>
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link small d-flex align-items-center gap-1 ${activeTab === "actions" ? "active text-success fw-bold" : "text-muted disabled"}`}
            onClick={() => setActiveTab("actions")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
            <span>Service Actions</span>
            <span className="badge bg-secondary rounded-pill ms-1">1</span>
          </button>
        </li>
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link small d-flex align-items-center gap-1 ${activeTab === "log" ? "active text-success fw-bold" : "text-muted disabled"}`}
            onClick={() => setActiveTab("log")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>Event Log</span>
            <span className="badge bg-secondary rounded-pill ms-1">6</span>
          </button>
        </li>
      </ul>

      {/* Tab Content: Public Comments (Issue 25) */}
      <div
        style={{ display: activeTab === "comments" ? "block" : "none" }}
        data-testid="tab-pane-comments"
      >
        <CommentsSection
          ticketId={ticketId}
          onCommentsCountChange={setCommentsCount}
          onCommentAdded={(updatedTicket) => {
            if (updatedTicket) {
              setTicket((prev) => (prev ? { ...prev, ...updatedTicket } : updatedTicket));
            }
          }}
        />
      </div>

      {/* Tab Content: Internal Notes (Issue 25 - Restricted to Staff/Admin) */}
      {isStaffOrAdmin && (
        <div
          style={{ display: activeTab === "internalNotes" ? "block" : "none" }}
          data-testid="tab-pane-internal-notes"
        >
          <InternalNotesSection
            ticketId={ticketId}
            onNotesCountChange={setNotesCount}
          />
        </div>
      )}

      {/* Tab Content: Active Attachment Lifecycle Section (Issue 13) */}
      <div
        style={{ display: activeTab === "attachments" ? "block" : "none" }}
        data-testid="tab-pane-attachments"
      >
        <AttachmentSection ticketId={ticketId} />
      </div>

      {/* Bottom Navigation Control */}
      <div className="d-flex justify-content-end mb-4">
        <button
          type="button"
          className="btn-zen-secondary"
          onClick={onBack}
          data-testid="bottom-back-btn"
        >
          &laquo; {isStaffOrAdmin ? "Back to Ticket Queue" : "Back to My Tickets List"}
        </button>
      </div>
      {/* Requester Resolution Indication Modal */}
      {showResolutionModal && (
        <div className="modal show d-block" tabIndex={-1} role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} data-testid="resolution-modal">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Problem Appears Resolved</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => setShowResolutionModal(false)}
                  disabled={isSubmittingResolution}
                />
              </div>
              <div className="modal-body">
                <p className="text-muted small mb-3">
                  Let the IT support team know that your issue has been resolved. This will notify staff to review and formally close the ticket.
                </p>
                {resolutionError && (
                  <div className="alert alert-danger py-2 small mb-3" role="alert">
                    {resolutionError}
                  </div>
                )}
                <div className="mb-3">
                  <label htmlFor="resolutionComment" className="form-label fw-semibold small">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    id="resolutionComment"
                    className="form-control form-control-sm"
                    rows={3}
                    placeholder="Describe how the problem was resolved or add any comments for IT staff..."
                    value={resolutionComment}
                    onChange={(e) => setResolutionComment(e.target.value)}
                    disabled={isSubmittingResolution}
                    data-testid="resolution-comment-input"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setShowResolutionModal(false)}
                  disabled={isSubmittingResolution}
                  data-testid="cancel-resolution-btn"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-success d-flex align-items-center gap-1"
                  onClick={handleIndicateResolution}
                  disabled={isSubmittingResolution}
                  data-testid="confirm-resolution-btn"
                >
                  {isSubmittingResolution && (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                  )}
                  Confirm Resolved
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
