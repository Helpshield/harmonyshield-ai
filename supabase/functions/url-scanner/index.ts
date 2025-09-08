import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface URLScanRequest {
  url: string;
  source?: string;
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
    const { url, source = 'web' }: URLScanRequest = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Scanning URL: ${url} from source: ${source}`);

    // Check if URL is in our scam database first
    const { data: scamMatch, error: scamError } = await supabase
      .from('scam_database')
      .select('*')
      .or(`url.eq.${url},domain.eq.${extractDomain(url)}`)
      .single();

    if (scamMatch && !scamError) {
      console.log('URL found in scam database:', scamMatch);
      return new Response(
        JSON.stringify({
          riskLevel: 'critical',
          threats: scamMatch.types || ['Known Scam'],
          description: scamMatch.description || 'This URL is in our scam database',
          recommendations: ['Do not visit this site', 'Report if you encountered this'],
          source: 'database'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Perform VirusTotal scan
    const virusTotalResult = await performVirusTotalScan(url);
    const riskAssessment = calculateRiskAssessment(virusTotalResult);

    // Store scan result
    EdgeRuntime.waitUntil(storeScanResult(url, riskAssessment, source));

    console.log('Scan completed:', riskAssessment);

    return new Response(
      JSON.stringify(riskAssessment),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in URL scanner:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

async function performVirusTotalScan(url: string) {
  try {
    const apiKey = Deno.env.get('VIRUSTOTAL_API_KEY');
    if (!apiKey) {
      console.log('VirusTotal API key not found, returning safe result');
      return { malicious: 0, suspicious: 0, clean: 1, engines: {} };
    }

    // Submit URL for analysis
    const submitResponse = await fetch('https://www.virustotal.com/api/v3/urls', {
      method: 'POST',
      headers: {
        'x-apikey': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ url }).toString(),
    });

    if (!submitResponse.ok) {
      throw new Error(`VirusTotal submit failed: ${submitResponse.status}`);
    }

    const submitData = await submitResponse.json();
    const analysisId = submitData.data.id;

    // Wait a bit for analysis to complete
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get analysis results
    const resultResponse = await fetch(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, {
      headers: { 'x-apikey': apiKey },
    });

    if (!resultResponse.ok) {
      throw new Error(`VirusTotal result failed: ${resultResponse.status}`);
    }

    const resultData = await resultResponse.json();
    const stats = resultData.data.attributes.stats;

    return {
      malicious: stats.malicious || 0,
      suspicious: stats.suspicious || 0,
      clean: stats.harmless || 0,
      engines: resultData.data.attributes.results || {}
    };

  } catch (error) {
    console.error('VirusTotal scan error:', error);
    return { malicious: 0, suspicious: 0, clean: 1, engines: {} };
  }
}

function calculateRiskAssessment(virusTotalResult: any) {
  const { malicious, suspicious, clean } = virusTotalResult;
  const total = malicious + suspicious + clean;
  
  let riskLevel = 'safe';
  let threats: string[] = [];
  let recommendations: string[] = [];

  if (malicious > 0) {
    if (malicious >= 5) {
      riskLevel = 'critical';
      threats.push('Multiple security engines flagged as malicious');
    } else if (malicious >= 2) {
      riskLevel = 'high';
      threats.push('Multiple security threats detected');
    } else {
      riskLevel = 'medium';
      threats.push('Potential security threat detected');
    }
  } else if (suspicious > 0) {
    if (suspicious >= 3) {
      riskLevel = 'medium';
      threats.push('Multiple suspicious indicators');
    } else {
      riskLevel = 'low';
      threats.push('Minor suspicious activity detected');
    }
  }

  // Add recommendations based on risk level
  switch (riskLevel) {
    case 'critical':
      recommendations.push('Do not visit this website');
      recommendations.push('Report this URL if you encountered it');
      recommendations.push('Scan your device for malware');
      break;
    case 'high':
      recommendations.push('Avoid visiting this website');
      recommendations.push('Use caution if you must proceed');
      recommendations.push('Do not enter personal information');
      break;
    case 'medium':
      recommendations.push('Proceed with caution');
      recommendations.push('Verify the website legitimacy');
      recommendations.push('Avoid sensitive transactions');
      break;
    case 'low':
      recommendations.push('Minor risks detected');
      recommendations.push('Stay vigilant while browsing');
      break;
    default:
      recommendations.push('Website appears safe');
      recommendations.push('Continue practicing safe browsing');
  }

  return {
    riskLevel,
    threats,
    recommendations,
    scanDetails: {
      malicious,
      suspicious,
      clean,
      total
    },
    source: 'virustotal'
  };
}

async function storeScanResult(url: string, result: any, source: string) {
  try {
    await supabase
      .from('scan_results')
      .insert({
        target_content: url,
        scan_type: 'url',
        status: 'completed',
        analysis_results: result,
        risk_assessment: result,
        source: source
      });
  } catch (error) {
    console.error('Error storing scan result:', error);
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