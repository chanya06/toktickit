# Lab 4 UI Specification & Design System

## 1. Zen Green Design System Continuity

### Color Palette Tokens
- **Header & Primary Accent**: `#006B3C` (Zen Green Deep)
- **Primary Hover / Active**: `#00522E`
- **Secondary Accent**: `#0B7A46`
- **Pale Highlight / Selected Row BG**: `#EAF6EF`
- **Application Page Background**: `#F5F7F6`
- **Surface / Card Background**: `#FFFFFF` with `#E5E7EB` border
- **Text Primary**: `#1F2937` (Dark Charcoal)
- **Text Muted / Subtitle**: `#6B7280` (Neutral Grey)

### Role, Status & Action Badges
- **Role Badges**:
  - `REQUESTER`: Pale Blue (`#E0F2FE` BG, `#0369A1` Text)
  - `IT_STAFF`: Zen Green (`#EAF6EF` BG, `#006B3C` Text)
  - `ADMINISTRATOR`: Purple (`#F3E8FF` BG, `#7E22CE` Text)
- **Ticket Status Badges**:
  - `NEW`: Blue (`#DBEAFE` BG, `#1E40AF` Text)
  - `OPEN`: Green (`#DCFCE7` BG, `#15803D` Text)
  - `IN_PROGRESS`: Amber (`#FEF3C7` BG, `#B45309` Text)
  - `WAITING_FOR_REQUESTER`: Purple (`#F3E8FF` BG, `#6B21A8` Text)
  - `PENDING`: Slate Grey (`#E2E8F0` BG, `#475569` Text)
  - `RESOLVED`: Emerald (`#D1FAE5` BG, `#065F46` Text)
  - `CLOSED`: Dark Slate (`#E2E8F0` BG, `#334155` Text)
  - `REOPENED`: Orange (`#FFEDD5` BG, `#C2410C` Text)
  - `CANCELLED`: Red (`#FEE2E2` BG, `#B91C1C` Text)
- **Action Taken Status Badges**:
  - `PENDING`: Slate Grey (`#E2E8F0` BG, `#475569` Text, Clock Icon)
  - `IN_PROGRESS`: Amber (`#FEF3C7` BG, `#B45309` Text, Spinner/Play Icon)
  - `COMPLETED`: Emerald (`#D1FAE5` BG, `#065F46` Text, Checkmark Icon)
  - `CANCELLED`: Red (`#FEE2E2` BG, `#991B1B` Text, Cross Icon)
- **Dashboard Metric Card Accents**:
  - Open / Attention Cards: Zen Green Left Border (`#006B3C`)
  - Warning / Waiting Cards: Amber Left Border (`#F59E0B`)
  - Info / Secondary Cards: Blue Left Border (`#0284C7`)
  - Completed / Resolved Cards: Emerald Left Border (`#10B981`)

---

## 2. Screen Specifications

### Screen 1: IT Staff Dashboard (`/dashboard/staff`)
- **Header Shell**:
  - Displays TokTickIT Logo, Nav Tabs (`Dashboard` [Active], `Ticket Queue`, `User Management` [Admin only]).
  - Right: User Profile (Name, `IT_STAFF` Zen Green Badge), Logout button.
- **Welcome & Triage Summary Banner**:
  - Heading: "Welcome back, {Staff Name}!"
  - Subtitle: "Here is your operational queue overview for today."
  - "Refresh Metrics" button with loading indicator.
- **Metric Cards Grid (4 or 5 Cards)**:
  - **Card 1: Unassigned Tickets**: Value (Large bold number), "+X from yesterday", "View unassigned" button (links to `/staff/tickets?owner=unassigned`).
  - **Card 2: My Assigned Tickets**: Value, "+X active", "View my queue" button (links to `/staff/tickets?owner=me`).
  - **Card 3: In Progress**: Value, "Active triage", "View in-progress" button (links to `/staff/tickets?status=IN_PROGRESS`).
  - **Card 4: Waiting for Requester**: Value, "Pending response", "View waiting" button (links to `/staff/tickets?status=WAITING_FOR_REQUESTER`).
  - **Card 5: Urgent / High Priority**: Value, "High attention", "View urgent" button (links to `/staff/tickets?priority=URGENT`).
- **Main Operational Layout (2-Column Grid on Desktop)**:
  - **Left Section (70%): Recent & Urgent Tickets**:
    - Table columns: Ticket No, Summary, Status Badge, IT Priority Badge, Owner, Updated Time, Action ("View Detail").
    - Empty state: "No urgent tickets require immediate attention."
  - **Right Section (30%): Quick Actions & Workload Summary**:
    - Quick Action Buttons:
      - "Search Tickets" (Jump to search input on queue)
      - "View My Queue" (Pre-filtered to current user)
      - "Create New Ticket" (Quick intake modal)
    - Workload Breakdown: Horizontal progress bars showing distribution across Categories and Priorities.

---

### Screen 2: Requester Dashboard (`/dashboard/requester`)
- **Header Shell**:
  - Displays TokTickIT Logo, Nav Tabs (`Dashboard` [Active], `My Tickets`, `Create Ticket`).
  - Right: User Profile (Name, `REQUESTER` Blue Badge), Logout button.
- **Welcome Banner**:
  - Heading: "Welcome, {Requester Name}!"
  - Subtitle: "Track the status of your submitted support requests."
- **Metric Cards Grid (4 Cards)**:
  - **Card 1: My Open Tickets**: Count of active tickets (`NEW`, `OPEN`, `IN_PROGRESS`, `PENDING`), "View all" drill-down link.
  - **Card 2: In Progress**: Count of tickets currently being worked on by IT Staff, "View all" link.
  - **Card 3: Waiting for Your Input**: Count of tickets in `WAITING_FOR_REQUESTER`, Amber alert styling, "Respond now" link.
  - **Card 4: Resolved / Closed**: Count of resolved/closed tickets within last 30 days, "View history" link.
- **Main Layout (2-Column on Desktop)**:
  - **Left Section (70%): My Recent Tickets**:
    - Table columns: Ticket No, Summary, Category, Status Badge, Last Updated, Action ("View").
    - If `isResolutionIndicated === true`, shows a small green badge "Resolution Indicated".
  - **Right Section (30%): Quick Help & Actions**:
    - Big Primary Button: "+ Submit New Request" (opens `/create-ticket`).
    - Secondary Button: "View All My Tickets" (opens `/my-tickets`).
    - Help Card: "Need urgent IT assistance? Contact internal extension 1234."

---

### Screen 3: Administrator Dashboard (`/dashboard/admin`)
- Inherits the complete layout and metrics of the **IT Staff Dashboard**.
- Adds a **System Administration Metrics Row** at top:
  - Total Users Count, Active Requesters, Active IT Staff, Inactive Accounts.
  - Quick link to "+ Create User" modal and User Management directory.

---

### Screen 4: Actions Taken Area on Ticket Detail (`/tickets/:id`)
- **Placement**: Located directly below the Ticket Operations panel (Owner, Priority, Status), above the Public Comments & Internal Notes communication tabs.
- **Container Styling**: Zen Green bordered card (`border-top: 3px solid #006B3C`), header title "Actions Taken by IT Staff".
- **Header Controls**:
  - Title and badge showing total count of recorded actions (e.g. "3 Actions Recorded").
  - "+ Add Action Taken" button (Zen Green accent; strictly visible to IT Staff and Admin; hidden from Requester).
- **Actions List / Table**:
  - **Columns (Desktop)**:
    1. *Action Date/Time*: Formatted as `DD MMM YYYY, HH:mm`.
    2. *Description*: Concise summary of work done.
    3. *Result / Outcome*: Output of the action (e.g. "Driver reinstalled", "Port unblocked").
    4. *Performed By*: Name and IT Staff badge of performer.
    5. *Status*: Badge (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`).
    6. *Follow-Up*: Icon indicator (`Yes` with note tooltip, or `None`).
    7. *Attachments / Notes*: Reference text to files/images.
    8. *Actions*: "Edit" button, "Transition Status" dropdown (IT Staff / Admin only).
  - **Requester View**: Same table/cards but read-only (all "+ Add", "Edit", and status transition controls completely omitted).
  - **Empty State**: "No actions recorded yet. IT Staff will log technical steps here as work progresses."
- **Create / Edit Action Taken Modal**:
  - Modal Header: "Record Action Taken" / "Edit Action Taken".
  - Field 1: Action Date/Time (default: Current time, editable).
  - Field 2: Action Description (textarea, required, min 5 chars).
  - Field 3: Result / Outcome (textarea, required for COMPLETED).
  - Field 4: Status (select: `PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`).
  - Field 5: Follow-Up Required Toggle (Switch/Checkbox).
  - Field 6: Follow-Up Note (textarea, dynamically required and highlighted when toggle is ON).
  - Field 7: Attachment Notes (text input, placeholder: "e.g. diagnostics_log.txt or screenshot_1.png").
  - Actions: "Cancel" (neutral) and "Save Action" (primary Zen Green).

---

### Screen 5: Ticket Resolution Gate & Advisory Feedback
- **Advisory Alert Banner**:
  - Rendered when `ticket.isResolutionIndicated === true`.
  - Alert Box: Soft green background (`#DCFCE7`), border (`#16A34A`), icon (Checkmark Circle).
  - Text: *"Requester has indicated that this issue appears resolved. Please verify all Actions Taken before formally transitioning ticket to RESOLVED."*
- **Status Transition Guard**:
  - Status select dropdown disables illegal transitions.
  - Selecting `RESOLVED` prompts confirmation verifying that required Actions Taken are completed.

---

## 3. Responsive Breakpoints & Accessibility Rules

### Breakpoints
- **Desktop (`>= 992px`)**:
  - Dashboard: 4 or 5 metric cards per row (`grid-template-columns: repeat(4, 1fr)`).
  - Ticket Detail: Two-column layout; full table for Actions Taken.
- **Tablet (`768px - 991px`)**:
  - Dashboard: 2x2 grid for metric cards.
  - Actions Taken: Condensed table with horizontal scroll guard.
- **Mobile (`< 768px`)**:
  - Dashboard: 1-column vertically stacked metric cards.
  - Actions Taken: Transforms from table into clean vertical card items showing Description, Performer, Status badge, and Result.
  - Page width: Strictly 375px without horizontal scroll (`overflow-x: hidden`).
  - Interactive touch targets: Minimum 44px x 44px.

### Accessibility Standards
- High-contrast text meeting WCAG AA (4.5:1 ratio).
- Semantic ARIA roles (`role="region"`, `role="table"`, `aria-label`).
- Visible focus indicator: `#006B3C` outline with 2px offset on all interactive buttons, inputs, and card links.
