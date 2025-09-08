import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    const { title, description, target_url, expires_at } = await req.json();

    // Generate unique short code
    const shortCode = crypto.randomUUID().substring(0, 8);

    // Insert tracking link
    const { data: trackingLink, error } = await supabaseClient
      .from('tracking_links')
      .insert({
        user_id: user.id,
        title,
        description,
        target_url: target_url || 'https://harmonyshield.com',
        short_code: shortCode,
        expires_at: expires_at || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating tracking link:', error);
      throw error;
    }

    // Generate tracking URL
    const trackingUrl = `${req.headers.get('origin')}/track/${shortCode}`;

    return new Response(
      JSON.stringify({ 
        ...trackingLink,
        tracking_url: trackingUrl 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in create-tracking-link:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});