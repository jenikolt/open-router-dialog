import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import type { Role } from '@/types';
import { roleService } from '@/services/roleService';

const RoleEditor: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedRoles = await roleService.getAllRoles();
      setRoles(fetchedRoles);
    } catch (err) {
      setError('Failed to fetch roles.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleEdit = (role: Role) => {
    setCurrentRole(role);
    setRoleName(role.name);
    setRoleDescription(role.description);
  };

  const handleClearForm = () => {
    setCurrentRole(null);
    setRoleName('');
    setRoleDescription('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!roleName.trim()) {
      setError('Role name cannot be empty.');
      setIsLoading(false);
      return;
    }

    try {
      if (currentRole) {
        await roleService.updateRole({ ...currentRole, name: roleName, description: roleDescription });
      } else {
        await roleService.addRole({ name: roleName, description: roleDescription });
      }
      handleClearForm();
      fetchRoles(); // Refresh the list
    } catch (err) {
      setError(currentRole ? 'Failed to update role.' : 'Failed to create role.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this role?')) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await roleService.deleteRole(id);
      fetchRoles(); // Refresh the list
      if (currentRole?.id === id) {
        handleClearForm();
      }
    } catch (err) {
      setError('Failed to delete role.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{currentRole ? 'Edit Role' : 'Create New Role'}</CardTitle>
          <CardDescription>
            {currentRole ? 'Modify the details of the existing role.' : 'Add a new role to the system.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="roleName">Role Name</Label>
              <Input
                id="roleName"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="e.g., Software Developer"
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="roleDescription">Description</Label>
              <Textarea
                id="roleDescription"
                value={roleDescription}
                onChange={(e) => setRoleDescription(e.target.value)}
                placeholder="Describe the responsibilities and context of this role."
                disabled={isLoading}
                rows={4}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex space-x-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : (currentRole ? 'Update Role' : 'Create Role')}
              </Button>
              {currentRole && (
                <Button type="button" variant="outline" onClick={handleClearForm} disabled={isLoading}>
                  Cancel Edit
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Roles</CardTitle>
          <CardDescription>Manage and view all created roles.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && roles.length === 0 && <p>Loading roles...</p>}
          {!isLoading && roles.length === 0 && !error && <p>No roles created yet.</p>}
          {roles.length > 0 && (
            <div className="space-y-4">
              {roles.map((role) => (
                <Card key={role.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4">
                  <div className="mb-2 sm:mb-0">
                    <h3 className="font-semibold">{role.name}</h3>
                    <p className="text-sm text-muted-foreground truncate max-w-md">{role.description}</p>
                  </div>
                  <div className="flex space-x-2 flex-shrink-0">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(role)} disabled={isLoading}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(role.id!)} disabled={isLoading}>
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleEditor; 