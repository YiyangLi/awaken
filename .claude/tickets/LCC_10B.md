# LCC_10B: Compact 3-Card Customization Layout

**Status**:  Complete  
**Priority**: High  
**Type**: UI Enhancement  
**Blocked by**: LCC_9 (Drink Customization Screen)  
**Blocks**: LCC_11 (Modal System)

## Overview

Redesign the drink customization screen to use a compact 3-card layout matching the main menu's 2×3 grid style. This reduces button sizes, eliminates unnecessary scrolling for primary options, and provides a more cohesive visual experience across the app.

## Background

The original drink customization screen (LCC_9) had large buttons that required scrolling and didn't match the main menu aesthetic. User feedback indicated that the buttons were too big and the layout should be more compact while maintaining elder-friendly accessibility standards.

## Requirements

### Design Specifications

1. **Card Layout**:
   - Use 3-card row layout matching main menu grid
   - Each card: 192pt minimum height (matching main menu button height)
   - 40px gaps between cards (fat finger prevention)
   - Cards should use flexbox with equal flex: 1 for balance
   - Empty placeholder views for drinks with fewer than 3 options

2. **Card Types**:
   - **Toggle Cards**: Tap to switch between two states (e.g., Whole Milk ” Oat Milk)
   - **Control Cards**: Title with +/- buttons inside (e.g., Shots)
   - **Standard Cards**: Display fixed information or state

3. **Visual Feedback**:
   - Color coding for ingredients:
     - Whole Milk: white (#FFFFFF)
     - Oat Milk: yellow-white (cornsilk #FFF8DC)
     - Chocolate: brownish (#8B4513)
     - White Chocolate: white (#FFFFFF)
     - Cream: light yellow (#FFFACD)
   - Progressive darkening for shots card: `rgba(101, 67, 33, ${0.1 + (shots * 0.15)})`
   - "(tap to switch)" subtitle on toggle cards
   - Text color contrast: white text on dark backgrounds, dark text on light backgrounds

4. **Accessibility**:
   - All cards maintain 192pt minimum height (large touch target)
   - Clear visual feedback on press (opacity + scale)
   - VoiceOver labels for all interactive elements
   - High contrast between text and backgrounds

### Drink-Specific Layouts

#### Mocha (3 cards + syrup section below)
- **Card 1**: Milk toggle (Whole ” Oat)
- **Card 2**: Shots with +/- controls (1-4)
- **Card 3**: Chocolate toggle (Regular ” White)
- **Below**: Scrollable syrup section (unchanged)

#### Chai Latte (3 cards)
- **Card 1**: Milk toggle (Whole ” Oat)
- **Card 2**: Shots with +/- controls (0-4, only drink allowing 0)
- **Card 3**: Dirty toggle ("No Espresso" ” "Dirty")
- **Logic**: 
  - shots > 0 automatically sets dirty = true
  - dirty = false automatically sets shots = 0
  - Two-way binding between shots and dirty status
  - Default: isDirty = false, shots = 0

#### Latte (2 cards + syrup section below)
- **Card 1**: Milk toggle (Whole ” Oat)
- **Card 2**: Shots with +/- controls (1-4)
- **Card 3**: Empty placeholder for grid balance
- **Below**: Scrollable syrup section (unchanged)

#### Hot Chocolate (2 cards)
- **Card 1**: Milk toggle (Whole ” Oat)
- **Card 2**: Chocolate toggle (Regular ” White)
- **Card 3**: Empty placeholder for grid balance

#### Americano (1 card)
- **Card 1**: Shots with +/- controls (1-4), centered
- **Cards 2-3**: Empty placeholders for grid balance

#### Italian Soda (1 card + syrup section below)
- **Card 1**: Cream toggle ("No Cream" ” "With Cream"), default: on
- **Cards 2-3**: Empty placeholders for grid balance
- **Below**: Scrollable syrup section (unchanged)

## Implementation Details

### New Styles Required

```typescript
threeCardRow: {
  flexDirection: 'row',
  gap: 40,
  marginBottom: 40,
}

compactCard: {
  flex: 1,
  borderRadius: 16,
  borderWidth: 2,
  padding: 24,
  alignItems: 'center',
  justifyContent: 'center',
}

compactCardTitle: {
  fontWeight: '600',
  marginBottom: 12,
  textAlign: 'center',
}

compactCardLabel: {
  fontWeight: '600',
  textAlign: 'center',
}

compactCardSubtitle: {
  fontWeight: '400',
  textAlign: 'center',
  marginTop: 4,
  opacity: 0.8,
}

shotsControls: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 20,
  marginTop: 8,
}

shotsValue: {
  fontWeight: '700',
  minWidth: 50,
  textAlign: 'center',
}

compactButton: {
  borderRadius: 12,
  alignItems: 'center',
  justifyContent: 'center',
}

compactButtonText: {
  fontWeight: '700',
  textAlign: 'center',
}
```

### State Management Changes

1. **Chai Latte Defaults**:
   ```typescript
   const [isDirty, setIsDirty] = useState(false); // Default: No Espresso
   const [shots, setShots] = useState(0); // Default: 0 shots
   ```

2. **Italian Soda Cream Default**:
   ```typescript
   const [hasCream, setHasCream] = useState(true); // Default: with cream
   ```

3. **Chai Latte Logic Implementation**:
   ```typescript
   // In handleShotsChange
   if (category === 'chai-latte') {
     if (newShots === 0) {
       setIsDirty(false);
     } else {
       setIsDirty(true);
     }
   }
   
   // In toggleDirty
   const toggleDirty = () => {
     const newDirty = !isDirty;
     setIsDirty(newDirty);
     if (newDirty) {
       setShots(APP_CONFIG.CUSTOMIZATION.SHOTS.DEFAULT); // 2
     } else {
       setShots(0);
     }
   };
   ```

### File Changes

- **`/app/(user)/drink/[id].tsx`**: Main implementation file
  - Replace large option sections with compact 3-card layout
  - Implement drink-specific conditional rendering
  - Add color coding for all ingredients
  - Add progressive darkening for shots
  - Implement Chai Latte logic (shots ” dirty binding)
  - Remove syrup placeholder cards from Latte and Italian Soda
  - Update defaults for Chai Latte and Italian Soda

## Acceptance Criteria

- [x] All 6 drinks use compact 3-card layout (where applicable)
- [x] Card height matches main menu buttons (192pt)
- [x] Color coding implemented for all ingredients
- [x] Progressive darkening applied to shots card
- [x] "(tap to switch)" subtitle on all toggle cards
- [x] Chai Latte two-way binding (shots ” dirty) works correctly
- [x] Chai Latte allows shots to go to 0 (only drink with this capability)
- [x] Italian Soda cream toggle defaults to "with cream"
- [x] Empty placeholders maintain grid balance for drinks with < 3 cards
- [x] Syrup sections remain scrollable below cards (Mocha, Latte, Italian Soda)
- [x] No syrup placeholder cards on Latte or Italian Soda
- [x] No scrolling required for primary customization options
- [x] All touch targets maintain 44pt minimum (192pt height exceeds this)
- [x] VoiceOver labels present and descriptive
- [x] TypeScript compilation passes with no errors
- [x] ESLint passes (complexity warnings acceptable for 6 drink types)

## Testing Notes

### Manual Testing Required

1. **Visual Verification**:
   - Verify 3-card layout matches main menu aesthetic
   - Check color coding accuracy for all ingredients
   - Verify progressive darkening of shots card (1’4)
   - Confirm "(tap to switch)" subtitle visibility

2. **Interaction Testing**:
   - Test all toggle cards (milk, chocolate, cream, dirty)
   - Test shots +/- buttons for all applicable drinks
   - Verify haptic feedback on all interactions
   - Test Chai Latte shots ” dirty binding in both directions

3. **Edge Cases**:
   - Chai Latte: shots = 0 should show "No Espresso", dirty = false
   - Chai Latte: shots > 0 should automatically enable dirty
   - Chai Latte: dirty toggle off should reset shots to 0
   - Americano: shots should not go below 1
   - All other drinks: shots should not go below 1

4. **Accessibility**:
   - Test with VoiceOver enabled
   - Verify all cards are focusable and readable
   - Check color contrast ratios (WCAG AA compliance)

## Related Files

- `/app/(user)/drink/[id].tsx` - Main implementation
- `/src/config/constants.ts` - Shot limits and defaults
- `/src/contexts/CartContext.tsx` - Cart item structure (unchanged)
- `/.claude/roadmap/2025.md` - Roadmap updates

## Design Rationale

### Why This Approach?

1. **Consistency**: Matches main menu's 2×3 grid for cohesive UX
2. **Efficiency**: Eliminates scrolling for primary options
3. **Accessibility**: Maintains large touch targets (192pt height)
4. **Clarity**: Color coding provides instant visual feedback
5. **Simplicity**: Toggle cards reduce cognitive load vs. dropdown menus
6. **Elder-Friendly**: Large text, high contrast, simple interactions

### Alternative Approaches Considered

1. **Vertical Stack**: Rejected due to excessive scrolling
2. **Tabs**: Rejected as too complex for elder users
3. **Dropdown Menus**: Rejected due to small touch targets and hidden options
4. **Modal Pickers**: Rejected as adding extra navigation steps

## Notes

- This enhancement builds on LCC_9 (original customization screen)
- Maintains all existing functionality while improving layout
- No changes to cart or checkout flow required
- Syrup sections remain unchanged (separate design consideration)
- Haptic feedback already implemented in LCC_9
- Progressive darkening formula: `0.1 + (shots * 0.15)` gives range 0.25 ’ 0.70 alpha

## Completion Summary

**Completed**: 2025-10-05

All requirements successfully implemented:
- Compact 3-card layout applied to all 6 drinks
- Color coding and progressive darkening implemented
- Chai Latte two-way binding (shots ” dirty) working correctly
- Italian Soda cream toggle defaults to "with cream"
- Removed syrup placeholder cards from Latte and Italian Soda
- All touch targets exceed 44pt minimum
- TypeScript and ESLint verification passed
- Elder-friendly design principles maintained throughout

**Impact**: Significantly improved UX with more compact, visually consistent interface that matches main menu aesthetic while maintaining accessibility standards.
