# LCC_10: Cart, Checkout Flow & Haptic Feedback

## Description
Implement cart review and checkout screens with elder-friendly order submission, plus add haptic feedback and accessibility polish to all navigation components.

## Acceptance Criteria

### Cart & Checkout Flow
- [ ] Cart screen at `/app/(user)/cart.tsx`
- [ ] Cart displays selected drinks with large cards
- [ ] Easy-to-modify quantities with large +/- buttons (56pt touch targets)
- [ ] Remove item button for each drink (44pt minimum)
- [ ] Clear total calculation display (40pt font)
- [ ] Large "Checkout" button (64pt height)
- [ ] Checkout screen at `/app/(user)/checkout.tsx`
- [ ] Customer name input with large text field (24pt font, 64pt height)
- [ ] Large on-screen keyboard support
- [ ] Optional phone number input
- [ ] Order summary with all drink details
- [ ] Large "Submit Order" button (64pt height)
- [ ] Order confirmation screen with order number
- [ ] Estimated completion time display
- [ ] "Order Another" button to return to menu
- [ ] Save completed order to StorageService
- [ ] Barista assignment from default list (APP_CONFIG)

### Haptic Feedback & Accessibility
- [ ] Add haptic feedback to all button presses (iOS)
- [ ] Haptic feedback on BackButton
- [ ] Haptic feedback on ModeSwitch actions
- [ ] Haptic feedback on menu drink buttons
- [ ] Haptic feedback on cart +/- buttons
- [ ] Verify all VoiceOver announcements work correctly
- [ ] Test complete flow with accessibility inspector
- [ ] Ensure keyboard navigation works throughout
- [ ] Document accessibility features

## Technical Details
- Cart state management: Use React Context or local state
- Order structure: Follow Order interface from `/src/types/index.ts`
- Barista assignment: Use default list from APP_CONFIG.ADMIN.DEFAULT_BARISTAS
- Haptic feedback: Use `expo-haptics` library
- Storage: Save orders with status 'pending'
- Navigation: Use router.push() and router.replace() appropriately

## Dependencies
Blocked by: LCC_9

## Story Points
8

## Priority
High
