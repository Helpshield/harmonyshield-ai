import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Disable JWT verification for this public endpoint
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { shortCode } = await req.json();
    
    // Get tracking link
    const { data: trackingLink, error: linkError } = await supabaseService
      .from('tracking_links')
      .select('*')
      .eq('short_code', shortCode)
      .eq('is_active', true)
      .single();

    if (linkError || !trackingLink) {
      console.error('Tracking link not found:', linkError);
      return new Response(
        JSON.stringify({ error: 'Tracking link not found or inactive' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    // Check if link has expired
    if (trackingLink.expires_at && new Date(trackingLink.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Tracking link has expired' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 410,
        }
      );
    }

    // Get visitor information from request
    const userAgent = req.headers.get('user-agent') || '';
    const referer = req.headers.get('referer') || '';
    
    // Get IP address (considering potential proxy headers)
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const remoteAddr = req.headers.get('remote-addr');
    const ipAddress = forwardedFor?.split(',')[0] || realIp || remoteAddr || 'unknown';

    // Parse user agent for device info
    const browserInfo = {
      userAgent,
      isMobile: /Mobile|Android|iPhone|iPad/.test(userAgent),
      browser: getUserAgentBrowser(userAgent),
      os: getUserAgentOS(userAgent),
    };

    // Create device fingerprint
    const fingerprint = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(`${userAgent}${ipAddress}${Date.now()}`)
    );
    const fingerprintHash = Array.from(new Uint8Array(fingerprint))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Store visitor data
    const { error: visitorError } = await supabaseService
      .from('visitor_data')
      .insert({
        tracking_link_id: trackingLink.id,
        ip_address: ipAddress !== 'unknown' ? ipAddress : null,
        user_agent: userAgent,
        browser_info: browserInfo,
        device_info: {
          type: browserInfo.isMobile ? 'mobile' : 'desktop',
          platform: browserInfo.os,
        },
        referer: referer || null,
        fingerprint_hash: fingerprintHash,
      });

    if (visitorError) {
      console.error('Error storing visitor data:', visitorError);
    }

    // Return redirect URL
    return new Response(
      JSON.stringify({ 
        redirect_url: trackingLink.target_url,
        title: trackingLink.title,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in track-visitor:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function getUserAgentBrowser(userAgent: string): string {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  return 'Unknown';
}

function getUserAgentOS(userAgent: string): string {
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac OS')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS')) return 'iOS';
  return 'Unknown';
}