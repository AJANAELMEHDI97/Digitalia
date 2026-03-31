import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Background scraping task
async function performScraping(
  jobId: string,
  formattedUrl: string,
  firecrawlApiKey: string,
  supabaseUrl: string,
  supabaseServiceKey: string
) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log("Background scraping started for:", formattedUrl);

    // Use Firecrawl to scrape with structured data extraction
    const scrapeResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${firecrawlApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ["extract"],
        extract: {
          prompt: `Extract all lawyer information from this page. For each lawyer found, extract their full name, first name, last name, email, phone, address, city, bar association (barreau), specializations/practice areas, website URL, LinkedIn URL, and photo URL. Return an array of lawyer objects.`,
          schema: {
            type: "object",
            properties: {
              lawyers: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    full_name: { type: "string" },
                    first_name: { type: "string" },
                    last_name: { type: "string" },
                    email: { type: "string" },
                    phone: { type: "string" },
                    address: { type: "string" },
                    city: { type: "string" },
                    bar_association: { type: "string" },
                    specializations: { type: "array", items: { type: "string" } },
                    website: { type: "string" },
                    linkedin_url: { type: "string" },
                    photo_url: { type: "string" },
                  },
                  required: ["full_name"],
                },
              },
            },
          },
        },
        onlyMainContent: true,
        timeout: 60000, // 60 second timeout for Firecrawl
      }),
    });

    const scrapeData = await scrapeResponse.json();

    if (!scrapeResponse.ok) {
      console.error("Firecrawl API error:", scrapeData);
      
      await supabase
        .from("scraping_jobs")
        .update({
          status: "failed",
          error_message: scrapeData.error || "Scraping failed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", jobId);

      return;
    }

    console.log("Scrape response received");

    // Extract lawyers from response
    const lawyersData = scrapeData.data?.extract?.lawyers || scrapeData.extract?.lawyers || [];
    console.log(`Found ${lawyersData.length} lawyers`);

    let scrapedCount = 0;

    // Insert lawyers into database
    for (const lawyer of lawyersData) {
      if (!lawyer.full_name) continue;

      const { error: insertError } = await supabase.from("lawyers").insert({
        full_name: lawyer.full_name,
        first_name: lawyer.first_name || null,
        last_name: lawyer.last_name || null,
        email: lawyer.email || null,
        phone: lawyer.phone || null,
        address: lawyer.address || null,
        city: lawyer.city || null,
        bar_association: lawyer.bar_association || null,
        specializations: lawyer.specializations || null,
        website: lawyer.website || null,
        linkedin_url: lawyer.linkedin_url || null,
        photo_url: lawyer.photo_url || null,
        source_url: formattedUrl,
      });

      if (insertError) {
        console.error("Error inserting lawyer:", insertError);
      } else {
        scrapedCount++;
      }
    }

    // Update job as completed
    await supabase
      .from("scraping_jobs")
      .update({
        status: "completed",
        total_found: lawyersData.length,
        total_scraped: scrapedCount,
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    console.log(`Scraping completed: ${scrapedCount} lawyers inserted`);
  } catch (error) {
    console.error("Background scraping error:", error);
    
    await supabase
      .from("scraping_jobs")
      .update({
        status: "failed",
        error_message: error instanceof Error ? error.message : "Unknown error",
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, searchQuery, searchType = "manual" } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const firecrawlApiKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (!firecrawlApiKey) {
      console.error("FIRECRAWL_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Firecrawl connector not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the user from the auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin");

    if (!roles || roles.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    // Create scraping job with new fields
    const { data: job, error: jobError } = await supabase
      .from("scraping_jobs")
      .insert({
        source_url: formattedUrl,
        status: "running",
        started_at: new Date().toISOString(),
        created_by: user.id,
        search_query: searchQuery || null,
        search_type: searchType,
      })
      .select()
      .single();

    if (jobError) {
      console.error("Error creating job:", jobError);
      throw new Error("Failed to create scraping job");
    }

    console.log("Job created, starting background scraping for:", formattedUrl);

    // Start background task - this continues after response is sent
    // @ts-ignore - EdgeRuntime is available in Supabase Edge Functions
    EdgeRuntime.waitUntil(
      performScraping(
        job.id,
        formattedUrl,
        firecrawlApiKey,
        supabaseUrl,
        supabaseServiceKey
      )
    );

    // Return immediately - scraping continues in background
    return new Response(
      JSON.stringify({
        success: true,
        message: "Scraping démarré en arrière-plan",
        jobId: job.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in scrape-lawyers:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to start scraping";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
