# src/config/

## Purpose

Centralized configuration system for the Awaken coffee ordering app. Provides design constants, theme definitions, app settings, and utility functions for elder-friendly accessibility.

## Key Files

### `app.ts`
**Purpose**: Complete app configuration with design system constants and themes

## Configuration Sections

### 1. **DESIGN_CONSTANTS**

Elder-friendly design values following WCAG guidelines and 44pt touch target requirements.

#### Touch Targets
```typescript
TOUCH_TARGET: {
  MINIMUM: 44,      // WCAG AA minimum
  COMFORTABLE: 56,  // Recommended size
  LARGE: 64,        // Elder-friendly large buttons
}
```

#### Typography
```typescript
TYPOGRAPHY: {
  FONT_SIZES: {
    CAPTION: 12,
    SMALL: 14,
    BODY: 18,           // Minimum 18pt per requirements
    BUTTON: 20,         // Clear button text
    SUBHEADING: 22,
    HEADING: 28,
    LARGE_HEADING: 34,
    TITLE: 40,
  },
  LINE_HEIGHTS: {
    TIGHT: 1.2,
    NORMAL: 1.4,
    RELAXED: 1.6,
    LOOSE: 1.8,
  },
  FONT_WEIGHTS: {
    NORMAL: '400',
    MEDIUM: '500',
    SEMIBOLD: '600',
    BOLD: '700',
  },
}
```

#### Colors
High-contrast color palette with sufficient contrast ratios for accessibility:

- **PRIMARY**: Sky blue (`#0EA5E9`) with shades
- **SUCCESS**: Green (`#22C55E`) for confirmations
- **WARNING**: Amber (`#F59E0B`) for cautions
- **ERROR**: Red (`#EF4444`) for errors
- **NEUTRAL**: Grayscale from white to near-black
- **HIGH_CONTRAST**: Black/white/yellow for maximum accessibility

#### Spacing System
```typescript
SPACING: {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  XXL: 48,
  XXXL: 64,
}
```

#### Border Radius
```typescript
BORDER_RADIUS: {
  SM: 4,
  MD: 8,
  LG: 12,
  XL: 16,
  FULL: 9999,
}
```

#### Animations
```typescript
ANIMATION: {
  FAST: 150,        // Quick transitions
  NORMAL: 300,      // Standard animations
  SLOW: 500,        // Elder-friendly slower pace
  VERY_SLOW: 800,   // Maximum accessibility
}
```

#### Shadows
```typescript
SHADOWS: {
  NONE: { elevation: 0, shadowOpacity: 0 },
  SM: { elevation: 2, ... },   // Subtle depth
  MD: { elevation: 4, ... },   // Standard elevation
  LG: { elevation: 8, ... },   // Prominent elements
  XL: { elevation: 12, ... },  // Maximum depth
}
```

### 2. **APP_CONFIG**

Runtime application settings and defaults.

#### App Information
```typescript
APP_NAME: 'Awaken'
VERSION: '1.0.0'
BUILD_NUMBER: 1
```

#### Admin Credentials
```typescript
ADMIN: {
  DEFAULT_PASSWORD: 'admin123',
  USERNAME: 'admin',
}
```

#### Baristas
```typescript
BARISTAS: ['Sarah', 'Michael', 'Emma', 'David', 'Luna', 'Alex']
```
- Used for random assignment to orders

#### Order Management
```typescript
ORDERS: {
  DEFAULT_PREP_TIME_MINUTES: 5,
  MAX_ITEMS_PER_ORDER: 10,
  AUTO_REFRESH_INTERVAL_MS: 30000,  // 30 seconds
  ORDER_TIMEOUT_HOURS: 24,
}
```

#### Pricing
```typescript
PRICING: {
  CURRENCY_SYMBOL: '$',
  DEFAULT_TAX_RATE: 0.0875,  // 8.75%
  ROUND_TO_NEAREST_CENT: true,
}
```

#### Accessibility Defaults
```typescript
ACCESSIBILITY: {
  DEFAULT_FONT_SIZE: 'large',
  DEFAULT_HIGH_CONTRAST: false,
  DEFAULT_VOICE_ANNOUNCEMENTS: true,
  DEFAULT_HAPTIC_FEEDBACK: true,
  SCREEN_READER_DELAY_MS: 500,
}
```

#### Coffee Cart Settings
```typescript
CART: {
  DEFAULT_NAME: 'Awaken Coffee Cart',
  DEFAULT_OPEN_STATUS: true,
  OFFLINE_MODE_ENABLED: true,
  MAX_OFFLINE_ORDERS: 100,
}
```

#### Drink Customization
```typescript
CUSTOMIZATION: {
  SYRUP_FLAVORS: ['Vanilla', 'Caramel', 'Hazelnut'],
  SHOTS: {
    DEFAULT: 2,
    MIN: 0,      // 0 only for Chai Latte when not dirty
    MAX: 4,
  },
  MILK_OPTIONS: ['Whole', 'Oat'],  // Almond removed
  DEFAULT_SIZE: '12oz',
}
```

### 3. **THEMES**

Pre-configured accessibility themes.

#### DEFAULT Theme
```typescript
THEMES.DEFAULT = {
  colors: {
    BACKGROUND: '#FFFFFF',
    SURFACE: '#F9FAFB',
    PRIMARY: '#0EA5E9',
    TEXT_PRIMARY: '#111827',
    TEXT_SECONDARY: '#4B5563',
    // ... full color palette
  },
  typography: DESIGN_CONSTANTS.TYPOGRAPHY,
  spacing: DESIGN_CONSTANTS.SPACING,
  touchTargets: DESIGN_CONSTANTS.TOUCH_TARGET,
  shadows: DESIGN_CONSTANTS.SHADOWS,
  borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
}
```

#### DARK Theme
```typescript
THEMES.DARK = {
  colors: {
    BACKGROUND: '#121212',
    SURFACE: '#1E1E1E',
    PRIMARY: '#90CAF9',      // Light blue (accessible on dark)
    TEXT_PRIMARY: '#FFFFFF',
    TEXT_SECONDARY: '#B0B0B0',
    // ... 4.5:1+ contrast ratios
  },
  // Same typography, spacing, etc.
}
```

#### HIGH_CONTRAST Theme
```typescript
THEMES.HIGH_CONTRAST = {
  colors: {
    BACKGROUND: '#000000',
    SURFACE: '#1F1F1F',
    PRIMARY: '#FFFF00',      // Yellow for maximum visibility
    TEXT_PRIMARY: '#FFFFFF',
    ACCENT: '#FFFF00',
    FOCUS: '#00FFFF',
  },
  typography: {
    FONT_SIZES: {
      BODY: 20,  // Larger body text
      // ... increased sizes
    },
  },
  touchTargets: {
    MINIMUM: 56,   // Larger minimum
    COMFORTABLE: 64,
    LARGE: 72,
  },
}
```

#### LARGE_TEXT Theme
```typescript
THEMES.LARGE_TEXT = {
  colors: { /* Same as DEFAULT */ },
  typography: {
    FONT_SIZES: {
      CAPTION: 16,
      BODY: 22,
      HEADING: 34,
      TITLE: 48,
      // ... increased across the board
    },
  },
  spacing: {
    MD: 20,   // Slightly increased
    LG: 28,
    XL: 36,
  },
}
```

### 4. **ConfigUtils**

Utility functions for configuration access.

#### `getTouchTargetSize()`
```typescript
ConfigUtils.getTouchTargetSize('comfortable')  // Returns 56
```

#### `getFontSize()`
```typescript
ConfigUtils.getFontSize('large')  // Returns 20
```

#### `getTheme()`
```typescript
ConfigUtils.getTheme(highContrast, largeText)
// Returns appropriate theme based on preferences
```

#### `formatCurrency()`
```typescript
ConfigUtils.formatCurrency(500)  // Returns "$5.00"
```

#### `calculateTotalWithTax()`
```typescript
ConfigUtils.calculateTotalWithTax(1000)  // Returns 1088 (8.75% tax)
```

## Git History

- **aff48fc** - LCC_10B: Admin configuration refinements
- **e732781** - LCC_8: Theme system and navigation constants
- **56d086b** - LCC_4-7: Design constants and touch targets
- **34400a2** - LCC_2 and LCC_3: Initial configuration system
- **a19a324** - Initial commit: Base config structure

## Usage Examples

### Using DESIGN_CONSTANTS
```typescript
import { DESIGN_CONSTANTS } from '@/config';

const buttonStyle = {
  minHeight: DESIGN_CONSTANTS.TOUCH_TARGET.LARGE,
  fontSize: DESIGN_CONSTANTS.TYPOGRAPHY.FONT_SIZES.BUTTON,
  paddingHorizontal: DESIGN_CONSTANTS.SPACING.MD,
};
```

### Using APP_CONFIG
```typescript
import { APP_CONFIG } from '@/config';

const calculateTax = (subtotal: number) => {
  return Math.round(subtotal * APP_CONFIG.PRICING.DEFAULT_TAX_RATE);
};
```

### Using Themes
```typescript
import { THEMES } from '@/config';

const { theme } = useTheme();  // Returns one of THEMES.*

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.BACKGROUND,
    padding: theme.spacing.MD,
  },
  text: {
    color: theme.colors.TEXT_PRIMARY,
    fontSize: theme.typography.FONT_SIZES.BODY,
  },
});
```

### Using ConfigUtils
```typescript
import { ConfigUtils } from '@/config';

// Format price for display
const displayPrice = ConfigUtils.formatCurrency(500);  // "$5.00"

// Get appropriate theme
const theme = ConfigUtils.getTheme(
  userPreferences.highContrastMode,
  userPreferences.fontSize === 'extra-large'
);
```

## Design Principles

### Elder-Friendly
1. **Large Defaults**: Font sizes and touch targets optimized for seniors
2. **High Contrast**: All themes meet WCAG AA standards minimum
3. **Slow Animations**: Reduced motion for accessibility
4. **Clear Feedback**: Visual states and haptic responses

### Accessibility
1. **WCAG AA Compliance**: 4.5:1 contrast ratios minimum
2. **Touch Targets**: 44pt minimum per Apple HIG
3. **Screen Reader Support**: Semantic color naming
4. **Multiple Themes**: Support different vision needs

### Maintainability
1. **Centralized**: Single source of truth for all constants
2. **Type-Safe**: Full TypeScript definitions
3. **Consistent Naming**: SCREAMING_SNAKE_CASE for constants
4. **Documented**: Clear comments for all values

## Related Files

- **ThemeContext**: `src/contexts/ThemeContext.tsx` - Consumes THEMES
- **Type Definitions**: `src/types/index.ts` - Uses config types
- **Components**: Use theme and constants throughout

## Testing Notes

- Theme changes require app restart (no hot reload)
- High contrast mode tested with iOS Accessibility Inspector
- Touch target sizes verified on physical devices
- Tax calculation accuracy verified with integer math
