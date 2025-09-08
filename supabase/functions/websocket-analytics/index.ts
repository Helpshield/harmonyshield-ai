import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyticsMessage {
  type: string;
  event?: string;
  data?: any;
  filters?: {
    dateRange?: { start: string; end: string };
    metric?: string;
  };
}

interface WebSocketConnection {
  socket: WebSocket;
  userId?: string;
  subscriptions: Set<string>;
}

const connections = new Map<string, WebSocketConnection>();

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { 
      status: 400,
      headers: corsHeaders 
    });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  const connectionId = crypto.randomUUID();
  
  const supabaseService = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  socket.onopen = () => {
    console.log(`WebSocket connection opened: ${connectionId}`);
    connections.set(connectionId, {
      socket,
      subscriptions: new Set()
    });
    
    socket.send(JSON.stringify({
      type: 'connection_established',
      connectionId
    }));
  };

  socket.onmessage = async (event) => {
    try {
      const message: AnalyticsMessage = JSON.parse(event.data);
      console.log(`Received message:`, message);
      
      const connection = connections.get(connectionId);
      if (!connection) return;

      switch (message.type) {
        case 'authenticate':
          await handleAuthentication(connection, message.data.token, supabaseService);
          break;
          
        case 'subscribe_analytics':
          await handleAnalyticsSubscription(connection, message.data, supabaseService);
          break;
          
        case 'get_realtime_stats':
          await sendRealtimeStats(connection, message.filters, supabaseService);
          break;
          
        case 'track_event':
          await trackEvent(message.data, supabaseService);
          await broadcastEventUpdate(message.data);
          break;
          
        case 'get_ab_test_results':
          await sendABTestResults(connection, message.data.testId, supabaseService);
          break;
          
        default:
          socket.send(JSON.stringify({
            type: 'error',
            message: 'Unknown message type'
          }));
      }
    } catch (error) {
      console.error('Error handling message:', error);
      socket.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  };

  socket.onclose = () => {
    console.log(`WebSocket connection closed: ${connectionId}`);
    connections.delete(connectionId);
  };

  socket.onerror = (error) => {
    console.error(`WebSocket error for ${connectionId}:`, error);
    connections.delete(connectionId);
  };

  return response;
});

async function handleAuthentication(connection: WebSocketConnection, token: string, supabase: any) {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      connection.socket.send(JSON.stringify({
        type: 'auth_error',
        message: 'Invalid authentication token'
      }));
      return;
    }

    connection.userId = user.id;
    connection.socket.send(JSON.stringify({
      type: 'authenticated',
      userId: user.id
    }));
    
    console.log(`User authenticated: ${user.id}`);
  } catch (error) {
    console.error('Authentication error:', error);
    connection.socket.send(JSON.stringify({
      type: 'auth_error',
      message: 'Authentication failed'
    }));
  }
}

async function handleAnalyticsSubscription(connection: WebSocketConnection, data: any, supabase: any) {
  const { metrics } = data;
  
  connection.subscriptions.clear();
  metrics.forEach((metric: string) => connection.subscriptions.add(metric));
  
  connection.socket.send(JSON.stringify({
    type: 'subscription_confirmed',
    metrics: Array.from(connection.subscriptions)
  }));

  // Send initial data
  await sendRealtimeStats(connection, {}, supabase);
  
  // Set up periodic updates
  const interval = setInterval(async () => {
    if (connection.socket.readyState === WebSocket.OPEN) {
      await sendRealtimeStats(connection, {}, supabase);
    } else {
      clearInterval(interval);
    }
  }, 5000); // Update every 5 seconds
}

async function sendRealtimeStats(connection: WebSocketConnection, filters: any, supabase: any) {
  try {
    const stats: any = {};
    
    // Get real-time analytics data
    if (connection.subscriptions.has('user_activity') || connection.subscriptions.size === 0) {
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });
      
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { count: activeUsers } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('updated_at', thirtyDaysAgo);
        
      stats.userActivity = { totalUsers, activeUsers };
    }

    if (connection.subscriptions.has('scan_activity') || connection.subscriptions.size === 0) {
      const { count: totalScans } = await supabase
        .from('scan_results')
        .select('id', { count: 'exact', head: true });
        
      const { count: highRiskDetections } = await supabase
        .from('scan_results')
        .select('id', { count: 'exact', head: true })
        .eq('risk_level', 'high');
        
      stats.scanActivity = { totalScans, highRiskDetections };
    }

    if (connection.subscriptions.has('threat_reports') || connection.subscriptions.size === 0) {
      const { count: totalThreats } = await supabase
        .from('threat_reports')
        .select('id', { count: 'exact', head: true });
        
      const { count: activeThreats } = await supabase
        .from('threat_reports')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active');
        
      stats.threatReports = { totalThreats, activeThreats };
    }

    if (connection.subscriptions.has('ab_tests') || connection.subscriptions.size === 0) {
      const { count: totalTests } = await supabase
        .from('ab_tests')
        .select('id', { count: 'exact', head: true });
        
      const { count: activeTests } = await supabase
        .from('ab_tests')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active');
        
      stats.abTests = { totalTests, activeTests };
    }

    connection.socket.send(JSON.stringify({
      type: 'realtime_stats',
      data: stats,
      timestamp: new Date().toISOString()
    }));
    
  } catch (error) {
    console.error('Error sending realtime stats:', error);
    connection.socket.send(JSON.stringify({
      type: 'error',
      message: 'Failed to fetch analytics data'
    }));
  }
}

async function trackEvent(eventData: any, supabase: any) {
  try {
    // Store analytics event
    await supabase
      .from('search_analytics')
      .insert({
        user_id: eventData.userId,
        search_type: eventData.type || 'custom_event',
        query_length: eventData.data ? JSON.stringify(eventData.data).length : 0,
        success: true
      });
      
    console.log('Event tracked:', eventData);
  } catch (error) {
    console.error('Error tracking event:', error);
  }
}

async function broadcastEventUpdate(eventData: any) {
  const message = JSON.stringify({
    type: 'event_tracked',
    data: eventData,
    timestamp: new Date().toISOString()
  });

  connections.forEach((connection) => {
    if (connection.socket.readyState === WebSocket.OPEN) {
      connection.socket.send(message);
    }
  });
}

async function sendABTestResults(connection: WebSocketConnection, testId: string, supabase: any) {
  try {
    // Get test details
    const { data: test, error: testError } = await supabase
      .from('ab_tests')
      .select('*')
      .eq('id', testId)
      .single();
      
    if (testError) throw testError;

    // Get assignments for this test
    const { data: assignments, error: assignmentsError } = await supabase
      .from('ab_test_assignments')
      .select('*')
      .eq('test_id', testId);
      
    if (assignmentsError) throw assignmentsError;

    // Calculate variant statistics
    const variantStats = assignments.reduce((acc: any, assignment: any) => {
      acc[assignment.variant] = (acc[assignment.variant] || 0) + 1;
      return acc;
    }, {});

    const results = {
      test,
      assignments: assignments.length,
      variantStats,
      conversionRates: {}, // Would need additional conversion tracking
      statisticalSignificance: false // Would need proper statistical analysis
    };

    connection.socket.send(JSON.stringify({
      type: 'ab_test_results',
      testId,
      data: results
    }));
    
  } catch (error) {
    console.error('Error sending A/B test results:', error);
    connection.socket.send(JSON.stringify({
      type: 'error',
      message: 'Failed to fetch A/B test results'
    }));
  }
}