import React, { useState, useEffect } from "react";
import {
  fetchTicketNotes,
  createTicketNote,
  InternalNoteResponse,
} from "../api.js";

interface InternalNotesSectionProps {
  ticketId: number;
  onNotesCountChange?: (count: number) => void;
}

export function InternalNotesSection({
  ticketId,
  onNotesCountChange,
}: InternalNotesSectionProps) {
  const [notes, setNotes] = useState<InternalNoteResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [newNoteText, setNewNoteText] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchTicketNotes(ticketId, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setNotes(data);
          if (onNotesCountChange) onNotesCountChange(data.length);
          setLoading(false);
        }
      })
      .catch((err: any) => {
        if (err?.name === "AbortError" || controller.signal.aborted) return;
        setError(err.message || "Failed to load internal notes");
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [ticketId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newNoteText.trim();
    if (trimmed.length < 2 || trimmed.length > 2000) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await createTicketNote(ticketId, trimmed);
      const updatedList = [...notes, res.note];
      setNotes(updatedList);
      if (onNotesCountChange) onNotesCountChange(updatedList.length);
      setNewNoteText("");
    } catch (err: any) {
      setSubmitError(err.message || "Failed to add internal note");
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
      className="card shadow-sm mb-4 border-warning border-opacity-50"
      data-testid="internal-notes-section"
    >
      {/* Prominent Yellow/Amber Callout Banner per UI Spec Screen 4 */}
      <div
        className="card-header py-3 px-4 d-flex justify-content-between align-items-center"
        style={{ backgroundColor: "#FEF3C7", borderBottom: "1px solid #FCD34D" }}
      >
        <div className="d-flex align-items-center gap-2">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#B45309"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="fw-bold" style={{ color: "#B45309" }}>
            Internal Notes — Visible ONLY to IT Staff & Administrator
          </span>
        </div>
        <span
          className="badge rounded-pill px-2"
          style={{ backgroundColor: "#B45309", color: "#FFFFFF" }}
          data-testid="notes-count-badge"
        >
          {notes.length}
        </span>
      </div>

      <div className="card-body p-4">
        {loading ? (
          <div className="text-center py-4" data-testid="notes-loading">
            <div className="spinner-border spinner-border-sm text-warning me-2" role="status" />
            <span className="text-muted small">Loading internal notes...</span>
          </div>
        ) : error ? (
          <div className="alert alert-danger py-2 small" data-testid="notes-error">
            {error}
          </div>
        ) : notes.length === 0 ? (
          <div
            className="text-center py-4 text-muted border rounded bg-light bg-opacity-50 mb-4"
            data-testid="empty-notes"
          >
            <p className="mb-0 small fst-italic">No private internal notes on this ticket yet.</p>
          </div>
        ) : (
          <div className="notes-list d-flex flex-column gap-3 mb-4" data-testid="internal-notes-list">
            {notes.map((n) => (
              <div
                key={n.id}
                className="p-3 rounded border shadow-sm"
                style={{ backgroundColor: "#FFFBEB", borderColor: "#FDE68A" }}
                data-testid="note-item"
              >
                <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold text-dark small" data-testid="note-author">
                      {n.author.fullName}
                    </span>
                    {getRoleBadge(n.author.role)}
                  </div>
                  <span className="text-muted small" style={{ fontSize: "0.8rem" }}>
                    {formatDate(n.createdAt)}
                  </span>
                </div>
                <div
                  className="text-dark small"
                  style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}
                  data-testid="note-content"
                >
                  {n.content}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Internal Note Form */}
        <form onSubmit={handleSubmit} data-testid="add-note-form">
          {submitError && (
            <div className="alert alert-danger py-2 small mb-3" data-testid="note-submit-error">
              {submitError}
            </div>
          )}

          <div className="mb-2">
            <label htmlFor="internal-note-input" className="form-label fw-semibold small text-muted mb-1">
              Add Internal Note
            </label>
            <textarea
              id="internal-note-input"
              className="form-control form-control-sm"
              rows={3}
              placeholder="Type an internal note (restricted to IT staff and administrators)..."
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              disabled={isSubmitting}
              data-testid="note-input"
            />
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <span
              className={`small ${newNoteText.length > 2000 ? "text-danger fw-bold" : "text-muted"}`}
              style={{ fontSize: "0.78rem" }}
            >
              {newNoteText.length} / 2000 characters
            </span>
            <button
              type="submit"
              className="btn btn-warning btn-sm d-flex align-items-center gap-1 text-dark fw-semibold"
              style={{ backgroundColor: "#FBBF24", borderColor: "#F59E0B" }}
              disabled={
                isSubmitting ||
                newNoteText.trim().length < 2 ||
                newNoteText.length > 2000
              }
              data-testid="submit-note-btn"
            >
              {isSubmitting && (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
              )}
              <span>Add Internal Note</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
