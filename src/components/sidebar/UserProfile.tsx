import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface UserProfileProps {
  collapsed: boolean;
  userProfile: any;
  userRole: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  collapsed,
  userProfile,
  userRole
}) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="mt-auto border-t p-4">
      {!collapsed ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-start space-x-3 h-auto p-3 hover:bg-accent/10"
            >
              <div className="p-2 bg-primary/10 rounded-full">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium truncate">
                  {userProfile?.full_name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {userRole}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User className="mr-2 h-4 w-4" />
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleSignOut}
          className="w-full p-2"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};