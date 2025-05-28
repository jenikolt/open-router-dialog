import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // For naming preset
import { useUIStateStore } from '@/stores/uiStateStore';
import { usePromptPresetStore } from '@/stores/promptPresetStore';
import { Save, List, Brain, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog'; // For "More Presets" modal
import { ScrollArea } from '@/components/ui/scroll-area';

const PromptPresetControls: React.FC = () => {
  const composedSystemPrompt = useUIStateStore(state => state.composedSystemPrompt);
  const selectedRoleId = useUIStateStore(state => state.selectedRoleId);
  const selectedTagIds = useUIStateStore(state => state.selectedTagIds);
  const setComposedSystemPrompt = useUIStateStore(state => state.setComposedSystemPrompt);
  const setSelectedRoleId = useUIStateStore(state => state.setSelectedRoleId);
  const setSelectedTagIds = useUIStateStore(state => state.setSelectedTagIds);

  const { presets, loadPresets, addPreset, deletePreset, updatePreset, isLoading } = usePromptPresetStore();

  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [isSavePresetDialogOpen, setIsSavePresetDialogOpen] = useState(false);

  useEffect(() => {
    loadPresets(); // Load presets when component mounts
  }, [loadPresets]);

  const handleSavePreset = async () => {
    if (!newPresetName.trim()) {
      alert('Please enter a name for the preset.'); // Replace with better notification
      return;
    }
    if (!composedSystemPrompt.trim()) {
      alert('System prompt is empty, cannot save as preset.');
      return;
    }

    await addPreset({
      name: newPresetName.trim(),
      systemPrompt: composedSystemPrompt,
      roleId: selectedRoleId ?? undefined, // Ensure undefined if null
      tagIds: selectedTagIds,
    });
    setNewPresetName('');
    setIsSavePresetDialogOpen(false);
    // Optionally, add a notification for successful save
  };

  const handleLoadPreset = (preset: NonNullable<typeof presets[0]>) => {
    setComposedSystemPrompt(preset.systemPrompt);
    setSelectedRoleId(preset.roleId ?? null);
    setSelectedTagIds(preset.tagIds ?? []);
    // Update lastUsedAt (fire and forget, or handle loading/error state if critical)
    if (preset.id) {
      const updatedPresetData = { ...preset, lastUsedAt: new Date() };
      updatePreset(updatedPresetData); // This will also refresh the local store order if sort is by lastUsedAt
    }
    setIsPresetsModalOpen(false); // Close modal if open
  };
  
  const recentPresets = presets.slice(0, 3); // Show top 3 most recently used/added

  return (
    <div className="py-2 space-y-3">
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsSavePresetDialogOpen(true)}
          disabled={isLoading || !composedSystemPrompt.trim()}
          className="flex-grow sm:flex-grow-0"
        >
          <Save className="w-4 h-4 mr-2" />
          Save as Preset
        </Button>
        {presets.length > 0 && (
            <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsPresetsModalOpen(true)}
                className="flex-grow sm:flex-grow-0"
             >
                <List className="w-4 h-4 mr-2" />
                More Presets ({presets.length})
            </Button>
        )}
      </div>

      {/* Display a few recent presets as buttons */} 
      {recentPresets.length > 0 && !isSavePresetDialogOpen && (
        <div className="mt-2 space-y-1">
          <p className='text-xs text-gray-500 dark:text-gray-400 px-1'>Quick Load:</p>
          <div className="flex flex-wrap gap-2">
            {recentPresets.map((preset) => (
              <Button
                key={preset.id}
                variant="secondary"
                size="sm"
                onClick={() => handleLoadPreset(preset)}
                className="text-xs"
              >
                <Brain className="w-3 h-3 mr-1.5" />
                {preset.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Dialog for Naming and Saving Preset */} 
      <Dialog open={isSavePresetDialogOpen} onOpenChange={setIsSavePresetDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save System Prompt as Preset</DialogTitle>
            <DialogDescription>
              Enter a name for this system prompt configuration.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-2">
            <label htmlFor="presetName" className="text-sm font-medium">
              Preset Name
            </label>
            <Input
              id="presetName"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              placeholder="e.g., Creative Writer, Python Coder"
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                <p className="font-medium">Current System Prompt (for reference):</p>
                <ScrollArea className="h-20 mt-1 p-2 border rounded">
                    <p className='whitespace-pre-wrap'>{composedSystemPrompt || "(empty)"}</p>
                </ScrollArea>
            </div>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button type="button" onClick={handleSavePreset} disabled={isLoading || !newPresetName.trim() || !composedSystemPrompt.trim()}>
              <Save className="w-4 h-4 mr-2" /> Save Preset
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for Listing All Presets */} 
      <Dialog open={isPresetsModalOpen} onOpenChange={setIsPresetsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Load Prompt Preset</DialogTitle>
            <DialogDescription>
              Select a saved preset to apply its system prompt, role, and tags.
            </DialogDescription>
          </DialogHeader>
          {/* TODO: Search/Filter Input */} 
          <ScrollArea className="h-[300px] my-4 pr-3">
            {presets.length > 0 ? (
              <div className="space-y-2">
                {presets.map((preset) => (
                  <div 
                    key={preset.id} 
                    className="flex items-center justify-between p-3 rounded-md border hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-sm">{preset.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                        {preset.systemPrompt}
                      </p>
                    </div>
                    <div className='flex space-x-1'>
                        <Button variant="default" size="sm" onClick={() => handleLoadPreset(preset)}>
                            Load
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => deletePreset(preset.id!)} disabled={isLoading}>
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                No presets saved yet.
              </p>
            )}
          </ScrollArea>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PromptPresetControls; 