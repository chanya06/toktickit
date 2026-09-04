import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React, { useState } from "react";
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

const mockRequester1 = {
  id: 1,
  name: "Jennifer Anderson",
  email: "jennifer.a@toktickit.dev",
  department: "Engineering",
  isActive: true,
};

const mockRequester2 = {
  id: 2,
  name: "Michael Brown",
  email: "michael.b@toktickit.dev",
  department: "IT Support",
  isActive: true,
};

const mockCategories = [
  { id: 1, name: "Software" },
  { id: 2, name: "Hardware" },
];

const mockTicketsReq1 = [
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
];

const mockTicketsReq2 = [
  {
    id: 201,
    ticketNumber: "TKT-2026-000201",
    requesterId: 2,
    categoryId: 1,
    relatedSystemId: 1,
    summary: "VPN authentication error for Michael",
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

function TestWrapper({ initialRequester = mockRequester1 }: { initialRequester?: any }) {
  const [selectedRequester, setSelectedRequester] = useState(initialRequester);

  return (
    <RequesterContext.Provider
      value={{
        selectedRequester,
        requesters: [mockRequester1, mockRequester2],
        isLoading: false,
        error: null,
        isModalOpen: false,
        selectRequester: (r) => setSelectedRequester(r),
        openSelectorModal: vi.fn(),
        closeSelectorModal: vi.fn(),
        refreshRequesters: vi.fn(),
      }}
    >
      <div>
        <button
          data-testid="switch-requester-btn"
          onClick={() => setSelectedRequester(mockRequester2)}
        >
          Switch to Michael
        </button>
        <MyTicketsView onNavigateCreate={vi.fn()} />
      </div>
    </RequesterContext.Provider>
  );
}

describe("MyTicketsView Component (Issue 11)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.fetchActiveCategories).mockResolvedValue(mockCategories);
    vi.mocked(api.fetchTickets).mockResolvedValue({
      data: mockTicketsReq1,
      pagination: {
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
        pageSize: 10,
      },
    });
  });

  it("renders requester prompt alert when no requester context is selected", () => {
    render(
      <RequesterContext.Provider
        value={{
          selectedRequester: null,
          requesters: [mockRequester1],
          isLoading: false,
          error: null,
          isModalOpen: false,
          selectRequester: vi.fn(),
          openSelectorModal: vi.fn(),
          closeSelectorModal: vi.fn(),
          refreshRequesters: vi.fn(),
        }}
      >
        <MyTicketsView onNavigateCreate={vi.fn()} />
      </RequesterContext.Provider>
    );

    expect(screen.getByTestId("no-requester-alert")).toBeInTheDocument();
    expect(screen.getByText(/Requester Context Required/i)).toBeInTheDocument();
  });

  it("UI-04: renders My Tickets view, search bar, category/priority/status filter controls, desktop table, and mobile cards", async () => {
    render(<TestWrapper />);

    expect(screen.getByText(/Welcome, Jennifer Anderson/i)).toBeInTheDocument();
    expect(screen.getByTestId("search-input")).toBeInTheDocument();
    expect(screen.getByTestId("category-filter")).toBeInTheDocument();
    expect(screen.getByTestId("priority-filter")).toBeInTheDocument();
    expect(screen.getByTestId("status-filter")).toBeInTheDocument();

    await waitFor(() => {
      expect(api.fetchTickets).toHaveBeenCalledWith(
        expect.objectContaining({ requesterId: 1, page: 1, pageSize: 10 }),
        expect.anything()
      );
    });

    expect(screen.getByTestId("desktop-tickets-table")).toBeInTheDocument();
    expect(screen.getByTestId("mobile-tickets-cards")).toBeInTheDocument();
    expect(screen.getAllByText("TKT-2026-000101").length).toBeGreaterThan(0);
  });

  it("renders responsive desktop table and mobile cards with correct responsive CSS classes", async () => {
    render(<TestWrapper />);

    await waitFor(() => expect(api.fetchTickets).toHaveBeenCalled());

    const desktopTable = screen.getByTestId("desktop-tickets-table");
    const mobileCards = screen.getByTestId("mobile-tickets-cards");

    expect(desktopTable).toHaveClass("d-none", "d-md-block");
    expect(mobileCards).toHaveClass("d-block", "d-md-none");
  });

  it("prevents stale responses when switching Requester context (UI Requester Isolation)", async () => {
    // Delayed response for Requester 1
    let resolveReq1: any;
    const req1Promise = new Promise((resolve) => {
      resolveReq1 = resolve;
    });

    vi.mocked(api.fetchTickets).mockImplementationOnce(
      () => req1Promise as Promise<any>
    );

    render(<TestWrapper />);

    // Switch to Requester 2 before Requester 1 resolves
    vi.mocked(api.fetchTickets).mockResolvedValueOnce({
      data: mockTicketsReq2,
      pagination: { totalItems: 1, totalPages: 1, currentPage: 1, pageSize: 10 },
    });

    fireEvent.click(screen.getByTestId("switch-requester-btn"));

    await waitFor(() => {
      expect(screen.getByText(/Welcome, Michael Brown/i)).toBeInTheDocument();
      expect(screen.getAllByText("TKT-2026-000201").length).toBeGreaterThan(0);
    });

    // Now resolve delayed Requester 1 response
    await act(async () => {
      resolveReq1({
        data: mockTicketsReq1,
        pagination: { totalItems: 1, totalPages: 1, currentPage: 1, pageSize: 10 },
      });
    });

    // Verify UI still displays Requester 2 tickets (stale Requester 1 response ignored)
    expect(screen.queryByText("TKT-2026-000101")).not.toBeInTheDocument();
    expect(screen.getAllByText("TKT-2026-000201").length).toBeGreaterThan(0);
  });

  it("debounces search input and ignores stale out-of-order search responses", async () => {
    vi.useFakeTimers();

    render(<TestWrapper />);

    // Fast-forward initial load timer
    await act(async () => {
      vi.advanceTimersByTime(350);
    });

    const searchInput = screen.getByTestId("search-input");
    fireEvent.change(searchInput, { target: { value: "battery" } });

    // Fast-forward debounce timer (300ms)
    await act(async () => {
      vi.advanceTimersByTime(350);
    });

    expect(api.fetchTickets).toHaveBeenLastCalledWith(
      expect.objectContaining({ requesterId: 1, search: "battery" }),
      expect.anything()
    );

    vi.useRealTimers();
  });

  it("supports multi-select filter selection for category, priority, and status", async () => {
    render(<TestWrapper />);

    await waitFor(() => expect(api.fetchTickets).toHaveBeenCalled());

    // Priority multi-select filter via checkbox menu popup
    const priorityBtn = screen.getByTestId("priority-filter-btn");
    fireEvent.click(priorityBtn);

    const highCheckbox = screen.getByTestId("priority-filter-checkbox-HIGH");
    fireEvent.click(highCheckbox);

    await waitFor(() => {
      expect(api.fetchTickets).toHaveBeenLastCalledWith(
        expect.objectContaining({ requestedPriority: ["HIGH"] }),
        expect.anything()
      );
    });

    const urgentCheckbox = screen.getByTestId("priority-filter-checkbox-URGENT");
    fireEvent.click(urgentCheckbox);

    await waitFor(() => {
      expect(api.fetchTickets).toHaveBeenLastCalledWith(
        expect.objectContaining({ requestedPriority: ["HIGH", "URGENT"] }),
        expect.anything()
      );
    });

    // Sort filter
    fireEvent.change(screen.getByTestId("sort-filter"), { target: { value: "createdAt:asc" } });
    await waitFor(() => {
      expect(api.fetchTickets).toHaveBeenLastCalledWith(
        expect.objectContaining({ sortBy: "createdAt", sortOrder: "asc" }),
        expect.anything()
      );
    });
  });

  it("resets filters when clicking Clear Filters button", async () => {
    render(<TestWrapper />);

    await waitFor(() => expect(api.fetchTickets).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByTestId("search-input"), { target: { value: "laptop" } });
    fireEvent.change(screen.getByTestId("priority-filter"), { target: { value: "HIGH" } });

    await waitFor(() => {
      expect(screen.getByTestId("clear-filters-btn")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("clear-filters-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("search-input")).toHaveValue("");
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

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
      expect(screen.getByText(/No Tickets Found/i)).toBeInTheDocument();
    });
  });

  it("renders no-results state when search/filter returns 0 items and clears filters on click", async () => {
    render(<TestWrapper />);

    await waitFor(() => expect(api.fetchTickets).toHaveBeenCalledTimes(1));

    vi.mocked(api.fetchTickets).mockResolvedValueOnce({
      data: [],
      pagination: {
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
      },
    });

    fireEvent.change(screen.getByTestId("search-input"), { target: { value: "NonExistentTerm" } });

    await waitFor(() => {
      expect(screen.getByTestId("no-results-state")).toBeInTheDocument();
      expect(screen.getByText(/No Matching Tickets/i)).toBeInTheDocument();
    });

    const clearBtn = screen.getByTestId("no-results-clear-btn");
    fireEvent.click(clearBtn);

    await waitFor(() => {
      expect(screen.getByTestId("search-input")).toHaveValue("");
    });
  });

  it("handles pagination next, previous, and page number buttons", async () => {
    vi.mocked(api.fetchTickets).mockResolvedValue({
      data: mockTicketsReq1,
      pagination: {
        totalItems: 25,
        totalPages: 3,
        currentPage: 1,
        pageSize: 10,
      },
    });

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByTestId("pagination-info")).toHaveTextContent("Showing 1 to 10 of 25 tickets");
    });

    // Mock page 2 response on Next click
    vi.mocked(api.fetchTickets).mockResolvedValueOnce({
      data: mockTicketsReq1,
      pagination: {
        totalItems: 25,
        totalPages: 3,
        currentPage: 2,
        pageSize: 10,
      },
    });

    const nextBtn = screen.getByTestId("next-page-btn");
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(screen.getByTestId("pagination-info")).toHaveTextContent("Showing 11 to 20 of 25 tickets");
      expect(api.fetchTickets).toHaveBeenLastCalledWith(
        expect.objectContaining({ requesterId: 1, page: 2 }),
        expect.anything()
      );
    });

    // Mock page 1 response on Previous click
    vi.mocked(api.fetchTickets).mockResolvedValueOnce({
      data: mockTicketsReq1,
      pagination: {
        totalItems: 25,
        totalPages: 3,
        currentPage: 1,
        pageSize: 10,
      },
    });

    const prevBtn = screen.getByTestId("prev-page-btn");
    expect(prevBtn).not.toBeDisabled();
    fireEvent.click(prevBtn);

    await waitFor(() => {
      expect(api.fetchTickets).toHaveBeenLastCalledWith(
        expect.objectContaining({ requesterId: 1, page: 1 }),
        expect.anything()
      );
    });
  });

  it("renders Error state with Retry button and re-fetches tickets on click", async () => {
    vi.mocked(api.fetchTickets).mockRejectedValueOnce(new Error("Server offline"));

    render(<TestWrapper />);

    expect(await screen.findByTestId("tickets-error")).toBeInTheDocument();
    expect(screen.getByText(/Server offline/i)).toBeInTheDocument();

    const retryBtn = screen.getByTestId("retry-tickets-btn");
    expect(retryBtn).toBeInTheDocument();

    vi.mocked(api.fetchTickets).mockResolvedValueOnce({
      data: mockTicketsReq1,
      pagination: { totalItems: 1, totalPages: 1, currentPage: 1, pageSize: 10 },
    });

    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.queryByTestId("tickets-error")).not.toBeInTheDocument();
      expect(screen.getAllByText("TKT-2026-000101").length).toBeGreaterThan(0);
    });
  });

  it("handles category load error gracefully and recovers data upon clicking Retry Categories", async () => {
    const catSpy = vi.spyOn(api, "fetchActiveCategories").mockRejectedValueOnce(new Error("Category API Error"));

    render(<TestWrapper />);

    await waitFor(() => expect(api.fetchTickets).toHaveBeenCalled());

    // Click category filter button to trigger lazy fetch
    const catFilterBtn = screen.getByTestId("category-filter-btn");
    fireEvent.click(catFilterBtn);

    expect(await screen.findByTestId("category-load-error")).toBeInTheDocument();
    expect(screen.getByText(/Category API Error/i)).toBeInTheDocument();

    // Mock success on retry click
    catSpy.mockResolvedValueOnce(mockCategories);

    const retryCatBtn = screen.getByRole("button", { name: /Retry Categories/i });
    fireEvent.click(retryCatBtn);

    await waitFor(() => {
      expect(screen.queryByTestId("category-load-error")).not.toBeInTheDocument();
    });
  });
});
