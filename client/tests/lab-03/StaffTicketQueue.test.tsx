import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { StaffTicketQueue } from "../../src/components/StaffTicketQueue.js";
import * as api from "../../src/api.js";

// Mock the api module
vi.mock("../../src/api.js", async () => {
  const actual = await vi.importActual("../../src/api.js");
  return {
    ...actual,
    fetchStaffTickets: vi.fn(),
    fetchActiveCategories: vi.fn(),
  };
});

const mockCategories: api.Category[] = [
  { id: 1, name: "Hardware" },
  { id: 2, name: "Network" },
  { id: 3, name: "Software" },
];

const mockTickets: api.StaffTicketResponse[] = [
  {
    id: 101,
    ticketNumber: "TKT-2026-000101",
    summary: "Laptop screen flickering intermittently",
    description: "Screen flashes black every few minutes while working.",
    requesterId: 5,
    requester: {
      id: 5,
      fullName: "Alice Smith",
      email: "alice@toktickit.dev",
      department: "Finance",
    },
    category: {
      id: 1,
      name: "Hardware",
    },
    status: "IN_PROGRESS",
    requestedPriority: "MEDIUM",
    itPriority: "HIGH",
    ownerId: 10,
    owner: {
      id: 10,
      fullName: "Alex Chen",
      email: "alex@toktickit.dev",
      role: "IT_STAFF",
    },
    ticketOwner: "Alex Chen",
    isResolutionIndicated: true,
    createdAt: "2026-09-10T08:30:00.000Z",
    updatedAt: "2026-09-12T14:20:00.000Z",
  },
  {
    id: 102,
    ticketNumber: "TKT-2026-000102",
    summary: "Cannot connect to VPN",
    description: "AnyConnect gives timeout error when connecting from home.",
    requesterId: 6,
    requester: {
      id: 6,
      fullName: "Bob Jones",
      email: "bob@toktickit.dev",
      department: "Marketing",
    },
    category: {
      id: 2,
      name: "Network",
    },
    status: "OPEN",
    requestedPriority: "HIGH",
    itPriority: "URGENT",
    ownerId: null,
    owner: null,
    ticketOwner: "Unassigned",
    isResolutionIndicated: false,
    createdAt: "2026-09-11T09:15:00.000Z",
    updatedAt: "2026-09-11T09:15:00.000Z",
  },
];

describe("StaffTicketQueue Component (Issue 23 / UI-03 / FR-10)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.fetchActiveCategories).mockResolvedValue(mockCategories);
    vi.mocked(api.fetchStaffTickets).mockResolvedValue({
      data: mockTickets,
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
        currentPage: 1,
        pageSize: 10,
        totalItems: 2,
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders queue header, total count badge, search input, and filter controls", async () => {
    render(<StaffTicketQueue />);

    // Header and description
    expect(await screen.findByRole("heading", { name: /IT Staff Ticket Queue/i })).toBeInTheDocument();
    expect(screen.getByText(/Triage, monitor, and assign IT support requests across all departments/i)).toBeInTheDocument();

    // Total count badge
    expect(await screen.findByText("2 Total Tickets")).toBeInTheDocument();

    // Search input
    expect(screen.getByTestId("queue-search-input")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search by ticket number, summary.../i)).toBeInTheDocument();

    // Filters
    expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Status$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/IT Priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Owner/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Sort By/i)).toBeInTheDocument();
  });

  it("fetches tickets and renders desktop table and mobile card view with badges", async () => {
    render(<StaffTicketQueue />);

    // Wait for tickets to load
    await waitFor(() => {
      expect(api.fetchStaffTickets).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, limit: 10, sortBy: "createdAt", sortDir: "desc" }),
        expect.any(AbortSignal)
      );
    });

    // Check ticket summaries (rendered in both desktop table and mobile cards)
    expect(await screen.findAllByText("Laptop screen flickering intermittently")).toHaveLength(2);
    expect(await screen.findAllByText("Cannot connect to VPN")).toHaveLength(2);

    // Check requester details
    expect(screen.getAllByText(/Alice Smith/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Bob Jones/i).length).toBeGreaterThan(0);

    // Check category badges
    expect(screen.getAllByText("Hardware").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Network").length).toBeGreaterThan(0);

    // Check status badges
    expect(screen.getAllByText("In Progress").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Open").length).toBeGreaterThan(0);

    // Check priority badges
    expect(screen.getAllByText("High").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Urgent").length).toBeGreaterThan(0);

    // Check owner badges
    expect(screen.getAllByText("Alex Chen").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Unassigned").length).toBeGreaterThan(0);

    // Check resolution indicated badge
    expect(screen.getAllByText(/Resolution Indicated/i).length).toBeGreaterThan(0);
  });

  it("handles search input with debouncing", async () => {
    vi.useFakeTimers();
    render(<StaffTicketQueue />);

    const searchInput = screen.getByTestId("queue-search-input");

    // Type query
    fireEvent.change(searchInput, { target: { value: "screen" } });
    expect((searchInput as HTMLInputElement).value).toBe("screen");

    // Fast-forward 300ms debounce
    await act(async () => {
      vi.advanceTimersByTime(350);
    });

    expect(api.fetchStaffTickets).toHaveBeenCalledWith(
      expect.objectContaining({
        search: "screen",
        page: 1,
      }),
      expect.any(AbortSignal)
    );
  });

  it("filters by category, status, priority, and owner", async () => {
    render(<StaffTicketQueue />);

    await waitFor(() => {
      expect(api.fetchActiveCategories).toHaveBeenCalled();
    });

    // Category filter
    const categorySelect = screen.getByTestId("queue-category-filter");
    fireEvent.change(categorySelect, { target: { value: "1" } });

    await waitFor(() => {
      expect(api.fetchStaffTickets).toHaveBeenCalledWith(
        expect.objectContaining({ category: 1, page: 1 }),
        expect.any(AbortSignal)
      );
    });

    // Status filter
    const statusSelect = screen.getByTestId("queue-status-filter");
    fireEvent.change(statusSelect, { target: { value: "OPEN" } });

    await waitFor(() => {
      expect(api.fetchStaffTickets).toHaveBeenCalledWith(
        expect.objectContaining({ status: "OPEN", page: 1 }),
        expect.any(AbortSignal)
      );
    });

    // Priority filter
    const prioritySelect = screen.getByTestId("queue-priority-filter");
    fireEvent.change(prioritySelect, { target: { value: "URGENT" } });

    await waitFor(() => {
      expect(api.fetchStaffTickets).toHaveBeenCalledWith(
        expect.objectContaining({ itPriority: "URGENT", page: 1 }),
        expect.any(AbortSignal)
      );
    });

    // Owner filter
    const ownerSelect = screen.getByTestId("queue-owner-filter");
    fireEvent.change(ownerSelect, { target: { value: "unassigned" } });

    await waitFor(() => {
      expect(api.fetchStaffTickets).toHaveBeenCalledWith(
        expect.objectContaining({ ownerId: "unassigned", page: 1 }),
        expect.any(AbortSignal)
      );
    });
  });

  it("sorts tickets by priority and changes sort direction", async () => {
    render(<StaffTicketQueue />);

    await waitFor(() => {
      expect(api.fetchStaffTickets).toHaveBeenCalled();
    });

    const sortBySelect = screen.getByTestId("queue-sort-by");
    fireEvent.change(sortBySelect, { target: { value: "itPriority" } });

    await waitFor(() => {
      expect(api.fetchStaffTickets).toHaveBeenCalledWith(
        expect.objectContaining({ sortBy: "itPriority" }),
        expect.any(AbortSignal)
      );
    });

    const sortDirBtn = screen.getByTestId("queue-sort-dir");
    fireEvent.click(sortDirBtn);

    await waitFor(() => {
      expect(api.fetchStaffTickets).toHaveBeenCalledWith(
        expect.objectContaining({ sortBy: "itPriority", sortDir: "asc" }),
        expect.any(AbortSignal)
      );
    });
  });

  it("clears all filters when Reset button is clicked", async () => {
    render(<StaffTicketQueue />);

    const statusSelect = screen.getByTestId("queue-status-filter") as HTMLSelectElement;
    fireEvent.change(statusSelect, { target: { value: "IN_PROGRESS" } });

    await waitFor(() => {
      expect(statusSelect.value).toBe("IN_PROGRESS");
    });

    const resetButton = screen.getByTestId("queue-clear-filters-btn");
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(statusSelect.value).toBe("");
      expect(api.fetchStaffTickets).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          sortBy: "createdAt",
          sortDir: "desc",
        }),
        expect.any(AbortSignal)
      );
    });
  });

  it("supports pagination controls", async () => {
    vi.mocked(api.fetchStaffTickets).mockResolvedValueOnce({
      data: mockTickets,
      pagination: {
        page: 1,
        limit: 10,
        total: 25,
        totalPages: 3,
        currentPage: 1,
        pageSize: 10,
        totalItems: 25,
      },
    });

    render(<StaffTicketQueue />);

    expect(await screen.findByTestId("queue-pagination")).toHaveTextContent(/Showing page 1 of 3 \(25 total\)/i);

    const prevBtn = screen.getByTestId("queue-prev-page");
    const nextBtn = screen.getByTestId("queue-next-page");

    expect(prevBtn).toBeDisabled();
    expect(nextBtn).toBeEnabled();

    // Click Next
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(api.fetchStaffTickets).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 }),
        expect.any(AbortSignal)
      );
    });
  });

  it("calls onSelectTicket when ticket row or View Detail button is clicked", async () => {
    const onSelectTicket = vi.fn();
    render(<StaffTicketQueue onSelectTicket={onSelectTicket} />);

    expect(await screen.findAllByText("Laptop screen flickering intermittently")).toHaveLength(2);

    // Click on View Detail button
    const viewButton = screen.getByTestId("view-detail-btn-101");
    fireEvent.click(viewButton);

    expect(onSelectTicket).toHaveBeenCalledWith(101);
  });

  it("renders empty state when no tickets match filters and can clear filters", async () => {
    vi.mocked(api.fetchStaffTickets).mockResolvedValueOnce({
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
        currentPage: 1,
        pageSize: 10,
        totalItems: 0,
      },
    });

    render(<StaffTicketQueue />);

    expect(await screen.findByText(/No Tickets Found/i)).toBeInTheDocument();
    expect(
      screen.getByText(/There are currently no tickets in the operational queue./i)
    ).toBeInTheDocument();
  });

  it("renders error state with retry button on API failure", async () => {
    vi.mocked(api.fetchStaffTickets).mockRejectedValueOnce(new Error("Connection refused"));

    render(<StaffTicketQueue />);

    expect(await screen.findByText(/Connection refused/i)).toBeInTheDocument();

    const retryBtn = screen.getByTestId("queue-retry-btn");
    expect(retryBtn).toBeInTheDocument();

    // Mock success for retry
    vi.mocked(api.fetchStaffTickets).mockResolvedValueOnce({
      data: mockTickets,
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
        currentPage: 1,
        pageSize: 10,
        totalItems: 2,
      },
    });

    fireEvent.click(retryBtn);

    expect(await screen.findAllByText("Laptop screen flickering intermittently")).toHaveLength(2);
  });
});
