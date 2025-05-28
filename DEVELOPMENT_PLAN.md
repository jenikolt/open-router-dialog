**Overall Architecture:**

*   **Frontend:** React with TypeScript
*   **UI:** Shadcn UI components, styled with Tailwind CSS (black and white palette)
*   **State Management:** Zustand
*   **Data Persistence:** IndexedDB (likely via a library like Dexie.js for easier management)
*   **API Interaction:** `ai` npm package for OpenRouter communication
*   **Build Tool:** Vite
*   **Package Manager:** pnpm

---

**Development Plan**

**Phase 1: Project Foundation & Core Settings (Est. 3-4 days)**

1.  **Dependency Installation & Setup:**
    *   Ensure all core dependencies are installed: `react`, `react-dom`, `typescript`, `tailwindcss`, `zustand`, `ai`, `lucide-react` (for Shadcn icons).
    *   Install a robust IndexedDB wrapper: `pnpm add dexie`.
    *   Install `react-router-dom` for navigation: `pnpm add react-router-dom`.
    *   Install `sonner` for toast notifications: `pnpm add sonner`.
    *   Initialize and configure Shadcn UI (`npx shadcn-ui@latest init`), ensuring it's set up for TypeScript and Tailwind. Select a base theme that facilitates the black-and-white palette (e.g., "Neutral" or "Slate" and customize, or start with "Default" and override).
    *   Configure Tailwind CSS (`tailwind.config.js`, `postcss.config.js`) including Shadcn UI paths.
2.  **Directory Structure & Basic Layout:**
    *   Establish a clear project structure:
        *   `src/components/` (reusable UI components)
            *   `src/components/ui/` (Shadcn UI components will be here)
            *   `src/components/layouts/` (e.g., `AppLayout.tsx`, `MainPageLayout.tsx`, `SettingsPageLayout.tsx`)
            *   `src/components/features/` (for feature-specific components like role editor, tag list, chat interface)
        *   `src/pages/` (e.g., `MainPage.tsx`, `SettingsPage.tsx`)
        *   `src/services/` (for IndexedDB interactions, OpenRouter API calls)
        *   `src/stores/` (Zustand stores)
        *   `src/types/` (TypeScript interfaces and types)
        *   `src/lib/` (utility functions, Dexie DB setup)
        *   `src/hooks/` (custom React hooks)
    *   Implement basic routing using `react-router-dom` to switch between `MainPage` and `SettingsPage`.
    *   Create placeholder `MainPage` and `SettingsPage` components.
    *   Implement a simple `AppLayout` with a header/navigation element (e.g., settings icon to navigate to `/settings`).
3.  **Data Modeling (TypeScript Interfaces):**
    *   In `src/types/index.ts`, define interfaces for:
        *   `AISettings { id?: number; name: string; apiKey: string; model: string; /* other OpenRouter params */ }`
        *   `Role { id?: number; name: string; description: string; }`
        *   `Tag { id?: number; name: string; description: string; content: string; /* content is the text snippet for the prompt */ isGeneral: boolean; roleId?: number; /* if not general */ }`
        *   `ChatMessage { id: string; role: 'user' | 'assistant' | 'system'; content: string; timestamp: Date; }`
        *   `Dialog { id?: number; name?: string; messages: ChatMessage[]; createdAt: Date; lastUpdatedAt: Date; systemPrompt?: string; }`
        *   `PromptPreset { id?: number; name: string; systemPrompt: string; roleId?: number; tagIds?: number[]; createdAt: Date; }`
        *   `MSPrompt { Id: string; Title: string; DisplayCategory: string; DisplayText: string; }` (for Microsoft Prompts integration)
        *   `MSPromptsFilters { titleFilter: string; categoryFilter: string[]; textFilter: string; }` (for MS Prompts filtering)
4.  **IndexedDB Setup (Dexie):**
    *   Create `src/lib/db.ts`.
    *   Define Dexie database schema with tables for `aiSettings`, `roles`, `tags`, `dialogs`, `promptPresets`.
    *   Implement basic CRUD service modules in `src/services/` (e.g., `settingsService.ts`, `roleService.ts`, `tagService.ts`, `dialogService.ts`, `promptPresetService.ts`). Each service will interact with the Dexie DB.
5.  **Zustand Store Setup:**
    *   `src/stores/aiSettingsStore.ts`: Manages current AI settings (selected configuration, API key, model).
    *   `src/stores/uiStateStore.ts`: Manages UI states like selected role, selected tags, current dialog ID, loading states, modal visibility.
    *   `src/stores/chatStore.ts`: Manages the messages of the active chat session.
    *   `src/stores/msPromptsStore.ts`: Manages MS Prompts data, loading states, filters, and modal state.
6.  **Settings Page - AI Connection Management:**
    *   Create UI components (`src/components/features/settings/AISettingsForm.tsx`) using Shadcn: `Card`, `Input`, `Button`, `Label`.
    *   Allow users to add, edit, and delete AI connection configurations (name, API key, model).
    *   Persist these settings to IndexedDB via `settingsService.ts` and update/load from `aiSettingsStore.ts`.
    *   Implement a way to select the active AI configuration.

**Phase 2: Content Management - Roles & Tags (Settings Page) (Est. 3-4 days)**

1.  **Settings Page - Role Management:**
    *   UI (`src/components/features/settings/RoleEditor.tsx`):
        *   Form (Shadcn `Input`, `Textarea`, `Button`) to create and edit roles (name, description).
        *   List/Table (Shadcn `Table` or custom list with `Card`) to display existing roles with edit/delete actions.
    *   Connect to `roleService.ts` for persistence.
    *   (Defer associating tags directly here; tags can be marked as role-specific during tag creation).
2.  **Settings Page - Tag Management:**
    *   UI (`src/components/features/settings/TagEditor.tsx`):
        *   Form to create and edit tags (name, description, content/text for prompt).
        *   Option (Shadcn `Checkbox` or `Switch`) to mark a tag as "general" or role-specific.
        *   If role-specific, a `Select` (Shadcn `Select`) to choose the associated role (populated from existing roles).
        *   List/Table to display existing tags with edit/delete actions.
    *   Connect to `tagService.ts` for persistence.

**Phase 3: Main Page - Layout & Core Interactions (Est. 4-5 days) - COMPLETED**

1.  **Main Page Layout (`MainPageLayout.tsx`):**
    *   Implement the three-column layout using Flexbox/Grid with Tailwind CSS.
    *   Ensure responsiveness.
2.  **Left Column - Role Selection:**
    *   Component (`src/components/features/main/RoleList.tsx`):
        *   Shadcn `Input` for searching roles by name.
        *   Scrollable area (Shadcn `ScrollArea`) displaying `Card` components for each role (name, short description).
        *   Load roles from `roleService.ts`.
        *   On role selection, update `uiStateStore.ts` with the selected `roleId`.
3.  **Right Column - Tag Selection:**
    *   Component (`src/components/features/main/TagList.tsx`):
        *   Shadcn `Input` for searching tags by name/description.
        *   Two scrollable lists (Shadcn `ScrollArea`):
            *   "Role-Specific Tags": Filtered by `uiStateStore.selectedRoleId`.
            *   "General Tags": Tags marked as `isGeneral`.
        *   Use Shadcn `Checkbox` with `Label` for each tag to allow selection.
        *   Update `uiStateStore.ts` with an array of selected `tagIds`.
    *   Load tags from `tagService.ts`.
4.  **Center Column - Dynamic System Prompt Area:**
    *   Component (`src/components/features/main/SystemPromptComposer.tsx`):
        *   Display current system prompt in a Shadcn `Textarea`. The prompt is dynamically composed:
            *   Start with the selected role's description (from `roleService.ts` using `uiStateStore.selectedRoleId`).
            *   Append the `content` of each selected tag (from `tagService.ts` using `uiStateStore.selectedTagIds`), each on a new line.
        *   Make the `Textarea` editable. Changes update a local state or a specific part of `uiStateStore.ts`.
        *   Shadcn `Accordion` or `Collapsible` to expand/collapse the system prompt view.
5.  **Center Column - Top Buttons (Dialogs):**
    *   Component (`src/components/features/main/DialogControls.tsx`):
        *   "New Dialog" `Button`: Clears current chat state (in `chatStore.ts`), potentially saves the current one if not empty.
        *   "Saved Dialogs" `Button`: Opens a Shadcn `Dialog` (modal).
            *   Modal lists saved dialogs (from `dialogService.ts`) with options to open (load into `chatStore.ts`) or delete.

**Phase 4: Chat Functionality & Presets (Est. 5-6 days) - COMPLETED**

1.  **Center Column - Chat Interface:**
    *   Component (`src/components/features/main/ChatInterface.tsx`):
        *   Scrollable area for messages (Shadcn `ScrollArea`).
        *   Render `ChatMessage` items from `chatStore.ts`. Style user vs. assistant messages differently. Use a Markdown renderer (e.g., `react-markdown`) for AI responses.
        *   Shadcn `Input` or `Textarea` for user message input.
        *   Shadcn `Button` to send the message.
2.  **OpenRouter API Integration (`src/services/aiService.ts`):**
    *   Implement a function using the `ai` package to send requests to OpenRouter.
    *   This function will take:
        *   The composed system prompt.
        *   The current chat history (from `chatStore.ts`).
        *   The user's new message.
        *   API key and model from `aiSettingsStore.ts`.
    *   Handle API responses (including streaming if supported and desired) and errors.
    *   On receiving a response, add the AI message to `chatStore.ts`.
3.  **Dialog Persistence:**
    *   When a chat is active, periodically or on certain events (e.g., new message, user navigates away), save/update the current dialog (messages, system prompt used) to IndexedDB via `dialogService.ts`.
    *   The `chatStore.ts` should manage the `currentDialogId` from `uiStateStore.ts`.
4.  **Center Column - Prompt Presets:**
    *   Component (`src/components/features/main/PromptPresetControls.tsx`):
        *   Button in the System Prompt area: "Save as Preset". Saves the current system prompt text, selected role ID, and selected tag IDs to IndexedDB via `promptPresetService.ts`.
        *   Display a few recent/favorite presets as `Button`s below the system prompt area.
        *   "More Presets" `Button`: Opens a Shadcn `Dialog` (modal).
            *   Modal lists all saved presets (from `promptPresetService.ts`) with search (`Input`).
            *   Selecting a preset loads its role, tags into `uiStateStore.ts`, and its system prompt text into the composer.
5.  **Microsoft Prompts Integration:**
    *   Component (`src/components/features/main/MSPromptsModal.tsx`):
        *   Modal dialog accessible via lightbulb button in chat interface.
        *   Fetches prompts from Microsoft API (`https://copilot.cloud.microsoft/ru-RU/api/promptsclient/allPrompts`).
        *   Three filter controls: title search, category multi-select, and text search.
        *   Expandable prompt cards with copy-to-clipboard functionality.
        *   Toast notifications for successful copy operations.
    *   Service (`src/services/msPromptsService.ts`): Handles API communication with Microsoft's prompts endpoint.
    *   Custom UI component (`src/components/ui/multi-select.tsx`): Multi-select dropdown for category filtering.
    *   Chat Interface Integration: Added lightbulb button above attach file button to access MS Prompts modal.

**Phase 5: PWA, Styling & Finalization (Est. 2-3 days)**

1.  **PWA Configuration:**
    *   Install `vite-plugin-pwa`: `pnpm add -D vite-plugin-pwa`.
    *   Configure `vite.config.ts` with the PWA plugin.
    *   Create/customize `public/manifest.json` (app name, icons, theme color).
    *   Configure service worker for caching strategies (cache-first for assets, network-first or stale-while-revalidate for API/data).
2.  **Styling and Theming:**
    *   Ensure the black-and-white color palette is consistently applied using Shadcn's theming capabilities and Tailwind utility classes.
    *   Customize Shadcn component styles if needed via global CSS or by overriding styles.
    *   Refine layouts, spacing, and typography for a polished look and feel.
3.  **Error Handling & Loading States:**
    *   Implement user-friendly error messages for API failures, DB errors.
    *   Use loading indicators (e.g., Shadcn `Spinner` or skeleton loaders) for asynchronous operations. Manage loading states in Zustand stores.
4.  **Responsiveness & Accessibility:**
    *   Test and ensure the application is responsive across different screen sizes.
    *   Review for basic accessibility (keyboard navigation, ARIA attributes where necessary).
5.  **Testing & Refinement:**
    *   Thoroughly test all user flows and functionalities.
    *   Debug and fix any identified issues.
    *   Optimize performance where needed (e.g., memoization, virtualized lists for long lists of roles/tags/messages if performance becomes an issue). 
