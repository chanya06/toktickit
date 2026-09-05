import React, { useState, useEffect, useRef } from "react";
import { useRequester } from "../context/RequesterContext.js";
import {
  fetchTicketAttachments,
  uploadTicketAttachment,
  downloadAttachment,
  softRemoveAttachment,
  AttachmentMetadata,
} from "../api.js";

interface AttachmentSectionProps {
  ticketId: number;
}

export function AttachmentSection({ ticketId }: AttachmentSectionProps) {
  const { selectedRequester } = useRequester();
  const currentRequesterIdRef = useRef(selectedRequester?.id);

  const [attachments, setAttachments] = useState<AttachmentMetadata[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [softRemoveTarget, setSoftRemoveTarget] = useState<AttachmentMetadata | null>(null);
  const [removalReason, setRemovalReason] = useState<string>("");
  const [softRemoveError, setSoftRemoveError] = useState<string | null>(null);
  const [submittingRemove, setSubmittingRemove] = useState<boolean>(false);

  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    currentRequesterIdRef.current = selectedRequester?.id;
  }, [selectedRequester?.id]);

  const loadAttachments = (signal?: AbortSignal) => {
    if (!selectedRequester) return;
    setLoading(true);
    setError(null);

    fetchTicketAttachments(ticketId, selectedRequester.id, signal)
      .then((data) => {
        if (!signal?.aborted && currentRequesterIdRef.current === selectedRequester.id) {
          setAttachments(data);
          setLoading(false);
        }
      })
      .catch((err: any) => {
        if (err?.name === "AbortError" || signal?.aborted || currentRequesterIdRef.current !== selectedRequester.id) return;
        setError(err.message || "Failed to load attachments");
        setLoading(false);
      });
  };

  useEffect(() => {
    const controller = new AbortController();
    setAttachments([]);
    setError(null);
    setSelectedFile(null);
    setUploadError(null);
    setDownloadError(null);
    setUploading(false);
    setSubmittingRemove(false);
    setSoftRemoveTarget(null);
    setRemovalReason("");
    setSoftRemoveError(null);

    loadAttachments(controller.signal);

    return () => {
      controller.abort();
    };
  }, [ticketId, selectedRequester?.id]);

  function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

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

  const activeAttachments = attachments.filter((a) => !a.isRemoved);
  const softRemovedAttachments = attachments.filter((a) => a.isRemoved);
  const activeCount = activeAttachments.length;
  const isLimitReached = activeCount >= 5;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(null);
      return;
    }

    const file = e.target.files[0];
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      setUploadError("File type not supported. Allowed formats: .jpg, .jpeg, .png, .webp, .pdf");
      setSelectedFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size exceeds maximum allowed limit of 5 MB");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !selectedRequester) return;

    if (isLimitReached) {
      setUploadError("Maximum active attachments limit (5) reached");
      return;
    }

    const requestRequesterId = selectedRequester.id;
    setUploading(true);
    setUploadError(null);

    uploadTicketAttachment(ticketId, requestRequesterId, selectedFile)
      .then(() => {
        if (currentRequesterIdRef.current !== requestRequesterId) {
          return;
        }
        setUploading(false);
        setSelectedFile(null);
        // Reset file input element
        const fileInput = document.getElementById("attachment-file-input") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        loadAttachments();
      })
      .catch((err: any) => {
        if (currentRequesterIdRef.current !== requestRequesterId) {
          return;
        }
        setUploading(false);
        setUploadError(err.message || "Failed to upload file");
      });
  };

  const handleDownload = (attachmentId: number) => {
    if (!selectedRequester) return;
    setDownloadError(null);
    downloadAttachment(attachmentId, selectedRequester.id).catch((err: any) => {
      setDownloadError(err.message || "Failed to download attachment");
    });
  };

  const openSoftRemoveModal = (attachment: AttachmentMetadata) => {
    setSoftRemoveTarget(attachment);
    setRemovalReason("");
    setSoftRemoveError(null);
  };

  const closeSoftRemoveModal = () => {
    setSoftRemoveTarget(null);
    setRemovalReason("");
    setSoftRemoveError(null);
  };

  const handleConfirmSoftRemove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!softRemoveTarget || !selectedRequester) return;

    const requestRequesterId = selectedRequester.id;
    const trimmed = removalReason.trim();
    if (trimmed.length < 3) {
      setSoftRemoveError("Soft-removal reason must be at least 3 characters");
      return;
    }

    if (trimmed.length > 250) {
      setSoftRemoveError("Soft-removal reason must be at most 250 characters");
      return;
    }

    setSubmittingRemove(true);
    setSoftRemoveError(null);

    softRemoveAttachment(softRemoveTarget.id, requestRequesterId, trimmed)
      .then(() => {
        if (currentRequesterIdRef.current !== requestRequesterId) {
          return;
        }
        setSubmittingRemove(false);
        closeSoftRemoveModal();
        loadAttachments();
      })
      .catch((err: any) => {
        if (currentRequesterIdRef.current !== requestRequesterId) {
          return;
        }
        setSubmittingRemove(false);
        setSoftRemoveError(err.message || "Failed to soft-remove attachment");
      });
  };

  return (
    <div className="card shadow-sm mb-4" data-testid="attachment-section">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <h4 className="h5 fw-bold text-dark mb-0 d-flex align-items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
            <span>File Attachments</span>
          </h4>
          <span className="badge bg-light text-dark border" data-testid="active-attachment-count">
            Active Attachments: <strong>{activeCount} / 5</strong>
          </span>
        </div>

        {downloadError && (
          <div className="alert alert-danger alert-dismissible fade show mb-3" data-testid="download-error-banner">
            <span>{downloadError}</span>
            <button
              type="button"
              className="btn-close"
              onClick={() => setDownloadError(null)}
              aria-label="Close"
            />
          </div>
        )}

        {/* Upload Form Section */}
        <div className="p-3 bg-light rounded border mb-4">
          <h5 className="h6 fw-bold text-dark mb-2">Upload New Attachment</h5>
          {isLimitReached ? (
            <div className="alert alert-warning mb-0 py-2" data-testid="attachment-limit-alert">
              Maximum active attachments limit (5) reached for this ticket. Soft-remove an existing file to upload a new file.
            </div>
          ) : (
            <form onSubmit={handleUpload} data-testid="attachment-upload-form">
              <div className="row g-2 align-items-center">
                <div className="col-12 col-md-8">
                  <input
                    id="attachment-file-input"
                    type="file"
                    className="form-control"
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                    onChange={handleFileChange}
                    disabled={uploading}
                    data-testid="file-input"
                  />
                  <div className="form-text small">
                    Allowed formats: <code>.jpg, .jpeg, .png, .webp, .pdf</code> (Max file size: 5 MB)
                  </div>
                </div>
                <div className="col-12 col-md-4 text-end">
                  <button
                    type="submit"
                    className="btn-zen-primary w-100"
                    disabled={!selectedFile || uploading}
                    data-testid="upload-submit-btn"
                  >
                    {uploading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                        Uploading...
                      </>
                    ) : (
                      "Upload Attachment"
                    )}
                  </button>
                </div>
              </div>

              {uploadError && (
                <div className="alert alert-danger mt-2 mb-0 py-2 small" data-testid="upload-error-banner">
                  {uploadError}
                </div>
              )}
            </form>
          )}
        </div>

        {/* Attachments List Section */}
        {loading ? (
          <div className="text-center py-4" data-testid="attachments-loading">
            <div className="spinner-border text-success spinner-border-sm mb-2" role="status" />
            <p className="text-muted small mb-0">Loading attachments...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger mb-3" data-testid="attachments-error">
            {error}
          </div>
        ) : (
          <>
            {/* Active Attachments Table */}
            <div className="mb-4">
              <h5 className="h6 fw-bold text-success mb-2">Active Files ({activeCount})</h5>
              {activeCount === 0 ? (
                <p className="text-muted small fst-italic mb-0" data-testid="no-active-attachments">
                  No active attachments uploaded yet.
                </p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light small">
                      <tr>
                        <th>File Name</th>
                        <th>Size</th>
                        <th>Uploaded Date</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeAttachments.map((file) => (
                        <tr key={file.id} data-testid={`active-attachment-row-${file.id}`}>
                          <td>
                            <strong className="text-dark d-block">{file.originalName}</strong>
                            <span className="text-muted small">{file.mimeType}</span>
                          </td>
                          <td className="small">{formatBytes(file.sizeBytes)}</td>
                          <td className="small text-muted">{formatDate(file.createdAt)}</td>
                          <td className="text-end">
                            <div className="btn-group btn-group-sm">
                              <button
                                type="button"
                                className="btn btn-outline-success"
                                onClick={() => handleDownload(file.id)}
                                data-testid={`download-btn-${file.id}`}
                              >
                                Download
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-danger"
                                onClick={() => openSoftRemoveModal(file)}
                                data-testid={`soft-remove-btn-${file.id}`}
                              >
                                Soft Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Soft-Removed Attachments Table */}
            {softRemovedAttachments.length > 0 && (
              <div>
                <h5 className="h6 fw-bold text-secondary mb-2">
                  Soft-Removed Attachments ({softRemovedAttachments.length})
                </h5>
                <div className="table-responsive">
                  <table className="table table-sm table-bordered bg-light align-middle mb-0">
                    <thead className="table-secondary small">
                      <tr>
                        <th>File Name</th>
                        <th>Removal Reason</th>
                        <th>Removed Date</th>
                        <th className="text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {softRemovedAttachments.map((file) => (
                        <tr key={file.id} data-testid={`removed-attachment-row-${file.id}`}>
                          <td className="text-muted">
                            <del>{file.originalName}</del>
                          </td>
                          <td className="small text-danger">{file.removalReason || "-"}</td>
                          <td className="small text-muted">{formatDate(file.removedAt || file.createdAt)}</td>
                          <td className="text-center">
                            <span className="badge bg-secondary text-white" data-testid={`removed-badge-${file.id}`}>
                              Soft-Removed
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Soft-Removal Modal Dialog */}
      {softRemoveTarget && (
        <div className="modal fade show d-block" tabIndex={-1} role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} data-testid="soft-remove-modal">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content shadow">
              <form onSubmit={handleConfirmSoftRemove}>
                <div className="modal-header bg-danger text-white">
                  <h5 className="modal-title h6 fw-bold mb-0">Soft-Remove Attachment</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={closeSoftRemoveModal} aria-label="Close" />
                </div>
                <div className="modal-body p-4">
                  <p className="small text-muted mb-3">
                    Are you sure you want to soft-remove <strong>{softRemoveTarget.originalName}</strong>? The file will be deactivated from active list and marked as removed with your reason.
                  </p>

                  <div className="mb-3">
                    <label htmlFor="soft-remove-reason-input" className="form-label small fw-bold">
                      Removal Reason <span className="text-danger">*</span>
                    </label>
                    <textarea
                      id="soft-remove-reason-input"
                      className="form-control"
                      rows={3}
                      placeholder="Please enter a mandatory reason for removing this file (min 3 characters)..."
                      value={removalReason}
                      onChange={(e) => setRemovalReason(e.target.value)}
                      disabled={submittingRemove}
                      required
                      data-testid="removal-reason-input"
                    />
                    <div className="form-text small">Minimum 3 characters required.</div>
                  </div>

                  {softRemoveError && (
                    <div className="alert alert-danger mb-0 py-2 small" data-testid="soft-remove-error-banner">
                      {softRemoveError}
                    </div>
                  )}
                </div>
                <div className="modal-footer bg-light p-3">
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={closeSoftRemoveModal} disabled={submittingRemove}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-sm btn-danger fw-medium"
                    disabled={submittingRemove || removalReason.trim().length < 3}
                    data-testid="confirm-soft-remove-btn"
                  >
                    {submittingRemove ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" role="status" />
                        Removing...
                      </>
                    ) : (
                      "Confirm Soft Remove"
                    )}
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
