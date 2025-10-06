# Awaken - Architecture Overview

## System Architecture

Awaken is an elder-friendly iOS coffee ordering app built with **React Native** and **Expo**, designed for coffee carts and small shops with offline-first functionality.

### Core Principles
1. **Elder-Friendly First**: Large touch targets (44pt+), high contrast, simple flows
2. **Offline-First**: AsyncStorage for local data, works without internet
3. **Type-Safe**: Strict TypeScript throughout
4. **Accessible**: WCAG 2.1 compliant, VoiceOver optimized
5. **Simple & Clear**: Linear navigation, minimal cognitive load

---

## Technology Stack

### Framework & Runtime
- **React Native** 0.81.4 - Cross-platform mobile framework
- **Expo** ~54.0.12 - Development platform and tooling
- **React** 19.1.0 - UI library
- **TypeScript** 5.9.2 - Type safety

### Navigation
- **Expo Router** 6.0.10 - File-based routing system
- **React Navigation** 7.1.8 - Navigation infrastructure

### State Management
- **React Context API** - Global state (Theme, Auth, Cart, Modal)
- **React Hooks** - Local state management

### Storage
- **AsyncStorage** 2.2.0 - Local data persistence
- **Custom Migration System** - Schema versioning

### UI & Interaction
- **Expo Haptics** - Tactile feedback
- **React Native Gesture Handler** - Touch interactions
- **React Native Reanimated** - Smooth animations

### Development Tools
- **ESLint** 9.25.0 - Code linting
- **TypeScript ESLint** 8.45.0 - TS-specific linting
- **eslint-plugin-jsx-a11y** 6.10.2 - Accessibility linting

---

## Application Architecture

### Layer Architecture

```
┌─────────────────────────────────────┐
│         Presentation Layer          │
│    (Screens, Components, UI)        │
├─────────────────────────────────────┤
│       Business Logic Layer          │
│    (Contexts, Hooks, Utilities)     │
├─────────────────────────────────────┤
│         Data Layer                  │
│  (Storage, Validation, Types)       │
├─────────────────────────────────────┤
│       Configuration Layer           │
│    (Theme, App Config, Constants)   │
└─────────────────────────────────────┘
```

### File-Based Routing (Expo Router)

```
app/
├── _layout.tsx              # Root layout with providers
├── (user)/                  # User mode group
│   ├── _layout.tsx         # User navigation
│   ├── index.tsx           # Menu screen
│   ├── drink/[id].tsx      # Drink customization (dynamic)
│   ├── review.tsx          # Order review
│   └── confirmation.tsx    # Order confirmation
└── (admin)/                # Admin mode group
    ├── _layout.tsx         # Admin navigation
    └── index.tsx           # Admin dashboard
```

---

## Data Flow

### Order Creation Flow

```
User selects drink
        ↓
Customize drink options (drink/[id].tsx)
        ↓
Clear cart + Add to cart (CartContext)
        ↓
Review order (review.tsx)
        ↓
Enter name
        ↓
Create order (CartContext.createOrder)
        ↓
Save to AsyncStorage (StorageService)
        ↓
Show confirmation (confirmation.tsx)
        ↓
Auto-redirect to menu (3s timer)
```

### State Management Flow

```
Component → useContext Hook → Context Provider → AsyncStorage
                                      ↓
                               Global State Update
                                      ↓
                            Re-render Consumers
```

---

## Core Systems

### 1. Theme System (`src/contexts/ThemeContext.tsx`)

**Purpose**: Centralized design tokens and theme switching

**Features**:
- Color palette (PRIMARY, SURFACE, TEXT, etc.)
- Typography scales (16pt - 40pt)
- Touch targets (44pt minimum)
- Shadow system (SM, MD, LG)
- Theme persistence to AsyncStorage

**Themes**:
- DEFAULT (Cream & Brown)
- DARK (High contrast dark)
- HIGH_CONTRAST (Maximum contrast)
- LARGE_TEXT (Extra-large fonts)

### 2. Storage System (`src/storage/`)

**Components**:
- **StorageService**: Type-safe AsyncStorage wrapper
- **Migrations**: Schema versioning and upgrades

**Data Stored**:
- `@awaken:drinks` - Menu items
- `@awaken:orders` - Order history
- `@awaken:settings` - App settings
- `@awaken:userPreferences` - User preferences

**Migration System**:
```typescript
Migration v1 → v2:
- Add new drink fields
- Backfill defaults
- Update schema version
```

### 3. Cart System (`src/contexts/CartContext.tsx`)

**Purpose**: Shopping cart and order creation

**Features**:
- Add/remove items
- Quantity management
- Price calculation (subtotal, tax, total)
- Order creation with barista assignment
- Cart clearing (one item per order)

**Order Flow**:
```typescript
CartItem → OrderItem → Order → AsyncStorage
```

### 4. Modal System (`src/components/ModalProvider.tsx`)

**Purpose**: Centralized modals for confirmations, alerts, forms

**Modal Types**:
- **Confirmation**: Yes/No decisions
- **Alert**: Single-button notifications
- **Loading**: Progress indicators
- **Form**: Text input modals

**Features**:
- Modal stacking
- Haptic feedback
- Keyboard support
- Backdrop dismissal

### 5. Authentication System (`src/contexts/AuthContext.tsx`)

**Purpose**: User/Admin mode switching

**Features**:
- PIN-based admin access (PIN: 1234)
- Mode persistence
- Protected routes
- Session management

---

## Data Models

### Core Entities

#### Drink
```typescript
interface Drink {
  id: string;
  name: string;
  category: DrinkCategory;
  basePrice: number;  // cents
  options: DrinkOption[];
  isAvailable: boolean;
}
```

#### Order
```typescript
interface Order {
  id: string;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;  // cents
  status: OrderStatus;
  createdAt: Date;
  assignedBarista?: string;
  estimatedCompletionTime?: Date;
}
```

#### CartItem
```typescript
interface CartItem {
  id: string;
  drinkId: string;
  drinkName: string;
  drinkCategory: string;
  quantity: number;
  // Customizations
  size: string;
  milk?: 'whole' | 'oat';
  shots?: number;
  chocolateType?: 'regular' | 'white';
  syrup?: string;
  isDirty?: boolean;
  hasCream?: boolean;
  // Pricing
  basePrice: number;
  totalPrice: number;
}
```

---

## Design Patterns

### 1. Context + Provider Pattern
```typescript
// Define context
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// Provider component
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(THEMES.DEFAULT);
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook for consumption
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
```

### 2. Repository Pattern (Storage)
```typescript
// Abstraction layer over AsyncStorage
export class StorageService {
  static async getDrinks(): Promise<Drink[]> { /* ... */ }
  static async saveDrinks(drinks: Drink[]): Promise<void> { /* ... */ }
  static async getOrders(): Promise<Order[]> { /* ... */ }
  // ...
}
```

### 3. Strategy Pattern (Validation)
```typescript
// Different validation strategies
export function validateDrink(drink: unknown): ValidationResult<Drink>
export function validateOrder(order: unknown): ValidationResult<Order>
export function validateOrderItem(item: unknown): ValidationResult<OrderItem>
```

### 4. Observer Pattern (React Context)
```typescript
// Consumers automatically re-render on state changes
const { theme } = useTheme();  // Subscribes to theme changes
const { items } = useCart();   // Subscribes to cart changes
```

---

## Accessibility Architecture

### Touch Targets
- **Minimum**: 44pt × 44pt (theme.touchTargets.LARGE)
- **Comfortable**: 56pt × 56pt (theme.touchTargets.COMFORTABLE)
- **Large**: 72pt × 72pt (theme.touchTargets.EXTRA_LARGE)

### Typography Scale
```typescript
FONT_SIZES: {
  CAPTION: 14,      // Small labels
  SMALL: 16,        // Secondary text
  BODY: 20,         // Body text
  SUBHEADING: 24,   // Card titles
  HEADING: 28,      // Section headers
  LARGE_HEADING: 32,// Screen titles
  TITLE: 40,        // Hero text
}
```

### Screen Reader Support
```tsx
<Pressable
  accessibilityRole="button"
  accessibilityLabel="Add Mocha to cart"
  accessibilityHint="Double tap to add this drink"
  accessibilityState={{ disabled: !isAvailable }}
>
```

### High Contrast Colors
- Minimum contrast ratio: 4.5:1 (WCAG AA)
- Target contrast ratio: 7:1 (WCAG AAA)
- Tested with iOS VoiceOver and color blind simulators

---

## Offline-First Architecture

### Local Storage Strategy
1. **Drinks**: Pre-seeded with menu, updates sync when online
2. **Orders**: Created locally, queued for sync
3. **Settings**: Fully local, no sync required
4. **Preferences**: Fully local, no sync required

### Sync Strategy (Future)
```
Local Changes → Queue → Sync When Online → Resolve Conflicts
```

### Migration System
```typescript
Schema v1 → Migration → Schema v2
                ↓
          Backup Created
                ↓
          Apply Changes
                ↓
       Update Version Number
```

---

## Security Considerations

### Authentication
- Admin PIN stored locally (not recommended for production)
- No sensitive data transmission (offline-first)
- Session timeout after inactivity (future)

### Data Protection
- No credit card storage
- No personal data collection
- Local-only data storage
- Future: Encryption at rest

---

## Performance Considerations

### Optimization Strategies
1. **Lazy Loading**: Dynamic imports for heavy components
2. **Memoization**: React.memo for expensive renders
3. **Virtual Lists**: For long order lists (future)
4. **Image Optimization**: Expo Image for caching
5. **Storage Optimization**: Batch writes, debounced saves

### Benchmarks
- App launch: < 2s
- Screen transition: < 300ms
- Storage read: < 100ms
- Storage write: < 200ms

---

## Testing Architecture

### Testing Pyramid
```
           E2E Tests (Future)
        ─────────────────
       Integration Tests (LCC_15)
    ────────────────────────────
   Unit Tests (Validation, Utils)
────────────────────────────────────
```

### Test Coverage Goals (LCC_15)
- **Unit Tests**: >80% coverage
- **Integration Tests**: Critical flows
- **E2E Tests**: Key user journeys (future)

---

## Scalability Considerations

### Current Limitations
- Single device (no cloud sync)
- One order at a time
- Limited to 6 drink types

### Future Scalability
- **Multi-device sync**: Backend API + sync queue
- **Multiple orders**: Batch order management
- **Dynamic menu**: CMS integration
- **Analytics**: Order insights, popular drinks
- **Printer integration**: Receipt printing
- **Payment processing**: Stripe/Square integration

---

## Deployment Architecture

### Current (Development)
```
Developer Machine → Expo Go App → iOS Simulator/Device
```

### Production (Future)
```
Code → GitHub → CI/CD → App Store → User Devices
```

### Build Configuration
- **Development**: Expo Go
- **Preview**: Development Build
- **Production**: Standalone App (EAS Build)

---

## Error Handling Strategy

### Error Categories
1. **Storage Errors**: Fallback to in-memory state
2. **Validation Errors**: User-friendly messages
3. **Network Errors**: Queue for retry (future)
4. **Runtime Errors**: Error boundaries (future)

### Error Handling Pattern
```typescript
try {
  const data = await StorageService.getData();
  return data;
} catch (error) {
  console.error('Storage error:', error);
  // Fallback to default
  return getDefaultData();
}
```

---

## Monitoring & Debugging

### Development Tools
- **React DevTools**: Component inspection
- **Expo DevTools**: Network, logs, performance
- **Flipper**: Advanced debugging (optional)

### Logging Strategy
```typescript
// Development only
if (__DEV__) {
  console.log('Debug:', data);
}

// Production: Error tracking service (future)
// Sentry.captureException(error);
```

---

## Dependencies & Versioning

### Core Dependencies
- React Native: `0.81.4` (stable)
- Expo: `~54.0.12` (SDK 54)
- TypeScript: `~5.9.2` (latest stable)

### Update Strategy
- **Minor updates**: Monthly review
- **Major updates**: Quarterly, with testing
- **Security patches**: Immediate

---

## Related Documentation

- [Setup Guide](./setup.md) - Development environment setup
- [Workflow Guide](./workflow.md) - Development processes
- [Changelog](../.claude/context/changelog.md) - Version history
- [Ticket Details](../.claude/context/ticket-details/) - Implementation notes
