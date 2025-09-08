import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

export interface NavigationItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavigationSectionProps {
  title: string;
  items: NavigationItem[];
  collapsed: boolean;
}

export const NavigationSection: React.FC<NavigationSectionProps> = ({ 
  title, 
  items, 
  collapsed 
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {title}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.url);
            
            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton 
                  asChild 
                  className={cn(
                    "h-10 transition-all duration-200",
                    active && "bg-accent/20 text-accent font-medium border-r-2 border-accent"
                  )}
                >
                  <button
                    onClick={() => navigate(item.url)}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-left"
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1">{item.title}</span>
                        {item.badge && (
                          <Badge 
                            variant="secondary" 
                            className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary border-primary/20"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};