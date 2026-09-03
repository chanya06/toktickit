import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "../../src/App.js";
import * as api from "../../src/api.js";

const mockActiveRequesters = [
  {
    id: 1,
    name: "Jennifer Anderson",
    email: "jennifer.anderson@example.com",
    department: "Engineering",
    isActive: true,
  },
  {
    id: 2,
    name: "Michael Brown",
    email: "michael.brown@example.com",
    department: "IT Support",
    isActive: true,
  },
];

describe("Development Requester Selector (Issue 7)", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("renders Development Requester Selection modal when no requester is selected in localStorage", async () => {
    vi.spyOn(api, "fetchActiveRequesters").mockResolvedValue(mockActiveRequesters);

    render(<App />);

    expect(await screen.findByText("Select Development Requester")).toBeInTheDocument();
    expect(
      screen.getByText(/Select a Development Requester to test requester-specific ticket behavior/i)
    ).toBeInTheDocument();

    expect(await screen.findByText(/Jennifer Anderson/i)).toBeInTheDocument();
  });

  it("selects a Development Requester and persists selection to localStorage", async () => {
    vi.spyOn(api, "fetchActiveRequesters").mockResolvedValue(mockActiveRequesters);

    render(<App />);

    const continueBtn = await screen.findByRole("button", { name: /Continue/i });
    fireEvent.click(continueBtn);

    await waitFor(() => {
      expect(localStorage.getItem("toktickit_dev_requester_id")).toBe("1");
    });

    const elements = screen.getAllByText(/Jennifer Anderson/i);
    expect(elements.length).toBeGreaterThan(0);
    expect(screen.getByText(/Welcome, Jennifer Anderson/i)).toBeInTheDocument();
  });

  it("shows error alert and retry button when fetchActiveRequesters API fails", async () => {
    vi.spyOn(api, "fetchActiveRequesters").mockRejectedValue(
      new Error("Failed to load active development requesters")
    );

    render(<App />);

    expect(await screen.findByText("Failed to load requesters")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Retry Connection/i })).toBeInTheDocument();
  });
});
