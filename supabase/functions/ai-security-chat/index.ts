import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const VIRUSTOTAL_API_KEY = Deno.env.get('VIRUSTOTAL_API_KEY');

// Using local translation instead of external APIs
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Local translation patterns for security terms
const securityTranslations = {
  es: {
    'threat': 'amenaza', 'security': 'seguridad', 'warning': 'advertencia',
    'safe': 'seguro', 'dangerous': 'peligroso', 'scan': 'escanear',
    'file': 'archivo', 'url': 'enlace', 'clean': 'limpio',
    'infected': 'infectado', 'suspicious': 'sospechoso'
  },
  fr: {
    'threat': 'menace', 'security': 'sécurité', 'warning': 'avertissement',
    'safe': 'sûr', 'dangerous': 'dangereux', 'scan': 'scanner',
    'file': 'fichier', 'url': 'lien', 'clean': 'propre',
    'infected': 'infecté', 'suspicious': 'suspect'
  },
  de: {
    'threat': 'Bedrohung', 'security': 'Sicherheit', 'warning': 'Warnung',
    'safe': 'sicher', 'dangerous': 'gefährlich', 'scan': 'scannen',
    'file': 'Datei', 'url': 'Link', 'clean': 'sauber',
    'infected': 'infiziert', 'suspicious': 'verdächtig'
  }
};

// Local translation function with error handling
const translateSecurityText = (text: string, targetLanguage: string): string => {
  if (targetLanguage === 'en' || !securityTranslations[targetLanguage as keyof typeof securityTranslations]) {
    return text;
  }
  
  try {
    const translations = securityTranslations[targetLanguage as keyof typeof securityTranslations];
    let translatedText = text;
    
    Object.entries(translations).forEach(([english, translated]) => {
      const regex = new RegExp(`\\b${english}\\b`, 'gi');
      translatedText = translatedText.replace(regex, translated);
    });
    
    return translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text if translation fails
  }
};

// File scanning with VirusTotal API
const scanFile = async (fileHash: string): Promise<any> => {
  if (!VIRUSTOTAL_API_KEY) {
    return { error: 'VirusTotal API key not configured' };
  }

  try {
    const response = await fetch(`https://www.virustotal.com/vtapi/v2/file/report?apikey=${VIRUSTOTAL_API_KEY}&resource=${fileHash}`, {
      method: 'GET'
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('File scan error:', error);
    return { error: 'Failed to scan file' };
  }
};

// URL scanning
const scanURL = async (url: string): Promise<any> => {
  if (!VIRUSTOTAL_API_KEY) {
    return { error: 'VirusTotal API key not configured' };
  }

  try {
    const response = await fetch(`https://www.virustotal.com/vtapi/v2/url/report?apikey=${VIRUSTOTAL_API_KEY}&resource=${url}`, {
      method: 'GET'
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('URL scan error:', error);
    return { error: 'Failed to scan URL' };
  }
};

// AI chat response with OpenAI
const getChatResponse = async (message: string, language: string = 'en'): Promise<string> => {
  if (!OPENAI_API_KEY) {
    return translateSecurityText('I am your security assistant. I can help scan files and URLs for threats, but OpenAI integration is not configured.', language);
  }

  try {
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
            content: `You are Harmony AI, a security assistant specializing in cybersecurity, fraud detection, and digital safety. 
            Provide helpful, accurate security advice. Focus on:
            - Identifying potential security threats
            - Providing actionable safety recommendations  
            - Explaining cybersecurity concepts clearly
            - Helping users stay safe online
            Keep responses concise and helpful. Always prioritize user safety.`
          },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Apply local translation to the response
    return translateSecurityText(aiResponse, language);
  } catch (error) {
    console.error('OpenAI API error:', error);
    return translateSecurityText('I apologize, but I am experiencing technical difficulties. Please try again later.', language);
  }
};

// Get daily threat information
const getDailyThreats = (): any[] => {
  return [
    {
      type: 'phishing',
      severity: 'high',
      description: 'New email phishing campaign targeting financial institutions detected',
      recommendation: 'Verify sender authenticity before clicking any links in financial emails'
    },
    {
      type: 'malware',
      severity: 'medium', 
      description: 'Fake software update notifications spreading malware',
      recommendation: 'Only download updates from official sources'
    },
    {
      type: 'social_engineering',
      severity: 'high',
      description: 'Romance scam reports increased by 30% this week',
      recommendation: 'Be cautious of online relationships requesting money or personal information'
    }
  ];
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method === 'POST') {
      const { 
        message, 
        language = 'en', 
        action, 
        fileHash, 
        url,
        requestType = 'chat'
      } = await req.json();

      console.log('AI Security Chat request:', { message, language, action, requestType });

      // Handle different request types
      switch (requestType) {
        case 'file_scan':
          if (!fileHash) {
            return new Response(JSON.stringify({ 
              error: translateSecurityText('File hash required for scanning', language) 
            }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
          
          const fileScanResult = await scanFile(fileHash);
          return new Response(JSON.stringify({
            scanResult: fileScanResult,
            message: translateSecurityText('File scan completed', language)
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });

        case 'url_scan':
          if (!url) {
            return new Response(JSON.stringify({ 
              error: translateSecurityText('URL required for scanning', language) 
            }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
          
          const urlScanResult = await scanURL(url);
          return new Response(JSON.stringify({
            scanResult: urlScanResult,
            message: translateSecurityText('URL scan completed', language)
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });

        case 'daily_threats':
          const threats = getDailyThreats();
          return new Response(JSON.stringify({
            threats: threats.map(threat => ({
              ...threat,
              description: translateSecurityText(threat.description, language),
              recommendation: translateSecurityText(threat.recommendation, language)
            }))
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });

        case 'chat':
        default:
          if (!message) {
            return new Response(JSON.stringify({ 
              error: translateSecurityText('Message is required', language) 
            }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          const aiResponse = await getChatResponse(message, language);
          
          return new Response(JSON.stringify({
            response: aiResponse,
            language: language,
            timestamp: new Date().toISOString()
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
      }
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI Security Chat error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});