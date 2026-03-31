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
    const { prompt, platform, tone } = await req.json();
    
    const SOCIALPULSE_AI_API_KEY = Deno.env.get("SOCIALPULSE_AI_API_KEY");
    const SOCIALPULSE_AI_GATEWAY_URL = Deno.env.get("SOCIALPULSE_AI_GATEWAY_URL");
    if (!SOCIALPULSE_AI_API_KEY) {
      throw new Error("SOCIALPULSE_AI_API_KEY is not configured");
    }
    if (!SOCIALPULSE_AI_GATEWAY_URL) {
      throw new Error("SOCIALPULSE_AI_GATEWAY_URL is not configured");
    }

    const platformGuidelines: Record<string, string> = {
      linkedin: "Le post doit être professionnel, informatif et établir votre expertise juridique. Utilise des emojis avec parcimonie. Longueur idéale: 150-300 mots. Inclus un appel à l'action à la fin.",
      instagram: "Le post doit être visuel et pédagogique. Vulgarise les concepts juridiques de manière accessible. Inclus des hashtags pertinents (5-10). Longueur: 100-200 mots.",
      facebook: "Le post doit être conversationnel et engageant. Pose des questions pour encourager les commentaires sur des sujets juridiques. Longueur: 100-250 mots.",
      twitter: "Le post doit être concis et percutant sur un point de droit. Maximum 280 caractères. Utilise 1-2 hashtags maximum.",
      google_business: "Le post doit être professionnel et informatif sur vos services juridiques. Longueur: 100-200 mots."
    };

    const toneGuidelines: Record<string, string> = {
      professional: "Ton institutionnel et expert, vocabulaire juridique précis",
      pedagogical: "Ton pédagogique et accessible, vulgarisation juridique",
      authoritative: "Ton expert et affirmé, démonstration de maîtrise",
      accessible: "Ton accessible et rassurant, proximité avec les justiciables",
      neutral: "Ton neutre et factuel, information objective"
    };

    const systemPrompt = `Tu es un assistant spécialisé en communication pour les avocats et cabinets d'avocats en France.
Tu rédiges des prises de parole professionnelles, claires et conformes à la déontologie de la profession d'avocat.

Règles impératives :
- Ton professionnel et crédible
- JAMAIS de conseil juridique personnalisé
- Vulgarisation accessible sans simplification excessive
- Respect absolu du secret professionnel
- Aucune promesse de résultat
- Pas de publicité comparative
- Respect de la dignité de la profession

Plateforme cible: ${platform || 'linkedin'}
${platformGuidelines[platform || 'linkedin']}

${tone ? `Ton demandé: ${toneGuidelines[tone] || tone}` : ''}

Instructions:
- Réponds UNIQUEMENT avec le contenu du post, sans explications ni commentaires
- Adapte le format et le style à la plateforme
- Assure-toi que le contenu est prêt à être publié tel quel
- N'utilise PAS de guillemets autour du texte
- Si c'est pour Twitter/X, respecte strictement la limite de 280 caractères`;

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
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Trop de requêtes, réessayez plus tard." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits IA insuffisants." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erreur du service IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const generatedContent = data.choices?.[0]?.message?.content || "";

    console.log("Generated post for platform:", platform, "prompt:", prompt.slice(0, 50));

    return new Response(JSON.stringify({ content: generatedContent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-post error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erreur inconnue" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
