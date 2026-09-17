import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { TicketDetailView } from "../../src/components/TicketDetailView.js";
import { AuthContext } from "../../src/context/AuthContext.js";
import { RequesterContext } from "../../src/context/RequesterContext.js";
import * as api from "../../src/api.js";

// Mock api module
vi.mock("../../src/api.js", async () => {
  const actual = await vi.importActual("../../src/api.js");
  return {
    ...actual,
    fetchTicketDetail: vi.fn(),
    fetchStaffAssignees: vi.fn(),
    claimTicket: vi.fn(),
    assignTicket: vi.fn(),
    updateTicketITPriority: vi.fn(),
    updateTicketStatus: vi.fn(),
    indicateResolution: vi.fn(),
  };
});

const mockStaffUser: api.AuthUser = {
  id: 10,
  email: "alex.chen@toktickit.dev",
  fullName: "Alex Chen",
  role: "IT_STAFF",
  department: "IT Operations",
  mustChangePassword: false,
};

const mockAdminUser: api.AuthUser = {
  id: 2,
  email: "admin@toktickit.dev",
  fullName: "System Admin",
  role: "ADMINISTRATOR",
  department: "IT Infrastructure",
  mustChangePassword: false,
};

const mockRequesterUser: api.AuthUser = {
  id: 5,
  email: "alice@toktickit.dev",
  fullName: "Alice Smith",
  role: "REQUESTER",
  department: "Finance",
  mustChangePassword: false,
};

const mockAssignees: api.StaffAssignee[] = [
  { id: 10, fullName: "Alex Chen", email: "alex.chen@toktickit.dev", role: "IT_STAFF" },
  { id: 11, fullName: "Sarah Jenkins", email: "sarah.jenkins@toktickit.dev", role: "IT_STAFF" },
  { id: 2, fullName: "System Admin", email: "admin@toktickit.dev", role: "ADMINISTRATOR" },
];

const mockNewTicket: api.TicketResponse = {
  id: 301,
  ticketNumber: "TKT-2026-000301",
  requesterId: 5,
  categoryId: 1,
  relatedSystemId: 3,
  summary: "Monitor display has dead pixels",
  description: "Brand new monitor has clusters of dead pixels in center.",
  requestedPriority: "MEDIUM",
  itPriority: "MEDIUM",
  status: "NEW",
  isResolutionIndicated: false,
  createdAt: "2026-09-15T09:00:00.000Z",
  category: { id: 1, name: "Hardware" },
  relatedSystem: { id: 3, name: "Workstations" },
  requester: { id: 5, name: "Alice Smith", email: "alice@toktickit.dev" },
  ticketOwner: null,
  ownerId: null,
};

const mockOpenTicket: api.TicketResponse = {
  id: 302,
  ticketNumber: "TKT-2026-000302",
  requesterId: 5,
  categoryId: 2,
  relatedSystemId: 4,
  summary: "VPN disconnections during video conference",
  description: "Every 15 minutes VPN drops connection.",
  requestedPriority: "HIGH",
  itPriority: "HIGH",
  status: "OPEN",
  isResolutionIndicated: false,
  createdAt: "2026-09-15T10:00:00.000Z",
  category: { id: 2, name: "Network" },
  relatedSystem: { id: 4, name: "VPN Gateway" },
  requester: { id: 5, name: "Alice Smith", email: "alice@toktickit.dev" },
  ticketOwner: "Alex Chen",
  ownerId: 10,
};

function renderDetailWithAuth(
  ticketData: api.TicketResponse,
  user: api.AuthUser = mockStaffUser,
  onBack: () => void = vi.fn()
) {
  (api.fetchTicketDetail as any).mockResolvedValue(ticketData);
  (api.fetchStaffAssignees as any).mockResolvedValue(mockAssignees);

  return render(
    <AuthContext.Provider
      value={{
        user,
        token: "fake-jwt-token",
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        changePassword: vi.fn(),
        refreshUser: vi.fn(),
      }}
    >
      <RequesterContext.Provider
        value={{
          selectedRequester: null,
          requesters: [],
          isLoading: false,
          error: null,
          isModalOpen: false,
          selectRequester: vi.fn(),
          openSelectorModal: vi.fn(),
          closeSelectorModal: vi.fn(),
          refreshRequesters: vi.fn(),
        }}
      >
        <TicketDetailView ticketId={ticketData.id} onBack={onBack} />
      </RequesterContext.Provider>
    </AuthContext.Provider>
  );
}

describe("IT Staff Ticket Operations & Status Matrix (Issue 24 / FR-11 & FR-13)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Role Visibility & Contextual Navigation", () => {
    it("renders staff operational panel for IT_STAFF user", async () => {
      renderDetailWithAuth(mockNewTicket, mockStaffUser);

      await waitFor(() => {
        expect(screen.getByTestId("staff-operations-panel")).toBeInTheDocument();
      });

      expect(screen.getByTestId("claim-ticket-btn")).toBeInTheDocument();
      expect(screen.getByTestId("owner-selector")).toBeInTheDocument();
      expect(screen.getByTestId("it-priority-selector")).toBeInTheDocument();
      expect(screen.getByTestId("status-transition-selector")).toBeInTheDocument();
      expect(screen.getByTestId("apply-status-btn")).toBeInTheDocument();
    });

    it("renders staff operational panel for ADMINISTRATOR user", async () => {
      renderDetailWithAuth(mockNewTicket, mockAdminUser);

      await waitFor(() => {
        expect(screen.getByTestId("staff-operations-panel")).toBeInTheDocument();
      });
    });

    it("does NOT render staff operational panel for REQUESTER user", async () => {
      renderDetailWithAuth(mockNewTicket, mockRequesterUser);

      await waitFor(() => {
        expect(screen.getByTestId("ticket-detail-view")).toBeInTheDocument();
      });

      expect(screen.queryByTestId("staff-operations-panel")).not.toBeInTheDocument();
    });

    it("displays contextual breadcrumb and back button for IT Staff", async () => {
      const mockOnBack = vi.fn();
      renderDetailWithAuth(mockNewTicket, mockStaffUser, mockOnBack);

      await waitFor(() => {
        expect(screen.getByText("Ticket Queue")).toBeInTheDocument();
      });

      const backBtn = screen.getByTestId("back-to-tickets-btn");
      expect(backBtn).toHaveTextContent("Back to Ticket Queue");

      fireEvent.click(backBtn);
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  describe("Claiming Ticket Action", () => {
    it("allows staff user to claim an unassigned ticket", async () => {
      const claimedTicketResponse = {
        message: "Ticket claimed successfully",
        ticket: {
          ...mockNewTicket,
          status: "OPEN",
          ownerId: 10,
          ticketOwner: "Alex Chen",
        },
      };
      (api.claimTicket as any).mockResolvedValue(claimedTicketResponse);

      renderDetailWithAuth(mockNewTicket, mockStaffUser);

      await waitFor(() => {
        expect(screen.getByTestId("claim-ticket-btn")).toBeInTheDocument();
      });

      const claimBtn = screen.getByTestId("claim-ticket-btn");
      expect(claimBtn).toHaveTextContent("Claim Ticket");
      expect(claimBtn).not.toBeDisabled();

      fireEvent.click(claimBtn);

      await waitFor(() => {
        expect(api.claimTicket).toHaveBeenCalledWith(301);
      });

      await waitFor(() => {
        expect(screen.getByTestId("operation-feedback")).toHaveTextContent(
          "You have successfully claimed this ticket."
        );
      });

      // After claiming, button shows Claimed by You and is disabled
      expect(screen.getByTestId("claim-ticket-btn")).toHaveTextContent("Claimed by You");
      expect(screen.getByTestId("claim-ticket-btn")).toBeDisabled();
      // Ticket owner is updated in details card
      expect(screen.getByTestId("detail-ticket-owner")).toHaveTextContent("Alex Chen");
      // Status updated to OPEN
      expect(screen.getByTestId("detail-status-badge")).toHaveTextContent("Status: OPEN");
    });
  });

  describe("Owner Assignment Selector", () => {
    it("loads staff assignees and allows reassigning ticket", async () => {
      const assignedTicketResponse = {
        message: "Ticket assigned successfully",
        ticket: {
          ...mockOpenTicket,
          ownerId: 11,
          ticketOwner: "Sarah Jenkins",
        },
      };
      (api.assignTicket as any).mockResolvedValue(assignedTicketResponse);

      renderDetailWithAuth(mockOpenTicket, mockStaffUser);

      await waitFor(() => {
        expect(screen.getByTestId("owner-selector")).toBeInTheDocument();
      });

      const ownerSelect = screen.getByTestId("owner-selector") as HTMLSelectElement;
      // Wait for assignees to populate
      await waitFor(() => {
        expect(ownerSelect.options.length).toBeGreaterThan(1);
      });

      // Select Sarah Jenkins (id 11)
      fireEvent.change(ownerSelect, { target: { value: "11" } });

      await waitFor(() => {
        expect(api.assignTicket).toHaveBeenCalledWith(302, 11);
      });

      await waitFor(() => {
        expect(screen.getByTestId("operation-feedback")).toHaveTextContent("Ticket assigned successfully.");
        expect(screen.getByTestId("detail-ticket-owner")).toHaveTextContent("Sarah Jenkins");
      });
    });

    it("allows unassigning ticket by selecting Unassigned", async () => {
      const unassignedTicketResponse = {
        message: "Ticket unassigned successfully",
        ticket: {
          ...mockOpenTicket,
          ownerId: null,
          ticketOwner: null,
        },
      };
      (api.assignTicket as any).mockResolvedValue(unassignedTicketResponse);

      renderDetailWithAuth(mockOpenTicket, mockStaffUser);

      await waitFor(() => {
        expect(screen.getByTestId("owner-selector")).toBeInTheDocument();
      });

      const ownerSelect = screen.getByTestId("owner-selector");
      fireEvent.change(ownerSelect, { target: { value: "" } });

      await waitFor(() => {
        expect(api.assignTicket).toHaveBeenCalledWith(302, null);
      });

      await waitFor(() => {
        expect(screen.getByTestId("operation-feedback")).toHaveTextContent("Ticket unassigned successfully.");
        expect(screen.getByTestId("detail-ticket-owner")).toHaveTextContent("Unassigned");
      });
    });
  });

  describe("IT Priority Selector", () => {
    it("allows updating IT Priority", async () => {
      const priorityResponse = {
        message: "IT Priority updated successfully",
        ticket: {
          ...mockOpenTicket,
          itPriority: "URGENT",
        },
      };
      (api.updateTicketITPriority as any).mockResolvedValue(priorityResponse);

      renderDetailWithAuth(mockOpenTicket, mockStaffUser);

      await waitFor(() => {
        expect(screen.getByTestId("it-priority-selector")).toBeInTheDocument();
      });

      const prioritySelect = screen.getByTestId("it-priority-selector");
      expect(prioritySelect).toHaveValue("HIGH");

      fireEvent.change(prioritySelect, { target: { value: "URGENT" } });

      await waitFor(() => {
        expect(api.updateTicketITPriority).toHaveBeenCalledWith(302, "URGENT");
      });

      await waitFor(() => {
        expect(screen.getByTestId("operation-feedback")).toHaveTextContent("IT Priority updated to URGENT.");
        expect(screen.getByTestId("detail-it-priority-badge")).toHaveTextContent("Priority: URGENT");
      });
    });
  });

  describe("BR-14 Status Transition Matrix", () => {
    it("enforces permitted next statuses for NEW status (OPEN, CANCELLED)", async () => {
      renderDetailWithAuth(mockNewTicket, mockStaffUser);

      await waitFor(() => {
        expect(screen.getByTestId("status-transition-selector")).toBeInTheDocument();
      });

      const statusSelect = screen.getByTestId("status-transition-selector") as HTMLSelectElement;
      const optionValues = Array.from(statusSelect.options).map((o) => o.value);

      expect(optionValues).toEqual(["", "OPEN", "CANCELLED"]);
    });

    it("enforces permitted next statuses for OPEN status (IN_PROGRESS, WAITING_FOR_REQUESTER, RESOLVED, CANCELLED)", async () => {
      renderDetailWithAuth(mockOpenTicket, mockStaffUser);

      await waitFor(() => {
        expect(screen.getByTestId("status-transition-selector")).toBeInTheDocument();
      });

      const statusSelect = screen.getByTestId("status-transition-selector") as HTMLSelectElement;
      const optionValues = Array.from(statusSelect.options).map((o) => o.value);

      expect(optionValues).toEqual([
        "",
        "IN_PROGRESS",
        "WAITING_FOR_REQUESTER",
        "RESOLVED",
        "CANCELLED",
      ]);
    });

    it("enforces permitted next statuses for RESOLVED status (CLOSED, REOPENED)", async () => {
      const resolvedTicket = { ...mockOpenTicket, status: "RESOLVED" };
      renderDetailWithAuth(resolvedTicket, mockStaffUser);

      await waitFor(() => {
        expect(screen.getByTestId("status-transition-selector")).toBeInTheDocument();
      });

      const statusSelect = screen.getByTestId("status-transition-selector") as HTMLSelectElement;
      const optionValues = Array.from(statusSelect.options).map((o) => o.value);

      expect(optionValues).toEqual(["", "CLOSED", "REOPENED"]);
    });

    it("applies status transition successfully when user selects a status and clicks Apply", async () => {
      const updatedTicketResponse = {
        message: "Status updated successfully",
        ticket: {
          ...mockOpenTicket,
          status: "IN_PROGRESS",
        },
      };
      (api.updateTicketStatus as any).mockResolvedValue(updatedTicketResponse);

      renderDetailWithAuth(mockOpenTicket, mockStaffUser);

      await waitFor(() => {
        expect(screen.getByTestId("status-transition-selector")).toBeInTheDocument();
      });

      const statusSelect = screen.getByTestId("status-transition-selector");
      const applyBtn = screen.getByTestId("apply-status-btn");

      // Apply button should be disabled before selecting status
      expect(applyBtn).toBeDisabled();

      fireEvent.change(statusSelect, { target: { value: "IN_PROGRESS" } });
      expect(applyBtn).not.toBeDisabled();

      fireEvent.click(applyBtn);

      await waitFor(() => {
        expect(api.updateTicketStatus).toHaveBeenCalledWith(302, "IN_PROGRESS");
      });

      await waitFor(() => {
        expect(screen.getByTestId("operation-feedback")).toHaveTextContent(
          "Ticket status successfully changed to In Progress."
        );
        expect(screen.getByTestId("detail-status-badge")).toHaveTextContent("Status: IN_PROGRESS");
      });
    });

    it("displays error feedback when status update fails", async () => {
      (api.updateTicketStatus as any).mockRejectedValue(new Error("Invalid status transition from OPEN to CLOSED"));

      renderDetailWithAuth(mockOpenTicket, mockStaffUser);

      await waitFor(() => {
        expect(screen.getByTestId("status-transition-selector")).toBeInTheDocument();
      });

      const statusSelect = screen.getByTestId("status-transition-selector");
      const applyBtn = screen.getByTestId("apply-status-btn");

      fireEvent.change(statusSelect, { target: { value: "RESOLVED" } });
      fireEvent.click(applyBtn);

      await waitFor(() => {
        expect(screen.getByTestId("operation-feedback")).toHaveTextContent(
          "Invalid status transition from OPEN to CLOSED"
        );
      });
    });
  });
});
