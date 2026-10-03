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
    indicateResolution: vi.fn(),
  };
});

const mockRequesterUser = {
  id: 1,
  email: "jennifer.anderson@example.com",
  fullName: "Jennifer Anderson",
  role: "REQUESTER",
  department: "Engineering",
  mustChangePassword: false,
};

const mockOpenTicket: api.TicketResponse = {
  id: 201,
  ticketNumber: "TKT-2026-000201",
  requesterId: 1,
  categoryId: 2,
  relatedSystemId: 7,
  summary: "VPN connectivity issues on home WiFi",
  description: "Cannot establish stable VPN tunnel since update",
  requestedPriority: "MEDIUM",
  itPriority: "MEDIUM",
  status: "OPEN",
  isResolutionIndicated: false,
  createdAt: "2026-09-01T10:00:00.000Z",
  category: { id: 2, name: "Network" },
  relatedSystem: { id: 7, name: "VPN Service" },
};

function renderDetailWithAuth(
  ticketData: api.TicketResponse,
  user: any = mockRequesterUser,
  onBack: () => void = vi.fn()
) {
  (api.fetchTicketDetail as any).mockResolvedValue(ticketData);

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

describe("Requester Resolution Indication Action (Issue 21 / FR-09 / BR-19)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders 'Problem Appears Resolved' button for OPEN ticket when isResolutionIndicated is false", async () => {
    renderDetailWithAuth(mockOpenTicket);

    await waitFor(() => {
      expect(screen.getByTestId("ticket-detail-view")).toBeInTheDocument();
    });

    const resolveBtn = screen.getByTestId("indicate-resolution-btn");
    expect(resolveBtn).toBeInTheDocument();
    expect(resolveBtn).toHaveTextContent("Problem Appears Resolved");
    expect(screen.queryByTestId("resolution-indicated-banner")).not.toBeInTheDocument();
    expect(screen.queryByTestId("resolution-indicated-badge")).not.toBeInTheDocument();
  });

  it("renders 'Problem Appears Resolved' button for IN_PROGRESS ticket when isResolutionIndicated is false", async () => {
    const inProgressTicket = { ...mockOpenTicket, status: "IN_PROGRESS" };
    renderDetailWithAuth(inProgressTicket);

    await waitFor(() => {
      expect(screen.getByTestId("ticket-detail-view")).toBeInTheDocument();
    });

    expect(screen.getByTestId("indicate-resolution-btn")).toBeInTheDocument();
  });

  it("does NOT render 'Problem Appears Resolved' button when isResolutionIndicated is true and shows banner + badge", async () => {
    const alreadyIndicatedTicket: api.TicketResponse = {
      ...mockOpenTicket,
      isResolutionIndicated: true,
    };
    renderDetailWithAuth(alreadyIndicatedTicket);

    await waitFor(() => {
      expect(screen.getByTestId("ticket-detail-view")).toBeInTheDocument();
    });

    expect(screen.queryByTestId("indicate-resolution-btn")).not.toBeInTheDocument();
    expect(screen.getByTestId("resolution-indicated-badge")).toBeInTheDocument();
    expect(screen.getByTestId("resolution-indicated-badge")).toHaveTextContent("Resolution Indicated");
    expect(screen.getByTestId("resolution-indicated-banner")).toBeInTheDocument();
    expect(screen.getByTestId("resolution-indicated-banner")).toHaveTextContent(/problem appears resolved/i);
  });

  it("does NOT render 'Problem Appears Resolved' button for NEW, PENDING, or RESOLVED status", async () => {
    const newTicket = { ...mockOpenTicket, status: "NEW" };
    const { unmount } = renderDetailWithAuth(newTicket);

    await waitFor(() => {
      expect(screen.getByTestId("ticket-detail-view")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("indicate-resolution-btn")).not.toBeInTheDocument();
    unmount();

    const resolvedTicket = { ...mockOpenTicket, status: "RESOLVED" };
    renderDetailWithAuth(resolvedTicket);

    await waitFor(() => {
      expect(screen.getByTestId("ticket-detail-view")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("indicate-resolution-btn")).not.toBeInTheDocument();
  });

  it("opens modal on button click, allows typing optional comment, and can be cancelled", async () => {
    renderDetailWithAuth(mockOpenTicket);

    await waitFor(() => {
      expect(screen.getByTestId("indicate-resolution-btn")).toBeInTheDocument();
    });

    // Open modal
    fireEvent.click(screen.getByTestId("indicate-resolution-btn"));
    expect(screen.getByTestId("resolution-modal")).toBeInTheDocument();

    const textarea = screen.getByTestId("resolution-comment-input");
    fireEvent.change(textarea, { target: { value: "Rebooting my router fixed the VPN." } });
    expect((textarea as HTMLTextAreaElement).value).toBe("Rebooting my router fixed the VPN.");

    // Cancel modal
    fireEvent.click(screen.getByTestId("cancel-resolution-btn"));
    expect(screen.queryByTestId("resolution-modal")).not.toBeInTheDocument();
  });

  it("submits resolution indication with comment, calls API, updates ticket view, and shows banner", async () => {
    const updatedTicket: api.TicketResponse = {
      ...mockOpenTicket,
      isResolutionIndicated: true,
    };
    (api.indicateResolution as any).mockResolvedValue({
      message: "Resolution indication recorded successfully",
      ticket: updatedTicket,
    });

    renderDetailWithAuth(mockOpenTicket);

    await waitFor(() => {
      expect(screen.getByTestId("indicate-resolution-btn")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("indicate-resolution-btn"));
    expect(screen.getByTestId("resolution-modal")).toBeInTheDocument();

    const textarea = screen.getByTestId("resolution-comment-input");
    fireEvent.change(textarea, { target: { value: "All good now after IT certificate update." } });

    fireEvent.click(screen.getByTestId("confirm-resolution-btn"));

    await waitFor(() => {
      expect(api.indicateResolution).toHaveBeenCalledWith(201, "All good now after IT certificate update.");
    });

    // Modal closes, banner appears, button is removed
    await waitFor(() => {
      expect(screen.queryByTestId("resolution-modal")).not.toBeInTheDocument();
      expect(screen.getByTestId("resolution-indicated-banner")).toBeInTheDocument();
      expect(screen.getByTestId("resolution-indicated-badge")).toBeInTheDocument();
      expect(screen.queryByTestId("indicate-resolution-btn")).not.toBeInTheDocument();
    });
  });

  it("displays error message when indicateResolution API fails", async () => {
    (api.indicateResolution as any).mockRejectedValue(new Error("Resolution indication can only be set when ticket is in OPEN or IN_PROGRESS status."));

    renderDetailWithAuth(mockOpenTicket);

    await waitFor(() => {
      expect(screen.getByTestId("indicate-resolution-btn")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("indicate-resolution-btn"));
    fireEvent.click(screen.getByTestId("confirm-resolution-btn"));

    await waitFor(() => {
      expect(screen.getByText(/Resolution indication can only be set/i)).toBeInTheDocument();
    });
    expect(screen.getByTestId("resolution-modal")).toBeInTheDocument();
  });
});
