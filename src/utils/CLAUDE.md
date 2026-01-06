# src/utils/

## Purpose

Utility functions for validation, formatting, and business logic calculations. Provides reusable helper functions with elder-friendly error messages and clear APIs.

## Key Files

### `validation.ts`
**Purpose**: Data validation with runtime type checking and elder-friendly error messages

**Key Features**:
- Customer information validation
- Price validation (cents-based, no floating point)
- Date validation with reasonable ranges
- Type guards for runtime type checking
- Clear, non-technical error messages

**Validation Functions**:

#### `validateCustomerInfo(name, phone?)`
```typescript
const result = validateCustomerInfo('John Doe', '(555) 123-4567');
// { success: true, errors: [] }

const result = validateCustomerInfo('', '123-456-7890');
// { success: false, errors: ['Customer name is required'] }
```

**Rules**:
- Name: Required, 1-100 characters after trimming
- Phone: Optional, but if provided must contain at least one digit

#### `sanitizePhoneNumber(phone)`
```typescript
sanitizePhoneNumber('(123) 456-7890')  // Returns '1234567890'
sanitizePhoneNumber('123-456-7890')    // Returns '1234567890'
```

Removes all non-numeric characters for storage.

#### `validatePrice(price)`
```typescript
validatePrice(500)      // { success: true, errors: [] }
validatePrice(-100)     // { success: false, errors: ['Price cannot be negative'] }
validatePrice(12.5)     // { success: false, errors: ['Price must be a whole number'] }
```

**Rules**:
- Must be a number
- Must be a positive integer (no fractional cents)
- Must be between 0 and 100000 cents ($0-$1,000)

#### `validateDate(date)`
```typescript
validateDate(new Date())                    // { success: true, errors: [] }
validateDate(new Date('invalid'))           // { success: false, errors: ['Order date is invalid'] }
validateDate(new Date('1990-01-01'))        // { success: false, errors: ['Order date must be between 2020 and 2030'] }
```

**Type Guards** (Runtime Type Checking):

#### `validateDrinkOption(option)`
```typescript
if (validateDrinkOption(data)) {
  // TypeScript knows data is DrinkOption here
  console.log(data.name);
}
```

#### `validateDrink(drink)`
Validates complete Drink object with all required fields.

#### `validateOrderItem(item)`
Validates OrderItem including quantity and price checks.

#### `validateOrder(order)`
Validates complete Order object including:
- All required fields
- Customer info validation
- Item validation (at least one item)
- Price validation
- Date validation

**Git History**:
- **56d086b** - LCC_4-7: Initial validation system

---

### `inventory.ts`
**Purpose**: Inventory analysis and order history calculations

**Key Features**:
- Date range filtering (today, week, month, 3 months, year)
- Ingredient consumption tracking
- Drink popularity statistics
- Milk/syrup usage calculations

**Data Types**:

```typescript
type DateRangeFilter = 'today' | 'week' | 'month' | 'threeMonths' | 'year';

interface InventoryStats {
  totalOrders: number;
  drinkCounts: { [drinkName: string]: number };
  milk: { whole: number; oat: number };
  shots: {
    total: number;
    byDrink: { [drinkName: string]: number };
  };
  chocolate: { regular: number; white: number };
  syrups: { [syrupName: string]: number };
  other: {
    regularChai: number;
    dirtyChai: number;
    withCream: number;
  };
}
```

**Functions**:

#### `filterOrdersByDateRange(orders, filter)`
```typescript
const todayOrders = filterOrdersByDateRange(allOrders, 'today');
const weekOrders = filterOrdersByDateRange(allOrders, 'week');
```

Returns orders within the specified date range.

#### `calculateInventoryStats(orders)`
```typescript
const stats = calculateInventoryStats(filteredOrders);

// Access stats
stats.totalOrders           // 42
stats.drinkCounts['Mocha']  // 15
stats.milk.oat              // 25
stats.shots.total           // 68
stats.syrups['vanilla']     // 10
```

Aggregates all ingredient usage across filtered orders:
- Counts drinks by name
- Tracks milk usage (whole vs oat)
- Sums espresso shots (total and by drink)
- Tracks chocolate type usage
- Tracks syrup consumption (dynamic for all flavors)
- Counts chai variations (regular vs dirty)
- Counts cream additions (Italian Soda)

#### `formatDateRange(filter)`
```typescript
formatDateRange('today')        // "Jan 15, 2025"
formatDateRange('week')         // "Jan 8 - Jan 15, 2025"
formatDateRange('month')        // "January 2025"
formatDateRange('threeMonths')  // "Oct 15 - Jan 15, 2025"
formatDateRange('year')         // "2025"
```

Returns human-readable date range strings.

**Implementation Notes**:
- Extracts customizations from OrderItem.selectedOptions array
- Uses option ID patterns: `milk-oat`, `shots-2`, `syrup-vanilla`, etc.
- Handles optional customizations gracefully (returns null if not found)
- Dynamic syrup tracking: Works with any syrup flavor

**Git History**:
- **30f8322** - LCC_16 and LCC_17: Inventory analysis system

---

### `labelFormatter.ts`
**Purpose**: Format orders for Brother P-touch label printer

**Key Features**:
- Customer name truncation (max 20 chars)
- Drink summary with abbreviations (max 30 chars)
- Smart abbreviation of drink names and syrups
- Priority ordering of customizations

**Label Format**:
```typescript
interface LabelFormat {
  line1: string;  // Customer name (Font 18, max 20 chars)
  line2: string;  // Drink summary (Font 12, max 30 chars)
}
```

Label size: 2.4" × 1.1"

**Main Function**:

#### `formatLabelText(order)`
```typescript
const order: Order = {
  customerName: 'John Doe',
  items: [{
    drinkName: 'Mocha',
    selectedOptions: [
      { id: 'shots-2', name: '2 shots' },
      { id: 'milk-oat', name: 'Oat milk' },
      { id: 'syrup-vanilla', name: 'Vanilla syrup' },
    ],
  }],
};

const label = formatLabelText(order);
// {
//   line1: 'John Doe',
//   line2: 'Mocha 2 shots oat vanilla'
// }
```

**Abbreviation Rules**:

**Drink Names**:
- Mocha → `Mocha`
- Chai Latte → `Chai`
- Latte → `Latte`
- Hot Chocolate (regular) → `H Choco`
- Hot Chocolate (white) → `Y Choco`
- Americano → `Americano`
- Italian Soda → `Soda`

**Syrups**:
- Short names (≤8 chars): Unchanged
- Watermelon → `Wtrm`
- Blueberry → `Blbry`
- Strawberry → `Strw`
- Others: First 4 characters

**Customization Priority**:
1. **Shots** (if not default): `2 shots`, `3 shots`
2. **Milk** (if oat): `oat` (whole milk is default, omitted)
3. **Syrup**: Abbreviated syrup name
4. **Dirty**: `dirty` (for Chai Latte)
5. **Cream**: `+cream` (for Italian Soda)

**Default Shots**:
- Mocha, Latte, Americano: 2 shots (default, omitted from label)
- Chai, Hot Chocolate, Italian Soda: 0 shots (no espresso)

**Implementation Details**:
- Only formats first item in order (multi-item orders show first drink only)
- Truncates with `...` if line exceeds max length
- Extracts customizations from `selectedOptions` array using ID patterns
- Elder-friendly: Clear, concise drink descriptions

**Git History**:
- **abc8290** - LCC_19: Label formatter implementation

---

## Folder Structure

```
src/utils/
├── validation.ts       # Data validation and type guards
├── inventory.ts        # Order analysis and statistics
├── labelFormatter.ts   # Label printing format
└── index.ts            # Utility exports
```

## Design Patterns

### Validation Philosophy
1. **Elder-Friendly Errors**: Non-technical, actionable error messages
2. **Graceful Degradation**: Return default values on error, not exceptions
3. **Type Safety**: Runtime type guards complement TypeScript compile-time types
4. **Cents-Based Pricing**: Integer math avoids floating point precision issues

### Function Composition
Utility functions are pure (no side effects) and composable:

```typescript
// Validate, then sanitize
const result = validateCustomerInfo(name, phone);
if (result.success) {
  const sanitizedPhone = sanitizePhoneNumber(phone);
  // Save to storage
}
```

### Testing Strategy
- All validation functions return `ValidationResult` objects
- Type guards use TypeScript `is` predicates for type narrowing
- Pure functions are easy to unit test
- No dependencies on React or global state

## Usage Examples

### Validation in Forms
```tsx
const handleSubmit = () => {
  const result = validateCustomerInfo(name, phone);

  if (!result.success) {
    // Show elder-friendly error messages
    setErrors(result.errors);
    return;
  }

  // Proceed with order creation
  createOrder(name, sanitizePhoneNumber(phone));
};
```

### Inventory Dashboard
```tsx
const [filter, setFilter] = useState<DateRangeFilter>('week');

const filteredOrders = filterOrdersByDateRange(allOrders, filter);
const stats = calculateInventoryStats(filteredOrders);
const dateRange = formatDateRange(filter);

return (
  <View>
    <Text>Orders: {dateRange}</Text>
    <Text>Total: {stats.totalOrders}</Text>
    <Text>Oat Milk Used: {stats.milk.oat}</Text>
    <Text>Vanilla Syrup: {stats.syrups.vanilla || 0}</Text>
  </View>
);
```

### Label Printing
```tsx
const handlePrint = async () => {
  const labelFormat = formatLabelText(order);

  // Display in LabelView component
  setLabelData(labelFormat);

  // Capture and print
  const imageUri = await captureRef(labelRef);
  await PrintService.printLabel(labelFormat, printerConfig, imageUri);
};
```

## Related Files

- **Types**: `src/types/index.ts` - Type definitions validated here
- **Storage**: `src/storage/StorageService.ts` - Stores validated data
- **Components**: `src/components/LabelView.tsx` - Renders formatted labels
- **Services**: `src/services/PrintService.ts` - Uses label formatter

## Testing Notes

- Validation functions have comprehensive test cases
- Price validation catches floating point errors
- Date validation prevents invalid dates (like Feb 30)
- Type guards work at runtime (TypeScript types are compile-time only)
- Label formatter tested with edge cases (long names, many customizations)
- Inventory stats tested with empty orders array
