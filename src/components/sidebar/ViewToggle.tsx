import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ViewToggleProps {
  userRole: string;
  isAdminView: boolean;
  onViewChange: (isAdmin: boolean) => void;
  onNavigate: (path: string) => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({
  userRole,
  isAdminView,
  onViewChange,
  onNavigate
}) => {
  if (userRole !== 'admin' && userRole !== 'moderator') {
    return null;
  }

  return (
    <div className="p-4 border-b bg-muted/30">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">View Mode</span>
          <Badge variant={isAdminView ? "default" : "secondary"} className="text-xs">
            {isAdminView ? 'Admin' : 'User'}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-1">
          <Button
            size="sm"
            variant={!isAdminView ? "default" : "outline"}
            onClick={() => {
              onViewChange(false);
              onNavigate('/dashboard');
            }}
            className="h-8 text-xs"
          >
            User
          </Button>
          <Button
            size="sm"
            variant={isAdminView ? "default" : "outline"}
            onClick={() => {
              onViewChange(true);
              onNavigate('/admin');
            }}
            className="h-8 text-xs"
          >
            Admin
          </Button>
        </div>
      </div>
    </div>
  );
};