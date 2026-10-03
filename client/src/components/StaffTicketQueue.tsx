import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  fetchStaffTickets,
  fetchActiveCategories,
  Category,
  StaffTicketResponse,
  FetchStaffTicketsParams,
} from "../api.js";
import { getPaginationItems } from "../utils/pagination.js";

interface StaffTicketQueueProps {
  onSelectTicket?: (ticketId: number) => void;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  NEW: { bg: "#DBEAFE", text: "#1E40AF", label: "New" },
  OPEN: { bg: "#DCFCE7", text: "#15803D", label: "Open" },
  IN_PROGRESS: { bg: "#FEF3C7", text: "#B45309", label: "In Progress" },
  WAITING_FOR_REQUESTER: { bg: "#F3E8FF", text: "#6B21A8", label: "Waiting for Requester" },
  RESOLVED: { bg: "#D1FAE5", text: "#065F46", label: "Resolved" },
  CLOSED: { bg: "#E2E8F0", text: "#334155", label: "Closed" },
  REOPENED: { bg: "#FFEDD5", text: "#C2410C", label: "Reopened" },
  CANCELLED: { bg: "#FEE2E2", text: "#B91C1C", label: "Cancelled" },
};

const PRIORITY_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  LOW: { bg: "#F3F4F6", text: "#4B5563", label: "Low" },
  MEDIUM: { bg: "#E0F2FE", text: "#0284C7", label: "Medium" },
  HIGH: { bg: "#FEF3C7", text: "#D97706", label: "High" },
  URGENT: { bg: "#FEE2E2", text: "#DC2626", label: "Urgent" },
};

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

export function StaffTicketQueue({ onSelectTicket }: StaffTicketQueueProps) {
  const [tickets, setTickets] = useState<StaffTicketResponse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search input & debounced search
  const [searchInput, setSearchInput] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedPriority, setSelectedPriority] = useState<string>("");
  const [selectedOwner, setSelectedOwner] = useState<string>("");

  // Sorting & Pagination
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [paginationMeta, setPaginationMeta] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }>({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const [retryToken, setRetryToken] = useState<number>(0);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1); // Reset to page 1 on new search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch active categories on mount
  useEffect(() => {
    fetchActiveCategories()
      .then((data) => setCategories(data))
      .catch((err) => console.error("Failed to load active categories:", err));
  }, []);

  // Fetch ticket queue
  const loadQueue = useCallback(
    (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);

      const params: FetchStaffTicketsParams = {
        page,
        limit: pageSize,
        sortBy,
        sortDir,
      };

      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }
      if (selectedCategory) {
        params.category = Number(selectedCategory);
      }
      if (selectedStatus) {
        params.status = selectedStatus;
      }
      if (selectedPriority) {
        params.itPriority = selectedPriority;
      }
      if (selectedOwner) {
        params.ownerId = selectedOwner;
      }

      fetchStaffTickets(params, signal)
        .then((res) => {
          if (!signal?.aborted) {
            setTickets(res.data);
            setPaginationMeta({
              page: res.pagination.page,
              limit: res.pagination.limit,
              total: res.pagination.total,
              totalPages: res.pagination.totalPages,
            });
            setLoading(false);
          }
        })
        .catch((err: any) => {
          if (err?.name === "AbortError" || signal?.aborted) return;
          setError(err.message || "Failed to load ticket queue");
          setLoading(false);
        });
    },
    [page, pageSize, sortBy, sortDir, debouncedSearch, selectedCategory, selectedStatus, selectedPriority, selectedOwner]
  );

  useEffect(() => {
    const controller = new AbortController();
    loadQueue(controller.signal);
    return () => {
      controller.abort();
    };
  }, [loadQueue, retryToken]);

  const handleClearFilters = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setSelectedCategory("");
    setSelectedStatus("");
    setSelectedPriority("");
    setSelectedOwner("");
    setSortBy("createdAt");
    setSortDir("desc");
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    searchInput || selectedCategory || selectedStatus || selectedPriority || selectedOwner
  );

  const renderStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status] || { bg: "#E2E8F0", text: "#334155", label: status };
    return (
      <span
        className="badge fw-medium px-2 py-1"
        style={{ backgroundColor: config.bg, color: config.text, fontSize: "0.75rem" }}
      >
        {config.label}
      </span>
    );
  };

  const renderPriorityBadge = (priority: string) => {
    const config = PRIORITY_CONFIG[priority] || { bg: "#F3F4F6", text: "#4B5563", label: priority };
    return (
      <span
        className="badge fw-medium px-2 py-1"
        style={{ backgroundColor: config.bg, color: config.text, fontSize: "0.75rem" }}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className="staff-ticket-queue mb-4" data-testid="staff-ticket-queue-view">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="h4 fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
            <span>IT Staff Ticket Queue</span>
          </h2>
          <p className="text-muted small mb-0">
            Triage, monitor, and assign IT support requests across all departments.
          </p>
        </div>

        {paginationMeta.total > 0 && (
          <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-2 fs-6 fw-semibold">
            {paginationMeta.total} Total {paginationMeta.total === 1 ? "Ticket" : "Tickets"}
          </span>
        )}
      </div>

      {/* Control Bar: Search & Multi-Attribute Filters Card */}
      <div className="card shadow-sm mb-4 border-0" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="card-body p-3">
          {/* Row 1: Search Input */}
          <div className="row g-2 mb-3">
            <div className="col-12">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-end-0">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
                <input
                  type="text"
                  className="form-control form-control-sm border-start-0"
                  placeholder="Search by ticket number, summary..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  data-testid="queue-search-input"
                />
                {searchInput && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setSearchInput("")}
                    title="Clear search"
                  >
                    &times;
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Row 2: Filters and Sorting Dropdowns */}
          <div className="row g-2 align-items-center">
            {/* Category Filter */}
            <div className="col-6 col-md-3">
              <label htmlFor="queueCategoryFilter" className="form-label small text-muted mb-1 fw-semibold">
                Category
              </label>
              <select
                id="queueCategoryFilter"
                className="form-select form-select-sm"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                data-testid="queue-category-filter"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="col-6 col-md-2">
              <label htmlFor="queueStatusFilter" className="form-label small text-muted mb-1 fw-semibold">
                Status
              </label>
              <select
                id="queueStatusFilter"
                className="form-select form-select-sm"
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
                data-testid="queue-status-filter"
              >
                <option value="">All Statuses</option>
                <option value="NEW">New</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="WAITING_FOR_REQUESTER">Waiting for Requester</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
                <option value="REOPENED">Reopened</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* IT Priority Filter */}
            <div className="col-6 col-md-2">
              <label htmlFor="queuePriorityFilter" className="form-label small text-muted mb-1 fw-semibold">
                IT Priority
              </label>
              <select
                id="queuePriorityFilter"
                className="form-select form-select-sm"
                value={selectedPriority}
                onChange={(e) => {
                  setSelectedPriority(e.target.value);
                  setPage(1);
                }}
                data-testid="queue-priority-filter"
              >
                <option value="">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            {/* Owner Filter */}
            <div className="col-6 col-md-2">
              <label htmlFor="queueOwnerFilter" className="form-label small text-muted mb-1 fw-semibold">
                Owner
              </label>
              <select
                id="queueOwnerFilter"
                className="form-select form-select-sm"
                value={selectedOwner}
                onChange={(e) => {
                  setSelectedOwner(e.target.value);
                  setPage(1);
                }}
                data-testid="queue-owner-filter"
              >
                <option value="">All Owners</option>
                <option value="unassigned">Unassigned</option>
                <option value="me">Assigned to Me</option>
              </select>
            </div>

            {/* Sort Controls */}
            <div className="col-12 col-md-3">
              <label htmlFor="queueSortBy" className="form-label small text-muted mb-1 fw-semibold">
                Sort By
              </label>
              <div className="d-flex gap-1">
                <select
                  id="queueSortBy"
                  className="form-select form-select-sm"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  data-testid="queue-sort-by"
                >
                  <option value="createdAt">Date Created</option>
                  <option value="itPriority">IT Priority</option>
                  <option value="status">Status</option>
                  <option value="ticketNumber">Ticket No.</option>
                </select>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary px-2 d-flex align-items-center"
                  onClick={() => {
                    setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
                    setPage(1);
                  }}
                  title={sortDir === "asc" ? "Sort Ascending" : "Sort Descending"}
                  data-testid="queue-sort-dir"
                >
                  {sortDir === "asc" ? "▲" : "▼"}
                </button>
                {hasActiveFilters && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={handleClearFilters}
                    data-testid="queue-clear-filters-btn"
                    title="Reset all filters"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="card shadow-sm py-5 text-center border-0" data-testid="queue-loading">
          <div className="card-body">
            <div className="spinner-border text-success mb-3" role="status">
              <span className="visually-hidden">Loading ticket queue...</span>
            </div>
            <p className="text-muted small mb-0">Retrieving operational tickets queue...</p>
          </div>
        </div>
      ) : error ? (
        /* Error State */
        <div className="alert alert-danger shadow-sm d-flex justify-content-between align-items-center mb-4" data-testid="queue-error">
          <div>
            <strong>Error loading queue:</strong> {error}
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={() => setRetryToken((t) => t + 1)}
            data-testid="queue-retry-btn"
          >
            Retry Connection
          </button>
        </div>
      ) : tickets.length === 0 ? (
        /* Empty / No Results State */
        <div className="card shadow-sm text-center py-5 border-0" data-testid="queue-empty-state">
          <div className="card-body py-4">
            <div className="d-inline-flex align-items-center justify-content-center p-3 rounded-circle bg-light text-muted mb-3">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h3 className="h5 fw-bold text-dark mb-1">No Tickets Found</h3>
            <p className="text-muted small mb-3">
              {hasActiveFilters
                ? "No support tickets match the current search or filter criteria."
                : "There are currently no tickets in the operational queue."}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                className="btn-zen-secondary btn-sm"
                onClick={handleClearFilters}
                data-testid="empty-clear-filters-btn"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Queue Data Views */
        <>
          {/* Scoped Zen Green Table Row Hover Style */}
          <style>{`
            .staff-queue-table tbody tr {
              transition: background-color 0.15s ease-in-out;
            }
            .staff-queue-table tbody tr:hover,
            .staff-queue-table tbody tr:hover > * {
              background-color: #EAF6EF !important;
              --bs-table-hover-bg: #EAF6EF !important;
              --bs-table-bg-state: #EAF6EF !important;
            }
          `}</style>

          {/* Desktop Data Table (>= 768px) */}
          <div className="card shadow-sm border-0 d-none d-md-block mb-3" style={{ overflow: "hidden" }}>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 staff-queue-table" data-testid="queue-table">
                <thead className="table-light small">
                  <tr>
                    <th style={{ width: "13%" }}>Ticket No</th>
                    <th style={{ width: "11%" }}>Date</th>
                    <th style={{ width: "22%" }}>Summary</th>
                    <th style={{ width: "11%" }}>Category</th>
                    <th style={{ width: "9%" }}>Req. Priority</th>
                    <th style={{ width: "9%" }}>IT Priority</th>
                    <th style={{ width: "10%" }}>Status</th>
                    <th style={{ width: "9%" }}>Owner</th>
                    <th style={{ width: "6%" }} className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t) => (
                    <tr
                      key={t.id}
                      data-testid={`queue-row-${t.id}`}
                      style={{ cursor: "pointer" }}
                      onClick={() => onSelectTicket?.(t.id)}
                    >
                      <td>
                        <span className="fw-bold text-dark d-block">{t.ticketNumber}</span>
                        {t.isResolutionIndicated && (
                          <span
                            className="badge bg-info text-dark mt-1"
                            style={{ fontSize: "0.65rem" }}
                            data-testid={`queue-resolution-badge-${t.id}`}
                          >
                            Resolution Indicated
                          </span>
                        )}
                      </td>
                      <td className="small text-muted">{formatDate(t.createdAt)}</td>
                      <td>
                        <div className="fw-medium text-dark text-truncate" style={{ maxWidth: "240px" }} title={t.summary}>
                          {t.summary}
                        </div>
                        <span className="small text-muted">
                          by {t.requester?.fullName || t.requester?.email || "Requester"}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border small fw-normal">
                          {t.category?.name || "-"}
                        </span>
                      </td>
                      <td>
                        <div data-testid={`queue-req-priority-badge-${t.id}`}>
                          {renderPriorityBadge(t.requestedPriority)}
                        </div>
                      </td>
                      <td>
                        <div data-testid={`queue-priority-badge-${t.id}`}>
                          {renderPriorityBadge(t.itPriority)}
                        </div>
                      </td>
                      <td>
                        <div data-testid={`queue-status-badge-${t.id}`}>
                          {renderStatusBadge(t.status)}
                        </div>
                      </td>
                      <td>
                        {t.owner ? (
                          <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 small">
                            {t.owner.fullName || t.owner.email}
                          </span>
                        ) : (
                          <span className="badge bg-light text-muted border small">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="text-end" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-success d-inline-flex align-items-center gap-1"
                          onClick={() => onSelectTicket?.(t.id)}
                          data-testid={`view-detail-btn-${t.id}`}
                        >
                          <span>View</span>
                          <span>&rarr;</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View (< 768px) */}
          <div className="d-md-none mb-3">
            {tickets.map((t) => (
              <div
                key={t.id}
                className="card shadow-sm mb-3 border-0"
                data-testid={`queue-card-${t.id}`}
                onClick={() => onSelectTicket?.(t.id)}
                style={{ cursor: "pointer" }}
              >
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold text-dark">{t.ticketNumber}</span>
                    <div data-testid={`queue-status-badge-${t.id}`}>
                      {renderStatusBadge(t.status)}
                    </div>
                  </div>

                  <h4 className="h6 fw-semibold text-dark mb-2">{t.summary}</h4>

                  <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
                    <span className="badge bg-light text-dark border small fw-normal">
                      {t.category?.name}
                    </span>
                    <div data-testid={`queue-req-priority-badge-mobile-${t.id}`} className="d-inline-flex align-items-center gap-1">
                      <span className="text-muted" style={{ fontSize: "0.7rem" }}>Req:</span>
                      {renderPriorityBadge(t.requestedPriority)}
                    </div>
                    <div data-testid={`queue-priority-badge-${t.id}`} className="d-inline-flex align-items-center gap-1">
                      <span className="text-muted" style={{ fontSize: "0.7rem" }}>IT:</span>
                      {renderPriorityBadge(t.itPriority)}
                    </div>
                    {t.isResolutionIndicated && (
                      <span className="badge bg-info text-dark" style={{ fontSize: "0.7rem" }}>
                        Resolution Indicated
                      </span>
                    )}
                  </div>

                  <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                    <div className="small text-muted">
                      Owner: <strong>{t.ticketOwner || "Unassigned"}</strong>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-success"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTicket?.(t.id);
                      }}
                      data-testid={`view-detail-mobile-btn-${t.id}`}
                    >
                      View &rarr;
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {paginationMeta.totalPages > 1 && (
            <div
              className="d-flex justify-content-between align-items-center flex-wrap gap-2 pt-2"
              data-testid="queue-pagination"
            >
              <div className="text-muted small">
                Showing page <strong>{paginationMeta.page}</strong> of{" "}
                <strong>{paginationMeta.totalPages}</strong> ({paginationMeta.total} total)
              </div>

              <nav aria-label="Queue navigation">
                <ul className="pagination pagination-sm mb-0">
                  <li className={`page-item ${paginationMeta.page <= 1 ? "disabled" : ""}`}>
                    <button
                      type="button"
                      className="page-link"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={paginationMeta.page <= 1}
                      data-testid="queue-prev-page"
                    >
                      &laquo; Prev
                    </button>
                  </li>

                  {getPaginationItems(paginationMeta.page, paginationMeta.totalPages).map((item, idx) => {
                    if (item === "...") {
                      return (
                        <li key={`ellipsis-${idx}`} className="page-item disabled">
                          <span className="page-link text-muted border-0">&hellip;</span>
                        </li>
                      );
                    }
                    const p = item as number;
                    return (
                      <li
                        key={p}
                        className={`page-item ${p === paginationMeta.page ? "active" : ""}`}
                      >
                        <button
                          type="button"
                          className="page-link"
                          onClick={() => setPage(p)}
                          data-testid={`queue-page-${p}`}
                        >
                          {p}
                        </button>
                      </li>
                    );
                  })}

                  <li className={`page-item ${paginationMeta.page >= paginationMeta.totalPages ? "disabled" : ""}`}>
                    <button
                      type="button"
                      className="page-link"
                      onClick={() => setPage((p) => Math.min(paginationMeta.totalPages, p + 1))}
                      disabled={paginationMeta.page >= paginationMeta.totalPages}
                      data-testid="queue-next-page"
                    >
                      Next &raquo;
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
}
