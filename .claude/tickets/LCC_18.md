# LCC_18: Multi-Row Syrup Grid Layout with Popularity Sorting

## Description
Update the drink customization screen to display syrups in a grid layout with exactly 3 buttons per row, sorted by popularity (most ordered first). When there are more than 3 available syrups, create additional rows to accommodate all options. Most popular syrups appear in the first row so customers don't need to scroll.

## Business Context
As the coffee cart expands its syrup offerings beyond the initial 3 flavors, the current single-row layout becomes limiting. A multi-row grid with popularity-based sorting ensures:
1. All available syrups are displayed in an organized, elder-friendly manner
2. Most popular options appear first, reducing cognitive load
3. No horizontal scrolling required
4. Customers can quickly find their preferred syrups without searching

## Current State
- Syrup options are displayed in a single horizontal row using `optionRow` style
- Limited to displaying ~3-4 syrups comfortably before layout issues
- No sorting applied - syrups shown in arbitrary order
- Implemented in `/app/(user)/drink/[id].tsx` around line 616

## Desired State
- Syrups displayed in rows of exactly 3 buttons
- **Sorted by popularity (total order count from inventory stats) in descending order**
- Most popular syrups appear in Row 1 (no scrolling needed)
- Automatic wrapping to new rows when syrup count > 3
- Examples with popularity sorting:
  - 7 syrups ordered by popularity:
    - Row 1: Vanilla (50 orders), Caramel (45 orders), Hazelnut (30 orders)
    - Row 2: Cherry (20 orders), Blueberry (15 orders), Watermelon (10 orders)
    - Row 3: Grape (5 orders)
  - New syrups with no order history appear at the end

## Acceptance Criteria

### Layout Requirements
- [ ] Display syrup options in rows of exactly 3 buttons per row
- [ ] Use flexWrap or chunking approach to create multiple rows
- [ ] Maintain consistent button sizing across all rows
- [ ] Preserve existing elder-friendly design (64pt touch targets, large text)
- [ ] Maintain 40px gap between buttons (horizontal and vertical)

### Popularity Sorting Requirements
- [ ] Load historical order data to calculate syrup usage counts
- [ ] Sort syrups by total order count (highest to lowest)
- [ ] Most popular 3 syrups appear in first row
- [ ] Syrups with 0 orders appear at the end (alphabetically sorted)
- [ ] Sorting persists across app restarts (based on cumulative data)
- [ ] Efficient calculation to avoid performance issues

### Visual Consistency
- [ ] All syrup buttons have equal width within each row
- [ ] Last row with fewer than 3 buttons maintains same button width as full rows
- [ ] Selected state styling remains consistent across all rows
- [ ] Gradient opacity effect preserved for visual hierarchy

### Responsiveness
- [ ] Layout works on iPad in both portrait and landscape
- [ ] Buttons scale appropriately based on screen width
- [ ] Vertical spacing between rows matches horizontal spacing (40px)

### Accessibility
- [ ] VoiceOver announces syrups in logical order (left-to-right, top-to-bottom)
- [ ] Tab order follows visual grid layout
- [ ] Selected state clearly announced ("Selected" / "Not selected")

## Technical Implementation

### Step 1: Calculate Syrup Popularity
Load all orders and calculate syrup usage counts:

```typescript
// In component
const [syrupUsageMap, setSyrupUsageMap] = useState<Map<string, number>>(new Map());

useEffect(() => {
  loadSyrupUsage();
}, []);

const loadSyrupUsage = async () => {
  const allOrders = await StorageService.getOrders();
  const stats = calculateInventoryStats(allOrders);

  // Convert stats.syrups object to Map
  const usageMap = new Map<string, number>();
  Object.entries(stats.syrups).forEach(([name, count]) => {
    usageMap.set(name.toLowerCase(), count);
  });
  setSyrupUsageMap(usageMap);
};
```

### Step 2: Sort Syrups by Popularity
Sort available syrups before rendering:

```typescript
const sortedSyrups = useMemo(() => {
  return [...availableSyrups].sort((a, b) => {
    const countA = syrupUsageMap.get(a.name.toLowerCase()) || 0;
    const countB = syrupUsageMap.get(b.name.toLowerCase()) || 0;

    // Sort by count descending
    if (countB !== countA) {
      return countB - countA;
    }

    // If counts are equal, sort alphabetically
    return a.name.localeCompare(b.name);
  });
}, [availableSyrups, syrupUsageMap]);
```

### Step 3A: Layout - FlexWrap (Recommended)
Update the `optionRow` style to use `flexWrap`:

```typescript
// In styles
optionRow: {
  flexDirection: 'row',
  flexWrap: 'wrap',  // Add this
  gap: 40,
  marginBottom: 40,
},

// Calculate button width to ensure exactly 3 per row
optionCard: {
  // Current: flex: 1
  // New: fixed width based on container
  width: 'calc((100% - 80px) / 3)',  // Account for 2 gaps of 40px
  // ... rest of styles
}

// Use sortedSyrups instead of availableSyrups
{sortedSyrups.map((syrup) => (
  // Render button
))}
```

### Step 3B: Layout - Chunking Array (Alternative)
Break the sorted syrups array into chunks of 3:

```typescript
const chunkArray = <T,>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// In render
const syrupRows = chunkArray(sortedSyrups, 3);

{syrupRows.map((row, rowIndex) => (
  <View key={rowIndex} style={styles.optionRow}>
    {row.map((syrup) => (
      // Render syrup button
    ))}
  </View>
))}
```

### Recommended: FlexWrap + useMemo
- Simpler implementation
- Native React Native behavior
- Memoized sorting prevents unnecessary recalculations
- Automatically handles edge cases
- Better for future maintenance

## Files to Modify

1. **`/app/(user)/drink/[id].tsx`**
   - Add `loadSyrupUsage()` function to calculate popularity
   - Add `sortedSyrups` useMemo for sorting by popularity
   - Update syrup rendering section (around line 616) to use `sortedSyrups`
   - Modify `optionRow` and `optionCard` styles
   - Calculate proper button widths for 3-per-row layout

2. **Reuse from existing implementation**:
   - `src/utils/inventory.ts` - `calculateInventoryStats()` (already tracks syrup usage)
   - `src/storage/StorageService.ts` - `getOrders()` (already implemented)

## Dependencies
Blocked by:
- LCC_17 (Syrup Management) - Completed ✅

Uses:
- LCC_5 (Theme System)
- LCC_16 (Inventory Analysis - `calculateInventoryStats` function)

## Story Points
3 (UI adjustment + data loading/sorting logic)

## Priority
High (improves UX by surfacing popular options first)

## Elder-Friendly Design Requirements
- [ ] Maintain 64pt minimum touch target height
- [ ] Preserve large text (24pt font)
- [ ] High contrast borders and selected states
- [ ] Clear visual feedback on tap
- [ ] Adequate spacing between rows (40px)
- [ ] VoiceOver labels: "Cherry syrup, row 1, button 1 of 3"

## Testing Notes
Test scenarios:

**Layout Testing:**
- [ ] Display with 3 syrups (1 row)
- [ ] Display with 4 syrups (2 rows: 3 + 1)
- [ ] Display with 6 syrups (2 rows: 3 + 3)
- [ ] Display with 7 syrups (3 rows: 3 + 3 + 1)
- [ ] Display with 10 syrups (4 rows: 3 + 3 + 3 + 1)
- [ ] Selection works correctly across all rows
- [ ] VoiceOver navigation flows naturally
- [ ] iPad landscape orientation
- [ ] No horizontal scrolling required

**Sorting Testing:**
- [ ] Syrups with order history appear before new syrups
- [ ] Most popular syrup (highest count) appears in position 1
- [ ] Second most popular appears in position 2
- [ ] Third most popular appears in position 3
- [ ] New syrups with 0 orders appear at the end alphabetically
- [ ] Sorting updates when new orders are placed
- [ ] Sorting persists across app restarts

**Performance Testing:**
- [ ] Loading syrup usage data doesn't cause UI lag
- [ ] useMemo prevents unnecessary re-sorting
- [ ] Works smoothly with 20+ syrups

## User Story

**As a** coffee cart customer
**I want to** see the most popular syrup options first in an organized grid
**So that** I can quickly find and select my preferred syrup without scrolling through all options

**Acceptance**: When I customize a Mocha with 7 available syrups, I see them sorted by popularity:
- **Row 1**: Vanilla (most popular), Caramel (2nd), Hazelnut (3rd)
- **Row 2**: Cherry (4th), Blueberry (5th), Watermelon (6th)
- **Row 3**: Grape (least popular/new)

All buttons are the same size. I can tap any syrup to select it. The most popular options are immediately visible without scrolling.

## Design Notes
Current screenshot shows 4 syrups attempting to fit in one row, which looks cramped and doesn't prioritize popular options.

The new layout should:
- **Row 1**: Top 3 most popular syrups (based on order history)
- **Row 2+**: Remaining syrups sorted by popularity
- **Last positions**: New syrups with no orders (alphabetically)
- Each button maintains consistent width
- Vertical gap between rows = 40px (same as horizontal gap)
- Loading is fast (< 100ms) to avoid UI delays

## Future Enhancements (Post-v1)
- [ ] Lazy loading for very large syrup lists (>20 syrups)
- [ ] Search/filter for syrup options
- [ ] Syrup categories (Fruit, Classic, Seasonal)
- [ ] Horizontal scrolling within rows (alternative UX)
