import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface NotificationRequest {
  issueId: string;
  userEmail: string;
  issueTitle: string;
  oldStatus: string;
  newStatus: string;
  language: "en" | "hi";
}

const statusLabels = {
  submitted: { en: "Submitted", hi: "सबमिट किया गया" },
  acknowledged: { en: "Acknowledged", hi: "स्वीकार किया गया" },
  in_progress: { en: "In Progress", hi: "प्रगति में" },
  resolved: { en: "Resolved", hi: "हल किया गया" },
};

const statusColors = {
  submitted: "#3b82f6",
  acknowledged: "#eab308",
  in_progress: "#f97316",
  resolved: "#22c55e",
};

function getEmailContent(data: NotificationRequest) {
  const { issueTitle, oldStatus, newStatus, language } = data;
  const statusLabel = statusLabels[newStatus as keyof typeof statusLabels] || { en: newStatus, hi: newStatus };
  const statusColor = statusColors[newStatus as keyof typeof statusColors] || "#6b7280";

  if (language === "hi") {
    return {
      subject: `स्थिति अपडेट: आपकी समस्या "${issueTitle}"`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1e40af, #10b981); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">नगर कनेक्ट</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0;">नागरिक समस्या पोर्टल</p>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937; margin-top: 0;">स्थिति अपडेट</h2>
            
            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <p style="margin: 0 0 10px;"><strong>समस्या:</strong> ${issueTitle}</p>
              <p style="margin: 0;">
                <strong>नई स्थिति:</strong> 
                <span style="background: ${statusColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px;">
                  ${statusLabel.hi}
                </span>
              </p>
            </div>
            
            ${newStatus === "resolved" ? `
              <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #065f46;">🎉 आपकी समस्या का समाधान हो गया है! कृपया अपने अनुभव का मूल्यांकन करने के लिए ऐप खोलें।</p>
              </div>
            ` : ""}
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              यह एक स्वचालित सूचना है। कृपया अधिक जानकारी के लिए ऐप देखें।
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p>© 2024 नगर कनेक्ट - नागरिक समस्या पोर्टल</p>
          </div>
        </body>
        </html>
      `,
    };
  }

  return {
    subject: `Status Update: Your issue "${issueTitle}"`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e40af, #10b981); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">NagarConnect</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0;">Citizen Issue Portal</p>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin-top: 0;">Status Update</h2>
          
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <p style="margin: 0 0 10px;"><strong>Issue:</strong> ${issueTitle}</p>
            <p style="margin: 0;">
              <strong>New Status:</strong> 
              <span style="background: ${statusColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px;">
                ${statusLabel.en}
              </span>
            </p>
          </div>
          
          ${newStatus === "resolved" ? `
            <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #065f46;">🎉 Your issue has been resolved! Please open the app to rate your experience.</p>
            </div>
          ` : ""}
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            This is an automated notification. Please check the app for more details.
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
          <p>© 2024 NagarConnect - Citizen Issue Portal</p>
        </div>
      </body>
      </html>
    `,
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-notification function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("No authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client with the user's JWT
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if user is admin using the is_admin function
    const { data: isAdmin, error: adminError } = await supabaseClient.rpc('is_admin', { 
      check_user_id: user.id 
    });
    
    if (adminError || !isAdmin) {
      console.error("Admin check failed:", adminError);
      return new Response(
        JSON.stringify({ error: "Forbidden: Admin access required" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const data: NotificationRequest = await req.json();
    console.log("Notification request:", JSON.stringify(data));

    const { issueId, userEmail, issueTitle, oldStatus, newStatus, language } = data;

    if (!userEmail || !issueTitle || !newStatus || !issueId) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate that the issue exists and email matches
    const { data: issue, error: issueError } = await supabaseClient
      .from('issues')
      .select('user_email, title')
      .eq('id', issueId)
      .single();
    
    if (issueError || !issue) {
      console.error("Issue not found:", issueError);
      return new Response(
        JSON.stringify({ error: "Issue not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify the email matches the issue's user_email
    if (issue.user_email !== userEmail) {
      console.error("Email mismatch");
      return new Response(
        JSON.stringify({ error: "Invalid request" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const emailContent = getEmailContent(data);

    console.log(`Sending email to ${userEmail} for issue "${issueTitle}" - status: ${newStatus}`);

    const emailResponse = await resend.emails.send({
      from: "NagarConnect <onboarding@resend.dev>",
      to: [userEmail],
      subject: emailContent.subject,
      html: emailContent.html,
    });

    console.log("Email sent successfully:", JSON.stringify(emailResponse));

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse.data?.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-notification function:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send notification. Please try again later." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
