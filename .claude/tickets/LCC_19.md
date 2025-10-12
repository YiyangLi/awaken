# LCC_19: Label Printer Order Summary Formatter

## Description
Create a utility function to format order information for a Brother P-touch label printer (2.4" × 1.1"). The label displays customer name on line 1 (font size 18, max 20 chars) and drink summary on line 2 (font size 12, max 30 chars). Implement character limits in the UI and abbreviation logic for drink customizations.

## Business Context
Coffee cart operators use a Brother P-touch label printer to create order labels that attach to cups. The labels must be:
- **Compact**: Fit on small 2.4" × 1.1" labels
- **Readable**: Large fonts (18pt for name, 12pt for drink)
- **Complete**: Include customer name, drink, and key customizations
- **Abbreviated**: Use short codes to fit within character limits

This ensures baristas can quickly identify orders and customers can easily find their drinks.

## Label Specifications

### Physical Dimensions
- **Width**: 2.4 inches
- **Height**: 1.1 inches
- **Printer**: Brother P-touch Editor compatible

### Layout Format
```
Line 1 (Font 18): [Customer Name]        (Max 20 chars)
Line 2 (Font 12): [Drink + Customization] (Max 30 chars)
```

### Example Labels
```
John Smith
Mocha 2 shots reg

Sarah
Latte oat vanilla

Mike
Y choco oat
```

## Character Limits

### Line 1: Customer Name (Max 20 characters)
- Font size: 18pt
- Maximum: 20 characters
- Truncation: If name exceeds 20 chars, truncate with "..."
- Examples:
  - "John" → "John"
  - "Elizabeth Anderson" → "Elizabeth Anderson" (18 chars, OK)
  - "Christopher Johnson" → "Christopher Johns..." (19 → truncate)

### Line 2: Drink Summary (Max 30 characters)
- Font size: 12pt
- Maximum: 30 characters
- Format: `[Drink] [Customizations]`
- Use abbreviations to fit

## Abbreviation Rules

### Drink Names
| Full Name | Abbreviation | Notes |
|-----------|--------------|-------|
| Mocha | Mocha | 5 chars, keep full |
| Chai Latte | Chai | 4 chars |
| Latte | Latte | 5 chars, keep full |
| Hot Chocolate | H Choco | 7 chars, "H" = hot, regular |
| Hot Chocolate (White) | Y Choco | 7 chars, "Y" = white/yolk |
| Americano | Americano | 9 chars, keep full |
| Italian Soda | Soda | 4 chars |

**Rationale for "Y" (White Chocolate)**:
- "W" could mean "whole milk" or "with"
- "Y" represents yolk/yellow color of white chocolate
- Clear distinction from regular chocolate

### Milk Types
| Full Name | Abbreviation |
|-----------|--------------|
| Whole Milk | (omit - default) |
| Oat Milk | oat |

### Espresso Shots
- Format: `[number] shot` or `[number] shots`
- Examples: "1 shot", "2 shots", "4 shots"
- Omit if default (2 shots for espresso drinks)

### Chocolate Types
- **Regular**: (omit - default, or implicit in "H Choco")
- **White**: "Y" prefix in drink name ("Y Choco")

### Syrups
- Use full syrup name if fits (most are short: Vanilla, Caramel, Hazelnut)
- Truncate to 3-4 chars if very long: "Watermelon" → "Wtrm"

### Chai Modifiers
- **Regular Chai**: Just "Chai"
- **Dirty Chai**: "Chai dirty" or "Chai [X] shot"

### Italian Soda
- **With Cream**: "Soda [syrup] +cream"
- **Without Cream**: "Soda [syrup]"

### Priority Order (Most Important First)
1. Drink name (abbreviated if needed)
2. Shots (if non-default)
3. Chocolate type (white = "Y" prefix)
4. Milk type (oat only, omit whole)
5. Syrup flavor
6. Chai dirty modifier
7. Cream (Italian Soda only)

## Acceptance Criteria

### Formatter Function (`src/utils/labelFormatter.ts`)
- [ ] Create `formatLabelText(order: Order)` function
- [ ] Returns object: `{ line1: string, line2: string }`
- [ ] Line 1: Customer name (max 20 chars, truncated if needed)
- [ ] Line 2: Drink summary (max 30 chars, abbreviated)
- [ ] Implements all abbreviation rules
- [ ] Handles multiple items (first item only for single-item orders)
- [ ] For multi-item orders: Use first item or "Multiple items" message

### UI Updates (`app/(user)/review.tsx`)
- [ ] Add `maxLength={20}` to customer name TextInput
- [ ] Add character counter below name input: "20/20" or "5/20"
- [ ] Character counter updates in real-time
- [ ] Visual warning if approaching limit (>18 chars: orange text)
- [ ] Existing validation (required field) remains

### Type Definitions (`src/types/index.ts`)
- [ ] Add `LabelFormat` interface:
  ```typescript
  interface LabelFormat {
    line1: string;  // Customer name (max 20 chars)
    line2: string;  // Drink summary (max 30 chars)
  }
  ```

### Testing & Validation
- [ ] Unit tests for `formatLabelText()` with various order combinations
- [ ] Verify character limits (20 for line1, 30 for line2)
- [ ] Test all drink types with common customizations
- [ ] Test edge cases: long names, complex orders, multi-item orders
- [ ] Manual testing with Brother P-touch Editor preview

## Technical Implementation

### Step 1: Create Label Formatter Utility

**File**: `src/utils/labelFormatter.ts`

```typescript
import type { Order, OrderItem } from '../types';

export interface LabelFormat {
  line1: string;  // Customer name (max 20 chars)
  line2: string;  // Drink summary (max 30 chars)
}

/**
 * Format order for Brother P-touch label printer
 * Label size: 2.4" × 1.1"
 * Line 1: Font 18, max 20 chars
 * Line 2: Font 12, max 30 chars
 */
export const formatLabelText = (order: Order): LabelFormat => {
  // Line 1: Customer name (truncate if > 20 chars)
  const line1 = truncateName(order.customerName, 20);

  // Line 2: Drink summary (first item only for simplicity)
  const firstItem = order.items[0];
  const line2 = firstItem
    ? formatDrinkSummary(firstItem, 30)
    : 'No items';

  return { line1, line2 };
};

/**
 * Truncate name with ellipsis if too long
 */
const truncateName = (name: string, maxLength: number): string => {
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength - 3) + '...';
};

/**
 * Format drink with customizations
 * Uses abbreviations to fit in 30 chars
 */
const formatDrinkSummary = (item: OrderItem, maxLength: number): string => {
  const parts: string[] = [];

  // 1. Drink name (abbreviated)
  parts.push(abbreviateDrinkName(item));

  // 2. Extract customizations from selectedOptions
  const milk = getMilkType(item);
  const shots = getShots(item);
  const chocolate = getChocolateType(item);
  const syrup = getSyrupFlavor(item);
  const isDirty = getIsDirty(item);
  const hasCream = getHasCream(item);

  // 3. Add customizations in priority order
  if (shots !== getDefaultShots(item.drinkName)) {
    parts.push(`${shots} shot${shots > 1 ? 's' : ''}`);
  }

  if (milk === 'oat') {
    parts.push('oat');
  }

  if (syrup) {
    parts.push(abbreviateSyrup(syrup));
  }

  if (isDirty) {
    parts.push('dirty');
  }

  if (hasCream) {
    parts.push('+cream');
  }

  // Join and truncate if needed
  let summary = parts.join(' ');
  if (summary.length > maxLength) {
    summary = summary.substring(0, maxLength - 3) + '...';
  }

  return summary;
};

/**
 * Abbreviate drink names
 */
const abbreviateDrinkName = (item: OrderItem): string => {
  const name = item.drinkName.toLowerCase();
  const chocolate = getChocolateType(item);

  if (name.includes('mocha')) return 'Mocha';
  if (name.includes('chai')) return 'Chai';
  if (name.includes('latte')) return 'Latte';
  if (name.includes('hot chocolate')) {
    return chocolate === 'white' ? 'Y Choco' : 'H Choco';
  }
  if (name.includes('americano')) return 'Americano';
  if (name.includes('italian soda') || name.includes('soda')) return 'Soda';

  // Fallback: return original name (shouldn't happen)
  return item.drinkName;
};

/**
 * Abbreviate syrup names if needed
 */
const abbreviateSyrup = (syrup: string): string => {
  if (syrup.length <= 8) return syrup; // Short enough

  // Abbreviate long syrup names
  const abbrevMap: Record<string, string> = {
    'Watermelon': 'Wtrm',
    'Blueberry': 'Blbry',
    'Strawberry': 'Strw',
  };

  return abbrevMap[syrup] ?? syrup.substring(0, 4);
};

// Helper functions to extract customizations from OrderItem
const getMilkType = (item: OrderItem): 'whole' | 'oat' | null => {
  const milkOption = item.selectedOptions.find(opt => opt.id.startsWith('milk-'));
  if (!milkOption) return null;
  if (milkOption.id === 'milk-oat') return 'oat';
  if (milkOption.id === 'milk-whole') return 'whole';
  return null;
};

const getShots = (item: OrderItem): number => {
  const shotOption = item.selectedOptions.find(opt => opt.id.startsWith('shots-'));
  if (!shotOption) return 0;
  const match = shotOption.id.match(/shots-(\d+)/);
  return match?.[1] ? parseInt(match[1], 10) : 0;
};

const getDefaultShots = (drinkName: string): number => {
  const name = drinkName.toLowerCase();
  if (name.includes('mocha') || name.includes('latte') || name.includes('americano')) {
    return 2; // Default for espresso drinks
  }
  return 0; // No default for other drinks
};

const getChocolateType = (item: OrderItem): 'regular' | 'white' | null => {
  const chocolateOption = item.selectedOptions.find(opt =>
    opt.id.startsWith('chocolate-')
  );
  if (!chocolateOption) return null;
  if (chocolateOption.id === 'chocolate-white') return 'white';
  if (chocolateOption.id === 'chocolate-regular') return 'regular';
  return null;
};

const getSyrupFlavor = (item: OrderItem): string | null => {
  const syrupOption = item.selectedOptions.find(opt => opt.id.startsWith('syrup-'));
  if (!syrupOption) return null;
  const match = syrupOption.id.match(/syrup-(.+)/);
  return match?.[1] ?? null;
};

const getIsDirty = (item: OrderItem): boolean => {
  return item.selectedOptions.some(opt => opt.id === 'dirty');
};

const getHasCream = (item: OrderItem): boolean => {
  return item.selectedOptions.some(opt => opt.id === 'cream');
};
```

### Step 2: Update Review Screen UI

**File**: `app/(user)/review.tsx`

```typescript
// Add state for character count
const [nameLength, setNameLength] = useState(0);

// Update TextInput
<TextInput
  style={[styles.textInput, { /* ... */ }]}
  value={customerName}
  onChangeText={(text) => {
    setCustomerName(text);
    setNameLength(text.length);
  }}
  maxLength={20}  // Add character limit
  // ... existing props
/>

// Add character counter below input
<Text
  style={[
    styles.charCounter,
    {
      color: nameLength > 18
        ? theme.colors.WARNING  // Orange if approaching limit
        : theme.colors.TEXT_SECONDARY,
      fontSize: theme.typography.FONT_SIZES.SMALL,
    },
  ]}
>
  {nameLength}/20 characters
</Text>

// Add style
const styles = StyleSheet.create({
  // ... existing styles
  charCounter: {
    marginTop: 4,
    textAlign: 'right',
    fontWeight: '500',
  },
});
```

### Step 3: Add Type Definition

**File**: `src/types/index.ts`

```typescript
/**
 * Label format for Brother P-touch printer
 * Label size: 2.4" × 1.1"
 */
export interface LabelFormat {
  /** Line 1: Customer name (Font 18, max 20 chars) */
  line1: string;
  /** Line 2: Drink summary (Font 12, max 30 chars) */
  line2: string;
}
```

## Files to Create/Modify

1. **`src/utils/labelFormatter.ts`** (NEW)
   - Create formatter utility with all abbreviation logic
   - Export `formatLabelText()` function
   - Include helper functions for customization extraction

2. **`app/(user)/review.tsx`**
   - Add `maxLength={20}` to name input
   - Add character counter display
   - Update styles for character counter

3. **`src/types/index.ts`**
   - Add `LabelFormat` interface

## Dependencies
Uses:
- LCC_2 (Type system - Order, OrderItem interfaces)
- LCC_17 (Dynamic syrups - syrup names can vary)

## Story Points
3 (Utility function + UI updates)

## Priority
High (Required for printer integration)

## Elder-Friendly Design Requirements
- [ ] Clear character counter (large text, high contrast)
- [ ] Visual warning when approaching limit (orange color >18 chars)
- [ ] Immediate feedback as user types
- [ ] No surprises - character limit enforced by TextInput
- [ ] Counter positioned near input (easy association)

## Testing Notes

### Test Cases for `formatLabelText()`

**Drink Abbreviations**:
- [ ] Mocha → "Mocha"
- [ ] Chai Latte → "Chai"
- [ ] Hot Chocolate → "H Choco"
- [ ] Hot Chocolate (White) → "Y Choco"
- [ ] Italian Soda → "Soda"

**Customizations**:
- [ ] Mocha, 2 shots, whole milk → "Mocha" (defaults omitted)
- [ ] Mocha, 4 shots → "Mocha 4 shots"
- [ ] Latte, oat milk, vanilla → "Latte oat vanilla"
- [ ] Hot Chocolate (White), oat milk → "Y Choco oat"
- [ ] Chai, dirty, 2 shots → "Chai 2 shots dirty"
- [ ] Italian Soda, vanilla, with cream → "Soda vanilla +cream"

**Name Truncation**:
- [ ] "John" → "John" (4 chars, OK)
- [ ] "Elizabeth Anderson" → "Elizabeth Anderson" (18 chars, OK)
- [ ] "Christopher Johnson" → "Christopher John..." (19 → truncate at 17 + "...")
- [ ] "Alexander Montgomery" → "Alexander Montgo..." (20 → truncate at 17 + "...")

**Character Limits**:
- [ ] Line 1 never exceeds 20 characters
- [ ] Line 2 never exceeds 30 characters
- [ ] Complex customizations truncate gracefully

**Edge Cases**:
- [ ] Empty customer name → "" (handled by required validation in review screen)
- [ ] No items in order → "No items"
- [ ] Very long syrup name → Abbreviated or truncated

## User Story

**As a** coffee cart barista
**I want to** print compact order labels with customer names and drink summaries
**So that** I can quickly identify and prepare orders without confusion

**Acceptance**: When I finalize an order for "Sarah" with a "Latte, oat milk, vanilla", the label formatter produces:
- Line 1: `Sarah`
- Line 2: `Latte oat vanilla`

Both lines fit on the 2.4" × 1.1" Brother P-touch label with proper font sizes.

## Future Enhancements (Post-v1)
- [ ] Support multi-item orders (list multiple drinks or "3 items")
- [ ] Quantity indicators (e.g., "2x Mocha")
- [ ] Order number/timestamp on label
- [ ] QR code for order lookup
- [ ] Custom abbreviation preferences (admin configurable)
- [ ] Smart abbreviation based on actual label width testing
- [ ] Print preview before finalizing order
- [ ] Integration with Brother SDK for direct printing

## Notes
- This ticket focuses on the **formatter function** and **UI character limit**
- Actual printer integration (Bluetooth/USB connection) will be in LCC_20
- The formatter is designed to work with Brother P-touch Editor for manual testing
- Abbreviations are optimized for readability, not just character count
