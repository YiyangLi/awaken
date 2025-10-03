/**
 * App Configuration System
 * Centralized configuration for Awaken coffee ordering app
 * 
 * Elder-friendly design constants and app-wide settings
 * All values designed for accessibility and ease of use
 */

/**
 * Design system constants optimized for elder users
 * Following WCAG guidelines and 44pt touch target requirements
 */
export const DESIGN_CONSTANTS = {
  // Touch targets - minimum 44pt for accessibility
  TOUCH_TARGET: {
    MINIMUM: 44,
    COMFORTABLE: 56,
    LARGE: 64,
  },

  // Typography - large, readable fonts for elder users
  TYPOGRAPHY: {
    FONT_SIZES: {
      CAPTION: 12,
      SMALL: 14,
      BODY: 18,        // Minimum 18pt for body text per requirements
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
  },

  // High contrast color palette for accessibility
  COLORS: {
    // Primary brand colors with high contrast
    PRIMARY: {
      50: '#F0F9FF',
      100: '#E0F2FE',
      500: '#0EA5E9',
      600: '#0284C7',
      700: '#0369A1',
      900: '#0C4A6E',
    },
    
    // Status colors with sufficient contrast ratios
    SUCCESS: {
      50: '#F0FDF4',
      500: '#22C55E',
      700: '#15803D',
      900: '#14532D',
    },
    WARNING: {
      50: '#FFFBEB',
      500: '#F59E0B',
      700: '#B45309',
      900: '#92400E',
    },
    ERROR: {
      50: '#FEF2F2',
      500: '#EF4444',
      700: '#B91C1C',
      900: '#7F1D1D',
    },

    // Neutral colors for text and backgrounds
    NEUTRAL: {
      0: '#FFFFFF',
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
      950: '#030712',
    },

    // Elder-friendly high contrast mode
    HIGH_CONTRAST: {
      BACKGROUND: '#000000',
      SURFACE: '#1F1F1F',
      TEXT_PRIMARY: '#FFFFFF',
      TEXT_SECONDARY: '#E5E5E5',
      ACCENT: '#FFFF00',
      FOCUS: '#00FFFF',
    },
  },

  // Spacing system for consistent layout
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
    XXL: 48,
    XXXL: 64,
  },

  // Border radius for elder-friendly rounded corners
  BORDER_RADIUS: {
    SM: 4,
    MD: 8,
    LG: 12,
    XL: 16,
    FULL: 9999,
  },

  // Animation durations - slower for accessibility
  ANIMATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
    VERY_SLOW: 800,
  },
} as const;

/**
 * App-wide configuration settings
 */
export const APP_CONFIG = {
  // App information
  APP_NAME: 'Awaken',
  VERSION: '1.0.0',
  BUILD_NUMBER: 1,
  
  // Default admin credentials
  ADMIN: {
    DEFAULT_PASSWORD: 'admin123',
    USERNAME: 'admin',
  },

  // Default barista names for quick assignment
  BARISTAS: [
    'Sarah',
    'Michael',
    'Emma',
    'David',
    'Luna',
    'Alex',
  ],

  // Order management settings
  ORDERS: {
    DEFAULT_PREP_TIME_MINUTES: 5,
    MAX_ITEMS_PER_ORDER: 10,
    AUTO_REFRESH_INTERVAL_MS: 30000, // 30 seconds
    ORDER_TIMEOUT_HOURS: 24,
  },

  // Payment and pricing
  PRICING: {
    CURRENCY_SYMBOL: '$',
    DEFAULT_TAX_RATE: 0.0875, // 8.75%
    ROUND_TO_NEAREST_CENT: true,
  },

  // Accessibility defaults
  ACCESSIBILITY: {
    DEFAULT_FONT_SIZE: 'large' as const,
    DEFAULT_HIGH_CONTRAST: false,
    DEFAULT_VOICE_ANNOUNCEMENTS: true,
    DEFAULT_HAPTIC_FEEDBACK: true,
    SCREEN_READER_DELAY_MS: 500,
  },

  // Coffee cart operation settings
  CART: {
    DEFAULT_NAME: 'Awaken Coffee Cart',
    DEFAULT_OPEN_STATUS: true,
    OFFLINE_MODE_ENABLED: true,
    MAX_OFFLINE_ORDERS: 100,
  },
} as const;

/**
 * TypeScript interface for app configuration
 * Ensures type safety when accessing configuration values
 */
export interface AppConfiguration {
  readonly designConstants: typeof DESIGN_CONSTANTS;
  readonly appConfig: typeof APP_CONFIG;
}

/**
 * Complete app configuration object
 * Provides centralized access to all configuration values
 */
export const CONFIG: AppConfiguration = {
  designConstants: DESIGN_CONSTANTS,
  appConfig: APP_CONFIG,
} as const;

/**
 * Elder-friendly theme configuration
 * Pre-configured themes for different accessibility needs
 */
const THEMES = {
  DEFAULT: {
    colors: DESIGN_CONSTANTS.COLORS,
    typography: DESIGN_CONSTANTS.TYPOGRAPHY,
    spacing: DESIGN_CONSTANTS.SPACING,
    touchTargets: DESIGN_CONSTANTS.TOUCH_TARGET,
  },
  
  HIGH_CONTRAST: {
    colors: DESIGN_CONSTANTS.COLORS,
    typography: {
      FONT_SIZES: {
        CAPTION: 12,
        SMALL: 14,
        BODY: 20, // Larger body text for high contrast mode
        SUBHEADING: 24,
        HEADING: 32,
        LARGE_HEADING: 40,
        TITLE: 48,
      },
      LINE_HEIGHTS: DESIGN_CONSTANTS.TYPOGRAPHY.LINE_HEIGHTS,
      FONT_WEIGHTS: DESIGN_CONSTANTS.TYPOGRAPHY.FONT_WEIGHTS,
    },
    spacing: DESIGN_CONSTANTS.SPACING,
    touchTargets: {
      MINIMUM: 56, // Larger touch targets in high contrast mode
      COMFORTABLE: 64,
      LARGE: 72,
    },
  },
  
  LARGE_TEXT: {
    colors: DESIGN_CONSTANTS.COLORS,
    typography: {
      FONT_SIZES: {
        CAPTION: 16,
        SMALL: 18,
        BODY: 22,
        SUBHEADING: 28,
        HEADING: 34,
        LARGE_HEADING: 42,
        TITLE: 48,
      },
      LINE_HEIGHTS: DESIGN_CONSTANTS.TYPOGRAPHY.LINE_HEIGHTS,
      FONT_WEIGHTS: DESIGN_CONSTANTS.TYPOGRAPHY.FONT_WEIGHTS,
    },
    spacing: {
      XS: 4,
      SM: 8,
      MD: 20,
      LG: 28,
      XL: 36,
      XXL: 48,
      XXXL: 64,
    },
    touchTargets: DESIGN_CONSTANTS.TOUCH_TARGET,
  },
} as const;

/**
 * Utility functions for configuration access
 */
export const ConfigUtils = {
  /**
   * Get touch target size based on preference
   */
  getTouchTargetSize: (size: 'minimum' | 'comfortable' | 'large' = 'comfortable'): number => {
    switch (size) {
      case 'minimum':
        return DESIGN_CONSTANTS.TOUCH_TARGET.MINIMUM;
      case 'comfortable':
        return DESIGN_CONSTANTS.TOUCH_TARGET.COMFORTABLE;
      case 'large':
        return DESIGN_CONSTANTS.TOUCH_TARGET.LARGE;
      default:
        return DESIGN_CONSTANTS.TOUCH_TARGET.COMFORTABLE;
    }
  },

  /**
   * Get font size based on user preference
   */
  getFontSize: (preference: 'small' | 'medium' | 'large' | 'extra-large'): number => {
    const baseSizes = DESIGN_CONSTANTS.TYPOGRAPHY.FONT_SIZES;
    switch (preference) {
      case 'small':
        return baseSizes.BODY - 2;
      case 'medium':
        return baseSizes.BODY;
      case 'large':
        return baseSizes.BODY + 2;
      case 'extra-large':
        return baseSizes.BODY + 4;
      default:
        return baseSizes.BODY;
    }
  },

  /**
   * Get theme configuration based on accessibility preferences
   */
  getTheme: (
    highContrast: boolean = false,
    largeText: boolean = false
  ) => {
    if (highContrast) {
      return THEMES.HIGH_CONTRAST;
    }
    if (largeText) {
      return THEMES.LARGE_TEXT;
    }
    return THEMES.DEFAULT;
  },

  /**
   * Format currency value for display
   */
  formatCurrency: (cents: number): string => {
    const dollars = cents / 100;
    return `${APP_CONFIG.PRICING.CURRENCY_SYMBOL}${dollars.toFixed(2)}`;
  },

  /**
   * Calculate total with tax
   */
  calculateTotalWithTax: (subtotal: number): number => {
    const tax = Math.round(subtotal * APP_CONFIG.PRICING.DEFAULT_TAX_RATE);
    return subtotal + tax;
  },
} as const;

// Export individual constants for convenience
export { THEMES };

// Export types for external use
export type ThemeName = keyof typeof THEMES;
export type TouchTargetSize = keyof typeof DESIGN_CONSTANTS.TOUCH_TARGET;
export type FontSizePreference = 'small' | 'medium' | 'large' | 'extra-large';