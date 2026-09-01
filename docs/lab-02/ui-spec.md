# Lab 2 Zen Green UI Specification

This document defines the visual design system, color tokens, typography, component rules, responsive breakpoints, accessible interactions, and screenshot requirements for **TokTickIT Lab 2**.

---

## 1. Design System Tokens & Color Palette

| Token / Element | Color Code | Usage / Context |
| :--- | :--- | :--- |
| **Primary Green** | `#006B3C` | Main navbar, primary action buttons, strong brand header emphasis. |
| **Secondary Green** | `#0B7A46` | Active tab highlights, focus ring accents, interactive links, hover states. |
| **Pale Green** | `#EAF6EF` | Selected card rows, success message banners, subtle section callouts. |
| **Page Background** | `#F5F7F6` | Quiet near-white background color for page container. |
| **Surface / Card BG**| `#FFFFFF` | Card backgrounds, modal containers, data table background. |
| **Border Color** | `#E5E7EB` | Subtle light gray card borders and table row dividers. |
| **Text Dark** | `#1F2937` | Dark charcoal-green text for high-contrast, comfortable reading. |
| **Text Muted** | `#6B7280` | Subtitle text, table header labels, secondary hints. |
| **Editable Field BG**| `#FFFFFF` | Form inputs, select dropdowns, textareas. |
| **Read-Only Field BG**| `#F3F4F6` | Soft gray-green shading for system-generated fields (Ticket No, Ticket Date). |
| **Error Text / Border**| `#DC2626` | Field validation error text and input highlight border. |
| **Warning Callout**| `#D97706` | Amber callouts or warning badges. |
| **Success Banner** | `#16A34A` | Green confirmation banners with checkmark icons. |

---

## 2. Typography & Form Component Rules

- **Typography**: Primary font family `Inter, system-ui, sans-serif`. Heading 1 (`24px/32px bold`), Heading 2 (`18px/24px semi-bold`), Body (`14px/20px regular`), Small/Caption (`12px/16px regular`).
- **Form Field Labels**: Positioned directly above inputs with font-weight `500` (medium). Required fields feature a red asterisk (`*` in `#DC2626`). Asterisks accompany, but do not replace, field validation error messages.
- **Input Heights**: Fixed `40px` height for text inputs, select dropdowns, and buttons. Description textarea `min-height: 120px`, resizable vertically only.
- **Button Hierarchy**:
  - `Primary Button`: Solid `#006B3C` background, white text. Disabled state: opacity `0.5` with cursor `not-allowed`. Busy state: spinning indicator with text "Submitting...".
  - `Secondary Button`: White background with `#006B3C` border and text.
  - `Destructive Button`: `#DC2626` text with `#FEE2E2` soft red background for attachment soft-removal actions.
- **Validation Messages**: Displayed inline directly beneath the corresponding invalid field in red `#DC2626` text.

---

## 3. Screen Layout Specifications

### 3.1 Development Requester Selector Screen
- Centered card container (max-width `540px`).
- Displays TokTickIT title, test identity notice callout ("Select a Development Requester to test requester-specific ticket behavior. This is not a login screen.").
- Dropdown selector listing active Development Requesters loaded from database.
- Primary "Continue" button saving selected Requester identity to `localStorage` and routing to My Tickets.

### 3.2 Create Ticket Screen
- Top section: System-generated read-only fields (Ticket Number preview: `TKT-YYYY-XXXXXX`, Ticket Date preview: Current timestamp).
- Grid layout: 2-column layout on desktop for Category & Related System selection, Requested Priority radio pills.
- Full-width inputs for Ticket Summary and Description.
- Drag-and-Drop Attachment zone with file type support info (`JPG, PNG, WEBP, PDF <= 5MB`).
- Action bar at bottom right: Secondary "Cancel" button, Primary "Submit Ticket" button.

### 3.3 My Tickets Screen
- Top Action Bar: Page Title "My Tickets", "Create Ticket" primary action button.
- Filter & Search Bar:
  - Search input box with magnifying glass icon.
  - Category dropdown filter.
  - Requested Priority dropdown filter.
  - Status dropdown filter.
  - "Clear Filters" secondary button.
- Ticket Listing:
  - Desktop: Data table displaying columns `Ticket No`, `Ticket Date`, `Summary`, `Category`, `Priority Badge`, `Status Badge`, `Actions`.
  - Mobile: Stacked card view displaying summary, badges, date, and detail button.
- Pagination Bar: Displays "Showing X to Y of Z tickets", previous/next page buttons, page numbers.
- Empty State: Displays empty box illustration and "No tickets found. Create your first support ticket."
- No-Results State: Displays search icon and "No tickets match your filters. Try clearing search or filters."

### 3.4 Ticket Detail Screen
- Header Breadcrumb: `My Tickets > Ticket Details`.
- Header Banner: Ticket Number, Ticket Date (`createdAt`), Status Badge, Requested Priority Badge.
- Read-Only Information Fields: Requester Name, Category, Related System, Ticket Summary, Description.
- Attachment Management Section:
  - Active Attachments List: Filename, size, MIME type badge, Download button, Soft-Remove button.
  - Soft-Removed Attachments List: Filename, size, "Soft Removed" badge, Removal Reason, Removal Timestamp.
  - Add Attachment Control: File dropzone allowing additional allowed files (up to max 5 active).
  - Soft Remove Confirmation Modal: Prompt requiring user to enter a mandatory removal reason before confirming soft removal.

---

## 4. Responsive Viewport Requirements

| Viewport | Breakpoint | Responsive Adaptation Rules |
| :--- | :--- | :--- |
| **Desktop** | `>= 992px` | Multi-column grid layout, centered max-width `1200px` container, full table data display in My Tickets. |
| **Tablet** | `768px - 991px` | 2-column layout for forms, flex-wrap filter bar, table with scrollable or stacked fields. |
| **Mobile** | `< 768px` | 1-column single-stack layout, ticket list converts from table to card list, buttons full-width touch targets (min `44px` height). No horizontal page scroll. |

---

## 5. Visual Inspection & Screenshot Checklist

Visual evidence screenshots must be generated and saved to `artifacts/lab-02/screenshots/`:
- `create-ticket/01-initial-desktop.png`
- `create-ticket/02-validation-error.png`
- `create-ticket/03-submitting-busy.png`
- `create-ticket/04-success-modal.png`
- `create-ticket/05-api-failure-preserved.png`
- `my-tickets/01-desktop-list.png`
- `my-tickets/02-search-filter.png`
- `my-tickets/03-empty-state.png`
- `my-tickets/04-no-results.png`
- `my-tickets/05-mobile-cards.png`
- `ticket-detail/01-owned-detail-desktop.png`
- `ticket-detail/02-add-attachment.png`
- `ticket-detail/03-soft-remove-modal.png`
- `ticket-detail/04-soft-removed-metadata.png`
- `ticket-detail/05-unauthorized-access-blocked.png`
