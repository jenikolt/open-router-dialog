import React, { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { tagService } from '@/services/tagService';
import { useUIStateStore } from '@/stores/uiStateStore';
import type { Tag } from '@/types';

const TagList: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { selectedRoleId, selectedTagIds, toggleTagId } = useUIStateStore();

  // Load tags on component mount
  useEffect(() => {
    const fetchTags = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedTags = await tagService.getAllTags();
        setTags(fetchedTags);
      } catch (err) {
        setError('Failed to load tags');
        console.error('Error fetching tags:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, []);

  // Filter tags based on search term
  const filteredTags = useMemo(() => {
    if (!searchTerm.trim()) return tags;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return tags.filter(tag => 
      tag.name.toLowerCase().includes(lowerSearchTerm) ||
      tag.description.toLowerCase().includes(lowerSearchTerm) ||
      tag.content.toLowerCase().includes(lowerSearchTerm)
    );
  }, [tags, searchTerm]);

  // Separate tags into role-specific and general
  const roleSpecificTags = useMemo(() => {
    return filteredTags.filter(tag => !tag.isGeneral && tag.roleId === selectedRoleId);
  }, [filteredTags, selectedRoleId]);

  const generalTags = useMemo(() => {
    return filteredTags.filter(tag => tag.isGeneral);
  }, [filteredTags]);

  const handleTagToggle = (tagId: number) => {
    toggleTagId(tagId);
  };

  const isTagSelected = (tagId: number) => {
    return selectedTagIds.includes(tagId);
  };

  const renderTagItem = (tag: Tag) => (
    <div 
      key={tag.id} 
      className="flex items-start space-x-2 p-2 rounded-md border bg-card hover:bg-accent/50 transition-colors"
    >
      <input
        type="checkbox"
        id={`tag-${tag.id}`}
        checked={isTagSelected(tag.id!)}
        onChange={() => handleTagToggle(tag.id!)}
        className="mt-1 rounded border-input"
      />
      <div className="flex-1 min-w-0">
        <Label 
          htmlFor={`tag-${tag.id}`} 
          className="text-sm font-medium cursor-pointer leading-tight"
        >
          {tag.name}
        </Label>
        {tag.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {tag.description}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1 italic line-clamp-1" title={tag.content}>
          "{tag.content}"
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Search Input */}
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Tag Lists */}
      <div className="flex flex-col flex-1 overflow-hidden space-y-4">
        {/* Role-Specific Tags */}
        <div className="flex-1 min-h-0">
          <h3 className="font-semibold mb-2 text-sm">Role-Specific Tags</h3>
          <ScrollArea className="h-full border border-dashed border-border rounded-md p-2">
            {isLoading && (
              <div className="text-center py-4">
                <p className="text-xs text-muted-foreground">Loading tags...</p>
              </div>
            )}
            
            {error && (
              <div className="text-center py-4">
                <p className="text-xs text-red-500">{error}</p>
              </div>
            )}
            
            {!isLoading && !error && !selectedRoleId && (
              <div className="text-center py-4">
                <p className="text-xs text-muted-foreground">
                  Select a role to see role-specific tags.
                </p>
              </div>
            )}
            
            {!isLoading && !error && selectedRoleId && roleSpecificTags.length === 0 && (
              <div className="text-center py-4">
                <p className="text-xs text-muted-foreground">
                  {searchTerm ? 'No role-specific tags match your search.' : 'No role-specific tags available for this role.'}
                </p>
              </div>
            )}
            
            {!isLoading && !error && roleSpecificTags.length > 0 && (
              <div className="space-y-2">
                {roleSpecificTags.map(renderTagItem)}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* General Tags */}
        <div className="flex-1 min-h-0">
          <h3 className="font-semibold mb-2 text-sm">General Tags</h3>
          <ScrollArea className="h-full border border-dashed border-border rounded-md p-2">
            {!isLoading && !error && generalTags.length === 0 && (
              <div className="text-center py-4">
                <p className="text-xs text-muted-foreground">
                  {searchTerm ? 'No general tags match your search.' : 'No general tags available. Create some in Settings.'}
                </p>
              </div>
            )}
            
            {!isLoading && !error && generalTags.length > 0 && (
              <div className="space-y-2">
                {generalTags.map(renderTagItem)}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default TagList; 