import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, X, Check, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { THEMATIC_LABELS, type MediaItem } from "@/data/mockMedia";

interface AIMediaGeneratorProps {
  onGenerated?: (imageUrl: string) => void;
}

const STYLE_OPTIONS = [
  { value: 'institutionnel', label: 'Institutionnel', description: 'Sobre et professionnel' },
  { value: 'moderne', label: 'Moderne', description: 'Design contemporain' },
  { value: 'minimaliste', label: 'Minimaliste', description: 'Épuré et élégant' },
];

export function AIMediaGenerator({ onGenerated }: AIMediaGeneratorProps) {
  const [thematic, setThematic] = useState<MediaItem['thematic'] | ''>('');
  const [style, setStyle] = useState('institutionnel');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!thematic) {
      toast.error("Veuillez sélectionner une thématique");
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const thematicLabel = THEMATIC_LABELS[thematic];
      const prompt = customPrompt 
        ? `${customPrompt}. Style ${style}, professionnel et institutionnel pour un cabinet d'avocats.`
        : `Visuel professionnel et ${style} sur le thème "${thematicLabel}" pour un cabinet d'avocats. Image sobre, institutionnelle et adaptée à une communication juridique professionnelle. Pas de texte sur l'image.`;

      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { prompt, style },
      });

      if (error) throw error;

      if (data?.imageUrl) {
        setGeneratedImage(data.imageUrl);
        toast.success("Visuel généré avec succès");
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error("Erreur lors de la génération du visuel");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAccept = () => {
    if (generatedImage && onGenerated) {
      onGenerated(generatedImage);
      toast.success("Visuel ajouté à votre sélection");
    }
    setGeneratedImage(null);
    setCustomPrompt('');
  };

  const handleReject = () => {
    setGeneratedImage(null);
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Génération assistée IA</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Créez un visuel professionnel à partir d'un thème juridique
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Thematic Selection */}
        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Thématique juridique
          </label>
          <Select value={thematic} onValueChange={(v) => setThematic(v as MediaItem['thematic'])}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une thématique" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(THEMATIC_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Style Selection */}
        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Style visuel
          </label>
          <div className="flex flex-wrap gap-2">
            {STYLE_OPTIONS.map((option) => (
              <Badge
                key={option.value}
                variant={style === option.value ? "default" : "outline"}
                className={`cursor-pointer transition-all ${
                  style === option.value 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                }`}
                onClick={() => setStyle(option.value)}
              >
                {option.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Custom Prompt */}
        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Description personnalisée (optionnel)
          </label>
          <Textarea
            placeholder="Décrivez plus précisément le visuel souhaité..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="min-h-[80px] resize-none"
          />
        </div>

        {/* Generated Image Preview */}
        {generatedImage && (
          <div className="space-y-3">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted">
              <img
                src={generatedImage}
                alt="Visuel généré"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={handleReject}
              >
                <X className="h-4 w-4" />
                Refuser
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleGenerate}
              >
                <RefreshCw className="h-4 w-4" />
                Régénérer
              </Button>
              <Button
                className="flex-1 gap-2"
                onClick={handleAccept}
              >
                <Check className="h-4 w-4" />
                Accepter
              </Button>
            </div>
          </div>
        )}

        {/* Generate Button */}
        {!generatedImage && (
          <Button
            className="w-full gap-2"
            onClick={handleGenerate}
            disabled={!thematic || isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Générer un visuel
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
