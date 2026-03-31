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
    const { conversationMessages, lawyerName, lawFirmName, requestType, action } = await req.json();
    
    const SOCIALPULSE_AI_API_KEY = Deno.env.get("SOCIALPULSE_AI_API_KEY");
    const SOCIALPULSE_AI_GATEWAY_URL = Deno.env.get("SOCIALPULSE_AI_GATEWAY_URL");
    if (!SOCIALPULSE_AI_API_KEY) {
      throw new Error("SOCIALPULSE_AI_API_KEY is not configured");
    }
    if (!SOCIALPULSE_AI_GATEWAY_URL) {
      throw new Error("SOCIALPULSE_AI_GATEWAY_URL is not configured");
    }

    const requestTypeLabels: Record<string, string> = {
      content_post: "Contenu / publication",
      editorial_planning: "Planning éditorial",
      performance: "Performance",
      firm_settings: "Paramètres cabinet",
      general_question: "Question générale"
    };

    const systemPrompt = `Tu es un assistant IA pour aider les Community Managers dans leur communication avec les avocats clients.

Ton rôle:
- Analyser les messages des avocats pour comprendre leur demande
- Fournir des résumés clairs et concis
- Suggérer des réponses professionnelles et adaptées
- Recommander des actions concrètes

Tu NE DOIS JAMAIS:
- Prendre de décisions à la place du CM
- Envoyer de messages directement
- Valider des contenus sans supervision humaine
- Faire des promesses au nom du cabinet

Contexte:
- Avocat: ${lawyerName || "Non spécifié"}
- Cabinet: ${lawFirmName || "Non spécifié"}
- Type de demande: ${requestTypeLabels[requestType] || requestType || "Non qualifié"}

Tu dois répondre en JSON avec cette structure exacte:
{
  "summary": "Résumé de la demande en 1-2 phrases",
  "suggestedResponse": "Proposition de réponse professionnelle pour le CM",
  "recommendedActions": ["action1", "action2", "action3"],
  "suggestedRequestType": "type_suggéré",
  "suggestedUrgency": "normal|low|urgent",
  "suggestedExpectedAction": "information|modification|validation|advice"
}

Actions possibles:
- "Répondre au message"
- "Demander des clarifications"
- "Créer une tâche éditoriale"
- "Modifier les paramètres du cabinet"
- "Planifier un appel"
- "Escalader au support technique"
- "Proposer un nouveau contenu"
- "Réviser la stratégie éditoriale"`;

    const userMessages = conversationMessages || [];
    const messagesForAI = userMessages.map((msg: { sender: string; content: string }) => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.content
    }));

    const actionPrompts: Record<string, string> = {
      analyze: "Analyse cette conversation et fournis un résumé, une suggestion de réponse et des actions recommandées.",
      suggest_response: "Propose une réponse professionnelle et empathique à ce dernier message.",
      qualify: "Qualifie cette demande (type, urgence, action attendue) en te basant sur le contenu des messages."
    };

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
          ...messagesForAI,
          { role: "user", content: actionPrompts[action] || actionPrompts.analyze }
        ],
        response_format: { type: "json_object" }
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
    const content = data.choices?.[0]?.message?.content || "{}";
    
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = {
        summary: content,
        suggestedResponse: "",
        recommendedActions: [],
        suggestedRequestType: "general_question",
        suggestedUrgency: "normal",
        suggestedExpectedAction: "information"
      };
    }

    console.log("CM AI Assistant response generated for:", lawyerName, action);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("cm-ai-assistant error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erreur inconnue" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
