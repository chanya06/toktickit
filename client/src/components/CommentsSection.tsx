import React, { useState, useEffect } from "react";
import {
  fetchTicketComments,
  createTicketComment,
  PublicCommentResponse,
} from "../api.js";

interface CommentsSectionProps {
  ticketId: number;
  onCommentAdded?: (updatedTicket?: any) => void;
  onCommentsCountChange?: (count: number) => void;
}

export function CommentsSection({
  ticketId,
  onCommentAdded,
  onCommentsCountChange,
}: CommentsSectionProps) {
  const [comments, setComments] = useState<PublicCommentResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [newCommentText, setNewCommentText] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchTicketComments(ticketId, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setComments(data);
          if (onCommentsCountChange) onCommentsCountChange(data.length);
          setLoading(false);
        }
      })
      .catch((err: any) => {
        if (err?.name === "AbortError" || controller.signal.aborted) return;
        setError(err.message || "Failed to load public comments");
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [ticketId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCommentText.trim();
    if (trimmed.length < 2 || trimmed.length > 2000) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await createTicketComment(ticketId, trimmed);
      const updatedList = [...comments, res.comment];
      setComments(updatedList);
      if (onCommentsCountChange) onCommentsCountChange(updatedList.length);
      setNewCommentText("");
      if (onCommentAdded) {
        onCommentAdded(res.ticket);
      }
    } catch (err: any) {
      setSubmitError(err.message || "Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

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

  function getRoleBadge(role: string) {
    switch (role) {
      case "REQUESTER":
        return (
          <span
            className="badge fw-medium px-2 py-1"
            style={{ backgroundColor: "#E0F2FE", color: "#0369A1" }}
          >
            Requester
          </span>
        );
      case "IT_STAFF":
        return (
          <span
            className="badge fw-medium px-2 py-1"
            style={{ backgroundColor: "#EAF6EF", color: "#006B3C" }}
          >
            IT Staff
          </span>
        );
      case "ADMINISTRATOR":
        return (
          <span
            className="badge fw-medium px-2 py-1"
            style={{ backgroundColor: "#F3E8FF", color: "#7E22CE" }}
          >
            Admin
          </span>
        );
      default:
        return <span className="badge bg-secondary">{role}</span>;
    }
  }

  return (
    <div
      className="card shadow-sm mb-4 border-success border-opacity-25"
      data-testid="public-comments-section"
    >
      <div className="card-header bg-success bg-opacity-10 py-3 px-4 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#006B3C"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="fw-bold text-success">
            Public Comments — Visible to Requester
          </span>
        </div>
        <span
          className="badge bg-success rounded-pill px-2"
          data-testid="comments-count-badge"
        >
          {comments.length}
        </span>
      </div>

      <div className="card-body p-4">
        {loading ? (
          <div className="text-center py-4" data-testid="comments-loading">
            <div className="spinner-border spinner-border-sm text-success me-2" role="status" />
            <span className="text-muted small">Loading public comments...</span>
          </div>
        ) : error ? (
          <div className="alert alert-danger py-2 small" data-testid="comments-error">
            {error}
          </div>
        ) : comments.length === 0 ? (
          <div
            className="text-center py-4 text-muted border rounded bg-light bg-opacity-50 mb-4"
            data-testid="empty-comments"
          >
            <p className="mb-0 small fst-italic">No public comments on this ticket yet.</p>
          </div>
        ) : (
          <div className="comments-list d-flex flex-column gap-3 mb-4" data-testid="comments-list">
            {comments.map((c) => (
              <div
                key={c.id}
                className="p-3 rounded border bg-white shadow-sm"
                data-testid="comment-item"
              >
                <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold text-dark small" data-testid="comment-author">
                      {c.author.fullName}
                    </span>
                    {getRoleBadge(c.author.role)}
                  </div>
                  <span className="text-muted small" style={{ fontSize: "0.8rem" }}>
                    {formatDate(c.createdAt)}
                  </span>
                </div>
                <div
                  className="text-dark small"
                  style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}
                  data-testid="comment-content"
                >
                  {c.content}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Public Comment Form */}
        <form onSubmit={handleSubmit} data-testid="add-comment-form">
          {submitError && (
            <div className="alert alert-danger py-2 small mb-3" data-testid="comment-submit-error">
              {submitError}
            </div>
          )}

          <div className="mb-2">
            <label htmlFor="public-comment-input" className="form-label fw-semibold small text-muted mb-1">
              Add Public Comment
            </label>
            <textarea
              id="public-comment-input"
              className="form-control form-control-sm"
              rows={3}
              placeholder="Type a public comment (visible to requester and staff)..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              disabled={isSubmitting}
              data-testid="comment-input"
            />
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <span
              className={`small ${newCommentText.length > 2000 ? "text-danger fw-bold" : "text-muted"}`}
              style={{ fontSize: "0.78rem" }}
            >
              {newCommentText.length} / 2000 characters
            </span>
            <button
              type="submit"
              className="btn-zen-primary btn-sm d-flex align-items-center gap-1"
              disabled={
                isSubmitting ||
                newCommentText.trim().length < 2 ||
                newCommentText.length > 2000
              }
              data-testid="submit-comment-btn"
            >
              {isSubmitting && (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
              )}
              <span>Post Comment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
