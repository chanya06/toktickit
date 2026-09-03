import React from "react";
import { useRequester } from "../context/RequesterContext.js";

interface HeaderProps {
  activeTab: "my-tickets" | "create-ticket";
  onSelectTab: (tab: "my-tickets" | "create-ticket") => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onSelectTab }) => {
  const { selectedRequester, openSelectorModal } = useRequester();

  return (
    <header className="app-header py-2 px-3 mb-4">
      <div className="container-fluid d-flex align-items-center justify-content-between">
        {/* Application Brand Logo & Navigation */}
        <div className="d-flex align-items-center gap-4">
          <a
            href="#"
            className="fs-4 fw-bold text-white d-flex align-items-center gap-2 text-decoration-none"
            onClick={(e) => {
              e.preventDefault();
              onSelectTab("my-tickets");
            }}
          >
            <span>🟢 TokTickIT</span>
          </a>
          <nav className="d-flex gap-2">
            <button
              type="button"
              className={`btn btn-link text-white text-decoration-none fw-medium ${
                activeTab === "my-tickets" ? "opacity-100 text-decoration-underline" : "opacity-75"
              }`}
              onClick={() => onSelectTab("my-tickets")}
            >
              📋 My Tickets
            </button>
            <button
              type="button"
              className={`btn btn-link text-white text-decoration-none fw-medium ${
                activeTab === "create-ticket" ? "opacity-100 text-decoration-underline" : "opacity-75"
              }`}
              onClick={() => onSelectTab("create-ticket")}
            >
              ➕ Create Ticket
            </button>
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
                title="Change Development Requester identity"
              >
                Change Requester
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
