/**
 * Storage Schema Definitions
 * 
 * Defines database schema versioning, default seed data, and migration tracking.
 * All drinks are FREE (basePrice: 0, additionalCost: 0) for the free service model.
 * 
 * Elder-friendly design ensures data integrity with automatic validation and backup.
 * 
 * @module schemas
 */

import { APP_CONFIG } from '../config';
import type { AppSettings, Drink, DrinkCategory, DrinkOptionType } from '../types';

/**
 * Current schema version
 * Increment when making breaking changes to data structure
 */
export const CURRENT_SCHEMA_VERSION = 1;

/**
 * Migration record for tracking schema version changes
 * Elder-friendly: Maintains history for debugging and rollback capabilities
 */
export interface MigrationRecord {
  /** Schema version before migration */
  fromVersion: number;
  /** Schema version after migration */
  toVersion: number;
  /** When the migration was performed */
  timestamp: Date;
  /** Whether migration completed successfully */
  success: boolean;
  /** Error message if migration failed */
  error?: string;
}

/**
 * AppSettings with schema version tracking
 * Extends base AppSettings with migration metadata
 */
export interface AppSettingsWithSchema extends AppSettings {
  /** Current schema version of stored data */
  schemaVersion: number;
  /** History of all schema migrations performed */
  migrationHistory: MigrationRecord[];
}

/**
 * Default drinks seed data - one drink per category
 * All drinks are FREE (basePrice: 0, additionalCost: 0)
 * 
 * Elder-friendly features:
 * - Clear, descriptive names
 * - Helpful descriptions for each drink
 * - Simple, consistent option structure
 * - All prices set to $0 (free service model)
 */
export const DEFAULT_DRINKS_SEED: Drink[] = [
  {
    id: 'drink-mocha-001',
    name: 'Classic Mocha',
    category: 'mocha' as DrinkCategory,
    basePrice: 0, // FREE
    description: 'Rich chocolate blended with smooth espresso for a delightful treat',
    isAvailable: true,
    options: [
      // Size options - all FREE
      {
        id: 'opt-mocha-size-small',
        name: 'Small',
        type: 'size' as DrinkOptionType,
        additionalCost: 0,
        isAvailable: true,
        description: '12 oz cup',
      },
      {
        id: 'opt-mocha-size-medium',
        name: 'Medium',
        type: 'size' as DrinkOptionType,
        additionalCost: 0,
        isAvailable: true,
        description: '16 oz cup',
      },
      {
        id: 'opt-mocha-size-large',
        name: 'Large',
        type: 'size' as DrinkOptionType,
        additionalCost: 0,
        isAvailable: true,
        description: '20 oz cup',
      },
      // Milk options - all FREE
      {
        id: 'opt-mocha-milk-whole',
        name: 'Whole Milk',
        type: 'milk' as DrinkOptionType,
        additionalCost: 0,
        isAvailable: true,
        description: 'Creamy whole milk',
      },
      {
        id: 'opt-mocha-milk-almond',
        name: 'Almond Milk',
        type: 'milk' as DrinkOptionType,
        additionalCost: 0,
        isAvailable: true,
        description: 'Smooth almond milk',
      },
      {
        id: 'opt-mocha-milk-oat',
        name: 'Oat Milk',
        type: 'milk' as DrinkOptionType,
        additionalCost: 0,
        isAvailable: true,
        description: 'Rich oat milk',
      },
    ],
  },
  {
    id: 'drink-chai-001',
    name: 'Spiced Chai Latte',
    category: 'chai-latte' as DrinkCategory,
    basePrice: 0, // FREE
    description: 'Warming blend of chai spices with steamed milk for cozy comfort',
    isAvailable: true,
    options: [
      // Size options - all FREE
      {
        id: 'opt-chai-size-small',
        name: 'Small',
        type: 'size' as DrinkOptionType,
        additionalCost: 0,
        isAvailable: true,
        description: '12 oz cup',
      },
      {
        id: 'opt-chai-size-medium',
        name: 'Medium',
        type: 'size' as DrinkOptionType,
        additionalCost: 0,
        isAvailable: true,
        description: '16 oz cup',
      },
      {
        id: 'opt-chai-size-large',
        name: 'Large',
        type: 'size' as DrinkOptionType,
        additionalCost: 0,
        isAvailable: true,
        description: '20 oz cup',
      },
      // Milk options - all FREE
      {
        id: 'opt-chai-milk-whole',
        name: 'Whole Milk',
        type: 'milk' as DrinkOptionType,
        additionalCost: 0,
        isAvailable: true,
        description: 'Creamy whole milk',
      },
      {
        id: 'opt-chai-milk-almond',
        name: 'Almond Milk',
        type: 'milk' as DrinkOptionType,
        additionalCost: 0,
        isAvailable: true,
        description: 'Smooth almond milk',
      },
      {
        id: 'opt-chai-milk-oat',
        name: 'Oat Milk',
        type: 'milk' as DrinkOptionType,
        additionalCost: 0,
        isAvailable: true,
        description: 'Rich oat milk',
      },
    ],
  },
  {
    id: 'drink-latte-001',
    name: 'Classic Latte',
    category: 'latte' as DrinkCategory,
    basePrice: 0, // FREE
    description: 'Smooth espresso with steamed milk, perfectly balanced and delicious',
    isAvailable: true,
    options: [
      // Size options - all FREE
      {
        id: 'opt-latte-size-small',
        name: 'Small',
        type: 'size' as DrinkOptionType,
        additionalCost: 0,
        isAvailable: true,
        description: '12 oz cup',
      },
      {
        id: 'opt-latte-size-medium',
        name: 'Medium',
        type: 'size' as DrinkOptionType,
        additionalCost: 0,
        isAvailable: true,
        description: '16 oz cup',
      },
      {
        id: 'opt-latte-size-large',
        name: 'Large',
        type: 'size' as DrinkOptionType,
        additionalCost: 0,
        isAvailable: true,
        description: '20 oz cup',
      },
      // Milk options - all FREE
      {
        id: 'opt-latte-milk-whole',
        name: 'Whole Milk',
        type: 'milk' as DrinkOptionType,
        additionalCost: 0,
        isAvailable: true,
        description: 'Creamy whole milk',
      },
      {
        id: 'opt-latte-milk-almond',
        name: 'Almond Milk',
        type: 'milk' as DrinkOptionType,
        additionalCost: 0,
        isAvailable: true,
        description: 'Smooth almond milk',
      },
      {
        id: 'opt-latte-milk-oat',
        name: 'Oat Milk',
        type: 'milk' as DrinkOptionType,
        additionalCost: 0,
        isAvailable: true,
        description: 'Rich oat milk',
      },
    ],
  },
  {
    id: 'drink-hotchoc-001',
    name: 'Rich Hot Chocolate',
    category: 'hot-chocolate' as DrinkCategory,
    basePrice: 0, // FREE
    description: 'Creamy, rich hot chocolate made with real cocoa for pure indulgence',
    isAvailable: true,
    options: [
      // Size options - all FREE
      {
        id: 'opt-hotchoc-size-small',
        name: 'Small',
        type: 'size' as DrinkOptionType,
        additionalCost: 0,
        isAvailable: true,
        description: '12 oz cup',
      },
      {
        id: 'opt-hotchoc-size-medium',
        name: 'Medium',
        type: 'size' as DrinkOptionType,
        additionalCost: 0,
        isAvailable: true,
        description: '16 oz cup',
      },
      {
        id: 'opt-hotchoc-size-large',
        name: 'Large',
        type: 'size' as DrinkOptionType,
        additionalCost: 0,
        isAvailable: true,
        description: '20 oz cup',
      },
      // Milk options - all FREE
      {
        id: 'opt-hotchoc-milk-whole',
        name: 'Whole Milk',
        type: 'milk' as DrinkOptionType,
        additionalCost: 0,
        isAvailable: true,
        description: 'Creamy whole milk',
      },
      {
        id: 'opt-hotchoc-milk-almond',
        name: 'Almond Milk',
        type: 'milk' as DrinkOptionType,
        additionalCost: 0,
        isAvailable: true,
        description: 'Smooth almond milk',
      },
      {
        id: 'opt-hotchoc-milk-oat',
        name: 'Oat Milk',
        type: 'milk' as DrinkOptionType,
        additionalCost: 0,
        isAvailable: true,
        description: 'Rich oat milk',
      },
    ],
  },
  {
    id: 'drink-americano-001',
    name: 'Classic Americano',
    category: 'americano' as DrinkCategory,
    basePrice: 0, // FREE
    description: 'Bold espresso with hot water, a strong and satisfying coffee',
    isAvailable: true,
    options: [
      // Size options - all FREE
      {
        id: 'opt-americano-size-small',
        name: 'Small',
        type: 'size' as DrinkOptionType,
        additionalCost: 0,
        isAvailable: true,
        description: '12 oz cup',
      },
      {
        id: 'opt-americano-size-medium',
        name: 'Medium',
        type: 'size' as DrinkOptionType,
        additionalCost: 0,
        isAvailable: true,
        description: '16 oz cup',
      },
      {
        id: 'opt-americano-size-large',
        name: 'Large',
        type: 'size' as DrinkOptionType,
        additionalCost: 0,
        isAvailable: true,
        description: '20 oz cup',
      },
      // Milk options - all FREE
      {
        id: 'opt-americano-milk-whole',
        name: 'Whole Milk',
        type: 'milk' as DrinkOptionType,
        additionalCost: 0,
        isAvailable: true,
        description: 'Creamy whole milk',
      },
      {
        id: 'opt-americano-milk-almond',
        name: 'Almond Milk',
        type: 'milk' as DrinkOptionType,
        additionalCost: 0,
        isAvailable: true,
        description: 'Smooth almond milk',
      },
      {
        id: 'opt-americano-milk-oat',
        name: 'Oat Milk',
        type: 'milk' as DrinkOptionType,
        additionalCost: 0,
        isAvailable: true,
        description: 'Rich oat milk',
      },
    ],
  },
  {
    id: 'drink-italiansoda-001',
    name: 'Sparkling Italian Soda',
    category: 'italian-soda' as DrinkCategory,
    basePrice: 0, // FREE
    description: 'Refreshing carbonated soda with fruity flavors and a splash of cream',
    isAvailable: true,
    options: [
      // Size options - all FREE
      {
        id: 'opt-italiansoda-size-small',
        name: 'Small',
        type: 'size' as DrinkOptionType,
        additionalCost: 0,
        isAvailable: true,
        description: '12 oz cup',
      },
      {
        id: 'opt-italiansoda-size-medium',
        name: 'Medium',
        type: 'size' as DrinkOptionType,
        additionalCost: 0,
        isAvailable: true,
        description: '16 oz cup',
      },
      {
        id: 'opt-italiansoda-size-large',
        name: 'Large',
        type: 'size' as DrinkOptionType,
        additionalCost: 0,
        isAvailable: true,
        description: '20 oz cup',
      },
      // Milk options - all FREE (cream option for Italian soda)
      {
        id: 'opt-italiansoda-milk-whole',
        name: 'Whole Milk',
        type: 'milk' as DrinkOptionType,
        additionalCost: 0,
        isAvailable: true,
        description: 'Creamy whole milk',
      },
      {
        id: 'opt-italiansoda-milk-almond',
        name: 'Almond Milk',
        type: 'milk' as DrinkOptionType,
        additionalCost: 0,
        isAvailable: true,
        description: 'Smooth almond milk',
      },
      {
        id: 'opt-italiansoda-milk-oat',
        name: 'Oat Milk',
        type: 'milk' as DrinkOptionType,
        additionalCost: 0,
        isAvailable: true,
        description: 'Rich oat milk',
      },
    ],
  },
];

/**
 * Default app settings seed data
 * 
 * Elder-friendly defaults:
 * - Large font size for readability
 * - Voice announcements enabled
 * - Haptic feedback for tactile confirmation
 * - High contrast disabled by default (can be enabled)
 * 
 * All configuration values sourced from APP_CONFIG to avoid duplication
 */
export const DEFAULT_SETTINGS_SEED: AppSettingsWithSchema = {
  version: APP_CONFIG.VERSION,
  schemaVersion: CURRENT_SCHEMA_VERSION,
  lastUpdated: new Date(),
  migrationHistory: [],
  
  userPreferences: {
    fontSize: APP_CONFIG.ACCESSIBILITY.DEFAULT_FONT_SIZE,
    highContrastMode: APP_CONFIG.ACCESSIBILITY.DEFAULT_HIGH_CONTRAST,
    voiceAnnouncements: APP_CONFIG.ACCESSIBILITY.DEFAULT_VOICE_ANNOUNCEMENTS,
    hapticFeedback: APP_CONFIG.ACCESSIBILITY.DEFAULT_HAPTIC_FEEDBACK,
  },
  
  cartConfig: {
    name: APP_CONFIG.CART.DEFAULT_NAME,
    isOpen: APP_CONFIG.CART.DEFAULT_OPEN_STATUS,
    menu: DEFAULT_DRINKS_SEED,
    defaultPrepTime: APP_CONFIG.ORDERS.DEFAULT_PREP_TIME_MINUTES,
    taxRate: APP_CONFIG.PRICING.DEFAULT_TAX_RATE,
    currencySymbol: APP_CONFIG.PRICING.CURRENCY_SYMBOL,
  },
};
