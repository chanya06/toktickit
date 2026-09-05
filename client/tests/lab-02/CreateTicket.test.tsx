import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import App from "../../src/App.js";
import * as api from "../../src/api.js";

const mockRequester = {
  id: 1,
  name: "Jennifer Anderson",
  email: "jennifer.anderson@example.com",
  department: "Engineering",
  isActive: true,
};

const mockCategories = [
  { id: 1, name: "Account and Access" },
  { id: 2, name: "Hardware" },
];

const mockSystems = [
  { id: 1, name: "Email & Calendar" },
  { id: 2, name: "VPN Access" },
];

describe("Create Ticket Form Component (Issue 9)", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("toktickit_dev_requester_id", "1");
    vi.restoreAllMocks();

    vi.spyOn(api, "fetchActiveRequesters").mockResolvedValue([mockRequester]);
    vi.spyOn(api, "fetchActiveCategories").mockResolvedValue(mockCategories);
    vi.spyOn(api, "fetchActiveSystems").mockResolvedValue(mockSystems);
  });

  it("renders Create Ticket form with red asterisk markers, read-only previews, and cancel button", async () => {
    render(<App />);

    // Click 'Create Ticket' in header
    const createBtn = await screen.findByRole("button", { name: /Create Ticket/i });
    fireEvent.click(createBtn);

    expect(await screen.findByText("Create IT Support Ticket")).toBeInTheDocument();
    expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Related System/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Summary/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();

    // Read-only previews check
    expect(screen.getByDisplayValue(/TKT-YYYY-XXXXXX/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/Today/i)).toBeInTheDocument();

    // Cancel button check
    expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
  });

  it("shows field-level error messages below inputs when summary or description are too short", async () => {
    render(<App />);

    const createTabBtn = await screen.findByRole("button", { name: /Create Ticket/i });
    fireEvent.click(createTabBtn);

    const summaryInput = await screen.findByLabelText(/Summary/i);
    const descriptionInput = screen.getByLabelText(/Description/i);

    fireEvent.change(summaryInput, { target: { value: "Bad" } }); // < 5 chars
    fireEvent.change(descriptionInput, { target: { value: "Short" } }); // < 10 chars

    const submitBtn = screen.getByRole("button", { name: /Submit Ticket/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText("Summary must be at least 5 characters.")).toBeInTheDocument();
    expect(screen.getByText("Description must be at least 10 characters.")).toBeInTheDocument();
  });

  it("disables submit button and displays 'Submitting Ticket…' text during active submission", async () => {
    let resolvePromise: (value: any) => void;
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    vi.spyOn(api, "createTicket").mockImplementation(() => pendingPromise as any);

    render(<App />);

    const createTabBtn = await screen.findByRole("button", { name: /Create Ticket/i });
    fireEvent.click(createTabBtn);

    const summaryInput = await screen.findByLabelText(/Summary/i);
    const descriptionInput = screen.getByLabelText(/Description/i);

    fireEvent.change(summaryInput, {
      target: { value: "Valid summary text for busy state" },
    });
    fireEvent.change(descriptionInput, {
      target: { value: "Valid description text for busy state test." },
    });

    const submitBtn = screen.getByRole("button", { name: /Submit Ticket/i });
    fireEvent.click(submitBtn);

    // Verify button is disabled and displays Submitting Ticket…
    expect(screen.getByText(/Submitting Ticket…/i)).toBeInTheDocument();
    expect(submitBtn).toBeDisabled();

    await act(async () => {
      resolvePromise!({
        id: 1,
        ticketNumber: "TKT-2026-000001",
        status: "NEW",
        summary: "Valid summary text for busy state",
      });
    });
  });

  it("submits valid form and renders success confirmation screen", async () => {
    const mockCreatedTicket: api.TicketResponse = {
      id: 101,
      ticketNumber: "TKT-2026-000101",
      requesterId: 1,
      categoryId: 1,
      relatedSystemId: 1,
      requestedPriority: "HIGH",
      itPriority: "MEDIUM",
      status: "NEW",
      summary: "Laptop screen flickering intermittently",
      description: "My external monitor and laptop display flicker continuously after wake from sleep.",
      createdAt: new Date().toISOString(),
    };

    vi.spyOn(api, "createTicket").mockResolvedValue(mockCreatedTicket);

    render(<App />);

    const createTabBtn = await screen.findByRole("button", { name: /Create Ticket/i });
    fireEvent.click(createTabBtn);

    const summaryInput = await screen.findByLabelText(/Summary/i);
    const descriptionInput = screen.getByLabelText(/Description/i);

    fireEvent.change(summaryInput, {
      target: { value: "Laptop screen flickering intermittently" },
    });
    fireEvent.change(descriptionInput, {
      target: { value: "My external monitor and laptop display flicker continuously after wake from sleep." },
    });

    const submitBtn = screen.getByRole("button", { name: /Submit Ticket/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText("Ticket Created Successfully!")).toBeInTheDocument();
    expect(screen.getByText("TKT-2026-000101")).toBeInTheDocument();
  });

  it("preserves entered form inputs when API submission fails", async () => {
    vi.spyOn(api, "createTicket").mockRejectedValue(
      new Error("Database connection error")
    );

    render(<App />);

    const createTabBtn = await screen.findByRole("button", { name: /Create Ticket/i });
    fireEvent.click(createTabBtn);

    const summaryInput = await screen.findByLabelText(/Summary/i);
    const descriptionInput = screen.getByLabelText(/Description/i);

    fireEvent.change(summaryInput, {
      target: { value: "Persistent VPN connection drop" },
    });
    fireEvent.change(descriptionInput, {
      target: { value: "VPN drops every 15 minutes when connected from home network." },
    });

    const submitBtn = screen.getByRole("button", { name: /Submit Ticket/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText("Submission Failed")).toBeInTheDocument();
    expect(screen.getByText("Database connection error")).toBeInTheDocument();

    // Verify inputs were preserved
    expect(summaryInput).toHaveValue("Persistent VPN connection drop");
    expect(descriptionInput).toHaveValue("VPN drops every 15 minutes when connected from home network.");
  });

  it("renders Retry Connection button when categories or systems fail to load and recovers data on retry click", async () => {
    const catSpy = vi.spyOn(api, "fetchActiveCategories").mockRejectedValueOnce(new Error("Network timeout"));

    render(<App />);

    const createTabBtn = await screen.findByRole("button", { name: /Create Ticket/i });
    fireEvent.click(createTabBtn);

    expect(await screen.findByText("Failed to load form metadata")).toBeInTheDocument();
    const retryBtn = screen.getByRole("button", { name: /Retry Connection/i });
    expect(retryBtn).toBeInTheDocument();

    // Now allow fetchActiveCategories to succeed on retry
    catSpy.mockResolvedValueOnce(mockCategories);

    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.queryByText("Failed to load form metadata")).not.toBeInTheDocument();
    });

    expect(screen.getByRole("option", { name: "Account and Access" })).toBeInTheDocument();
  });

  it("allows selecting initial file attachments, displaying draft list, and removing files before submission (FR-07)", async () => {
    render(<App />);

    const createTabBtn = await screen.findByRole("button", { name: /Create Ticket/i });
    fireEvent.click(createTabBtn);

    const fileInput = (await screen.findByTestId("initial-file-input")) as HTMLInputElement;

    const mockFile = new File(["test content"], "screenshot.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    expect(await screen.findByText("screenshot.png")).toBeInTheDocument();

    const removeBtn = screen.getByRole("button", { name: /Remove/i });
    fireEvent.click(removeBtn);

    expect(screen.queryByText("screenshot.png")).not.toBeInTheDocument();
  });

  it("supports drag and drop file attachments onto initial attachments dropzone", async () => {
    render(<App />);

    const createTabBtn = await screen.findByRole("button", { name: /Create Ticket/i });
    fireEvent.click(createTabBtn);

    const dropzone = await screen.findByTestId("initial-attachments-dropzone");

    const mockFile = new File(["drag content"], "dragged-doc.pdf", { type: "application/pdf" });

    // Drag over
    fireEvent.dragOver(dropzone);
    expect(dropzone).toHaveClass("border-success");

    // Drop
    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [mockFile],
      },
    });

    expect(await screen.findByText("dragged-doc.pdf")).toBeInTheDocument();
  });
});
