import React, { useEffect, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import { useUIStateStore } from '@/stores/uiStateStore';
import { roleService } from '@/services/roleService';
import { tagService } from '@/services/tagService';
import PromptPresetControls from './PromptPresetControls';

const SystemPromptComposer: React.FC = () => {
  const { 
    selectedRoleId, 
    selectedTagIds, 
    composedSystemPrompt, 
    setComposedSystemPrompt,
    isSystemPromptVisible,
    toggleSystemPromptVisibility
  } = useUIStateStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-compose system prompt when role or tags change
  useEffect(() => {
    const composeSystemPrompt = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        let promptParts: string[] = [];

        // Add role description if a role is selected
        if (selectedRoleId) {
          const role = await roleService.getRoleById(selectedRoleId);
          if (role) {
            promptParts.push(role.description);
          }
        }

        // Add selected tags
        if (selectedTagIds.length > 0) {
          const allTags = await tagService.getAllTags();
          const selectedTags = allTags.filter(tag => 
            selectedTagIds.includes(tag.id!) && 
            (tag.isGeneral || tag.roleId === selectedRoleId)
          );
          
          for (const tag of selectedTags) {
            promptParts.push(tag.content);
          }
        }

        // Compose the final prompt
        const newPrompt = promptParts.length > 0 
          ? promptParts.join('\n\n')
          : 'You are a helpful assistant.';
        
        setComposedSystemPrompt(newPrompt);
      } catch (err) {
        setError('Failed to compose system prompt');
        console.error('Error composing system prompt:', err);
      } finally {
        setIsLoading(false);
      }
    };

    composeSystemPrompt();
  }, [selectedRoleId, selectedTagIds, setComposedSystemPrompt]);

  const handleManualRefresh = async () => {
    // Trigger recomposition manually
    const composeSystemPrompt = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        let promptParts: string[] = [];

        if (selectedRoleId) {
          const role = await roleService.getRoleById(selectedRoleId);
          if (role) {
            promptParts.push(role.description);
          }
        }

        if (selectedTagIds.length > 0) {
          const allTags = await tagService.getAllTags();
          const selectedTags = allTags.filter(tag => 
            selectedTagIds.includes(tag.id!) && 
            (tag.isGeneral || tag.roleId === selectedRoleId)
          );
          
          for (const tag of selectedTags) {
            promptParts.push(tag.content);
          }
        }

        const newPrompt = promptParts.length > 0 
          ? promptParts.join('\n\n')
          : 'You are a helpful assistant.';
        
        setComposedSystemPrompt(newPrompt);
      } catch (err) {
        setError('Failed to compose system prompt');
        console.error('Error composing system prompt:', err);
      } finally {
        setIsLoading(false);
      }
    };

    await composeSystemPrompt();
  };

  const handlePromptChange = (value: string) => {
    setComposedSystemPrompt(value);
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* System Prompt Controls */}
      <div className="flex items-center justify-between">
        <Label htmlFor="system-prompt" className="text-sm font-medium">
          System Prompt
        </Label>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isLoading}
            className="h-8"
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSystemPromptVisibility}
            className="h-8"
          >
            {isSystemPromptVisible ? 'Hide' : 'Show'}
          </Button>
        </div>
      </div>

      {/* System Prompt Textarea (collapsible) */}
      {isSystemPromptVisible && (
        <div className="space-y-2">
          <Textarea
            id="system-prompt"
            rows={6}
            className="w-full resize-none"
            placeholder="Your system prompt will be composed here based on selected role and tags..."
            value={composedSystemPrompt}
            onChange={(e) => handlePromptChange(e.target.value)}
          />
          
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          
          {isLoading && (
            <p className="text-sm text-muted-foreground">Composing prompt...</p>
          )}
          
          <div className="text-xs text-muted-foreground">
            Characters: {composedSystemPrompt.length}
          </div>
        </div>
      )}

      {/* Preset Controls */}
      <Card>
        <CardContent className="p-4">
          <PromptPresetControls />
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemPromptComposer; 