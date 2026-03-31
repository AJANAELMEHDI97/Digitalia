import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    if (!SOCIALPULSE_AI_API_KEY) {
      throw new Error("SOCIALPULSE_AI_API_KEY is not configured");
    }
    if (!SOCIALPULSE_AI_GATEWAY_URL) {
      throw new Error("SOCIALPULSE_AI_GATEWAY_URL is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const {
      law_firm_id,
      start_date,
      end_date,
      thematics,
      platforms,
      tone,
      frequency,
      city,
      content_types = [],
      publish_days = [],
      publish_times = [],
      scheduling_mode = "manual",
    } = await req.json();

    console.log("Generating editorial plan for:", { law_firm_id, start_date, end_date, thematics, platforms, tone, frequency });

    // Récupérer les infos du cabinet
    let firmInfo = { city: city || "France", name: "" };
    if (law_firm_id) {
      const { data: firm } = await supabase
        .from("law_firms")
        .select("name, city")
        .eq("id", law_firm_id)
        .single();
      if (firm) {
        firmInfo = { city: firm.city || "France", name: firm.name };
      }
    }

    // Calculer le nombre de publications
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const weeks = Math.ceil(days / 7);

    let pubsPerWeek = 3;
    switch (frequency) {
      case "1_per_week": pubsPerWeek = 1; break;
      case "2_per_week": pubsPerWeek = 2; break;
      case "3_per_week": pubsPerWeek = 3; break;
      case "daily": pubsPerWeek = 5; break;
    }

    const totalPubs = Math.min(pubsPerWeek * weeks, 30);

    // Construire les contraintes supplémentaires
    const contentTypesStr = content_types.length > 0
      ? `\n- Types de contenus à utiliser : ${content_types.join(", ")}`
      : "\n- Types de contenus : mélange libre (post pédagogique, actualité juridique, décryptage de jurisprudence, conseil pratique, question fréquente, cas concret, erreur juridique à éviter)";

    let publishDaysStr = "";
    let publishTimesStr = "";

    if (scheduling_mode === "auto") {
      publishDaysStr = "\n- OPTIMISATION AUTOMATIQUE : choisis les jours et heures les plus performants pour un cabinet spécialisé en " + thematics.join(", ") + " basé à " + firmInfo.city + ". Privilégie les créneaux à fort engagement (mardi-jeudi, 9h-10h et 12h-13h).";
    } else {
      publishDaysStr = publish_days.length > 0
        ? `\n- Jours de publication privilégiés : ${publish_days.join(", ")}`
        : "";
      publishTimesStr = publish_times.length > 0
        ? `\n- Heures de publication recommandées : ${publish_times.join(", ")}`
        : "";
    }

    const systemPrompt = `Tu es un expert en communication juridique et en stratégie éditoriale pour les cabinets d'avocats.

CONTEXTE
Tu travailles pour un cabinet d'avocats dont les informations suivantes sont fournies :
- Domaine(s) de droit : ${thematics.join(", ")}
- Ville / pays : ${firmInfo.city}
- Réseaux sociaux utilisés : ${platforms.join(", ")}
- Ton éditorial : ${tone}
- Fréquence de publication : ${frequency.replace("_", " ")}
- Période à générer : du ${start_date} au ${end_date}${contentTypesStr}${publishDaysStr}${publishTimesStr}

OBJECTIF
Générer ${totalPubs} prises de parole professionnelles prêtes à être programmées,
dans le respect strict des règles déontologiques des avocats.

IMPORTANT
- Tu ne donnes JAMAIS de conseil juridique personnalisé
- Tu restes pédagogique, neutre et informatif
- Tu t'adresses au grand public
- Le ton doit être professionnel, clair et accessible
- Aucun contenu ne doit être alarmiste, commercial agressif ou promotionnel excessif

RÈGLES DE RÉPARTITION
- Varier les thématiques sur la période
- Alterner les types/formats de contenu
- Éviter les répétitions de sujets
- Respecter la fréquence demandée
- Répartir les publications de manière équilibrée sur la période
- Si des jours de publication sont spécifiés, programmer les publications ces jours-là
- Si des heures sont spécifiées, utiliser ces créneaux horaires`;

    const userPrompt = `Génère exactement ${totalPubs} publications pour la période du ${start_date} au ${end_date}.

Pour chaque publication, fournis :
1. Date suggérée (format YYYY-MM-DD)
2. Heure suggérée (format HH:MM)
3. Réseau social concerné (parmi: ${platforms.join(", ")})
4. Thématique juridique
5. Objectif (pédagogie / notoriété / actualité / information générale)
6. Titre de la publication
7. Texte complet de la publication (adapté au réseau)
8. Type de contenu (pedagogique, actualite, conseil, question, jurisprudence, cas_concret, erreur) - ce champ détermine le template visuel :
   - pedagogique → carrousel pédagogique (3-5 slides)
   - actualite → carte actualité juridique
   - conseil → carte conseil pratique
   - question → carte Q&A
   - Autres → visuel standard
9. Suggestion de format (texte seul / visuel / carrousel)
10. Hashtags professionnels (2-4 hashtags)

IMPORTANT : Varie les content_type pour créer un mix éditorial riche. Assure-toi qu'au moins 30% des publications sont de type "pedagogique" (carrousel).

Utilise la fonction suggest_publications pour retourner les publications au format structuré.`;

    console.log("Calling SocialPulse AI gateway...");

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
              name: "suggest_publications",
              description: "Retourne la liste des publications générées pour le plan éditorial",
              parameters: {
                type: "object",
                properties: {
                  publications: {
                    type: "array",
                    items: {
                type: "object",
                      properties: {
                        date: { type: "string", description: "Date au format YYYY-MM-DD" },
                        time: { type: "string", description: "Heure au format HH:MM" },
                        platform: { type: "string", enum: ["linkedin", "facebook", "instagram", "twitter", "google_business", "blog"] },
                        thematic: { type: "string" },
                        objective: { type: "string", enum: ["pédagogie", "notoriété", "actualité", "information générale"] },
                        title: { type: "string" },
                        content: { type: "string" },
                        content_type: { type: "string", enum: ["pedagogique", "actualite", "conseil", "question", "jurisprudence", "cas_concret", "erreur"], description: "Type de contenu pour déterminer le template visuel" },
                        format_suggestion: { type: "string", enum: ["texte seul", "visuel", "carrousel"] },
                        hashtags: { type: "array", items: { type: "string" } },
                      },
                      required: ["date", "time", "platform", "thematic", "objective", "title", "content", "content_type", "format_suggestion", "hashtags"],
                    },
                  },
                },
                required: ["publications"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "suggest_publications" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requêtes atteinte, veuillez réessayer plus tard." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Crédit IA insuffisant, veuillez recharger votre compte." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log("AI Response received");

    let publications: any[] = [];
    
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      try {
        const args = JSON.parse(toolCall.function.arguments);
        publications = args.publications || [];
      } catch (e) {
        console.error("Error parsing tool call arguments:", e);
      }
    }

    console.log(`Generated ${publications.length} publications`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        publications,
        firm_name: firmInfo.name,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error generating editorial plan:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Erreur lors de la génération du plan éditorial" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
