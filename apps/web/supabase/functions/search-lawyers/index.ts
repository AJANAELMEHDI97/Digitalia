import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SearchResult {
  url: string;
  title: string;
  description: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { city, specialization, barAssociation, limit = 10 } = await req.json();

    if (!city && !specialization && !barAssociation) {
      return new Response(
        JSON.stringify({ success: false, error: "Au moins un critère de recherche est requis" }),
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

    // Verify auth
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

    // Build search queries
    const searchQueries: string[] = [];
    
    if (city) {
      searchQueries.push(`annuaire avocats ${city} France`);
      searchQueries.push(`barreau ${city} liste avocats`);
      if (specialization) {
        searchQueries.push(`avocats ${specialization} ${city}`);
      }
    }
    
    if (barAssociation) {
      searchQueries.push(`ordre des avocats ${barAssociation} annuaire`);
      searchQueries.push(`barreau de ${barAssociation} membres`);
    }
    
    if (specialization && !city) {
      searchQueries.push(`avocats spécialisés ${specialization} France`);
      searchQueries.push(`cabinet avocats ${specialization}`);
    }

    // If no specific queries, use general ones
    if (searchQueries.length === 0) {
      searchQueries.push("annuaire avocats France");
    }

    console.log("Search queries:", searchQueries);

    const allResults: SearchResult[] = [];
    const seenUrls = new Set<string>();

    // Execute searches
    for (const query of searchQueries.slice(0, 3)) { // Limit to 3 queries
      try {
        console.log("Searching:", query);
        
        const searchResponse = await fetch("https://api.firecrawl.dev/v1/search", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${firecrawlApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query,
            limit: Math.ceil(limit / searchQueries.length) + 2,
            lang: "fr",
            country: "fr",
          }),
        });

        const searchData = await searchResponse.json();
        
        if (searchResponse.ok && searchData.data) {
          for (const result of searchData.data) {
            if (!seenUrls.has(result.url)) {
              seenUrls.add(result.url);
              allResults.push({
                url: result.url,
                title: result.title || result.url,
                description: result.description || "",
              });
            }
          }
        }
      } catch (error) {
        console.error("Search error for query:", query, error);
      }
    }

    console.log(`Found ${allResults.length} unique URLs`);

    // Build search query description for logging
    const queryParts: string[] = [];
    if (city) queryParts.push(`ville: ${city}`);
    if (specialization) queryParts.push(`spécialisation: ${specialization}`);
    if (barAssociation) queryParts.push(`barreau: ${barAssociation}`);
    const searchQueryDesc = queryParts.join(", ");

    return new Response(
      JSON.stringify({
        success: true,
        results: allResults.slice(0, limit),
        searchQuery: searchQueryDesc,
        totalFound: allResults.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in search-lawyers:", error);
    const errorMessage = error instanceof Error ? error.message : "Search failed";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
