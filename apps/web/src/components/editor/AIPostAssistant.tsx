import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, Wand2 } from "lucide-react";
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

interface AIPostAssistantProps {
  platform: string;
  onGenerated: (content: string) => void;
}

const TONE_OPTIONS = [
  { value: "professional", label: "Institutionnel" },
  { value: "pedagogical", label: "Pédagogique" },
  { value: "authoritative", label: "Expert" },
  { value: "accessible", label: "Accessible" },
  { value: "neutral", label: "Neutre" },
];

const PROMPT_SUGGESTIONS = [
  "Point juridique sur une actualité",
  "Conseil pratique pour les justiciables",
  "Explication d'une procédure",
  "Retour d'expérience anonymisé",
  "Changement législatif récent",
  "Rappel de mes domaines d'expertise",
];

export function AIPostAssistant({ platform, onGenerated }: AIPostAssistantProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("professional");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez décrire le sujet de votre publication",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-post", {
        body: { prompt, platform, tone },
      });

      if (error) throw error;

      if (data?.content) {
        onGenerated(data.content);
        setOpen(false);
        setPrompt("");
        toast({
          title: "Contenu généré !",
          description: "L'IA a rédigé votre publication. Vous pouvez l'ajuster si nécessaire.",
        });
      } else if (data?.error) {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("AI generation error:", error);
      toast({
        title: "Erreur de génération",
        description: error instanceof Error ? error.message : "Impossible de générer le contenu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Assistance rédactionnelle
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Assistant de rédaction professionnelle
          </DialogTitle>
          <DialogDescription>
            Décrivez votre sujet. L'assistant vous aide à structurer une communication claire, 
            professionnelle et adaptée à {platform}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Suggestions rapides */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Suggestions rapides</Label>
            <div className="flex flex-wrap gap-2">
              {PROMPT_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-xs px-2 py-1 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Zone de texte pour le prompt */}
          <div className="space-y-2">
            <Label htmlFor="ai-prompt">De quoi souhaitez-vous parler ?</Label>
            <Textarea
              id="ai-prompt"
              placeholder="Ex: Expliquer les nouvelles dispositions sur le télétravail et leurs implications pour les salariés..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          {/* Sélection du ton */}
          <div className="space-y-2">
            <Label>Ton souhaité</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TONE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Info plateforme */}
          <p className="text-xs text-muted-foreground">
            Le contenu sera optimisé pour <span className="font-medium capitalize">{platform}</span>
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleGenerate} disabled={loading || !prompt.trim()}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Génération...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Générer
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
