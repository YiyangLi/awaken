# LCC_21: Drink Visibility Toggle for Seasonal Items

## Description
Implement a visibility toggle system for drink menu items, starting with Italian Soda as a seasonal drink. Admins can show/hide drinks from the customer-facing menu through a simple checkbox control in the admin portal. This extends the existing availability pattern used for syrups (LCC_17) to the main drink menu.

## Business Context
Coffee cart operators need flexibility to manage seasonal menu items:
- **Italian Soda** is only available in summer months
- Operators want to hide seasonal items without deleting them (preserving historical orders)
- Current workaround requires manually modifying storage data
- Similar to syrup availability (LCC_17), but at the drink level

This prevents customers from ordering unavailable seasonal items and gives operators an easy way to manage their menu throughout the year.

## Acceptance Criteria

### Drink Data Model Updates
- [ ] Add `isVisible` boolean field to `Drink` interface in `/src/types/index.ts`
- [ ] Update existing Drink interface:
  ```typescript
  export interface Drink {
    id: string;
    name: string;
    category: DrinkCategory;
    basePrice: number;
    options: DrinkOption[];
    isAvailable: boolean;      // Existing field (in-stock status)
    isVisible: boolean;         // NEW: Menu visibility toggle
    description?: string;
    imageUrl?: string;
  }
  ```
- [ ] Clarify semantic difference:
  - `isAvailable`: In-stock status (e.g., out of milk temporarily)
  - `isVisible`: Seasonal/menu visibility (e.g., summer-only items)
- [ ] Migration script to add `isVisible: true` to all existing drinks

### Admin Drink Management Screen
- [ ] Create new admin screen at `/app/(admin)/drinks.tsx`
- [ ] Display list of all 6 drink categories with visibility toggles
- [ ] Visual design similar to syrups management (LCC_17):
  - Large drink cards with name and category
  - Visibility status badge (Visible/Hidden)
  - Toggle visibility button (64pt touch target)
- [ ] Elder-friendly design:
  - Large text (24pt drink names)
  - High contrast status indicators
  - Simple one-tap visibility toggle
  - VoiceOver support

### Drink Visibility Toggle
- [ ] **Show on Menu** button (for hidden drinks):
  - Green button with success color
  - Sets `isVisible: true`
  - Immediate update in customer menu
  - Haptic feedback on toggle
- [ ] **Hide from Menu** button (for visible drinks):
  - Orange/warning color button
  - Confirmation modal: "Hide [DrinkName] from menu? Customers won't be able to order this drink."
  - Sets `isVisible: false`
  - Immediate removal from customer menu
  - Haptic feedback on toggle
- [ ] Status badge shows current state:
  - "Visible" (green badge) when `isVisible: true`
  - "Hidden" (orange badge) when `isVisible: false`

### Customer Menu Integration
- [ ] Update `/app/(user)/index.tsx` to filter drinks by visibility
- [ ] Filter logic: `drinks.filter(d => d.isVisible === true)`
- [ ] Hidden drinks never appear in customer-facing screens:
  - Menu grid (main screen)
  - Drink customization screens
  - Recent orders (if applicable)
- [ ] Past orders still display hidden drinks (historical data preserved)
- [ ] If all drinks are hidden (edge case):
  - Show message: "No drinks available at this time. Please contact staff."
  - Prevent ordering completely

### StorageService Integration
- [ ] Add drink visibility methods to `StorageService`:
  ```typescript
  async updateDrinkVisibility(drinkId: string, isVisible: boolean): Promise<void>
  ```
- [ ] Update existing `saveDrinks()` to persist `isVisible` field
- [ ] Real-time updates when visibility changes (reload drinks on toggle)

### Admin Layout Integration
- [ ] Update `/app/(admin)/_layout.tsx` to include drinks route:
  ```typescript
  <Stack.Screen
    name="drinks"
    options={{
      title: 'Manage Menu',
      headerShown: true,
    }}
  />
  ```
- [ ] Add "Manage Menu" button to `/app/(admin)/index.tsx`
- [ ] Position near "Manage Syrups" for consistency

### Data Migration
- [ ] Create migration script in `/src/storage/migrations.ts`:
  ```typescript
  async function migrateDrinkVisibility(): Promise<void> {
    // Add isVisible: true to all existing drinks
    // Default all drinks to visible (current behavior)
    // Run once on app startup
  }
  ```
- [ ] Migration version tracking (prevent re-running)
- [ ] Default value: `isVisible: true` (all drinks visible by default)

## Technical Details

### Type Definition Updates

**File**: `/src/types/index.ts`

```typescript
/**
 * Core drink interface
 * Designed for elder-friendly display with clear information hierarchy
 */
export interface Drink {
  /** Unique identifier for the drink */
  id: string;
  /** Display name of the drink (accessible and descriptive) */
  name: string;
  /** Category for menu organization and filtering */
  category: DrinkCategory;
  /** Base price in cents for precise calculation */
  basePrice: number;
  /** Available customization options */
  options: DrinkOption[];
  /** Whether the drink is currently in stock (e.g., have milk/ingredients) */
  isAvailable: boolean;
  /** Whether the drink is visible on customer menu (seasonal toggle) */
  isVisible: boolean;  // NEW FIELD
  /** Optional description for accessibility and elder users */
  description?: string;
  /** Optional image URL for visual identification */
  imageUrl?: string;
}
```

### Admin Drinks Management Screen

**File**: `/app/(admin)/drinks.tsx`

```typescript
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, RefreshControl } from 'react-native';
import { useTheme, useModal } from '@/contexts';
import { StorageService } from '@/storage';
import type { Drink } from '@/types';
import * as Haptics from 'expo-haptics';

export default function DrinksManagementScreen() {
  const { theme } = useTheme();
  const { showConfirmation } = useModal();
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load drinks from storage
  const loadDrinks = useCallback(async () => {
    try {
      const allDrinks = await StorageService.getDrinks();
      setDrinks(allDrinks);
    } catch (error) {
      console.error('Failed to load drinks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDrinks();
  }, [loadDrinks]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadDrinks();
  }, [loadDrinks]);

  // Toggle visibility
  const handleToggleVisibility = (drink: Drink) => {
    if (drink.isVisible) {
      // Currently visible, confirm before hiding
      showConfirmation({
        title: 'Hide from Menu?',
        message: `Hide "${drink.name}" from customer menu?\n\nCustomers won't be able to order this drink until you show it again.`,
        confirmText: 'Hide',
        confirmColor: theme.colors.WARNING,
        onConfirm: async () => {
          await updateVisibility(drink.id, false);
        },
      });
    } else {
      // Currently hidden, show immediately
      updateVisibility(drink.id, true);
    }
  };

  // Update visibility in storage
  const updateVisibility = async (drinkId: string, isVisible: boolean) => {
    try {
      await StorageService.updateDrinkVisibility(drinkId, isVisible);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await loadDrinks();
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error('Failed to update drink visibility:', error);
    }
  };

  // Render drink card
  const renderDrinkCard = ({ item }: { item: Drink }) => {
    const isVisible = item.isVisible;

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.SURFACE,
            ...theme.shadows.MD,
          },
        ]}
      >
        {/* Drink Name and Status */}
        <View style={styles.cardHeader}>
          <Text
            style={[
              styles.drinkName,
              {
                color: theme.colors.TEXT_PRIMARY,
                fontSize: theme.typography.FONT_SIZES.LARGE_HEADING,
              },
            ]}
            accessibilityLabel={`${item.name}`}
          >
            {item.name}
          </Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: isVisible ? theme.colors.SUCCESS : theme.colors.WARNING,
              },
            ]}
            accessibilityLabel={isVisible ? 'Visible on menu' : 'Hidden from menu'}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color: '#FFFFFF',
                  fontSize: theme.typography.FONT_SIZES.BODY,
                },
              ]}
            >
              {isVisible ? 'Visible' : 'Hidden'}
            </Text>
          </View>
        </View>

        {/* Description */}
        {item.description && (
          <Text
            style={[
              styles.description,
              {
                color: theme.colors.TEXT_SECONDARY,
                fontSize: theme.typography.FONT_SIZES.BODY,
              },
            ]}
          >
            {item.description}
          </Text>
        )}

        {/* Toggle Button */}
        <Pressable
          onPress={() => handleToggleVisibility(item)}
          style={({ pressed }) => [
            styles.toggleButton,
            {
              backgroundColor: isVisible ? theme.colors.WARNING : theme.colors.SUCCESS,
              minHeight: theme.touchTargets.LARGE,
            },
            pressed && styles.buttonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={isVisible ? `Hide ${item.name} from menu` : `Show ${item.name} on menu`}
        >
          <Text
            style={[
              styles.buttonText,
              {
                color: '#FFFFFF',
                fontSize: theme.typography.FONT_SIZES.HEADING,
              },
            ]}
          >
            {isVisible ? 'Hide from Menu' : 'Show on Menu'}
          </Text>
        </Pressable>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.BACKGROUND }]}>
        <View style={styles.centerContent}>
          <Text
            style={[
              styles.loadingText,
              {
                color: theme.colors.TEXT_SECONDARY,
                fontSize: theme.typography.FONT_SIZES.HEADING,
              },
            ]}
          >
            Loading drinks...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.BACKGROUND }]}>
      <FlatList
        data={drinks}
        renderItem={renderDrinkCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.PRIMARY}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontWeight: '600',
  },
  listContent: {
    padding: 24,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  drinkName: {
    fontWeight: '700',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 12,
  },
  statusText: {
    fontWeight: '600',
  },
  description: {
    fontWeight: '500',
    marginBottom: 16,
  },
  toggleButton: {
    borderRadius: 12,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
});
```

### StorageService Updates

**File**: `/src/storage/StorageService.ts`

```typescript
// Add to existing StorageService class

/**
 * Update drink visibility status
 * @param drinkId - Unique identifier for the drink
 * @param isVisible - New visibility status (true = shown on menu, false = hidden)
 */
static async updateDrinkVisibility(drinkId: string, isVisible: boolean): Promise<void> {
  try {
    const drinks = await this.getDrinks();
    const updated = drinks.map(d =>
      d.id === drinkId
        ? { ...d, isVisible }
        : d
    );
    await this.saveDrinks(updated);
  } catch (error) {
    console.error('Failed to update drink visibility:', error);
    throw error;
  }
}
```

### Customer Menu Filter

**File**: `/app/(user)/index.tsx`

```typescript
// Update loadDrinks function to filter by visibility

const loadDrinks = async () => {
  const loadedDrinks = await StorageService.getDrinks();
  // Filter: only show visible drinks to customers
  const visibleDrinks = loadedDrinks.filter(d => d.isVisible === true);
  setDrinks(visibleDrinks);
};
```

### Migration Script

**File**: `/src/storage/migrations.ts`

```typescript
/**
 * Migration: Add isVisible field to all drinks
 * Default all existing drinks to visible (current behavior)
 */
async function migrateDrinkVisibility(): Promise<void> {
  const migrationKey = '@awaken:migration:drink_visibility_v1';
  const migrated = await AsyncStorage.getItem(migrationKey);

  if (migrated) return; // Already migrated

  try {
    const drinks = await StorageService.getDrinks();

    // Add isVisible: true to all drinks that don't have it
    const updated = drinks.map(drink => ({
      ...drink,
      isVisible: drink.isVisible !== undefined ? drink.isVisible : true,
    }));

    await StorageService.saveDrinks(updated);
    await AsyncStorage.setItem(migrationKey, 'true');

    console.log('Migration: Added isVisible field to all drinks');
  } catch (error) {
    console.error('Migration failed (drink visibility):', error);
    throw error;
  }
}

// Call in runMigrations() function
export async function runMigrations(): Promise<void> {
  // ... existing migrations
  await migrateDrinkVisibility();
}
```

### Admin Layout Integration

**File**: `/app/(admin)/_layout.tsx`

```typescript
<Stack.Screen
  name="drinks"
  options={{
    title: 'Manage Menu',
    headerShown: true,
  }}
/>
```

**File**: `/app/(admin)/index.tsx`

```typescript
// Add button to admin dashboard (near "Manage Syrups")
<Pressable
  onPress={() => router.push('/(admin)/drinks')}
  style={styles.menuButton}
  accessibilityRole="button"
  accessibilityLabel="Manage drink menu visibility"
>
  <Text style={styles.buttonText}>Manage Menu</Text>
</Pressable>
```

## Dependencies

**Blocked by**:
- None (all dependencies already implemented)

**Uses**:
- LCC_4 (StorageService - foundation)
- LCC_5 (Theme System - for styling)
- LCC_11 (Modal System - for confirmation modals)
- LCC_17 (Syrup Management - similar pattern)

## Story Points
3

## Priority
Medium (nice-to-have for seasonal management)

## Elder-Friendly Design Requirements

- [ ] All touch targets ≥ 64pt (admin interface)
- [ ] Large drink names (28pt font)
- [ ] High contrast status badges (green for visible, orange for hidden)
- [ ] Clear visual separation between drink cards (16px spacing)
- [ ] Simple, one-tap visibility toggle (with confirmation for hiding)
- [ ] VoiceOver labels: "Italian Soda, hidden from menu, show on menu button"
- [ ] Haptic feedback for all actions
- [ ] Confirmation modal prevents accidental hiding
- [ ] Pull-to-refresh with haptic feedback
- [ ] Consistent design with syrup management (LCC_17)

## Testing Notes

Test scenarios:
- [ ] Hide Italian Soda, verify it disappears from customer menu
- [ ] Show Italian Soda, verify it reappears in customer menu
- [ ] Hide confirmation modal appears when hiding a drink
- [ ] No confirmation modal when showing a drink (instant action)
- [ ] Hidden drinks still appear in past orders (historical data)
- [ ] Migration runs successfully on first app launch
- [ ] Migration doesn't re-run on subsequent launches
- [ ] All 6 drinks have visibility toggles
- [ ] Real-time updates: change visibility in admin, verify customer menu updates
- [ ] Edge case: Hide all drinks, verify customer sees message

## User Stories

### Story 1: Hide Seasonal Item
**As a** coffee cart operator
**I want to** hide Italian Soda from the menu during winter
**So that** customers don't try to order a seasonal drink that's not available

**Acceptance**: When I tap "Hide from Menu" on Italian Soda, confirm the action, it immediately disappears from the customer-facing menu screen. The admin panel shows it as "Hidden" with an orange badge.

### Story 2: Show Seasonal Item
**As a** coffee cart operator
**I want to** show Italian Soda on the menu when summer starts
**So that** customers can order it again

**Acceptance**: When I tap "Show on Menu" on a hidden Italian Soda, it immediately reappears in the customer menu grid. No confirmation is required (instant action).

### Story 3: Preserve Order History
**As a** coffee cart operator
**I want to** see past orders with Italian Soda even when it's hidden
**So that** I can track seasonal sales and customer preferences

**Acceptance**: When I hide Italian Soda, past orders in the admin panel still show "Italian Soda" with all customizations. Historical data is preserved.

## Future Enhancements (Post-v1)

- [ ] Bulk visibility toggle (hide/show multiple drinks at once)
- [ ] Scheduled visibility (auto-hide/show based on date/season)
- [ ] Visibility presets ("Summer Menu", "Winter Menu")
- [ ] Drink availability status separate from visibility (in-stock vs. seasonal)
- [ ] Analytics on hidden drinks (track when items are hidden/shown)
- [ ] Customer notification when favorite drink becomes available
- [ ] Visibility reason notes ("Seasonal - Summer only")

## Notes

- This ticket extends the availability pattern from LCC_17 (syrups) to drinks
- Semantic difference between `isAvailable` (in-stock) and `isVisible` (seasonal):
  - `isAvailable`: Temporary stock status (e.g., out of oat milk)
  - `isVisible`: Long-term menu management (e.g., seasonal items)
- Both fields can be used together for comprehensive inventory management
- Default behavior: all drinks visible (current state maintained)
- Italian Soda is the primary use case, but system works for any drink
- Extensible design allows future per-item visibility for all drinks
- Hidden drinks never appear in customer screens, but preserved in historical orders
- One-tap "Show on Menu" (no confirmation), but "Hide from Menu" requires confirmation (prevent accidents)
