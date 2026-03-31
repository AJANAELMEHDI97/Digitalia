import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// LinkedIn OAuth configuration
const LINKEDIN_CLIENT_ID = Deno.env.get("LINKEDIN_CLIENT_ID");
const LINKEDIN_CLIENT_SECRET = Deno.env.get("LINKEDIN_CLIENT_SECRET");

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

    const { action, platform, redirect_uri, code } = await req.json();

    console.log(`[social-oauth] Action: ${action}, Platform: ${platform}, User: ${user.id}`);

    switch (action) {
      case "get_auth_url": {
        if (platform === "linkedin") {
          if (!LINKEDIN_CLIENT_ID) {
            return new Response(
              JSON.stringify({ 
                error: "LinkedIn not configured",
                message: "LinkedIn OAuth is not yet configured. Please use webhook integration via Make.com instead."
              }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          const state = crypto.randomUUID();
          const scope = "openid profile email w_member_social";
          
          const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
            `response_type=code&` +
            `client_id=${LINKEDIN_CLIENT_ID}&` +
            `redirect_uri=${encodeURIComponent(redirect_uri)}&` +
            `state=${state}&` +
            `scope=${encodeURIComponent(scope)}`;

          return new Response(
            JSON.stringify({ auth_url: authUrl, state }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // For other platforms, suggest webhook integration
        return new Response(
          JSON.stringify({ 
            error: "OAuth not available",
            message: `Direct OAuth for ${platform} is not available. Please use webhook integration via Make.com.`
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "exchange_code": {
        if (platform === "linkedin") {
          if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET) {
            return new Response(
              JSON.stringify({ error: "LinkedIn not configured" }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          // Exchange code for token
          const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              grant_type: "authorization_code",
              code,
              redirect_uri,
              client_id: LINKEDIN_CLIENT_ID,
              client_secret: LINKEDIN_CLIENT_SECRET,
            }),
          });

          if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error("[social-oauth] LinkedIn token error:", errorText);
            return new Response(
              JSON.stringify({ error: "Failed to exchange code", details: errorText }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          const tokenData = await tokenResponse.json();
          console.log("[social-oauth] LinkedIn token received");

          // Get user profile
          const profileResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
          });

          let profileData = { name: "LinkedIn User", email: "", picture: "" };
          if (profileResponse.ok) {
            profileData = await profileResponse.json();
          }

          // Calculate expiration
          const expiresAt = new Date();
          expiresAt.setSeconds(expiresAt.getSeconds() + (tokenData.expires_in || 3600));

          // Save connection
          const { error: dbError } = await supabase.from("social_connections").upsert({
            user_id: user.id,
            platform: "linkedin",
            connection_type: "oauth",
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token || null,
            token_expires_at: expiresAt.toISOString(),
            account_name: profileData.name,
            account_email: profileData.email,
            account_avatar_url: profileData.picture,
            permissions: ["openid", "profile", "email", "w_member_social"],
            is_active: true,
            connected_at: new Date().toISOString(),
          }, {
            onConflict: "user_id,platform"
          });

          if (dbError) {
            console.error("[social-oauth] DB error:", dbError);
            return new Response(
              JSON.stringify({ error: "Failed to save connection" }),
              { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          return new Response(
            JSON.stringify({ success: true, profile: profileData }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ error: "OAuth exchange not supported for this platform" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Unknown action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[social-oauth] Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
