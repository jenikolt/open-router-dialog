import type { MSPrompt } from '@/types';

const MS_PROMPTS_API_URL = '/api/ms-prompts';

export async function fetchMSPrompts(): Promise<MSPrompt[]> {
  try {
    const response = await fetch(MS_PROMPTS_API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch MS prompts: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Ensure the response is an array
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format: expected an array');
    }

    // Validate that each item has the required fields
    const prompts: MSPrompt[] = data.filter((item: any) => 
      item.Id && 
      item.Title && 
      item.DisplayCategory && 
      item.DisplayText
    );

    return prompts;
  } catch (error) {
    console.error('Error fetching MS prompts:', error);
    throw error;
  }
} 