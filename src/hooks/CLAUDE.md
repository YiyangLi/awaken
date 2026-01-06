# src/hooks/

## Purpose

Placeholder directory for custom React hooks. Currently empty as all custom hooks are provided by Context providers.

## Current State

This directory contains only an `index.ts` export file with no actual custom hooks.

## Existing Hooks

All custom hooks are currently exported from Context providers:

### From `src/contexts/ThemeContext.tsx`
```typescript
export function useTheme(): ThemeContextValue {
  const { theme, themeName, setTheme, isLoading } = useTheme();
  // ...
}
```

**Purpose**: Access current theme and theme management functions
**Returns**:
- `theme` - Current theme object with colors, typography, spacing, etc.
- `themeName` - Active theme name ('DEFAULT', 'DARK', 'HIGH_CONTRAST', 'LARGE_TEXT')
- `setTheme` - Function to change theme (with automatic persistence)
- `isLoading` - Loading state while theme is being retrieved from storage

### From `src/contexts/AuthContext.tsx`
```typescript
export function useAuth(): AuthContextValue {
  const { isAdmin, login, logout } = useAuth();
  // ...
}
```

**Purpose**: Admin authentication and session management
**Returns**:
- `isAdmin` - Boolean indicating admin status
- `login` - Function to authenticate admin
- `logout` - Function to logout admin

### From `src/contexts/CartContext.tsx`
```typescript
export function useCart(): CartContextValue {
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
  // ...
}
```

**Purpose**: Shopping cart state management
**Returns**: Cart items, add/remove functions, price calculations, order creation

### From `src/components/ModalProvider.tsx`
```typescript
export function useModal(): ModalContextValue {
  const { showConfirmation, showAlert, showLoading, showForm, hideModal } = useModal();
  // ...
}
```

**Purpose**: Centralized modal system
**Returns**: Modal display functions (confirmation, alert, loading, form)

## Why Custom Hooks Directory Exists

The `src/hooks/` directory was created during initial project setup following standard React patterns. It remains empty because:

1. **Context Pattern**: All stateful logic is managed by Context providers
2. **Simplicity**: Context hooks (useTheme, useAuth, etc.) are sufficient
3. **Elder-Friendly**: Minimal API surface, clear naming

## When to Add Custom Hooks

Custom hooks should be added to this directory when you need:

### Data Fetching Hooks
```typescript
// src/hooks/useOrders.ts
export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    const data = await StorageService.getOrders();
    setOrders(data);
    setLoading(false);
  };

  return { orders, loading, refresh: loadOrders };
}
```

### Device Feature Hooks
```typescript
// src/hooks/useHaptics.ts
export function useHaptics() {
  const { theme } = useTheme();
  const settings = useSettings();

  const impact = async (style: 'light' | 'medium' | 'heavy') => {
    if (settings.hapticFeedback) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle[style]);
    }
  };

  return { impact };
}
```

### Form Hooks
```typescript
// src/hooks/useForm.ts
export function useForm<T>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  const validate = (validationFn: (values: T) => ValidationResult) => {
    const result = validationFn(values);
    if (!result.success) {
      setErrors(result.errors);
      return false;
    }
    return true;
  };

  return { values, errors, handleChange, validate };
}
```

### Navigation Hooks
```typescript
// src/hooks/useProtectedRoute.ts
export function useProtectedRoute() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const inAdminGroup = segments[0] === '(admin)';

    if (inAdminGroup && !isAdmin) {
      // Redirect to user home if not admin
      router.replace('/(user)');
    }
  }, [isAdmin, segments]);
}
```

## Git History

- **a19a324** - Initial commit: Empty hooks directory created

## Design Principles

When adding custom hooks:

1. **Single Responsibility**: Each hook should do one thing well
2. **Reusability**: Abstract common patterns used across multiple screens
3. **Elder-Friendly**: Simple, predictable APIs
4. **Type Safety**: Full TypeScript typing with generics where appropriate
5. **Error Handling**: Graceful degradation, no crashes

## Naming Conventions

- Start with `use` prefix (React convention)
- Use camelCase: `useOrders`, `useHaptics`
- Be descriptive: `useForm` is better than `useF`
- Match domain: `useCart` (shopping), `useOrders` (coffee cart)

## Related Files

- **Contexts**: `src/contexts/` - Primary location for stateful hooks
- **Components**: `app/` screens consume hooks
- **Utils**: `src/utils/` - Pure functions (not hooks)

## Future Considerations

Potential custom hooks for future development:

- `useDebounce` - Debounce input values
- `usePrevious` - Track previous value
- `useInterval` - Safe interval with cleanup
- `useLocalStorage` - Sync state with AsyncStorage
- `useNetworkStatus` - Monitor offline/online status
- `usePrinter` - Brother printer connection management
