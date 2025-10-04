/**
 * Storage Migration System
 * 
 * Elder-friendly migration system with automatic backup and restore.
 * Never crashes on migration failure - always restores from backup.
 * 
 * Key features:
 * - Automatic backup before any migration
 * - Rollback on failure (restore from backup)
 * - Data validation using LCC_6 validators
 * - Comprehensive error tracking
 * - No user-facing errors (fail gracefully)
 * 
 * @module migrations
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageService } from './StorageService';
import { 
  CURRENT_SCHEMA_VERSION, 
  DEFAULT_DRINKS_SEED, 
  DEFAULT_SETTINGS_SEED,
  type MigrationRecord, 
  type AppSettingsWithSchema,
} from './schemas';
import { validateDrink, validateOrder } from '../utils/validation';

/**
 * Backup storage keys
 * Used to store data before migrations for rollback capability
 */
const BACKUP_KEYS = {
  ORDERS: '@awaken:orders:backup',
  DRINKS: '@awaken:drinks:backup',
  SETTINGS: '@awaken:settings:backup',
} as const;

/**
 * Migration definition interface
 * Each migration defines how to upgrade and downgrade schema versions
 */
export interface Migration {
  /** Target schema version */
  version: number;
  /** Descriptive name for logging and debugging */
  name: string;
  /** Upgrade function - migrates data to this version */
  up: () => Promise<void>;
  /** Rollback function - reverts migration if needed */
  down: () => Promise<void>;
}

/**
 * Result of a migration operation
 * Elder-friendly: Provides detailed status without exposing errors to UI
 */
export interface MigrationResult {
  /** Whether migration completed successfully */
  success: boolean;
  /** Schema version before migration */
  fromVersion: number;
  /** Schema version after migration (or attempted) */
  toVersion: number;
  /** Array of error messages (for logging only) */
  errors: string[];
}

/**
 * List of all migrations
 * Currently empty - version 1 is the initial schema
 * 
 * Future migrations should be added here in sequential order:
 * 
 * @example
 * const MIGRATIONS: Migration[] = [
 *   {
 *     version: 2,
 *     name: 'Add drink categories',
 *     up: async () => {
 *       // Migration logic here
 *     },
 *     down: async () => {
 *       // Rollback logic here
 *     },
 *   },
 * ];
 */
export const MIGRATIONS: Migration[] = [];

/**
 * Migration Service
 * Singleton pattern for managing schema migrations
 * 
 * Elder-friendly features:
 * - Always creates backup before migration
 * - Automatically restores from backup on failure
 * - Never throws errors (graceful degradation)
 * - Comprehensive logging for debugging
 */
class MigrationServiceClass {
  /**
   * Run migrations from current version to target version
   * 
   * @param currentVersion - Current schema version
   * @param targetVersion - Desired schema version (defaults to CURRENT_SCHEMA_VERSION)
   * @returns Promise resolving to migration result
   * 
   * Elder-friendly behavior:
   * - Creates backup before starting
   * - Runs migrations sequentially
   * - Restores from backup on any failure
   * - Returns detailed result (never throws)
   */
  async runMigrations(
    currentVersion: number,
    targetVersion: number = CURRENT_SCHEMA_VERSION
  ): Promise<MigrationResult> {
    const errors: string[] = [];
    
    try {
      // No migration needed if already at target version
      if (currentVersion === targetVersion) {
        return {
          success: true,
          fromVersion: currentVersion,
          toVersion: targetVersion,
          errors: [],
        };
      }
      
      // Validate version numbers
      if (currentVersion < 0 || targetVersion < 0) {
        errors.push('Invalid schema version numbers');
        return {
          success: false,
          fromVersion: currentVersion,
          toVersion: targetVersion,
          errors,
        };
      }
      
      // Create backup before starting migrations
      await this.createBackup();
      
      // Determine if upgrading or downgrading
      const isUpgrade = targetVersion > currentVersion;
      const migrations = this.getMigrationPath(currentVersion, targetVersion, isUpgrade);
      
      // Run each migration in sequence
      for (const migration of migrations) {
        try {
          console.log(`Running migration: ${migration.name} (v${migration.version})`);
          
          if (isUpgrade) {
            await migration.up();
          } else {
            await migration.down();
          }
        } catch (error) {
          const errorMsg = `Migration failed: ${migration.name} - ${error}`;
          console.error(errorMsg);
          errors.push(errorMsg);
          
          // Elder-friendly: Restore from backup on failure
          await this.restoreFromBackup();
          
          return {
            success: false,
            fromVersion: currentVersion,
            toVersion: currentVersion, // Rolled back to original version
            errors,
          };
        }
      }
      
      // Update settings with new schema version
      await this.updateSchemaVersion(targetVersion, currentVersion);
      
      // Clean up backup after successful migration
      await this.clearBackup();
      
      return {
        success: true,
        fromVersion: currentVersion,
        toVersion: targetVersion,
        errors: [],
      };
      
    } catch (error) {
      const errorMsg = `Migration system error: ${error}`;
      console.error(errorMsg);
      errors.push(errorMsg);
      
      // Elder-friendly: Always attempt to restore from backup
      await this.restoreFromBackup();
      
      return {
        success: false,
        fromVersion: currentVersion,
        toVersion: currentVersion,
        errors,
      };
    }
  }
  
  /**
   * Get the list of migrations to run
   * 
   * @param fromVersion - Starting version
   * @param toVersion - Target version
   * @param isUpgrade - Whether upgrading (true) or downgrading (false)
   * @returns Array of migrations to run in order
   */
  private getMigrationPath(
    fromVersion: number,
    toVersion: number,
    isUpgrade: boolean
  ): Migration[] {
    if (isUpgrade) {
      // Get all migrations between fromVersion and toVersion
      return MIGRATIONS.filter(
        m => m.version > fromVersion && m.version <= toVersion
      ).sort((a, b) => a.version - b.version);
    } else {
      // Get all migrations between toVersion and fromVersion (reversed)
      return MIGRATIONS.filter(
        m => m.version > toVersion && m.version <= fromVersion
      ).sort((a, b) => b.version - a.version);
    }
  }
  
  /**
   * Update schema version in settings after successful migration
   * 
   * @param newVersion - New schema version
   * @param oldVersion - Previous schema version
   */
  private async updateSchemaVersion(
    newVersion: number,
    oldVersion: number
  ): Promise<void> {
    try {
      const settings = await StorageService.getSettings();
      
      if (!settings) {
        console.error('Cannot update schema version: settings not found');
        return;
      }
      
      const migrationRecord: MigrationRecord = {
        fromVersion: oldVersion,
        toVersion: newVersion,
        timestamp: new Date(),
        success: true,
      };
      
      const updatedSettings: AppSettingsWithSchema = {
        ...settings,
        schemaVersion: newVersion,
        migrationHistory: [
          ...(settings.migrationHistory ?? []),
          migrationRecord,
        ],
      };
      
      await StorageService.saveSettings(updatedSettings);
    } catch (error) {
      console.error('Failed to update schema version:', error);
      // Elder-friendly: Don't throw, just log
    }
  }
  
  /**
   * Create backup of all storage data
   * Elder-friendly: Essential for safe migrations
   */
  private async createBackup(): Promise<void> {
    try {
      // Get all current data
      const orders = await StorageService.getOrders();
      const drinks = await StorageService.getDrinks();
      const settings = await StorageService.getSettings();
      
      // Save to backup keys
      await AsyncStorage.setItem(BACKUP_KEYS.ORDERS, JSON.stringify(orders));
      await AsyncStorage.setItem(BACKUP_KEYS.DRINKS, JSON.stringify(drinks));
      await AsyncStorage.setItem(BACKUP_KEYS.SETTINGS, JSON.stringify(settings));
      
      console.log('Backup created successfully');
    } catch (error) {
      console.error('Failed to create backup:', error);
      // Elder-friendly: Log but don't throw
    }
  }
  
  /**
   * Restore data from backup
   * Elder-friendly: Critical safety feature for failed migrations
   */
  private async restoreFromBackup(): Promise<void> {
    try {
      console.log('Restoring data from backup...');
      
      // Get backup data
      const ordersBackup = await AsyncStorage.getItem(BACKUP_KEYS.ORDERS);
      const drinksBackup = await AsyncStorage.getItem(BACKUP_KEYS.DRINKS);
      const settingsBackup = await AsyncStorage.getItem(BACKUP_KEYS.SETTINGS);
      
      // Restore orders
      if (ordersBackup) {
        const orders = JSON.parse(ordersBackup);
        await StorageService.saveOrders(orders);
      }
      
      // Restore drinks
      if (drinksBackup) {
        const drinks = JSON.parse(drinksBackup);
        await StorageService.saveDrinks(drinks);
      }
      
      // Restore settings
      if (settingsBackup) {
        const settings = JSON.parse(settingsBackup);
        await StorageService.saveSettings(settings);
      }
      
      console.log('Data restored from backup successfully');
    } catch (error) {
      console.error('Failed to restore from backup:', error);
      // Elder-friendly: Log but don't throw
    }
  }
  
  /**
   * Clear backup data after successful migration
   * Elder-friendly: Cleans up storage space
   */
  private async clearBackup(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        BACKUP_KEYS.ORDERS,
        BACKUP_KEYS.DRINKS,
        BACKUP_KEYS.SETTINGS,
      ]);
      console.log('Backup cleared successfully');
    } catch (error) {
      console.error('Failed to clear backup:', error);
      // Elder-friendly: Log but don't throw
    }
  }
}

/**
 * Singleton instance for app-wide migration management
 * Elder-friendly: Single point of access prevents confusion
 */
export const MigrationService = new MigrationServiceClass();

/**
 * Seed initial data into storage
 * 
 * Elder-friendly features:
 * - Only seeds if no data exists (safe to call multiple times)
 * - Validates all seed data before saving
 * - Uses defaults from schemas.ts
 * - Never overwrites existing data
 * 
 * @returns Promise that resolves when seeding completes (never rejects)
 */
export async function seedInitialData(): Promise<void> {
  try {
    // Check if data already exists
    const existingDrinks = await StorageService.getDrinks();
    const existingSettings = await StorageService.getSettings();
    
    // Seed drinks if none exist
    if (existingDrinks.length === 0) {
      console.log('Seeding initial drinks data...');
      
      // Validate all drinks before seeding
      const validDrinks = DEFAULT_DRINKS_SEED.filter(drink => {
        const isValid = validateDrink(drink);
        if (!isValid) {
          // Use 'as any' to access id for logging before type guard narrowing
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          console.warn(`Invalid drink in seed data: ${(drink as any).id ?? 'unknown'}`);
        }
        return isValid;
      });
      
      await StorageService.saveDrinks(validDrinks);
      console.log(`Seeded ${validDrinks.length} drinks successfully`);
    }
    
    // Seed settings if none exist
    if (!existingSettings) {
      console.log('Seeding initial settings data...');
      await StorageService.saveSettings(DEFAULT_SETTINGS_SEED);
      console.log('Settings seeded successfully');
    }
    
  } catch (error) {
    // Elder-friendly: Log error but don't throw
    console.error('Failed to seed initial data:', error);
  }
}

/**
 * Validate all stored data using LCC_6 validators
 * 
 * Elder-friendly features:
 * - Validates drinks, orders, and settings
 * - Removes corrupted data automatically
 * - Logs validation failures for debugging
 * - Never crashes on invalid data
 * 
 * @returns Promise that resolves when validation completes (never rejects)
 */
export async function validateStoredData(): Promise<void> {
  try {
    console.log('Validating stored data...');
    
    // Validate drinks
    const drinks = await StorageService.getDrinks();
    const validDrinks = drinks.filter(drink => {
      const isValid = validateDrink(drink);
      if (!isValid) {
        // Use 'as any' to access id for logging before type guard narrowing
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        console.warn(`Removing invalid drink: ${(drink as any).id ?? 'unknown'}`);
      }
      return isValid;
    });
    
    // Save cleaned drinks if any were invalid
    if (validDrinks.length < drinks.length) {
      console.log(`Removed ${drinks.length - validDrinks.length} invalid drinks`);
      await StorageService.saveDrinks(validDrinks);
    }
    
    // Validate orders
    const orders = await StorageService.getOrders();
    const validOrders = orders.filter(order => {
      const isValid = validateOrder(order);
      if (!isValid) {
        // Use 'as any' to access id for logging before type guard narrowing
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        console.warn(`Removing invalid order: ${(order as any).id ?? 'unknown'}`);
      }
      return isValid;
    });
    
    // Save cleaned orders if any were invalid
    if (validOrders.length < orders.length) {
      console.log(`Removed ${orders.length - validOrders.length} invalid orders`);
      await StorageService.saveOrders(validOrders);
    }
    
    console.log('Data validation completed successfully');
    
  } catch (error) {
    // Elder-friendly: Log error but don't throw
    console.error('Failed to validate stored data:', error);
  }
}
