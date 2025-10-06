# LCC_16: Inventory Analysis Dashboard

## Description
Implement an admin dashboard that provides comprehensive inventory planning insights by analyzing order history. The dashboard shows aggregated statistics on drink orders and ingredient consumption, helping coffee cart operators plan their inventory efficiently.

## Business Context
Coffee cart operators need to know:
- How many total orders they've received
- Which drinks are most popular
- How much of each ingredient (milk, shots, syrups, etc.) they're using
- Trends over different time periods (today, this week, this month, all time)

This data helps them:
- Order the right amount of supplies
- Avoid running out of popular ingredients
- Identify slow-moving items
- Plan for busy periods

## Acceptance Criteria

### Dashboard Layout (iPad Landscape Optimized)
- [ ] Admin inventory dashboard at `/app/(admin)/inventory.tsx`
- [ ] Date range filter with large pill buttons (56pt height):
  - Today
  - This Week
  - This Month
  - All Time
  - Custom Range (date picker for start/end)
- [ ] Statistics displayed in card-based grid layout (2 columns on iPad landscape)
- [ ] Pull-to-refresh to recalculate stats
- [ ] Theme-aware styling with high contrast
- [ ] VoiceOver support with descriptive labels

### Drink Statistics Section
- [ ] **Total Orders Card**: Display total number of orders in selected date range
- [ ] **Orders by Drink Type Card**: Show breakdown of each drink category with counts
  - Mocha: X orders
  - Chai Latte: X orders
  - Latte: X orders
  - Hot Chocolate: X orders
  - Americano: X orders
  - Italian Soda: X orders
- [ ] Visual representation (bar chart or progress bars showing relative popularity)
- [ ] Large, readable numbers (28pt font)

### Ingredient Consumption Section
- [ ] **Milk Usage Card**:
  - Total Whole Milk: X orders
  - Total Oat Milk: X orders
  - Percentage breakdown
- [ ] **Espresso Shots Card**:
  - Total shots across all drinks: X shots
  - Average shots per espresso drink: X.X shots
  - Breakdown by drink type (Mocha, Latte, Americano, Dirty Chai)
- [ ] **Chocolate Usage Card**:
  - Total Regular Chocolate: X orders
  - Total White Chocolate: X orders
  - Used in: Mocha (X), Hot Chocolate (X)
- [ ] **Syrup Consumption Card**:
  - Total Vanilla: X orders
  - Total Caramel: X orders
  - Total Hazelnut: X orders
  - Breakdown by drink type (Mocha, Latte, Italian Soda)
- [ ] **Other Ingredients Card**:
  - Dirty Chai orders: X orders
  - Italian Soda with Cream: X orders

### Date Range Filtering
- [ ] Filter all statistics by selected date range
- [ ] "Today" filter: Orders from midnight to now (local time)
- [ ] "This Week" filter: Orders from Monday 00:00 to now
- [ ] "This Month" filter: Orders from 1st of month to now
- [ ] "All Time" filter: All orders in database
- [ ] "Custom Range" filter: User-selected start and end dates
- [ ] Display selected date range prominently (e.g., "Oct 1 - Oct 5, 2025")
- [ ] Show "No data" message when no orders match filter

### Data Calculations
- [ ] Calculate totals from order history in StorageService
- [ ] Parse each order's drink options to count ingredients:
  - `options.milk` → Whole Milk or Oat Milk count
  - `options.shots` → Total espresso shots
  - `options.chocolate` → Regular or White Chocolate count
  - `options.syrup` → Vanilla, Caramel, or Hazelnut count
  - `options.isDirty` → Dirty Chai count
  - `options.addCream` → Italian Soda with Cream count
- [ ] Group orders by drink category for drink statistics
- [ ] All calculations update when date range changes

### Export Functionality (Optional for v1)
- [ ] "Export Report" button to share inventory data
- [ ] Generate CSV or PDF with all statistics
- [ ] Include date range in export filename

## Technical Details

### Data Structure Analysis
Parse orders from StorageService with structure:
```typescript
interface Order {
  id: string;
  customerName: string;
  items: OrderItem[];  // Array of drinks in this order
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  assignedBarista: string;
}

interface OrderItem {
  drink: Drink;
  quantity: number;
}

interface Drink {
  id: string;
  name: string;
  category: DrinkCategory;
  options: DrinkOptions;
}

interface DrinkOptions {
  milk?: 'whole' | 'oat';
  shots?: number;
  chocolate?: 'regular' | 'white';
  syrup?: 'vanilla' | 'caramel' | 'hazelnut';
  isDirty?: boolean;
  addCream?: boolean;
}
```

### Calculation Logic

**Total Orders**: Count of orders in date range

**Orders by Drink**:
```typescript
const drinkCounts = orders.reduce((acc, order) => {
  order.items.forEach(item => {
    acc[item.drink.category] = (acc[item.drink.category] || 0) + item.quantity;
  });
  return acc;
}, {});
```

**Ingredient Totals**:
```typescript
// Milk
let wholeMilk = 0, oatMilk = 0;
orders.forEach(order => {
  order.items.forEach(item => {
    if (item.drink.options.milk === 'whole') wholeMilk += item.quantity;
    if (item.drink.options.milk === 'oat') oatMilk += item.quantity;
  });
});

// Shots
let totalShots = 0;
orders.forEach(order => {
  order.items.forEach(item => {
    totalShots += (item.drink.options.shots || 0) * item.quantity;
  });
});

// Similar logic for chocolate, syrup, dirty, cream
```

### Date Range Filtering
```typescript
const filterOrdersByDateRange = (orders: Order[], range: DateRange) => {
  const now = new Date();
  let startDate: Date;

  switch (range) {
    case 'today':
      startDate = startOfDay(now);
      break;
    case 'week':
      startDate = startOfWeek(now);
      break;
    case 'month':
      startDate = startOfMonth(now);
      break;
    case 'all':
      return orders;
    case 'custom':
      startDate = customStartDate;
      const endDate = customEndDate;
      return orders.filter(o => o.createdAt >= startDate && o.createdAt <= endDate);
  }

  return orders.filter(o => o.createdAt >= startDate);
};
```

### UI Components
- **StatCard**: Reusable card component for displaying a stat with title, value, and optional breakdown
- **ProgressBar**: Visual representation of relative values (e.g., drink popularity)
- **DateRangePicker**: Large, accessible date range selector
- **IngredientBreakdown**: Component showing ingredient usage with sub-items

### File Structure
- `/app/(admin)/inventory.tsx` - Main inventory dashboard screen
- `/src/utils/inventory.ts` - Calculation utilities for stats
- `/src/components/stats/StatCard.tsx` - Reusable stat card component (optional)

### Admin Layout Integration
Update `/app/(admin)/_layout.tsx` to include inventory route:
```typescript
<Stack.Screen
  name="inventory"
  options={{
    title: 'Inventory Analysis',
    headerShown: true,
  }}
/>
```

Update `/app/(admin)/index.tsx` to add "Inventory" navigation button.

## Dependencies
Blocked by: LCC_10 (Cart & Checkout - need order data)

Uses:
- LCC_4 (StorageService - to load orders)
- LCC_5 (Theme System - for styling)
- LCC_13 (Order Management - date filtering patterns)

## Story Points
8

## Priority
High (important for coffee cart operations planning)

## Elder-Friendly Design Requirements
- [ ] All touch targets ≥ 44pt (filter buttons 56pt)
- [ ] Large numbers (28pt) for stat values
- [ ] High contrast stat cards with clear hierarchy
- [ ] Simple date range selection (no complex calendars)
- [ ] Color-coded cards matching ingredient types
- [ ] VoiceOver labels: "Total orders: 47", "Whole milk used in 32 drinks"
- [ ] Pull-to-refresh with haptic feedback
- [ ] Loading state while calculating stats
- [ ] Empty state message when no orders in range

## Future Enhancements (Post-v1)
- [ ] Trend charts (line graphs showing consumption over time)
- [ ] Predictive analytics (estimated needs for next week)
- [ ] Comparison view (this week vs last week)
- [ ] Alert system (running low on ingredients based on rate)
- [ ] Export to email or cloud storage
- [ ] Integration with supplier ordering systems
- [ ] Cost analysis (if pricing added in future)

## Testing Notes
Test with various date ranges:
- Empty database (no orders)
- Single order
- Multiple orders across different days/weeks/months
- Orders with different customizations
- Large dataset (100+ orders)

Verify calculations are accurate:
- Total shots matches manual count
- Milk totals equal number of drinks requiring milk
- Syrup counts match orders with syrup options
- Date filtering correctly includes/excludes orders

## User Story
**As a** coffee cart operator
**I want to** see how much of each ingredient I've used over time
**So that** I can order the right amount of supplies and avoid running out of popular items

**Acceptance**: I can select "This Week" and see that I've made 47 orders, used 32 whole milk portions, 15 oat milk portions, pulled 156 espresso shots, and used 12 vanilla syrups. This helps me know I need to order more whole milk and vanilla syrup for next week.
