# LCC_9: Drink Customization Screen (iPad Landscape)

## Description
Implement drink customization screen optimized for iPad landscape with large touch targets, clear option selection, and elder-friendly design patterns.

## Acceptance Criteria
- [ ] Drink customization screen at `/app/(user)/customize.tsx`
- [ ] Display selected drink category with color-coded header
- [ ] Large option cards for drink customization:
  - Size selection (Small 12oz, Medium 16oz, Large 20oz)
  - Milk type selection (Whole, Almond, Oat)
  - Extras selection (future: based on drink type)
- [ ] Optimized for iPad landscape layout (7"+ tablets)
- [ ] Clear visual feedback for selected options
- [ ] Large quantity selector with +/- buttons (56pt touch targets)
- [ ] "Add to Cart" button prominently displayed (64pt height)
- [ ] Integration with existing StorageService for drink data
- [ ] Theme-aware styling with ThemeProvider
- [ ] 44pt+ touch targets throughout all interactive elements
- [ ] High contrast design with clear labels (18pt minimum)
- [ ] VoiceOver support with descriptive labels
- [ ] Navigation integration with BackButton and NavigationHeader

## Technical Details
- Use drink color from menu selection for header background
- Option cards should have 40px spacing between them
- Selected option should have visual indicator (border, background change)
- Quantity selector: Default to 1, min 1, max 10
- Save customized drink to local cart state
- Navigate to cart screen after "Add to Cart"

## Dependencies
Blocked by: LCC_8

## Story Points
5

## Priority
High
