# LCC_6: Data Validation Utilities

## Description
Implement utility functions for validating data models before storage and after retrieval, ensuring data integrity throughout the application.

## Acceptance Criteria
- [ ] Validation utilities created in `/src/utils/validation.ts`
- [ ] Functions implemented:
  - `validateDrink(drink: any): drink is Drink`
  - `validateOrder(order: any): order is Order`
  - `validateOrderItem(item: any): item is OrderItem`
  - `sanitizePhoneNumber(phone: string): string`
  - `validateCustomerInfo(name: string, phone: string): ValidationResult`
- [ ] ValidationResult interface includes success boolean and error messages
- [ ] Phone number validation supports common formats
- [ ] Customer name validation (non-empty, reasonable length)
- [ ] Price validation (positive numbers, reasonable ranges)
- [ ] Date validation for order timestamps
- [ ] All validation functions have comprehensive unit tests

## Dependencies
Blocked by: LCC_2

## Story Points
3

## Priority
Medium