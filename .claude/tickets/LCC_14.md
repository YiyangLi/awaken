# LCC_14: Review Screen with Smart Order Display

**Status**: In Progress
**Priority**: High
**Blocked by**: None
**Agent**: @agent-react-native-accessibility-engineer

## Overview
Implement a Review screen that shows order details with smart display logic (showing only changes from defaults), customer name input, and order confirmation flow.

## Requirements

### 1. Review Screen (`app/(user)/review.tsx`)
- Display order details with smart logic:
  - If all options are default → show only drink name
  - If any option is modified → show drink name + customizations
- Customer name input field (required)
- "Place an Order" button (enabled only when name is not empty)
- No price display
- No quantity display (always 1 item)

### 2. Default Options Reference
```typescript
Mocha: 2 shots, regular chocolate, no syrup, whole milk
Chai Latte: no espresso, whole milk
Latte: 2 shots, whole milk
Hot Chocolate: regular chocolate, whole milk
Americano: 2 shots
Italian Soda: no syrup, with cream
```

### 3. Smart Display Examples
- Default: "Mocha"
- Modified: "Latte, oat milk, 3 shots"
- Dirty Chai: "Chai Latte, dirty" (when exactly 2 shots added to Chai)
- Chai with custom shots: "Chai Latte, 1 shot" or "Chai Latte, 3 shots"

### 4. Order Confirmation Flow
- After "Place an Order" is pressed:
  - Navigate to confirmation screen
  - Show "Order confirmed" message
  - Auto-redirect to main menu (`/(user)`) after 3 seconds

### 5. Navigation Updates
- Customization view button: Change to "Review"
- Review button navigates to `/review`

## Accessibility Requirements
- Large touch targets (44pt minimum) for name input and button
- High contrast text display
- Clear visual feedback for disabled/enabled button states
- Large, readable text for order details
- Simple keyboard input for name field

## Acceptance Criteria
- [ ] Review screen displays order with smart default-checking logic
- [ ] Name input is required (button disabled when empty)
- [ ] "Place an Order" button is properly styled and accessible
- [ ] Order confirmation screen shows and auto-redirects
- [ ] Customization view button updated to "Review"
- [ ] "Dirty" chai logic works (exactly 2 shots = "dirty")
- [ ] All other customizations display correctly
- [ ] TypeScript compiles without errors
- [ ] ESLint passes with accessibility rules
- [ ] Manual testing confirms elder-friendly UX

## Technical Notes
- Create helper function to compare current options with defaults
- Handle "dirty" chai as special case (Chai + 2 shots)
- Use React Navigation for auto-redirect with timer
- Store customer name in order data structure
- Clear form after successful order placement

## Story Points
5
