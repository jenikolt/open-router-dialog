import { create } from 'zustand';
import type { MSPrompt, MSPromptsFilters } from '@/types';

interface MSPromptsState {
  prompts: MSPrompt[];
  isLoading: boolean;
  error: string | null;
  isModalOpen: boolean;
  filters: MSPromptsFilters;
  expandedPromptId: string | null;
  
  // Actions
  setPrompts: (prompts: MSPrompt[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setModalOpen: (open: boolean) => void;
  setFilters: (filters: Partial<MSPromptsFilters>) => void;
  setExpandedPromptId: (id: string | null) => void;
  resetFilters: () => void;
}

const initialFilters: MSPromptsFilters = {
  titleFilter: '',
  categoryFilter: [],
  textFilter: '',
};

export const useMSPromptsStore = create<MSPromptsState>()((set) => ({
  prompts: [],
  isLoading: false,
  error: null,
  isModalOpen: false,
  filters: initialFilters,
  expandedPromptId: null,

  setPrompts: (prompts) => set({ prompts }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setModalOpen: (isModalOpen) => set({ isModalOpen }),
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  setExpandedPromptId: (expandedPromptId) => set({ expandedPromptId }),
  resetFilters: () => set({ filters: initialFilters }),
})); 