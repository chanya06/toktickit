# Lab 3 UI Specification & Design System

## 1. Zen Green Design System Extensions

### Color Palette Tokens
- **Header & Primary Accent**: `#006B3C` (Zen Green Deep)
- **Primary Hover / Active**: `#00522E`
- **Secondary Accent**: `#0B7A46`
- **Pale Highlight / Selected Row BG**: `#EAF6EF`
- **Application Page Background**: `#F5F7F6`
- **Surface / Card Background**: `#FFFFFF` with `#E5E7EB` border
- **Text Primary**: `#1F2937` (Dark Charcoal)
- **Text Muted / Subtitle**: `#6B7280` (Neutral Grey)

### Role & Status Badges
- **Role Badges**:
  - `REQUESTER`: Pale Blue (`#E0F2FE` BG, `#0369A1` Text)
  - `IT_STAFF`: Zen Green (`#EAF6EF` BG, `#006B3C` Text)
  - `ADMINISTRATOR`: Purple (`#F3E8FF` BG, `#7E22CE` Text)
- **Status Badges**:
  - `NEW`: Blue (`#DBEAFE` BG, `#1E40AF` Text)
  - `OPEN`: Green (`#DCFCE7` BG, `#15803D` Text)
  - `IN_PROGRESS`: Amber (`#FEF3C7` BG, `#B45309` Text)
  - `WAITING_FOR_REQUESTER`: Purple (`#F3E8FF` BG, `#6B21A8` Text)
  - `RESOLVED`: Emerald (`#D1FAE5` BG, `#065F46` Text)
  - `CLOSED`: Dark Slate (`#E2E8F0` BG, `#334155` Text)
  - `REOPENED`: Orange (`#FFEDD5` BG, `#C2410C` Text)
  - `CANCELLED`: Red (`#FEE2E2` BG, `#B91C1C` Text)
- **IT Priority Badges**:
  - `LOW`: Light Grey (`#F3F4F6` BG, `#4B5563` Text)
  - `MEDIUM`: Blue (`#E0F2FE` BG, `#0284C7` Text)
  - `HIGH`: Amber (`#FEF3C7` BG, `#D97706` Text)
  - `URGENT`: Red (`#FEE2E2` BG, `#DC2626` Text)

---

## 2. Screen Specifications

### Screen 1: Login & Mandatory Password Change
- **Login Card**: Centered card (max width 420px) on pale green pattern background.
  - Heading: "Sign in to TokTickIT"
  - Inputs: Email address, Password.
  - Buttons: "Sign In" (Primary Zen Green button).
  - Validation: Inline error banner for invalid credentials or inactive account ("Invalid email or password" / "Account is inactive").
- **Mandatory Password Change Screen**: Rendered immediately after successful auth if `mustChangePassword === true`. Blocks access to application shell.
  - Banner: "You must change your initial password before continuing."
  - Inputs: Current (Initial) Password, New Password, Confirm New Password.
  - Rules Checklist: Minimum 8 chars, uppercase, lowercase, number, special char.
  - Button: "Update Password & Continue".

### Screen 2: Authenticated Navigation Header
- **Brand**: TokTickIT logo linking to home route based on role.
- **Nav Links (Role Restricted)**:
  - `REQUESTER`: "My Tickets", "Create Ticket".
  - `IT_STAFF`: "Ticket Queue".
  - `ADMINISTRATOR`: "User Management", "Ticket Queue".
- **User Profile Menu**: Full Name, Role Badge (`REQUESTER`, `IT_STAFF`, `ADMINISTRATOR`), and Logout button.

### Screen 3: IT Staff Ticket Queue
- **Control Bar**:
  - Search input with magnify icon (searches Ticket Number, Summary).
  - Filters: Category dropdown, Status dropdown, IT Priority dropdown, Owner dropdown (Unassigned / Me / All).
  - Sort dropdown: Date Created (Newest/Oldest), IT Priority (Highest/Lowest), Status.
- **Data Table (Desktop)**:
  - Columns: Ticket No (`TKT-YYYY-XXXXXX`), Created Date, Summary, Category, Requested Priority, IT Priority, Status, Owner, Action ("View Detail").
  - Hover highlight on rows (`#EAF6EF`).
- **Card View (Mobile / Tablet)**: Stacked cards with badges for Priority, Status, and Owner.
- **Pagination Footer**: "Showing X-Y of Z tickets", Page numbers, Prev/Next buttons.

### Screen 4: IT Staff Ticket Detail & Notes
- **Ticket Summary Header**: Ticket No, Created Date, Requester Name/Email, Category, Related System.
- **Editable Operational Panel (IT Staff / Admin only)**:
  - Owner Selector: Dropdown to claim or assign to active IT Staff/Admin.
  - IT Priority Selector: Dropdown (`LOW`, `MEDIUM`, `HIGH`, `URGENT`).
  - Status Transition Dropdown: Permitted next statuses based on matrix.
- **Tabbed / Dual Communication Section**:
  - **Public Comments Tab**: Visible to all roles. Green border header ("Public Comments - Visible to Requester"). Comment list + Add Comment form.
  - **Internal Notes Tab**: Visible ONLY to IT Staff and Admin. Yellow/Amber callout banner ("Internal Notes - Visible ONLY to IT Staff & Administrator"). Note list + Add Internal Note form.

### Screen 5: Administrator User Management
- **Header Action**: "+ Create New User" button.
- **Search & Filter Bar**: Text search by name/email, Role filter select (`All Roles`, `Requester`, `IT Staff`, `Administrator`).
- **User List Table**:
  - Columns: Full Name, Email, Role (Badge), Status (`Active` / `Inactive` toggle badge), Actions ("Edit", "Reset Initial Password").
- **Create User Drawer / Modal**:
  - Inputs: Full Name, Email Address, Role (radio or select), Initial Password.
  - Switch: Active (`true`/`false`).
  - Submit: "Create User".
- **Edit User Drawer / Modal**:
  - Inputs: Full Name, Email Address, Role, Active toggle.
  - Safety validation: Disables self-deactivation and prevents deactivating sole Admin.
- **Reset Initial Password Modal**:
  - Form to enter a new initial password. Prompts notice: "User will be required to change password on next login."

---

## 3. Responsive Breakpoints & Rules
- **Desktop (`>= 992px`)**: Multi-column table layout for Queue and User Management, side-by-side Ticket Detail panels.
- **Tablet (`768px - 991px`)**: Condensed table or card view, stacked controls.
- **Mobile (`< 768px`)**: Single column stacked layout, sticky action buttons, full-screen drawer for modals/filters. Touch targets minimum 44px x 44px.
