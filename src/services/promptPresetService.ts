import { db } from '@/lib/db';
import type { PromptPreset } from '@/types';

/**
 * Saves or updates a Prompt Preset.
 * If presetData.id is provided, it updates. Otherwise, it creates a new preset.
 * @param presetData - The preset data.
 * @returns The id of the saved/updated preset.
 */
export const savePromptPreset = async (
  presetData: Omit<PromptPreset, 'id' | 'createdAt' | 'lastUsedAt'> & { id?: number }
): Promise<number> => {
  const now = new Date();
  
  if (presetData.id) {
    // Update existing preset - don't modify createdAt
    const updatePayload = {
      name: presetData.name,
      systemPrompt: presetData.systemPrompt,
      roleId: presetData.roleId,
      tagIds: presetData.tagIds,
      lastUsedAt: now, // Always update lastUsedAt on save/update
    };
    await db.promptPresets.update(presetData.id, updatePayload);
    return presetData.id;
  } else {
    // Create new preset, Dexie will auto-generate 'id'
    const dataToSave: Omit<PromptPreset, 'id'> = {
      name: presetData.name,
      systemPrompt: presetData.systemPrompt,
      roleId: presetData.roleId,
      tagIds: presetData.tagIds,
      createdAt: now,
      lastUsedAt: now,
    };
    return db.promptPresets.add(dataToSave);
  }
};

/**
 * Retrieves a specific prompt preset by its ID.
 * @param id - The ID of the preset to retrieve.
 * @returns The preset object or undefined if not found.
 */
export const getPromptPreset = async (id: number): Promise<PromptPreset | undefined> => {
  return db.promptPresets.get(id);
};

/**
 * Retrieves all prompt presets, optionally sorted.
 * @param sortBy - Field to sort by (e.g., 'name', 'createdAt', 'lastUsedAt'). Defaults to 'lastUsedAt'.
 * @param order - Sort order ('asc' or 'desc'). Defaults to 'desc'.
 * @returns A promise that resolves to an array of presets.
 */
export const getAllPromptPresets = async (
  sortBy: keyof PromptPreset = 'lastUsedAt',
  order: 'asc' | 'desc' = 'desc'
): Promise<PromptPreset[]> => {
  try {
    // Try to sort by the requested field
    let query = db.promptPresets.orderBy(sortBy);
    if (order === 'desc') {
      query = query.reverse();
    }
    return query.toArray();
  } catch (error) {
    console.warn(`Failed to sort by ${sortBy}, falling back to sorting by name:`, error);
    // Fallback to sorting by name if the requested field fails
    let fallbackQuery = db.promptPresets.orderBy('name');
    if (order === 'desc') {
      fallbackQuery = fallbackQuery.reverse();
    }
    const presets = await fallbackQuery.toArray();
    
    // If we were trying to sort by lastUsedAt, do manual sorting
    if (sortBy === 'lastUsedAt') {
      return presets.sort((a, b) => {
        const aTime = a.lastUsedAt.getTime();
        const bTime = b.lastUsedAt.getTime();
        return order === 'desc' ? bTime - aTime : aTime - bTime;
      });
    }
    
    return presets;
  }
};

/**
 * Deletes a specific prompt preset by its ID.
 * @param id - The ID of the preset to delete.
 */
export const deletePromptPreset = async (id: number): Promise<void> => {
  return db.promptPresets.delete(id);
};

/**
 * Updates the lastUsedAt timestamp of a specific prompt preset.
 * @param id - The ID of the preset to update.
 */
export const updatePresetLastUsedAt = async (id: number): Promise<void> => {
  await db.promptPresets.update(id, { lastUsedAt: new Date() });
};
