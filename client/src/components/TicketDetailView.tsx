import React, { useState, useEffect } from "react";
import { useRequester } from "../context/RequesterContext.js";
import { fetchTicketDetail, TicketResponse } from "../api.js";

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

  useEffect(() => {
    if (!selectedRequester) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setStatusCode(null);

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
        return "badge bg-info text-dark";
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
        return "badge bg-info text-dark";
      case "HIGH":
        return "badge bg-warning text-dark";
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

  // 403 Forbidden State (Cross-requester unauthorized access)
  if (statusCode === 403) {
    return (
      <div className="card shadow-sm border-danger mb-4" data-testid="forbidden-error-card">
        <div className="card-body py-5 text-center">
          <div className="fs-1 text-danger mb-2">🔒</div>
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

  // 404 Not Found State
  if (statusCode === 404) {
    return (
      <div className="card shadow-sm mb-4" data-testid="notfound-error-card">
        <div className="card-body py-5 text-center">
          <div className="fs-1 text-muted mb-2">❓</div>
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

  // General Network Error State
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
            🔄 Retry
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
    <div className="ticket-detail-container" data-testid="ticket-detail-view">
      {/* Breadcrumb Navigation */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb mb-0 small">
          <li className="breadcrumb-item">
            <button
              type="button"
              className="btn btn-link p-0 text-success text-decoration-none fw-medium"
              onClick={onBack}
              data-testid="back-to-tickets-btn"
            >
              📋 My Tickets
            </button>
          </li>
          <li className="breadcrumb-item active text-muted" aria-current="page">
            Ticket Details ({ticket.ticketNumber})
          </li>
        </ol>
      </nav>

      {/* Header Banner */}
      <div className="card shadow-sm mb-4 border-top border-4 border-success">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
            <div>
              <span className="text-muted small d-block mb-1">
                Ticket Date: <strong>{formatDate(ticket.createdAt)}</strong>
              </span>
              <h2 className="h3 fw-bold text-dark mb-0">{ticket.ticketNumber}</h2>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className={getPriorityBadgeClass(ticket.requestedPriority)} data-testid="detail-priority-badge">
                Priority: {ticket.requestedPriority}
              </span>
              <span className={getStatusBadgeClass(ticket.status)} data-testid="detail-status-badge">
                Status: {ticket.status}
              </span>
            </div>
          </div>

          <hr className="my-3" />

          {/* Ticket Metadata Grid */}
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <span className="text-muted small d-block">Development Requester</span>
              <strong className="text-dark">
                {ticket.requester?.name || selectedRequester.name}
              </strong>
              {ticket.requester?.email && (
                <span className="d-block small text-muted">{ticket.requester.email}</span>
              )}
            </div>

            <div className="col-6 col-md-4">
              <span className="text-muted small d-block">Category</span>
              <span className="badge bg-light text-dark border">
                {ticket.category?.name || "N/A"}
              </span>
            </div>

            <div className="col-6 col-md-4">
              <span className="text-muted small d-block">Related System</span>
              <span className="badge bg-light text-dark border">
                {ticket.relatedSystem?.name || "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Details */}
      <div className="card shadow-sm mb-4">
        <div className="card-body p-4">
          <h4 className="h5 fw-bold text-dark mb-3">Ticket Summary</h4>
          <div className="p-3 bg-light rounded border mb-4 text-dark fw-medium" data-testid="detail-summary">
            {ticket.summary}
          </div>

          <h4 className="h5 fw-bold text-dark mb-3">Description</h4>
          <div
            className="p-3 bg-light rounded border text-dark"
            style={{ whiteSpace: "pre-wrap", minHeight: "120px" }}
            data-testid="detail-description"
          >
            {ticket.description}
          </div>
        </div>
      </div>

      {/* Attachment Lifecycle Notice (Issue 13 placeholder) */}
      <div className="card shadow-sm mb-4">
        <div className="card-body p-4">
          <h4 className="h5 fw-bold text-dark mb-2">📎 File Attachments</h4>
          <div className="notice-box">
            Attachment upload, metadata inspection, download, and soft removal lifecycle will be activated in{" "}
            <strong>Issue 13 (Attachment Lifecycle)</strong>.
          </div>
        </div>
      </div>

      {/* Bottom Back Button */}
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
