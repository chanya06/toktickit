import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import App from "../../src/App.js";
import { LoginView } from "../../src/components/LoginView.js";
import { AuthProvider } from "../../src/context/AuthContext.js";
import * as api from "../../src/api.js";

describe("App Navigation & Role-based Initial Tabs (Issue 20 Review Fixes)", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("does not render debug HomeOverview on LoginView", () => {
    render(
      <AuthProvider>
        <LoginView />
      </AuthProvider>
    );

    expect(screen.getByRole("heading", { name: /Sign in to TokTickIT/i })).toBeInTheDocument();
    expect(screen.queryByText(/System Health & API Check/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Check System Status/i)).not.toBeInTheDocument();
  });

  it("sets initial tab to user-management when logged in as ADMINISTRATOR and omits debug HomeOverview", async () => {
    vi.spyOn(api, "getStoredToken").mockReturnValue("admin-token");
    vi.spyOn(api, "fetchCurrentUser").mockResolvedValue({
      id: 99,
      email: "sarah.admin@example.com",
      fullName: "Sarah Connor",
      role: "ADMINISTRATOR",
      mustChangePassword: false,
    });

    render(<App />);

    expect(await screen.findByRole("heading", { name: /Administrator User Management/i })).toBeInTheDocument();
    expect(screen.queryByText(/System Health & API Check/i)).not.toBeInTheDocument();
  });

  it("sets initial tab to ticket-queue when logged in as IT_STAFF", async () => {
    vi.spyOn(api, "getStoredToken").mockReturnValue("staff-token");
    vi.spyOn(api, "fetchCurrentUser").mockResolvedValue({
      id: 50,
      email: "alex.chen@example.com",
      fullName: "Alex Chen",
      role: "IT_STAFF",
      mustChangePassword: false,
    });

    render(<App />);

    expect(await screen.findByRole("heading", { name: /IT Staff Ticket Queue/i })).toBeInTheDocument();
  });

  it("sets initial tab to my-tickets when logged in as REQUESTER", async () => {
    vi.spyOn(api, "getStoredToken").mockReturnValue("requester-token");
    vi.spyOn(api, "fetchCurrentUser").mockResolvedValue({
      id: 1,
      email: "david.lee@example.com",
      fullName: "David Lee",
      role: "REQUESTER",
      mustChangePassword: false,
    });
    vi.spyOn(api, "fetchTickets").mockResolvedValue({
      data: [],
      pagination: { totalItems: 0, totalPages: 1, currentPage: 1, pageSize: 10 },
    });

    render(<App />);

    const myTicketsBtn = await screen.findByRole("button", { name: /My Tickets/i });
    expect(myTicketsBtn).toBeInTheDocument();
    expect(myTicketsBtn.className).toContain("fw-bold");
  });
});
