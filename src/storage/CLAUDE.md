# src/storage/

## Purpose

Offline-first data persistence layer using React Native AsyncStorage. Provides type-safe storage operations with comprehensive error handling for coffee cart operations.

## Key Files

### `StorageService.ts`
**Purpose**: Elder-friendly AsyncStorage wrapper service

**Features**:
- Type-safe storage operations
- Automatic Date serialization/deserialization
- Graceful error handling (never crashes app)
- Offline-first architecture
- Singleton pattern for app-wide access

**Storage Keys**:
```typescript
const STORAGE_KEYS = {
  ORDERS: '@awaken:orders',
  DRINKS: '@awaken:drinks',
  SETTINGS: '@awaken:settings',
  SYRUPS: '@awaken:syrups',
};
```

Prefixed with `@awaken:` to prevent conflicts with other apps.

---

### API Reference

#### **Orders**

##### `saveOrders(orders: Order[])`
```typescript
await StorageService.saveOrders(ordersArray);
```
- Persists orders array to AsyncStorage
- Never throws (logs errors instead)
- Elder-friendly: App continues even if save fails

##### `getOrders(): Promise<Order[]>`
```typescript
const orders = await StorageService.getOrders();
// Returns [] if no data or error
```
- Returns empty array on missing data or error
- Automatically deserializes Date objects
- Validates array type

---

#### **Drinks**

##### `saveDrinks(drinks: Drink[])`
```typescript
await StorageService.saveDrinks(menuArray);
```

##### `getDrinks(): Promise<Drink[]>`
```typescript
const menu = await StorageService.getDrinks();
// Returns [] if no data or error
```

---

#### **Settings**

##### `saveSettings(settings: AppSettings)`
```typescript
await StorageService.saveSettings({
  userPreferences: { /* ... */ },
  cartConfig: { /* ... */ },
  version: '1.0.0',
  lastUpdated: new Date(),
});
```
- Automatically updates `lastUpdated` timestamp
- Elder-friendly: No manual timestamp management

##### `getSettings(): Promise<AppSettings | null>`
```typescript
const settings = await StorageService.getSettings();
if (settings) {
  // Settings exist
} else {
  // First time user, create defaults
}
```
- Returns `null` if no settings (first time user)
- Deserializes Date objects automatically

---

#### **Syrups**

##### `getSyrups(): Promise<Syrup[]>`
```typescript
const syrups = await StorageService.getSyrups();
```

##### `saveSyrups(syrups: Syrup[])`
```typescript
await StorageService.saveSyrups(syrupArray);
```

##### `addSyrup(syrup)`
```typescript
const newSyrup = await StorageService.addSyrup({
  name: 'Vanilla',
  status: 'available',
});

// newSyrup = {
//   id: 'syrup_1234567890_abc123',
//   name: 'Vanilla',
//   status: 'available',
//   createdAt: Date,
//   updatedAt: Date,
// }
```
- Generates unique ID automatically
- Sets timestamps automatically
- **Throws error** if duplicate name exists (case-insensitive)

##### `updateSyrupStatus(id, status)`
```typescript
await StorageService.updateSyrupStatus('syrup_123', 'soldOut');
```
- Updates status and `updatedAt` timestamp
- Valid statuses: `'available'` | `'soldOut'`

##### `deleteSyrup(id)`
```typescript
await StorageService.deleteSyrup('syrup_123');
```
- Removes syrup from storage
- Filters by ID

---

#### **Individual Settings**

##### `getSetting(key): Promise<string | null>`
```typescript
const printerIP = await StorageService.getSetting('printerIP');
```
- Used for storing printer IP and other single values
- Returns `null` if not found or error

##### `saveSetting(key, value)`
```typescript
await StorageService.saveSetting('printerIP', '192.168.1.100');
```
- **Throws error** if save fails (unlike batch methods)
- Storage key: `@awaken:settings:${key}`

---

#### **Utilities**

##### `clearAllData()`
```typescript
await StorageService.clearAllData();
```
- Clears all app data (orders, drinks, settings, syrups)
- Useful for reset/logout functionality
- Never throws (logs errors)

---

### Date Serialization

**Problem**: AsyncStorage only stores strings, JSON.stringify converts Date objects to ISO strings.

**Solution**: Custom `dateReviver` function in `JSON.parse()`:

```typescript
private dateReviver(key: string, value: unknown): unknown {
  const dateKeys = [
    'createdAt',
    'updatedAt',
    'estimatedCompletionTime',
    'lastUpdated',
  ];

  if (typeof value === 'string' && dateKeys.includes(key)) {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
    if (isoDateRegex.test(value)) {
      return new Date(value);
    }
  }

  return value;
}
```

**Usage**:
```typescript
const orders = JSON.parse(jsonValue, this.dateReviver);
// orders[0].createdAt is now a Date object, not a string
```

**Elder-friendly benefit**: Components can use `date.getTime()`, `date.toLocaleDateString()`, etc. directly without manual conversion.

---

### Error Handling Philosophy

**Principle**: Never crash the app due to storage failures.

**Implementation**:
1. All methods use try/catch blocks
2. Errors are logged to console for debugging
3. Read methods return empty/null fallback values
4. Write methods complete silently (except single settings)

**Example**:
```typescript
async getOrders(): Promise<Order[]> {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.ORDERS);
    if (jsonValue === null) {
      return [];  // No data yet
    }
    const orders = JSON.parse(jsonValue, this.dateReviver);
    return Array.isArray(orders) ? orders : [];  // Validate type
  } catch (error) {
    console.error('Failed to retrieve orders from storage:', error);
    return [];  // Graceful fallback
  }
}
```

**Elder-friendly**: App continues to function even if storage is corrupted or unavailable.

---

### Singleton Pattern

```typescript
class StorageServiceClass {
  // ... methods
}

export const StorageService = new StorageServiceClass();
```

**Benefits**:
- Single point of access throughout app
- No need to instantiate (`new StorageService()`)
- Consistent API across all components

**Usage**:
```typescript
import { StorageService } from '@/storage';

const orders = await StorageService.getOrders();
```

---

## Git History

- **ac49c0a** - LCC_10: Storage integration for orders
- **30f8322** - LCC_16 and LCC_17: Syrup management methods
- **56d086b** - LCC_4-7: Initial storage service with schema support
- **a19a324** - Initial commit: Base storage structure

---

## Related Files

- **`schemas.ts`**: TypeScript type definitions for stored data (minimal file)
- **`migrations.ts`**: Schema migration system (future use)
- **`index.ts`**: Storage exports
- **Types**: `src/types/index.ts` - Defines Order, Drink, AppSettings, Syrup
- **Contexts**: `src/contexts/*` - Consume storage service

---

## Folder Structure

```
src/storage/
├── StorageService.ts   # Main storage service (singleton)
├── schemas.ts          # Type definitions for stored data
├── migrations.ts       # Schema version migrations
└── index.ts            # Storage exports
```

---

## Design Patterns

### Offline-First Architecture
1. **Optimistic Updates**: UI updates immediately, storage persists asynchronously
2. **Graceful Degradation**: App functions even if storage fails
3. **No Network Dependency**: All data stored locally

### Type Safety
1. **TypeScript Validation**: All methods strongly typed
2. **Runtime Checks**: Validates array type on retrieval
3. **Date Preservation**: Automatic Date object restoration

### Elder-Friendly Design
1. **Simple API**: Clear method names (`get`, `save`, `add`, `update`, `delete`)
2. **No Manual Timestamps**: Automatically managed
3. **Error Resilience**: Never crashes on storage errors

---

## Usage Examples

### Saving and Loading Orders
```typescript
// Save orders after creating new order
const existingOrders = await StorageService.getOrders();
await StorageService.saveOrders([...existingOrders, newOrder]);

// Load orders on app startup
const orders = await StorageService.getOrders();
setOrders(orders);
```

### Settings Persistence
```typescript
// Load settings on app startup
const settings = await StorageService.getSettings();

if (settings) {
  // Apply user preferences
  setTheme(settings.userPreferences.theme);
} else {
  // First time user - create defaults
  const defaultSettings = { /* ... */ };
  await StorageService.saveSettings(defaultSettings);
}
```

### Syrup Management (Admin)
```typescript
// Add new syrup
try {
  const newSyrup = await StorageService.addSyrup({
    name: 'Vanilla',
    status: 'available',
  });
  console.log('Syrup added:', newSyrup.id);
} catch (error) {
  // Duplicate name
  showAlert({ title: 'Error', message: error.message });
}

// Mark syrup as sold out
await StorageService.updateSyrupStatus(syrupId, 'soldOut');

// Delete syrup
await StorageService.deleteSyrup(syrupId);
```

### Printer IP Storage
```typescript
// Save printer IP
await StorageService.saveSetting('printerIP', '192.168.1.100');

// Load printer IP
const printerIP = await StorageService.getSetting('printerIP');
if (printerIP) {
  setPrinterConfig({ ipAddress: printerIP, modelName: 'QL-810W' });
}
```

---

## Testing Notes

- AsyncStorage is mocked in tests (`@react-native-async-storage/async-storage`)
- Date serialization tested with real Date objects
- Error handling tested with corrupted data
- Duplicate syrup name validation tested
- Empty storage returns appropriate fallbacks ([] or null)
- All methods tested with missing keys, corrupted JSON, etc.

---

## Migration System (Future)

The storage layer includes `migrations.ts` for future schema evolution:

**Migration Record**:
```typescript
interface MigrationRecord {
  fromVersion: number;
  toVersion: number;
  timestamp: Date;
  success: boolean;
  error?: string;
}
```

**Stored in AppSettings**:
```typescript
interface AppSettings {
  schemaVersion?: number;
  migrationHistory?: MigrationRecord[];
  // ...
}
```

**Future Use**: When data structure changes, migrations will:
1. Check `schemaVersion`
2. Run necessary migrations
3. Record migration history
4. Update schema version

**Elder-friendly**: Automatic data upgrades without user intervention.

---

## Performance Notes

- AsyncStorage is async (non-blocking)
- Read/write operations are batched where possible
- `multiRemove()` used for efficient bulk deletion
- No data size limits enforced (AsyncStorage limit: ~6MB on iOS/Android)
- Consider pagination for large order histories (future enhancement)

---

## Security Notes

- ⚠️ AsyncStorage is **NOT encrypted** on device
- Sensitive data (passwords) should not be stored in plain text
- Current admin password is hardcoded (demo only)
- Consider using `expo-secure-store` for sensitive data in production
