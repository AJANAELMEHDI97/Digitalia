import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AssetRequest {
  type: "hero" | "portrait" | "illustration";
  id?: string;
  customPrompt?: string;
}

// Predefined prompts for different asset types - 3D Stylized Style
const PORTRAIT_PROMPTS = [
  {
    id: "sophie",
    prompt: "3D stylized cartoon portrait of a 40 year old French female lawyer, warm confident smile, wearing elegant navy blue blazer, soft gradient purple and blue background with floating colorful circles, Pixar style, clean render, professional look, no text"
  },
  {
    id: "marc",
    prompt: "3D stylized cartoon portrait of a 55 year old distinguished French male lawyer, silver hair, confident expression, wearing charcoal business suit, soft gradient blue and teal background with floating decorative bubbles, Pixar style, clean render, professional look, no text"
  },
  {
    id: "laura",
    prompt: "3D stylized cartoon portrait of a 35 year old French female lawyer, friendly professional smile, wearing modern burgundy blazer, soft gradient pink and violet background with floating colorful spheres, Pixar style, clean render, professional look, no text"
  },
  {
    id: "thomas",
    prompt: "3D stylized cartoon portrait of a 45 year old French male lawyer, approachable smile, wearing navy suit with subtle pattern, soft gradient indigo and blue background with floating orange and green circles, Pixar style, clean render, professional look, no text"
  }
];

const ILLUSTRATION_PROMPTS = [
  {
    id: "hero",
    prompt: "3D stylized cartoon illustration of a confident professional French lawyer in modern business attire, standing with tablet showing social media icons, floating colorful circles and bubbles in orange blue green violet around, soft pastel purple and blue gradient background, Pixar Blender style, clean render, cheerful professional, no text, high quality"
  },
  {
    id: "planning",
    prompt: "3D stylized cartoon illustration of a professional person organizing a floating calendar with colorful social media post cards flying around, decorative circles in orange blue emerald, soft pastel gradient background, Pixar style, clean render, no text, high quality"
  },
  {
    id: "validation",
    prompt: "3D stylized cartoon illustration of a professional with magnifying glass checking a floating document with large green checkmark, approval badges floating around, soft pastel emerald and blue gradient background, Pixar style, clean render, no text, high quality"
  },
  {
    id: "analytics",
    prompt: "3D stylized cartoon illustration of a happy professional person with growing 3D bar charts and pie charts floating around, trend arrows pointing up, colorful decorative spheres, soft pastel violet and blue gradient background, Pixar style, clean render, no text, high quality"
  },
  {
    id: "security",
    prompt: "3D stylized cartoon illustration of a large shield with legal scales symbol glowing, floating lock icons and checkmarks around, colorful bubbles in blue emerald orange, soft pastel gradient background, Pixar style, clean render, no text, high quality"
  },
  {
    id: "deontology",
    prompt: "3D stylized cartoon illustration of balanced legal scales with shield and gavel, floating compliance checkmarks, colorful bubbles in amber blue violet, soft pastel gradient background, Pixar style, clean render, no text, professional, high quality"
  },
  {
    id: "control",
    prompt: "3D stylized cartoon illustration of a professional giving thumbs up next to a large approval stamp, floating validated documents, colorful circles in emerald orange blue, soft pastel gradient background, Pixar style, clean render, no text, high quality"
  },
  {
    id: "growth",
    prompt: "3D stylized cartoon illustration of a professional standing on growing graph with social media icons floating up, trend arrows, colorful decorative bubbles in blue cyan emerald, soft pastel gradient background, Pixar style, clean render, no text, high quality"
  }
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, id, customPrompt }: AssetRequest = await req.json();
    
    const SOCIALPULSE_AI_API_KEY = Deno.env.get("SOCIALPULSE_AI_API_KEY");
    const SOCIALPULSE_AI_GATEWAY_URL = Deno.env.get("SOCIALPULSE_AI_GATEWAY_URL");
    if (!SOCIALPULSE_AI_API_KEY) {
      throw new Error("SOCIALPULSE_AI_API_KEY is not configured");
    }
    if (!SOCIALPULSE_AI_GATEWAY_URL) {
      throw new Error("SOCIALPULSE_AI_GATEWAY_URL is not configured");
    }

    let prompt = customPrompt;
    
    if (!prompt) {
      if (type === "portrait") {
        const portraitConfig = PORTRAIT_PROMPTS.find(p => p.id === id);
        if (!portraitConfig) {
          throw new Error(`Portrait ID not found: ${id}`);
        }
        prompt = portraitConfig.prompt;
      } else if (type === "illustration" || type === "hero") {
        const illustrationConfig = ILLUSTRATION_PROMPTS.find(p => p.id === (id || "hero"));
        if (!illustrationConfig) {
          throw new Error(`Illustration ID not found: ${id}`);
        }
        prompt = illustrationConfig.prompt;
      }
    }

    if (!prompt) {
      throw new Error("No prompt provided or found for the requested asset");
    }

    console.log(`Generating ${type} asset: ${id || 'custom'}`);

    const response = await fetch(SOCIALPULSE_AI_GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SOCIALPULSE_AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview",
        messages: [
          { role: "user", content: prompt }
        ],
        modalities: ["image", "text"]
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
    console.log("AI response received");

    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageUrl) {
      console.error("No image in response:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "Aucune image générée" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ 
      imageUrl,
      type,
      id: id || 'custom'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-landing-assets error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erreur inconnue" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
