import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { ActionsTakenSection, formatActionDateTime, getActionStatusStyle } from "../../src/components/ActionsTakenSection.js";
import * as api from "../../src/api.js";

// Mock the API module
vi.mock("../../src/api.js", async () => {
  const actual = await vi.importActual("../../src/api.js");
  return {
    ...actual,
    fetchTicketActions: vi.fn(),
    createTicketAction: vi.fn(),
    updateTicketAction: vi.fn(),
    transitionActionStatus: vi.fn(),
  };
});

const mockAssignees: api.StaffAssignee[] = [
  { id: 10, fullName: "Alex Chen", email: "alex@toktickit.dev", role: "IT_STAFF", isActive: true },
  { id: 2, fullName: "System Admin", email: "admin@toktickit.dev", role: "ADMINISTRATOR", isActive: true },
  { id: 99, fullName: "Inactive Staff", email: "inactive@toktickit.dev", role: "IT_STAFF", isActive: false },
];

const mockActions: api.ActionTaken[] = [
  {
    id: 1,
    ticketId: 101,
    actionDateTime: "2026-10-30T10:00:00.000Z",
    actionDescription: "Inspected network cable and replaced patch cord",
    result: "Network connectivity restored",
    performedById: 10,
    assigneeId: 10,
    status: "IN_PROGRESS",
    followUpRequired: false,
    followUpNote: null,
    attachmentNotes: "cable_diag.txt",
    createdAt: "2026-10-30T10:00:00.000Z",
    updatedAt: "2026-10-30T10:00:00.000Z",
    performedBy: { id: 10, fullName: "Alex Chen", email: "alex@toktickit.dev", role: "IT_STAFF" },
    assignee: { id: 10, fullName: "Alex Chen", email: "alex@toktickit.dev", role: "IT_STAFF" },
  },
  {
    id: 2,
    ticketId: 101,
    actionDateTime: "2026-10-30T11:30:00.000Z",
    actionDescription: "Scheduled motherboard replacement with OEM vendor",
    result: null,
    performedById: 2,
    assigneeId: null,
    status: "PENDING",
    followUpRequired: true,
    followUpNote: "Call vendor back at 14:00 for RMA tracking",
    attachmentNotes: null,
    createdAt: "2026-10-30T11:30:00.000Z",
    updatedAt: "2026-10-30T11:30:00.000Z",
    performedBy: { id: 2, fullName: "System Admin", email: "admin@toktickit.dev", role: "ADMINISTRATOR" },
    assignee: null,
  },
  {
    id: 3,
    ticketId: 101,
    actionDateTime: "2026-10-30T13:00:00.000Z",
    actionDescription: "Thermal paste reapplied and stress tests passed",
    result: "CPU temperature idle 38C, full load 72C",
    performedById: 10,
    assigneeId: 10,
    status: "COMPLETED",
    followUpRequired: false,
    followUpNote: null,
    attachmentNotes: "stress_log.png",
    createdAt: "2026-10-30T13:00:00.000Z",
    updatedAt: "2026-10-30T13:00:00.000Z",
    performedBy: { id: 10, fullName: "Alex Chen", email: "alex@toktickit.dev", role: "IT_STAFF" },
    assignee: { id: 10, fullName: "Alex Chen", email: "alex@toktickit.dev", role: "IT_STAFF" },
  },
];

describe("Lab 4: Actions Taken UI Component Suite (AC-01..05, Issue #76)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // UI-01: Table & List Rendering on Ticket Detail
  // -------------------------------------------------------------------------
  describe("UI-01: Table and List Rendering on Ticket Detail", () => {
    it("renders empty state message when no actions exist", async () => {
      vi.mocked(api.fetchTicketActions).mockResolvedValueOnce([]);

      render(
        <ActionsTakenSection
          ticketId={101}
          isStaffOrAdmin={true}
          assignees={mockAssignees}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId("actions-empty-state")).toBeInTheDocument();
      });

      expect(screen.getByText(/No actions recorded yet/i)).toBeInTheDocument();
      expect(screen.getByTestId("actions-count-badge")).toHaveTextContent("0 Actions Recorded");
    });

    it("renders list of actions taken with performer, assignee, status badges, and date", async () => {
      vi.mocked(api.fetchTicketActions).mockResolvedValueOnce(mockActions);

      render(
        <ActionsTakenSection
          ticketId={101}
          isStaffOrAdmin={true}
          assignees={mockAssignees}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId("action-row-1")).toBeInTheDocument();
      });

      // Total count badge
      expect(screen.getByTestId("actions-count-badge")).toHaveTextContent("3 Actions Recorded");

      // Action 1 details in table row
      const row1 = screen.getByTestId("action-row-1");
      expect(within(row1).getByText("Inspected network cable and replaced patch cord")).toBeInTheDocument();
      expect(within(row1).getByText("Network connectivity restored")).toBeInTheDocument();
      expect(screen.getByTestId("action-status-badge-1")).toHaveTextContent("In Progress");

      // Action 2 follow-up indicator
      expect(screen.getByTestId("action-follow-up-2")).toHaveTextContent("Yes");

      // Action 3 terminal status
      expect(screen.getByTestId("action-status-badge-3")).toHaveTextContent("Completed");

      // Responsive mobile cards rendered
      expect(screen.getByTestId("action-card-1")).toBeInTheDocument();
      expect(screen.getByTestId("action-card-2")).toBeInTheDocument();
      expect(screen.getByTestId("action-card-3")).toBeInTheDocument();

      // Mobile card 1 content
      const card1 = screen.getByTestId("action-card-1");
      expect(within(card1).getByText("Inspected network cable and replaced patch cord")).toBeInTheDocument();
    });

    it("notifies parent of action count via onActionCountChange callback", async () => {
      vi.mocked(api.fetchTicketActions).mockResolvedValueOnce(mockActions);
      const onActionCountChange = vi.fn();

      render(
        <ActionsTakenSection
          ticketId={101}
          isStaffOrAdmin={true}
          assignees={mockAssignees}
          onActionCountChange={onActionCountChange}
        />
      );

      await waitFor(() => {
        expect(onActionCountChange).toHaveBeenCalledWith(3);
      });
    });
  });

  // -------------------------------------------------------------------------
  // UI-02: Create Action Taken Modal & Follow-Up Validation
  // -------------------------------------------------------------------------
  describe("UI-02: Create Action Taken Modal & Follow-Up Validation", () => {
    it("opens create modal and validates required description min length", async () => {
      vi.mocked(api.fetchTicketActions).mockResolvedValueOnce([]);

      render(
        <ActionsTakenSection
          ticketId={101}
          isStaffOrAdmin={true}
          assignees={mockAssignees}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId("add-action-btn")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("add-action-btn"));

      expect(screen.getByTestId("action-modal")).toBeInTheDocument();
      expect(screen.getByTestId("action-modal-title")).toHaveTextContent("Record Action Taken");

      // Populate description with fewer than 5 characters
      fireEvent.change(screen.getByTestId("action-description-input"), {
        target: { value: "fix" },
      });

      fireEvent.click(screen.getByTestId("save-action-btn"));

      expect(screen.getByTestId("action-form-error")).toHaveTextContent(
        "Action description must be at least 5 characters."
      );
      expect(screen.getByTestId("action-description-input")).toHaveClass("is-invalid");
      expect(screen.getByTestId("field-error-actionDescription")).toHaveTextContent(
        "Action description must be at least 5 characters."
      );
      expect(api.createTicketAction).not.toHaveBeenCalled();
    });

    it("dynamically shows and requires follow-up note when toggle is enabled", async () => {
      vi.mocked(api.fetchTicketActions).mockResolvedValueOnce([]);

      render(
        <ActionsTakenSection
          ticketId={101}
          isStaffOrAdmin={true}
          assignees={mockAssignees}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId("add-action-btn")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("add-action-btn"));

      // Initially follow-up note input is not displayed
      expect(screen.queryByTestId("follow-up-note-input")).not.toBeInTheDocument();

      // Toggle follow-up switch ON
      const toggle = screen.getByTestId("follow-up-toggle");
      fireEvent.click(toggle);

      // Follow-up note input becomes visible
      expect(screen.getByTestId("follow-up-note-input")).toBeInTheDocument();

      // Enter valid description but leave follow-up note empty
      fireEvent.change(screen.getByTestId("action-description-input"), {
        target: { value: "Configured firewall routing rules" },
      });

      fireEvent.click(screen.getByTestId("save-action-btn"));

      expect(screen.getByTestId("action-form-error")).toHaveTextContent(
        "Follow-up note is required (minimum 5 characters) when follow-up is checked."
      );
      expect(screen.getByTestId("follow-up-note-input")).toHaveClass("is-invalid");
      expect(screen.getByTestId("field-error-followUpNote")).toHaveTextContent(
        "Follow-up note is required (minimum 5 characters) when follow-up is checked."
      );
      expect(api.createTicketAction).not.toHaveBeenCalled();
    });

    it("requires result when status is COMPLETED", async () => {
      vi.mocked(api.fetchTicketActions).mockResolvedValueOnce([]);

      render(
        <ActionsTakenSection
          ticketId={101}
          isStaffOrAdmin={true}
          assignees={mockAssignees}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId("add-action-btn")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("add-action-btn"));

      fireEvent.change(screen.getByTestId("action-description-input"), {
        target: { value: "Cleaned dusty fans and reconnected cables" },
      });

      // Change status to COMPLETED
      fireEvent.change(screen.getByTestId("action-status-select"), {
        target: { value: "COMPLETED" },
      });

      fireEvent.click(screen.getByTestId("save-action-btn"));

      expect(screen.getByTestId("action-form-error")).toHaveTextContent(
        "Result/Outcome is required when status is marked as Completed."
      );
      expect(screen.getByTestId("action-result-input")).toHaveClass("is-invalid");
      expect(screen.getByTestId("field-error-result")).toHaveTextContent(
        "Result/Outcome is required when status is marked as Completed."
      );
      expect(api.createTicketAction).not.toHaveBeenCalled();
    });

    it("handles inactive assignee rejection with HTTP 422 and field-level error highlighting", async () => {
      vi.mocked(api.fetchTicketActions).mockResolvedValueOnce([]);

      const inactiveErr = new Error("Assignee must be an active IT Staff or Administrator account");
      (inactiveErr as any).status = 422;
      (inactiveErr as any).field = "assigneeId";
      vi.mocked(api.createTicketAction).mockRejectedValueOnce(inactiveErr);

      render(
        <ActionsTakenSection
          ticketId={101}
          isStaffOrAdmin={true}
          assignees={mockAssignees}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId("add-action-btn")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("add-action-btn"));

      fireEvent.change(screen.getByTestId("action-description-input"), {
        target: { value: "Configured backup sync job on server" },
      });

      // Assert inactive option is NOT disabled and can be selected
      const assigneeSelect = screen.getByTestId("action-assignee-select");
      const inactiveOption = screen.getByRole("option", { name: /Inactive Staff/i });
      expect(inactiveOption).not.toBeDisabled();

      fireEvent.change(assigneeSelect, {
        target: { value: "99" },
      });

      fireEvent.click(screen.getByTestId("save-action-btn"));

      await waitFor(() => {
        expect(api.createTicketAction).toHaveBeenCalledWith(
          101,
          expect.objectContaining({
            assigneeId: 99,
          })
        );
      });

      // Verify top alert and inline field highlighting on assigneeId
      await waitFor(() => {
        expect(screen.getByTestId("action-form-error")).toHaveTextContent(
          "Assignee must be an active IT Staff or Administrator account"
        );
      });

      expect(assigneeSelect).toHaveClass("is-invalid");
      expect(screen.getByTestId("field-error-assigneeId")).toHaveTextContent(
        "Assignee must be an active IT Staff or Administrator account"
      );
    });

    it("successfully creates action taken and appends to the table", async () => {
      vi.mocked(api.fetchTicketActions).mockResolvedValueOnce([]);

      const createdAction: api.ActionTaken = {
        id: 99,
        ticketId: 101,
        actionDateTime: "2026-10-30T14:00:00.000Z",
        actionDescription: "Replaced faulty RAM module in slot 2",
        result: "System booted normally with 32GB detected",
        performedById: 10,
        assigneeId: 10,
        status: "COMPLETED",
        followUpRequired: true,
        followUpNote: "Run memory benchmark tomorrow morning",
        attachmentNotes: "memtest86_pass.png",
        createdAt: "2026-10-30T14:00:00.000Z",
        updatedAt: "2026-10-30T14:00:00.000Z",
        performedBy: { id: 10, fullName: "Alex Chen", email: "alex@toktickit.dev", role: "IT_STAFF" },
        assignee: { id: 10, fullName: "Alex Chen", email: "alex@toktickit.dev", role: "IT_STAFF" },
      };

      vi.mocked(api.createTicketAction).mockResolvedValueOnce(createdAction);

      render(
        <ActionsTakenSection
          ticketId={101}
          isStaffOrAdmin={true}
          assignees={mockAssignees}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId("add-action-btn")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("add-action-btn"));

      fireEvent.change(screen.getByTestId("action-description-input"), {
        target: { value: "Replaced faulty RAM module in slot 2" },
      });
      fireEvent.change(screen.getByTestId("action-status-select"), {
        target: { value: "COMPLETED" },
      });
      fireEvent.change(screen.getByTestId("action-result-input"), {
        target: { value: "System booted normally with 32GB detected" },
      });
      fireEvent.change(screen.getByTestId("action-assignee-select"), {
        target: { value: "10" },
      });

      // Follow-up
      fireEvent.click(screen.getByTestId("follow-up-toggle"));
      fireEvent.change(screen.getByTestId("follow-up-note-input"), {
        target: { value: "Run memory benchmark tomorrow morning" },
      });

      // Attachment notes
      fireEvent.change(screen.getByTestId("attachment-notes-input"), {
        target: { value: "memtest86_pass.png" },
      });

      fireEvent.click(screen.getByTestId("save-action-btn"));

      await waitFor(() => {
        expect(api.createTicketAction).toHaveBeenCalledTimes(1);
      });

      expect(api.createTicketAction).toHaveBeenCalledWith(
        101,
        expect.objectContaining({
          actionDescription: "Replaced faulty RAM module in slot 2",
          result: "System booted normally with 32GB detected",
          assigneeId: 10,
          status: "COMPLETED",
          followUpRequired: true,
          followUpNote: "Run memory benchmark tomorrow morning",
          attachmentNotes: "memtest86_pass.png",
        })
      );

      // Verify modal closes and new action appears in table
      await waitFor(() => {
        expect(screen.queryByTestId("action-modal")).not.toBeInTheDocument();
      });

      expect(screen.getByTestId("action-row-99")).toBeInTheDocument();
      expect(screen.getByTestId("actions-count-badge")).toHaveTextContent("1 Action Recorded");
    });
  });

  // -------------------------------------------------------------------------
  // UI-03: Requester View Read-Only Presentation
  // -------------------------------------------------------------------------
  describe("UI-03: Requester Read-Only View", () => {
    it("hides '+ Add Action Taken', 'Edit', and transition controls for Requesters", async () => {
      vi.mocked(api.fetchTicketActions).mockResolvedValueOnce(mockActions);

      render(
        <ActionsTakenSection
          ticketId={101}
          isStaffOrAdmin={false}
          assignees={mockAssignees}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId("action-row-1")).toBeInTheDocument();
      });

      // + Add Action button must be completely absent
      expect(screen.queryByTestId("add-action-btn")).not.toBeInTheDocument();

      // Edit and Status transition buttons on rows must be absent
      expect(screen.queryByTestId("edit-action-btn-1")).not.toBeInTheDocument();
      expect(screen.queryByTestId("transition-action-btn-1")).not.toBeInTheDocument();
      expect(screen.queryByTestId("edit-action-btn-2")).not.toBeInTheDocument();
      expect(screen.queryByTestId("transition-action-btn-2")).not.toBeInTheDocument();

      // Mobile touch action buttons also absent
      expect(screen.queryByTestId("mobile-edit-btn-1")).not.toBeInTheDocument();
      expect(screen.queryByTestId("mobile-transition-btn-1")).not.toBeInTheDocument();

      // Requesters can still read descriptions and statuses
      expect(within(screen.getByTestId("action-row-1")).getByText("Inspected network cable and replaced patch cord")).toBeInTheDocument();
      expect(within(screen.getByTestId("action-row-2")).getByText("Scheduled motherboard replacement with OEM vendor")).toBeInTheDocument();
    });

    it("displays friendly message if requester receives 403 on non-owned ticket", async () => {
      const err = new Error("Forbidden");
      (err as any).status = 403;
      vi.mocked(api.fetchTicketActions).mockRejectedValueOnce(err);

      render(
        <ActionsTakenSection
          ticketId={999}
          isStaffOrAdmin={false}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId("actions-fetch-error")).toBeInTheDocument();
      });

      expect(screen.getByText(/You do not have permission to view actions for this ticket/i)).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Terminal State & Edit Functionality
  // -------------------------------------------------------------------------
  describe("Terminal State Protection and Edit Functionality", () => {
    it("locks completed and cancelled actions preventing edits or transitions", async () => {
      vi.mocked(api.fetchTicketActions).mockResolvedValueOnce(mockActions);

      render(
        <ActionsTakenSection
          ticketId={101}
          isStaffOrAdmin={true}
          assignees={mockAssignees}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId("action-row-3")).toBeInTheDocument();
      });

      // Action 3 is COMPLETED -> must show 'Locked' in table row and no edit/transition buttons
      expect(screen.queryByTestId("edit-action-btn-3")).not.toBeInTheDocument();
      expect(screen.queryByTestId("transition-action-btn-3")).not.toBeInTheDocument();
      expect(within(screen.getByTestId("action-row-3")).getByText("Locked")).toBeInTheDocument();

      // Action 1 is IN_PROGRESS -> must have Edit and Transition buttons
      expect(screen.getByTestId("edit-action-btn-1")).toBeInTheDocument();
      expect(screen.getByTestId("transition-action-btn-1")).toBeInTheDocument();
    });

    it("opens edit modal with existing values and updates action", async () => {
      vi.mocked(api.fetchTicketActions).mockResolvedValueOnce([mockActions[0]]);

      const updatedAction: api.ActionTaken = {
        ...mockActions[0],
        actionDescription: "Inspected network cable and replaced patch cord with Cat6 shielded",
        result: "Gigabit link negotiated successfully",
        updatedAt: "2026-10-30T10:15:00.000Z",
      };

      vi.mocked(api.updateTicketAction).mockResolvedValueOnce(updatedAction);

      render(
        <ActionsTakenSection
          ticketId={101}
          isStaffOrAdmin={true}
          assignees={mockAssignees}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId("edit-action-btn-1")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("edit-action-btn-1"));

      expect(screen.getByTestId("action-modal")).toBeInTheDocument();
      expect(screen.getByTestId("action-modal-title")).toHaveTextContent("Edit Action Taken");
      expect(screen.getByTestId("action-description-input")).toHaveValue(
        "Inspected network cable and replaced patch cord"
      );

      // Modify description and result
      fireEvent.change(screen.getByTestId("action-description-input"), {
        target: { value: "Inspected network cable and replaced patch cord with Cat6 shielded" },
      });
      fireEvent.change(screen.getByTestId("action-result-input"), {
        target: { value: "Gigabit link negotiated successfully" },
      });

      fireEvent.click(screen.getByTestId("save-action-btn"));

      await waitFor(() => {
        expect(api.updateTicketAction).toHaveBeenCalledTimes(1);
      });

      expect(api.updateTicketAction).toHaveBeenCalledWith(
        101,
        1,
        expect.objectContaining({
          actionDescription: "Inspected network cable and replaced patch cord with Cat6 shielded",
          result: "Gigabit link negotiated successfully",
          expectedUpdatedAt: "2026-10-30T10:00:00.000Z",
        })
      );

      await waitFor(() => {
        const row = screen.getByTestId("action-row-1");
        expect(within(row).getByText("Inspected network cable and replaced patch cord with Cat6 shielded")).toBeInTheDocument();
      });
    });

    it("handles 409 conflict during edit by displaying optimistic lock conflict message", async () => {
      vi.mocked(api.fetchTicketActions).mockResolvedValueOnce([mockActions[0]]);

      const conflictErr = new Error("Stale update conflict");
      (conflictErr as any).status = 409;
      vi.mocked(api.updateTicketAction).mockRejectedValueOnce(conflictErr);

      render(
        <ActionsTakenSection
          ticketId={101}
          isStaffOrAdmin={true}
          assignees={mockAssignees}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId("edit-action-btn-1")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("edit-action-btn-1"));

      fireEvent.change(screen.getByTestId("action-description-input"), {
        target: { value: "Attempt concurrent edit description" },
      });

      fireEvent.click(screen.getByTestId("save-action-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("action-form-error")).toBeInTheDocument();
      });

      expect(screen.getByTestId("action-form-error")).toHaveTextContent(
        /Conflict: This action was modified by another user/i
      );
    });

    it("supports quick inline status transition from row", async () => {
      vi.mocked(api.fetchTicketActions).mockResolvedValueOnce([mockActions[1]]); // PENDING action

      const transitionedAction: api.ActionTaken = {
        ...mockActions[1],
        status: "IN_PROGRESS",
        updatedAt: "2026-10-30T11:45:00.000Z",
      };

      vi.mocked(api.transitionActionStatus).mockResolvedValueOnce(transitionedAction);

      render(
        <ActionsTakenSection
          ticketId={101}
          isStaffOrAdmin={true}
          assignees={mockAssignees}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId("transition-action-btn-2")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("transition-action-btn-2"));

      expect(screen.getByTestId("transition-panel-2")).toBeInTheDocument();
      expect(screen.getByTestId("transition-select-2")).toBeInTheDocument();

      // Change to IN_PROGRESS and confirm
      fireEvent.change(screen.getByTestId("transition-select-2"), {
        target: { value: "IN_PROGRESS" },
      });

      fireEvent.click(screen.getByTestId("transition-confirm-btn-2"));

      await waitFor(() => {
        expect(api.transitionActionStatus).toHaveBeenCalledWith(101, 2, {
          status: "IN_PROGRESS",
          result: undefined,
        });
      });

      await waitFor(() => {
        expect(screen.getByTestId("action-status-badge-2")).toHaveTextContent("In Progress");
      });
    });
  });

  // -------------------------------------------------------------------------
  // Helpers: formatActionDateTime and getActionStatusStyle
  // -------------------------------------------------------------------------
  describe("Helper Functions", () => {
    it("formats ISO date string into 'DD MMM YYYY, HH:mm'", () => {
      const formatted = formatActionDateTime("2026-10-30T10:00:00.000Z");
      expect(formatted).toMatch(/\d{2} [A-Z][a-z]{2} 2026, \d{2}:\d{2}/);
    });

    it("returns correct design system badge tokens for each action status", () => {
      expect(getActionStatusStyle("PENDING")).toEqual(
        expect.objectContaining({ bg: "#E2E8F0", color: "#475569", label: "Pending" })
      );
      expect(getActionStatusStyle("IN_PROGRESS")).toEqual(
        expect.objectContaining({ bg: "#FEF3C7", color: "#B45309", label: "In Progress" })
      );
      expect(getActionStatusStyle("COMPLETED")).toEqual(
        expect.objectContaining({ bg: "#D1FAE5", color: "#065F46", label: "Completed" })
      );
      expect(getActionStatusStyle("CANCELLED")).toEqual(
        expect.objectContaining({ bg: "#FEE2E2", color: "#991B1B", label: "Cancelled" })
      );
    });
  });
});
