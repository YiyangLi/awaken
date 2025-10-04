import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Order, Drink, AppSettings } from '../types';

/**
 * Storage keys for AsyncStorage
 * Prefixed with app namespace to prevent conflicts
 */
const STORAGE_KEYS = {
  ORDERS: '@awaken:orders',
  DRINKS: '@awaken:drinks',
  SETTINGS: '@awaken:settings',
} as const;

/**
 * Elder-friendly AsyncStorage wrapper service
 * 
 * Provides type-safe storage operations with comprehensive error handling.
 * All methods gracefully degrade without throwing errors to prevent app crashes.
 * Designed for offline-first coffee cart operations.
 */
class StorageServiceClass {
  /**
   * Save orders to AsyncStorage
   * 
   * @param orders - Array of orders to persist
   * @returns Promise that resolves when save completes (never rejects)
   */
  async saveOrders(orders: Order[]): Promise<void> {
    try {
      const jsonValue = JSON.stringify(orders);
      await AsyncStorage.setItem(STORAGE_KEYS.ORDERS, jsonValue);
    } catch (error) {
      // Elder-friendly: Log error but don't throw
      // App continues to function even if storage fails
      console.error('Failed to save orders to storage:', error);
    }
  }

  /**
   * Retrieve orders from AsyncStorage
   * 
   * @returns Promise resolving to array of orders (empty array on error/missing data)
   */
  async getOrders(): Promise<Order[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.ORDERS);
      
      if (jsonValue === null) {
        // No data stored yet - return empty array
        return [];
      }

      const orders = JSON.parse(jsonValue, this.dateReviver);
      return Array.isArray(orders) ? orders : [];
    } catch (error) {
      // Elder-friendly: Return empty array instead of throwing
      console.error('Failed to retrieve orders from storage:', error);
      return [];
    }
  }

  /**
   * Save drinks menu to AsyncStorage
   * 
   * @param drinks - Array of drinks to persist
   * @returns Promise that resolves when save completes (never rejects)
   */
  async saveDrinks(drinks: Drink[]): Promise<void> {
    try {
      const jsonValue = JSON.stringify(drinks);
      await AsyncStorage.setItem(STORAGE_KEYS.DRINKS, jsonValue);
    } catch (error) {
      // Elder-friendly: Log error but don't throw
      console.error('Failed to save drinks to storage:', error);
    }
  }

  /**
   * Retrieve drinks menu from AsyncStorage
   * 
   * @returns Promise resolving to array of drinks (empty array on error/missing data)
   */
  async getDrinks(): Promise<Drink[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.DRINKS);
      
      if (jsonValue === null) {
        // No data stored yet - return empty array
        return [];
      }

      const drinks = JSON.parse(jsonValue);
      return Array.isArray(drinks) ? drinks : [];
    } catch (error) {
      // Elder-friendly: Return empty array instead of throwing
      console.error('Failed to retrieve drinks from storage:', error);
      return [];
    }
  }

  /**
   * Save app settings to AsyncStorage
   * Automatically updates lastUpdated timestamp
   * 
   * @param settings - Application settings to persist
   * @returns Promise that resolves when save completes (never rejects)
   */
  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      // Auto-update lastUpdated timestamp for elder-friendly tracking
      const settingsWithTimestamp = {
        ...settings,
        lastUpdated: new Date(),
      };
      
      const jsonValue = JSON.stringify(settingsWithTimestamp);
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, jsonValue);
    } catch (error) {
      // Elder-friendly: Log error but don't throw
      console.error('Failed to save settings to storage:', error);
    }
  }

  /**
   * Retrieve app settings from AsyncStorage
   * 
   * @returns Promise resolving to settings object (null if not found or error)
   */
  async getSettings(): Promise<AppSettings | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      
      if (jsonValue === null) {
        // No settings stored yet
        return null;
      }

      const settings = JSON.parse(jsonValue, this.dateReviver);
      return settings;
    } catch (error) {
      // Elder-friendly: Return null instead of throwing
      console.error('Failed to retrieve settings from storage:', error);
      return null;
    }
  }

  /**
   * Clear all app data from AsyncStorage
   * Useful for reset/logout functionality
   * 
   * @returns Promise that resolves when clear completes (never rejects)
   */
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ORDERS,
        STORAGE_KEYS.DRINKS,
        STORAGE_KEYS.SETTINGS,
      ]);
    } catch (error) {
      // Elder-friendly: Log error but don't throw
      console.error('Failed to clear storage data:', error);
    }
  }

  /**
   * JSON.parse reviver function to handle Date deserialization
   * Converts ISO date strings back to Date objects
   * 
   * @param key - Property key
   * @param value - Property value
   * @returns Revived value (Date object for ISO date strings)
   */
  private dateReviver(key: string, value: unknown): unknown {
    // List of keys that should be Date objects based on our type definitions
    const dateKeys = [
      'createdAt',
      'updatedAt',
      'estimatedCompletionTime',
      'lastUpdated',
    ];

    if (typeof value === 'string' && dateKeys.includes(key)) {
      // Check if value is an ISO date string
      const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
      if (isoDateRegex.test(value)) {
        return new Date(value);
      }
    }

    return value;
  }
}

/**
 * Singleton instance for app-wide storage access
 * Elder-friendly: Single point of access prevents confusion
 */
export const StorageService = new StorageServiceClass();
