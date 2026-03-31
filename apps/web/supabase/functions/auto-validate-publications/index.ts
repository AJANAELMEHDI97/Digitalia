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
    console.log("Starting auto-validation job...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all profiles with auto_validation_delay set
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("user_id, auto_validation_delay")
      .not("auto_validation_delay", "is", null);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }

    console.log(`Found ${profiles?.length || 0} profiles with auto-validation enabled`);

    let validatedCount = 0;

    for (const profile of profiles || []) {
      const delayHours = profile.auto_validation_delay === "24h" ? 24 : 48;
      const cutoffTime = new Date(Date.now() - delayHours * 60 * 60 * 1000).toISOString();

      console.log(`Processing user ${profile.user_id} with ${delayHours}h delay, cutoff: ${cutoffTime}`);

      // Find publications to auto-validate:
      // - Status is 'a_valider'
      // - Source is 'socialpulse' (only auto-generated content)
      // - Created before the cutoff time
      const { data: publications, error: pubError } = await supabase
        .from("publications")
        .select("id, content")
        .eq("user_id", profile.user_id)
        .eq("status", "a_valider")
        .eq("source", "socialpulse")
        .lt("created_at", cutoffTime);

      if (pubError) {
        console.error(`Error fetching publications for user ${profile.user_id}:`, pubError);
        continue;
      }

      if (publications && publications.length > 0) {
        console.log(`Found ${publications.length} publications to auto-validate for user ${profile.user_id}`);

        const ids = publications.map((p) => p.id);

        const { error: updateError } = await supabase
          .from("publications")
          .update({ status: "programme" })
          .in("id", ids);

        if (updateError) {
          console.error(`Error updating publications:`, updateError);
        } else {
          validatedCount += publications.length;
          console.log(`Auto-validated ${publications.length} publications for user ${profile.user_id}`);
        }
      }
    }

    console.log(`Auto-validation complete. Total validated: ${validatedCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        validated_count: validatedCount,
        message: `Auto-validated ${validatedCount} publications`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Auto-validation error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
