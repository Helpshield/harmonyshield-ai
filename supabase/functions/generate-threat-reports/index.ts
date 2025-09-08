import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ThreatReportData {
  title: string;
  description: string;
  threat_type: string;
  severity: string;
  status: string;
  threat_score: number;
  detection_methods: string[];
  affected_systems: string[];
  recommendations: string[];
  source_data: Record<string, any>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting threat report generation...');

    // Simulate threat intelligence gathering from multiple sources
    const threatReports = await generateThreatReports(supabaseClient);
    
    console.log(`Generated ${threatReports.length} threat reports`);

    // Insert the new threat reports
    const { data: insertedReports, error: insertError } = await supabaseClient
      .from('threat_reports')
      .insert(threatReports)
      .select();

    if (insertError) {
      console.error('Error inserting threat reports:', insertError);
      throw insertError;
    }

    // Update existing reports with new intelligence
    await updateExistingReports(supabaseClient);

    // Generate threat indicators for new reports
    if (insertedReports && insertedReports.length > 0) {
      await generateThreatIndicators(supabaseClient, insertedReports);
    }

    console.log('Threat report generation completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Threat reports generated successfully',
        reports_generated: threatReports.length,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in threat report generation:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

async function generateThreatReports(supabaseClient: any): Promise<ThreatReportData[]> {
  const reports: ThreatReportData[] = [];
  
  // Check recent scan results for new threats
  const { data: recentScans } = await supabaseClient
    .from('scan_results')
    .select('*')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .eq('risk_level', 'high');

  if (recentScans && recentScans.length > 0) {
    reports.push({
      title: `High Risk Scans Detected - ${recentScans.length} Alerts`,
      description: `Multiple high-risk scans detected in the last 24 hours. Immediate attention required.`,
      threat_type: 'malware',
      severity: 'high',
      status: 'active',
      threat_score: Math.min(90, 60 + recentScans.length * 5),
      detection_methods: ['Automated Scanning', 'Pattern Recognition'],
      affected_systems: ['Web Applications', 'User Devices'],
      recommendations: [
        'Review all flagged URLs immediately',
        'Update security policies',
        'Notify affected users'
      ],
      source_data: {
        scan_count: recentScans.length,
        detection_time: new Date().toISOString(),
        sample_urls: recentScans.slice(0, 3).map(scan => scan.target_content)
      }
    });
  }

  // Check for suspicious user patterns
  const { data: recentReports } = await supabaseClient
    .from('scam_reports')
    .select('scam_type, platform')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  if (recentReports && recentReports.length > 5) {
    const platformCounts = recentReports.reduce((acc: any, report: any) => {
      acc[report.platform] = (acc[report.platform] || 0) + 1;
      return acc;
    }, {});

    const topPlatform = Object.keys(platformCounts).reduce((a, b) => 
      platformCounts[a] > platformCounts[b] ? a : b
    );

    reports.push({
      title: `Surge in Scam Reports - ${topPlatform} Platform`,
      description: `Unusual spike in scam reports targeting ${topPlatform} users. Coordinated attack campaign suspected.`,
      threat_type: 'social_engineering',
      severity: recentReports.length > 15 ? 'critical' : 'high',
      status: 'active',
      threat_score: Math.min(95, 40 + recentReports.length * 3),
      detection_methods: ['Report Pattern Analysis', 'Platform Monitoring'],
      affected_systems: ['Social Media', 'Communication Platforms'],
      recommendations: [
        'Issue platform-specific warnings',
        'Enhance user education campaigns',
        'Coordinate with platform security teams'
      ],
      source_data: {
        total_reports: recentReports.length,
        platform_breakdown: platformCounts,
        trend_analysis: 'increasing'
      }
    });
  }

  // Generate time-based threat intelligence
  const currentHour = new Date().getHours();
  if (currentHour >= 9 && currentHour <= 17) { // Business hours
    reports.push({
      title: 'Business Hours Phishing Campaign Alert',
      description: 'Increased phishing activity detected during business hours targeting corporate emails.',
      threat_type: 'phishing',
      severity: 'medium',
      status: 'monitoring',
      threat_score: 55,
      detection_methods: ['Email Pattern Analysis', 'Temporal Analysis'],
      affected_systems: ['Email Systems', 'Corporate Networks'],
      recommendations: [
        'Increase email security monitoring',
        'Send phishing awareness reminders',
        'Review email gateway settings'
      ],
      source_data: {
        time_pattern: 'business_hours',
        detection_confidence: 0.75,
        historical_correlation: true
      }
    });
  }

  return reports;
}

async function updateExistingReports(supabaseClient: any) {
  // Update threat scores for existing active reports
  const { data: activeReports } = await supabaseClient
    .from('threat_reports')
    .select('id, threat_score, threat_type')
    .eq('status', 'active');

  if (activeReports && activeReports.length > 0) {
    const updates = activeReports.map((report: any) => ({
      id: report.id,
      threat_score: Math.max(0, report.threat_score - 5), // Decay threat score over time
      last_updated_at: new Date().toISOString()
    }));

    await supabaseClient
      .from('threat_reports')
      .upsert(updates, { onConflict: 'id' });
  }
}

async function generateThreatIndicators(supabaseClient: any, reports: any[]) {
  const indicators: any[] = [];

  for (const report of reports) {
    // Generate relevant indicators based on threat type
    switch (report.threat_type) {
      case 'phishing':
        indicators.push(
          {
            threat_report_id: report.id,
            indicator_type: 'email_pattern',
            indicator_value: 'urgent_account_verification',
            confidence_level: 0.85
          },
          {
            threat_report_id: report.id,
            indicator_type: 'domain_pattern',
            indicator_value: 'typosquatting',
            confidence_level: 0.90
          }
        );
        break;
      case 'malware':
        indicators.push(
          {
            threat_report_id: report.id,
            indicator_type: 'behavior',
            indicator_value: 'suspicious_network_activity',
            confidence_level: 0.88
          }
        );
        break;
      case 'social_engineering':
        indicators.push(
          {
            threat_report_id: report.id,
            indicator_type: 'social_pattern',
            indicator_value: 'impersonation_attempt',
            confidence_level: 0.75
          }
        );
        break;
    }
  }

  if (indicators.length > 0) {
    await supabaseClient
      .from('threat_indicators')
      .insert(indicators);
  }
}