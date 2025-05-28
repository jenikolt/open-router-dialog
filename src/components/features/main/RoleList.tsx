import React, { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { roleService } from '@/services/roleService';
import { useUIStateStore } from '@/stores/uiStateStore';
import type { Role } from '@/types';

const RoleList: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { selectedRoleId, setSelectedRoleId } = useUIStateStore();

  // Load roles on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedRoles = await roleService.getAllRoles();
        setRoles(fetchedRoles);
      } catch (err) {
        setError('Failed to load roles');
        console.error('Error fetching roles:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoles();
  }, []);

  // Filter roles based on search term
  const filteredRoles = useMemo(() => {
    if (!searchTerm.trim()) return roles;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return roles.filter(role => 
      role.name.toLowerCase().includes(lowerSearchTerm) ||
      role.description.toLowerCase().includes(lowerSearchTerm)
    );
  }, [roles, searchTerm]);

  const handleRoleClick = (role: Role) => {
    setSelectedRoleId(role.id || null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search Input */}
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search roles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Role List */}
      <ScrollArea className="flex-1 -m-1 p-1">
        {isLoading && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">Loading roles...</p>
          </div>
        )}
        
        {error && (
          <div className="text-center py-4">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}
        
        {!isLoading && !error && filteredRoles.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              {searchTerm ? 'No roles match your search.' : 'No roles available. Create some in Settings.'}
            </p>
          </div>
        )}
        
        {!isLoading && !error && filteredRoles.length > 0 && (
          <div className="space-y-3 p-1">
            {filteredRoles.map((role) => (
              <Card 
                key={role.id} 
                className={`cursor-pointer transition-all hover:shadow-md hover:bg-accent/50 ${
                  selectedRoleId === role.id 
                    ? 'ring-2 ring-primary bg-accent relative z-10' 
                    : 'hover:bg-accent/20 relative z-0'
                }`}
                onClick={() => handleRoleClick(role)}
              >
                <CardContent className="p-3">
                  <h3 className="font-semibold text-sm leading-tight">{role.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {role.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default RoleList; 