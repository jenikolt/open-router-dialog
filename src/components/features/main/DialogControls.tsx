import React from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useUIStateStore } from '@/stores/uiStateStore';

const DialogControls: React.FC = () => {
  const clearChat = useChatStore(state => state.clearChat);
  const composedSystemPrompt = useUIStateStore(state => state.composedSystemPrompt);
  const setActiveModal = useUIStateStore(state => state.setActiveModal);

  const handleNewDialog = () => {
    // Create a new dialog by clearing the current chat and using the current system prompt
    const systemPromptToUse = composedSystemPrompt || 'You are a helpful assistant.';
    clearChat(systemPromptToUse);
  };

  const handleShowSavedDialogs = () => {
    // Show the saved dialogs modal
    setActiveModal('savedDialogs');
  };

  return (
    <div className="flex justify-end space-x-2 mb-4">
      {/* New Dialog Button */}
      <button 
        onClick={handleNewDialog}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
      >
        New Dialog
      </button>

      {/* Saved Dialogs Button */}
      <button 
        onClick={handleShowSavedDialogs}
        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        Saved Dialogs
      </button>
    </div>
  );
};

export default DialogControls; 