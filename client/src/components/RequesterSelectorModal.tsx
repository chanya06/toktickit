import React, { useState, useEffect } from "react";
import { useRequester } from "../context/RequesterContext.js";
import { DevelopmentRequester } from "../api.js";

export const RequesterSelectorModal: React.FC = () => {
  const {
    selectedRequester,
    requesters,
    isLoading,
    error,
    isModalOpen,
    selectRequester,
    closeSelectorModal,
    refreshRequesters,
  } = useRequester();

  const [tempSelectedId, setTempSelectedId] = useState<number | "">("");

  useEffect(() => {
    if (selectedRequester) {
      setTempSelectedId(selectedRequester.id);
    } else if (requesters.length > 0) {
      setTempSelectedId(requesters[0].id);
    }
  }, [selectedRequester, requesters]);

  if (!isModalOpen) return null;

  const handleContinue = () => {
    if (tempSelectedId !== "") {
      const found = requesters.find((r) => r.id === Number(tempSelectedId));
      if (found) {
        selectRequester(found);
      }
    }
  };

  return (
    <div className="modal-backdrop-custom" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-card p-4">
        {/* Header Icon & Title matching Section 8.1 of Lab 2 Handout */}
        <div className="text-center mb-3">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
            style={{ width: "56px", height: "56px", backgroundColor: "var(--pale-green, #EAF6EF)", color: "var(--primary-green, #006B3C)" }}
          >
            <span className="fs-3">👤⚙️</span>
          </div>
          <h2 id="modal-title" className="h4 fw-bold mb-1 text-dark">
            Select Development Requester
          </h2>
          <p className="text-muted small mb-0 px-3">
            Select a Development Requester to test requester-specific ticket behavior. Choose a development requester to simulate the current requester context for Lab 2. This is for testing only and is not a login screen.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-4">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading requesters...</span>
            </div>
            <p className="mt-2 text-muted mb-0">Loading active development requesters...</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="alert alert-danger mb-3" role="alert">
            <p className="fw-bold mb-1">Failed to load requesters</p>
            <p className="mb-2 small">{error}</p>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={refreshRequesters}
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && requesters.length === 0 && (
          <div className="alert alert-warning text-center mb-3" role="alert">
            <p className="fw-bold mb-1">No Active Requesters Found</p>
            <p className="mb-0 small">No active Development Requesters are currently seeded in the database.</p>
          </div>
        )}

        {/* Form Selector State */}
        {!isLoading && !error && requesters.length > 0 && (
          <div className="mb-3">
            <label htmlFor="requesterSelect" className="form-label fw-semibold text-dark mb-1">
              Development Requester <span className="text-danger fw-bold">*</span>
            </label>
            <select
              id="requesterSelect"
              className="form-select form-select-lg mb-3"
              value={tempSelectedId}
              onChange={(e) => setTempSelectedId(Number(e.target.value))}
            >
              {requesters.map((r: DevelopmentRequester) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.email}) {r.department ? `— ${r.department}` : ""}
                </option>
              ))}
            </select>

            {/* Info Callout Notice (Section 8.1 Handout) */}
            <div className="alert alert-success py-2 px-3 mb-3 d-flex align-items-center gap-2 small">
              <span>ℹ️</span>
              <span>Only active development requesters are shown.</span>
            </div>

            {/* Lab 3 Lock Notice (Section 8.1 Handout) */}
            <div className="card bg-light border mb-3">
              <div className="card-body p-3 d-flex gap-3 align-items-start">
                <span className="fs-5">🔒</span>
                <div>
                  <strong className="d-block small text-dark mb-1">Authentication coming in Lab 3</strong>
                  <span className="small text-muted">
                    In Lab 3, this selection will be replaced with secure authentication so you can access the system with your own account.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer Actions */}
        <div className="d-flex justify-content-end gap-2 pt-3 border-top">
          {selectedRequester && (
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={closeSelectorModal}
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            className="btn-zen-primary d-flex align-items-center gap-2"
            disabled={isLoading || requesters.length === 0 || tempSelectedId === ""}
            onClick={handleContinue}
          >
            <span>Continue</span>
            <span>&rarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
};
