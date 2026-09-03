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
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
          <h2 id="modal-title" className="h5 fw-bold mb-0 text-success" style={{ color: "var(--primary-green)" }}>
            Select Development Requester
          </h2>
          {selectedRequester && (
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={closeSelectorModal}
            />
          )}
        </div>

        {/* Explanatory Callout Notice */}
        <div className="notice-box mb-4">
          <div className="fw-semibold mb-1">
            ℹ️ Testing Context Only
          </div>
          <div>
            Select a Development Requester to test requester-specific ticket behavior. This is not a login screen. Authentication and role-based access will be introduced in Lab 3.
          </div>
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
          <div className="alert alert-danger mb-4" role="alert">
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
          <div className="alert alert-warning text-center mb-4" role="alert">
            <p className="fw-bold mb-1">No Active Requesters Found</p>
            <p className="mb-0 small">No active Development Requesters are currently seeded in the database.</p>
          </div>
        )}

        {/* Form Selector State */}
        {!isLoading && !error && requesters.length > 0 && (
          <div className="mb-4">
            <label htmlFor="requesterSelect" className="form-label fw-semibold">
              Development Requester <span className="text-danger">*</span>
            </label>
            <select
              id="requesterSelect"
              className="form-select form-select-lg"
              value={tempSelectedId}
              onChange={(e) => setTempSelectedId(Number(e.target.value))}
            >
              {requesters.map((r: DevelopmentRequester) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.email}) {r.department ? `— ${r.department}` : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Modal Actions */}
        <div className="d-flex justify-content-end gap-2 pt-2 border-top">
          {selectedRequester && (
            <button
              type="button"
              className="btn-zen-secondary"
              onClick={closeSelectorModal}
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            className="btn-zen-primary"
            disabled={isLoading || requesters.length === 0 || tempSelectedId === ""}
            onClick={handleContinue}
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
};
