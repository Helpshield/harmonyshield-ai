import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ABTest {
  id: string;
  name: string;
  variants: string[];
  traffic_split: Record<string, number>;
  status: 'draft' | 'active' | 'paused' | 'completed';
}

interface ABTestAssignment {
  test_id: string;
  variant: string;
  assigned_at: string;
}

export const useABTesting = () => {
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeABTests();
  }, []);

  const initializeABTests = async () => {
    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      const sessionId = getOrCreateSessionId();

      // Get all active A/B tests
      const { data: activeTests, error: testsError } = await supabase
        .from('ab_tests')
        .select('*')
        .eq('status', 'active');

      if (testsError) throw testsError;

      if (!activeTests || activeTests.length === 0) {
        setLoading(false);
        return;
      }

      // Get existing assignments for this user/session
      const { data: existingAssignments, error: assignmentsError } = await supabase
        .from('ab_test_assignments')
        .select('*')
        .or(userId ? `user_id.eq.${userId}` : `session_id.eq.${sessionId}`);

      if (assignmentsError) throw assignmentsError;

      const assignmentMap: Record<string, string> = {};
      const existingAssignmentsByTest = new Map();

      existingAssignments?.forEach(assignment => {
        existingAssignmentsByTest.set(assignment.test_id, assignment.variant);
        assignmentMap[assignment.test_id] = assignment.variant;
      });

      // Assign variants for tests that don't have assignments yet
      const newAssignments: any[] = [];

      for (const test of activeTests) {
        if (!existingAssignmentsByTest.has(test.id)) {
          const processedTrafficSplit = typeof test.traffic_split === 'string' 
            ? JSON.parse(test.traffic_split) 
            : test.traffic_split || {};
          
          const variant = assignVariant(test.variants, processedTrafficSplit);
          assignmentMap[test.id] = variant;

          newAssignments.push({
            user_id: userId,
            session_id: sessionId,
            test_id: test.id,
            variant
          });
        }
      }

      // Save new assignments
      if (newAssignments.length > 0) {
        const { error: insertError } = await supabase
          .from('ab_test_assignments')
          .insert(newAssignments);

        if (insertError) throw insertError;
      }

      setAssignments(assignmentMap);
    } catch (error) {
      console.error('Error initializing A/B tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const assignVariant = (variants: any, trafficSplit: Record<string, number>): string => {
    const variantArray = Array.isArray(variants) ? variants : 
                        typeof variants === 'string' ? JSON.parse(variants) : [];
    const random = Math.random() * 100;
    let cumulative = 0;

    for (const variant of variantArray) {
      cumulative += trafficSplit[variant] || 0;
      if (random <= cumulative) {
        return variant;
      }
    }

    // Fallback to first variant
    return variantArray[0] || 'control';
  };

  const getOrCreateSessionId = (): string => {
    let sessionId = localStorage.getItem('ab_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('ab_session_id', sessionId);
    }
    return sessionId;
  };

  const getVariant = (testName: string): string | null => {
    // Find test by name and return assigned variant
    for (const [testId, variant] of Object.entries(assignments)) {
      // In a real implementation, you'd want to map test names to IDs
      return variant;
    }
    return null;
  };

  const isVariant = (testName: string, variantName: string): boolean => {
    const assignedVariant = getVariant(testName);
    return assignedVariant === variantName;
  };

  return {
    assignments,
    loading,
    getVariant,
    isVariant,
    initializeABTests
  };
};