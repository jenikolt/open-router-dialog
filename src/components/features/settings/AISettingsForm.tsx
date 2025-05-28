import React, { useState, useEffect } from 'react';
import type { AISettings } from '@/types';
import { useAISettingsStore } from '@/stores/aiSettingsStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { X } from 'lucide-react';

interface AISettingsFormProps {
  initialData?: AISettings; // For editing an existing setting
  onClose: () => void;      // Callback to close the form
}

const AISettingsForm: React.FC<AISettingsFormProps> = ({ initialData, onClose }) => {
  const { addSetting, updateSetting, isLoading, error } = useAISettingsStore();
  
  const [name, setName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [temperature, setTemperature] = useState<string | number>('0.7'); // Store as string for input, convert on submit
  const [maxTokens, setMaxTokens] = useState<string | number>('2048');   // Store as string for input, convert on submit
  const [formError, setFormError] = useState<string | null>(null);

  const isEditing = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setApiKey(initialData.apiKey || '');
      setModel(initialData.model || '');
      setTemperature(initialData.temperature?.toString() || '0.7');
      setMaxTokens(initialData.maxTokens?.toString() || '2048');
    } else {
      // Reset for new form
      setName('');
      setApiKey('');
      setModel('');
      setTemperature('0.7');
      setMaxTokens('2048');
    }
    setFormError(null); // Clear errors when initialData changes or form is reset
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim() || !apiKey.trim() || !model.trim()) {
      setFormError('Name, API Key, and Model are required.');
      return;
    }

    const tempValue = parseFloat(temperature as string);
    const maxTokensValue = parseInt(maxTokens as string, 10);

    if (isNaN(tempValue) || tempValue < 0 || tempValue > 2) {
      setFormError('Temperature must be a number between 0 and 2.');
      return;
    }
    if (isNaN(maxTokensValue) || maxTokensValue <= 0) {
      setFormError('Max Tokens must be a positive integer.');
      return;
    }

    const settingData: Omit<AISettings, 'id'> & { id?: number } = {
      name,
      apiKey,
      model,
      temperature: tempValue,
      maxTokens: maxTokensValue,
    };

    let success = false;
    try {
      if (isEditing && initialData?.id) {
        await updateSetting({ ...settingData, id: initialData.id });
        success = true;
      } else {
        await addSetting(settingData);
        success = true;
      }
    } catch (err) {
      // Error is handled by the store and will be reflected in the error state
      success = false;
    }

    if (success) {
      onClose(); // Close form on successful add/update
    } else if (!error) { // If store error is not set, means validation or other issue
      setFormError('Failed to save settings. Please try again.');
    }
    // If store.error is set, it will be displayed by the parent component (SettingsPage)
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{isEditing ? 'Edit' : 'Add New'} AI Configuration</CardTitle>
          <CardDescription>
            {isEditing ? `Updating '${initialData?.name}'` : 'Provide details for the new AI provider configuration.'}
          </CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close form">
          <X className="h-5 w-5" />
        </Button>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Configuration Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., My OpenAI GPT-4" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="apiKey">API Key</Label>
            <Input id="apiKey" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-xxxxxxxxxxxxxxxxx" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="model">Model Name</Label>
            <Input id="model" value={model} onChange={(e) => setModel(e.target.value)} placeholder="gpt-4, claude-3-opus-20240229, etc." required />
            <p className="text-xs text-gray-500">Refer to OpenRouter documentation for available model names.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="temperature">Temperature (0-2)</Label>
              <Input id="temperature" type="number" step="0.1" min="0" max="2" value={temperature} onChange={(e) => setTemperature(e.target.value)} placeholder="0.7" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="maxTokens">Max Tokens</Label>
              <Input id="maxTokens" type="number" step="1" min="1" value={maxTokens} onChange={(e) => setMaxTokens(e.target.value)} placeholder="2048" />
            </div>
          </div>
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          {/* Display store error if it exists and isn't related to a specific field already handled by formError */}
          {error && !formError && <p className="text-sm text-red-500">Store error: {error}</p>} 
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Save Changes' : 'Add Configuration')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AISettingsForm; 