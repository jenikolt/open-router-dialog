import { db } from '@/lib/db';
import type { Tag } from '@/types';
import { useUIStateStore } from '@/stores/uiStateStore';

export const tagService = {
  getAllTags: async (): Promise<Tag[]> => {
    const { setGlobalLoading, setGlobalError } = useUIStateStore.getState();
    setGlobalLoading(true);
    setGlobalError(null);
    try {
      const tags = await db.tags.toArray();
      setGlobalLoading(false);
      return tags;
    } catch (error: any) {
      console.error("Error fetching all tags:", error);
      const message = error.message || "Failed to fetch tags.";
      setGlobalError(message);
      setGlobalLoading(false);
      throw new Error(message);
    }
  },

  getTagById: async (id: number): Promise<Tag | undefined> => {
    const { setGlobalLoading, setGlobalError } = useUIStateStore.getState();
    setGlobalLoading(true);
    setGlobalError(null);
    try {
      const tag = await db.tags.get(id);
      setGlobalLoading(false);
      return tag;
    } catch (error: any) {
      console.error(`Error fetching tag with id ${id}:`, error);
      const message = error.message || `Failed to fetch tag ${id}.`;
      setGlobalError(message);
      setGlobalLoading(false);
      throw new Error(message);
    }
  },

  getTagsByRoleId: async (roleId: number): Promise<Tag[]> => {
    const { setGlobalLoading, setGlobalError } = useUIStateStore.getState();
    setGlobalLoading(true);
    setGlobalError(null);
    try {
      const tags = await db.tags.where('roleId').equals(roleId).toArray();
      setGlobalLoading(false);
      return tags;
    } catch (error: any) {
      console.error(`Error fetching tags for roleId ${roleId}:`, error);
      const message = error.message || "Failed to fetch role-specific tags.";
      setGlobalError(message);
      setGlobalLoading(false);
      throw new Error(message);
    }
  },

  getGeneralTags: async (): Promise<Tag[]> => {
    const { setGlobalLoading, setGlobalError } = useUIStateStore.getState();
    setGlobalLoading(true);
    setGlobalError(null);
    try {
      const allTags = await db.tags.toArray();
      const tags = allTags.filter(tag => tag.isGeneral === true);
      setGlobalLoading(false);
      return tags;
    } catch (error: any) {
      console.error("Error fetching general tags:", error);
      const message = error.message || "Failed to fetch general tags.";
      setGlobalError(message);
      setGlobalLoading(false);
      throw new Error(message);
    }
  },

  addTag: async (tag: Omit<Tag, 'id'>): Promise<number> => {
    const { setGlobalLoading, setGlobalError } = useUIStateStore.getState();
    setGlobalLoading(true);
    setGlobalError(null);
    try {
      const id = await db.tags.add(tag as Tag);
      setGlobalLoading(false);
      return id;
    } catch (error: any) {
      console.error("Error adding tag:", error);
      const message = error.message || "Failed to add tag.";
      setGlobalError(message);
      setGlobalLoading(false);
      throw new Error(message);
    }
  },

  // Alias for addTag to match usage in components
  createTag: async (tag: Omit<Tag, 'id'>): Promise<number> => {
    return tagService.addTag(tag);
  },

  updateTag: async (tag: Tag): Promise<number> => {
    const { setGlobalLoading, setGlobalError } = useUIStateStore.getState();
    setGlobalLoading(true);
    setGlobalError(null);
    if (!tag.id) {
      const errMessage = "Tag ID is required for update.";
      setGlobalError(errMessage);
      setGlobalLoading(false);
      throw new Error(errMessage);
    }
    try {
      const updatedCount = await db.tags.update(tag.id, tag);
      setGlobalLoading(false);
      if (updatedCount === 0) throw new Error("Tag not found for update, or data unchanged.");
      return tag.id;
    } catch (error: any) {
      console.error("Error updating tag:", error);
      const message = error.message || "Failed to update tag.";
      setGlobalError(message);
      setGlobalLoading(false);
      throw new Error(message);
    }
  },

  deleteTag: async (id: number): Promise<void> => {
    const { setGlobalLoading, setGlobalError } = useUIStateStore.getState();
    setGlobalLoading(true);
    setGlobalError(null);
    try {
      await db.tags.delete(id);
      setGlobalLoading(false);
    } catch (error: any) {
      console.error("Error deleting tag:", error);
      const message = error.message || "Failed to delete tag.";
      setGlobalError(message);
      setGlobalLoading(false);
      throw new Error(message);
    }
  },
}; 