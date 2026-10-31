import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { StaffDashboard } from "../../src/components/StaffDashboard.js";
import { AuthContext } from "../../src/context/AuthContext.js";
import * as api from "../../src/api.js";

const mockStaffUser = {
  id: 20,
  email: "kevin.patel@toktickit.com",
  fullName: "Kevin Patel",
  role: "IT_STAFF" as const,
  mustChangePassword: false,
};

const mockAdminUser = {
  id: 30,
  email: "admin@toktickit.com",
  fullName: "System Admin",
  role: "ADMINISTRATOR" as const,
  mustChangePassword: false,
};

const mockStaffDashboardData: api.StaffDashboardResponse = {
  metrics: {
    unassignedTickets: 4,
    myAssignedTickets: 2,
    byStatus: {
      NEW: 1,
      OPEN: 2,
      IN_PROGRESS: 3,
      WAITING_FOR_REQUESTER: 1,
      PENDING: 0,
      RESOLVED: 5,
      CLOSED: 3,
      REOPENED: 0,
      CANCELLED: 1,
    },
    byPriority: {
      URGENT: 2,
      HIGH: 3,
      MEDIUM: 4,
      LOW: 1,
    },
    recentlyUpdatedCount: 6,
  },
  urgentTickets: [
    {
      id: 201,
      ticketNumber: "TKT-2026-000201",
      summary: "Database cluster failover alert",
      category: "Infrastructure",
      status: "IN_PROGRESS",
      itPriority: "URGENT",
      isResolutionIndicated: false,
      owner: { fullName: "Kevin Patel" },
      actionsCount: 3,
      createdAt: "2026-10-29T12:00:00.000Z",
      updatedAt: "2026-10-30T15:00:00.000Z",
    },
  ],
  recentTickets: [
    {
      id: 202,
      ticketNumber: "TKT-2026-000202",
      summary: "Office printer network unreachable",
      category: "Network",
      status: "OPEN",
      itPriority: "HIGH",
      isResolutionIndicated: false,
      owner: null,
      actionsCount: 1,
      createdAt: "2026-10-30T08:00:00.000Z",
      updatedAt: "2026-10-30T14:00:00.000Z",
    },
  ],
};

const mockAdminDashboardData: api.AdminDashboardResponse = {
  systemUserStats: {
    totalUsers: 10,
    activeRequesters: 4,
    activeStaff: 3,
    administrators: 1,
    inactiveUsers: 2,
  },
  operationalMetrics: mockStaffDashboardData.metrics,
  urgentTickets: mockStaffDashboardData.urgentTickets,
  recentTickets: mockStaffDashboardData.recentTickets,
};

function renderStaffDashboard(options?: {
  user?: typeof mockStaffUser | typeof mockAdminUser;
  onNavigateQueue?: (filters?: any) => void;
  onNavigateUserManagement?: () => void;
  onSelectTicket?: (id: number) => void;
}) {
  const user = options?.user || mockStaffUser;
  const onNavigateQueue = options?.onNavigateQueue || vi.fn();
  const onNavigateUserManagement = options?.onNavigateUserManagement || vi.fn();
  const onSelectTicket = options?.onSelectTicket || vi.fn();

  const authValue = {
    user,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    refreshUser: vi.fn(),
  };

  return {
    ...render(
      <AuthContext.Provider value={authValue}>
        <StaffDashboard
          onNavigateQueue={onNavigateQueue}
          onNavigateUserManagement={onNavigateUserManagement}
          onSelectTicket={onSelectTicket}
        />
      </AuthContext.Provider>
    ),
    onNavigateQueue,
    onNavigateUserManagement,
    onSelectTicket,
  };
}

describe("StaffDashboard Component (UI-05 / FR-10 / FR-11 / AC-08)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("UI-05a: renders IT Staff dashboard welcome header, IT Staff role badge, and 5 operational metric cards", async () => {
    vi.spyOn(api, "fetchStaffDashboard").mockResolvedValue(mockStaffDashboardData);

    renderStaffDashboard({ user: mockStaffUser });

    expect(await screen.findByText(/Welcome back, Kevin Patel!/i)).toBeInTheDocument();
    expect(screen.getByTestId("user-role-badge")).toHaveTextContent("IT Staff");

    // 5 Operational cards
    expect(screen.getByTestId("metric-unassigned-tickets")).toHaveTextContent("4");
    expect(screen.getByTestId("metric-my-assigned-tickets")).toHaveTextContent("2");
    expect(screen.getByTestId("metric-in-progress-tickets")).toHaveTextContent("3");
    expect(screen.getByTestId("metric-waiting-tickets")).toHaveTextContent("1");
    expect(screen.getByTestId("metric-urgent-tickets")).toHaveTextContent("2");

    // Admin system stats row must NOT be visible for IT_STAFF
    expect(screen.queryByTestId("admin-system-stats")).not.toBeInTheDocument();

    // Urgent tickets rendered
    expect(screen.getByText("Database cluster failover alert")).toBeInTheDocument();
    expect(screen.getByText("TKT-2026-000201")).toBeInTheDocument();
  });

  it("UI-05b: renders Administrator dashboard with System User Stats row when user is ADMINISTRATOR (FR-11)", async () => {
    vi.spyOn(api, "fetchAdminDashboard").mockResolvedValue(mockAdminDashboardData);

    const { onNavigateUserManagement } = renderStaffDashboard({ user: mockAdminUser });

    expect(await screen.findByText(/Welcome back, System Admin!/i)).toBeInTheDocument();
    expect(screen.getByTestId("user-role-badge")).toHaveTextContent("Administrator");

    // System stats row visible
    const statsContainer = screen.getByTestId("admin-system-stats");
    expect(statsContainer).toBeInTheDocument();
    expect(screen.getByTestId("stat-total-users")).toHaveTextContent("10");
    expect(screen.getByTestId("stat-active-requesters")).toHaveTextContent("4");
    expect(screen.getByTestId("stat-active-staff")).toHaveTextContent("3");
    expect(screen.getByTestId("stat-administrators")).toHaveTextContent("1");
    expect(screen.getByTestId("stat-inactive-users")).toHaveTextContent("2");

    // Quick action to user directory
    const manageBtn = screen.getByTestId("admin-manage-users-btn");
    fireEvent.click(manageBtn);
    expect(onNavigateUserManagement).toHaveBeenCalled();
  });

  it("UI-05c: renders empty urgent queue feedback message when urgent queue is empty (BR-10)", async () => {
    vi.spyOn(api, "fetchStaffDashboard").mockResolvedValue({
      ...mockStaffDashboardData,
      urgentTickets: [],
    });

    renderStaffDashboard();

    const emptyUrgent = await screen.findByTestId("empty-urgent-queue");
    expect(emptyUrgent).toBeInTheDocument();
    expect(emptyUrgent).toHaveTextContent(
      "Queue is clear. No urgent tickets require immediate attention."
    );
  });

  it("UI-05d: switches between Urgent Queue and Recent Activity tabs", async () => {
    vi.spyOn(api, "fetchStaffDashboard").mockResolvedValue(mockStaffDashboardData);

    renderStaffDashboard();

    expect(await screen.findByText("Database cluster failover alert")).toBeInTheDocument();

    // Switch to Recent tab
    const recentTab = screen.getByTestId("tab-recent-tickets");
    fireEvent.click(recentTab);

    expect(await screen.findByText("Office printer network unreachable")).toBeInTheDocument();
    expect(screen.getByText("TKT-2026-000202")).toBeInTheDocument();

    // Switch back to Urgent tab
    const urgentTab = screen.getByTestId("tab-urgent-tickets");
    fireEvent.click(urgentTab);

    expect(await screen.findByText("Database cluster failover alert")).toBeInTheDocument();
  });

  it("UI-05e: triggers drill-down navigation callbacks when clicking operational metric cards", async () => {
    vi.spyOn(api, "fetchStaffDashboard").mockResolvedValue(mockStaffDashboardData);

    const { onNavigateQueue } = renderStaffDashboard();

    expect(await screen.findByText(/Welcome back, Kevin Patel!/i)).toBeInTheDocument();

    // 1. Unassigned drilldown
    const cardUnassignedBtn = screen.getByTestId("card-unassigned-tickets").querySelector("button")!;
    fireEvent.click(cardUnassignedBtn);
    expect(onNavigateQueue).toHaveBeenCalledWith({ owner: "unassigned" });

    // 2. My Assigned drilldown
    const cardMyAssignedBtn = screen.getByTestId("card-my-assigned-tickets").querySelector("button")!;
    fireEvent.click(cardMyAssignedBtn);
    expect(onNavigateQueue).toHaveBeenCalledWith({ owner: "me" });

    // 3. In Progress drilldown
    const cardInProgressBtn = screen.getByTestId("card-in-progress-tickets").querySelector("button")!;
    fireEvent.click(cardInProgressBtn);
    expect(onNavigateQueue).toHaveBeenCalledWith({ status: "IN_PROGRESS" });

    // 4. Waiting drilldown
    const cardWaitingBtn = screen.getByTestId("card-waiting-tickets").querySelector("button")!;
    fireEvent.click(cardWaitingBtn);
    expect(onNavigateQueue).toHaveBeenCalledWith({ status: "WAITING_FOR_REQUESTER" });

    // 5. Urgent drilldown
    const cardUrgentBtn = screen.getByTestId("card-urgent-tickets").querySelector("button")!;
    fireEvent.click(cardUrgentBtn);
    expect(onNavigateQueue).toHaveBeenCalledWith({ priority: "URGENT" });
  });

  it("UI-05f: triggers ticket detail view when clicking View button on a triage ticket", async () => {
    vi.spyOn(api, "fetchStaffDashboard").mockResolvedValue(mockStaffDashboardData);

    const { onSelectTicket } = renderStaffDashboard();

    const viewBtn = await screen.findByTestId("view-detail-btn-201");
    fireEvent.click(viewBtn);

    expect(onSelectTicket).toHaveBeenCalledWith(201);
  });

  it("UI-05g: triggers queue shortcuts and user management from the right sidebar", async () => {
    vi.spyOn(api, "fetchAdminDashboard").mockResolvedValue(mockAdminDashboardData);

    const { onNavigateQueue, onNavigateUserManagement } = renderStaffDashboard({ user: mockAdminUser });

    // Full queue shortcut
    const fullQueueBtn = await screen.findByTestId("quick-queue-btn");
    fireEvent.click(fullQueueBtn);
    expect(onNavigateQueue).toHaveBeenCalledWith();

    // My queue shortcut
    const myQueueBtn = screen.getByTestId("quick-my-queue-btn");
    fireEvent.click(myQueueBtn);
    expect(onNavigateQueue).toHaveBeenCalledWith({ owner: "me" });

    // Unassigned shortcut
    const unassignedBtn = screen.getByTestId("quick-unassigned-btn");
    fireEvent.click(unassignedBtn);
    expect(onNavigateQueue).toHaveBeenCalledWith({ owner: "unassigned" });

    // User management shortcut for admin
    const userMgmtBtn = screen.getByTestId("quick-user-mgmt-btn");
    fireEvent.click(userMgmtBtn);
    expect(onNavigateUserManagement).toHaveBeenCalled();
  });

  it("UI-05h: refreshes dashboard metrics when clicking the Refresh button", async () => {
    const fetchSpy = vi.spyOn(api, "fetchStaffDashboard").mockResolvedValue(mockStaffDashboardData);

    renderStaffDashboard();

    const refreshBtn = await screen.findByTestId("refresh-dashboard-btn");
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    fireEvent.click(refreshBtn);
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });
  });

  it("UI-05i: displays error alert and allows retry when API call fails", async () => {
    const fetchSpy = vi
      .spyOn(api, "fetchStaffDashboard")
      .mockRejectedValueOnce(new Error("Internal API error"))
      .mockResolvedValueOnce(mockStaffDashboardData);

    renderStaffDashboard();

    expect(await screen.findByText(/Internal API error/i)).toBeInTheDocument();

    const retryBtn = screen.getByRole("button", { name: /retry/i });
    fireEvent.click(retryBtn);

    expect(await screen.findByText(/Welcome back, Kevin Patel!/i)).toBeInTheDocument();
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});
