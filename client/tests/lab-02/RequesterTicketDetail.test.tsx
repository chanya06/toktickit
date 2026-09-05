import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React, { useState } from "react";
import { TicketDetailView } from "../../src/components/TicketDetailView.js";
import { RequesterContext } from "../../src/context/RequesterContext.js";
import * as api from "../../src/api.js";

// Mock the API module
vi.mock("../../src/api.js", async () => {
  const actual = await vi.importActual("../../src/api.js");
  return {
    ...actual,
    fetchTicketDetail: vi.fn(),
  };
});

const mockRequester = {
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

const mockTicketData = {
  id: 101,
  ticketNumber: "TKT-2026-000101",
  requesterId: 1,
  categoryId: 2,
  relatedSystemId: 7,
  summary: "Laptop battery draining fast",
  description: "Battery issue on corporate workstation",
  requestedPriority: "HIGH",
  itPriority: "HIGH",
  status: "NEW",
  createdAt: "2026-09-01T10:00:00.000Z",
  category: { id: 2, name: "Hardware" },
  relatedSystem: { id: 7, name: "Corporate Laptop" },
};

function renderComponent(props: { ticketId: number; onBack?: () => void; selectedReq?: any }) {
  const onBack = props.onBack || vi.fn();
  const selectedRequester = props.selectedReq !== undefined ? props.selectedReq : mockRequester;

  return render(
    <RequesterContext.Provider
      value={{
        selectedRequester,
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
      <TicketDetailView ticketId={props.ticketId} onBack={onBack} />
    </RequesterContext.Provider>
  );
}

describe("TicketDetailView Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows prompt when no requester is selected", () => {
    renderComponent({ ticketId: 101, selectedReq: null });
    expect(screen.getByTestId("no-requester-alert")).toBeInTheDocument();
    expect(screen.getByText("Requester Context Required")).toBeInTheDocument();
  });

  it("renders ticket details correctly when fetch succeeds", async () => {
    (api.fetchTicketDetail as any).mockResolvedValue(mockTicketData);

    renderComponent({ ticketId: 101 });

    expect(screen.getByTestId("ticket-detail-loading")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("ticket-detail-view")).toBeInTheDocument();
    });

    expect(screen.getAllByText("TKT-2026-000101")[0]).toBeInTheDocument();
    expect(screen.getByText("Laptop battery draining fast")).toBeInTheDocument();
    expect(screen.getByText("Battery issue on corporate workstation")).toBeInTheDocument();
    expect(screen.getByText("Hardware")).toBeInTheDocument();
    expect(screen.getByText("Corporate Laptop")).toBeInTheDocument();
    expect(screen.getByTestId("detail-priority-badge")).toHaveTextContent("Priority: HIGH");
    expect(screen.getByTestId("detail-status-badge")).toHaveTextContent("Status: NEW");
  });

  it("renders 403 Forbidden card on cross-requester ownership error and handles back button", async () => {
    const error403 = new Error("Forbidden: You do not have access to this ticket") as any;
    error403.status = 403;
    (api.fetchTicketDetail as any).mockRejectedValue(error403);

    const onBack = vi.fn();
    renderComponent({ ticketId: 101, onBack });

    await waitFor(() => {
      expect(screen.getByTestId("forbidden-error-card")).toBeInTheDocument();
    });

    expect(screen.getByText(/403 Forbidden/i)).toBeInTheDocument();

    const backBtn = screen.getByTestId("forbidden-back-btn");
    fireEvent.click(backBtn);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("renders 404 Not Found card when ticket is non-existent and handles back button", async () => {
    const error404 = new Error("Ticket not found") as any;
    error404.status = 404;
    (api.fetchTicketDetail as any).mockRejectedValue(error404);

    const onBack = vi.fn();
    renderComponent({ ticketId: 999, onBack });

    await waitFor(() => {
      expect(screen.getByTestId("notfound-error-card")).toBeInTheDocument();
    });

    expect(screen.getByText(/404 Not Found/i)).toBeInTheDocument();

    const backBtn = screen.getByTestId("notfound-back-btn");
    fireEvent.click(backBtn);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("renders error state and retries fetching upon Retry button click", async () => {
    const generalErr = new Error("Network connection error") as any;
    generalErr.status = 500;
    (api.fetchTicketDetail as any).mockRejectedValueOnce(generalErr);

    renderComponent({ ticketId: 101 });

    await waitFor(() => {
      expect(screen.getByTestId("ticket-detail-error")).toBeInTheDocument();
    });

    (api.fetchTicketDetail as any).mockResolvedValueOnce(mockTicketData);

    const retryBtn = screen.getByTestId("retry-detail-btn");
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByTestId("ticket-detail-view")).toBeInTheDocument();
    });
  });

  it("invokes onBack callback when back breadcrumb or bottom back button is clicked", async () => {
    (api.fetchTicketDetail as any).mockResolvedValue(mockTicketData);
    const onBack = vi.fn();

    renderComponent({ ticketId: 101, onBack });

    await waitFor(() => {
      expect(screen.getByTestId("ticket-detail-view")).toBeInTheDocument();
    });

    const topBackBtn = screen.getByTestId("back-to-tickets-btn");
    fireEvent.click(topBackBtn);
    expect(onBack).toHaveBeenCalledTimes(1);

    const bottomBackBtn = screen.getByTestId("bottom-back-btn");
    fireEvent.click(bottomBackBtn);
    expect(onBack).toHaveBeenCalledTimes(2);
  });

  it("cancels in-flight requests and ignores stale responses when requester changes while fetching", async () => {
    let resolveFirstRequest: (value: any) => void;
    const firstRequestPromise = new Promise((resolve) => {
      resolveFirstRequest = resolve;
    });

    const capturedSignals: AbortSignal[] = [];

    (api.fetchTicketDetail as any).mockImplementation((ticketId: number, reqId: number, signal?: AbortSignal) => {
      if (signal) capturedSignals.push(signal);
      if (reqId === 1) {
        return firstRequestPromise;
      } else {
        const err = new Error("Forbidden: You do not have access to this ticket") as any;
        err.status = 403;
        return Promise.reject(err);
      }
    });

    function DynamicTestComponent() {
      const [selectedRequester, setSelectedRequester] = useState<any>(mockRequester);

      return (
        <RequesterContext.Provider
          value={{
            selectedRequester,
            requesters: [mockRequester, mockRequester2],
            isLoading: false,
            error: null,
            isModalOpen: false,
            selectRequester: (r) => setSelectedRequester(r),
            openSelectorModal: vi.fn(),
            closeSelectorModal: vi.fn(),
            refreshRequesters: vi.fn(),
          }}
        >
          <button
            data-testid="switch-to-req2-btn"
            onClick={() => setSelectedRequester(mockRequester2)}
          >
            Switch Requester
          </button>
          <TicketDetailView ticketId={101} onBack={vi.fn()} />
        </RequesterContext.Provider>
      );
    }

    render(<DynamicTestComponent />);

    // Expect loading spinner initially for Requester 1
    expect(screen.getByTestId("ticket-detail-loading")).toBeInTheDocument();
    expect(capturedSignals.length).toBe(1);
    expect(capturedSignals[0].aborted).toBe(false);

    // Switch to Requester 2 while 1st request is still in-flight
    fireEvent.click(screen.getByTestId("switch-to-req2-btn"));

    // Verify 1st request's signal was aborted immediately
    expect(capturedSignals[0].aborted).toBe(true);

    // Wait for 2nd request (Requester 2) to complete with 403 Forbidden
    await waitFor(() => {
      expect(screen.getByTestId("forbidden-error-card")).toBeInTheDocument();
    });

    // Now resolve the 1st request (stale response) AFTER Requester 2 has received 403
    await act(async () => {
      resolveFirstRequest!(mockTicketData);
    });

    // Verify stale response did NOT overwrite the 403 Forbidden state and ticket data is NOT displayed
    expect(screen.getByTestId("forbidden-error-card")).toBeInTheDocument();
    expect(screen.queryByTestId("ticket-detail-view")).not.toBeInTheDocument();
    expect(screen.queryByText("Laptop battery draining fast")).not.toBeInTheDocument();
  });
});
