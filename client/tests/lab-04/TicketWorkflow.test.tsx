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
    fetchTicketActions: vi.fn().mockResolvedValue([]),
    fetchPublicComments: vi.fn().mockResolvedValue([]),
    fetchInternalNotes: vi.fn().mockResolvedValue([]),
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
];

const baseTicket: api.TicketResponse = {
  id: 301,
  ticketNumber: "TKT-2026-000301",
  requesterId: 5,
  categoryId: 1,
  relatedSystemId: 3,
  summary: "VPN connectivity issue",
  description: "Unable to establish VPN connection from home office.",
  requestedPriority: "HIGH",
  itPriority: "HIGH",
  status: "OPEN",
  ownerId: 10,
  ticketOwner: "Alex Chen",
  isResolutionIndicated: false,
  createdAt: "2026-09-15T09:00:00.000Z",
  updatedAt: "2026-09-15T10:00:00.000Z",
  category: { id: 1, name: "Network" },
  relatedSystem: { id: 3, name: "VPN Gateway" },
  requester: { id: 5, name: "Alice Smith", email: "alice@toktickit.dev", fullName: "Alice Smith" },
};

function renderTicketDetail(user: api.AuthUser = mockStaffUser, ticket: api.TicketResponse = baseTicket) {
  vi.mocked(api.fetchTicketDetail).mockResolvedValue(ticket);
  vi.mocked(api.fetchStaffAssignees).mockResolvedValue(mockAssignees);
  vi.mocked(api.fetchTicketActions).mockResolvedValue([]);

  const authValue = {
    user,
    token: "mock-token",
    isLoading: false,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
    changePassword: vi.fn(),
    refreshUser: vi.fn(),
  };

  const reqValue = {
    selectedRequester: null,
    requesters: [],
    isLoading: false,
    error: null,
    isModalOpen: false,
    selectRequester: vi.fn(),
    openSelectorModal: vi.fn(),
    closeSelectorModal: vi.fn(),
    refreshRequesters: vi.fn(),
  };

  return render(
    <AuthContext.Provider value={authValue}>
      <RequesterContext.Provider value={reqValue}>
        <TicketDetailView ticketId={ticket.id} onBack={vi.fn()} />
      </RequesterContext.Provider>
    </AuthContext.Provider>
  );
}

describe("Ticket Workflow Hardening, Resolution Gate & UI Guards (UI-06 / Issue 35)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("UI-06a: renders prominent green advisory banner when requester indicated problem resolved", async () => {
    const ticketWithIndication: api.TicketResponse = {
      ...baseTicket,
      isResolutionIndicated: true,
    };

    renderTicketDetail(mockStaffUser, ticketWithIndication);

    expect(await screen.findByTestId("resolution-indicated-banner")).toBeInTheDocument();
    expect(screen.getByTestId("resolution-indicated-banner")).toHaveTextContent(
      "The requester indicated that the problem appears resolved. Awaiting IT Staff confirmation and formal closure."
    );
  });

  it("UI-06b: does not render resolution banner when isResolutionIndicated is false", async () => {
    renderTicketDetail(mockStaffUser, { ...baseTicket, isResolutionIndicated: false });

    expect(await screen.findByTestId("staff-operations-panel")).toBeInTheDocument();
    expect(screen.queryByTestId("resolution-indicated-banner")).not.toBeInTheDocument();
  });

  it("UI-06c: dynamically restricts status transition dropdown to permitted next statuses per BR-07 (OPEN ticket)", async () => {
    // OPEN ticket can transition to IN_PROGRESS, WAITING_FOR_REQUESTER, PENDING, CANCELLED (cannot skip to RESOLVED)
    renderTicketDetail(mockStaffUser, { ...baseTicket, status: "OPEN" });

    expect(await screen.findByTestId("status-transition-selector")).toBeInTheDocument();
    const statusSelect = screen.getByTestId("status-transition-selector") as HTMLSelectElement;
    const optionValues = Array.from(statusSelect.options).map((o) => o.value).filter(Boolean);

    expect(optionValues).toContain("IN_PROGRESS");
    expect(optionValues).toContain("WAITING_FOR_REQUESTER");
    expect(optionValues).toContain("PENDING");
    expect(optionValues).toContain("CANCELLED");
    expect(optionValues).not.toContain("RESOLVED");
  });

  it("UI-06d: permits transition to RESOLVED when ticket is IN_PROGRESS per BR-07", async () => {
    renderTicketDetail(mockStaffUser, { ...baseTicket, status: "IN_PROGRESS" });

    expect(await screen.findByTestId("status-transition-selector")).toBeInTheDocument();
    const statusSelect = screen.getByTestId("status-transition-selector") as HTMLSelectElement;
    const optionValues = Array.from(statusSelect.options).map((o) => o.value).filter(Boolean);

    expect(optionValues).toContain("RESOLVED");
    expect(optionValues).toContain("WAITING_FOR_REQUESTER");
    expect(optionValues).toContain("PENDING");
    expect(optionValues).toContain("CANCELLED");
  });

  it("UI-06e: disables status transition select when ticket is in terminal state CLOSED per BR-07", async () => {
    renderTicketDetail(mockStaffUser, { ...baseTicket, status: "CLOSED" });

    expect(await screen.findByTestId("staff-operations-panel")).toBeInTheDocument();
    const statusSelect = screen.getByTestId("status-transition-selector") as HTMLSelectElement;
    expect(statusSelect).toBeDisabled();
    const optionValues = Array.from(statusSelect.options).map((o) => o.value).filter(Boolean);
    expect(optionValues).toHaveLength(0);
  });

  it("UI-06f: displays error banner when transitioning to RESOLVED is rejected due to pending child actions (BR-08)", async () => {
    vi.mocked(api.updateTicketStatus).mockRejectedValueOnce(
      new Error("Cannot resolve ticket: all child actions taken must be completed or cancelled first")
    );

    renderTicketDetail(mockStaffUser, { ...baseTicket, status: "IN_PROGRESS" });

    expect(await screen.findByTestId("status-transition-selector")).toBeInTheDocument();
    const statusSelect = screen.getByTestId("status-transition-selector");
    fireEvent.change(statusSelect, { target: { value: "RESOLVED" } });

    const applyBtn = screen.getByTestId("apply-status-btn");
    fireEvent.click(applyBtn);

    expect(await screen.findByTestId("operation-feedback")).toBeInTheDocument();
    expect(screen.getByTestId("operation-feedback")).toHaveTextContent(
      "Cannot resolve ticket: all child actions taken must be completed or cancelled first"
    );
  });

  it("UI-06g: displays conflict error banner when update is rejected due to concurrent modification (409 Conflict)", async () => {
    vi.mocked(api.updateTicketStatus).mockRejectedValueOnce(
      new Error("Conflict: Ticket has been modified by another user")
    );

    renderTicketDetail(mockStaffUser, { ...baseTicket, status: "IN_PROGRESS" });

    expect(await screen.findByTestId("status-transition-selector")).toBeInTheDocument();
    const statusSelect = screen.getByTestId("status-transition-selector");
    fireEvent.change(statusSelect, { target: { value: "WAITING_FOR_REQUESTER" } });

    const applyBtn = screen.getByTestId("apply-status-btn");
    fireEvent.click(applyBtn);

    expect(await screen.findByTestId("operation-feedback")).toBeInTheDocument();
    expect(screen.getByTestId("operation-feedback")).toHaveTextContent(
      "Conflict: Ticket has been modified by another user"
    );
  });

  it("UI-06h: hides staff operations panel when viewed by a Requester", async () => {
    renderTicketDetail(mockRequesterUser, baseTicket);

    expect(await screen.findByTestId("ticket-detail-view")).toBeInTheDocument();
    expect(screen.queryByTestId("staff-operations-panel")).not.toBeInTheDocument();
  });

  it("UI-06i: displays Reopen Ticket button and banner for Requester when ticket is RESOLVED", async () => {
    renderTicketDetail(mockRequesterUser, { ...baseTicket, status: "RESOLVED" });

    expect(await screen.findByTestId("ticket-detail-view")).toBeInTheDocument();
    expect(screen.getByTestId("reopen-ticket-btn")).toBeInTheDocument();
    expect(screen.getByTestId("requester-reopen-banner")).toBeInTheDocument();
    expect(screen.getByTestId("banner-reopen-ticket-btn")).toBeInTheDocument();
  });

  it("UI-06j: allows Requester to submit reopen request with reason and updates ticket status to REOPENED", async () => {
    vi.mocked(api.updateTicketStatus).mockResolvedValueOnce({
      message: "Ticket status successfully changed to REOPENED",
      ticket: { ...baseTicket, status: "REOPENED" },
    });

    renderTicketDetail(mockRequesterUser, { ...baseTicket, status: "RESOLVED" });

    expect(await screen.findByTestId("reopen-ticket-btn")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("reopen-ticket-btn"));

    // Modal appears
    expect(await screen.findByTestId("reopen-ticket-modal")).toBeInTheDocument();
    const reasonInput = screen.getByTestId("reopen-reason-input");
    fireEvent.change(reasonInput, { target: { value: "VPN error returned after laptop restart" } });

    const confirmBtn = screen.getByTestId("confirm-reopen-btn");
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(api.updateTicketStatus).toHaveBeenCalledWith(
        301,
        "REOPENED",
        baseTicket.updatedAt,
        "VPN error returned after laptop restart"
      );
    });

    expect(await screen.findByTestId("operation-feedback")).toHaveTextContent(
      "Ticket has been successfully reopened."
    );
  });

  it("UI-06k: renders resolution note textarea when Staff selects RESOLVED and passes note to updateTicketStatus", async () => {
    vi.mocked(api.updateTicketStatus).mockResolvedValueOnce({
      message: "Ticket status successfully changed to RESOLVED",
      ticket: { ...baseTicket, status: "RESOLVED" },
    });

    renderTicketDetail(mockStaffUser, { ...baseTicket, status: "IN_PROGRESS" });

    expect(await screen.findByTestId("status-transition-selector")).toBeInTheDocument();
    const statusSelect = screen.getByTestId("status-transition-selector");

    // Initially resolution note is not rendered
    expect(screen.queryByTestId("resolution-note-input")).not.toBeInTheDocument();

    // Select RESOLVED
    fireEvent.change(statusSelect, { target: { value: "RESOLVED" } });

    // Resolution note textarea appears
    expect(await screen.findByTestId("resolution-note-input")).toBeInTheDocument();
    const noteInput = screen.getByTestId("resolution-note-input");
    fireEvent.change(noteInput, { target: { value: "Updated VPN gateway firewall rules and verified tunnel stability" } });

    const applyBtn = screen.getByTestId("apply-status-btn");
    fireEvent.click(applyBtn);

    await waitFor(() => {
      expect(api.updateTicketStatus).toHaveBeenCalledWith(
        301,
        "RESOLVED",
        baseTicket.updatedAt,
        "Updated VPN gateway firewall rules and verified tunnel stability"
      );
    });
  });
});
