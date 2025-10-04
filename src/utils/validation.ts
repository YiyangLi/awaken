/**
 * Data Validation Utilities
 * 
 * Elder-friendly validation with clear, non-technical error messages.
 * Supports runtime type checking and data sanitization for the Awaken app.
 * 
 * @module validation
 */

import type {
  Drink,
  DrinkOption,
  DrinkCategory,
  DrinkOptionType,
  Order,
  OrderItem,
  OrderStatus,
} from '../types';

/**
 * Result of a validation operation
 * Contains success status and user-friendly error messages
 */
export interface ValidationResult {
  /** Whether validation passed */
  success: boolean;
  /** Array of elder-friendly error messages (empty if success is true) */
  errors: string[];
}

// ============================================================================
// Phone Number Validation and Sanitization
// ============================================================================

/**
 * Sanitizes a phone number by removing all non-numeric characters.
 * Supports multiple formats:
 * - (123) 456-7890
 * - 123-456-7890
 * - 123.456.7890
 * - 1234567890
 * 
 * @param phone - Raw phone number string (can be undefined or empty)
 * @returns Sanitized phone number containing only digits, or empty string if invalid
 * 
 * @example
 * sanitizePhoneNumber('(123) 456-7890') // Returns '1234567890'
 * sanitizePhoneNumber('123-456-7890')   // Returns '1234567890'
 * sanitizePhoneNumber('')                // Returns ''
 * sanitizePhoneNumber(undefined)         // Returns ''
 */
export function sanitizePhoneNumber(phone: string | undefined): string {
  if (!phone || typeof phone !== 'string') {
    return '';
  }
  
  // Remove all non-numeric characters
  const sanitized = phone.replace(/\D/g, '');
  
  return sanitized;
}

// ============================================================================
// Customer Information Validation
// ============================================================================

/**
 * Validates customer information with elder-friendly error messages.
 * 
 * Rules:
 * - Name: Required, 1-100 characters after trimming
 * - Phone: Optional (per LCC_2), but if provided must be valid format
 * 
 * @param name - Customer name
 * @param phone - Customer phone number (optional)
 * @returns ValidationResult with success status and error messages
 * 
 * @example
 * validateCustomerInfo('John Doe', '(123) 456-7890')
 * // Returns { success: true, errors: [] }
 * 
 * validateCustomerInfo('', '123-456-7890')
 * // Returns { success: false, errors: ['Customer name is required'] }
 * 
 * validateCustomerInfo('Jane', '')
 * // Returns { success: true, errors: [] } - phone is optional
 */
export function validateCustomerInfo(
  name: string,
  phone?: string
): ValidationResult {
  const errors: string[] = [];
  
  // Validate name
  if (!name || typeof name !== 'string') {
    errors.push('Customer name is required');
  } else {
    const trimmedName = name.trim();
    
    if (trimmedName.length === 0) {
      errors.push('Customer name is required');
    } else if (trimmedName.length > 100) {
      errors.push('Customer name must be 100 characters or less');
    }
  }
  
  // Validate phone (optional, but if provided, must have some digits)
  if (phone && typeof phone === 'string') {
    const sanitized = sanitizePhoneNumber(phone);
    
    // If user provided something, ensure it has at least some digits
    if (phone.trim().length > 0 && sanitized.length === 0) {
      errors.push('Phone number must contain at least one digit');
    }
  }
  
  return {
    success: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Price Validation
// ============================================================================

/**
 * Validates a price value (in cents).
 * 
 * Rules:
 * - Must be a number
 * - Must be a positive integer (no fractional cents)
 * - Must be between 0 and 100000 cents ($0 to $1,000)
 * 
 * @param price - Price in cents
 * @returns ValidationResult with success status and error messages
 * 
 * @example
 * validatePrice(500)     // Returns { success: true, errors: [] }
 * validatePrice(-100)    // Returns { success: false, errors: ['Price cannot be negative'] }
 * validatePrice(150000)  // Returns { success: false, errors: ['Price must be between $0 and $1,000'] }
 * validatePrice(12.5)    // Returns { success: false, errors: ['Price must be a whole number (no fractional cents)'] }
 */
export function validatePrice(price: number): ValidationResult {
  const errors: string[] = [];
  
  if (typeof price !== 'number' || isNaN(price)) {
    errors.push('Price must be a valid number');
    return { success: false, errors };
  }
  
  // Check if it's an integer (no fractional cents)
  if (!Number.isInteger(price)) {
    errors.push('Price must be a whole number (no fractional cents)');
  }
  
  // Check if it's positive
  if (price < 0) {
    errors.push('Price cannot be negative');
  }
  
  // Check range: 0 to 100000 cents ($0 to $1,000)
  if (price > 100000) {
    errors.push('Price must be between $0 and $1,000');
  }
  
  return {
    success: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Date Validation
// ============================================================================

/**
 * Validates a Date object.
 * 
 * Rules:
 * - Must be a valid Date object (not Invalid Date)
 * - Must be within reasonable range (2020-2030)
 * 
 * @param date - Date object to validate
 * @returns ValidationResult with success status and error messages
 * 
 * @example
 * validateDate(new Date())                    // Returns { success: true, errors: [] }
 * validateDate(new Date('invalid'))           // Returns { success: false, errors: ['Order date is invalid'] }
 * validateDate(new Date('1990-01-01'))        // Returns { success: false, errors: ['Order date must be between 2020 and 2030'] }
 */
export function validateDate(date: Date): ValidationResult {
  const errors: string[] = [];
  
  // Check if it's a Date object
  if (!(date instanceof Date)) {
    errors.push('Order date is invalid');
    return { success: false, errors };
  }
  
  // Check if it's a valid date (not Invalid Date)
  if (isNaN(date.getTime())) {
    errors.push('Order date is invalid');
    return { success: false, errors };
  }
  
  // Check reasonable range: 2020-2030
  const year = date.getFullYear();
  if (year < 2020 || year > 2030) {
    errors.push('Order date must be between 2020 and 2030');
  }
  
  return {
    success: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Type Guard Functions (Runtime Type Validation)
// ============================================================================

/**
 * Type guard to validate if an object is a valid DrinkOption.
 * Uses TypeScript `is` predicate for compile-time type narrowing.
 * 
 * @param option - Object to validate
 * @returns True if object is a valid DrinkOption
 * 
 * @example
 * if (validateDrinkOption(data)) {
 *   // TypeScript knows data is DrinkOption here
 *   console.log(data.name);
 * }
 */
export function validateDrinkOption(option: unknown): option is DrinkOption {
  if (!option || typeof option !== 'object') {
    return false;
  }
  
  const opt = option as Record<string, unknown>;
  
  // Check required fields
  if (typeof opt['id'] !== 'string') {
    return false;
  }
  if (typeof opt['name'] !== 'string') {
    return false;
  }
  if (typeof opt['additionalCost'] !== 'number') {
    return false;
  }
  if (!isValidDrinkOptionType(opt['type'])) {
    return false;
  }
  if (typeof opt['isAvailable'] !== 'boolean') {
    return false;
  }
  
  // Validate price
  const priceResult = validatePrice(opt['additionalCost'] as number);
  if (!priceResult.success) {
    return false;
  }
  
  // Check optional fields
  if (opt['description'] !== undefined && typeof opt['description'] !== 'string') {
    return false;
  }
  
  return true;
}

/**
 * Type guard to validate if an object is a valid Drink.
 * Uses TypeScript `is` predicate for compile-time type narrowing.
 * 
 * @param drink - Object to validate
 * @returns True if object is a valid Drink
 * 
 * @example
 * if (validateDrink(data)) {
 *   // TypeScript knows data is Drink here
 *   console.log(drink.name);
 * }
 */
export function validateDrink(drink: unknown): drink is Drink {
  if (!drink || typeof drink !== 'object') {
    return false;
  }
  
  const d = drink as Record<string, unknown>;
  
  // Check required fields
  if (typeof d['id'] !== 'string') {
    return false;
  }
  if (typeof d['name'] !== 'string') {
    return false;
  }
  if (!isValidDrinkCategory(d['category'])) {
    return false;
  }
  if (typeof d['basePrice'] !== 'number') {
    return false;
  }
  if (!Array.isArray(d['options'])) {
    return false;
  }
  if (typeof d['isAvailable'] !== 'boolean') {
    return false;
  }
  
  // Validate price
  const priceResult = validatePrice(d['basePrice'] as number);
  if (!priceResult.success) {
    return false;
  }
  
  // Validate all options
  for (const option of d['options']) {
    if (!validateDrinkOption(option)) {
      return false;
    }
  }
  
  // Check optional fields
  if (d['description'] !== undefined && typeof d['description'] !== 'string') {
    return false;
  }
  if (d['imageUrl'] !== undefined && typeof d['imageUrl'] !== 'string') {
    return false;
  }
  
  return true;
}

/**
 * Type guard to validate if an object is a valid OrderItem.
 * Uses TypeScript `is` predicate for compile-time type narrowing.
 * 
 * @param item - Object to validate
 * @returns True if object is a valid OrderItem
 * 
 * @example
 * if (validateOrderItem(data)) {
 *   // TypeScript knows data is OrderItem here
 *   console.log(item.drinkName);
 * }
 */
export function validateOrderItem(item: unknown): item is OrderItem {
  if (!item || typeof item !== 'object') {
    return false;
  }
  
  const i = item as Record<string, unknown>;
  
  // Check required fields
  if (typeof i['id'] !== 'string') {
    return false;
  }
  if (typeof i['drinkId'] !== 'string') {
    return false;
  }
  if (typeof i['drinkName'] !== 'string') {
    return false;
  }
  if (typeof i['quantity'] !== 'number') {
    return false;
  }
  if (!Array.isArray(i['selectedOptions'])) {
    return false;
  }
  if (typeof i['totalPrice'] !== 'number') {
    return false;
  }
  
  // Validate quantity
  if (!Number.isInteger(i['quantity'] as number) || (i['quantity'] as number) < 1) {
    return false;
  }
  
  // Validate price
  const priceResult = validatePrice(i['totalPrice'] as number);
  if (!priceResult.success) {
    return false;
  }
  
  // Validate all selected options
  for (const option of i['selectedOptions']) {
    if (!validateDrinkOption(option)) {
      return false;
    }
  }
  
  // Check optional fields
  if (i['notes'] !== undefined && typeof i['notes'] !== 'string') {
    return false;
  }
  
  return true;
}

/**
 * Type guard to validate if an object is a valid Order.
 * Uses TypeScript `is` predicate for compile-time type narrowing.
 * 
 * @param order - Object to validate
 * @returns True if object is a valid Order
 * 
 * @example
 * if (validateOrder(data)) {
 *   // TypeScript knows data is Order here
 *   console.log(order.customerName);
 * }
 */
export function validateOrder(order: unknown): order is Order {
  if (!order || typeof order !== 'object') {
    return false;
  }
  
  const o = order as Record<string, unknown>;
  
  // Check required fields
  if (typeof o['id'] !== 'string') {
    return false;
  }
  if (typeof o['customerName'] !== 'string') {
    return false;
  }
  if (!Array.isArray(o['items'])) {
    return false;
  }
  if (typeof o['totalAmount'] !== 'number') {
    return false;
  }
  if (!isValidOrderStatus(o['status'])) {
    return false;
  }
  if (!(o['createdAt'] instanceof Date)) {
    return false;
  }
  if (!(o['updatedAt'] instanceof Date)) {
    return false;
  }
  
  // Validate customer name
  const nameResult = validateCustomerInfo(
    o['customerName'] as string,
    o['customerPhone'] as string | undefined
  );
  if (!nameResult.success) {
    return false;
  }
  
  // Validate phone (optional)
  if (o['customerPhone'] !== undefined && typeof o['customerPhone'] !== 'string') {
    return false;
  }
  
  // Validate items array (must have at least one item)
  if (o['items'].length === 0) {
    return false;
  }
  
  for (const item of o['items']) {
    if (!validateOrderItem(item)) {
      return false;
    }
  }
  
  // Validate price
  const priceResult = validatePrice(o['totalAmount'] as number);
  if (!priceResult.success) {
    return false;
  }
  
  // Validate dates
  const createdAtResult = validateDate(o['createdAt'] as Date);
  if (!createdAtResult.success) {
    return false;
  }
  
  const updatedAtResult = validateDate(o['updatedAt'] as Date);
  if (!updatedAtResult.success) {
    return false;
  }
  
  // Check optional fields
  if (o['assignedBarista'] !== undefined && typeof o['assignedBarista'] !== 'string') {
    return false;
  }
  if (o['notes'] !== undefined && typeof o['notes'] !== 'string') {
    return false;
  }
  if (o['estimatedCompletionTime'] !== undefined) {
    if (!(o['estimatedCompletionTime'] instanceof Date)) {
      return false;
    }
    const estimatedResult = validateDate(o['estimatedCompletionTime']);
    if (!estimatedResult.success) {
      return false;
    }
  }
  
  return true;
}

// ============================================================================
// Helper Functions (Enum Validation)
// ============================================================================

/**
 * Validates if a value is a valid DrinkCategory enum value.
 * 
 * @param value - Value to check
 * @returns True if value is a valid DrinkCategory
 */
function isValidDrinkCategory(value: unknown): value is DrinkCategory {
  const validCategories = [
    'mocha',
    'chai-latte',
    'latte',
    'hot-chocolate',
    'americano',
    'italian-soda',
  ];
  
  return typeof value === 'string' && validCategories.includes(value);
}

/**
 * Validates if a value is a valid DrinkOptionType enum value.
 * 
 * @param value - Value to check
 * @returns True if value is a valid DrinkOptionType
 */
function isValidDrinkOptionType(value: unknown): value is DrinkOptionType {
  const validTypes = ['size', 'milk', 'extras'];
  
  return typeof value === 'string' && validTypes.includes(value);
}

/**
 * Validates if a value is a valid OrderStatus enum value.
 * 
 * @param value - Value to check
 * @returns True if value is a valid OrderStatus
 */
function isValidOrderStatus(value: unknown): value is OrderStatus {
  const validStatuses = ['pending', 'in-progress', 'ready', 'completed', 'cancelled'];
  
  return typeof value === 'string' && validStatuses.includes(value);
}
