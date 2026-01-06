# src/types/

## Purpose

TypeScript type definitions and interfaces for the entire Awaken app. Provides type safety and clear data contracts for coffee ordering, inventory management, and accessibility features.

## Key Files

### `index.ts`
**Purpose**: Central type definition file for all app data structures
**Exports**: All core interfaces, enums, and type utilities

### Core Type Categories

#### 1. **Drink and Menu Types**

**`DrinkCategory` (Enum)**
```typescript
enum DrinkCategory {
  MOCHA = 'mocha',
  CHAI_LATTE = 'chai-latte',
  LATTE = 'latte',
  HOT_CHOCOLATE = 'hot-chocolate',
  AMERICANO = 'americano',
  ITALIAN_SODA = 'italian-soda',
}
```
- Meaningful string values for screen reader accessibility
- Aligned with coffee cart menu structure

**`DrinkOptionType` (Enum)**
```typescript
enum DrinkOptionType {
  SIZE = 'size',
  MILK = 'milk',
  EXTRAS = 'extras',
}
```
- Categorizes customization options for UI organization

**`DrinkOption` (Interface)**
```typescript
interface DrinkOption {
  id: string;                // Unique identifier
  name: string;              // Human-readable name (accessible)
  additionalCost: number;    // Cost in cents
  type: DrinkOptionType;     // Category for UI grouping
  isAvailable: boolean;      // Availability status
  description?: string;      // Optional accessibility context
}
```

**`Drink` (Interface)**
```typescript
interface Drink {
  id: string;
  name: string;
  category: DrinkCategory;
  basePrice: number;         // In cents for precise calculation
  options: DrinkOption[];
  isAvailable: boolean;
  description?: string;
  imageUrl?: string;
}
```

#### 2. **Order Types**

**`OrderStatus` (Enum)**
```typescript
enum OrderStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  READY = 'ready',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}
```
- Descriptive values for accessibility and screen readers

**`OrderItem` (Interface)**
```typescript
interface OrderItem {
  id: string;
  drinkId: string;
  drinkName: string;         // Denormalized for offline access
  quantity: number;
  selectedOptions: DrinkOption[];
  totalPrice: number;        // In cents
  notes?: string;
}
```

**`Order` (Interface)**
```typescript
interface Order {
  id: string;
  customerName: string;
  customerPhone?: string;    // Optional per elder-friendly simplicity
  items: OrderItem[];
  totalAmount: number;       // In cents
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  assignedBarista?: string;
  notes?: string;
  estimatedCompletionTime?: Date;
}
```
- Supports offline-first architecture
- Elder-friendly with optional phone number

#### 3. **Configuration Types**

**`CoffeeCartConfig` (Interface)**
```typescript
interface CoffeeCartConfig {
  name: string;
  isOpen: boolean;
  menu: Drink[];
  defaultPrepTime: number;
  taxRate: number;
  currencySymbol: string;
}
```
- Offline operation support
- Elder-friendly customization

**`UserPreferences` (Interface)**
```typescript
interface UserPreferences {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  highContrastMode: boolean;
  theme?: 'DEFAULT' | 'DARK' | 'HIGH_CONTRAST' | 'LARGE_TEXT';
  preferredPaymentMethod?: string;
  voiceAnnouncements: boolean;
  hapticFeedback: boolean;
  isAdminSession?: boolean;
}
```
- Elder-friendly accessibility preferences
- Admin session tracking for route protection

**`AppSettings` (Interface)**
```typescript
interface AppSettings {
  userPreferences: UserPreferences;
  cartConfig: CoffeeCartConfig;
  version: string;
  lastUpdated: Date;
  schemaVersion?: number;
  migrationHistory?: MigrationRecord[];
}
```
- Comprehensive app persistence
- Schema migration support

#### 4. **Inventory Types**

**`SyrupStatus` (Type)**
```typescript
type SyrupStatus = 'available' | 'soldOut';
```

**`Syrup` (Interface)**
```typescript
interface Syrup {
  id: string;
  name: string;              // e.g., "Vanilla", "Caramel"
  status: SyrupStatus;
  createdAt: Date;
  updatedAt: Date;
}
```
- Admin-configurable syrup inventory
- Availability tracking

#### 5. **Printing Types**

**`LabelFormat` (Interface)**
```typescript
interface LabelFormat {
  line1: string;  // Customer name (Font 18, max 20 chars)
  line2: string;  // Drink summary (Font 12, max 30 chars)
}
```
- Brother P-touch printer format
- Label size: 2.4" × 1.1"

#### 6. **Migration Types**

**`MigrationRecord` (Interface)**
```typescript
interface MigrationRecord {
  fromVersion: number;
  toVersion: number;
  timestamp: Date;
  success: boolean;
  error?: string;
}
```
- Tracks schema version changes
- Debugging and rollback support

### `navigation.ts`
**Purpose**: Expo Router type definitions for type-safe navigation

**Exports**:
```typescript
export type UserStackParamList;
export type AdminStackParamList;
export type RootStackParamList;
```
- Type safety for route parameters
- Supports (user) and (admin) route groups

## Design Principles

### 1. Elder-Friendly Design
- **Clear Naming**: Descriptive property names for accessibility
- **Optional Fields**: Simplified data entry (e.g., optional phone)
- **String Enums**: Screen reader friendly enum values

### 2. Type Safety
- **Strict TypeScript**: All types fully defined
- **No `any` Types**: Explicit typing throughout
- **Runtime Validation**: Companion validation functions in `src/utils/validation.ts`

### 3. Offline-First
- **Denormalized Data**: OrderItem includes drinkName for offline access
- **Date Types**: Explicit Date objects (not strings) for accurate comparisons
- **Migration Support**: Schema versioning for data evolution

### 4. Pricing Precision
- **Cents-Based Pricing**: All prices stored as integers in cents
- **No Floating Point**: Avoids JavaScript float precision issues
- **Tax Calculation**: Integer math for accurate totals

## Git History

- **abc8290** - LCC_19: Added LabelFormat for printer integration
- **30f8322** - LCC_16 and LCC_17: Modal and syrup types
- **e732781** - LCC_8: Navigation types
- **56d086b** - LCC_4-7: Core drink and order types
- **34400a2** - LCC_2 and LCC_3: Initial type system
- **a19a324** - Initial commit: Base types

## Usage Examples

### Type Narrowing with Enums
```typescript
const order: Order = { /* ... */ };

switch (order.status) {
  case OrderStatus.PENDING:
    // Handle pending
    break;
  case OrderStatus.IN_PROGRESS:
    // Handle in progress
    break;
  // TypeScript ensures all cases covered
}
```

### Type-Safe Order Creation
```typescript
const newOrder: Order = {
  id: `order-${Date.now()}`,
  customerName: 'John Doe',
  items: [/* OrderItem[] */],
  totalAmount: 500,  // $5.00 in cents
  status: OrderStatus.PENDING,
  createdAt: new Date(),
  updatedAt: new Date(),
};
```

### Using DrinkOption Types
```typescript
const milkOptions: DrinkOption[] = [
  {
    id: 'milk-whole',
    name: 'Whole milk',
    additionalCost: 0,  // Free per requirements
    type: DrinkOptionType.MILK,
    isAvailable: true,
  },
  {
    id: 'milk-oat',
    name: 'Oat milk',
    additionalCost: 0,
    type: DrinkOptionType.MILK,
    isAvailable: true,
  },
];
```

## Related Files

- **Runtime Validation**: `src/utils/validation.ts` - Type guards and validation functions
- **Storage Service**: `src/storage/StorageService.ts` - Persists typed data
- **Configuration**: `src/config/app.ts` - Uses CoffeeCartConfig and UserPreferences
- **Contexts**: `src/contexts/*` - Consume and provide typed state

## TypeScript Integration

All types are exported from `src/types/index.ts` for centralized imports:

```typescript
import type {
  Order,
  Drink,
  OrderStatus,
  UserPreferences
} from '@/types';
```

## Testing Notes

- Types are compile-time only (no runtime overhead)
- Use `src/utils/validation.ts` for runtime type checking
- Schema migrations require MigrationRecord updates
- All prices must be validated to be in cents (integers)
