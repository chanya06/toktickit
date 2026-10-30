import React, { useState, useEffect, useCallback } from "react";
import {
  ActionTaken,
  ActionTakenStatus,
  CreateActionTakenPayload,
  UpdateActionTakenPayload,
  StaffAssignee,
  fetchTicketActions,
  createTicketAction,
  updateTicketAction,
  transitionActionStatus,
} from "../api.js";

export function formatActionDateTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  } catch {
    return dateStr;
  }
}

export function getActionStatusStyle(status: ActionTakenStatus) {
  switch (status) {
    case "PENDING":
      return {
        bg: "#E2E8F0",
        color: "#475569",
        border: "#CBD5E1",
        label: "Pending",
      };
    case "IN_PROGRESS":
      return {
        bg: "#FEF3C7",
        color: "#B45309",
        border: "#FDE68A",
        label: "In Progress",
      };
    case "COMPLETED":
      return {
        bg: "#D1FAE5",
        color: "#065F46",
        border: "#A7F3D0",
        label: "Completed",
      };
    case "CANCELLED":
      return {
        bg: "#FEE2E2",
        color: "#991B1B",
        border: "#FECACA",
        label: "Cancelled",
      };
    default:
      return {
        bg: "#E2E8F0",
        color: "#475569",
        border: "#CBD5E1",
        label: status,
      };
  }
}

const PERMITTED_ACTION_TRANSITIONS: Record<ActionTakenStatus, ActionTakenStatus[]> = {
  PENDING: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export interface ActionsTakenSectionProps {
  ticketId: number;
  isStaffOrAdmin: boolean;
  assignees?: StaffAssignee[];
  onActionCountChange?: (count: number) => void;
}

export function ActionsTakenSection({
  ticketId,
  isStaffOrAdmin,
  assignees = [],
  onActionCountChange,
}: ActionsTakenSectionProps) {
  const [actions, setActions] = useState<ActionTaken[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingAction, setEditingAction] = useState<ActionTaken | null>(null);
  const [modalSubmitting, setModalSubmitting] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Modal Form Fields
  const [formDateTime, setFormDateTime] = useState<string>("");
  const [formDescription, setFormDescription] = useState<string>("");
  const [formResult, setFormResult] = useState<string>("");
  const [formAssigneeId, setFormAssigneeId] = useState<string>("");
  const [formStatus, setFormStatus] = useState<ActionTakenStatus>("PENDING");
  const [formFollowUpRequired, setFormFollowUpRequired] = useState<boolean>(false);
  const [formFollowUpNote, setFormFollowUpNote] = useState<string>("");
  const [formAttachmentNotes, setFormAttachmentNotes] = useState<string>("");

  // Transition Popover/Quick State
  const [transitioningActionId, setTransitioningActionId] = useState<number | null>(null);
  const [quickStatus, setQuickStatus] = useState<ActionTakenStatus | "">("");
  const [quickResult, setQuickResult] = useState<string>("");
  const [quickTransitionSubmitting, setQuickTransitionSubmitting] = useState<boolean>(false);
  const [quickTransitionError, setQuickTransitionError] = useState<string | null>(null);

  const loadActions = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setFetchError(null);
      try {
        const data = await fetchTicketActions(ticketId, signal);
        setActions(data);
        if (onActionCountChange) {
          onActionCountChange(data.length);
        }
      } catch (err: any) {
        if (err?.name === "AbortError" || signal?.aborted) return;
        // If 403 (e.g. requester viewing non-owned ticket), set empty or message
        if (err?.status === 403) {
          setFetchError("You do not have permission to view actions for this ticket.");
        } else {
          setFetchError(err.message || "Failed to load actions taken");
        }
      } finally {
        setLoading(false);
      }
    },
    [ticketId, onActionCountChange]
  );

  useEffect(() => {
    const controller = new AbortController();
    loadActions(controller.signal);
    return () => {
      controller.abort();
    };
  }, [loadActions]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingAction(null);
    const now = new Date();
    // format as YYYY-MM-DDTHH:mm for datetime-local
    const offset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, 16);
    setFormDateTime(localISOTime);
    setFormDescription("");
    setFormResult("");
    setFormAssigneeId("");
    setFormStatus("PENDING");
    setFormFollowUpRequired(false);
    setFormFollowUpNote("");
    setFormAttachmentNotes("");
    setModalError(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (action: ActionTaken) => {
    if (action.status === "COMPLETED" || action.status === "CANCELLED") {
      return; // Terminal state guard
    }
    setEditingAction(action);
    const d = new Date(action.actionDateTime);
    const offset = d.getTimezoneOffset() * 60000;
    const localISOTime = new Date(d.getTime() - offset).toISOString().slice(0, 16);
    setFormDateTime(localISOTime);
    setFormDescription(action.actionDescription);
    setFormResult(action.result || "");
    setFormAssigneeId(action.assigneeId ? String(action.assigneeId) : "");
    setFormStatus(action.status);
    setFormFollowUpRequired(action.followUpRequired);
    setFormFollowUpNote(action.followUpNote || "");
    setFormAttachmentNotes(action.attachmentNotes || "");
    setModalError(null);
    setIsModalOpen(true);
  };

  // Submit Modal (Create or Edit)
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    // Client-side validations
    if (formDescription.trim().length < 5) {
      setModalError("Action description must be at least 5 characters.");
      return;
    }

    if (formFollowUpRequired && formFollowUpNote.trim().length < 5) {
      setModalError("Follow-up note is required (minimum 5 characters) when follow-up is checked.");
      return;
    }

    if (formStatus === "COMPLETED" && formResult.trim().length === 0) {
      setModalError("Result/Outcome is required when status is marked as Completed.");
      return;
    }

    setModalSubmitting(true);
    try {
      if (editingAction) {
        // Edit Action
        const payload: UpdateActionTakenPayload = {
          actionDescription: formDescription.trim(),
          actionDateTime: formDateTime ? new Date(formDateTime).toISOString() : undefined,
          result: formResult.trim() || undefined,
          assigneeId: formAssigneeId ? Number(formAssigneeId) : null,
          status: formStatus,
          followUpRequired: formFollowUpRequired,
          followUpNote: formFollowUpRequired ? formFollowUpNote.trim() : undefined,
          attachmentNotes: formAttachmentNotes.trim() || undefined,
          expectedUpdatedAt: editingAction.updatedAt,
        };

        const updated = await updateTicketAction(ticketId, editingAction.id, payload);
        setActions((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      } else {
        // Create Action
        const payload: CreateActionTakenPayload = {
          actionDescription: formDescription.trim(),
          actionDateTime: formDateTime ? new Date(formDateTime).toISOString() : undefined,
          result: formResult.trim() || undefined,
          assigneeId: formAssigneeId ? Number(formAssigneeId) : null,
          status: formStatus,
          followUpRequired: formFollowUpRequired,
          followUpNote: formFollowUpRequired ? formFollowUpNote.trim() : undefined,
          attachmentNotes: formAttachmentNotes.trim() || undefined,
        };

        const created = await createTicketAction(ticketId, payload);
        const nextList = [...actions, created];
        setActions(nextList);
        if (onActionCountChange) {
          onActionCountChange(nextList.length);
        }
      }

      setIsModalOpen(false);
    } catch (err: any) {
      if (err?.status === 409) {
        setModalError("Conflict: This action was modified by another user. Please cancel and reload to see updates.");
      } else {
        setModalError(err.message || "Failed to save action taken.");
      }
    } finally {
      setModalSubmitting(false);
    }
  };

  // Submit Quick Transition
  const handleExecuteTransition = async (action: ActionTaken) => {
    if (!quickStatus) return;
    setQuickTransitionError(null);

    if (quickStatus === "COMPLETED" && !quickResult.trim() && !action.result) {
      setQuickTransitionError("Result/Outcome is required when completing an action.");
      return;
    }

    setQuickTransitionSubmitting(true);
    try {
      const updated = await transitionActionStatus(ticketId, action.id, {
        status: quickStatus,
        result: quickResult.trim() || undefined,
      });

      setActions((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      setTransitioningActionId(null);
      setQuickStatus("");
      setQuickResult("");
    } catch (err: any) {
      setQuickTransitionError(err.message || "Failed to transition action status.");
    } finally {
      setQuickTransitionSubmitting(false);
    }
  };

  return (
    <div
      className="card shadow-sm mb-4"
      style={{ borderTop: "3px solid #006B3C", backgroundColor: "#FFFFFF" }}
      data-testid="actions-taken-section"
    >
      {/* Card Header */}
      <div className="card-header bg-white py-3 px-3 d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom">
        <div className="d-flex align-items-center gap-2">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#006B3C"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="flex-shrink-0"
          >
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
          <h6 className="mb-0 fw-bold text-dark fs-6">Actions Taken by IT Staff</h6>
          <span
            className="badge rounded-pill ms-1"
            style={{ backgroundColor: "#EAF6EF", color: "#006B3C", border: "1px solid #006B3C" }}
            data-testid="actions-count-badge"
          >
            {actions.length} {actions.length === 1 ? "Action" : "Actions"} Recorded
          </span>
        </div>

        {/* IT Staff & Admin "+ Add Action Taken" button */}
        {isStaffOrAdmin && (
          <button
            type="button"
            className="btn btn-sm btn-zen-primary d-inline-flex align-items-center gap-1"
            onClick={handleOpenCreateModal}
            data-testid="add-action-btn"
          >
            <svg
              width="14"
              height="14"
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
            <span>Add Action Taken</span>
          </button>
        )}
      </div>

      {/* Card Body */}
      <div className="card-body p-3">
        {loading && (
          <div className="text-center py-4" data-testid="actions-loading">
            <div className="spinner-border spinner-border-sm text-success me-2" role="status" />
            <span className="text-muted small">Loading actions taken...</span>
          </div>
        )}

        {!loading && fetchError && (
          <div className="alert alert-warning py-2 px-3 small mb-0" role="alert" data-testid="actions-fetch-error">
            {fetchError}
          </div>
        )}

        {!loading && !fetchError && actions.length === 0 && (
          <div
            className="text-center py-4 px-3 rounded"
            style={{ backgroundColor: "#F8FAFC", border: "1px dashed #CBD5E1" }}
            data-testid="actions-empty-state"
          >
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94A3B8"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mb-2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            <p className="text-muted small mb-0">
              No actions recorded yet. IT Staff will log technical steps here as work progresses.
            </p>
          </div>
        )}

        {!loading && !fetchError && actions.length > 0 && (
          <>
            {/* Desktop / Tablet Table View (>= 768px) */}
            <div className="table-responsive d-none d-md-block">
              <table className="table table-hover align-middle mb-0 small" role="table">
                <thead className="table-light">
                  <tr>
                    <th scope="col" style={{ minWidth: "120px" }}>Date / Time</th>
                    <th scope="col" style={{ minWidth: "180px" }}>Description</th>
                    <th scope="col" style={{ minWidth: "140px" }}>Result / Outcome</th>
                    <th scope="col" style={{ minWidth: "120px" }}>Performed By</th>
                    <th scope="col" style={{ minWidth: "120px" }}>Assigned To</th>
                    <th scope="col" style={{ minWidth: "100px" }}>Status</th>
                    <th scope="col" style={{ minWidth: "90px" }}>Follow-Up</th>
                    <th scope="col" style={{ minWidth: "110px" }}>Attachments</th>
                    {isStaffOrAdmin && (
                      <th scope="col" style={{ minWidth: "130px", textAlign: "right" }}>Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {actions.map((action) => {
                    const statusMeta = getActionStatusStyle(action.status);
                    const isTerminal = action.status === "COMPLETED" || action.status === "CANCELLED";
                    const permittedNext = PERMITTED_ACTION_TRANSITIONS[action.status] || [];
                    const isTransitioningThis = transitioningActionId === action.id;

                    return (
                      <tr key={action.id} data-testid={`action-row-${action.id}`}>
                        <td className="text-nowrap text-muted font-monospace">
                          {formatActionDateTime(action.actionDateTime)}
                        </td>
                        <td className="fw-medium text-dark" style={{ maxWidth: "240px", wordBreak: "break-word" }}>
                          {action.actionDescription}
                        </td>
                        <td className="text-muted" style={{ maxWidth: "180px", wordBreak: "break-word" }}>
                          {action.result ? (
                            <span className="text-dark">{action.result}</span>
                          ) : (
                            <span className="text-muted fst-italic">—</span>
                          )}
                        </td>
                        <td>
                          {action.performedBy ? (
                            <div>
                              <div className="fw-medium text-dark">{action.performedBy.fullName}</div>
                              <span
                                className="badge px-1.5 py-0.5"
                                style={{ backgroundColor: "#EAF6EF", color: "#006B3C", fontSize: "0.7rem" }}
                              >
                                {action.performedBy.role === "ADMINISTRATOR" ? "Admin" : "IT Staff"}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted fst-italic">Unknown</span>
                          )}
                        </td>
                        <td>
                          {action.assignee ? (
                            <div>
                              <div className="fw-medium text-dark">{action.assignee.fullName}</div>
                              <span
                                className="badge px-1.5 py-0.5"
                                style={{ backgroundColor: "#F3E8FF", color: "#7E22CE", fontSize: "0.7rem" }}
                              >
                                {action.assignee.role === "ADMINISTRATOR" ? "Admin" : "IT Staff"}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted fst-italic">Unassigned</span>
                          )}
                        </td>
                        <td>
                          <span
                            className="badge d-inline-flex align-items-center gap-1"
                            style={{
                              backgroundColor: statusMeta.bg,
                              color: statusMeta.color,
                              border: `1px solid ${statusMeta.border}`,
                              fontSize: "0.75rem",
                              padding: "0.3rem 0.55rem",
                            }}
                            data-testid={`action-status-badge-${action.id}`}
                          >
                            {action.status === "PENDING" && (
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                              </svg>
                            )}
                            {action.status === "IN_PROGRESS" && (
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polygon points="5 3 19 12 5 21 5 3" />
                              </svg>
                            )}
                            {action.status === "COMPLETED" && (
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                            {action.status === "CANCELLED" && (
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            )}
                            {statusMeta.label}
                          </span>
                        </td>
                        <td>
                          {action.followUpRequired ? (
                            <span
                              className="badge bg-warning text-dark d-inline-flex align-items-center gap-1"
                              title={action.followUpNote || "Follow-up required"}
                              data-testid={`action-follow-up-${action.id}`}
                            >
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                              </svg>
                              Yes
                            </span>
                          ) : (
                            <span className="text-muted fst-italic">None</span>
                          )}
                        </td>
                        <td className="text-muted" style={{ maxWidth: "120px", wordBreak: "break-word" }}>
                          {action.attachmentNotes ? (
                            <span className="text-truncate d-inline-block" style={{ maxWidth: "110px" }} title={action.attachmentNotes}>
                              📎 {action.attachmentNotes}
                            </span>
                          ) : (
                            <span className="text-muted fst-italic">—</span>
                          )}
                        </td>
                        {isStaffOrAdmin && (
                          <td style={{ textAlign: "right" }}>
                            {isTerminal ? (
                              <span className="badge bg-secondary text-white small" title="Terminal state — modifications locked">
                                Locked
                              </span>
                            ) : (
                              <div className="d-flex justify-content-end gap-1">
                                <button
                                  type="button"
                                  className="btn btn-xs btn-outline-secondary py-1 px-2"
                                  onClick={() => handleOpenEditModal(action)}
                                  data-testid={`edit-action-btn-${action.id}`}
                                  title="Edit this action"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-xs btn-outline-success py-1 px-2"
                                  onClick={() => {
                                    if (isTransitioningThis) {
                                      setTransitioningActionId(null);
                                      setQuickStatus("");
                                      setQuickResult("");
                                    } else {
                                      setTransitioningActionId(action.id);
                                      setQuickStatus(permittedNext[0] || "");
                                      setQuickResult(action.result || "");
                                    }
                                  }}
                                  data-testid={`transition-action-btn-${action.id}`}
                                  title="Change status"
                                >
                                  Status ▾
                                </button>
                              </div>
                            )}

                            {/* Inline transition drawer / panel */}
                            {isTransitioningThis && (
                              <div
                                className="mt-2 p-2 bg-light border rounded text-start shadow-sm"
                                style={{ minWidth: "220px" }}
                                data-testid={`transition-panel-${action.id}`}
                              >
                                <div className="fw-semibold small mb-1 text-dark">Transition Status:</div>
                                {quickTransitionError && (
                                  <div className="alert alert-danger py-1 px-2 mb-2 small">{quickTransitionError}</div>
                                )}
                                <select
                                  className="form-select form-select-sm mb-2"
                                  value={quickStatus}
                                  onChange={(e) => setQuickStatus(e.target.value as ActionTakenStatus)}
                                  data-testid={`transition-select-${action.id}`}
                                >
                                  {permittedNext.map((st) => (
                                    <option key={st} value={st}>
                                      {st}
                                    </option>
                                  ))}
                                </select>
                                {quickStatus === "COMPLETED" && (
                                  <input
                                    type="text"
                                    className="form-control form-control-sm mb-2"
                                    placeholder="Enter Result / Outcome (required)"
                                    value={quickResult}
                                    onChange={(e) => setQuickResult(e.target.value)}
                                    data-testid={`transition-result-input-${action.id}`}
                                  />
                                )}
                                <div className="d-flex justify-content-end gap-1">
                                  <button
                                    type="button"
                                    className="btn btn-xs btn-secondary py-1 px-2"
                                    onClick={() => setTransitioningActionId(null)}
                                    disabled={quickTransitionSubmitting}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-xs btn-success py-1 px-2"
                                    onClick={() => handleExecuteTransition(action)}
                                    disabled={quickTransitionSubmitting || !quickStatus}
                                    data-testid={`transition-confirm-btn-${action.id}`}
                                  >
                                    {quickTransitionSubmitting ? "Saving..." : "Apply"}
                                  </button>
                                </div>
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (< 768px) */}
            <div className="d-md-none d-flex flex-column gap-3" data-testid="actions-mobile-list">
              {actions.map((action) => {
                const statusMeta = getActionStatusStyle(action.status);
                const isTerminal = action.status === "COMPLETED" || action.status === "CANCELLED";
                const permittedNext = PERMITTED_ACTION_TRANSITIONS[action.status] || [];
                const isTransitioningThis = transitioningActionId === action.id;

                return (
                  <div
                    key={action.id}
                    className="card border shadow-xs p-3 rounded"
                    style={{ backgroundColor: "#FDFDFD" }}
                    data-testid={`action-card-${action.id}`}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted small font-monospace">
                        {formatActionDateTime(action.actionDateTime)}
                      </span>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: statusMeta.bg,
                          color: statusMeta.color,
                          border: `1px solid ${statusMeta.border}`,
                          fontSize: "0.75rem",
                          padding: "0.35rem 0.55rem",
                        }}
                      >
                        {statusMeta.label}
                      </span>
                    </div>

                    <div className="fw-semibold text-dark mb-2" style={{ wordBreak: "break-word" }}>
                      {action.actionDescription}
                    </div>

                    {action.result && (
                      <div className="small mb-2 p-2 bg-light rounded text-muted">
                        <strong className="text-dark">Outcome:</strong> {action.result}
                      </div>
                    )}

                    <div className="d-flex flex-wrap gap-2 text-muted small mb-2">
                      <span>
                        <strong>By:</strong> {action.performedBy?.fullName || "Unknown"}
                      </span>
                      <span>•</span>
                      <span>
                        <strong>Assignee:</strong> {action.assignee?.fullName || "Unassigned"}
                      </span>
                    </div>

                    {action.followUpRequired && (
                      <div className="alert alert-warning py-1 px-2 small mb-2">
                        <strong>Follow-up:</strong> {action.followUpNote || "Action needed"}
                      </div>
                    )}

                    {action.attachmentNotes && (
                      <div className="text-muted small mb-2">
                        📎 <em>{action.attachmentNotes}</em>
                      </div>
                    )}

                    {/* Touch friendly controls for Staff/Admin (minimum 44x44 target) */}
                    {isStaffOrAdmin && !isTerminal && (
                      <div className="d-flex gap-2 pt-2 border-top mt-1">
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm flex-fill d-flex align-items-center justify-content-center"
                          style={{ minHeight: "44px" }}
                          onClick={() => handleOpenEditModal(action)}
                          data-testid={`mobile-edit-btn-${action.id}`}
                        >
                          Edit Action
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-success btn-sm flex-fill d-flex align-items-center justify-content-center"
                          style={{ minHeight: "44px" }}
                          onClick={() => {
                            if (isTransitioningThis) {
                              setTransitioningActionId(null);
                            } else {
                              setTransitioningActionId(action.id);
                              setQuickStatus(permittedNext[0] || "");
                              setQuickResult(action.result || "");
                            }
                          }}
                          data-testid={`mobile-transition-btn-${action.id}`}
                        >
                          Status ▾
                        </button>
                      </div>
                    )}

                    {isTransitioningThis && (
                      <div className="mt-2 p-3 bg-light border rounded" data-testid={`mobile-transition-panel-${action.id}`}>
                        <div className="fw-semibold small mb-2 text-dark">Transition Status:</div>
                        {quickTransitionError && (
                          <div className="alert alert-danger py-1 px-2 mb-2 small">{quickTransitionError}</div>
                        )}
                        <select
                          className="form-select mb-2"
                          style={{ minHeight: "44px" }}
                          value={quickStatus}
                          onChange={(e) => setQuickStatus(e.target.value as ActionTakenStatus)}
                        >
                          {permittedNext.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                        {quickStatus === "COMPLETED" && (
                          <input
                            type="text"
                            className="form-control mb-2"
                            style={{ minHeight: "44px" }}
                            placeholder="Enter Result / Outcome (required)"
                            value={quickResult}
                            onChange={(e) => setQuickResult(e.target.value)}
                          />
                        )}
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-secondary flex-fill"
                            style={{ minHeight: "44px" }}
                            onClick={() => setTransitioningActionId(null)}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="btn btn-success flex-fill"
                            style={{ minHeight: "44px" }}
                            onClick={() => handleExecuteTransition(action)}
                            disabled={quickTransitionSubmitting || !quickStatus}
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Create / Edit Action Taken Modal */}
      {isModalOpen && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          data-testid="action-modal"
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div className="modal-content shadow border-0">
              <div className="modal-header" style={{ borderTop: "4px solid #006B3C" }}>
                <h5 className="modal-title fw-bold text-dark fs-5" data-testid="action-modal-title">
                  {editingAction ? "Edit Action Taken" : "Record Action Taken"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => setIsModalOpen(false)}
                  disabled={modalSubmitting}
                />
              </div>

              <form onSubmit={handleSaveModal} noValidate>
                <div className="modal-body p-4">
                  {modalError && (
                    <div
                      className="alert alert-danger py-2 px-3 small mb-3"
                      role="alert"
                      data-testid="action-form-error"
                    >
                      {modalError}
                    </div>
                  )}

                  <div className="row g-3">
                    {/* Action Date / Time */}
                    <div className="col-12 col-md-6">
                      <label htmlFor="action-datetime" className="form-label fw-semibold small text-muted mb-1">
                        Action Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        id="action-datetime"
                        className="form-control form-control-sm"
                        value={formDateTime}
                        onChange={(e) => setFormDateTime(e.target.value)}
                        data-testid="action-datetime-input"
                        required
                      />
                    </div>

                    {/* Status */}
                    <div className="col-12 col-md-6">
                      <label htmlFor="action-status" className="form-label fw-semibold small text-muted mb-1">
                        Action Status
                      </label>
                      <select
                        id="action-status"
                        className="form-select form-select-sm"
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value as ActionTakenStatus)}
                        data-testid="action-status-select"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </div>

                    {/* Action Description */}
                    <div className="col-12">
                      <label htmlFor="action-description" className="form-label fw-semibold small text-muted mb-1">
                        Action Description <span className="text-danger">*</span>
                      </label>
                      <textarea
                        id="action-description"
                        className="form-control form-control-sm"
                        rows={3}
                        placeholder="Detailed technical description of actions taken (minimum 5 characters)..."
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        data-testid="action-description-input"
                        required
                      />
                    </div>

                    {/* Result / Outcome */}
                    <div className="col-12">
                      <label htmlFor="action-result" className="form-label fw-semibold small text-muted mb-1">
                        Result / Outcome {formStatus === "COMPLETED" && <span className="text-danger">*</span>}
                      </label>
                      <textarea
                        id="action-result"
                        className="form-control form-control-sm"
                        rows={2}
                        placeholder="Resolution outcome or diagnostic result (required if status is Completed)..."
                        value={formResult}
                        onChange={(e) => setFormResult(e.target.value)}
                        data-testid="action-result-input"
                      />
                    </div>

                    {/* Assignee Selector */}
                    <div className="col-12 col-md-6">
                      <label htmlFor="action-assignee" className="form-label fw-semibold small text-muted mb-1">
                        Assigned To (IT Staff / Admin)
                      </label>
                      <select
                        id="action-assignee"
                        className="form-select form-select-sm"
                        value={formAssigneeId}
                        onChange={(e) => setFormAssigneeId(e.target.value)}
                        data-testid="action-assignee-select"
                      >
                        <option value="">Unassigned</option>
                        {assignees.map((assignee) => (
                          <option
                            key={assignee.id}
                            value={assignee.id}
                            disabled={assignee.isActive === false}
                          >
                            {assignee.fullName} ({assignee.role === "ADMINISTRATOR" ? "Admin" : "Staff"})
                            {assignee.isActive === false ? " - Inactive" : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Attachment Notes */}
                    <div className="col-12 col-md-6">
                      <label htmlFor="action-attachments" className="form-label fw-semibold small text-muted mb-1">
                        Attachment References / Notes
                      </label>
                      <input
                        type="text"
                        id="action-attachments"
                        className="form-control form-control-sm"
                        placeholder="e.g. diagnostics_log.txt or screenshot_1.png"
                        value={formAttachmentNotes}
                        onChange={(e) => setFormAttachmentNotes(e.target.value)}
                        data-testid="attachment-notes-input"
                      />
                    </div>

                    {/* Follow-up Required Toggle */}
                    <div className="col-12">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="followUpSwitch"
                          checked={formFollowUpRequired}
                          onChange={(e) => setFormFollowUpRequired(e.target.checked)}
                          data-testid="follow-up-toggle"
                        />
                        <label className="form-check-label fw-semibold small text-dark" htmlFor="followUpSwitch">
                          Follow-up Required
                        </label>
                      </div>
                    </div>

                    {/* Follow-up Note (Dynamically required when toggle is ON) */}
                    {formFollowUpRequired && (
                      <div className="col-12">
                        <label htmlFor="follow-up-note" className="form-label fw-semibold small text-warning mb-1">
                          Follow-up Note <span className="text-danger">*</span>
                        </label>
                        <textarea
                          id="follow-up-note"
                          className="form-control form-control-sm border-warning"
                          style={{ backgroundColor: "#FFFBEB" }}
                          rows={2}
                          placeholder="Describe the required follow-up action (minimum 5 characters)..."
                          value={formFollowUpNote}
                          onChange={(e) => setFormFollowUpNote(e.target.value)}
                          data-testid="follow-up-note-input"
                          required
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="modal-footer bg-light px-4 py-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setIsModalOpen(false)}
                    disabled={modalSubmitting}
                    data-testid="cancel-action-btn"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-sm btn-zen-primary d-inline-flex align-items-center gap-1"
                    disabled={modalSubmitting}
                    data-testid="save-action-btn"
                  >
                    {modalSubmitting && (
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
                    )}
                    <span>{editingAction ? "Update Action" : "Save Action"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
