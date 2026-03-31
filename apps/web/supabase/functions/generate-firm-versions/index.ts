import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SOCIALPULSE_AI_API_KEY = Deno.env.get("SOCIALPULSE_AI_API_KEY");
    const SOCIALPULSE_AI_GATEWAY_URL = Deno.env.get("SOCIALPULSE_AI_GATEWAY_URL");
    if (!SOCIALPULSE_AI_API_KEY) throw new Error("SOCIALPULSE_AI_API_KEY is not configured");
    if (!SOCIALPULSE_AI_GATEWAY_URL) throw new Error("SOCIALPULSE_AI_GATEWAY_URL is not configured");

    const { masterContent, firms } = await req.json();

    if (!masterContent?.trim()) {
      return new Response(
        JSON.stringify({ error: "Le contenu master est vide." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!firms || firms.length === 0) {
      return new Response(
        JSON.stringify({ error: "Aucun cabinet fourni." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const firmsDescription = firms
      .map((f: any, i: number) => `${i + 1}. ID: "${f.id}" — ${f.name}${f.city ? ` (${f.city})` : ""}${f.specializations?.length ? ` — Spécialités : ${f.specializations.join(", ")}` : ""}`)
      .join("\n");

    const systemPrompt = `Tu es un expert en communication juridique pour les cabinets d'avocats.

MISSION
À partir d'un contenu master (publication de référence), tu dois créer une version adaptée pour chaque cabinet listé.

RÈGLES D'ADAPTATION
- Adapter l'angle selon les spécialités du cabinet (ex: un cabinet en droit du travail côté employeur vs un cabinet côté salarié)
- Adapter le vocabulaire et les exemples au contexte géographique du cabinet si pertinent
- Garder le même sujet et la même structure générale
- Chaque version doit être unique et apporter une valeur ajoutée différente
- Respecter la déontologie des avocats : pas de conseil juridique personnalisé, rester pédagogique
- Conserver approximativement la même longueur que le contenu master
- Ne pas ajouter de hashtags sauf si le master en contient`;

    const userPrompt = `CONTENU MASTER :
"""
${masterContent}
"""

CABINETS À DÉCLINER :
${firmsDescription}

Génère une version adaptée du contenu pour chaque cabinet en utilisant la fonction generate_versions.`;

    const response = await fetch(SOCIALPULSE_AI_GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SOCIALPULSE_AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_versions",
              description: "Retourne les versions adaptées du contenu pour chaque cabinet",
              parameters: {
                type: "object",
                properties: {
                  versions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        firmId: { type: "string", description: "L'ID du cabinet" },
                        content: { type: "string", description: "Le contenu adapté pour ce cabinet" },
                      },
                      required: ["firmId", "content"],
                    },
                  },
                },
                required: ["versions"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_versions" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requêtes atteinte, réessayez plus tard." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Crédit IA insuffisant." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    let versions: any[] = [];

    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      try {
        const args = JSON.parse(toolCall.function.arguments);
        versions = args.versions || [];
      } catch (e) {
        console.error("Error parsing tool call arguments:", e);
      }
    }

    console.log(`Generated ${versions.length} firm versions`);

    return new Response(
      JSON.stringify({ success: true, versions }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating firm versions:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erreur lors de la génération" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
