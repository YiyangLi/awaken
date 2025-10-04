// Export all storage-related functions and types
export { StorageService } from './StorageService';

export { 
  CURRENT_SCHEMA_VERSION,
  DEFAULT_DRINKS_SEED,
  DEFAULT_SETTINGS_SEED,
  type AppSettingsWithSchema,
  type MigrationRecord,
} from './schemas';

export { 
  MigrationService,
  seedInitialData,
  validateStoredData,
  type Migration,
  type MigrationResult,
} from './migrations';