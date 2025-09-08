import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface ScanRequest {
  scanType: 'url' | 'file' | 'text';
  targetContent: string;
  userId: string;
}

interface VirusTotalResponse {
  data: {
    attributes: {
      stats: {
        malicious: number;
        suspicious: number;
        harmless: number;
        undetected: number;
      };
      last_analysis_results: Record<string, any>;
    };
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scanType, targetContent, userId }: ScanRequest = await req.json();
    
    console.log(`Starting scan: ${scanType} for user ${userId}`);

    // Create initial scan record
    const { data: scanRecord, error: insertError } = await supabase
      .from('scan_results')
      .insert({
        user_id: userId,
        scan_type: scanType,
        target_content: targetContent,
        scan_status: 'scanning'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating scan record:', insertError);
      throw new Error('Failed to create scan record');
    }

    console.log('Created scan record:', scanRecord.id);

    // Perform VirusTotal scan for URLs
    let virusTotalResults = null;
    if (scanType === 'url') {
      virusTotalResults = await performVirusTotalScan(targetContent);
    }

    // Perform OpenAI analysis
    const openAIAnalysis = await performOpenAIAnalysis(scanType, targetContent, virusTotalResults);

    // Calculate overall score and risk level
    const { overallScore, riskLevel, recommendations } = calculateRiskAssessment(virusTotalResults, openAIAnalysis);

    // Update scan record with results
    const { error: updateError } = await supabase
      .from('scan_results')
      .update({
        scan_status: 'completed',
        overall_score: overallScore,
        risk_level: riskLevel,
        virustotal_results: virusTotalResults,
        openai_analysis: openAIAnalysis,
        recommendations,
        completed_at: new Date().toISOString()
      })
      .eq('id', scanRecord.id);

    if (updateError) {
      console.error('Error updating scan record:', updateError);
      throw new Error('Failed to update scan record');
    }

    console.log('Scan completed successfully:', scanRecord.id);

    return new Response(JSON.stringify({
      success: true,
      scanId: scanRecord.id,
      overallScore,
      riskLevel,
      recommendations
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-scanner function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function performVirusTotalScan(url: string) {
  try {
    const VIRUSTOTAL_API_KEY = Deno.env.get('VIRUSTOTAL_API_KEY');
    if (!VIRUSTOTAL_API_KEY) {
      console.log('VirusTotal API key not found, skipping VirusTotal scan');
      return null;
    }

    console.log('Performing VirusTotal scan for:', url);

    // Submit URL for analysis
    const submitResponse = await fetch('https://www.virustotal.com/api/v3/urls', {
      method: 'POST',
      headers: {
        'x-apikey': VIRUSTOTAL_API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `url=${encodeURIComponent(url)}`
    });

    if (!submitResponse.ok) {
      console.error('VirusTotal submit failed:', submitResponse.statusText);
      return null;
    }

    const submitData = await submitResponse.json();
    const analysisId = submitData.data.id;

    console.log('VirusTotal analysis ID:', analysisId);

    // Wait a bit for analysis to complete
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Get analysis results
    const analysisResponse = await fetch(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, {
      headers: {
        'x-apikey': VIRUSTOTAL_API_KEY
      }
    });

    if (!analysisResponse.ok) {
      console.error('VirusTotal analysis failed:', analysisResponse.statusText);
      return null;
    }

    const analysisData: VirusTotalResponse = await analysisResponse.json();
    console.log('VirusTotal analysis completed');
    
    return analysisData;

  } catch (error) {
    console.error('Error in VirusTotal scan:', error);
    return null;
  }
}

async function performOpenAIAnalysis(scanType: string, content: string, virusTotalResults: any) {
  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      console.log('OpenAI API key not found, skipping AI analysis');
      return null;
    }

    console.log('Performing OpenAI analysis');

    const prompt = `
Analyze the following ${scanType} for security risks and provide a detailed assessment:

Content: ${content}

${virusTotalResults ? `VirusTotal Results: ${JSON.stringify(virusTotalResults.data?.attributes?.stats)}` : ''}

Please provide:
1. Security risk assessment (scale 1-10)
2. Potential threats identified
3. Specific recommendations
4. Red flags or suspicious indicators
5. Overall safety verdict

Respond in JSON format with these fields:
{
  "riskScore": number,
  "threats": string[],
  "redFlags": string[],
  "analysis": string,
  "verdict": "safe" | "suspicious" | "dangerous"
}
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a cybersecurity expert specializing in threat analysis and risk assessment.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API failed:', response.statusText);
      return null;
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;
    
    try {
      const analysis = JSON.parse(analysisText);
      console.log('OpenAI analysis completed');
      return analysis;
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      return { analysis: analysisText, riskScore: 5, verdict: 'unknown' };
    }

  } catch (error) {
    console.error('Error in OpenAI analysis:', error);
    return null;
  }
}

function calculateRiskAssessment(virusTotalResults: any, openAIAnalysis: any) {
  let overallScore = 50; // Default neutral score
  let riskLevel = 'medium';
  const recommendations: string[] = [];

  // Calculate score based on VirusTotal results
  if (virusTotalResults?.data?.attributes?.stats) {
    const stats = virusTotalResults.data.attributes.stats;
    const total = stats.malicious + stats.suspicious + stats.harmless + stats.undetected;
    
    if (total > 0) {
      const maliciousRatio = stats.malicious / total;
      const suspiciousRatio = stats.suspicious / total;
      
      if (maliciousRatio > 0.1) {
        overallScore = Math.max(0, overallScore - 40);
      } else if (suspiciousRatio > 0.2) {
        overallScore = Math.max(0, overallScore - 20);
      } else if (stats.harmless > total * 0.7) {
        overallScore = Math.min(100, overallScore + 30);
      }
    }
  }

  // Adjust score based on OpenAI analysis
  if (openAIAnalysis?.riskScore) {
    const aiScore = (10 - openAIAnalysis.riskScore) * 10; // Convert 1-10 to 0-90
    overallScore = Math.round((overallScore + aiScore) / 2);
  }

  // Determine risk level
  if (overallScore >= 80) {
    riskLevel = 'safe';
    recommendations.push('This content appears to be safe based on our analysis.');
  } else if (overallScore >= 60) {
    riskLevel = 'low';
    recommendations.push('Low risk detected. Exercise normal caution.');
  } else if (overallScore >= 40) {
    riskLevel = 'medium';
    recommendations.push('Medium risk detected. Be cautious when interacting with this content.');
  } else if (overallScore >= 20) {
    riskLevel = 'high';
    recommendations.push('High risk detected. Avoid interacting with this content.');
  } else {
    riskLevel = 'critical';
    recommendations.push('Critical risk detected. Do not interact with this content under any circumstances.');
  }

  // Add specific recommendations from AI analysis
  if (openAIAnalysis?.threats?.length > 0) {
    recommendations.push(`Threats identified: ${openAIAnalysis.threats.join(', ')}`);
  }

  return { overallScore, riskLevel, recommendations };
}