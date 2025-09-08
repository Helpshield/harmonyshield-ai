import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushNotificationRequest {
  type: string;
  url?: string;
  result?: any;
  source?: string;
  userId?: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, url, result, source, userId }: PushNotificationRequest = await req.json();

    console.log(`Sending push notification: ${type} from ${source}`);

    // Get all active push subscriptions
    let query = supabase
      .from('push_subscriptions')
      .select('*')
      .eq('is_active', true);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: subscriptions, error } = await query;

    if (error) {
      throw error;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('No active push subscriptions found');
      return new Response(
        JSON.stringify({ message: 'No active subscriptions' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare notification payload
    const notification = createNotificationPayload(type, url, result);

    // Send notifications to all subscriptions
    const notificationPromises = subscriptions.map(subscription =>
      sendPushNotification(subscription, notification)
    );

    const results = await Promise.allSettled(notificationPromises);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`Push notifications sent: ${successful} successful, ${failed} failed`);

    // Store notification in database
    EdgeRuntime.waitUntil(storeNotification(type, url, result, userId));

    return new Response(
      JSON.stringify({
        message: 'Push notifications sent',
        successful,
        failed
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending push notification:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

function createNotificationPayload(type: string, url?: string, result?: any) {
  switch (type) {
    case 'threat_detected':
      const domain = url ? extractDomain(url) : 'Unknown site';
      const riskLevel = result?.riskLevel || 'unknown';
      return {
        title: `🛡️ ScamShield Alert: ${riskLevel.toUpperCase()} Risk Detected`,
        body: `${domain} has been flagged as potentially dangerous. Stay safe!`,
        icon: '/icons/icon-192.png',
        badge: '/icons/badge-72.png',
        tag: 'threat-alert',
        requireInteraction: riskLevel === 'critical',
        actions: [
          {
            action: 'view',
            title: 'View Details',
            icon: '/icons/view-24.png'
          },
          {
            action: 'dismiss',
            title: 'Dismiss',
            icon: '/icons/dismiss-24.png'
          }
        ],
        data: {
          url,
          result,
          timestamp: Date.now()
        }
      };

    case 'scan_complete':
      return {
        title: '🔍 Scan Complete',
        body: 'Your security scan has finished. Check the results.',
        icon: '/icons/icon-192.png',
        tag: 'scan-complete',
        data: {
          result,
          timestamp: Date.now()
        }
      };

    case 'security_update':
      return {
        title: '🔒 Security Update Available',
        body: 'New security features are available in ScamShield.',
        icon: '/icons/icon-192.png',
        tag: 'security-update'
      };

    default:
      return {
        title: '🛡️ ScamShield Notification',
        body: 'You have a new security notification.',
        icon: '/icons/icon-192.png'
      };
  }
}

async function sendPushNotification(subscription: any, payload: any) {
  try {
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'TTL': '86400', // 24 hours
      },
      body: JSON.stringify({
        notification: payload,
        data: payload.data
      })
    });

    if (!response.ok) {
      throw new Error(`Push failed: ${response.status}`);
    }

    console.log(`Push notification sent to ${subscription.endpoint}`);
  } catch (error) {
    console.error('Failed to send push notification:', error);
    
    // Mark subscription as inactive if it failed
    await supabase
      .from('push_subscriptions')
      .update({ is_active: false })
      .eq('id', subscription.id);
    
    throw error;
  }
}

async function storeNotification(type: string, url?: string, result?: any, userId?: string) {
  try {
    const title = type === 'threat_detected' 
      ? `Threat Detected: ${result?.riskLevel || 'Unknown'} Risk`
      : 'Security Notification';
    
    const message = type === 'threat_detected'
      ? `${url ? extractDomain(url) : 'A website'} has been flagged as potentially dangerous.`
      : 'You have a new security notification.';

    await supabase
      .from('notifications')
      .insert({
        user_id: userId || null,
        title,
        message,
        type: type === 'threat_detected' ? 'warning' : 'info',
        related_type: 'security_alert',
        related_id: url
      });
  } catch (error) {
    console.error('Error storing notification:', error);
  }
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

serve(handler);