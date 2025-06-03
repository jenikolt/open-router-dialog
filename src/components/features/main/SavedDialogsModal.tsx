import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Edit2, MessageSquare, Calendar, User, X } from 'lucide-react';
import { getAllDialogs, deleteDialog, updateDialogName } from '@/services/dialogService';
import { useChatStore } from '@/stores/chatStore';
import { useUIStateStore } from '@/stores/uiStateStore';
import type { Dialog as DialogType } from '@/types';

interface SavedDialogsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SavedDialogsModal: React.FC<SavedDialogsModalProps> = ({ open, onOpenChange }) => {
  const [dialogs, setDialogs] = useState<DialogType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  const loadDialog = useChatStore(state => state.loadDialog);
  const setActiveModal = useUIStateStore(state => state.setActiveModal);

  useEffect(() => {
    if (open) {
      loadDialogs();
    }
  }, [open]);

  const loadDialogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const savedDialogs = await getAllDialogs('lastUpdatedAt', 'desc');
      setDialogs(savedDialogs);
    } catch (err: any) {
      setError(err.message || 'Failed to load dialogs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadDialog = (dialog: DialogType) => {
    loadDialog(dialog);
    onOpenChange(false);
    setActiveModal(null);
  };

  const handleDeleteDialog = async (dialogId: number) => {
    if (!confirm('Are you sure you want to delete this dialog?')) {
      return;
    }

    try {
      await deleteDialog(dialogId);
      setDialogs(dialogs.filter(d => d.id !== dialogId));
    } catch (err: any) {
      console.error('Failed to delete dialog:', err);
      alert('Failed to delete dialog');
    }
  };

  const handleStartEdit = (dialog: DialogType) => {
    setEditingId(dialog.id!);
    setEditingName(dialog.name || '');
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editingName.trim()) {
      return;
    }

    try {
      await updateDialogName(editingId, editingName.trim());
      setDialogs(dialogs.map(d => 
        d.id === editingId 
          ? { ...d, name: editingName.trim() }
          : d
      ));
      setEditingId(null);
      setEditingName('');
    } catch (err: any) {
      console.error('Failed to update dialog name:', err);
      alert('Failed to update dialog name');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDialogPreview = (dialog: DialogType) => {
    if (dialog.messages.length === 0) {
      return 'Empty dialog';
    }
    const firstMessage = dialog.messages[0];
    return firstMessage.content.substring(0, 100) + (firstMessage.content.length > 100 ? '...' : '');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Saved Dialogs</DialogTitle>
              <DialogDescription>
                Load, manage, or delete your saved conversations
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading dialogs...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="text-center">
                <p className="text-destructive font-medium">Failed to load dialogs</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button onClick={loadDialogs} variant="outline">
                Try Again
              </Button>
            </div>
          ) : dialogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <MessageSquare className="h-12 w-12 text-muted-foreground" />
              <div className="text-center">
                <p className="text-lg font-medium">No saved dialogs</p>
                <p className="text-sm text-muted-foreground">Start a conversation and it will be saved automatically</p>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-3 pr-4">
                {dialogs.map((dialog) => (
                  <div
                    key={dialog.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0 space-y-2">
                        {/* Dialog Name/Title */}
                        <div className="flex items-center gap-2">
                          {editingId === dialog.id ? (
                            <div className="flex items-center gap-2 flex-1">
                              <Input
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEdit();
                                  if (e.key === 'Escape') handleCancelEdit();
                                }}
                                className="text-sm"
                                autoFocus
                              />
                              <Button size="sm" onClick={handleSaveEdit}>
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 flex-1">
                              <h3 className="font-medium text-sm truncate">
                                {dialog.name || 'Untitled Dialog'}
                              </h3>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-60 hover:opacity-100"
                                onClick={() => handleStartEdit(dialog)}
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Dialog Preview */}
                        <div className="text-xs text-muted-foreground">
                          {getDialogPreview(dialog)}
                        </div>

                        {/* Dialog Meta Info */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            <span>{dialog.messages.length} messages</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(dialog.lastUpdatedAt)}</span>
                          </div>
                          {dialog.systemPrompt && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>System prompt</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleLoadDialog(dialog)}
                          className="shrink-0"
                        >
                          Load
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteDialog(dialog.id!)}
                          className="shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter className="px-6 pb-6">
          <DialogClose asChild>
            <Button variant="outline">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SavedDialogsModal; 