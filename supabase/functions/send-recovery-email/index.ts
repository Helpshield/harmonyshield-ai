import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.1";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: 'confirmation' | 'status_update';
  userEmail: string;
  userName: string;
  requestId: string;
  requestTitle: string;
  requestType: string;
  status?: string;
  message?: string;
}

const serve_handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const { type, userEmail, userName, requestId, requestTitle, requestType, status, message }: EmailRequest = await req.json();

    let emailSubject = "";
    let emailHtml = "";

    if (type === 'confirmation') {
      emailSubject = `Recovery Request Submitted - ${requestTitle}`;
      emailHtml = `
        <h2>Recovery Request Confirmation</h2>
        <p>Dear ${userName},</p>
        <p>Your ${requestType} recovery request has been successfully submitted.</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Request Details:</h3>
          <p><strong>Request ID:</strong> ${requestId}</p>
          <p><strong>Title:</strong> ${requestTitle}</p>
          <p><strong>Type:</strong> ${requestType.charAt(0).toUpperCase() + requestType.slice(1)}</p>
          <p><strong>Status:</strong> Pending Review</p>
        </div>
        <p>Our recovery specialists will review your case and begin the investigation process. You'll receive updates as your case progresses.</p>
        <p>You can track your request progress by logging into your HarmonyShield account.</p>
        <p>Best regards,<br>HarmonyShield Recovery Team</p>
      `;
    } else if (type === 'status_update') {
      emailSubject = `Recovery Request Update - ${requestTitle}`;
      emailHtml = `
        <h2>Recovery Request Status Update</h2>
        <p>Dear ${userName},</p>
        <p>There's an update on your ${requestType} recovery request.</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Request Details:</h3>
          <p><strong>Request ID:</strong> ${requestId}</p>
          <p><strong>Title:</strong> ${requestTitle}</p>
          <p><strong>New Status:</strong> ${status}</p>
          ${message ? `<p><strong>Update Message:</strong> ${message}</p>` : ''}
        </div>
        <p>Log into your HarmonyShield account to view the full details and progress timeline.</p>
        <p>Best regards,<br>HarmonyShield Recovery Team</p>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "HarmonyShield <noreply@harmonyshield.com>",
      to: [userEmail],
      subject: emailSubject,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(serve_handler);