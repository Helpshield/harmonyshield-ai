import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  userActivity?: {
    totalUsers: number;
    activeUsers: number;
  };
  scanActivity?: {
    totalScans: number;
    highRiskDetections: number;
  };
  threatReports?: {
    totalThreats: number;
    activeThreats: number;
  };
  abTests?: {
    totalTests: number;
    activeTests: number;
  };
}

interface WebSocketMessage {
  type: string;
  data?: any;
  connectionId?: string;
  timestamp?: string;
  message?: string;
}

export const useWebSocketAnalytics = (subscriptions: string[] = []) => {
  const [data, setData] = useState<AnalyticsData>({});
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const getWebSocketUrl = () => {
    return `wss://hgqhgwdzsyqrjtthsmyg.functions.supabase.co/websocket-analytics`;
  };

  const connect = useCallback(async () => {
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      const ws = new WebSocket(getWebSocketUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected for analytics');
        setConnected(true);
        setError(null);
        reconnectAttempts.current = 0;

        // Authenticate if user session exists
        if (session?.access_token) {
          ws.send(JSON.stringify({
            type: 'authenticate',
            data: { token: session.access_token }
          }));
        }

        // Subscribe to analytics updates
        if (subscriptions.length > 0) {
          ws.send(JSON.stringify({
            type: 'subscribe_analytics',
            data: { metrics: subscriptions }
          }));
        }

        // Request initial stats
        ws.send(JSON.stringify({
          type: 'get_realtime_stats'
        }));
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('WebSocket message received:', message);

          switch (message.type) {
            case 'connection_established':
              console.log('Connection established:', message.connectionId);
              break;

            case 'authenticated':
              console.log('Authentication successful');
              break;

            case 'auth_error':
              console.error('Authentication error:', message.message);
              setError(message.message || 'Authentication failed');
              break;

            case 'subscription_confirmed':
              console.log('Subscriptions confirmed:', message.data);
              break;

            case 'realtime_stats':
              setData(message.data || {});
              setLoading(false);
              break;

            case 'event_tracked':
              console.log('Event tracked:', message.data);
              // Refresh stats after event tracking
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'get_realtime_stats' }));
              }
              break;

            case 'ab_test_results':
              console.log('A/B test results:', message.data);
              // Handle A/B test specific results if needed
              break;

            case 'error':
              console.error('WebSocket error message:', message.message);
              setError(message.message || 'Unknown error');
              break;

            default:
              console.log('Unknown message type:', message.type);
          }
        } catch (parseError) {
          console.error('Error parsing WebSocket message:', parseError);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setConnected(false);
        
        // Attempt to reconnect unless it was a clean close
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000; // Exponential backoff
          console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          setError('Maximum reconnection attempts reached');
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error occurred');
      };

    } catch (connectError) {
      console.error('Error establishing WebSocket connection:', connectError);
      setError('Failed to establish connection');
      setLoading(false);
    }
  }, [subscriptions]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Component unmounting');
      wsRef.current = null;
    }
    
    setConnected(false);
  }, []);

  const trackEvent = useCallback((eventType: string, eventData: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'track_event',
        data: {
          type: eventType,
          data: eventData,
          userId: eventData.userId,
          timestamp: new Date().toISOString()
        }
      }));
    }
  }, []);

  const getABTestResults = useCallback((testId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'get_ab_test_results',
        data: { testId }
      }));
    }
  }, []);

  const refreshStats = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'get_realtime_stats'
      }));
    }
  }, []);

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    data,
    connected,
    loading,
    error,
    trackEvent,
    getABTestResults,
    refreshStats,
    reconnect: connect
  };
};