// Export all TypeScript types and interfaces

/**
 * Coffee drink categories aligned with roadmap requirements
 * Using meaningful string values for screen reader accessibility
 */
export enum DrinkCategory {
  MOCHA = 'mocha',
  CHAI_LATTE = 'chai-latte',
  LATTE = 'latte',
  HOT_CHOCOLATE = 'hot-chocolate',
  AMERICANO = 'americano',
  ITALIAN_SODA = 'italian-soda',
}

/**
 * Order status tracking for coffee cart workflow
 * Descriptive values for accessibility and screen readers
 */
export enum OrderStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  READY = 'ready',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

/**
 * Types of drink customization options
 * Clear categorization for elder-friendly interface organization
 */
export enum DrinkOptionType {
  SIZE = 'size',
  MILK = 'milk',
  EXTRAS = 'extras',
}

/**
 * Customization option for drinks
 * Includes accessibility considerations for option selection
 */
export interface DrinkOption {
  /** Unique identifier for the option */
  id: string;
  /** Human-readable option name (accessible to screen readers) */
  name: string;
  /** Additional cost for this option (in cents for precise calculation) */
  additionalCost: number;
  /** Category of option for UI organization */
  type: DrinkOptionType;
  /** Whether this option is currently available */
  isAvailable: boolean;
  /** Optional description for accessibility context */
  description?: string;
}

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
  /** Whether the drink is currently available for ordering */
  isAvailable: boolean;
  /** Optional description for accessibility and elder users */
  description?: string;
  /** Optional image URL for visual identification */
  imageUrl?: string;
}

/**
 * Individual item in an order with selected customizations
 * Tracks all modifications for accurate pricing and preparation
 */
export interface OrderItem {
  /** Unique identifier for this order item */
  id: string;
  /** Reference to the base drink */
  drinkId: string;
  /** Display name (denormalized for offline access) */
  drinkName: string;
  /** Quantity of this drink ordered */
  quantity: number;
  /** Selected customization options */
  selectedOptions: DrinkOption[];
  /** Total price for this item including options (in cents) */
  totalPrice: number;
  /** Optional special instructions for preparation */
  notes?: string;
}

/**
 * Complete order interface
 * Supports offline-first architecture and elder-friendly workflow
 */
export interface Order {
  /** Unique identifier for the order */
  id: string;
  /** Customer's name for order identification */
  customerName: string;
  /** Optional phone number (made optional for elder-friendly simplicity) */
  customerPhone?: string;
  /** All items in the order */
  items: OrderItem[];
  /** Total amount for the entire order (in cents) */
  totalAmount: number;
  /** Current status of the order */
  status: OrderStatus;
  /** When the order was created */
  createdAt: Date;
  /** Optional barista assigned to prepare the order */
  assignedBarista?: string;
  /** Optional notes for the entire order */
  notes?: string;
  /** When the order was last updated */
  updatedAt: Date;
  /** Estimated completion time for customer information */
  estimatedCompletionTime?: Date;
}

/**
 * Configuration for the coffee cart
 * Supports offline operation and elder-friendly customization
 */
export interface CoffeeCartConfig {
  /** Cart/shop name for display */
  name: string;
  /** Whether the cart is currently accepting orders */
  isOpen: boolean;
  /** Available drinks menu */
  menu: Drink[];
  /** Default preparation time in minutes */
  defaultPrepTime: number;
  /** Tax rate for order calculation */
  taxRate: number;
  /** Currency symbol for display */
  currencySymbol: string;
}

/**
 * User preferences for accessibility and elder-friendly customization
 */
export interface UserPreferences {
  /** Font size preference for better readability */
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  /** High contrast mode for visual accessibility */
  highContrastMode: boolean;
  /** Theme preference for visual customization */
  theme?: 'DEFAULT' | 'DARK' | 'HIGH_CONTRAST' | 'LARGE_TEXT';
  /** Preferred payment method for quick checkout */
  preferredPaymentMethod?: string;
  /** Voice announcements for order status updates */
  voiceAnnouncements: boolean;
  /** Haptic feedback for button presses */
  hapticFeedback: boolean;
  /** Admin session status for route protection */
  isAdminSession?: boolean;
}

/**
 * Syrup availability status
 */
export type SyrupStatus = 'available' | 'soldOut';

/**
 * Syrup interface for inventory management
 * Supports availability tracking and elder-friendly admin interface
 */
export interface Syrup {
  /** Unique identifier for the syrup */
  id: string;
  /** Display name (e.g., "Vanilla", "Caramel") */
  name: string;
  /** Current availability status */
  status: SyrupStatus;
  /** When syrup was added to system */
  createdAt: Date;
  /** Last status change timestamp */
  updatedAt: Date;
}

/**
 * Label format for Brother P-touch printer
 * Label size: 2.4" × 1.1"
 */
export interface LabelFormat {
  /** Line 1: Customer name (Font 18, max 20 chars) */
  line1: string;
  /** Line 2: Drink summary (Font 12, max 30 chars) */
  line2: string;
}

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
 * Application settings combining user preferences and cart configuration
 * Designed for comprehensive elder-friendly app persistence
 */
export interface AppSettings {
  /** User accessibility and preference settings */
  userPreferences: UserPreferences;
  /** Coffee cart operational configuration */
  cartConfig: CoffeeCartConfig;
  /** App version for migration compatibility */
  version: string;
  /** Last updated timestamp for sync tracking */
  lastUpdated: Date;
  /** Current schema version of stored data (optional for backward compatibility) */
  schemaVersion?: number;
  /** History of all schema migrations performed (optional for backward compatibility) */
  migrationHistory?: MigrationRecord[];
}

export type { UserStackParamList, AdminStackParamList, RootStackParamList } from './navigation';