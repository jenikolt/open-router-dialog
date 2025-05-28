import { create } from 'zustand';
import type { ChatMessage, Dialog } from '@/types';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuidv4 } from 'uuid';
import { saveDialog as saveDialogToDB } from '@/services/dialogService'; // Renamed to avoid conflict

export interface ChatState {
  messages: ChatMessage[];
  currentDialogId: string | number | null | undefined; // string/number for DB ID, null if new, undefined if not yet set
  systemPromptUsedThisSession: string | null;
  isLoading: boolean;
  error: string | null;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  appendUserMessage: (content: string) => ChatMessage;
  appendAssistantMessageChunk: (messageId: string, contentChunk: string, isInitialChunk?: boolean) => void;
  setAssistantMessageContent: (messageId: string, content: string) => void;
  setCurrentDialogId: (dialogId: string | number | null | undefined, systemPrompt?: string) => void;
  loadDialog: (dialog: Dialog) => void;
  clearChat: (defaultSystemPrompt?: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  saveCurrentDialog: () => Promise<number | null>; // Returns the dialog ID or null if nothing to save
  setSystemPromptUsedThisSession: (prompt: string | null) => void;
}

export const useChatStore = create<ChatState>()(
  immer((set, get) => ({
    messages: [],
    currentDialogId: undefined,
    systemPromptUsedThisSession: null,
    isLoading: false,
    error: null,

    addMessage: (message) =>
      set((state) => {
        state.messages.push({
          ...message,
          id: uuidv4(),
          timestamp: new Date(),
        });
      }),

    appendUserMessage: (content) => {
      const newMessage: ChatMessage = {
        id: uuidv4(),
        role: 'user',
        content,
        timestamp: new Date(),
      };
      set((state) => {
        state.messages.push(newMessage);
      });
      // get().saveCurrentDialog(); // Optional: save after each user message
      return newMessage;
    },

    appendAssistantMessageChunk: (messageId, contentChunk, isInitialChunk = false) =>
      set((state) => {
        const existingMessage = state.messages.find((m: ChatMessage) => m.id === messageId);
        if (existingMessage && existingMessage.role === 'assistant') {
          existingMessage.content += contentChunk;
          existingMessage.timestamp = new Date();
        } else if (isInitialChunk) {
          state.messages.push({
            id: messageId,
            role: 'assistant',
            content: contentChunk,
            timestamp: new Date(),
          });
        }
        // After the last chunk (or periodically), you might call saveCurrentDialog
        // This needs a mechanism to know when the stream is done if saving here.
      }),
    
    setAssistantMessageContent: (messageId, content) => 
      set((state) => {
        const message = state.messages.find((m: ChatMessage) => m.id === messageId);
        if (message && message.role === 'assistant') {
          message.content = content;
          message.timestamp = new Date();
        }
        // get().saveCurrentDialog(); // Optional: save after full assistant message is set
      }),

    setCurrentDialogId: (dialogId, systemPrompt) =>
      set((state) => {
        state.currentDialogId = dialogId;
        if (systemPrompt !== undefined) {
          state.systemPromptUsedThisSession = systemPrompt;
        }
      }),

    loadDialog: (dialog) =>
      set((state) => {
        state.messages = [...dialog.messages];
        state.currentDialogId = dialog.id ?? null;
        state.systemPromptUsedThisSession = dialog.systemPrompt ?? null;
        state.error = null;
        state.isLoading = false;
      }),

    clearChat: (defaultSystemPrompt = 'You are a helpful assistant.') =>
      set((state) => {
        state.messages = [];
        state.currentDialogId = null; 
        state.systemPromptUsedThisSession = defaultSystemPrompt;
        state.error = null;
        state.isLoading = false;
      }),

    setLoading: (isLoading) =>
      set((state) => {
        state.isLoading = isLoading;
      }),

    setError: (error) =>
      set((state) => {
        state.error = error;
      }),
      
    setSystemPromptUsedThisSession: (prompt) => 
      set((state) => {
        state.systemPromptUsedThisSession = prompt;
      }),

    saveCurrentDialog: async () => {
      const { messages, currentDialogId, systemPromptUsedThisSession } = get();
      if (messages.length === 0 && !systemPromptUsedThisSession) {
        // Nothing to save if there are no messages and no system prompt explicitly set for an empty chat
        // Or, if it's a new dialog (currentDialogId is null) with no messages yet.
        if (currentDialogId === null && messages.length === 0) return null;
      }

      set({ isLoading: true, error: null });
      try {
        const dialogToSave: Omit<Dialog, 'id' | 'createdAt' | 'lastUpdatedAt'> & { id?: number | string | null } = {
          messages: messages,
          systemPrompt: systemPromptUsedThisSession === null ? undefined : systemPromptUsedThisSession,
          name: messages.length > 0 ? messages[0].content.substring(0, 50) : 'New Dialog',
        };

        if (currentDialogId && (typeof currentDialogId === 'number' || typeof currentDialogId === 'string')) {
          dialogToSave.id = typeof currentDialogId === 'string' ? parseInt(currentDialogId) : currentDialogId;
        }
        
        const savedId = await saveDialogToDB(dialogToSave);
        set((state) => {
          state.currentDialogId = savedId;
          state.isLoading = false;
        });
        return savedId;
      } catch (err: any) {
        console.error('Failed to save dialog:', err);
        set({ error: err.message || 'Failed to save dialog', isLoading: false });
        return null;
      }
    },
  }))
); 