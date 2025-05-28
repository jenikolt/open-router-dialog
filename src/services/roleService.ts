// src/services/roleService.ts
import { db } from '@/lib/db';
import type { Role } from '@/types';
import { useUIStateStore } from '@/stores/uiStateStore';

export const roleService = {
  getAllRoles: async (): Promise<Role[]> => {
    const { setGlobalLoading, setGlobalError } = useUIStateStore.getState();
    setGlobalLoading(true);
    setGlobalError(null);
    try {
      const roles = await db.roles.toArray();
      setGlobalLoading(false);
      return roles;
    } catch (error: any) {
      console.error("Error fetching all roles:", error);
      const message = error.message || "Failed to fetch roles.";
      setGlobalError(message);
      setGlobalLoading(false);
      throw new Error(message);
    }
  },

  getRoleById: async (id: number): Promise<Role | undefined> => {
    const { setGlobalLoading, setGlobalError } = useUIStateStore.getState();
    setGlobalLoading(true);
    setGlobalError(null);
    try {
      const role = await db.roles.get(id);
      setGlobalLoading(false);
      return role;
    } catch (error: any) {
      console.error(`Error fetching role with id ${id}:`, error);
      const message = error.message || `Failed to fetch role ${id}.`;
      setGlobalError(message);
      setGlobalLoading(false);
      throw new Error(message);
    }
  },

  addRole: async (role: Omit<Role, 'id'>): Promise<number> => {
    const { setGlobalLoading, setGlobalError } = useUIStateStore.getState();
    setGlobalLoading(true);
    setGlobalError(null);
    try {
      // Dexie handles auto-incrementing ID if 'id' is primary and auto-incrementing
      const id = await db.roles.add(role as Role); 
      setGlobalLoading(false);
      return id;
    } catch (error: any) {
      console.error("Error adding role:", error);
      const message = error.message || "Failed to add role.";
      setGlobalError(message);
      setGlobalLoading(false);
      throw new Error(message);
    }
  },

  updateRole: async (role: Role): Promise<number> => {
    const { setGlobalLoading, setGlobalError } = useUIStateStore.getState();
    setGlobalLoading(true);
    setGlobalError(null);
    if (!role.id) {
      const errMessage = "Role ID is required for update.";
      setGlobalError(errMessage);
      setGlobalLoading(false);
      throw new Error(errMessage);
    }
    try {
      const updatedCount = await db.roles.update(role.id, role);
      setGlobalLoading(false);
      if (updatedCount === 0) throw new Error("Role not found for update, or data unchanged.");
      return role.id;
    } catch (error: any) {
      console.error("Error updating role:", error);
      const message = error.message || "Failed to update role.";
      setGlobalError(message);
      setGlobalLoading(false);
      throw new Error(message);
    }
  },

  deleteRole: async (id: number): Promise<void> => {
    const { setGlobalLoading, setGlobalError } = useUIStateStore.getState();
    setGlobalLoading(true);
    setGlobalError(null);
    try {
      await db.roles.delete(id);
      setGlobalLoading(false);
    } catch (error: any) {
      console.error("Error deleting role:", error);
      const message = error.message || "Failed to delete role.";
      setGlobalError(message);
      setGlobalLoading(false);
      throw new Error(message);
    }
  },
}; 