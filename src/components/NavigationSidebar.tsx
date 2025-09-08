import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { 
  Menu,
  Home,
  FileText,
  Newspaper,
  ScanLine,
  Search,
  Bot,
  Zap,
  Link,
  Shield,
  Settings,
  Users,
  Database,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface NavigationItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigationItems: NavigationItem[] = [
  { title: 'Home', url: '/dashboard', icon: Home },
  { title: 'Report', url: '/reports', icon: FileText },
  { title: 'News', url: '/news', icon: Newspaper },
  { title: 'Scan', url: '/scanner', icon: ScanLine },
  { title: 'Deep Lookup', url: '/deepsearch', icon: Search },
  { title: 'Bots', url: '/bots', icon: Bot },
  { title: 'AI Analyzer', url: '/analyzer', icon: Zap },
  { title: 'AI Links', url: '/links', icon: Link },
];

const adminNavigationItems: NavigationItem[] = [
  { title: 'Admin Panel', url: '/admin', icon: Shield },
  { title: 'User Management', url: '/admin/users', icon: Users },
  { title: 'Reports Management', url: '/admin/reports', icon: FileText },
  { title: 'Analytics', url: '/admin/analytics', icon: BarChart3 },
  { title: 'System Settings', url: '/admin/settings', icon: Settings },
];

const NavigationSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState('user');
  const [isAdminView, setIsAdminView] = useState(false);

  useEffect(() => {
    const checkUserRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();
        
        if (roleData) {
          setUserRole(roleData.role);
        }
      }
    };

    checkUserRole();
    
    // Check if we're in admin view based on current path
    setIsAdminView(location.pathname.startsWith('/admin'));
  }, [location]);

  const handleNavigation = (url: string) => {
    navigate(url);
  };

  return (
    <Drawer direction="left">
      <DrawerTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center space-x-2">
          <Menu className="h-4 w-4" />
          <span className="hidden sm:inline">Menu</span>
        </Button>
      </DrawerTrigger>
      
      <DrawerContent className="h-full w-80 sm:w-96 fixed left-0 top-0 bottom-0 rounded-none border-r">
        <DrawerHeader className="border-b bg-muted/30">
          <DrawerTitle className="flex items-center space-x-3 text-lg font-bold">
            <Shield className="h-6 w-6 text-primary animate-shield-pulse" />
            <div>
              <h2 className="text-xl font-bold text-foreground">Harmony Shield</h2>
              <p className="text-sm text-muted-foreground font-normal">Your Digital Guardian</p>
            </div>
          </DrawerTitle>
        </DrawerHeader>
        
        <div className="flex-1 overflow-y-auto p-4">
          {/* View Toggle for Admin Users */}
          {(userRole === 'admin' || userRole === 'moderator') && (
            <div className="mb-6 p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">View Mode</span>
                <Badge variant={isAdminView ? "default" : "secondary"} className="text-xs">
                  {isAdminView ? 'Admin' : 'User'}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={!isAdminView ? "default" : "outline"}
                  onClick={() => {
                    setIsAdminView(false);
                    navigate('/dashboard');
                  }}
                  className="flex-1 text-xs"
                >
                  User View
                </Button>
                <Button
                  size="sm"
                  variant={isAdminView ? "default" : "outline"}
                  onClick={() => {
                    setIsAdminView(true);
                    navigate('/admin');
                  }}
                  className="flex-1 text-xs"
                >
                  Admin View
                </Button>
              </div>
            </div>
          )}

          <nav className="space-y-2">
            {/* Show appropriate navigation based on view mode */}
            {(isAdminView && (userRole === 'admin' || userRole === 'moderator')) ? (
              // Admin Navigation
              <>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
                  Admin Panel
                </div>
                {adminNavigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.url;
                  
                  return (
                    <DrawerClose key={item.url} asChild>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start space-x-3 h-12 text-left",
                          isActive && "bg-accent/20 text-accent font-medium"
                        )}
                        onClick={() => handleNavigation(item.url)}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-base">{item.title}</span>
                      </Button>
                    </DrawerClose>
                  );
                })}
              </>
            ) : (
              // User Navigation
              <>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
                  Main Features
                </div>
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.url;
                  
                  return (
                    <DrawerClose key={item.url} asChild>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start space-x-3 h-12 text-left",
                          isActive && "bg-accent/20 text-accent font-medium"
                        )}
                        onClick={() => handleNavigation(item.url)}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-base">{item.title}</span>
                      </Button>
                    </DrawerClose>
                  );
                })}
              </>
            )}
          </nav>
        </div>
        
        <div className="border-t p-4 bg-muted/30">
          <p className="text-sm text-muted-foreground text-center">
            Harmony Shield v1.0
          </p>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default NavigationSidebar;