import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  useSidebar,
} from '@/components/ui/sidebar';
import { supabase } from '@/integrations/supabase/client';
import { SidebarHeader } from './sidebar/SidebarHeader';
import { ViewToggle } from './sidebar/ViewToggle';
import { NavigationSection } from './sidebar/NavigationSection';
import { UserProfile } from './sidebar/UserProfile';
import { 
  userNavigationItems, 
  aiNavigationItems, 
  adminNavigationItems 
} from './sidebar/navigationItems';


export function ImprovedSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const [userRole, setUserRole] = useState('user');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAdminView, setIsAdminView] = useState(false);

  useEffect(() => {
    const checkUserRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Get user role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();
        
        if (roleData) {
          setUserRole(roleData.role);
        }

        // Get user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        
        if (profileData) {
          setUserProfile(profileData);
        }
      }
    };

    checkUserRole();
    setIsAdminView(location.pathname.startsWith('/admin'));
  }, [location]);

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarHeader collapsed={collapsed} />
      
      {!collapsed && (
        <ViewToggle
          userRole={userRole}
          isAdminView={isAdminView}
          onViewChange={setIsAdminView}
          onNavigate={navigate}
        />
      )}

      <SidebarContent className="px-2 py-4">
        {isAdminView && (userRole === 'admin' || userRole === 'moderator') ? (
          <NavigationSection 
            title="Admin Panel" 
            items={adminNavigationItems} 
            collapsed={collapsed}
          />
        ) : (
          <>
            <NavigationSection 
              title="Main" 
              items={userNavigationItems} 
              collapsed={collapsed}
            />
            <NavigationSection 
              title="AI Tools" 
              items={aiNavigationItems} 
              collapsed={collapsed}
            />
          </>
        )}
      </SidebarContent>

      <UserProfile
        collapsed={collapsed}
        userProfile={userProfile}
        userRole={userRole}
      />
    </Sidebar>
  );
}