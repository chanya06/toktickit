import React from "react";
import { useRequester } from "../context/RequesterContext.js";

export const Header: React.FC = () => {
  const { selectedRequester, openSelectorModal } = useRequester();

  return (
    <header className="app-header py-2 px-3 mb-4">
      <div className="container-fluid d-flex align-items-center justify-content-between">
        {/* Application Brand Logo & Navigation */}
        <div className="d-flex align-items-center gap-4">
          <a href="/" className="fs-4 fw-bold text-white d-flex align-items-center gap-2">
            <span>🟢 TokTickIT</span>
          </a>
          <nav className="d-flex gap-3">
            <a href="#" className="nav-link text-white fw-medium active">
              📋 My Tickets
            </a>
            <a href="#" className="nav-link text-white fw-medium">
              ➕ Create Ticket
            </a>
          </nav>
        </div>

        {/* Selected Requester Identity Pill & Switch Action */}
        <div className="d-flex align-items-center gap-2">
          {selectedRequester ? (
            <div className="requester-badge">
              <span>👤 {selectedRequester.name}</span>
              {selectedRequester.department && (
                <span className="badge bg-light text-dark small">{selectedRequester.department}</span>
              )}
              <button
                type="button"
                className="btn btn-sm text-white text-decoration-underline p-0 ms-2"
                onClick={openSelectorModal}
                title="Switch Development Requester identity"
              >
                Switch
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-sm btn-outline-light"
              onClick={openSelectorModal}
            >
              Select Requester Context
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
