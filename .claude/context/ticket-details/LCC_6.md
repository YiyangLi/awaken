# LCC_6: Data Validation Utilities

**Date**: 2025-10-04
**Status**: Complete
**Story Points**: 3
**Priority**: High
**Implemented by**: react-native-accessibility-engineer

---

## Overview
Comprehensive validation utilities with elder-friendly error messages and runtime type checking for all core data structures. Provides type-safe validation with graceful error handling.

---

## What Was Implemented

### Created `/src/utils/validation.ts`

Comprehensive validation utilities with elder-friendly error messages and runtime type checking.

**ValidationResult Interface**
```typescript
interface ValidationResult {
  success: boolean;
  errors: string[];  // Elder-friendly, non-technical messages
}
```

---

## Technical Implementation

### Phone Number Validation (Lenient & Elder-Friendly)

**sanitizePhoneNumber(phone: string | undefined): string**
- Removes all non-numeric characters from phone numbers
- Supports multiple formats:
  - `(123) 456-7890` returns `1234567890`
  - `123-456-7890` returns `1234567890`
  - `123.456.7890` returns `1234567890`
  - `1234567890` returns `1234567890`
- Handles undefined and empty strings gracefully
- Returns empty string for invalid input (no crashes)

**Design Rationale**: Elder users may enter phone numbers in various formats. The sanitizer accepts all common formats without frustrating users with strict validation.

### Customer Information Validation

**validateCustomerInfo(name: string, phone?: string): ValidationResult**
- Validates customer name and optional phone number
- Returns elder-friendly error messages

**Validation Rules:**
- **Name**: Required, 1-100 characters after trimming
- **Phone**: Optional (per LCC_2 spec), but if provided must contain at least one digit
- Accepts international characters in names
- Trims whitespace automatically

**Elder-Friendly Error Messages:**
- "Customer name is required" (not "Invalid type: expected string")
- "Customer name must be 100 characters or less" (not "Length exceeds maximum")
- "Phone number must contain at least one digit" (not "Invalid format")

### Price Validation

**validatePrice(price: number): ValidationResult**
- Validates prices in cents (integer values only)

**Validation Rules:**
- Must be a number (not NaN, not undefined)
- Must be a positive integer (no fractional cents)
- Range: 0 to 100000 cents ($0.00 to $1,000.00)

**Elder-Friendly Error Messages:**
- "Price must be a valid number"
- "Price must be a whole number (no fractional cents)"
- "Price cannot be negative"
- "Price must be between $0 and $1,000"

### Date Validation

**validateDate(date: Date): ValidationResult**
- Validates Date objects for orders and timestamps

**Validation Rules:**
- Must be a valid Date object (not Invalid Date)
- Reasonable range: 2020-2030 (coffee cart operational years)
- Works with dates from StorageService.dateReviver

**Elder-Friendly Error Messages:**
- "Order date is invalid" (not "Date validation failed")
- "Order date must be between 2020 and 2030" (not "Out of range")

### Type Guard Functions (Runtime Type Validation)

All type guards use TypeScript `is` predicate for compile-time type narrowing.

**validateDrinkOption(option: unknown): option is DrinkOption**
- Validates all required fields: id, name, additionalCost, type, isAvailable
- Validates optional fields: description
- Validates price using validatePrice()
- Validates type is valid DrinkOptionType enum value

**validateDrink(drink: unknown): drink is Drink**
- Validates all required fields: id, name, category, basePrice, options, isAvailable
- Validates optional fields: description, imageUrl
- Validates basePrice using validatePrice()
- Validates category is valid DrinkCategory enum value
- Recursively validates all DrinkOption objects in options array

**validateOrderItem(item: unknown): item is OrderItem**
- Validates all required fields: id, drinkId, drinkName, quantity, selectedOptions, totalPrice
- Validates optional fields: notes
- Validates quantity is positive integer
- Validates totalPrice using validatePrice()
- Recursively validates all DrinkOption objects in selectedOptions array

**validateOrder(order: unknown): order is Order**
- Validates all required fields: id, customerName, items, totalAmount, status, createdAt, updatedAt
- Validates optional fields: customerPhone, assignedBarista, notes, estimatedCompletionTime
- Validates customer info using validateCustomerInfo()
- Validates status is valid OrderStatus enum value
- Validates items array has at least one item
- Recursively validates all OrderItem objects in items array
- Validates all Date objects using validateDate()
- Validates totalAmount using validatePrice()

### Helper Functions (Enum Validation)

**isValidDrinkCategory(value: unknown): value is DrinkCategory**
- Validates against: mocha, chai-latte, latte, hot-chocolate, americano, italian-soda

**isValidDrinkOptionType(value: unknown): value is DrinkOptionType**
- Validates against: size, milk, extras

**isValidOrderStatus(value: unknown): value is OrderStatus**
- Validates against: pending, in-progress, ready, completed, cancelled

### Updated `/src/utils/index.ts`

Barrel export for clean imports:
```typescript
export {
  sanitizePhoneNumber,
  validateCustomerInfo,
  validatePrice,
  validateDate,
  validateDrink,
  validateDrinkOption,
  validateOrder,
  validateOrderItem,
  type ValidationResult,
} from './validation';
```

---

## Elder-Friendly Features

### Clear, Non-Technical Error Messages
All error messages follow these principles:
- Use plain language (no technical jargon)
- Tell users what went wrong in simple terms
- Screen reader friendly
- Actionable (user knows what to fix)

**Examples:**
- "Customer name is required" instead of "Invalid type: expected string"
- "Price must be between $0 and $1,000" instead of "Price out of bounds"
- "Order date is invalid" instead of "Date validation failed"

### Lenient Format Acceptance
- Phone numbers accept multiple formats without frustration
- International characters allowed in names
- Automatic whitespace trimming
- Optional fields reduce cognitive load

### Graceful Error Handling
- No crashes on invalid input
- Returns clear ValidationResult objects
- Type guards safely narrow types for TypeScript
- Comprehensive validation prevents downstream errors

---

## Usage Examples

### Phone Number Sanitization
```typescript
import { sanitizePhoneNumber } from '@/utils';

sanitizePhoneNumber('(123) 456-7890');  // '1234567890'
sanitizePhoneNumber('123-456-7890');     // '1234567890'
sanitizePhoneNumber('');                 // ''
sanitizePhoneNumber(undefined);          // ''
```

### Customer Information Validation
```typescript
import { validateCustomerInfo } from '@/utils';

const result = validateCustomerInfo('John Doe', '(123) 456-7890');
if (result.success) {
  // Proceed with order creation
} else {
  // Show elder-friendly error messages
  result.errors.forEach(error => console.log(error));
  // "Customer name is required"
}
```

### Type Guard Usage
```typescript
import { validateOrder } from '@/utils';

const data = JSON.parse(orderData);

if (validateOrder(data)) {
  // TypeScript knows data is Order here
  console.log(data.customerName);  // Type-safe access
  console.log(data.totalAmount);   // No TypeScript errors
} else {
  // Invalid order data - don't process
}
```

---

## Files Created/Modified

### Files Created
- `/src/utils/validation.ts` - Comprehensive validation utilities

### Files Modified
- `/src/utils/index.ts` - Added barrel exports for validation functions

---

## Verification Results

### TypeScript Compilation
```bash
npx tsc --noEmit
```
**Result**: Zero errors
- All type guards use proper TypeScript `is` predicates
- Bracket notation access for index signatures
- Full type safety with strict mode
- Integration with existing LCC_2 types verified

### ESLint Checking
```bash
npm run lint
```
**Result**: No errors, only acceptable warnings
- 6 complexity warnings (expected for comprehensive validation)
- 2 function length warnings (acceptable for thorough validation with documentation)
- All errors fixed with curly braces for if statements
- Accessibility rules passing

**Acceptable Warnings:**
- validateDrinkOption: complexity 11 (threshold 10) - comprehensive field validation
- validateDrink: complexity 16 - validates nested options array
- validateOrderItem: 52 lines (threshold 50), complexity 16 - validates nested selectedOptions
- validateOrder: 91 lines, complexity 26 - most comprehensive validation with dates, items, prices

These complexity warnings are acceptable because:
- Validation functions require thorough checking of all fields
- Clear structure with comments for readability
- Breaking into smaller functions would reduce clarity
- Comprehensive JSDoc documentation explains logic

---

## Quality Assurance Completed

- ✅ ValidationResult interface defined with elder-friendly design
- ✅ Phone sanitization supports 4+ formats (parentheses, dashes, dots, plain)
- ✅ Customer name validation with 1-100 character limit
- ✅ Price validation with 0-100000 cent range ($0-$1,000)
- ✅ Date validation with 2020-2030 reasonable range
- ✅ All type guards implemented with TypeScript `is` predicates
- ✅ Elder-friendly error messages throughout
- ✅ Comprehensive JSDoc comments
- ✅ Barrel export created in `/src/utils/index.ts`
- ✅ TypeScript strict mode compilation: Passed
- ✅ ESLint accessibility rules: Passed

---

## Implementation Impact

### Type Safety Benefits
- Runtime validation prevents type-related crashes
- TypeScript type narrowing after validation
- Compile-time type checking for all validation functions
- Integration ready with StorageService (future enhancement)

### Elder-Friendly Benefits
- Clear error messages suitable for voice announcements
- Lenient format acceptance reduces user frustration
- No crashes on invalid data (graceful degradation)
- Optional fields reduce cognitive load

### Developer Experience
- Simple ValidationResult interface
- Comprehensive JSDoc with usage examples
- Type-safe validation throughout the app
- Easy to test and maintain

---

## Next Steps

### Ready to Proceed With:
- **LCC_7**: Local Storage Schema and Migration System
- Schema versioning with migration tracking
- Initial data seeding (6 free drinks)
- Migration system with backup/restore
- Building on StorageService and validation foundations

### Future Enhancements (Separate Tickets):
- Integrate validation into StorageService for automatic data filtering
- Add validation to order creation flows
- Create validation middleware for API endpoints
- Add unit tests for all validation functions
