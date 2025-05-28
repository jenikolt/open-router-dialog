import { db } from '@/lib/db';
import type { Dialog, ChatMessage } from '@/types';

/**
 * Saves or updates a dialog session.
 * If dialogData.id is provided and exists, it updates.
 * Otherwise, it creates a new dialog.
 * @param dialogData - The dialog data. Messages and systemPrompt are required.
 * @returns The id of the saved/updated dialog.
 */
export const saveDialog = async (
  dialogData: Omit<Dialog, 'id' | 'createdAt' | 'lastUpdatedAt'> & { id?: number | string | null }
): Promise<number> => {
  const now = new Date();
  
  if (dialogData.id && typeof dialogData.id === 'number') {
    // Update existing dialog
    const updatedCount = await db.dialogs.update(dialogData.id, {
      messages: dialogData.messages,
      systemPrompt: dialogData.systemPrompt,
      name: dialogData.name,
      lastUpdatedAt: now,
    });
    if (updatedCount === 0) {
      console.warn(`Dialog with id ${dialogData.id} not found for update. Creating new one.`);
      // Fall through to create if update failed to find the dialog
      const newId = await db.dialogs.add({
        name: dialogData.name,
        messages: dialogData.messages,
        systemPrompt: dialogData.systemPrompt,
        createdAt: now,
        lastUpdatedAt: now,
      });
      return newId;
    }
    return dialogData.id;
  } else {
    // Create new dialog
    const newId = await db.dialogs.add({
      name: dialogData.name,
      messages: dialogData.messages,
      systemPrompt: dialogData.systemPrompt,
      createdAt: now,
      lastUpdatedAt: now,
    });
    return newId;
  }
};

/**
 * Retrieves a specific dialog by its ID.
 * @param id - The ID of the dialog to retrieve.
 * @returns The dialog object or undefined if not found.
 */
export const getDialog = async (id: number): Promise<Dialog | undefined> => {
  return db.dialogs.get(id);
};

/**
 * Retrieves all dialogs, optionally sorted.
 * @param sortBy - Field to sort by (e.g., 'lastUpdatedAt', 'createdAt', 'name'). Defaults to 'lastUpdatedAt'.
 * @param order - Sort order ('asc' or 'desc'). Defaults to 'desc'.
 * @returns A promise that resolves to an array of dialogs.
 */
export const getAllDialogs = async (
  sortBy: keyof Dialog = 'lastUpdatedAt',
  order: 'asc' | 'desc' = 'desc'
): Promise<Dialog[]> => {
  let query = db.dialogs.orderBy(sortBy);
  if (order === 'desc') {
    query = query.reverse();
  }
  return query.toArray();
};

/**
 * Deletes a specific dialog by its ID.
 * @param id - The ID of the dialog to delete.
 */
export const deleteDialog = async (id: number): Promise<void> => {
  return db.dialogs.delete(id);
};

/**
 * Updates the name of a specific dialog.
 * @param id - The ID of the dialog to update.
 * @param name - The new name for the dialog.
 */
export const updateDialogName = async (id: number, name: string): Promise<void> => {
  await db.dialogs.update(id, { name: name, lastUpdatedAt: new Date() });
};

/**
 * Adds a message to an existing dialog.
 * @param dialogId - The ID of the dialog to add the message to.
 * @param message - The ChatMessage object to add.
 * @returns true if successful, false otherwise.
 */
export const addMessageToDialog = async (dialogId: number, message: ChatMessage): Promise<boolean> => {
  const dialog = await db.dialogs.get(dialogId);
  if (dialog) {
    const updatedMessages = [...dialog.messages, message];
    await db.dialogs.update(dialogId, { 
      messages: updatedMessages, 
      lastUpdatedAt: new Date() 
    });
    return true;
  }
  return false;
}; 