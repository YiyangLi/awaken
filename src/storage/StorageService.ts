import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Order, Drink, AppSettings, Syrup, SyrupStatus } from '../types';

/**
 * Storage keys for AsyncStorage
 * Prefixed with app namespace to prevent conflicts
 */
const STORAGE_KEYS = {
  ORDERS: '@awaken:orders',
  DRINKS: '@awaken:drinks',
  SETTINGS: '@awaken:settings',
  SYRUPS: '@awaken:syrups',
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
        STORAGE_KEYS.SYRUPS,
      ]);
    } catch (error) {
      // Elder-friendly: Log error but don't throw
      console.error('Failed to clear storage data:', error);
    }
  }

  /**
   * Retrieve syrups from AsyncStorage
   *
   * @returns Promise resolving to array of syrups (empty array on error/missing data)
   */
  async getSyrups(): Promise<Syrup[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.SYRUPS);

      if (jsonValue === null) {
        // No data stored yet - return empty array
        return [];
      }

      const parsed = JSON.parse(jsonValue, this.dateReviver);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      // Elder-friendly: Return empty array instead of throwing
      console.error('Failed to retrieve syrups from storage:', error);
      return [];
    }
  }

  /**
   * Save syrups to AsyncStorage
   *
   * @param syrups - Array of syrups to persist
   * @returns Promise that resolves when save completes (never rejects)
   */
  async saveSyrups(syrups: Syrup[]): Promise<void> {
    try {
      const jsonValue = JSON.stringify(syrups);
      await AsyncStorage.setItem(STORAGE_KEYS.SYRUPS, jsonValue);
    } catch (error) {
      // Elder-friendly: Log error but don't throw
      console.error('Failed to save syrups to storage:', error);
    }
  }

  /**
   * Add a new syrup to storage
   *
   * @param syrup - Syrup data without id, createdAt, updatedAt
   * @returns Promise resolving to the created syrup with generated fields
   * @throws Error if syrup name already exists (case-insensitive)
   */
  async addSyrup(syrup: Omit<Syrup, 'id' | 'createdAt' | 'updatedAt'>): Promise<Syrup> {
    const syrups = await this.getSyrups();

    // Check for duplicate names (case-insensitive)
    const duplicate = syrups.find(
      s => s.name.toLowerCase() === syrup.name.toLowerCase()
    );
    if (duplicate) {
      throw new Error(`Syrup "${syrup.name}" already exists`);
    }

    const newSyrup: Syrup = {
      ...syrup,
      id: `syrup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.saveSyrups([...syrups, newSyrup]);
    return newSyrup;
  }

  /**
   * Update syrup status (available/soldOut)
   *
   * @param id - Syrup ID to update
   * @param status - New status
   * @returns Promise that resolves when update completes
   */
  async updateSyrupStatus(id: string, status: SyrupStatus): Promise<void> {
    const syrups = await this.getSyrups();
    const updated = syrups.map(s =>
      s.id === id
        ? { ...s, status, updatedAt: new Date() }
        : s
    );
    await this.saveSyrups(updated);
  }

  /**
   * Delete syrup from storage
   *
   * @param id - Syrup ID to delete
   * @returns Promise that resolves when deletion completes
   */
  async deleteSyrup(id: string): Promise<void> {
    const syrups = await this.getSyrups();
    const filtered = syrups.filter(s => s.id !== id);
    await this.saveSyrups(filtered);
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

  /**
   * Get a single setting value
   * Used for storing printer IP address and other app settings
   *
   * @param key - Setting key (e.g., 'printerIP')
   * @returns Promise resolving to setting value or null if not found
   */
  async getSetting(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(`@awaken:settings:${key}`);
    } catch (error) {
      console.error(`Failed to get setting ${key}:`, error);
      return null;
    }
  }

  /**
   * Save a single setting value
   * Used for storing printer IP address and other app settings
   *
   * @param key - Setting key (e.g., 'printerIP')
   * @param value - Setting value
   * @returns Promise that resolves when save completes
   * @throws Error if save fails
   */
  async saveSetting(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(`@awaken:settings:${key}`, value);
    } catch (error) {
      console.error(`Failed to save setting ${key}:`, error);
      throw error;
    }
  }
}

/**
 * Singleton instance for app-wide storage access
 * Elder-friendly: Single point of access prevents confusion
 */
export const StorageService = new StorageServiceClass();
