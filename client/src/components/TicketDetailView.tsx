import React, { useState, useEffect } from "react";
import { useRequester } from "../context/RequesterContext.js";
import { fetchTicketDetail, TicketResponse } from "../api.js";
import { AttachmentSection } from "./AttachmentSection.js";

interface TicketDetailViewProps {
  ticketId: number;
  onBack: () => void;
}

export function TicketDetailView({ ticketId, onBack }: TicketDetailViewProps) {
  const { selectedRequester } = useRequester();

  const [ticket, setTicket] = useState<TicketResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [retryToken, setRetryToken] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"attachments" | "comments" | "actions" | "log">("attachments");

  useEffect(() => {
    if (!selectedRequester) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setStatusCode(null);
    setTicket(null);

    fetchTicketDetail(ticketId, selectedRequester.id, controller.signal)
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
  }, [ticketId, selectedRequester?.id, retryToken]);

  function getStatusBadgeClass(ticketStatus: string) {
    switch (ticketStatus?.toUpperCase()) {
      case "NEW":
        return "badge bg-primary text-white";
      case "OPEN":
        return "badge bg-warning text-dark";
      case "IN_PROGRESS":
        return "badge bg-success text-white";
      case "PENDING":
        return "badge bg-secondary text-white";
      case "RESOLVED":
        return "badge bg-success text-white";
      case "CLOSED":
        return "badge bg-dark text-white";
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

  if (!selectedRequester) {
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
            &laquo; Back to My Tickets
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
            &laquo; Back to My Tickets
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
              <li className="breadcrumb-item text-muted">My Tickets</li>
              <li className="breadcrumb-item active fw-semibold text-dark" aria-current="page">
                Ticket Details
              </li>
            </ol>
          </nav>
          <h2 className="h4 fw-bold text-dark mb-0">{ticket.ticketNumber}</h2>
        </div>

        <button
          type="button"
          className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
          onClick={onBack}
          data-testid="back-to-tickets-btn"
        >
          <span>&larr;</span> Back to My Tickets
        </button>
      </div>

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
              <div className="form-control form-control-sm bg-light text-dark">
                {ticket.requester?.name || selectedRequester.name}
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
                <span className={getPriorityBadgeClass(ticket.itPriority || ticket.requestedPriority)}>
                  Priority: {ticket.itPriority || ticket.requestedPriority}
                </span>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-md-3">
              <label className="form-label fw-semibold text-muted small mb-1">Current Status</label>
              <div>
                <span className={getStatusBadgeClass(ticket.status)} data-testid="detail-status-badge">
                  Status: {ticket.status}
                </span>
              </div>
            </div>
          </div>

          {/* Row 3: Ticket Owner | Summary */}
          <div className="row g-3 mb-3">
            <div className="col-12 col-md-3">
              <label className="form-label fw-semibold text-muted small mb-1">Ticket Owner</label>
              <div className="form-control form-control-sm bg-light text-muted">
                {ticket.ticketOwner || "Unassigned"}
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

      {/* Feature Tabs Navigation Bar (Matching Figure 1 of Handout) */}
      <ul className="nav nav-tabs mb-3 border-bottom">
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link small d-flex align-items-center gap-1 ${activeTab === "comments" ? "active text-success fw-bold" : "text-muted disabled"}`}
            onClick={() => setActiveTab("comments")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>Public Comments</span>
            <span className="badge bg-secondary rounded-pill ms-1">3</span>
          </button>
        </li>
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link small d-flex align-items-center gap-1 ${activeTab === "attachments" ? "active text-success fw-bold border-top border-3 border-success" : "text-muted"}`}
            onClick={() => setActiveTab("attachments")}
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

      {/* Tab Content: Active Attachment Lifecycle Section (Issue 13) */}
      {activeTab === "attachments" && (
        <AttachmentSection ticketId={ticketId} />
      )}

      {/* Bottom Navigation Control */}
      <div className="d-flex justify-content-end mb-4">
        <button
          type="button"
          className="btn-zen-secondary"
          onClick={onBack}
          data-testid="bottom-back-btn"
        >
          &laquo; Back to My Tickets List
        </button>
      </div>
    </div>
  );
}
