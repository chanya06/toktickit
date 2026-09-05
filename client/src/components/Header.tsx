import React from "react";
import { useRequester } from "../context/RequesterContext.js";

interface HeaderProps {
  activeTab: "my-tickets" | "create-ticket";
  onSelectTab: (tab: "my-tickets" | "create-ticket") => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onSelectTab }) => {
  const { selectedRequester, openSelectorModal } = useRequester();

  return (
    <header className="app-header py-2 px-3 mb-4 shadow-sm" style={{ backgroundColor: "var(--primary-green, #006B3C)" }}>
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="tracking-tight">TokTickIT</span>
          </a>
          <nav className="d-flex gap-2">
            <button
              type="button"
              className={`btn btn-link text-white text-decoration-none fw-medium d-flex align-items-center gap-1 ${
                activeTab === "my-tickets" ? "opacity-100 fw-bold border-bottom border-2 border-white pb-1" : "opacity-75"
              }`}
              onClick={() => onSelectTab("my-tickets")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              <span>My Tickets</span>
            </button>
            <button
              type="button"
              className={`btn btn-link text-white text-decoration-none fw-medium d-flex align-items-center gap-1 ${
                activeTab === "create-ticket" ? "opacity-100 fw-bold border-bottom border-2 border-white pb-1" : "opacity-75"
              }`}
              onClick={() => onSelectTab("create-ticket")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              <span>Create Ticket</span>
            </button>
          </nav>
        </div>

        {/* Selected Requester Identity Pill & Switch Action */}
        <div className="d-flex align-items-center gap-2">
          {selectedRequester ? (
            <div className="requester-badge bg-white bg-opacity-10 border border-white border-opacity-25 rounded-pill px-3 py-1 text-white d-flex align-items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className="fw-medium">{selectedRequester.name}</span>
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
              className="btn btn-sm btn-outline-light d-flex align-items-center gap-1"
              onClick={openSelectorModal}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Select Requester Context</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

