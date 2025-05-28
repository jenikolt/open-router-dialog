import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { AISettings } from '@/types';
import { settingsService } from '@/services/settingsService';

// This would ideally be your Dexie instance for more robust storage
// For now, using localStorage via persist middleware
const storage = createJSONStorage(() => localStorage); 

export interface AISettingsState {
  apiKey: string | null;
  model: string | null; 
  availableModels: string[]; // To be populated, e.g., from OpenRouter or a config file
  settings: AISettings[]; // All saved AI configurations
  activeSettingsId: number | null; // ID of the currently active configuration
  isLoading: boolean;
  error: string | null;

  // Actions
  setApiKey: (apiKey: string | null) => void;
  setModel: (model: string | null) => void;
  loadSettings: () => Promise<void>;
  addSetting: (setting: Omit<AISettings, 'id'>) => Promise<AISettings>;
  updateSetting: (setting: AISettings) => Promise<void>;
  deleteSetting: (settingId: number) => Promise<void>;
  setActiveSetting: (settingId: number | null) => void;
  fetchAvailableModels: () => Promise<void>; // Example for fetching models
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAISettingsStore = create<AISettingsState>()(
  persist(
    immer((set) => ({
      apiKey: null,
      model: 'openai/gpt-3.5-turbo', // Default model
      availableModels: ['openai/gpt-3.5-turbo', 'openai/gpt-4', 'google/gemini-pro'], // Example static list
      settings: [],
      activeSettingsId: null,
      isLoading: false,
      error: null,

      setApiKey: (apiKey) => set({ apiKey }),
      setModel: (model) => set({ model }),
      
      loadSettings: async () => {
        set({ isLoading: true, error: null });
        try {
          const settings = await settingsService.getAllSettings();
          set((state) => {
            state.settings = settings;
            state.isLoading = false;
            if (!state.activeSettingsId && settings.length > 0) {
              // If no active setting, and settings are loaded, activate the first one
              state.activeSettingsId = settings[0].id!;
              state.apiKey = settings[0].apiKey;
              state.model = settings[0].model;
            } else if (state.activeSettingsId) {
              // If there was an active setting, re-apply it from the potentially updated list
              const active = settings.find((s: AISettings) => s.id === state.activeSettingsId);
              if (active) {
                state.apiKey = active.apiKey;
                state.model = active.model;
              } else {
                // Active setting was deleted, clear it
                state.activeSettingsId = null;
                state.apiKey = null;
                state.model = 'openai/gpt-3.5-turbo'; // Reset to default
              }
            }
          });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      addSetting: async (newSettingData) => {
        set({ isLoading: true, error: null });
        try {
          const id = await settingsService.addSetting(newSettingData);
          const newSetting = { ...newSettingData, id };
          set((state) => {
            state.settings.push(newSetting);
            state.isLoading = false;
          });
          return newSetting;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      updateSetting: async (updatedSetting) => {
        set({ isLoading: true, error: null });
        try {
          await settingsService.updateSetting(updatedSetting);
          set((state) => {
            const index = state.settings.findIndex((s: AISettings) => s.id === updatedSetting.id);
            if (index !== -1) {
              state.settings[index] = updatedSetting;
              if (state.activeSettingsId === updatedSetting.id) {
                state.apiKey = updatedSetting.apiKey;
                state.model = updatedSetting.model;
              }
            }
            state.isLoading = false;
          });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      deleteSetting: async (settingId: number) => {
        set({ isLoading: true, error: null });
        try {
          await settingsService.deleteSetting(settingId);
          set((state) => {
            state.settings = state.settings.filter((s: AISettings) => s.id !== settingId);
            if (state.activeSettingsId === settingId) {
              state.activeSettingsId = null;
              state.apiKey = null;
              state.model = null;
              // Optionally, set to first available or default
              if (state.settings.length > 0) {
                  state.activeSettingsId = state.settings[0].id!;
                  state.apiKey = state.settings[0].apiKey;
                  state.model = state.settings[0].model;
              } else {
                  state.model = 'openai/gpt-3.5-turbo'; // Reset to default if all are deleted
              }
            }
            state.isLoading = false;
          });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      setActiveSetting: (settingId) =>
        set((state) => {
          const newActiveSetting = state.settings.find((s: AISettings) => s.id === settingId);
          if (newActiveSetting) {
            state.activeSettingsId = newActiveSetting.id!;
            state.apiKey = newActiveSetting.apiKey;
            state.model = newActiveSetting.model;
          } else {
            state.activeSettingsId = null;
            state.apiKey = null;
            state.model = 'openai/gpt-3.5-turbo'; // Reset to default if ID not found
          }
        }),

      // Placeholder for actual API call to OpenRouter or config
      fetchAvailableModels: async () => {
        set({ isLoading: true, error: null });
        try {
          // const response = await fetch('https://openrouter.ai/api/v1/models'); // Needs API key for this endpoint
          // if (!response.ok) throw new Error('Failed to fetch models');
          // const data = await response.json();
          // const models = data.data.map((m: any) => m.id);
          // Simulating a fetch
          await new Promise(resolve => setTimeout(resolve, 500));
          const models = ['openai/gpt-3.5-turbo', 'openai/gpt-4', 'google/gemini-pro', 'mistralai/mistral-7b-instruct'];
          set({ availableModels: models, isLoading: false });
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
        }
      },
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    })),
    {
      name: 'ai-settings-storage', // name of the item in the storage (must be unique)
      storage: storage,
      // Only persist a subset of the state
      partialize: (state) => (
        {
          settings: state.settings,
          activeSettingsId: state.activeSettingsId,
          model: state.model, // Persist last used model for convenience
          // apiKey is intentionally not persisted to localStorage for security.
          // It should be re-entered or loaded from a more secure backend/service if needed.
        }
      ),
    }
  )
);

// Initialize by fetching models or loading from DB on app start
// useAISettingsStore.getState().fetchAvailableModels();
// If using Dexie for settings, you would load them here too. 