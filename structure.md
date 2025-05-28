
## Project Structure and Dependencies Overview

Based on my analysis, here's a comprehensive overview of your **OpenRouter Dialog** project:

## 📁 **Project Structure**

### **Root Level**
```
open-router-dialog/
├── src/                 # Main source code
├── public/              # Static assets
├── package.json         # Dependencies & scripts
├── vite.config.ts       # Build configuration
├── tailwind.mdc         # Tailwind docs
├── *.md                 # Documentation files
└── *.json               # TypeScript & tool configs
```

### **Source Code Architecture** (`src/`)

```
src/
├── main.tsx             # App entry point
├── App.tsx              # Main app with routing
├── index.css            # Global styles
│
├── components/          # React components
│   ├── ui/              # Reusable UI components (12 files)
│   │   ├── multi-select.tsx    # Custom multi-select component
│   │   └── ... (other Shadcn UI components)
│   ├── features/        # Feature-specific components
│   │   ├── main/        # Main page features
│   │   │   ├── MSPromptsModal.tsx    # Microsoft Prompts modal
│   │   │   └── ... (other main features)
│   │   └── settings/    # Settings page features
│   └── layouts/         # Layout components
│
├── pages/               # Page components
│   ├── MainPage.tsx     # Home page
│   └── SettingsPage.tsx # Settings page
│
├── stores/              # State management (Zustand)
│   ├── aiSettingsStore.ts    # AI configuration state
│   ├── chatStore.ts          # Chat messages state
│   ├── msPromptsStore.ts     # MS Prompts state management
│   ├── promptPresetStore.ts  # Prompt presets state
│   └── uiStateStore.ts       # UI state management
│
├── services/            # Business logic & API calls
│   ├── aiService.ts          # OpenAI/OpenRouter integration
│   ├── dialogService.ts      # Dialog management
│   ├── msPromptsService.ts   # Microsoft Prompts API integration
│   ├── promptPresetService.ts # Preset management
│   ├── roleService.ts        # Role management
│   ├── settingsService.ts    # Settings persistence
│   └── tagService.ts         # Tag management
│
├── lib/                 # Utilities & database
│   ├── db.ts            # Dexie database setup
│   └── utils.ts         # Utility functions
│
├── types/               # TypeScript definitions
│   └── index.ts         # Core data models
│
└── hooks/               # Custom React hooks (empty)
```

## 📦 **Dependencies**

### **Core Framework**
- **React 19.1.0** - Main UI framework
- **TypeScript 5.8.3** - Type safety
- **Vite 6.3.5** - Build tool & dev server

### **UI & Styling**
- **Tailwind CSS 4.1.5** - Utility-first CSS
- **Radix UI** - Accessible component primitives
  - Dialog, AlertDialog, Select, Switch, Label, ScrollArea, Slot
- **Lucide React** - Icon library
- **Class Variance Authority** - Component variants
- **Tailwind Merge** - Class merging utility

### **State Management & Data**
- **Zustand 5.0.4** - Lightweight state management
- **Dexie 4.0.11** - IndexedDB wrapper for local storage
- **Immer 10.1.1** - Immutable state updates

### **AI Integration**
- **OpenAI 4.103.0** - OpenAI API client
- **AI 4.3.15** - AI utilities

### **Routing & Navigation**
- **React Router DOM 7.6.0** - Client-side routing

### **Content & Utilities**
- **React Markdown 10.1.0** - Markdown rendering
- **UUID 11.1.0** - Unique ID generation
- **Sonner 2.0.3** - Toast notifications

### **PWA Support**
- **Vite Plugin PWA 1.0.0** - Progressive Web App features

## 🔗 **Key Dependencies Between Components**

### **Data Flow**
1. **Database Layer** (`lib/db.ts`) → **Services** → **Stores** → **Components**
2. **Types** define interfaces used across all layers
3. **UI Components** are consumed by **Feature Components** and **Pages**

### **State Management Architecture**
- **aiSettingsStore**: Manages AI model configurations
- **chatStore**: Handles chat messages and conversations
- **msPromptsStore**: Manages Microsoft Prompts data, filters, and modal state
- **promptPresetStore**: Manages saved prompt presets
- **uiStateStore**: Controls UI state (modals, selections, etc.)

### **Service Layer**
- **aiService**: Integrates with OpenRouter/OpenAI APIs
- **dialogService**: Manages conversation persistence
- **msPromptsService**: Integrates with Microsoft Prompts API
- **promptPresetService**: Handles preset CRUD operations
- **roleService & tagService**: Manage role/tag system for prompts
- **settingsService**: Handles app configuration

### **Component Architecture**
- **AppLayout**: Main layout wrapper
- **MainPage**: Chat interface
- **SettingsPage**: Configuration interface
- **UI Components**: Shadcn/ui-style reusable components

## 🎯 **Key Features**
- AI chat interface with OpenRouter integration
- Microsoft Prompts integration with filtering and copy-to-clipboard
- Local data persistence with IndexedDB
- Role and tag-based prompt management
- Preset system for saving prompt configurations
- Toast notifications for user feedback
- PWA capabilities
- TypeScript throughout for type safety

This is a well-structured React application following modern patterns with clean separation of concerns between UI, state management, business logic, and data persistence.
