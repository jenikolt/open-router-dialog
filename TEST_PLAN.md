test plan: 


Okay, we've reached the "Testing & Refinement" stage of Phase 5. This is a crucial step to ensure the application is working as expected, is user-friendly, and performs well.

Based on the development plan, here's a rundown of key user flows and functionalities that should be thoroughly tested:

**I. Core Settings & Navigation (Primarily Settings Page `src/pages/SettingsPage.tsx`)**
*   **Navigation**:
    *   Can you seamlessly switch between the Main Page (`/`) and the Settings Page (`/settings`)?
*   **AI Connection Management**:
    *   Create, view, edit, and delete AI connection configurations (API key, model).
    *   Select an active AI configuration.
    *   Are changes correctly saved to IndexedDB and reflected after a page reload?

**II. Content Management (Settings Page)**
*   **Role Management**:
    *   Create, view, edit, and delete roles (name, description).
    *   Check IndexedDB persistence and UI updates.
*   **Tag Management**:
    *   Create, view, edit, and delete tags (name, description, content).
    *   Test marking tags as "general" vs. role-specific (associating with a role).
    *   Check IndexedDB persistence and UI updates.

**III. Main Page Core Interactions (`src/pages/MainPage.tsx` & `src/components/layouts/MainPageLayout.tsx`)**
*   **Role Selection (Left Column)**:
    *   Search roles.
    *   Scroll and select a role. Is the application state (`uiStateStore.selectedRoleId`) updated?
*   **Tag Selection (Right Column)**:
    *   Search tags.
    *   View role-specific vs. general tags based on selected role.
    *   Select/deselect tags. Is `uiStateStore.selectedTagIds` updated?
*   **System Prompt Composer (Center Column)**:
    *   Does it dynamically update based on the selected role and tags?
    *   Can you edit the prompt directly?
    *   If an accordion/collapsible is used, does it expand/collapse?
*   **Dialog Controls (Center Column)**:
    *   "New Dialog": Does it clear the chat? Does it save the previous dialog if it had messages?
    *   "Saved Dialogs":
        *   Does the modal open and list saved dialogs correctly?
        *   Can you open a saved dialog (loading its messages)?
        *   Can you delete a dialog from the modal?
        *   Check IndexedDB persistence.

**IV. Chat Functionality & Presets (Main Page - Center Column)**
*   **Chat Interface (`src/components/features/main/ChatInterface.tsx`)**:
    *   Send messages.
    *   Receive and view streamed AI responses.
    *   Are user/assistant messages styled differently? Is Markdown rendered?
    *   Does the chat auto-scroll?
*   **OpenRouter API Calls (`src/services/aiService.ts`)**:
    *   Are API calls made successfully with the correct data (system prompt, history, key, model)?
    *   How are API errors handled (global error message)?
*   **Dialog Persistence (`src/stores/chatStore.ts`, `src/services/dialogService.ts`)**:
    *   Are dialogs (messages, system prompt) saved/updated to IndexedDB during the chat?
*   **Prompt Preset Controls**:
    *   "Save as Preset": Does it save the current system prompt, role, and tags?
    *   "More Presets" modal:
        *   List, search, and select presets.
        *   Does selecting a preset correctly update the role, tags, and system prompt in the UI?
        *   Check IndexedDB persistence.

**IV.1. Microsoft Prompts Integration**
*   **MS Prompts Modal Access (`src/components/features/main/MSPromptsModal.tsx`)**:
    *   Does the lightbulb button appear above the attach file button in the chat interface?
    *   Does clicking the lightbulb button open the MS Prompts modal correctly?
    *   Does the modal have the correct title "Prompts from MS"?
*   **API Integration (`src/services/msPromptsService.ts`)**:
    *   Does the modal fetch prompts from `https://copilot.cloud.microsoft/ru-RU/api/promptsclient/allPrompts` on first open?
    *   Are prompts cached in state to avoid repeated API calls on subsequent modal opens?
    *   How are API errors handled (network issues, invalid response format)?
    *   Does the loading indicator appear during the initial fetch?
    *   Is there a "Try Again" button when the API call fails?
*   **Filtering Functionality**:
    *   **Title Filter**: Does typing in the title filter field correctly filter prompts by title (case-insensitive)?
    *   **Category Multi-Select**: 
        *   Are unique categories populated from the fetched prompts?
        *   Can you select/deselect multiple categories?
        *   Do selected categories correctly filter the prompt list?
        *   Does clicking outside the multi-select close the dropdown?
        *   Can you remove individual category selections using the X button?
    *   **Text Filter**: Does typing in the text filter field correctly filter prompts by content (case-insensitive)?
    *   **Combined Filters**: Do all three filters work together correctly (AND logic)?
    *   **Clear Filters**: Does the "Clear Filters" button appear when any filter is active and reset all filters?
*   **Prompt Card Functionality**:
    *   Are prompts displayed as single-line cards with ellipsis for long text?
    *   Does each card show the prompt title, category badge, and truncated text?
    *   **Expandable Cards**: Does clicking a card expand it to show full text (max 100px height)?
    *   Does clicking an expanded card collapse it back to single-line?
    *   Is internal scrolling available when expanded text exceeds 100px height?
    *   Is only one card expanded at a time?
*   **Copy to Clipboard Functionality**:
    *   Does each card have a copy button (clipboard icon)?
    *   Does clicking the copy button copy the full prompt text to clipboard?
    *   Does clicking the copy button prevent card expansion/collapse?
    *   Are toast notifications shown on successful copy operations?
    *   Are error toast notifications shown if clipboard access fails?
    *   Do toast messages include the prompt title for confirmation?
*   **Modal Behavior**:
    *   Does the modal close when clicking the X button?
    *   Does the modal close when clicking outside the modal content?
    *   Is the expanded card state reset when the modal is closed and reopened?
    *   Does the modal maintain filter states when closed and reopened?
*   **State Management (`src/stores/msPromptsStore.ts`)**:
    *   Are prompts persisted in the store after the first fetch?
    *   Are filter states managed correctly?
    *   Is the modal open/close state managed properly?
    *   Is the expanded prompt ID tracked correctly?

**V. PWA, Styling, Error Handling, Responsiveness & Accessibility**
*   **PWA**:
    *   Does the "install app" prompt appear? (You'll need to ensure you have dummy icons in `public/` for `pwa-192x192.png` and `pwa-512x512.png` as specified in `vite.config.ts` or update the config).
    *   Basic offline asset caching (harder to test data offline without full service worker strategies).
*   **Toast Notifications (Sonner)**:
    *   Are success toasts displayed when copying MS prompts to clipboard?
    *   Are error toasts displayed when clipboard operations fail?
    *   Do toasts automatically dismiss after a reasonable time?
    *   Are toasts visually distinct for success/error states?
    *   Do toasts appear in an appropriate position (not blocking important UI)?
    *   Can multiple toasts be displayed simultaneously if needed?
*   **Styling & Theming**:
    *   Is the black-and-white theme consistent across all new components (MS Prompts modal, multi-select, toasts)?
    *   If a theme toggle exists, does light/dark mode work and persist for the new components?
    *   Does the MS Prompts modal respect the current theme?
    *   Are the multi-select dropdown and selected items styled consistently?
*   **Error Handling & Loading States**:
    *   Is the global loading spinner shown during API calls (e.g., sending a message)?
    *   Are global error messages shown for critical failures (e.g., invalid API key, DB errors)?
    *   Are there local loading/error indicators in components where appropriate (e.g., send button disabled, MS Prompts loading)?
    *   Does the MS Prompts modal handle API failures gracefully with retry options?
*   **Responsiveness (`MainPageLayout.tsx`, MS Prompts Modal, etc.)**:
    *   Test on desktop, tablet, and mobile screen sizes. Do columns stack correctly? Is content readable?
    *   Test scrolling: main page scroll on mobile, sidebar scrolling on desktop.
    *   **MS Prompts Modal Responsiveness**:
        *   Does the modal size appropriately on different screen sizes?
        *   Do the three filter columns stack properly on mobile?
        *   Is the modal scrollable on small screens?
        *   Are prompt cards readable and interactive on touch devices?
*   **Accessibility (Basic Review)**:
    *   **Keyboard Navigation**: Can you navigate and interact with all elements using only the keyboard?
        *   Can you open the MS Prompts modal using keyboard?
        *   Can you navigate through filter fields using Tab?
        *   Can you interact with the multi-select using keyboard?
        *   Can you navigate and interact with prompt cards using keyboard?
        *   Can you copy prompts to clipboard using keyboard?
    *   **ARIA Labels**: Are there clear labels for icon buttons or ambiguous controls? (e.g., in `AppLayout`, `ChatInterface`, MS Prompts lightbulb button, copy buttons).
    *   **Focus Management**: Check focus behavior with modals/dialogs, including the MS Prompts modal and multi-select dropdown.
    *   **Screen Reader Compatibility**: Are toast notifications announced to screen readers?

Please take your time to test these areas. As you identify issues or areas for improvement (including performance):
*   Describe the bug or the performance issue.
*   Provide steps to reproduce it.
*   Mention the relevant component(s) if you know them.

I'll be here to help debug, implement fixes, or suggest optimization strategies. Let me know what you find!
