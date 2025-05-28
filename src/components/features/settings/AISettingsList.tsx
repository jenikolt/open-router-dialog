import React from 'react';
import type { AISettings } from '@/types';
import { useAISettingsStore } from '@/stores/aiSettingsStore';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Edit, Trash2, CheckCircle, Power } from 'lucide-react';

interface AISettingsListProps {
  settings: AISettings[];
  currentSettingId?: number | null;
  onEdit: (setting: AISettings) => void;
}

const AISettingsList: React.FC<AISettingsListProps> = ({ settings, currentSettingId, onEdit }) => {
  const { deleteSetting, setActiveSetting, isLoading } = useAISettingsStore();

  const handleDelete = async (id: number) => {
    try {
      await deleteSetting(id);
    } catch (error) {
      console.error('Failed to delete setting:', error);
      // Error handling is done by the store, but we could add additional UI feedback here if needed
    }
  };

  const handleSetCurrent = async (id: number) => {
    setActiveSetting(id);
  };

  if (settings.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400 py-4">No AI configurations found.</p>;
  }

  return (
    <div className="space-y-4">
      {settings.map((setting) => (
        <Card key={setting.id} className={`transition-all ${currentSettingId === setting.id ? 'border-green-500 dark:border-green-400 shadow-lg' : ''}`}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{setting.name}</CardTitle>
                <CardDescription>Model: {setting.model}</CardDescription>
              </div>
              {currentSettingId === setting.id && (
                <div className="flex items-center text-green-600 dark:text-green-400 text-sm">
                  <CheckCircle size={18} className="mr-1" />
                  Active
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              API Key: {'* '.repeat(Math.max(0, (setting.apiKey?.length || 0) - 4)) + (setting.apiKey?.slice(-4) || 'Not Set')}
            </p>
            {setting.temperature !== undefined && (
              <p className="text-sm text-gray-600 dark:text-gray-300">Temperature: {setting.temperature}</p>
            )}
            {setting.maxTokens !== undefined && (
              <p className="text-sm text-gray-600 dark:text-gray-300">Max Tokens: {setting.maxTokens}</p>
            )}
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => onEdit(setting)}
              disabled={isLoading}
            >
              <Edit size={16} className="mr-1" /> Edit
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isLoading}>
                  <Trash2 size={16} className="mr-1" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the '{setting.name}' AI configuration.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(setting.id!)} disabled={isLoading}>
                    Yes, delete it
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button 
              variant="default"
              size="sm"
              onClick={() => handleSetCurrent(setting.id!)}
              disabled={isLoading || currentSettingId === setting.id}
              className={`${currentSettingId === setting.id ? 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600' : ''}`}
            >
              <Power size={16} className="mr-1" /> 
              {currentSettingId === setting.id ? 'Active' : 'Set Active'}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default AISettingsList; 