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
    const { url, platform, platforms, legalAngle } = await req.json();
    
    if (!url || !url.trim()) {
      return new Response(JSON.stringify({ error: "URL requise" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SOCIALPULSE_AI_API_KEY = Deno.env.get("SOCIALPULSE_AI_API_KEY");
    const SOCIALPULSE_AI_GATEWAY_URL = Deno.env.get("SOCIALPULSE_AI_GATEWAY_URL");
    if (!SOCIALPULSE_AI_API_KEY) {
      throw new Error("SOCIALPULSE_AI_API_KEY is not configured");
    }
    if (!SOCIALPULSE_AI_GATEWAY_URL) {
      throw new Error("SOCIALPULSE_AI_GATEWAY_URL is not configured");
    }

    // Determine the most restrictive platform constraints
    const targetPlatforms = platforms && platforms.length > 0 ? platforms : [platform || "linkedin"];
    
    const platformGuidelines: Record<string, { maxLength: number; style: string }> = {
      linkedin: { 
        maxLength: 3000, 
        style: "professionnel, pédagogique et structuré. Utilise des paragraphes clairs et un appel à l'action." 
      },
      instagram: { 
        maxLength: 2200, 
        style: "synthétique et visuel. Inclus des emojis pertinents et des hashtags juridiques." 
      },
      facebook: { 
        maxLength: 2000, 
        style: "conversationnel et accessible. Encourage l'engagement avec une question." 
      },
      twitter: { 
        maxLength: 280, 
        style: "très concis et percutant. Maximum 280 caractères." 
      },
    };

    // Apply the most restrictive constraints
    let minMaxLength = Infinity;
    let styleGuides: string[] = [];
    
    for (const p of targetPlatforms) {
      const guidelines = platformGuidelines[p] || platformGuidelines.linkedin;
      if (guidelines.maxLength < minMaxLength) {
        minMaxLength = guidelines.maxLength;
      }
      styleGuides.push(`${p}: ${guidelines.style}`);
    }

    // Build legal angle instructions if enabled
    const legalAngleInstructions = legalAngle ? `
ORIENTATION JURIDIQUE ACTIVÉE - TRÈS IMPORTANT:
- Analyse ce contenu EXCLUSIVEMENT sous l'angle du droit
- Identifie les implications légales et réglementaires
- Mets en avant les points de vigilance juridiques pour les professionnels
- Formule comme un avis d'expert en droit
- Cite le cadre légal applicable si pertinent (lois, règlements, jurisprudence)
- Adopte un ton d'autorité juridique
- Commence par une accroche juridique (ex: "D'un point de vue juridique...", "Sur le plan du droit...", "Cette évolution soulève une question juridique importante...")
` : '';

    const systemPrompt = `Tu es un expert en communication juridique et community management pour avocats.

Tu dois analyser le contenu d'un lien externe (article, actualité, décision) et générer une prise de parole professionnelle.
${legalAngleInstructions}
INSTRUCTIONS STRICTES:
1. Analyse le lien fourni et identifie:
   - Le sujet principal
   - Les points clés
   ${legalAngle ? '- Les enjeux juridiques, implications légales et risques\n   - Le cadre réglementaire applicable' : '- Les enjeux juridiques éventuels'}

2. Génère une prise de parole:
   - Ton professionnel et pédagogique
   - Formulation comme une prise de parole d'avocat expert
   - NE PAS reprendre le texte source de façon brute
   ${legalAngle ? '- Orienter TOUT le contenu sous l\'angle juridique\n   - Mettre en avant les implications légales et points de vigilance' : '- Commencer par une accroche engageante (ex: "Une décision récente vient rappeler que...", "Point important pour les professionnels...")'}
   
3. Longueur maximale: ${minMaxLength} caractères

4. Adaptation aux réseaux ciblés:
${styleGuides.map(s => `   - ${s}`).join('\n')}

5. FORMAT DE RÉPONSE:
   - Réponds UNIQUEMENT avec le texte du post, prêt à publier
   - Pas de guillemets autour du texte
   - Pas d'explications ni de commentaires`;

    const userPrompt = `Analyse ce lien et génère une prise de parole professionnelle:

URL: ${url}

Visite cette URL, analyse son contenu, et génère un post adapté pour un avocat ou professionnel du droit qui souhaite commenter cette actualité/article de manière experte.`;

    console.log("Generating content from URL:", url, "for platforms:", targetPlatforms);

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
          { role: "user", content: userPrompt }
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

    console.log("Successfully generated content from URL, length:", generatedContent.length);

    return new Response(JSON.stringify({ 
      content: generatedContent,
      source_url: url,
      generated_from_link: true
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-from-url error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erreur inconnue" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
