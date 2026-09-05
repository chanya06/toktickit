import React, { useState, useEffect, useCallback } from "react";
import {
  fetchActiveCategories,
  fetchActiveSystems,
  createTicket,
  Category,
  RelatedSystem,
  TicketResponse,
} from "../api.js";
import { useRequester } from "../context/RequesterContext.js";

interface CreateTicketFormProps {
  onSuccessNavigate?: () => void;
}

export const CreateTicketForm: React.FC<CreateTicketFormProps> = ({ onSuccessNavigate }) => {
  const { selectedRequester, openSelectorModal } = useRequester();

  const [categories, setCategories] = useState<Category[]>([]);
  const [systems, setSystems] = useState<RelatedSystem[]>([]);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState<boolean>(true);
  const [dropdownError, setDropdownError] = useState<string | null>(null);

  // Form State
  const [categoryId, setCategoryId] = useState<string>("");
  const [relatedSystemId, setRelatedSystemId] = useState<string>("");
  const [requestedPriority, setRequestedPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [summary, setSummary] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  // Field Errors
  const [fieldErrors, setFieldErrors] = useState<{
    category?: string;
    system?: string;
    summary?: string;
    description?: string;
  }>({});

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [createdTicket, setCreatedTicket] = useState<TicketResponse | null>(null);

  // Initial Attachments State
  const [initialFiles, setInitialFiles] = useState<File[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAttachmentError(null);
    if (!e.target.files || e.target.files.length === 0) return;

    const newFiles = Array.from(e.target.files);

    if (initialFiles.length + newFiles.length > 5) {
      setAttachmentError("Maximum initial attachments limit (5 files) exceeded.");
      return;
    }

    for (const f of newFiles) {
      const ext = "." + f.name.split(".").pop()?.toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        setAttachmentError(`File "${f.name}" format is not supported. Allowed formats: .jpg, .jpeg, .png, .webp, .pdf`);
        return;
      }
      if (f.size > MAX_FILE_SIZE) {
        setAttachmentError(`File "${f.name}" size exceeds maximum allowed limit of 5 MB.`);
        return;
      }
    }

    setInitialFiles((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  };

  const handleRemoveFile = (index: number) => {
    setInitialFiles((prev) => prev.filter((_, i) => i !== index));
    setAttachmentError(null);
  };

  // Fetch dropdown categories and related systems
  const loadDropdownData = useCallback(async () => {
    setIsLoadingDropdowns(true);
    setDropdownError(null);
    try {
      const [catData, sysData] = await Promise.all([
        fetchActiveCategories(),
        fetchActiveSystems(),
      ]);
      setCategories(catData);
      setSystems(sysData);
      if (catData.length > 0) setCategoryId((prev) => prev || String(catData[0].id));
      if (sysData.length > 0) setRelatedSystemId((prev) => prev || String(sysData[0].id));
    } catch (err: any) {
      setDropdownError(err.message || "Failed to load form options");
    } finally {
      setIsLoadingDropdowns(false);
    }
  }, []);

  useEffect(() => {
    loadDropdownData();
  }, [loadDropdownData]);

  const validateForm = (): boolean => {
    const errors: {
      category?: string;
      system?: string;
      summary?: string;
      description?: string;
    } = {};

    if (!categoryId) {
      errors.category = "Category is required.";
    }

    if (!relatedSystemId) {
      errors.system = "Related System is required.";
    }

    const trimmedSummary = summary.trim();
    if (!trimmedSummary) {
      errors.summary = "Summary is required.";
    } else if (trimmedSummary.length < 5) {
      errors.summary = "Summary must be at least 5 characters.";
    } else if (trimmedSummary.length > 120) {
      errors.summary = "Summary cannot exceed 120 characters.";
    }

    const trimmedDescription = description.trim();
    if (!trimmedDescription) {
      errors.description = "Description is required.";
    } else if (trimmedDescription.length < 10) {
      errors.description = "Description must be at least 10 characters.";
    } else if (trimmedDescription.length > 2000) {
      errors.description = "Description cannot exceed 2000 characters.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!selectedRequester) {
      openSelectorModal();
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const ticket = await createTicket({
        requesterId: selectedRequester.id,
        categoryId: Number(categoryId),
        relatedSystemId: Number(relatedSystemId),
        requestedPriority,
        summary: summary.trim(),
        description: description.trim(),
        files: initialFiles.length > 0 ? initialFiles : undefined,
      });

      setCreatedTicket(ticket);
    } catch (err: any) {
      setApiError(err.message || "Failed to submit ticket. Please check your inputs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setCreatedTicket(null);
    setSummary("");
    setDescription("");
    setInitialFiles([]);
    setAttachmentError(null);
    setFieldErrors({});
    setApiError(null);
    if (categories.length > 0) setCategoryId(String(categories[0].id));
    if (systems.length > 0) setRelatedSystemId(String(systems[0].id));
    setRequestedPriority("MEDIUM");
  };

  const now = new Date();
  const localYear = now.getFullYear();
  const localMonth = String(now.getMonth() + 1).padStart(2, "0");
  const localDay = String(now.getDate()).padStart(2, "0");
  const currentDateString = `${localYear}-${localMonth}-${localDay} (Today)`;

  // SUCCESS CONFIRMATION VIEW
  if (createdTicket) {
    return (
      <div className="card shadow-sm border-success mb-4">
        <div className="card-body p-4 text-center">
          <div className="mb-3">
            <span className="display-4 text-success">🟢</span>
          </div>
          <h2 className="h4 fw-bold text-success mb-2">Ticket Created Successfully!</h2>
          <p className="text-muted mb-3">
            Your IT support request has been logged and assigned to the service desk.
          </p>

          <div className="bg-light p-3 rounded mb-4 text-start border">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small">Ticket Number</span>
              <span className="badge bg-success fs-6 fw-bold px-3 py-2">
                {createdTicket.ticketNumber}
              </span>
            </div>
            <div className="mb-2">
              <span className="fw-semibold">Summary: </span>
              <span>{createdTicket.summary}</span>
            </div>
            <div className="mb-2">
              <span className="fw-semibold">Status: </span>
              <span className="badge bg-info text-dark">{createdTicket.status}</span>
            </div>
            <div>
              <span className="fw-semibold">Requester: </span>
              <span>{selectedRequester?.name} ({selectedRequester?.email})</span>
            </div>
          </div>

          <div className="d-flex justify-content-center gap-3">
            <button
              type="button"
              className="btn-zen-secondary"
              onClick={handleResetForm}
            >
              ➕ Create Another Ticket
            </button>
            {onSuccessNavigate && (
              <button
                type="button"
                className="btn-zen-primary"
                onClick={onSuccessNavigate}
              >
                📋 View My Tickets
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body p-4">
        {/* Form Title & Context Banner */}
        <div className="border-bottom pb-3 mb-4">
          <h2 className="h4 fw-bold text-success mb-1" style={{ color: "var(--primary-green)" }}>
            Create IT Support Ticket
          </h2>
          <p className="text-muted mb-0 small">
            Submit a new IT request for hardware, software, account access, or network support. Fields marked with <span className="text-danger fw-bold">*</span> are required.
          </p>
        </div>

        {/* Requester Identity Warning / Selector Bar */}
        {!selectedRequester ? (
          <div className="alert alert-warning mb-4 d-flex justify-content-between align-items-center">
            <div>
              <strong>No Requester Selected:</strong> Please select a Development Requester context before submitting a ticket.
            </div>
            <button type="button" className="btn btn-sm btn-warning" onClick={openSelectorModal}>
              Select Requester
            </button>
          </div>
        ) : (
          <div className="notice-box mb-4">
            Submitting as: <strong>{selectedRequester.name}</strong> ({selectedRequester.email}) — <em>{selectedRequester.department || "General"}</em>
          </div>
        )}

        {/* Dropdown Load Error with Retry Option */}
        {dropdownError && (
          <div className="alert alert-danger mb-4 d-flex justify-content-between align-items-center" role="alert">
            <div>
              <strong className="d-block mb-1">Failed to load form metadata</strong>
              <span className="small">{dropdownError}</span>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={loadDropdownData}
            >
              🔄 Retry Connection
            </button>
          </div>
        )}

        {/* Submission Error Alert */}
        {apiError && (
          <div className="alert alert-danger mb-4" role="alert">
            <p className="fw-bold mb-1">Submission Failed</p>
            <p className="mb-0 small">{apiError}</p>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Read-Only Auto-Generated Fields per ui-spec.md */}
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label htmlFor="ticketNumberPreview" className="form-label fw-semibold text-muted">
                Ticket Number <span className="small text-muted">(Read-only)</span>
              </label>
              <input
                type="text"
                id="ticketNumberPreview"
                className="form-control bg-light"
                value="TKT-YYYY-XXXXXX (Auto-generated upon submission)"
                readOnly
                disabled
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="ticketDatePreview" className="form-label fw-semibold text-muted">
                Ticket Date <span className="small text-muted">(Read-only)</span>
              </label>
              <input
                type="text"
                id="ticketDatePreview"
                className="form-control bg-light"
                value={currentDateString}
                readOnly
                disabled
              />
            </div>
          </div>

          {/* Row 1: Category & Related System */}
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label htmlFor="ticketCategory" className="form-label fw-semibold">
                Category <span className="text-danger fw-bold">*</span>
              </label>
              <select
                id="ticketCategory"
                className={`form-select ${fieldErrors.category ? "is-invalid" : ""}`}
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  if (fieldErrors.category) setFieldErrors((prev) => ({ ...prev, category: undefined }));
                }}
                disabled={isLoadingDropdowns || categories.length === 0}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {fieldErrors.category && (
                <div className="invalid-feedback field-error-message d-block">{fieldErrors.category}</div>
              )}
            </div>

            <div className="col-md-6">
              <label htmlFor="ticketSystem" className="form-label fw-semibold">
                Related System <span className="text-danger fw-bold">*</span>
              </label>
              <select
                id="ticketSystem"
                className={`form-select ${fieldErrors.system ? "is-invalid" : ""}`}
                value={relatedSystemId}
                onChange={(e) => {
                  setRelatedSystemId(e.target.value);
                  if (fieldErrors.system) setFieldErrors((prev) => ({ ...prev, system: undefined }));
                }}
                disabled={isLoadingDropdowns || systems.length === 0}
              >
                {systems.map((sys) => (
                  <option key={sys.id} value={sys.id}>
                    {sys.name}
                  </option>
                ))}
              </select>
              {fieldErrors.system && (
                <div className="invalid-feedback field-error-message d-block">{fieldErrors.system}</div>
              )}
            </div>
          </div>

          {/* Row 2: Requested Priority Radio Selector */}
          <div className="mb-3">
            <label className="form-label fw-semibold">
              Requested Priority <span className="text-danger fw-bold">*</span>
            </label>
            <div className="d-flex flex-wrap gap-3">
              {(["LOW", "MEDIUM", "HIGH", "URGENT"] as const).map((priority) => (
                <div className="form-check" key={priority}>
                  <input
                    type="radio"
                    id={`priority-${priority}`}
                    name="requestedPriority"
                    className="form-check-input"
                    value={priority}
                    checked={requestedPriority === priority}
                    onChange={() => setRequestedPriority(priority)}
                  />
                  <label htmlFor={`priority-${priority}`} className="form-check-label fw-medium">
                    {priority}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Row 3: Ticket Summary */}
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center">
              <label htmlFor="ticketSummary" className="form-label fw-semibold mb-1">
                Summary <span className="text-danger fw-bold">*</span>
              </label>
              <span className="small text-muted">{summary.trim().length}/120</span>
            </div>
            <input
              type="text"
              id="ticketSummary"
              className={`form-control ${fieldErrors.summary ? "is-invalid" : ""}`}
              placeholder="e.g. Laptop battery drains quickly when idle"
              maxLength={120}
              value={summary}
              onChange={(e) => {
                setSummary(e.target.value);
                if (fieldErrors.summary) setFieldErrors((prev) => ({ ...prev, summary: undefined }));
              }}
            />
            {fieldErrors.summary ? (
              <div className="invalid-feedback field-error-message d-block">{fieldErrors.summary}</div>
            ) : (
              <div className="form-text small text-muted">
                Provide a concise one-line description of your issue (5-120 characters).
              </div>
            )}
          </div>

          {/* Row 4: Ticket Description */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center">
              <label htmlFor="ticketDescription" className="form-label fw-semibold mb-1">
                Description <span className="text-danger fw-bold">*</span>
              </label>
              <span className="small text-muted">{description.trim().length}/2000</span>
            </div>
            <textarea
              id="ticketDescription"
              className={`form-control ${fieldErrors.description ? "is-invalid" : ""}`}
              rows={5}
              placeholder="Provide detailed steps to reproduce, error messages, or affected software..."
              maxLength={2000}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (fieldErrors.description) setFieldErrors((prev) => ({ ...prev, description: undefined }));
              }}
            />
            {fieldErrors.description ? (
              <div className="invalid-feedback field-error-message d-block">{fieldErrors.description}</div>
            ) : (
              <div className="form-text small text-muted">
                Describe the problem in detail (10-2000 characters).
              </div>
            )}
          </div>

          {/* Initial File Attachments Section (FR-07, ui-spec.md) */}
          <div className="card bg-light border mb-4">
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label htmlFor="initialFileInput" className="form-label fw-semibold mb-0">
                  Initial Attachments <span className="small text-muted">(Optional — Max 5 files)</span>
                </label>
                <span className="small text-muted">{initialFiles.length} / 5 files</span>
              </div>

              <input
                type="file"
                id="initialFileInput"
                data-testid="initial-file-input"
                className="form-control form-control-sm mb-2"
                multiple
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                onChange={handleFileSelect}
                disabled={isSubmitting || initialFiles.length >= 5}
              />

              <div className="form-text small text-muted mb-2">
                Allowed formats: <strong>.jpg, .jpeg, .png, .webp, .pdf</strong> (Max file size: <strong>5 MB per file</strong>).
              </div>

              {attachmentError && (
                <div className="alert alert-danger py-1 px-2 mb-2 small" role="alert" data-testid="attachment-error">
                  {attachmentError}
                </div>
              )}

              {initialFiles.length > 0 && (
                <div className="list-group list-group-flush border rounded bg-white mt-2">
                  {initialFiles.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="list-group-item d-flex justify-content-between align-items-center py-2 px-3">
                      <div className="d-flex align-items-center gap-2 overflow-hidden me-2">
                        <span className="badge bg-secondary text-uppercase small">
                          {file.name.split(".").pop() || "FILE"}
                        </span>
                        <span className="small fw-semibold text-truncate">{file.name}</span>
                        <span className="small text-muted">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger py-0 px-2 small"
                        onClick={() => handleRemoveFile(index)}
                        disabled={isSubmitting}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="d-flex justify-content-end gap-2 border-top pt-3">
            {onSuccessNavigate && (
              <button
                type="button"
                className="btn-zen-secondary"
                onClick={onSuccessNavigate}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="btn-zen-primary d-flex align-items-center gap-2"
              disabled={isSubmitting || isLoadingDropdowns}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span>Submitting Ticket…</span>
                </>
              ) : (
                <span>Submit Ticket</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
