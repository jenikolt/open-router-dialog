import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface UIState {
  selectedRoleId: number | null;
  selectedTagIds: number[];
  composedSystemPrompt: string; // The dynamically built system prompt
  isSystemPromptVisible: boolean;
  activeModal: string | null; // e.g., 'savedDialogs', 'promptPresets', 'settings'
  mainViewMode: 'chat' | 'settings'; // To switch between main chat and full settings page
  theme: 'light' | 'dark' | 'system';
  globalLoading: boolean;
  globalError: string | null;
  // Add other general UI states as needed

  // Actions
  setSelectedRoleId: (roleId: number | null) => void;
  toggleTagId: (tagId: number) => void;
  setSelectedTagIds: (tagIds: number[]) => void;
  setComposedSystemPrompt: (prompt: string) => void;
  toggleSystemPromptVisibility: () => void;
  setActiveModal: (modalName: string | null) => void;
  setMainViewMode: (mode: 'chat' | 'settings') => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setGlobalLoading: (isLoading: boolean) => void;
  setGlobalError: (error: string | null) => void;
}

export const useUIStateStore = create<UIState>()(
  immer((set, get) => ({
    selectedRoleId: null,
    selectedTagIds: [],
    composedSystemPrompt: '',
    isSystemPromptVisible: true,
    activeModal: null,
    mainViewMode: 'chat',
    theme: 'system', // Default to system theme preference
    globalLoading: false,
    globalError: null,

    setSelectedRoleId: (roleId) =>
      set((state) => {
        state.selectedRoleId = roleId;
        // Clear role-specific tags when changing roles, keep only general tags
        const currentState = get();
        if (currentState.selectedTagIds.length > 0) {
          // We'll need to filter this based on the actual tags, for now clear all role-specific tags
          // This will be handled properly by the SystemPromptComposer when it recomposes
          // For now, we'll keep all selected tags and let the composer filter them
        }
      }),

    toggleTagId: (tagId) =>
      set((state) => {
        const index = state.selectedTagIds.indexOf(tagId);
        if (index > -1) {
          state.selectedTagIds.splice(index, 1);
        } else {
          state.selectedTagIds.push(tagId);
        }
      }),

    setSelectedTagIds: (tagIds) => 
      set((state) => {
        state.selectedTagIds = tagIds;
      }),

    setComposedSystemPrompt: (prompt) =>
      set((state) => {
        state.composedSystemPrompt = prompt;
      }),

    toggleSystemPromptVisibility: () =>
      set((state) => {
        state.isSystemPromptVisible = !state.isSystemPromptVisible;
      }),

    setActiveModal: (modalName) =>
      set((state) => {
        state.activeModal = modalName;
      }),

    setMainViewMode: (mode) =>
      set((state) => {
        state.mainViewMode = mode;
      }),
    
    setTheme: (theme) => 
      set((state) => {
        state.theme = theme;
        // Add logic to apply the theme (e.g., update class on <html> or <body>)
        if (typeof window !== 'undefined') {
          const root = window.document.documentElement;
          root.classList.remove('light', 'dark');
          if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.add(systemTheme);
          } else {
            root.classList.add(theme);
          }
        }
      }),
    
    setGlobalLoading: (isLoading) =>
      set((state) => {
        state.globalLoading = isLoading;
      }),

    setGlobalError: (error) =>
      set((state) => {
        state.globalError = error;
      }),
  }))
);

// Initialize theme on load
if (typeof window !== 'undefined') {
  useUIStateStore.getState().setTheme(useUIStateStore.getState().theme);
} 