import { db } from '@/lib/db';
import type { AISettings } from '@/types';

export const settingsService = {
  getAllSettings: async (): Promise<AISettings[]> => {
    try {
      return await db.aiSettings.toArray();
    } catch (error: any) {
      console.error("Error fetching AI settings:", error);
      throw new Error(error.message || "Failed to fetch AI settings.");
    }
  },

  addSetting: async (setting: Omit<AISettings, 'id'>): Promise<number> => {
    try {
      return await db.aiSettings.add(setting as AISettings);
    } catch (error: any) {
      console.error("Error adding AI setting:", error);
      throw new Error(error.message || "Failed to add AI setting.");
    }
  },

  updateSetting: async (setting: AISettings): Promise<number> => {
    if (!setting.id) {
      throw new Error("AI Setting ID is required for update.");
    }
    try {
      const updatedCount = await db.aiSettings.update(setting.id, setting);
      if (updatedCount === 0) throw new Error("AI Setting not found or data unchanged.");
      return setting.id;
    } catch (error: any) {
      console.error("Error updating AI setting:", error);
      throw new Error(error.message || "Failed to update AI setting.");
    }
  },

  deleteSetting: async (id: number): Promise<void> => {
    try {
      await db.aiSettings.delete(id);
    } catch (error: any) {
      console.error("Error deleting AI setting:", error);
      throw new Error(error.message || "Failed to delete AI setting.");
    }
  },
}; 