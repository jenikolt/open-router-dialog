import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Role, Tag } from '@/types'; // Use type-only imports
import { roleService } from '@/services/roleService';
import { tagService } from '@/services/tagService';

// Mock services and placeholder types removed

const TagEditor: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [currentTag, setCurrentTag] = useState<Tag | null>(null);

  // Form state
  const [tagName, setTagName] = useState('');
  const [tagDescription, setTagDescription] = useState('');
  const [tagContent, setTagContent] = useState('');
  const [isGeneral, setIsGeneral] = useState(true);
  const [selectedRoleId, setSelectedRoleId] = useState<number | undefined>(undefined);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTagsAndRoles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [fetchedTags, fetchedRoles] = await Promise.all([
        tagService.getAllTags(),
        roleService.getAllRoles()
      ]);
      setTags(fetchedTags);
      setRoles(fetchedRoles);
    } catch (err) {
      setError('Failed to fetch tags or roles.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTagsAndRoles();
  }, [fetchTagsAndRoles]);

  const handleEdit = (tag: Tag) => {
    setCurrentTag(tag);
    setTagName(tag.name);
    setTagDescription(tag.description || '');
    setTagContent(tag.content);
    setIsGeneral(tag.isGeneral);
    setSelectedRoleId(tag.isGeneral ? undefined : tag.roleId);
  };

  const handleClearForm = () => {
    setCurrentTag(null);
    setTagName('');
    setTagDescription('');
    setTagContent('');
    setIsGeneral(true);
    setSelectedRoleId(undefined);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!tagName.trim() || !tagContent.trim()) {
      setError('Tag name and content cannot be empty.');
      setIsLoading(false);
      return;
    }
    if (!isGeneral && selectedRoleId === undefined) {
        setError('Please select a role for role-specific tags.');
        setIsLoading(false);
        return;
    }

    const tagData: Omit<Tag, 'id'> = {
      name: tagName.trim(),
      description: tagDescription.trim(),
      content: tagContent.trim(),
      isGeneral,
      roleId: isGeneral ? undefined : selectedRoleId,
    };

    try {
      if (currentTag && currentTag.id !== undefined) {
        await tagService.updateTag({ ...tagData, id: currentTag.id });
      } else {
        await tagService.createTag(tagData);
      }
      handleClearForm();
      fetchTagsAndRoles();
    } catch (err) {
      setError(currentTag ? 'Failed to update tag.' : 'Failed to create tag.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (tagId: number) => {
    if (!window.confirm('Are you sure you want to delete this tag?')) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await tagService.deleteTag(tagId);
      fetchTagsAndRoles();
      if (currentTag?.id === tagId) {
        handleClearForm();
      }
    } catch (err) {
      setError('Failed to delete tag.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getRoleNameById = (roleId?: number): string => {
    if (roleId === undefined) return 'N/A';
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : 'Unknown Role';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{currentTag ? 'Edit Tag' : 'Create New Tag'}</CardTitle>
          <CardDescription>
            {currentTag ? 'Modify the details of the existing tag.' : 'Add a new tag for prompt generation.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="tagName">Tag Name</Label>
              <Input
                id="tagName"
                value={tagName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTagName(e.target.value)}
                placeholder="e.g., Code Refactor"
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="tagDescription">Description (Optional)</Label>
              <Textarea
                id="tagDescription"
                value={tagDescription}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTagDescription(e.target.value)}
                placeholder="Briefly describe what this tag is for."
                disabled={isLoading}
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="tagContent">Tag Content (Prompt Snippet)</Label>
              <Textarea
                id="tagContent"
                value={tagContent}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTagContent(e.target.value)}
                placeholder="The text snippet to be inserted into the prompt."
                disabled={isLoading}
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isGeneral"
                checked={isGeneral}
                onCheckedChange={setIsGeneral}
                disabled={isLoading}
              />
              <Label htmlFor="isGeneral">Is General Tag (applies to all roles)?</Label>
            </div>
            {!isGeneral && (
              <div>
                <Label htmlFor="roleId">Assign to Role</Label>
                <Select
                  value={selectedRoleId !== undefined ? String(selectedRoleId) : undefined}
                  onValueChange={(value: string | undefined) => setSelectedRoleId(value ? parseInt(value, 10) : undefined)}
                  disabled={isLoading || roles.length === 0}
                >
                  <SelectTrigger id="roleId">
                    <SelectValue placeholder={roles.length === 0 ? "No roles available" : "Select a role"} />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      role.id !== undefined && (
                        <SelectItem key={role.id} value={String(role.id)}>
                          {role.name}
                        </SelectItem>
                      )
                    ))}
                  </SelectContent>
                </Select>
                 {roles.length === 0 && !isLoading && <p className="text-sm text-muted-foreground">Create roles first to assign tags.</p>}
              </div>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex space-x-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : (currentTag ? 'Update Tag' : 'Create Tag')}
              </Button>
              {currentTag && (
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
          <CardTitle>Existing Tags</CardTitle>
          <CardDescription>Manage and view all created tags. {isLoading && tags.length === 0 && "Loading..."}</CardDescription>
        </CardHeader>
        <CardContent>
          {!isLoading && !error && tags.length === 0 && <p>No tags created yet. Use the form above to add new tags.</p>}
          {error && <p className="text-red-500">{error}</p>}
          {tags.length > 0 && (
            <div className="space-y-4">
              {tags.map((tag) => (
                tag.id !== undefined && (
                <Card key={tag.id} className="p-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div className="mb-2 sm:mb-0 flex-grow">
                      <h3 className="font-semibold">{tag.name}</h3>
                      {tag.description && <p className="text-sm text-muted-foreground">{tag.description}</p>}
                       <p className="text-xs bg-secondary text-secondary-foreground p-1 rounded inline-block mt-1">
                        {tag.isGeneral ? 'General' : `Role: ${getRoleNameById(tag.roleId)}`}
                      </p>
                       <p className="text-sm mt-1 font-mono bg-muted p-2 rounded max-w-md truncate" title={tag.content}>
                        Content: {tag.content}
                       </p>
                    </div>
                    <div className="flex space-x-2 flex-shrink-0 mt-2 sm:mt-0">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(tag)} disabled={isLoading}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(tag.id!)} disabled={isLoading}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
                )
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TagEditor; 