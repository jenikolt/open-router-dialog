import React, { useState, useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Paperclip, Mic, SendHorizonal, AlertTriangle, Loader2, Lightbulb } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { v4 as uuidv4 } from 'uuid';

import { useChatStore } from '@/stores/chatStore';
import { useAISettingsStore } from '@/stores/aiSettingsStore';
import { useUIStateStore } from '@/stores/uiStateStore';
import { useMSPromptsStore } from '@/stores/msPromptsStore';
import { getOpenRouterCompletion } from '@/services/aiService';
import MSPromptsModal from './MSPromptsModal';

const ChatInterface: React.FC = () => {
  const { 
    messages,
    isLoading: isChatLoading, 
    error: chatError, // Local error for chat interface
    appendUserMessage, 
    appendAssistantMessageChunk,
    setLoading: setChatLoading, 
    setError: setChatError,
    saveCurrentDialog,
    setSystemPromptUsedThisSession
  } = useChatStore();
  
  const apiKey = useAISettingsStore(state => state.apiKey);
  const model = useAISettingsStore(state => state.model);
  const { composedSystemPrompt } = useUIStateStore();
  const setGlobalLoading = useUIStateStore(state => state.setGlobalLoading);
  const setGlobalError = useUIStateStore(state => state.setGlobalError);
  
  const { isModalOpen, setModalOpen } = useMSPromptsStore();

  const [inputValue, setInputValue] = useState<string>('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Update system prompt in chatStore when it changes in uiStateStore
    setSystemPromptUsedThisSession(composedSystemPrompt);
  }, [composedSystemPrompt, setSystemPromptUsedThisSession]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    if (!apiKey || !model) {
      // Use global error for critical config issues, local for chat-specific UI
      setGlobalError("API Key or Model not configured. Please check your settings.");
      // setChatError("API Key or Model not configured. Please check your settings."); 
      return;
    }
    // setChatError(null); // Clear local chat error
    // Global error is cleared by aiService

    const userMessageContent = inputValue.trim();
    appendUserMessage(userMessageContent);
    setInputValue('');
    setChatLoading(true); // Local loading for UI elements like send button
    // Global loading is set by aiService

    // Prepare chat history for the API - only user and assistant roles
    const historyForAPI = messages.filter(msg => msg.role === 'user' || msg.role === 'assistant');

    try {
      const stream = await getOpenRouterCompletion({
        systemPrompt: composedSystemPrompt || "You are a helpful assistant.", // Use composed or a default
        chatHistory: historyForAPI, 
        userMessage: userMessageContent,
        apiKey,
        model,
      });

      let assistantMessageId = uuidv4();
      let firstChunk = true;
      let fullAssistantResponse = "";

      for await (const chunk of stream) {
        const contentChunk = chunk.choices[0]?.delta?.content || "";
        if (contentChunk) {
          fullAssistantResponse += contentChunk;
          if (firstChunk) {
            appendAssistantMessageChunk(assistantMessageId, contentChunk, true);
            firstChunk = false;
          } else {
            appendAssistantMessageChunk(assistantMessageId, contentChunk);
          }
        }
      }
      // Once stream is complete, if you need to do a final update (e.g. save to DB with full content)
      // You could use setAssistantMessageContent(assistantMessageId, fullAssistantResponse);
      // For now, appendAssistantMessageChunk handles the progressive update.

      await saveCurrentDialog(); // Save dialog after successful AI response stream
      setGlobalLoading(false); // Turn off global loading indicator

    } catch (error: any) {
      console.error("Error during AI completion or stream processing:", error);
      // aiService would have set globalError & globalLoading(false) if initial request failed.
      // If error happened during stream processing, aiService's catch might not have run for this error.
      // So, ensure global states are correctly set.
      const errorMessage = error.message || "An unexpected error occurred with the AI service.";
      setGlobalError(errorMessage); // Set/update global error
      setGlobalLoading(false);      // Ensure global loading is off

      setChatError(errorMessage);   // Set local chat error for UI feedback within chat
      await saveCurrentDialog(); // Also save dialog if an error occurs
    } finally {
      setChatLoading(false); // Turn off local chat loading state
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(event.target.value);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
      <ScrollArea className="flex-grow p-4 space-y-4" ref={scrollAreaRef}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col mb-3 ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-2xl px-4 py-2.5 rounded-lg shadow-md ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white dark:bg-blue-600'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}
            >
              {msg.role === 'assistant' ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown
                    components={{ 
                      p: ({node, ...props}) => <p className="mb-1 last:mb-0" {...props} />,
                      // Add other element customizations here if needed, e.g. for ul, ol, code, etc.
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-1">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </ScrollArea>

      {chatError && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <p className="text-sm font-medium">{chatError}</p>
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 dark:border-gray-700 p-3 flex items-end space-x-2">
        <div className="flex flex-col space-y-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            onClick={() => setModalOpen(true)}
            title="Prompts from MS"
          >
            <Lightbulb className="w-5 h-5" />
            <span className="sr-only">MS Prompts</span>
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
            <Paperclip className="w-5 h-5" />
            <span className="sr-only">Attach file</span>
          </Button>
        </div>
        <Textarea
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="flex-grow resize-none p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100"
          rows={1}
          onInput={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${target.scrollHeight}px`;
          }}
          disabled={isChatLoading}
        />
        {isChatLoading ? (
          <Button size="icon" disabled className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="sr-only">Sending...</span>
          </Button>
        ) : inputValue ? (
          <Button onClick={handleSendMessage} size="icon" className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white">
            <SendHorizonal className="w-5 h-5" />
            <span className="sr-only">Send message</span>
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
            <Mic className="w-5 h-5" />
            <span className="sr-only">Use microphone</span>
          </Button>
        )}
      </div>
      
      <MSPromptsModal 
        open={isModalOpen} 
        onOpenChange={setModalOpen} 
      />
    </div>
  );
};

export default ChatInterface; 