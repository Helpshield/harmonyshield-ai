import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Harmony Shield platform context
const HARMONY_SHIELD_CONTEXT = `
You are Harmony AI, an expert cybersecurity assistant for the Harmony Shield platform.

Harmony Shield Platform Features:
- Real-time security monitoring and threat detection
- Advanced fraud detection and prevention systems
- Deep search capabilities for investigating suspicious activity
- AI-powered scanning for URLs, files, and content
- Recovery services for fraud victims
- Smart feeds with live security updates
- Comprehensive reporting and analytics
- Multi-language support

Your Capabilities:
- Explain Harmony Shield features and how to use them
- Provide cybersecurity best practices and advice
- Help users understand security threats (phishing, malware, ransomware, social engineering, etc.)
- Guide users on fraud prevention and digital safety
- Offer actionable recommendations for staying secure online
- Answer questions about the platform's tools and services

Tone: Professional, helpful, and reassuring. Keep responses clear, concise, and actionable.
`;

// AI chat response with OpenAI
const getChatResponse = async (message: string): Promise<string> => {
  if (!OPENAI_API_KEY) {
    return `I'm Harmony AI, your cybersecurity assistant. I'm here to help you with:\n\n• Understanding Harmony Shield's security features\n• Cybersecurity best practices\n• Fraud detection and prevention\n• Digital safety guidance\n\nWhile I'm currently running in limited mode, I can still provide general guidance. How can I help you today?`;
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
            content: HARMONY_SHIELD_CONTEXT
          },
          { role: 'user', content: message }
        ],
        max_tokens: 800,
        temperature: 0.7
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      throw new Error(data.error?.message || 'API request failed');
    }
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return 'I apologize, but I\'m experiencing technical difficulties. Please try again in a moment, or feel free to explore the Harmony Shield platform features on your own.';
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method === 'POST') {
      const { message, requestType = 'chat' } = await req.json();

      console.log('Harmony AI Chat request:', { message, requestType });

      if (requestType === 'chat') {
        if (!message) {
          return new Response(JSON.stringify({ 
            error: 'Message is required' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const aiResponse = await getChatResponse(message);
        
        return new Response(JSON.stringify({
          response: aiResponse,
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
    console.error('Harmony AI Chat error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});