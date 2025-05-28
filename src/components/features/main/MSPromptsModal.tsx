import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MultiSelect, type MultiSelectOption } from '@/components/ui/multi-select';
import { Copy, Loader2, AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';

import { useMSPromptsStore } from '@/stores/msPromptsStore';
import { fetchMSPrompts } from '@/services/msPromptsService';

interface MSPromptsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MSPromptsModal: React.FC<MSPromptsModalProps> = ({ open, onOpenChange }) => {
  const {
    prompts,
    isLoading,
    error,
    filters,
    expandedPromptId,
    setPrompts,
    setLoading,
    setError,
    setFilters,
    setExpandedPromptId,
    resetFilters,
  } = useMSPromptsStore();

  const [hasLoaded, setHasLoaded] = useState(false);

  // Load prompts when modal opens for the first time
  useEffect(() => {
    if (open && prompts.length === 0 && !hasLoaded && !isLoading) {
      loadPrompts();
    }
  }, [open, prompts.length, hasLoaded, isLoading]);

  const loadPrompts = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedPrompts = await fetchMSPrompts();
      setPrompts(fetchedPrompts);
      setHasLoaded(true);
    } catch (err: any) {
      setError(err.message || 'Failed to load prompts');
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories for filter dropdown
  const categoryOptions: MultiSelectOption[] = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(prompts.map((prompt) => prompt.DisplayCategory))
    ).sort();
    return uniqueCategories.map((category) => ({
      label: category,
      value: category,
    }));
  }, [prompts]);

  // Filter prompts based on current filters
  const filteredPrompts = useMemo(() => {
    return prompts.filter((prompt) => {
      const titleMatch = !filters.titleFilter || 
        prompt.Title.toLowerCase().includes(filters.titleFilter.toLowerCase());
      
      const categoryMatch = filters.categoryFilter.length === 0 ||
        filters.categoryFilter.includes(prompt.DisplayCategory);
      
      const textMatch = !filters.textFilter ||
        prompt.DisplayText.toLowerCase().includes(filters.textFilter.toLowerCase());
      
      return titleMatch && categoryMatch && textMatch;
    });
  }, [prompts, filters]);

  const copyToClipboard = async (text: string, title: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Copied "${title}" to clipboard`);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleCardClick = (promptId: string) => {
    setExpandedPromptId(expandedPromptId === promptId ? null : promptId);
  };

  const handleClose = () => {
    onOpenChange(false);
    setExpandedPromptId(null);
  };

  const handleClearFilters = () => {
    resetFilters();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle>Prompts from MS</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6">
          {/* Filter Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <label htmlFor="title-filter" className="text-sm font-medium">
                Filter by Title
              </label>
              <Input
                id="title-filter"
                placeholder="Search titles..."
                value={filters.titleFilter}
                onChange={(e) => setFilters({ titleFilter: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="category-filter" className="text-sm font-medium">
                Filter by Category
              </label>
              <MultiSelect
                options={categoryOptions}
                value={filters.categoryFilter}
                onValueChange={(value) => setFilters({ categoryFilter: value })}
                placeholder="Select categories..."
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="text-filter" className="text-sm font-medium">
                Filter by Text
              </label>
              <Input
                id="text-filter"
                placeholder="Search in text..."
                value={filters.textFilter}
                onChange={(e) => setFilters({ textFilter: e.target.value })}
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          {(filters.titleFilter || filters.categoryFilter.length > 0 || filters.textFilter) && (
            <div className="mb-4">
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </div>
          )}

          {/* Content */}
          <div className="h-[500px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading prompts...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <AlertTriangle className="h-8 w-8 text-destructive" />
                <div className="text-center">
                  <p className="text-destructive font-medium">Failed to load prompts</p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
                <Button onClick={loadPrompts} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="space-y-3 pr-4">
                  {filteredPrompts.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        {prompts.length === 0 ? 'No prompts available' : 'No prompts match your filters'}
                      </p>
                    </div>
                  ) : (
                    filteredPrompts.map((prompt) => {
                      const isExpanded = expandedPromptId === prompt.Id;
                      return (
                        <Card
                          key={prompt.Id}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => handleCardClick(prompt.Id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-medium text-sm truncate">
                                    {prompt.Title}
                                  </h3>
                                  <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded-sm text-xs whitespace-nowrap">
                                    {prompt.DisplayCategory}
                                  </span>
                                </div>
                                <div
                                  className={`text-sm text-muted-foreground ${
                                    isExpanded
                                      ? 'max-h-24 overflow-y-auto whitespace-pre-wrap'
                                      : 'truncate'
                                  }`}
                                >
                                  {prompt.DisplayText}
                                </div>
                              </div>
                              
                              <Button
                                variant="ghost"
                                size="icon"
                                className="shrink-0 h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(prompt.DisplayText, prompt.Title);
                                }}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MSPromptsModal; 