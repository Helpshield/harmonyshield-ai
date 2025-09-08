import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuickCheckRequest {
  url: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url }: QuickCheckRequest = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Quick check against scam database
    const domain = extractDomain(url);
    const { data: scamMatch, error } = await supabase
      .from('scam_database')
      .select('types, risk_level, description')
      .or(`url.eq.${url},domain.eq.${domain}`)
      .single();

    if (scamMatch && !error) {
      return new Response(
        JSON.stringify({
          riskLevel: scamMatch.risk_level || 'high',
          threats: scamMatch.types || ['Known Scam'],
          description: scamMatch.description || 'This URL is flagged as dangerous',
          source: 'database'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If not in database, return safe status (quick check)
    return new Response(
      JSON.stringify({
        riskLevel: 'safe',
        threats: [],
        description: 'No immediate threats detected',
        source: 'quick-check'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in quick URL check:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

serve(handler);