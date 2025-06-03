import React, { useEffect, useState } from 'react';
import { useAISettingsStore } from '@/stores/aiSettingsStore';
import type { AISettings } from '@/types'; // Import AISettings type
import AISettingsForm from '@/components/features/settings/AISettingsForm'; // Uncommented
import AISettingsList from '@/components/features/settings/AISettingsList'; // Uncommented
import { Button } from '@/components/ui/button'; // Assuming Button is already added via Shadcn
import { PlusCircle, Palette } from 'lucide-react';
import RoleEditor from '@/components/features/settings/RoleEditor'; // Added import
import TagEditor from '@/components/features/settings/TagEditor';   // Added import
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useTheme } from '@/hooks/useTheme';

const SettingsPage: React.FC = () => {
  const { loadSettings, settings, activeSettingsId, isLoading, error } = useAISettingsStore();
  const [showForm, setShowForm] = useState(false);
  const [editingSetting, setEditingSetting] = useState<AISettings | undefined>(undefined);
  const { theme } = useTheme();

  // Compute current settings from the active setting ID
  const currentSettings = settings.find(setting => setting.id === activeSettingsId) || null;

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleAddNew = () => {
    setEditingSetting(undefined);
    setShowForm(true);
  };

  const handleEdit = (setting: AISettings) => {
    setEditingSetting(setting);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingSetting(undefined);
  };

  const getThemeDisplayName = (theme: string) => {
    switch (theme) {
      case 'light': return 'Светлая тема';
      case 'dark': return 'Тёмная тема';
      case 'system': return 'Системная тема';
      default: return 'Неизвестно';
    }
  };

  return (
    <div className="space-y-8 p-4 md:p-6"> {/* Added padding and increased spacing */}
      <h1 className="text-3xl font-bold">Settings</h1>
      
      {/* Theme Settings Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          <h2 className="text-2xl font-semibold">Настройки темы</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Настройте внешний вид приложения. Текущая тема: <span className="font-medium">{getThemeDisplayName(theme)}</span>
        </p>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <span className="text-sm text-muted-foreground">
            Выберите светлую, тёмную тему или следуйте системным настройкам
          </span>
        </div>
      </section>

      <hr className="my-6" />
      
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">AI Provider Configurations</h2>
          {!showForm && (
            <Button onClick={handleAddNew} variant="outline">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Configuration
            </Button>
          )}
        </div>

        {isLoading && !showForm && <p>Loading AI configurations...</p>}
        {error && !showForm && <p className="text-red-500">Error loading configurations: {error}</p>}

        {
          showForm ? (
            <AISettingsForm 
              initialData={editingSetting} 
              onClose={handleFormClose} 
            />
          ) : (
            <AISettingsList 
              settings={settings}
              currentSettingId={currentSettings?.id}
              onEdit={handleEdit}
            />
          )
        }
        
        {!showForm && settings.length === 0 && !isLoading && !error && (
          <p className="mt-4 text-center text-gray-500 dark:text-gray-400">
            No AI configurations found. Click "Add New Configuration" to get started.
          </p>
        )}
        
        {/* Remove temporary raw data display if list is working */}
        {/* {!showForm && settings.length > 0 && (
          <div className="mt-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
            <h3 className="text-lg font-medium mb-2">Available Configurations (Raw Data):</h3>
            <pre className="text-xs overflow-auto">{JSON.stringify(settings, null, 2)}</pre>
            {currentSettings && (
              <>
                <h3 className="text-lg font-medium mt-3 mb-2">Current Active Configuration:</h3>
                <pre className="text-xs overflow-auto">{JSON.stringify(currentSettings, null, 2)}</pre>
              </>
            )}
          </div>
        )} */}

      </section>

      <hr className="my-6" /> {/* Added a visual separator */}

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Role Management</h2>
        <p className="text-sm text-muted-foreground"> {/* Used text-muted-foreground for consistency */}
            Create and manage roles that define the assistant's persona or task for system prompts.
        </p>
        <RoleEditor />
      </section>

      <hr className="my-6" /> {/* Added a visual separator */}

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Tag Management</h2>
        <p className="text-sm text-muted-foreground"> {/* Used text-muted-foreground for consistency */}
            Create and manage tags, which are reusable snippets of text to be included in system prompts. Tags can be general or role-specific.
        </p>
        <TagEditor />
      </section>
    </div>
  );
};

export default SettingsPage; 