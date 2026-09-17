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
    fetchTicketComments: vi.fn(),
    createTicketComment: vi.fn(),
    fetchTicketNotes: vi.fn(),
    createTicketNote: vi.fn(),
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

const mockTicket: api.TicketResponse = {
  id: 401,
  ticketNumber: "TKT-2026-000401",
  requesterId: 5,
  categoryId: 1,
  relatedSystemId: 3,
  summary: "Laptop battery drains rapidly",
  description: "Battery discharges from 100% to 10% in under an hour.",
  requestedPriority: "MEDIUM",
  itPriority: "HIGH",
  status: "OPEN",
  isResolutionIndicated: false,
  createdAt: "2026-09-16T10:00:00.000Z",
  category: { id: 1, name: "Hardware" },
  relatedSystem: { id: 3, name: "Corporate Laptop" },
  requester: { id: 5, name: "Alice Smith", fullName: "Alice Smith", email: "alice@toktickit.dev" },
  ticketOwner: "Alex Chen",
  ownerId: 10,
};

const mockComments: api.PublicCommentResponse[] = [
  {
    id: 1,
    ticketId: 401,
    authorId: 5,
    content: "I ran the battery report as requested.",
    createdAt: "2026-09-16T11:00:00.000Z",
    author: {
      id: 5,
      fullName: "Alice Smith",
      role: "REQUESTER",
    },
  },
  {
    id: 2,
    ticketId: 401,
    authorId: 10,
    content: "Thank you. We have ordered a replacement battery module.",
    createdAt: "2026-09-16T11:30:00.000Z",
    author: {
      id: 10,
      fullName: "Alex Chen",
      role: "IT_STAFF",
    },
  },
];

const mockNotes: api.InternalNoteResponse[] = [
  {
    id: 101,
    ticketId: 401,
    authorId: 10,
    content: "Battery cycle count is 840 (exceeds 500 threshold). Warranty claim #W-9921 filed.",
    createdAt: "2026-09-16T11:15:00.000Z",
    author: {
      id: 10,
      fullName: "Alex Chen",
      role: "IT_STAFF",
    },
  },
];

function renderDetailWithAuth(
  user: api.AuthUser = mockStaffUser,
  ticketData: api.TicketResponse = mockTicket
) {
  (api.fetchTicketDetail as any).mockResolvedValue(ticketData);
  (api.fetchStaffAssignees as any).mockResolvedValue([]);
  (api.fetchTicketComments as any).mockResolvedValue(mockComments);
  (api.fetchTicketNotes as any).mockResolvedValue(mockNotes);

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
        <TicketDetailView ticketId={ticketData.id} onBack={vi.fn()} />
      </RequesterContext.Provider>
    </AuthContext.Provider>
  );
}

describe("Public Comments & Private Internal Notes (Issue 25 / UI-04)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // 1. PUBLIC COMMENTS TAB
  // ===========================================================================
  describe("Public Comments Tab & Functionality", () => {
    it("renders Public Comments tab for all roles (Requester, Staff, Admin)", async () => {
      // 1. Requester
      const { unmount: u1 } = renderDetailWithAuth(mockRequesterUser);
      await waitFor(() => {
        expect(screen.getByTestId("tab-comments")).toBeInTheDocument();
      });
      u1();

      // 2. IT Staff
      const { unmount: u2 } = renderDetailWithAuth(mockStaffUser);
      await waitFor(() => {
        expect(screen.getByTestId("tab-comments")).toBeInTheDocument();
      });
      u2();

      // 3. Admin
      renderDetailWithAuth(mockAdminUser);
      await waitFor(() => {
        expect(screen.getByTestId("tab-comments")).toBeInTheDocument();
      });
    });

    it("displays comments list when Public Comments tab is clicked", async () => {
      renderDetailWithAuth(mockRequesterUser);

      await waitFor(() => {
        expect(screen.getByTestId("tab-comments")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("tab-comments"));

      await waitFor(() => {
        expect(screen.getByTestId("public-comments-section")).toBeInTheDocument();
      });

      // Verify comments rendered
      const commentItems = screen.getAllByTestId("comment-item");
      expect(commentItems.length).toBe(2);
      expect(screen.getByText("I ran the battery report as requested.")).toBeInTheDocument();
      expect(screen.getByText("Thank you. We have ordered a replacement battery module.")).toBeInTheDocument();
    });

    it("allows submitting a public comment and updates comments list", async () => {
      const newCommentResponse = {
        message: "Comment added successfully",
        comment: {
          id: 3,
          ticketId: 401,
          authorId: 5,
          content: "I will drop off the laptop tomorrow morning.",
          createdAt: new Date().toISOString(),
          author: { id: 5, fullName: "Alice Smith", role: "REQUESTER" },
        },
      };
      (api.createTicketComment as any).mockResolvedValue(newCommentResponse);

      renderDetailWithAuth(mockRequesterUser);

      await waitFor(() => {
        expect(screen.getByTestId("tab-comments")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("tab-comments"));

      await waitFor(() => {
        expect(screen.getByTestId("comment-input")).toBeInTheDocument();
      });

      const input = screen.getByTestId("comment-input");
      const submitBtn = screen.getByTestId("submit-comment-btn");

      // Submit button is disabled when empty
      expect(submitBtn).toBeDisabled();

      fireEvent.change(input, { target: { value: "I will drop off the laptop tomorrow morning." } });
      expect(submitBtn).not.toBeDisabled();

      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(api.createTicketComment).toHaveBeenCalledWith(
          401,
          "I will drop off the laptop tomorrow morning."
        );
      });

      await waitFor(() => {
        expect(screen.getByText("I will drop off the laptop tomorrow morning.")).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // 2. INTERNAL NOTES TAB (SECURITY & CALLOUT STYLING)
  // ===========================================================================
  describe("Internal Notes Tab (Security & Role Isolation)", () => {
    it("renders Internal Notes tab for IT Staff and Administrator users", async () => {
      // 1. Staff
      const { unmount: u1 } = renderDetailWithAuth(mockStaffUser);
      await waitFor(() => {
        expect(screen.getByTestId("tab-internal-notes")).toBeInTheDocument();
      });
      u1();

      // 2. Admin
      renderDetailWithAuth(mockAdminUser);
      await waitFor(() => {
        expect(screen.getByTestId("tab-internal-notes")).toBeInTheDocument();
      });
    });

    it("strictly HIDES the Internal Notes tab from Requester users", async () => {
      renderDetailWithAuth(mockRequesterUser);

      await waitFor(() => {
        expect(screen.getByTestId("ticket-detail-view")).toBeInTheDocument();
      });

      // Internal notes tab must not exist in DOM for Requester
      expect(screen.queryByTestId("tab-internal-notes")).not.toBeInTheDocument();
      expect(screen.queryByTestId("internal-notes-section")).not.toBeInTheDocument();
    });

    it("displays prominent yellow/amber callout styling for Internal Notes tab", async () => {
      renderDetailWithAuth(mockStaffUser);

      await waitFor(() => {
        expect(screen.getByTestId("tab-internal-notes")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("tab-internal-notes"));

      await waitFor(() => {
        expect(screen.getByTestId("internal-notes-section")).toBeInTheDocument();
      });

      // Verify amber callout heading
      expect(
        screen.getByText("Internal Notes — Visible ONLY to IT Staff & Administrator")
      ).toBeInTheDocument();

      // Verify note item content
      expect(
        screen.getByText("Battery cycle count is 840 (exceeds 500 threshold). Warranty claim #W-9921 filed.")
      ).toBeInTheDocument();
    });

    it("allows IT Staff to post an internal note and appends to list", async () => {
      const newNoteResponse = {
        message: "Internal note added successfully",
        note: {
          id: 102,
          ticketId: 401,
          authorId: 10,
          content: "Vendor approved replacement battery shipment via expedited courier.",
          createdAt: new Date().toISOString(),
          author: { id: 10, fullName: "Alex Chen", role: "IT_STAFF" },
        },
      };
      (api.createTicketNote as any).mockResolvedValue(newNoteResponse);

      renderDetailWithAuth(mockStaffUser);

      await waitFor(() => {
        expect(screen.getByTestId("tab-internal-notes")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("tab-internal-notes"));

      await waitFor(() => {
        expect(screen.getByTestId("note-input")).toBeInTheDocument();
      });

      const input = screen.getByTestId("note-input");
      const submitBtn = screen.getByTestId("submit-note-btn");

      expect(submitBtn).toBeDisabled();

      fireEvent.change(input, {
        target: { value: "Vendor approved replacement battery shipment via expedited courier." },
      });
      expect(submitBtn).not.toBeDisabled();

      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(api.createTicketNote).toHaveBeenCalledWith(
          401,
          "Vendor approved replacement battery shipment via expedited courier."
        );
      });

      await waitFor(() => {
        expect(
          screen.getByText("Vendor approved replacement battery shipment via expedited courier.")
        ).toBeInTheDocument();
      });
    });
  });
});
