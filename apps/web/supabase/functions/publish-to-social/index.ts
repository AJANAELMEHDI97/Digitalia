import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authHeader = req.headers.get("Authorization");
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader || "" } },
    });

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { platform, content, connectionId } = await req.json();

    console.log(`[publish-to-social] Platform: ${platform}, User: ${user.id}`);

    // Get the connection
    const { data: connection, error: connError } = await supabase
      .from("social_connections")
      .select("*")
      .eq("id", connectionId)
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (connError || !connection) {
      console.error("[publish-to-social] Connection not found:", connError);
      return new Response(
        JSON.stringify({ error: "Connection not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let result;

    // Handle webhook-based publishing (Make.com)
    if (connection.connection_type === "webhook" && connection.webhook_url) {
      console.log(`[publish-to-social] Publishing via webhook to ${platform}`);
      
      const webhookPayload = {
        platform,
        text: content.text,
        message: content.text, // Alias for compatibility
        image_url: content.imageUrl || null,
        link: content.link || null,
        publication_id: content.publicationId || null,
        user_id: user.id,
        timestamp: new Date().toISOString(),
      };

      const webhookResponse = await fetch(connection.webhook_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(webhookPayload),
      });

      if (!webhookResponse.ok) {
        const errorText = await webhookResponse.text();
        console.error("[publish-to-social] Webhook error:", errorText);
        throw new Error(`Webhook failed: ${webhookResponse.status}`);
      }

      let webhookData: Record<string, unknown> = {};
      try {
        webhookData = await webhookResponse.json();
      } catch {
        // Some webhooks don't return JSON
        webhookData = { status: "sent" };
      }

      result = {
        success: true,
        method: "webhook",
        post_id: (webhookData.post_id as string) || null,
        response: webhookData,
      };
    }
    // Handle OAuth-based publishing (LinkedIn)
    else if (connection.connection_type === "oauth" && connection.access_token) {
      if (platform === "linkedin") {
        console.log("[publish-to-social] Publishing to LinkedIn via API");

        // First get the user's LinkedIn URN
        const profileResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
          headers: { Authorization: `Bearer ${connection.access_token}` },
        });

        if (!profileResponse.ok) {
          // Token might be expired
          console.error("[publish-to-social] LinkedIn profile fetch failed");
          throw new Error("LinkedIn token expired or invalid");
        }

        const profile = await profileResponse.json();
        const authorUrn = `urn:li:person:${profile.sub}`;

        // Create the post
        const postPayload = {
          author: authorUrn,
          lifecycleState: "PUBLISHED",
          specificContent: {
            "com.linkedin.ugc.ShareContent": {
              shareCommentary: {
                text: content.text,
              },
              shareMediaCategory: content.imageUrl ? "IMAGE" : "NONE",
            },
          },
          visibility: {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
          },
        };

        const postResponse = await fetch("https://api.linkedin.com/v2/ugcPosts", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${connection.access_token}`,
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
          },
          body: JSON.stringify(postPayload),
        });

        if (!postResponse.ok) {
          const errorText = await postResponse.text();
          console.error("[publish-to-social] LinkedIn post error:", errorText);
          throw new Error(`LinkedIn API error: ${postResponse.status}`);
        }

        const postData = await postResponse.json();
        result = {
          success: true,
          method: "oauth",
          post_id: postData.id,
          response: postData,
        };
      } else {
        throw new Error(`OAuth publishing not supported for ${platform}`);
      }
    } else {
      throw new Error("Invalid connection configuration");
    }

    console.log(`[publish-to-social] Success:`, result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[publish-to-social] Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage, success: false }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
