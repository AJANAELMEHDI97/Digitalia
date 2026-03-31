import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageIcon, Loader2, Wand2, Sparkles } from "lucide-react";
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

interface AIImageGeneratorProps {
  postContent: string;
  onGenerated: (imageUrl: string) => void;
}

const STYLE_OPTIONS = [
  { value: "professional", label: "Professionnel" },
  { value: "creative", label: "Créatif" },
  { value: "minimalist", label: "Minimaliste" },
  { value: "vibrant", label: "Vibrant" },
  { value: "elegant", label: "Élégant" },
];

export function AIImageGenerator({ postContent, onGenerated }: AIImageGeneratorProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("professional");
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && postContent.trim()) {
      // Auto-fill prompt with post content summary
      setPrompt(postContent.slice(0, 200));
    }
    if (!isOpen) {
      setPreviewImage(null);
    }
  };

  const handleGenerate = async () => {
    const finalPrompt = prompt.trim() || postContent.trim();
    
    if (!finalPrompt) {
      toast({
        title: "Erreur",
        description: "Décrivez l'image souhaitée ou rédigez d'abord votre publication",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setPreviewImage(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: { prompt: finalPrompt, style },
      });

      if (error) throw error;

      if (data?.imageUrl) {
        setPreviewImage(data.imageUrl);
        toast({
          title: "Image générée !",
          description: "Cliquez sur 'Utiliser cette image' pour l'ajouter à votre publication.",
        });
      } else if (data?.error) {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("AI image generation error:", error);
      toast({
        title: "Erreur de génération",
        description: error instanceof Error ? error.message : "Impossible de générer l'image",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUseImage = () => {
    if (previewImage) {
      onGenerated(previewImage);
      setOpen(false);
      setPreviewImage(null);
      setPrompt("");
      toast({
        title: "Image ajoutée",
        description: "L'image a été ajoutée à votre publication.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Générer avec l'IA
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Générateur d'image IA
          </DialogTitle>
          <DialogDescription>
            Décrivez l'image souhaitée ou utilisez le contenu de votre publication.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Zone de texte pour la description */}
          <div className="space-y-2">
            <Label htmlFor="image-prompt">Description de l'image</Label>
            <Textarea
              id="image-prompt"
              placeholder="Ex: Une équipe professionnelle en réunion collaborative dans un bureau moderne..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground">
              Laissez vide pour utiliser le contenu de votre publication
            </p>
          </div>

          {/* Sélection du style */}
          <div className="space-y-2">
            <Label>Style visuel</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STYLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prévisualisation de l'image générée */}
          {previewImage && (
            <div className="space-y-2">
              <Label>Aperçu</Label>
              <div className="relative rounded-lg overflow-hidden border bg-muted">
                <img 
                  src={previewImage} 
                  alt="Image générée par IA" 
                  className="w-full h-48 object-cover"
                />
              </div>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Génération en cours...</span>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          {previewImage ? (
            <>
              <Button variant="outline" onClick={handleGenerate} disabled={loading}>
                <Sparkles className="mr-2 h-4 w-4" />
                Régénérer
              </Button>
              <Button onClick={handleUseImage}>
                <ImageIcon className="mr-2 h-4 w-4" />
                Utiliser cette image
              </Button>
            </>
          ) : (
            <Button onClick={handleGenerate} disabled={loading}>
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
