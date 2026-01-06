# src/contexts/

## Purpose

React Context providers for global state management in Awaken. Provides theme management, authentication, and shopping cart functionality with elder-friendly design patterns.

## Key Files

### `ThemeContext.tsx`
**Purpose**: Centralized theme management with automatic persistence

**Features**:
- Four pre-configured themes: DEFAULT, DARK, HIGH_CONTRAST, LARGE_TEXT
- Automatic persistence via StorageService
- Loading state prevents flash of wrong theme
- Graceful fallback to DEFAULT theme on errors
- No crashes on storage errors

**API**:
```typescript
const { theme, themeName, setTheme, isLoading } = useTheme();

// Access theme values
<View style={{ backgroundColor: theme.colors.BACKGROUND }}>
  <Text style={{
    color: theme.colors.TEXT_PRIMARY,
    fontSize: theme.typography.FONT_SIZES.BODY
  }}>
    Hello World
  </Text>
</View>

// Change theme
setTheme('HIGH_CONTRAST');  // Automatically persisted
```

**Theme Object Structure**:
```typescript
interface Theme {
  colors: {
    BACKGROUND, SURFACE, PRIMARY, TEXT_PRIMARY, ERROR, etc.
  },
  typography: {
    FONT_SIZES, LINE_HEIGHTS, FONT_WEIGHTS
  },
  spacing: { XS, SM, MD, LG, XL, XXL, XXXL },
  touchTargets: { MINIMUM, COMFORTABLE, LARGE },
  shadows: { NONE, SM, MD, LG, XL },
  borderRadius: { SM, MD, LG, XL, FULL },
}
```

**Implementation Details**:
- Loads theme preference on mount from StorageService
- Validates theme name to prevent corrupted storage errors
- Updates immediately in UI, then persists to storage
- Creates default settings if none exist (first-time user)
- Elder-friendly: No user intervention needed for persistence

**Git History**:
- **56d086b** - LCC_4-7: Initial theme system with persistence

---

### `AuthContext.tsx`
**Purpose**: Admin authentication and session management

**Features**:
- Password-based admin authentication
- Session persistence across app restarts
- Automatic logout functionality
- No backend required (local-only validation)

**API**:
```typescript
const { isAdmin, login, logout } = useAuth();

// Check admin status
if (isAdmin) {
  // Show admin UI
}

// Login
const success = await login(password);
if (success) {
  router.replace('/(admin)');
} else {
  // Show error
}

// Logout
await logout();
router.replace('/(user)');
```

**Implementation Details**:
- Default password: `admin123` (from APP_CONFIG.ADMIN.DEFAULT_PASSWORD)
- Session stored in UserPreferences.isAdminSession
- Persisted via StorageService for offline access
- No network calls required

**Security Notes**:
- ⚠️ This is a demo app with hardcoded password
- Not suitable for production use without proper auth system
- Session stored in plain AsyncStorage (not encrypted)

**Git History**:
- **e732781** - LCC_8: Admin authentication system

---

### `CartContext.tsx`
**Purpose**: Shopping cart state management for coffee ordering

**Features**:
- Add/remove items with automatic quantity merging
- Subtotal, tax, and total calculations
- Order creation with barista assignment
- Automatic navigation to label preview after order
- All customizations are FREE (per requirements)

**API**:
```typescript
const {
  items,
  addItem,
  updateQuantity,
  removeItem,
  clearCart,
  getTotalItems,
  getSubtotal,
  getTax,
  getTotal,
  createOrder,
} = useCart();

// Add item (auto-merges if same configuration)
addItem({
  id: 'cart-item-1',
  drinkId: 'drink-mocha',
  drinkName: 'Mocha',
  drinkCategory: 'mocha',
  quantity: 1,
  size: '12oz',
  milk: 'oat',
  shots: 2,
  syrup: 'vanilla',
  basePrice: 500,
  totalPrice: 500,  // All customizations FREE
});

// Update quantity (removes if 0)
updateQuantity('cart-item-1', 2);

// Remove item
removeItem('cart-item-1');

// Get totals
const subtotal = getSubtotal();  // In cents
const tax = getTax();             // In cents (8.75%)
const total = getTotal();         // In cents

// Create order
const order = await createOrder('John Doe', '555-1234');
// Automatically navigates to /(user)/label-preview
```

**CartItem Interface**:
```typescript
interface CartItem {
  id: string;
  drinkId: string;
  drinkName: string;
  drinkCategory: string;
  quantity: number;
  size: string;              // '12oz' (hardcoded)
  milk?: 'whole' | 'oat';    // Optional (not for Americano/Soda)
  shots?: number;            // 0-4 (Mocha, Chai, Latte, Americano)
  chocolateType?: 'regular' | 'white';  // Mocha, Hot Chocolate
  syrup?: string;            // Mocha, Latte, Italian Soda
  isDirty?: boolean;         // Chai Latte only
  hasCream?: boolean;        // Italian Soda only
  basePrice: number;         // In cents
  totalPrice: number;        // In cents
}
```

**Order Creation Flow**:
1. Generate unique order ID
2. Convert CartItems to OrderItems with selectedOptions array
3. Assign random barista from APP_CONFIG.BARISTAS
4. Calculate estimated completion time (5 minutes default)
5. Save order to StorageService
6. Format label text using `formatLabelText()`
7. Navigate to label-preview screen with label data
8. **Cart cleared by label-preview screen** (not by createOrder)

**Implementation Details**:
- Automatic item merging: Same drink config increases quantity
- Price calculation: Unit price × quantity (all customizations FREE)
- Tax calculation: `Math.round(subtotal * 0.0875)`
- Elder-friendly: Simple add/remove API, no complex state management
- Error handling: Logs errors but doesn't throw (graceful degradation)

**Important Notes**:
- ⚠️ Cart is NOT cleared by `createOrder()` - causes review screen redirect
- Cart is cleared by label-preview screen after rendering
- All customizations (milk, syrup, shots) are FREE per requirements

**Git History**:
- **841f5be** - Stable version with order creation flow
- **6450e4c** - Final polish on cart navigation
- **ac49c0a** - LCC_10 work on cart integration
- **5cb5e39** - LCC_11 and LCC_12: Cart context foundation
- **aff48fc** - LCC_10B: Cart refinements

---

## Folder Structure

```
src/contexts/
├── ThemeContext.tsx    # Theme management with persistence
├── AuthContext.tsx     # Admin authentication
├── CartContext.tsx     # Shopping cart state
└── index.ts            # Context exports
```

## Design Patterns

### Provider Composition
All contexts are composed in `app/_layout.tsx`:

```tsx
<ThemeProvider>
  <AuthProvider>
    <CartProvider>
      <ModalProvider>
        <Stack />
      </ModalProvider>
    </CartProvider>
  </AuthProvider>
</ThemeProvider>
```

### Elder-Friendly Principles
1. **Automatic Persistence**: Theme and auth state saved without user action
2. **Graceful Errors**: Never crash on storage failures
3. **Simple APIs**: Clear, predictable method names
4. **Loading States**: Prevent UI flash on app startup
5. **No Surprises**: Explicit navigation after actions

### TypeScript Patterns
1. **Typed Contexts**: Full type safety for all context values
2. **Error Handling**: Try/catch with helpful console errors
3. **Hooks Required**: All contexts throw error if used outside provider
4. **Strict Mode**: No `any` types, explicit return types

## Usage Examples

### Theme Context
```tsx
function MyScreen() {
  const { theme, themeName, setTheme } = useTheme();

  return (
    <View style={{ backgroundColor: theme.colors.BACKGROUND }}>
      <Pressable onPress={() => setTheme('HIGH_CONTRAST')}>
        <Text style={{ color: theme.colors.PRIMARY }}>
          Switch to High Contrast
        </Text>
      </Pressable>
    </View>
  );
}
```

### Auth Context
```tsx
function AdminButton() {
  const { isAdmin, logout } = useAuth();
  const router = useRouter();

  const handlePress = async () => {
    if (isAdmin) {
      await logout();
      router.replace('/(user)');
    } else {
      // Show password input
    }
  };

  return (
    <Pressable onPress={handlePress}>
      <Text>{isAdmin ? 'Logout' : 'Admin Login'}</Text>
    </Pressable>
  );
}
```

### Cart Context
```tsx
function AddToCartButton({ drink }: { drink: Drink }) {
  const { addItem } = useCart();

  const handleAdd = () => {
    addItem({
      id: `cart-${Date.now()}`,
      drinkId: drink.id,
      drinkName: drink.name,
      drinkCategory: drink.category,
      quantity: 1,
      size: '12oz',
      milk: 'whole',
      shots: 2,
      basePrice: drink.basePrice,
      totalPrice: drink.basePrice,
    });
  };

  return (
    <Pressable onPress={handleAdd}>
      <Text>Add to Cart</Text>
    </Pressable>
  );
}
```

## Related Files

- **Storage**: `src/storage/StorageService.ts` - Persistence layer
- **Config**: `src/config/app.ts` - Theme definitions and defaults
- **Types**: `src/types/index.ts` - Interface definitions
- **Utils**: `src/utils/labelFormatter.ts` - Label formatting for cart

## Testing Notes

- Theme changes require ThemeProvider in test setup
- Auth state persists across app restarts (test with fresh install)
- Cart calculations tested with various quantities and customizations
- Tax calculation uses integer math (no floating point errors)
- All contexts throw helpful errors when used outside providers
