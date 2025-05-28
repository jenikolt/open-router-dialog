import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { PromptPreset } from '@/types';
import {
  savePromptPreset as savePresetToDB,
  getAllPromptPresets as getAllPresetsFromDB,
  deletePromptPreset as deletePresetFromDB,
  getPromptPreset as getPresetFromDB,
} from '@/services/promptPresetService';

export interface PromptPresetState {
  presets: PromptPreset[];
  isLoading: boolean;
  error: string | null;
  loadPresets: () => Promise<void>;
  addPreset: (presetData: Omit<PromptPreset, 'id' | 'createdAt' | 'lastUsedAt'>) => Promise<PromptPreset | null>;
  updatePreset: (presetData: PromptPreset) => Promise<PromptPreset | null>; 
  deletePreset: (presetId: number) => Promise<void>;
  getPresetById: (presetId: number) => Promise<PromptPreset | undefined>;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const usePromptPresetStore = create<PromptPresetState>()(
  immer((set) => ({
    presets: [],
    isLoading: false,
    error: null,

    loadPresets: async () => {
      set({ isLoading: true, error: null });
      try {
        const loadedPresets = await getAllPresetsFromDB('lastUsedAt', 'desc');
        set({ presets: loadedPresets, isLoading: false });
      } catch (err: any) {
        console.error("Failed to load prompt presets:", err);
        set({ error: err.message || 'Failed to load presets', isLoading: false });
      }
    },

    addPreset: async (presetData) => {
      set({ isLoading: true, error: null });
      try {
        const newPresetId = await savePresetToDB(presetData);
        const newPreset = await getPresetFromDB(newPresetId);
        if (newPreset) {
          set((state) => {
            // Add to start for most recent, or sort after adding
            state.presets.unshift(newPreset); 
          });
        }
        set({ isLoading: false });
        return newPreset || null;
      } catch (err: any) {
        console.error("Failed to add prompt preset:", err);
        set({ error: err.message || 'Failed to add preset', isLoading: false });
        return null;
      }
    },

    updatePreset: async (presetData) => {
      set({ isLoading: true, error: null });
      try {
        await savePresetToDB(presetData); // savePresetToDB handles update if id exists
        const updatedPreset = await getPresetFromDB(presetData.id!);
         if (updatedPreset) {
          set((state) => {
            const index = state.presets.findIndex((p: PromptPreset) => p.id === updatedPreset.id);
            if (index !== -1) {
              state.presets[index] = updatedPreset;
            }
          });
        }
        set({ isLoading: false });
        return updatedPreset || null;
      } catch (err: any) {
        console.error("Failed to update prompt preset:", err);
        set({ error: err.message || 'Failed to update preset', isLoading: false });
        return null;
      }
    },

    deletePreset: async (presetId) => {
      set({ isLoading: true, error: null });
      try {
        await deletePresetFromDB(presetId);
        set((state) => {
          state.presets = state.presets.filter((p: PromptPreset) => p.id !== presetId);
        });
        set({ isLoading: false });
      } catch (err: any) {
        console.error("Failed to delete prompt preset:", err);
        set({ error: err.message || 'Failed to delete preset', isLoading: false });
      }
    },
    
    getPresetById: async (presetId: number) => {
      // This could also just read from the current state if presets are always loaded
      // but fetching directly ensures fresh data if needed or if state isn't populated.
      set({ isLoading: true, error: null });
      try {
        const preset = await getPresetFromDB(presetId);
        set({ isLoading: false });
        return preset;
      } catch (err: any) {
        console.error(`Failed to get preset ${presetId}:`, err);
        set({ error: err.message || 'Failed to get preset', isLoading: false });
        return undefined;
      }
    },

    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
  }))
);

// Optionally, load presets when the store is initialized or app starts
// usePromptPresetStore.getState().loadPresets(); 