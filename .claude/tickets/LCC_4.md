# LCC_4: AsyncStorage Wrapper Implementation

## Description
Implement a type-safe AsyncStorage wrapper that provides methods for storing and retrieving app data with proper error handling and data validation.

## Acceptance Criteria
- [ ] StorageService class is created in `/src/storage/StorageService.ts`
- [ ] Methods implemented:
  - `saveOrders(orders: Order[]): Promise<void>`
  - `getOrders(): Promise<Order[]>`
  - `saveDrinks(drinks: Drink[]): Promise<void>`
  - `getDrinks(): Promise<Drink[]>`
  - `saveSettings(settings: AppSettings): Promise<void>`
  - `getSettings(): Promise<AppSettings>`
  - `clearAllData(): Promise<void>`
- [ ] All methods include proper error handling with try-catch blocks
- [ ] Data validation before saving (using TypeScript interfaces)
- [ ] Graceful handling of missing or corrupted data
- [ ] Storage keys are defined as constants (not magic strings)
- [ ] Unit tests verify storage and retrieval functionality

## Dependencies
Blocked by: LCC_2

## Story Points
5

## Priority
High