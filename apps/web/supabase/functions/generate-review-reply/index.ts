import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reviewerName, starRating, comment, businessName } = await req.json();

    if (!comment) {
      return new Response(
        JSON.stringify({ error: 'Le commentaire est requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const SOCIALPULSE_AI_API_KEY = Deno.env.get("SOCIALPULSE_AI_API_KEY");
    const SOCIALPULSE_AI_GATEWAY_URL = Deno.env.get("SOCIALPULSE_AI_GATEWAY_URL");
    if (!SOCIALPULSE_AI_API_KEY) {
      throw new Error("SOCIALPULSE_AI_API_KEY is not configured");
    }
    if (!SOCIALPULSE_AI_GATEWAY_URL) {
      throw new Error("SOCIALPULSE_AI_GATEWAY_URL is not configured");
    }

    const systemPrompt = `Tu es un assistant spécialisé dans la rédaction de réponses professionnelles aux avis Google Business pour des cabinets d'avocats et professionnels du droit.

Règles importantes :
- Réponds toujours en français
- Sois professionnel, courtois et empathique
- Personnalise la réponse en fonction du contenu de l'avis
- Pour les avis positifs (4-5 étoiles) : remercie chaleureusement et invite à revenir
- Pour les avis neutres (3 étoiles) : remercie et propose d'améliorer l'expérience
- Pour les avis négatifs (1-2 étoiles) : reste professionnel, excuse-toi si approprié, propose de résoudre le problème en privé
- Ne fais jamais de promesses juridiques spécifiques
- Garde une longueur de réponse appropriée (2-4 phrases)
- Utilise le nom du client si disponible`;

    const userPrompt = `Génère une réponse professionnelle pour cet avis Google :

${businessName ? `Cabinet : ${businessName}` : ''}
Client : ${reviewerName || 'Anonyme'}
Note : ${starRating || 'Non spécifiée'}/5 étoiles
Commentaire : "${comment}"

Réponds uniquement avec le texte de la réponse, sans introduction ni explication.`;

    console.log('Generating AI reply for review:', { reviewerName, starRating });

    const response = await fetch(SOCIALPULSE_AI_GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SOCIALPULSE_AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requêtes atteinte, veuillez réessayer plus tard." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Crédits insuffisants, veuillez recharger votre compte." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Erreur lors de la génération de la réponse");
    }

    const data = await response.json();
    const generatedReply = data.choices?.[0]?.message?.content?.trim();

    if (!generatedReply) {
      throw new Error("Aucune réponse générée");
    }

    console.log('Generated reply successfully');

    return new Response(
      JSON.stringify({ reply: generatedReply }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating review reply:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erreur inconnue' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
