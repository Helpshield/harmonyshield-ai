import React from 'react';
import { Shield } from 'lucide-react';
import NotificationSystem from '../NotificationSystem';

interface SidebarHeaderProps {
  collapsed: boolean;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({ collapsed }) => {
  return (
    <div className="p-4 border-b bg-gradient-primary space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <Shield className="h-6 w-6 text-white animate-shield-pulse" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-lg font-bold text-white">Harmony Shield</h2>
              <p className="text-xs text-white/80">Digital Guardian</p>
            </div>
          )}
        </div>
        {!collapsed && <NotificationSystem />}
      </div>
    </div>
  );
};