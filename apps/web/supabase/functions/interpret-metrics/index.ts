import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const systemPrompt = `Tu es l'agent éditorial de SocialPulse, spécialisé dans l'interprétation des performances de communication pour avocats et cabinets d'avocats.

RÈGLES STRICTES :
- Conserve les chiffres tels quels, sans les modifier
- Interprétation courte : 1 à 2 phrases maximum
- Aucun jargon marketing (pas de "viralité", "buzz", "ROI", "KPI")
- Aucune promesse de résultat commercial
- Aucun conseil juridique
- Ton formel, institutionnel, rassurant
- Utilise le vouvoiement
- Français institutionnel et professionnel

ÉVALUATION DU STATUT :
- 🟢 Communication maîtrisée : engagement > 3.5% OU portée élevée avec engagement correct
- 🟡 À optimiser : engagement entre 2% et 3.5%
- 🔴 Sujet sensible : engagement < 2% OU nécessite attention particulière

EXEMPLES DE TON À SUIVRE :
- "Cette prise de parole remplit son objectif d'information juridique, sans générer de réactions sensibles."
- "La visibilité est correcte. L'intérêt suscité reste modéré, ce qui est habituel pour un sujet technique."
- "Ce contenu a bien résonné auprès de vos abonnés. Le format utilisé renforce la crédibilité de votre cabinet."
- "Cette communication atteint efficacement vos prospects et justiciables."

CONTEXTE :
- Les avocats valorisent la crédibilité, la clarté et la réputation plus que la viralité
- Les métriques seules ne suffisent pas, l'interprétation doit rassurer et guider`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reach, likes, comments, shares, clicks, engagementRate, platform, topic } = await req.json();

    const SOCIALPULSE_AI_API_KEY = Deno.env.get("SOCIALPULSE_AI_API_KEY");
    const SOCIALPULSE_AI_GATEWAY_URL = Deno.env.get("SOCIALPULSE_AI_GATEWAY_URL");
    if (!SOCIALPULSE_AI_API_KEY) {
      throw new Error("SOCIALPULSE_AI_API_KEY is not configured");
    }
    if (!SOCIALPULSE_AI_GATEWAY_URL) {
      throw new Error("SOCIALPULSE_AI_GATEWAY_URL is not configured");
    }

    const userPrompt = `Analyse cette prise de parole professionnelle d'un avocat :

Métriques :
- Portée : ${reach.toLocaleString("fr-FR")} personnes
- Mentions J'aime : ${likes}
- Commentaires : ${comments}
${shares !== undefined ? `- Partages/Recommandations : ${shares}` : ""}
${clicks !== undefined ? `- Clics : ${clicks}` : ""}
- Taux d'engagement : ${engagementRate}%
- Plateforme : ${platform || "LinkedIn"}
${topic ? `- Thématique : ${topic}` : ""}

Génère une interprétation professionnelle adaptée au contexte juridique.`;

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
              name: "provide_interpretation",
              description: "Fournit l'interprétation structurée des métriques de communication",
              parameters: {
                type: "object",
                properties: {
                  status: {
                    type: "string",
                    enum: ["green", "yellow", "red"],
                    description: "Statut de la communication : green = maîtrisée, yellow = à optimiser, red = sujet sensible",
                  },
                  statusLabel: {
                    type: "string",
                    enum: ["Communication maîtrisée", "À optimiser", "Sujet sensible"],
                    description: "Label du statut en français",
                  },
                  interpretation: {
                    type: "string",
                    description: "Interprétation en 1-2 phrases, ton professionnel et rassurant",
                  },
                  recommendation: {
                    type: "string",
                    description: "Recommandation optionnelle en 1 phrase maximum, uniquement si utile",
                  },
                },
                required: ["status", "statusLabel", "interpretation"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "provide_interpretation" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall || toolCall.function.name !== "provide_interpretation") {
      throw new Error("Unexpected response format from AI");
    }

    const interpretation = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(interpretation), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("interpret-metrics error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
