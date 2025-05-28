import React from 'react';
import RoleList from '../features/main/RoleList';
import TagList from '../features/main/TagList';
import SystemPromptComposer from '../features/main/SystemPromptComposer';
import DialogControls from '../features/main/DialogControls';
import ChatInterface from '../features/main/ChatInterface';

const MainPageLayout: React.FC = () => {
  return (
    <div className="flex flex-col lg:flex-row h-screen bg-background text-foreground">
      {/* Left Column */}
      <div className="w-full lg:w-1/4 p-4 bg-muted/40 dark:bg-muted/20 border-r dark:border-border lg:overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4 sticky top-0 bg-muted/80 dark:bg-muted/60 backdrop-blur-sm py-2 z-10">Roles</h2>
        <RoleList />
      </div>

      {/* Center Column */}
      <div className="w-full lg:flex-1 flex flex-col border-r dark:border-border">
        {/* Top section: Dialog Controls & System Prompt */}
        <div className="p-4 border-b dark:border-border">
          <DialogControls />
          <h2 className="text-lg font-semibold mt-4">System Prompt</h2>
          <SystemPromptComposer />
        </div>
        {/* Bottom section: Chat Interface */}
        <div className="flex-1 p-4 overflow-y-auto">
          {/* <h2 className="text-lg font-semibold mb-4">Chat</h2> Removed as ChatInterface likely has its own context */}
          <ChatInterface />
        </div>
      </div>

      {/* Right Column */}
      <div className="w-full lg:w-1/4 p-4 bg-muted/40 dark:bg-muted/20 border-l dark:border-border lg:overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4 sticky top-0 bg-muted/80 dark:bg-muted/60 backdrop-blur-sm py-2 z-10">Tags</h2>
        <TagList />
      </div>
    </div>
  );
};

export default MainPageLayout; 