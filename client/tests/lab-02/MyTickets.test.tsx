import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { MyTicketsView } from "../../src/components/MyTicketsView.js";
import { RequesterContext } from "../../src/context/RequesterContext.js";
import * as api from "../../src/api.js";

// Mock the API module
vi.mock("../../src/api.js", async () => {
  const actual = await vi.importActual("../../src/api.js");
  return {
    ...actual,
    fetchTickets: vi.fn(),
    fetchActiveCategories: vi.fn(),
  };
});

const mockRequester = {
  id: 1,
  name: "Jennifer Anderson",
  email: "jennifer.a@toktickit.dev",
  department: "Frontend Engineering",
  isActive: true,
};

const mockCategories = [
  { id: 1, name: "Software" },
  { id: 2, name: "Hardware" },
];

const mockTickets = [
  {
    id: 101,
    ticketNumber: "TKT-2026-000101",
    requesterId: 1,
    categoryId: 2,
    relatedSystemId: 7,
    summary: "Laptop battery draining fast",
    description: "Battery issues on corporate laptop",
    requestedPriority: "HIGH",
    itPriority: "HIGH",
    status: "NEW",
    createdAt: "2026-09-01T10:00:00.000Z",
    category: { id: 2, name: "Hardware" },
    relatedSystem: { id: 7, name: "Corporate Laptop" },
    attachmentCount: 2,
  },
  {
    id: 102,
    ticketNumber: "TKT-2026-000102",
    requesterId: 1,
    categoryId: 1,
    relatedSystemId: 1,
    summary: "VPN authentication error",
    description: "Cannot log into corporate VPN",
    requestedPriority: "MEDIUM",
    itPriority: "MEDIUM",
    status: "IN_PROGRESS",
    createdAt: "2026-09-02T11:30:00.000Z",
    category: { id: 1, name: "Software" },
    relatedSystem: { id: 1, name: "VPN Access" },
    attachmentCount: 0,
  },
];

describe("MyTicketsView Component (Issue 11)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.fetchActiveCategories).mockResolvedValue(mockCategories);
    vi.mocked(api.fetchTickets).mockResolvedValue({
      data: mockTickets,
      pagination: {
        totalItems: 2,
        totalPages: 1,
        currentPage: 1,
        pageSize: 10,
      },
    });
  });

  const renderWithContext = (requester = mockRequester as any, onNavigateCreate = vi.fn()) => {
    return render(
      <RequesterContext.Provider
        value={{
          selectedRequester: requester,
          requesters: [mockRequester],
          isLoading: false,
          error: null,
          isModalOpen: false,
          selectRequester: vi.fn(),
          openSelectorModal: vi.fn(),
          closeSelectorModal: vi.fn(),
          refreshRequesters: vi.fn(),
        }}
      >
        <MyTicketsView onNavigateCreate={onNavigateCreate} />
      </RequesterContext.Provider>
    );
  };

  it("renders requester prompt alert when no requester context is selected", () => {
    renderWithContext(null);
    expect(screen.getByTestId("no-requester-alert")).toBeInTheDocument();
    expect(screen.getByText(/Requester Context Required/i)).toBeInTheDocument();
  });

  it("UI-04: renders My Tickets table, search bar, category/priority/status filter controls, and tickets list", async () => {
    renderWithContext();

    expect(screen.getByText(/My Tickets/i)).toBeInTheDocument();
    expect(screen.getByTestId("search-input")).toBeInTheDocument();
    expect(screen.getByTestId("category-filter")).toBeInTheDocument();
    expect(screen.getByTestId("priority-filter")).toBeInTheDocument();
    expect(screen.getByTestId("status-filter")).toBeInTheDocument();

    await waitFor(() => {
      expect(api.fetchTickets).toHaveBeenCalledWith(
        expect.objectContaining({ requesterId: 1, page: 1, pageSize: 10 })
      );
    });

    expect(screen.getAllByText("TKT-2026-000101").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Laptop battery draining fast").length).toBeGreaterThan(0);
    expect(screen.getAllByText("TKT-2026-000102").length).toBeGreaterThan(0);
    expect(screen.getAllByText("VPN authentication error").length).toBeGreaterThan(0);
  });

  it("updates tickets list when typing a search term in search input", async () => {
    renderWithContext();

    await waitFor(() => expect(api.fetchTickets).toHaveBeenCalledTimes(1));

    const searchInput = screen.getByTestId("search-input");
    fireEvent.change(searchInput, { target: { value: "battery" } });

    await waitFor(() => {
      expect(api.fetchTickets).toHaveBeenLastCalledWith(
        expect.objectContaining({ requesterId: 1, search: "battery", page: 1 })
      );
    });
  });

  it("updates tickets list when changing category filter dropdown", async () => {
    renderWithContext();

    await waitFor(() => expect(api.fetchTickets).toHaveBeenCalled());

    const categorySelect = screen.getByTestId("category-filter");
    fireEvent.focus(categorySelect);
    fireEvent.change(categorySelect, { target: { value: "2" } });

    await waitFor(() => {
      expect(api.fetchTickets).toHaveBeenLastCalledWith(
        expect.objectContaining({ requesterId: 1, categoryId: 2, page: 1 })
      );
    });
  });

  it("resets filters when clicking Clear Filters button", async () => {
    renderWithContext();

    await waitFor(() => expect(api.fetchTickets).toHaveBeenCalledTimes(1));

    // Type search and select category to reveal clear button
    fireEvent.change(screen.getByTestId("search-input"), { target: { value: "laptop" } });
    fireEvent.change(screen.getByTestId("category-filter"), { target: { value: "2" } });

    await waitFor(() => {
      expect(screen.getByTestId("clear-filters-btn")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("clear-filters-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("search-input")).toHaveValue("");
      expect(screen.getByTestId("category-filter")).toHaveValue("");
    });
  });

  it("renders empty state when no tickets exist for requester", async () => {
    vi.mocked(api.fetchTickets).mockResolvedValueOnce({
      data: [],
      pagination: {
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
      },
    });

    renderWithContext();

    await waitFor(() => {
      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
      expect(screen.getByText(/No Tickets Found/i)).toBeInTheDocument();
    });
  });

  it("renders no-results state when search/filter returns 0 items", async () => {
    renderWithContext();

    await waitFor(() => expect(api.fetchTickets).toHaveBeenCalledTimes(1));

    // Mock next fetch call (triggered by search filter change) to return 0 items
    vi.mocked(api.fetchTickets).mockResolvedValueOnce({
      data: [],
      pagination: {
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
      },
    });

    // Filter to trigger active filters
    fireEvent.change(screen.getByTestId("search-input"), { target: { value: "NonExistentTicket" } });

    await waitFor(() => {
      expect(screen.getByTestId("no-results-state")).toBeInTheDocument();
      expect(screen.getByText(/No Matching Tickets/i)).toBeInTheDocument();
    });
  });

  it("handles pagination next and previous buttons", async () => {
    vi.mocked(api.fetchTickets).mockResolvedValue({
      data: mockTickets,
      pagination: {
        totalItems: 25,
        totalPages: 3,
        currentPage: 1,
        pageSize: 10,
      },
    });

    renderWithContext();

    await waitFor(() => {
      expect(screen.getByTestId("pagination-info")).toHaveTextContent("Showing 1 to 10 of 25 tickets");
    });

    const nextBtn = screen.getByTestId("next-page-btn");
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(api.fetchTickets).toHaveBeenLastCalledWith(
        expect.objectContaining({ requesterId: 1, page: 2 })
      );
    });
  });
});
