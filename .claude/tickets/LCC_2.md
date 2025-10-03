# LCC_2: Core TypeScript Interfaces and Data Models

## Description
Define the foundational TypeScript interfaces for core data models including Drink, Order, and Customer entities that will be used throughout the application.

## Acceptance Criteria
- [ ] `Drink` interface is defined with:
  - id (string)
  - name (string)
  - category (DrinkCategory enum)
  - basePrice (number)
  - options (DrinkOption[])
  - isAvailable (boolean)
- [ ] `DrinkCategory` enum includes: Coffee, Tea, Specialty, Cold_Drinks
- [ ] `DrinkOption` interface includes: name, additionalCost, type (size, milk, extras)
- [ ] `Order` interface is defined with:
  - id (string)
  - customerName (string)
  - customerPhone (string)
  - items (OrderItem[])
  - totalAmount (number)
  - status (OrderStatus enum)
  - createdAt (Date)
  - assignedBarista (string)
  - notes (string, optional)
- [ ] `OrderStatus` enum includes: Pending, InProgress, Ready, Completed, Cancelled
- [ ] `OrderItem` interface links drinks with selected options and quantity
- [ ] All interfaces are exported from `/src/types/index.ts`

## Dependencies
Blocked by: LCC_1

## Story Points
2

## Priority
High