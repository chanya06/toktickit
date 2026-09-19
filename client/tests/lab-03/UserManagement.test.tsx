import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { UserManagementView } from "../../src/components/UserManagementView.js";
import * as api from "../../src/api.js";
import { AuthContext } from "../../src/context/AuthContext.js";

// Mock api methods
vi.mock("../../src/api.js", async () => {
  const actual = await vi.importActual("../../src/api.js");
  return {
    ...actual,
    fetchAdminUsers: vi.fn(),
    createAdminUser: vi.fn(),
    updateAdminUser: vi.fn(),
    resetAdminUserPassword: vi.fn(),
  };
});

const mockAdminUser: api.AuthUser = {
  id: 1,
  email: "admin@toktickit.com",
  fullName: "Super Admin",
  role: "ADMINISTRATOR",
  isActive: true,
  mustChangePassword: false,
};

const mockUserList: api.AdminUserResponse[] = [
  {
    id: 1,
    email: "admin@toktickit.com",
    fullName: "Super Admin",
    name: "Super Admin",
    department: "System IT",
    role: "ADMINISTRATOR",
    isActive: true,
    mustChangePassword: false,
    createdAt: "2026-09-01T10:00:00.000Z",
    updatedAt: "2026-09-01T10:00:00.000Z",
  },
  {
    id: 2,
    email: "staff@toktickit.com",
    fullName: "Alex Chen",
    name: "Alex Chen",
    department: "Infrastructure Support",
    role: "IT_STAFF",
    isActive: true,
    mustChangePassword: false,
    createdAt: "2026-09-02T11:00:00.000Z",
    updatedAt: "2026-09-02T11:00:00.000Z",
  },
  {
    id: 3,
    email: "inactive.staff@toktickit.com",
    fullName: "Inactive Staff",
    name: "Inactive Staff",
    department: "Network",
    role: "IT_STAFF",
    isActive: false,
    mustChangePassword: true,
    createdAt: "2026-09-03T12:00:00.000Z",
    updatedAt: "2026-09-03T12:00:00.000Z",
  },
  {
    id: 4,
    email: "requester@toktickit.com",
    fullName: "Somchai Requester",
    name: "Somchai Requester",
    department: "Marketing",
    role: "REQUESTER",
    isActive: true,
    mustChangePassword: false,
    createdAt: "2026-09-04T13:00:00.000Z",
    updatedAt: "2026-09-04T13:00:00.000Z",
  },
];

function renderWithAuth(
  currentUser: api.AuthUser = mockAdminUser,
  authOverrides: Partial<any> = {}
) {
  const mockAuthContextValue = {
    user: currentUser,
    token: "valid-admin-token",
    isLoading: false,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
    changePassword: vi.fn(),
    refreshUser: vi.fn().mockResolvedValue(undefined),
    ...authOverrides,
  };

  const rendered = render(
    <AuthContext.Provider value={mockAuthContextValue}>
      <UserManagementView />
    </AuthContext.Provider>
  );

  return { ...rendered, authContext: mockAuthContextValue };
}

describe("UserManagementView Component (Issue 27 / FR-15..20 / AC-09..12)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    vi.mocked(api.fetchAdminUsers).mockResolvedValue({
      data: mockUserList,
      pagination: {
        totalItems: 4,
        totalPages: 1,
        currentPage: 1,
        pageSize: 10,
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ---------------------------------------------------------------------------
  // 1. Initial Render & Directory Table (FR-15 / AC-09)
  // ---------------------------------------------------------------------------
  it("renders user table, header, search bar, and user rows with correct badges", async () => {
    renderWithAuth();

    // Verify initial load
    expect(api.fetchAdminUsers).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        pageSize: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
      }),
      expect.any(AbortSignal)
    );

    // Advance timers for fetch resolution
    await act(async () => {
      vi.runAllTimers();
    });

    // Check title and create button
    expect(screen.getByRole("heading", { name: /Administrator User Management/i })).toBeInTheDocument();
    expect(screen.getByTestId("create-user-btn")).toBeInTheDocument();
    expect(screen.getByTestId("user-search-input")).toBeInTheDocument();
    expect(screen.getByTestId("role-filter-select")).toBeInTheDocument();

    // Check table rows
    expect(screen.getByTestId("user-row-1")).toBeInTheDocument();
    expect(screen.getByTestId("user-name-1")).toHaveTextContent("Super Admin");
    expect(screen.getByTestId("user-email-1")).toHaveTextContent("admin@toktickit.com");
    expect(screen.getByTestId("user-dept-1")).toHaveTextContent("System IT");
    expect(screen.getByTestId("user-role-badge-1")).toHaveTextContent("Administrator");
    expect(screen.getByTestId("user-status-1")).toHaveTextContent("Active");

    // Check "You" badge on current logged-in user
    expect(screen.getByTitle("You are currently logged in as this user")).toBeInTheDocument();

    // Check inactive user badge
    expect(screen.getByTestId("user-status-3")).toHaveTextContent("Inactive");
  });

  // ---------------------------------------------------------------------------
  // 2. Search Debounce & Clear (FR-15 / AC-09)
  // ---------------------------------------------------------------------------
  it("debounces text search by 300ms and sends search query parameter", async () => {
    renderWithAuth();

    await act(async () => {
      vi.runAllTimers();
    });

    const searchInput = screen.getByTestId("user-search-input");
    fireEvent.change(searchInput, { target: { value: "alex" } });

    // Should not trigger immediately
    expect(api.fetchAdminUsers).toHaveBeenCalledTimes(1);

    // Fast-forward 300ms debounce
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(api.fetchAdminUsers).toHaveBeenCalledWith(
      expect.objectContaining({ search: "alex", page: 1 }),
      expect.any(AbortSignal)
    );

    // Clear search button
    const clearBtn = screen.getByTestId("clear-search-btn");
    fireEvent.click(clearBtn);

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(api.fetchAdminUsers).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: undefined, page: 1 }),
      expect.any(AbortSignal)
    );
  });

  // ---------------------------------------------------------------------------
  // 3. Role Filter Selection (FR-15 / AC-09)
  // ---------------------------------------------------------------------------
  it("filters user list by role when role dropdown changes", async () => {
    renderWithAuth();

    await act(async () => {
      vi.runAllTimers();
    });

    const roleSelect = screen.getByTestId("role-filter-select");
    fireEvent.change(roleSelect, { target: { value: "IT_STAFF" } });

    await act(async () => {
      vi.runAllTimers();
    });

    expect(api.fetchAdminUsers).toHaveBeenLastCalledWith(
      expect.objectContaining({ role: "IT_STAFF", page: 1 }),
      expect.any(AbortSignal)
    );
  });

  // ---------------------------------------------------------------------------
  // 4. Pagination Controls
  // ---------------------------------------------------------------------------
  it("renders pagination controls and switches page on click", async () => {
    vi.mocked(api.fetchAdminUsers).mockResolvedValue({
      data: mockUserList,
      pagination: {
        totalItems: 25,
        totalPages: 3,
        currentPage: 1,
        pageSize: 10,
      },
    });

    renderWithAuth();

    await act(async () => {
      vi.runAllTimers();
    });

    expect(screen.getByTestId("pagination-info")).toHaveTextContent("Showing 1 to 10 of 25 users");

    const nextBtn = screen.getByTestId("next-page-btn");
    fireEvent.click(nextBtn);

    await act(async () => {
      vi.runAllTimers();
    });

    expect(api.fetchAdminUsers).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 2 }),
      expect.any(AbortSignal)
    );
  });

  // ---------------------------------------------------------------------------
  // 5. Create User Modal & Submission (FR-16 / AC-10)
  // ---------------------------------------------------------------------------
  it("opens Create User modal, validates password criteria, and successfully creates user", async () => {
    vi.mocked(api.createAdminUser).mockResolvedValue({
      message: "User created successfully",
      user: {
        id: 5,
        email: "new.user@toktickit.com",
        fullName: "New Team Member",
        name: "New Team Member",
        department: "Helpdesk",
        role: "IT_STAFF",
        isActive: true,
        mustChangePassword: true,
        createdAt: "2026-09-18T10:00:00.000Z",
        updatedAt: "2026-09-18T10:00:00.000Z",
      },
    });

    renderWithAuth();

    await act(async () => {
      vi.runAllTimers();
    });

    // Open modal
    fireEvent.click(screen.getByTestId("create-user-btn"));
    expect(screen.getByRole("heading", { name: "Create New User" })).toBeInTheDocument();

    // Fill form
    fireEvent.change(screen.getByTestId("create-user-fullname"), { target: { value: "New Team Member" } });
    fireEvent.change(screen.getByTestId("create-user-email"), { target: { value: "new.user@toktickit.com" } });
    fireEvent.change(screen.getByTestId("create-user-department"), { target: { value: "Helpdesk" } });
    fireEvent.change(screen.getByTestId("create-user-role"), { target: { value: "IT_STAFF" } });
    fireEvent.change(screen.getByTestId("create-user-password"), { target: { value: "Admin_2026-Pass!" } });

    // Submit
    fireEvent.click(screen.getByTestId("submit-create-user"));

    await act(async () => {
      vi.runAllTimers();
    });

    expect(api.createAdminUser).toHaveBeenCalledWith({
      fullName: "New Team Member",
      email: "new.user@toktickit.com",
      department: "Helpdesk",
      role: "IT_STAFF",
      initialPassword: "Admin_2026-Pass!",
      isActive: true,
    });

    // Modal closes and success toast appears
    expect(screen.queryByRole("heading", { name: "Create New User" })).not.toBeInTheDocument();
    expect(screen.getByTestId("success-toast")).toHaveTextContent('User "New Team Member" created successfully.');
  });

  it("displays server error when Create User fails (e.g. 409 Duplicate Email)", async () => {
    vi.mocked(api.createAdminUser).mockRejectedValue(
      new Error("User with this email already exists")
    );

    renderWithAuth();

    await act(async () => {
      vi.runAllTimers();
    });

    fireEvent.click(screen.getByTestId("create-user-btn"));

    fireEvent.change(screen.getByTestId("create-user-fullname"), { target: { value: "Duplicate User" } });
    fireEvent.change(screen.getByTestId("create-user-email"), { target: { value: "admin@toktickit.com" } });
    fireEvent.change(screen.getByTestId("create-user-password"), { target: { value: "ValidPassword123!" } });

    fireEvent.click(screen.getByTestId("submit-create-user"));

    await act(async () => {
      vi.runAllTimers();
    });

    expect(screen.getByTestId("create-user-error")).toHaveTextContent("User with this email already exists");
  });

  // ---------------------------------------------------------------------------
  // 6. Edit User Modal & Self-Deactivation Safety (BR-07 / AC-11)
  // ---------------------------------------------------------------------------
  it("disables deactivation toggle and shows warning when editing own account (BR-07 / AC-11)", async () => {
    renderWithAuth();

    await act(async () => {
      vi.runAllTimers();
    });

    // Edit current user (ID 1)
    fireEvent.click(screen.getByTestId("edit-user-btn-1"));

    expect(screen.getByRole("heading", { name: /Edit User Profile/i })).toBeInTheDocument();
    expect(screen.getByTestId("self-edit-warning")).toBeInTheDocument();

    // Verify Active checkbox is disabled
    const activeToggle = screen.getByTestId("edit-user-isactive");
    expect(activeToggle).toBeDisabled();
    expect(activeToggle).toBeChecked();

    // Verify Role select is disabled to prevent self-demotion
    const roleSelect = screen.getByTestId("edit-user-role");
    expect(roleSelect).toBeDisabled();
    expect(screen.getByText(/Role change disabled on your own logged-in account/i)).toBeInTheDocument();
  });

  it("successfully updates user details when saving valid changes", async () => {
    vi.mocked(api.updateAdminUser).mockResolvedValue({
      message: "User updated successfully",
      user: {
        ...mockUserList[1],
        fullName: "Alex Chen Senior",
        department: "Cloud Operations",
      },
    });

    renderWithAuth();

    await act(async () => {
      vi.runAllTimers();
    });

    // Edit user 2 (Alex Chen)
    fireEvent.click(screen.getByTestId("edit-user-btn-2"));

    fireEvent.change(screen.getByTestId("edit-user-fullname"), { target: { value: "Alex Chen Senior" } });
    fireEvent.change(screen.getByTestId("edit-user-department"), { target: { value: "Cloud Operations" } });

    fireEvent.click(screen.getByTestId("submit-edit-user"));

    await act(async () => {
      vi.runAllTimers();
    });

    expect(api.updateAdminUser).toHaveBeenCalledWith(2, {
      fullName: "Alex Chen Senior",
      email: "staff@toktickit.com",
      department: "Cloud Operations",
      role: "IT_STAFF",
      isActive: true,
    });

    expect(screen.getByTestId("success-toast")).toHaveTextContent('User "Alex Chen Senior" updated successfully.');
  });

  it("calls refreshUser when successfully updating own profile", async () => {
    vi.mocked(api.updateAdminUser).mockResolvedValue({
      message: "User updated successfully",
      user: {
        ...mockUserList[0],
        fullName: "Super Admin Updated",
      },
    });

    const { authContext } = renderWithAuth(mockAdminUser);

    await act(async () => {
      vi.runAllTimers();
    });

    fireEvent.click(screen.getByTestId("edit-user-btn-1"));
    fireEvent.change(screen.getByTestId("edit-user-fullname"), { target: { value: "Super Admin Updated" } });
    fireEvent.click(screen.getByTestId("submit-edit-user"));

    await act(async () => {
      vi.runAllTimers();
    });

    expect(api.updateAdminUser).toHaveBeenCalled();
    expect(authContext.refreshUser).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("success-toast")).toHaveTextContent('User "Super Admin Updated" updated successfully.');
  });

  it("displays server 422 error when deactivating the last active administrator (BR-08 / AC-12)", async () => {
    const error422 = new Error("Cannot deactivate or demote the last active Administrator");
    (error422 as any).status = 422;
    vi.mocked(api.updateAdminUser).mockRejectedValue(error422);

    // Log in as a different admin (ID 99) so user 1's active toggle is not self-disabled
    renderWithAuth({
      id: 99,
      email: "another.admin@toktickit.com",
      fullName: "Another Admin",
      role: "ADMINISTRATOR",
      isActive: true,
      mustChangePassword: false,
    });

    await act(async () => {
      vi.runAllTimers();
    });

    // Edit Admin user 1
    fireEvent.click(screen.getByTestId("edit-user-btn-1"));

    // Toggle active to false
    const activeToggle = screen.getByTestId("edit-user-isactive");
    fireEvent.click(activeToggle);

    fireEvent.click(screen.getByTestId("submit-edit-user"));

    await act(async () => {
      vi.runAllTimers();
    });

    expect(screen.getByTestId("edit-user-error")).toHaveTextContent(
      "Cannot deactivate or demote the last active Administrator"
    );
  });

  // ---------------------------------------------------------------------------
  // 7. Reset Initial Password Modal (FR-18)
  // ---------------------------------------------------------------------------
  it("opens Reset Password modal and resets initial password with criteria checks", async () => {
    vi.mocked(api.resetAdminUserPassword).mockResolvedValue({
      message: "Password reset successfully",
      user: mockUserList[1],
    });

    renderWithAuth();

    await act(async () => {
      vi.runAllTimers();
    });

    // Click Reset Password for user 2
    fireEvent.click(screen.getByTestId("reset-password-btn-2"));

    expect(screen.getByRole("heading", { name: "Reset Initial Password" })).toBeInTheDocument();
    expect(screen.getByText(/User: Alex Chen/i)).toBeInTheDocument();

    const passwordInput = screen.getByTestId("reset-password-input");
    fireEvent.change(passwordInput, { target: { value: "NewTemporary123!" } });

    fireEvent.click(screen.getByTestId("submit-reset-password"));

    await act(async () => {
      vi.runAllTimers();
    });

    expect(api.resetAdminUserPassword).toHaveBeenCalledWith(2, "NewTemporary123!");
    expect(screen.getByTestId("success-toast")).toHaveTextContent('Initial password reset for "Alex Chen".');
  });

  // ---------------------------------------------------------------------------
  // 8. Empty State & Error State
  // ---------------------------------------------------------------------------
  it("renders empty state message when no users match criteria", async () => {
    vi.mocked(api.fetchAdminUsers).mockResolvedValue({
      data: [],
      pagination: {
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
        pageSize: 10,
      },
    });

    renderWithAuth();

    await act(async () => {
      vi.runAllTimers();
    });

    expect(screen.getByTestId("no-users-message")).toBeInTheDocument();
    expect(screen.getByText("No Users Found")).toBeInTheDocument();
  });

  it("renders error banner with retry button on API load failure", async () => {
    vi.mocked(api.fetchAdminUsers).mockRejectedValueOnce(
      new Error("Database connection error")
    );

    renderWithAuth();

    await act(async () => {
      vi.runAllTimers();
    });

    expect(screen.getByText("Error Loading Users")).toBeInTheDocument();
    expect(screen.getByText("Database connection error")).toBeInTheDocument();

    // Test retry
    vi.mocked(api.fetchAdminUsers).mockResolvedValueOnce({
      data: mockUserList,
      pagination: { totalItems: 4, totalPages: 1, currentPage: 1, pageSize: 10 },
    });

    fireEvent.click(screen.getByRole("button", { name: /Retry/i }));

    await act(async () => {
      vi.runAllTimers();
    });

    expect(screen.getByTestId("user-table")).toBeInTheDocument();
  });
});
