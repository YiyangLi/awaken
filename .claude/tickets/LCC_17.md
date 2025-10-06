# LCC_17: Admin Syrup Management Interface

## Description
Implement an admin interface for managing syrup flavors with availability status control. Admins can add new syrups, mark them as sold out, mark them as available, and delete them. Only available syrups are shown in the drink customization screens.

## Business Context
Coffee cart operators need to:
- Add new syrup flavors as they expand their offerings
- Mark syrups as "Sold Out" when inventory runs low (without removing them from the system)
- Restore syrups to "Available" when inventory is restocked
- Delete syrups that are permanently discontinued
- Ensure customers only see syrups that are currently available

This prevents customer frustration from ordering unavailable options and gives operators flexibility in managing their inventory.

## Acceptance Criteria

### Syrup Data Model
- [ ] Update syrup structure to include status tracking:
  ```typescript
  interface Syrup {
    id: string;              // Unique identifier
    name: string;            // Display name (e.g., "Vanilla", "Caramel")
    status: 'available' | 'soldOut';  // Current availability
    createdAt: Date;         // When syrup was added
    updatedAt: Date;         // Last status change
  }
  ```
- [ ] Store syrups in AsyncStorage via StorageService
- [ ] Update `APP_CONFIG.CUSTOMIZATION.SYRUP_FLAVORS` to use new Syrup[] structure
- [ ] Migration script to convert existing string[] syrups to Syrup[] objects

### Admin Syrup Management Screen
- [ ] Create admin syrup management screen at `/app/(admin)/syrups.tsx`
- [ ] Display list of all syrups (both available and sold out)
- [ ] Visual distinction between available and sold out syrups:
  - Available: Green indicator/badge
  - Sold Out: Orange/yellow indicator/badge
- [ ] Elder-friendly list design with large touch targets (64pt minimum)
- [ ] Pull-to-refresh to reload syrup list
- [ ] Theme-aware styling with high contrast
- [ ] VoiceOver support with status announcements

### Syrup List Display
- [ ] Show each syrup in a card with:
  - Syrup name (24pt font)
  - Status badge (Available/Sold Out)
  - Action buttons (64pt height)
  - Creation date (optional, smaller text)
- [ ] Sort order: Available first, then Sold Out
- [ ] Empty state message when no syrups exist
- [ ] Large "Add New Syrup" button at top (64pt height, primary color)

### Syrup Actions
- [ ] **Add New Syrup**:
  - Modal/form with text input for syrup name
  - Large input field (64pt height, 24pt font)
  - Default status: "available"
  - "Add" button (64pt height)
  - "Cancel" button
  - Validation: name must be unique (case-insensitive)
  - Haptic feedback on success
- [ ] **Mark as Sold Out** (for available syrups):
  - Large button with orange/warning color
  - Updates status to 'soldOut'
  - Confirmation modal: "Mark [name] as sold out?"
  - Haptic feedback
- [ ] **Mark as Available** (for sold out syrups):
  - Large button with green/success color
  - Updates status to 'available'
  - Haptic feedback
- [ ] **Delete Syrup**:
  - Red delete button (64pt height)
  - Confirmation modal with warning:
    - "Delete [name]? This cannot be undone."
    - "Existing orders with this syrup will still show it in history."
  - Remove from storage permanently
  - Haptic feedback on confirmation

### Integration with Customization Screens
- [ ] Update drink customization screens to only show available syrups
- [ ] Filter logic: `syrups.filter(s => s.status === 'available')`
- [ ] Apply to all drinks that use syrups:
  - Mocha (optional syrup)
  - Latte (optional syrup)
  - Italian Soda (required syrup)
- [ ] If no syrups are available:
  - Hide syrup section for Mocha/Latte
  - Show message for Italian Soda: "No syrups available. Please contact staff."
  - Prevent Italian Soda orders if no syrups available

### StorageService Integration
- [ ] Add syrup CRUD methods to StorageService:
  ```typescript
  async getSyrups(): Promise<Syrup[]>
  async saveSyrups(syrups: Syrup[]): Promise<void>
  async addSyrup(syrup: Omit<Syrup, 'id' | 'createdAt' | 'updatedAt'>): Promise<Syrup>
  async updateSyrupStatus(id: string, status: 'available' | 'soldOut'): Promise<void>
  async deleteSyrup(id: string): Promise<void>
  ```
- [ ] Use `@syrups` as AsyncStorage key
- [ ] Proper error handling and data validation
- [ ] Real-time updates when syrups change

### Admin Layout Integration
- [ ] Update `/app/(admin)/_layout.tsx` to include syrups route:
  ```typescript
  <Stack.Screen
    name="syrups"
    options={{
      title: 'Syrup Management',
      headerShown: true,
    }}
  />
  ```
- [ ] Add "Manage Syrups" button to `/app/(admin)/index.tsx`

### Data Migration
- [ ] Create migration script to convert existing syrup data:
  ```typescript
  // Old format: SYRUP_FLAVORS: ['Vanilla', 'Caramel', 'Hazelnut']
  // New format: Syrup[] with id, status, timestamps
  ```
- [ ] Default existing syrups to 'available' status
- [ ] Generate unique IDs for existing syrups
- [ ] Run migration on app startup (one-time)
- [ ] Add migration version tracking to prevent re-running

## Technical Details

### Type Definitions
Update `/src/types/index.ts`:
```typescript
export interface Syrup {
  id: string;
  name: string;
  status: 'available' | 'soldOut';
  createdAt: Date;
  updatedAt: Date;
}

export type SyrupStatus = 'available' | 'soldOut';

// Update DrinkOptions to use syrup name (string) or id (string)
export interface DrinkOptions {
  milk?: MilkType;
  shots?: number;
  chocolate?: ChocolateType;
  syrup?: string;  // Syrup name (for backward compatibility with existing orders)
  isDirty?: boolean;
  addCream?: boolean;
}
```

### StorageService Implementation
Add to `/src/storage/StorageService.ts`:
```typescript
const STORAGE_KEYS = {
  // ... existing keys
  SYRUPS: '@syrups',
};

// Syrup management methods
static async getSyrups(): Promise<Syrup[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.SYRUPS);
  if (!data) return [];

  const parsed = JSON.parse(data);
  return parsed.map((s: any) => ({
    ...s,
    createdAt: new Date(s.createdAt),
    updatedAt: new Date(s.updatedAt),
  }));
}

static async saveSyrups(syrups: Syrup[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.SYRUPS, JSON.stringify(syrups));
}

static async addSyrup(syrup: Omit<Syrup, 'id' | 'createdAt' | 'updatedAt'>): Promise<Syrup> {
  const syrups = await this.getSyrups();

  // Check for duplicate names (case-insensitive)
  const duplicate = syrups.find(
    s => s.name.toLowerCase() === syrup.name.toLowerCase()
  );
  if (duplicate) {
    throw new Error(`Syrup "${syrup.name}" already exists`);
  }

  const newSyrup: Syrup = {
    ...syrup,
    id: `syrup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await this.saveSyrups([...syrups, newSyrup]);
  return newSyrup;
}

static async updateSyrupStatus(id: string, status: SyrupStatus): Promise<void> {
  const syrups = await this.getSyrups();
  const updated = syrups.map(s =>
    s.id === id
      ? { ...s, status, updatedAt: new Date() }
      : s
  );
  await this.saveSyrups(updated);
}

static async deleteSyrup(id: string): Promise<void> {
  const syrups = await this.getSyrups();
  const filtered = syrups.filter(s => s.id !== id);
  await this.saveSyrups(filtered);
}
```

### Migration Script
Add to `/src/storage/migrations.ts`:
```typescript
async function migrateSyrupsToObjects(): Promise<void> {
  const migrated = await AsyncStorage.getItem('@syrup_migration_v1');
  if (migrated) return; // Already migrated

  // Get existing syrups (if any)
  const existing = await StorageService.getSyrups();
  if (existing.length > 0) {
    await AsyncStorage.setItem('@syrup_migration_v1', 'true');
    return; // Already has new format
  }

  // Migrate from APP_CONFIG default syrups
  const defaultSyrups = ['Vanilla', 'Caramel', 'Hazelnut'];
  const migratedSyrups: Syrup[] = defaultSyrups.map((name, index) => ({
    id: `syrup_default_${index}`,
    name,
    status: 'available' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  await StorageService.saveSyrups(migratedSyrups);
  await AsyncStorage.setItem('@syrup_migration_v1', 'true');
}
```

### UI Component Structure

**Syrup Card Component**:
```typescript
interface SyrupCardProps {
  syrup: Syrup;
  onMarkAvailable: (id: string) => void;
  onMarkSoldOut: (id: string) => void;
  onDelete: (id: string) => void;
}

// Card shows:
// - Syrup name (large, bold)
// - Status badge (colored pill)
// - Action buttons based on status:
//   - If available: "Mark Sold Out", "Delete"
//   - If soldOut: "Mark Available", "Delete"
```

**Add Syrup Modal**:
```typescript
// Uses ModalProvider from LCC_11 for consistency
// Form modal with:
// - Title: "Add New Syrup"
// - TextInput for syrup name
// - "Add" button (primary color)
// - "Cancel" button (secondary)
```

### Customization Screen Updates
Update `/app/(user)/drink/[id].tsx`:
```typescript
// Load available syrups from storage instead of APP_CONFIG
const [availableSyrups, setAvailableSyrups] = useState<Syrup[]>([]);

useEffect(() => {
  loadAvailableSyrups();
}, []);

const loadAvailableSyrups = async () => {
  const all = await StorageService.getSyrups();
  const available = all.filter(s => s.status === 'available');
  setAvailableSyrups(available);
};

// Use availableSyrups.map(s => s.name) in syrup selector
// If availableSyrups.length === 0 for Italian Soda, show error message
```

## Dependencies
Blocked by:
- LCC_4 (StorageService - foundation)
- LCC_11 (Modal System - for confirmations and add syrup form)

Uses:
- LCC_5 (Theme System - for styling)

## Story Points
5

## Priority
High (important for operational flexibility)

## Elder-Friendly Design Requirements
- [ ] All touch targets ≥ 64pt (admin interface can use larger targets)
- [ ] Large text input for syrup names (24pt font)
- [ ] High contrast status badges (green for available, orange for sold out)
- [ ] Clear visual separation between syrup cards (40px spacing)
- [ ] Simple, one-tap status changes (with confirmation modals)
- [ ] VoiceOver labels: "Vanilla syrup, available, mark as sold out button"
- [ ] Haptic feedback for all actions
- [ ] Large, prominent "Add New Syrup" button
- [ ] Confirmation modals prevent accidental deletions
- [ ] Pull-to-refresh with haptic feedback

## Testing Notes
Test scenarios:
- [ ] Add new syrup (success case)
- [ ] Add duplicate syrup (should show error)
- [ ] Mark syrup as sold out, verify it disappears from customization screens
- [ ] Mark sold out syrup as available, verify it reappears in customization
- [ ] Delete syrup, verify confirmation modal appears
- [ ] Attempt to order Italian Soda with no available syrups (should block or warn)
- [ ] Migration runs successfully on first app launch
- [ ] Migration doesn't re-run on subsequent launches
- [ ] Real-time updates: change syrup status in admin, verify customization screen updates

## User Stories

### Story 1: Out of Stock
**As a** coffee cart operator
**I want to** mark a syrup as sold out when I run out
**So that** customers don't order drinks with unavailable syrups

**Acceptance**: When I tap "Mark Sold Out" on Vanilla syrup, it immediately disappears from the customer-facing customization screens, and shows "Sold Out" badge in the admin panel.

### Story 2: Restocking
**As a** coffee cart operator
**I want to** mark a sold-out syrup as available when I restock
**So that** customers can start ordering it again

**Acceptance**: When I tap "Mark Available" on a sold-out Vanilla syrup, it immediately reappears in the customer customization screens.

### Story 3: New Flavor
**As a** coffee cart operator
**I want to** add a new syrup flavor (e.g., "Lavender")
**So that** I can offer it to customers

**Acceptance**: I tap "Add New Syrup", enter "Lavender", tap Add, and it immediately appears as available in both admin panel and customer screens.

### Story 4: Discontinued Flavor
**As a** coffee cart operator
**I want to** delete a syrup that I no longer carry
**So that** my syrup list stays clean and relevant

**Acceptance**: I tap "Delete" on Hazelnut syrup, confirm the warning modal, and it's permanently removed from the system. Past orders still show Hazelnut in their history.

## Future Enhancements (Post-v1)
- [ ] Syrup inventory tracking (quantity remaining)
- [ ] Low inventory alerts
- [ ] Syrup pricing (if pricing system added)
- [ ] Custom syrup colors for UI
- [ ] Syrup categories (classic, seasonal, specialty)
- [ ] Bulk status changes (mark multiple as sold out)
- [ ] Syrup usage analytics (from LCC_16 inventory dashboard)
- [ ] Auto-restore to available on restock schedule
