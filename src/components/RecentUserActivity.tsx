import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface RecentUser {
  id: string;
  user_id: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
  last_activity?: string;
  role?: string;
}

const RecentUserActivity = () => {
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentUsers();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('recent_users_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          loadRecentUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadRecentUsers = async () => {
    try {
      setLoading(true);
      
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles(role)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const usersWithRoles = profiles?.map(profile => ({
        ...profile,
        role: (profile.user_roles as any)?.[0]?.role || 'user',
        last_activity: profile.updated_at
      })) || [];

      setRecentUsers(usersWithRoles);
    } catch (error) {
      console.error('Error loading recent users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityStatus = (lastActivity: string, createdAt: string) => {
    const now = new Date();
    const activityDate = new Date(lastActivity);
    const createdDate = new Date(createdAt);
    const hoursSinceActivity = (now.getTime() - activityDate.getTime()) / (1000 * 60 * 60);
    const hoursSinceCreated = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
    
    // If created recently (within 24 hours) and no activity since creation
    if (hoursSinceCreated < 24 && Math.abs(activityDate.getTime() - createdDate.getTime()) < 60000) {
      return { status: 'New', variant: 'default' as const };
    }
    
    // If recent activity (within 24 hours)
    if (hoursSinceActivity < 24) {
      return { status: 'Active', variant: 'outline' as const };
    }
    
    // If activity within a week
    if (hoursSinceActivity < 168) {
      return { status: 'Recent', variant: 'secondary' as const };
    }
    
    return { status: 'Inactive', variant: 'secondary' as const };
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes} min${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  };

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Recent User Activity</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-8 w-8 bg-muted rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Recent User Activity</CardTitle>
        <CardDescription>Latest user registrations and activities</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No recent user activity
                </TableCell>
              </TableRow>
            ) : (
              recentUsers.map((user) => {
                const activityStatus = getActivityStatus(user.last_activity || user.created_at, user.created_at);
                return (
                  <TableRow key={user.id}>
                    <TableCell className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.full_name || 'Anonymous User'}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.role === 'admin' ? 'Administrator' : 'User'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={activityStatus.variant}>
                        {activityStatus.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatTimeAgo(user.created_at)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RecentUserActivity;