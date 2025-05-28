// Database test utilities
// This file is for testing purposes only and can be removed after verifying the fix

import { db, checkDatabaseHealth } from '@/lib/db';

export const testDatabase = async () => {
  console.log('Testing database schema and migration...');
  
  try {
    // Check if database opens successfully
    const isHealthy = await checkDatabaseHealth();
    if (!isHealthy) {
      console.error('Database health check failed');
      return false;
    }

    // Test prompt presets table
    console.log('Testing promptPresets table...');
    
    // Try to read existing presets
    const existingPresets = await db.promptPresets.toArray();
    console.log(`Found ${existingPresets.length} existing presets`);

    // Test adding a new preset
    const testPreset = {
      name: 'Test Preset',
      systemPrompt: 'You are a helpful test assistant.',
      createdAt: new Date(),
      lastUsedAt: new Date(),
    };

    const newId = await db.promptPresets.add(testPreset);
    console.log(`Successfully added test preset with ID: ${newId}`);

    // Test sorting by lastUsedAt
    const sortedPresets = await db.promptPresets.orderBy('lastUsedAt').reverse().toArray();
    console.log(`Successfully sorted ${sortedPresets.length} presets by lastUsedAt`);

    // Clean up test data
    await db.promptPresets.delete(newId);
    console.log('Cleaned up test preset');

    console.log('✅ Database test passed!');
    return true;
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return false;
  }
};

// Function to fix existing presets if needed
export const fixExistingPresets = async () => {
  console.log('Checking and fixing existing presets...');
  
  try {
    const allPresets = await db.promptPresets.toArray();
    let fixedCount = 0;

    for (const preset of allPresets) {
      if (!preset.lastUsedAt) {
        const fixedPreset = {
          ...preset,
          lastUsedAt: preset.createdAt || new Date(),
        };
        await db.promptPresets.update(preset.id!, { lastUsedAt: fixedPreset.lastUsedAt });
        fixedCount++;
      }
    }

    console.log(`Fixed ${fixedCount} presets with missing lastUsedAt field`);
    return true;
  } catch (error) {
    console.error('Failed to fix existing presets:', error);
    return false;
  }
}; 