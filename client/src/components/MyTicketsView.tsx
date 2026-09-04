import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRequester } from "../context/RequesterContext.js";
import {
  fetchTickets,
  fetchActiveCategories,
  Category,
  TicketResponse,
  PaginationMeta,
  FetchTicketsParams,
} from "../api.js";

interface MyTicketsViewProps {
  onNavigateCreate: () => void;
  onSelectTicket?: (ticketId: number) => void;
}

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const STATUSES = ["NEW", "OPEN", "IN_PROGRESS", "PENDING", "RESOLVED", "CLOSED"];

export function MyTicketsView({ onNavigateCreate, onSelectTicket }: MyTicketsViewProps) {
  const { selectedRequester } = useRequester();

  const [tickets, setTickets] = useState<(TicketResponse & { attachmentCount?: number })[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(false);
  const categoryFetchInitiatedRef = useRef<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Search input state & Debounced search state
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  // Filter & Sort states
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState<number>(1);
  const [retryToken, setRetryToken] = useState<number>(0);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Extract category options from loaded tickets & load on demand safely
  useEffect(() => {
    if (tickets && tickets.length > 0) {
      setCategories((prev) => {
        const catMap = new Map<number, string>();
        prev.forEach((c) => catMap.set(c.id, c.name));
        tickets.forEach((t) => {
          if (t.category && t.category.id && t.category.name) {
            catMap.set(t.category.id, t.category.name);
          }
        });
        return Array.from(catMap.entries()).map(([id, name]) => ({ id, name }));
      });
    }
  }, [tickets]);

  const loadCategoriesOnDemand = useCallback(() => {
    if (categoryFetchInitiatedRef.current) return;
    categoryFetchInitiatedRef.current = true;
    setCategoriesLoading(true);
    setCategoriesError(null);

    fetchActiveCategories()
      .then((data) => {
        setCategories((prev) => {
          const catMap = new Map<number, string>();
          prev.forEach((c) => catMap.set(c.id, c.name));
          data.forEach((c) => catMap.set(c.id, c.name));
          return Array.from(catMap.entries()).map(([id, name]) => ({ id, name }));
        });
        setCategoriesLoading(false);
      })
      .catch((err: any) => {
        categoryFetchInitiatedRef.current = false; // Allow retry on failure
        setCategoriesError(err.message || "Failed to load request categories");
        setCategoriesLoading(false);
      });
  }, []);

  const hasActiveFilters =
    Boolean(search.trim()) ||
    selectedCategories.length > 0 ||
    selectedPriorities.length > 0 ||
    selectedStatuses.length > 0;

  // Main ticket loading effect with AbortController for race condition & stale response protection
  useEffect(() => {
    if (!selectedRequester) return;

    const controller = new AbortController();
    const currentRequesterId = selectedRequester.id;

    setLoading(true);
    setError(null);

    const params: FetchTicketsParams = {
      requesterId: currentRequesterId,
      search: debouncedSearch.trim() || undefined,
      categoryId: selectedCategories.length > 0 ? selectedCategories : undefined,
      requestedPriority: selectedPriorities.length > 0 ? selectedPriorities : undefined,
      status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
      sortBy,
      sortOrder,
      page,
      pageSize: 10,
    };

    fetchTickets(params, controller.signal)
      .then((res) => {
        if (!controller.signal.aborted) {
          setTickets(res.data);
          setPagination(res.pagination);
          setLoading(false);
        }
      })
      .catch((err: any) => {
        if (err?.name === "AbortError" || controller.signal.aborted) {
          return; // Suppress aborted stale requests
        }
        if (!controller.signal.aborted) {
          setError(err.message || "Failed to load tickets");
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [
    selectedRequester?.id,
    debouncedSearch,
    selectedCategories,
    selectedPriorities,
    selectedStatuses,
    sortBy,
    sortOrder,
    page,
    retryToken,
  ]);

  const handleClearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setSelectedCategories([]);
    setSelectedPriorities([]);
    setSelectedStatuses([]);
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  const handleMultiSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    setSelected: React.Dispatch<React.SetStateAction<any[]>>,
    isNumeric: boolean
  ) => {
    const options = Array.from(e.target.selectedOptions).map((opt) => opt.value).filter(Boolean);
    if (isNumeric) {
      setSelected(options.map(Number));
    } else {
      setSelected(options);
    }
    setPage(1);
  };

  function getStatusBadgeClass(ticketStatus: string) {
    switch (ticketStatus.toUpperCase()) {
      case "NEW":
        return "badge bg-primary text-white";
      case "OPEN":
        return "badge bg-warning text-dark";
      case "IN_PROGRESS":
        return "badge bg-info text-dark";
      case "PENDING":
        return "badge bg-secondary text-white";
      case "RESOLVED":
        return "badge bg-success text-white";
      case "CLOSED":
        return "badge bg-dark text-white";
      default:
        return "badge bg-secondary text-white";
    }
  }

  function getPriorityBadgeClass(priority: string) {
    switch (priority.toUpperCase()) {
      case "LOW":
        return "badge bg-light text-dark border";
      case "MEDIUM":
        return "badge bg-info text-dark";
      case "HIGH":
        return "badge bg-warning text-dark";
      case "URGENT":
        return "badge bg-danger text-white";
      default:
        return "badge bg-secondary text-white";
    }
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  }

  if (!selectedRequester) {
    return (
      <div className="alert alert-info shadow-sm" data-testid="no-requester-alert">
        <h5 className="alert-heading fw-bold mb-2">Requester Context Required</h5>
        <p className="mb-0">
          Please select a Development Requester identity from the top header selector to view your owned support tickets.
        </p>
      </div>
    );
  }

  return (
    <div className="my-tickets-container">
      {/* Header Bar */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="h4 fw-bold text-dark mb-1">
            Welcome, {selectedRequester.name} 👋
          </h2>
          <p className="text-muted small mb-0">
            📋 <strong>My Tickets</strong> — View and track support tickets created by <strong>{selectedRequester.name}</strong>
          </p>
        </div>
        <button
          type="button"
          className="btn-zen-primary d-inline-flex align-items-center gap-2"
          onClick={onNavigateCreate}
        >
          <span>➕</span> Create Ticket
        </button>
      </div>

      {/* Category Load Error Notification */}
      {categoriesError && (
        <div className="alert alert-warning py-2 px-3 mb-3 d-flex justify-content-between align-items-center small" data-testid="category-load-error">
          <span>⚠️ {categoriesError}</span>
          <button
            type="button"
            className="btn btn-sm btn-outline-dark py-0"
            onClick={loadCategoriesOnDemand}
          >
            Retry Categories
          </button>
        </div>
      )}

      {/* Search & Filter Controls Bar */}
      <div className="card shadow-sm mb-4">
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            {/* Search Input */}
            <div className="col-12 col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-white text-muted">🔍</span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search Ticket No or Summary..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  data-testid="search-input"
                />
              </div>
            </div>

            {/* Category Filter (Multi-Select) */}
            <div className="col-6 col-md-2">
              <select
                className="form-select"
                value={selectedCategories.length === 1 ? String(selectedCategories[0]) : ""}
                onFocus={loadCategoriesOnDemand}
                onClick={loadCategoriesOnDemand}
                onChange={(e) => handleMultiSelectChange(e, setSelectedCategories, true)}
                data-testid="category-filter"
                title="Filter by Category (Select option)"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter (Multi-Select) */}
            <div className="col-6 col-md-2">
              <select
                className="form-select"
                value={selectedPriorities.length === 1 ? selectedPriorities[0] : ""}
                onChange={(e) => handleMultiSelectChange(e, setSelectedPriorities, false)}
                data-testid="priority-filter"
                title="Filter by Priority"
              >
                <option value="">All Priorities</option>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter (Multi-Select) */}
            <div className="col-6 col-md-2">
              <select
                className="form-select"
                value={selectedStatuses.length === 1 ? selectedStatuses[0] : ""}
                onChange={(e) => handleMultiSelectChange(e, setSelectedStatuses, false)}
                data-testid="status-filter"
                title="Filter by Status"
              >
                <option value="">All Statuses</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort & Clear Filters */}
            <div className="col-6 col-md-2 d-flex gap-2">
              <select
                className="form-select"
                value={`${sortBy}:${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split(":");
                  setSortBy(field);
                  setSortOrder(order as "asc" | "desc");
                  setPage(1);
                }}
                data-testid="sort-filter"
              >
                <option value="createdAt:desc">Newest First</option>
                <option value="createdAt:asc">Oldest First</option>
                <option value="ticketNumber:desc">Ticket No (Desc)</option>
                <option value="ticketNumber:asc">Ticket No (Asc)</option>
              </select>

              {hasActiveFilters && (
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={handleClearFilters}
                  title="Clear Filters"
                  data-testid="clear-filters-btn"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content States */}
      {loading ? (
        <div className="card shadow-sm text-center py-5" data-testid="tickets-loading">
          <div className="card-body">
            <div className="spinner-border text-success mb-3" role="status">
              <span className="visually-hidden">Loading tickets...</span>
            </div>
            <p className="text-muted mb-0">Loading your tickets...</p>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger shadow-sm d-flex justify-content-between align-items-center mb-4" data-testid="tickets-error">
          <div>
            <strong>Error:</strong> {error}
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={() => setRetryToken((t) => t + 1)}
            data-testid="retry-tickets-btn"
          >
            🔄 Retry
          </button>
        </div>
      ) : pagination && pagination.totalItems === 0 ? (
        hasActiveFilters ? (
          /* No Results State */
          <div className="card shadow-sm text-center py-5" data-testid="no-results-state">
            <div className="card-body">
              <div className="fs-1 text-muted mb-2">🔍</div>
              <h4 className="h5 fw-bold text-dark mb-1">No Matching Tickets</h4>
              <p className="text-muted mb-3">
                No tickets match your search or filter criteria. Try adjusting your filters.
              </p>
              <button
                type="button"
                className="btn-zen-secondary"
                onClick={handleClearFilters}
                data-testid="no-results-clear-btn"
              >
                Clear Search & Filters
              </button>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="card shadow-sm text-center py-5" data-testid="empty-state">
            <div className="card-body">
              <div className="fs-1 text-muted mb-2">📦</div>
              <h4 className="h5 fw-bold text-dark mb-1">No Tickets Found</h4>
              <p className="text-muted mb-3">
                You haven't submitted any IT support tickets yet.
              </p>
              <button
                type="button"
                className="btn-zen-primary"
                onClick={onNavigateCreate}
                data-testid="empty-state-create-btn"
              >
                ➕ Create Your First Ticket
              </button>
            </div>
          </div>
        )
      ) : (
        /* Data Display */
        <>
          {/* Desktop Table View */}
          <div className="card shadow-sm mb-4 d-none d-md-block" data-testid="desktop-tickets-table">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th scope="col" style={{ width: "160px" }}>Ticket No</th>
                    <th scope="col" style={{ width: "130px" }}>Date</th>
                    <th scope="col">Summary</th>
                    <th scope="col" style={{ width: "140px" }}>Category</th>
                    <th scope="col" style={{ width: "110px" }}>Priority</th>
                    <th scope="col" style={{ width: "110px" }}>Status</th>
                    <th scope="col" className="text-center" style={{ width: "90px" }}>Files</th>
                    {onSelectTicket && <th scope="col" className="text-end" style={{ width: "100px" }}>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t) => (
                    <tr key={t.id} data-testid={`ticket-row-${t.id}`}>
                      <td>
                        <strong className="text-success">{t.ticketNumber}</strong>
                      </td>
                      <td className="text-muted small">{formatDate(t.createdAt)}</td>
                      <td className="fw-medium text-dark">{t.summary}</td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {t.category?.name || "-"}
                        </span>
                      </td>
                      <td>
                        <span className={getPriorityBadgeClass(t.requestedPriority)}>
                          {t.requestedPriority}
                        </span>
                      </td>
                      <td>
                        <span className={getStatusBadgeClass(t.status)}>{t.status}</span>
                      </td>
                      <td className="text-center text-muted small">
                        📎 {t.attachmentCount ?? 0}
                      </td>
                      {onSelectTicket && (
                        <td className="text-end">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-success"
                            onClick={() => onSelectTicket(t.id)}
                          >
                            View
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Stacked Cards View */}
          <div className="d-block d-md-none mb-4" data-testid="mobile-tickets-cards">
            {tickets.map((t) => (
              <div className="card shadow-sm mb-3" key={t.id} data-testid={`ticket-card-${t.id}`}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <strong className="text-success h6 mb-0">{t.ticketNumber}</strong>
                    <span className={getStatusBadgeClass(t.status)}>{t.status}</span>
                  </div>
                  <h6 className="card-title fw-bold text-dark mb-2">{t.summary}</h6>
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <span className="badge bg-light text-dark border">
                      {t.category?.name || "Category"}
                    </span>
                    <span className={getPriorityBadgeClass(t.requestedPriority)}>
                      {t.requestedPriority}
                    </span>
                    <span className="text-muted small align-self-center">
                      📎 {t.attachmentCount ?? 0} files
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                    <span className="text-muted small">{formatDate(t.createdAt)}</span>
                    {onSelectTicket && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-success"
                        onClick={() => onSelectTicket(t.id)}
                      >
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 p-2">
              <span className="text-muted small" data-testid="pagination-info">
                Showing{" "}
                <strong>
                  {(pagination.currentPage - 1) * pagination.pageSize + 1}
                </strong>{" "}
                to{" "}
                <strong>
                  {Math.min(
                    pagination.currentPage * pagination.pageSize,
                    pagination.totalItems
                  )}
                </strong>{" "}
                of <strong>{pagination.totalItems}</strong> tickets
              </span>

              <nav aria-label="Ticket pagination">
                <ul className="pagination pagination-sm mb-0">
                  <li className={`page-item ${pagination.currentPage <= 1 ? "disabled" : ""}`}>
                    <button
                      className="page-item-btn btn btn-sm btn-outline-secondary me-1"
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      disabled={pagination.currentPage <= 1}
                      data-testid="prev-page-btn"
                    >
                      &laquo; Previous
                    </button>
                  </li>

                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pNum) => (
                    <li key={pNum} className="page-item me-1">
                      <button
                        className={`btn btn-sm ${
                          pNum === pagination.currentPage ? "btn-success" : "btn-outline-secondary"
                        }`}
                        onClick={() => setPage(pNum)}
                        data-testid={`page-btn-${pNum}`}
                      >
                        {pNum}
                      </button>
                    </li>
                  ))}

                  <li
                    className={`page-item ${
                      pagination.currentPage >= pagination.totalPages ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-item-btn btn btn-sm btn-outline-secondary"
                      onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
                      disabled={pagination.currentPage >= pagination.totalPages}
                      data-testid="next-page-btn"
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
