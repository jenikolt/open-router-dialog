export interface AISettings {
  id?: number; // Optional: for database primary key
  name: string; // User-defined name for this configuration
  apiKey: string;
  model: string; // e.g., 'gpt-3.5-turbo', 'claude-2'
  temperature?: number; // Optional: for controlling randomness (0.0 to 2.0)
  maxTokens?: number; // Optional: maximum tokens for response
  // TODO: Add other OpenRouter params as needed
}

export interface Role {
  id?: number;
  name: string;
  description: string; // This will form the base of the system prompt for this role
}

export interface Tag {
  id?: number;
  name: string;
  description: string; // Short description of what the tag does/is for
  content: string;     // The actual text snippet that gets inserted into the system prompt
  isGeneral: boolean;  // True if the tag is general, false if specific to a role
  roleId?: number;      // Foreign key to Role if not general
}

export type ChatMessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string; // Unique ID for the message (e.g., UUID)
  role: ChatMessageRole;
  content: string;
  timestamp: Date;
  // TODO: Potentially add other metadata like sources, ratings, etc.
}

export interface Dialog {
  id?: number; // DB ID
  name?: string; // Optional user-defined name for the dialog session
  messages: ChatMessage[];
  createdAt: Date;
  lastUpdatedAt: Date;
  systemPrompt?: string; // The exact system prompt used for this dialog
  // TODO: Potentially add roleId, tagIds if a dialog is tied to a specific setup
}

export interface PromptPreset {
  id?: number;
  name: string; // User-defined name for this preset
  systemPrompt: string; // The full system prompt text
  roleId?: number;      // Optional: The role this preset was derived from
  tagIds?: number[];    // Optional: The tags used to create this preset
  createdAt: Date;
  lastUsedAt: Date; // Required for sorting/showing recent presets
}

// MS Prompts types
export interface MSPrompt {
  Id: string; // Unique identifier from MS API
  Title: string; // Name of the prompt
  DisplayCategory: string; // Category
  DisplayText: string; // The text of the prompt itself
}

export interface MSPromptsFilters {
  titleFilter: string;
  categoryFilter: string[];
  textFilter: string;
} 