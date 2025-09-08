import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStatsCardProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  userId?: string;
}

const DashboardStatsCard: React.FC<DashboardStatsCardProps> = ({ title, icon: Icon, userId }) => {
  const [value, setValue] = useState<number>(0);
  const [change, setChange] = useState<string>('');

  useEffect(() => {
    const loadStats = async () => {
      if (!userId) return;

      try {
        switch (title) {
          case 'Active Shields':
            // Count user's active bot subscriptions
            const { count: activeShields } = await supabase
              .from('user_bot_subscriptions')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', userId)
              .eq('status', 'active');
            setValue(activeShields || 0);
            setChange(activeShields > 0 ? '+' + activeShields + ' active' : 'No active shields');
            break;
          case 'Threats Blocked':
            // Count high-risk scan results for user
            const { count: threatsBlocked } = await supabase
              .from('scan_results')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', userId)
              .eq('risk_level', 'high');
            setValue(threatsBlocked || 0);
            setChange('This month');
            break;
          case 'Reports Submitted':
            const { count: reportsCount } = await supabase
              .from('scam_reports')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', userId);
            setValue(reportsCount || 0);
            setChange('All time');
            break;
          case 'Safety Score':
            // Calculate safety score based on user's activity
            const [shieldsResult, scansResult, reportsResult] = await Promise.all([
              supabase
                .from('user_bot_subscriptions')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('status', 'active'),
              supabase
                .from('scan_results')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId),
              supabase
                .from('scam_reports')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
            ]);
            
            // Base score starts at 60, adds points for activity
            let safetyScore = 60;
            safetyScore += Math.min(20, (shieldsResult.count || 0) * 10); // Active shields bonus
            safetyScore += Math.min(15, (scansResult.count || 0) * 2); // Scans performed bonus
            safetyScore += Math.min(5, (reportsResult.count || 0) * 1); // Reports submitted bonus
            
            setValue(Math.min(100, safetyScore));
            setChange(safetyScore >= 90 ? 'Excellent protection' : safetyScore >= 70 ? 'Good protection' : 'Needs improvement');
            break;
          default:
            setValue(0);
            setChange('');
        }
      } catch (error) {
        console.error('Error loading stats:', error);
        setValue(0);
        setChange('Error loading');
      }
    };

    loadStats();

    // Set up real-time subscription for reports if relevant
    if (title === 'Reports Submitted' && userId) {
      const channel = supabase
        .channel('scam_reports_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'scam_reports',
            filter: `user_id=eq.${userId}`
          },
          () => {
            loadStats(); // Reload stats when reports change
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [title, userId]);

  const getDisplayValue = () => {
    if (title === 'Safety Score') {
      return `${value}%`;
    }
    return value.toString();
  };

  return (
    <Card className="hover-lift shadow-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-accent" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{getDisplayValue()}</div>
        <p className="text-xs text-muted-foreground">{change}</p>
      </CardContent>
    </Card>
  );
};

export default DashboardStatsCard;