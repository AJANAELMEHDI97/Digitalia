import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, Wand2, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AIArticleAssistantProps {
  onGenerated: (content: { title: string; content: string }) => void;
  existingContent?: string;
  existingTitle?: string;
}

const TONE_OPTIONS = [
  { value: "expert", label: "Expert juridique" },
  { value: "pedagogical", label: "Pédagogique" },
  { value: "accessible", label: "Grand public" },
  { value: "formal", label: "Formel" },
];

const ACTION_OPTIONS = [
  { value: "generate", label: "Générer un article complet" },
  { value: "improve", label: "Améliorer le texte existant" },
  { value: "restructure", label: "Restructurer le contenu" },
  { value: "simplify", label: "Simplifier le langage" },
];

const TOPIC_SUGGESTIONS = [
  "Les nouvelles obligations RGPD pour les entreprises",
  "Comprendre le divorce par consentement mutuel",
  "Les droits du salarié en cas de licenciement",
  "Succession : ce qu'il faut savoir avant de refuser un héritage",
  "Création d'entreprise : les étapes juridiques essentielles",
  "Bail commercial : les pièges à éviter",
];

export function AIArticleAssistant({ onGenerated, existingContent, existingTitle }: AIArticleAssistantProps) {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("expert");
  const [action, setAction] = useState("generate");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim() && action === "generate") {
      toast({
        title: "Erreur",
        description: "Veuillez décrire le sujet de votre article",
        variant: "destructive",
      });
      return;
    }

    if (!existingContent?.trim() && action !== "generate") {
      toast({
        title: "Erreur",
        description: "Vous devez d'abord rédiger du contenu à améliorer",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const systemPrompt = `Tu es un assistant éditorial expert en communication juridique pour des avocats français. 
Tu rédiges des articles de blog professionnels, structurés et adaptés au grand public tout en restant rigoureux sur le plan juridique.
Le ton doit être ${tone === "expert" ? "expert et technique, adapté à des professionnels du droit" : 
  tone === "pedagogical" ? "pédagogique et explicatif, vulgarisant les concepts juridiques" :
  tone === "accessible" ? "accessible et clair pour le grand public" : "formel et institutionnel"}.

Structure attendue pour un article :
- Un titre accrocheur et informatif
- Une introduction contextualisant le sujet
- Plusieurs paragraphes développant les points clés
- Une conclusion avec des conseils pratiques

Réponds UNIQUEMENT en JSON avec le format: {\"title\": \"...\", \"content\": \"...\"}`;

      let userPrompt = "";
      if (action === "generate") {
        userPrompt = `Rédige un article de blog complet sur le sujet suivant : ${topic}`;
      } else if (action === "improve") {
        userPrompt = `Améliore et enrichis cet article de blog tout en gardant son essence :

Titre actuel: ${existingTitle || "Sans titre"}

Contenu:
${existingContent}`;
      } else if (action === "restructure") {
        userPrompt = `Restructure cet article de blog pour une meilleure lisibilité avec des sous-titres clairs :

Titre actuel: ${existingTitle || "Sans titre"}

Contenu:
${existingContent}`;
      } else if (action === "simplify") {
        userPrompt = `Simplifie le langage de cet article de blog pour le rendre accessible au grand public :

Titre actuel: ${existingTitle || "Sans titre"}

Contenu:
${existingContent}`;
      }

      const { data, error } = await supabase.functions.invoke("generate-post", {
        body: { 
          prompt: userPrompt, 
          platform: "blog", 
          tone,
          systemPrompt 
        },
      });

      if (error) throw error;

      // Try to parse JSON response
      let result = { title: "", content: "" };
      try {
        const jsonMatch = data.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback: use as content
          result = {
            title: existingTitle || "Nouvel article",
            content: data.content,
          };
        }
      } catch {
        result = {
          title: existingTitle || "Nouvel article",
          content: data.content,
        };
      }

      onGenerated(result);
      setOpen(false);
      setTopic("");

      toast({
        title: "Article généré",
        description: "L'IA a préparé votre article. Relisez et personnalisez-le avant publication.",
      });
    } catch (error) {
      console.error("Error generating article:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer l'article. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Assistant IA
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            Assistant rédaction d'article
          </DialogTitle>
          <DialogDescription>
            L'IA vous aide à rédiger, améliorer ou restructurer vos articles de blog juridiques.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Action */}
          <div className="space-y-2">
            <Label>Que souhaitez-vous faire ?</Label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Topic (for generation) */}
          {action === "generate" && (
            <div className="space-y-2">
              <Label htmlFor="topic">Sujet de l'article</Label>
              <Textarea
                id="topic"
                placeholder="Décrivez le sujet que vous souhaitez traiter..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex flex-wrap gap-1.5">
                {TOPIC_SUGGESTIONS.slice(0, 3).map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="ghost"
                    size="sm"
                    className="h-auto py-1 px-2 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => setTopic(suggestion)}
                  >
                    <Wand2 className="h-3 w-3 mr-1" />
                    {suggestion.slice(0, 40)}...
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Existing content preview (for improvement) */}
          {action !== "generate" && existingContent && (
            <div className="space-y-2">
              <Label>Contenu actuel</Label>
              <div className="p-3 rounded-md bg-muted text-sm text-muted-foreground max-h-32 overflow-y-auto">
                {existingContent.slice(0, 300)}...
              </div>
            </div>
          )}

          {/* Tone */}
          <div className="space-y-2">
            <Label>Ton de l'article</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TONE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleGenerate} disabled={loading} className="gap-2">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Génération...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Générer
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
