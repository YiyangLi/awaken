# LCC_13: Admin Order Management Dashboard

## Description
Implement admin dashboard for viewing and managing orders on iPad landscape with large touch targets, clear status indicators, and efficient order workflow.

## Acceptance Criteria
- [ ] Admin order dashboard at `/app/(admin)/orders.tsx`
- [ ] Order list view optimized for iPad landscape (2-column grid)
- [ ] Large order cards with clear status indicators
- [ ] Color-coded by status:
  - Pending (Yellow/Orange)
  - In Progress (Blue)
  - Ready (Green)
  - Completed (Gray)
- [ ] Each order card displays:
  - Customer name (24pt font)
  - Drink list with quantities
  - Timestamp (readable format)
  - Assigned barista
  - Current status
- [ ] Filter orders by status with large filter buttons (56pt touch targets)
- [ ] Search by customer name with large search field
- [ ] Date range filtering (today, this week, all)
- [ ] Quick action buttons for each order (64pt height):
  - Mark as In Progress
  - Mark as Ready
  - Mark as Completed
  - Cancel Order (with confirmation modal)
- [ ] Status changes persist to StorageService
- [ ] Real-time updates when orders change
- [ ] Empty state message when no orders match filters
- [ ] Pull-to-refresh functionality
- [ ] Theme-aware styling with high contrast
- [ ] VoiceOver support with descriptive labels

## Technical Details
- Use StorageService to load orders from AsyncStorage
- Order structure from `/src/types/index.ts`
- Status flow: pending → in-progress → ready → completed
- Cancel sets status to 'cancelled' (add to Order interface if needed)
- Grid layout: 2 columns on iPad landscape, 1 column on smaller devices
- Card spacing: 40px between cards
- Use existing ModeSwitch in header for user/admin switching
- Confirmation modal: Use LCC_11 modal system when available

## Dependencies
Blocked by: LCC_10

## Story Points
8

## Priority
Medium
