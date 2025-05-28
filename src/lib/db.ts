import Dexie, { type Table } from 'dexie';
import type {
  AISettings,
  Role,
  Tag,
  Dialog,
  PromptPreset,
} from '@/types';

export class AppDB extends Dexie {
  // 'friends' is added by default in dexie documentation, but we don't need it.
  // We need to declare the stores (tables) and their types.
  aiSettings!: Table<AISettings, number>; // number is the type of the primary key (id)
  roles!: Table<Role, number>;
  tags!: Table<Tag, number>;
  dialogs!: Table<Dialog, number>;
  promptPresets!: Table<PromptPreset, number>;

  constructor() {
    super('OpenRouterDialogDB'); // Database name
    
    // Initial schema
    this.version(1).stores({
      // Primary key and indexed properties
      // ++id means auto-incrementing primary key
      // For other properties, just list them if they should be indexed
      aiSettings: '++id, name', // Auto-incrementing primary key 'id', index on 'name'
      roles: '++id, name', // Auto-incrementing primary key 'id', index on 'name'
      tags: '++id, name, isGeneral, roleId', // Auto-incrementing primary key 'id', indexes
      dialogs: '++id, lastUpdatedAt, name', // Auto-incrementing primary key 'id', index on 'lastUpdatedAt' and 'name'
      promptPresets: '++id, name, roleId', // Auto-incrementing primary key 'id', indexes
    });

    // Version 2: Add lastUsedAt index to promptPresets
    this.version(2).stores({
      aiSettings: '++id, name',
      roles: '++id, name',
      tags: '++id, name, isGeneral, roleId',
      dialogs: '++id, lastUpdatedAt, name',
      promptPresets: '++id, name, roleId, lastUsedAt', // Added lastUsedAt index
    }).upgrade(tx => {
      // Migration logic: Add lastUsedAt field to existing promptPresets if missing
      return tx.table('promptPresets').toCollection().modify(preset => {
        if (!preset.lastUsedAt) {
          preset.lastUsedAt = preset.createdAt || new Date();
        }
      });
    });
  }
}

export const db = new AppDB();

// Utility function to clear all data (useful for development/testing)
export const clearDatabase = async () => {
  await db.delete();
  await db.open();
};

// Utility function to check database version and handle migration issues
export const checkDatabaseHealth = async () => {
  try {
    await db.open();
    console.log('Database opened successfully, version:', db.verno);
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};

// Optional: Populate with some initial/default data if needed (example)
// db.on('populate', async () => {
//   await db.aiSettings.add({
//     name: 'Default OpenAI',
//     apiKey: 'YOUR_OPENAI_KEY_HERE_OR_LEAVE_BLANK',
//     model: 'gpt-3.5-turbo',
//     temperature: 0.7,
//   });
// });

// You can also add migration logic here if you change versions in the future.
// this.version(2).stores({...}).upgrade(tx => {...}); 