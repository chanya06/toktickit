import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { RequesterDashboard } from "../../src/components/RequesterDashboard.js";
import { AuthContext } from "../../src/context/AuthContext.js";
import * as api from "../../src/api.js";

const mockRequesterUser = {
  id: 10,
  email: "jennifer.anderson@example.com",
  fullName: "Jennifer Anderson",
  role: "REQUESTER" as const,
  mustChangePassword: false,
};

const mockDashboardData: api.RequesterDashboardResponse = {
  metrics: {
    myOpenTickets: 3,
    waitingForRequester: 1,
    recentlyUpdated: 4,
    recentlyResolved: 2,
  },
  recentTickets: [
    {
      id: 101,
      ticketNumber: "TKT-2026-000101",
      summary: "Laptop keyboard replacement",
      category: "Hardware",
      status: "IN_PROGRESS",
      itPriority: "HIGH",
      isResolutionIndicated: false,
      owner: { fullName: "Kevin Patel" },
      actionsCount: 2,
      createdAt: "2026-10-25T08:00:00.000Z",
      updatedAt: "2026-10-30T10:00:00.000Z",
    },
    {
      id: 102,
      ticketNumber: "TKT-2026-000102",
      summary: "VPN access expired after password change",
      category: "Network",
      status: "WAITING_FOR_REQUESTER",
      itPriority: "MEDIUM",
      isResolutionIndicated: true,
      owner: { fullName: "Emily Davis" },
      actionsCount: 1,
      createdAt: "2026-10-28T09:00:00.000Z",
      updatedAt: "2026-10-30T11:00:00.000Z",
    },
  ],
};

function renderRequesterDashboard(props?: {
  onNavigateCreate?: () => void;
  onNavigateMyTickets?: (filter?: { status?: string }) => void;
  onSelectTicket?: (id: number) => void;
}) {
  const onNavigateCreate = props?.onNavigateCreate || vi.fn();
  const onNavigateMyTickets = props?.onNavigateMyTickets || vi.fn();
  const onSelectTicket = props?.onSelectTicket || vi.fn();

  const authValue = {
    user: mockRequesterUser,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    refreshUser: vi.fn(),
  };

  return {
    ...render(
      <AuthContext.Provider value={authValue}>
        <RequesterDashboard
          onNavigateCreate={onNavigateCreate}
          onNavigateMyTickets={onNavigateMyTickets}
          onSelectTicket={onSelectTicket}
        />
      </AuthContext.Provider>
    ),
    onNavigateCreate,
    onNavigateMyTickets,
    onSelectTicket,
  };
}

describe("RequesterDashboard Component (UI-04 / FR-08 / AC-06)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("UI-04a: renders Requester dashboard welcome header, role badge, and 4 metric cards with correct values", async () => {
    vi.spyOn(api, "fetchRequesterDashboard").mockResolvedValue(mockDashboardData);

    renderRequesterDashboard();

    expect(await screen.findByText(/Welcome, Jennifer Anderson!/i)).toBeInTheDocument();
    expect(screen.getByTestId("user-role-badge")).toHaveTextContent("Requester");

    // 4 Metric cards check
    expect(screen.getByTestId("metric-my-open-tickets")).toHaveTextContent("3");
    expect(screen.getByTestId("metric-waiting-for-requester")).toHaveTextContent("1");
    expect(screen.getByTestId("metric-recently-updated")).toHaveTextContent("4");
    expect(screen.getByTestId("metric-recently-resolved")).toHaveTextContent("2");

    // Recent tickets list
    expect(screen.getByText("Laptop keyboard replacement")).toBeInTheDocument();
    expect(screen.getByText("TKT-2026-000101")).toBeInTheDocument();
    expect(screen.getByText("VPN access expired after password change")).toBeInTheDocument();
    expect(screen.getByText("TKT-2026-000102")).toBeInTheDocument();
  });

  it("UI-04b: renders zero values in neutral slate styling and displays empty recent tickets message (BR-07)", async () => {
    vi.spyOn(api, "fetchRequesterDashboard").mockResolvedValue({
      metrics: {
        myOpenTickets: 0,
        waitingForRequester: 0,
        recentlyUpdated: 0,
        recentlyResolved: 0,
      },
      recentTickets: [],
    });

    renderRequesterDashboard();

    expect(await screen.findByTestId("metric-my-open-tickets")).toHaveTextContent("0");
    expect(screen.getByTestId("metric-waiting-for-requester")).toHaveTextContent("0");
    expect(screen.getByTestId("metric-recently-updated")).toHaveTextContent("0");
    expect(screen.getByTestId("metric-recently-resolved")).toHaveTextContent("0");

    // Empty tickets feedback
    const emptyState = screen.getByTestId("empty-recent-tickets");
    expect(emptyState).toBeInTheDocument();
    expect(emptyState).toHaveTextContent(
      "No support requests found. Click '+ Submit New Request' to get IT support."
    );
  });

  it("UI-04c: renders Resolution Indicated tag on tickets where requester indicated issue resolved", async () => {
    vi.spyOn(api, "fetchRequesterDashboard").mockResolvedValue(mockDashboardData);

    renderRequesterDashboard();

    expect(await screen.findByTestId("resolution-indicated-badge-102")).toBeInTheDocument();
    expect(screen.getByTestId("resolution-indicated-badge-102")).toHaveTextContent(
      "Resolution Indicated"
    );
    expect(screen.queryByTestId("resolution-indicated-badge-101")).not.toBeInTheDocument();
  });

  it("UI-04d: triggers drill-down navigation callbacks when clicking metric card links", async () => {
    vi.spyOn(api, "fetchRequesterDashboard").mockResolvedValue(mockDashboardData);

    const { onNavigateMyTickets } = renderRequesterDashboard();

    expect(await screen.findByText(/Welcome, Jennifer Anderson!/i)).toBeInTheDocument();

    // 1. My Open Tickets drilldown
    const cardOpenBtn = screen.getByTestId("card-my-open-tickets").querySelector("button")!;
    fireEvent.click(cardOpenBtn);
    expect(onNavigateMyTickets).toHaveBeenCalledWith({ status: "open" });

    // 2. Waiting for Input drilldown
    const cardWaitingBtn = screen.getByTestId("card-waiting-for-requester").querySelector("button")!;
    fireEvent.click(cardWaitingBtn);
    expect(onNavigateMyTickets).toHaveBeenCalledWith({ status: "WAITING_FOR_REQUESTER" });

    // 3. Recently Updated drilldown
    const cardUpdatedBtn = screen.getByTestId("card-recently-updated").querySelector("button")!;
    fireEvent.click(cardUpdatedBtn);
    expect(onNavigateMyTickets).toHaveBeenCalledWith();

    // 4. Recently Resolved drilldown
    const cardResolvedBtn = screen.getByTestId("card-recently-resolved").querySelector("button")!;
    fireEvent.click(cardResolvedBtn);
    expect(onNavigateMyTickets).toHaveBeenCalledWith({ status: "RESOLVED" });
  });

  it("UI-04e: triggers ticket detail selection when clicking View button on a recent ticket", async () => {
    vi.spyOn(api, "fetchRequesterDashboard").mockResolvedValue(mockDashboardData);

    const { onSelectTicket } = renderRequesterDashboard();

    const viewBtn = await screen.findByTestId("view-ticket-btn-101");
    fireEvent.click(viewBtn);

    expect(onSelectTicket).toHaveBeenCalledWith(101);
  });

  it("UI-04f: triggers quick action navigation buttons (+ Submit New Request, View All My Tickets)", async () => {
    vi.spyOn(api, "fetchRequesterDashboard").mockResolvedValue(mockDashboardData);

    const { onNavigateCreate, onNavigateMyTickets } = renderRequesterDashboard();

    const createBtn = await screen.findByTestId("quick-create-ticket-btn");
    fireEvent.click(createBtn);
    expect(onNavigateCreate).toHaveBeenCalled();

    const myTicketsBtn = screen.getByTestId("quick-my-tickets-btn");
    fireEvent.click(myTicketsBtn);
    expect(onNavigateMyTickets).toHaveBeenCalled();
  });

  it("UI-04g: refreshes dashboard metrics when clicking the Refresh button", async () => {
    const fetchSpy = vi.spyOn(api, "fetchRequesterDashboard").mockResolvedValue(mockDashboardData);

    renderRequesterDashboard();

    const refreshBtn = await screen.findByTestId("refresh-dashboard-btn");
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    fireEvent.click(refreshBtn);
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });
  });

  it("UI-04h: displays error alert and allows retry when API call fails", async () => {
    const fetchSpy = vi
      .spyOn(api, "fetchRequesterDashboard")
      .mockRejectedValueOnce(new Error("Database connection timed out"))
      .mockResolvedValueOnce(mockDashboardData);

    renderRequesterDashboard();

    expect(await screen.findByText(/Database connection timed out/i)).toBeInTheDocument();

    const retryBtn = screen.getByRole("button", { name: /retry/i });
    fireEvent.click(retryBtn);

    expect(await screen.findByText(/Welcome, Jennifer Anderson!/i)).toBeInTheDocument();
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});
