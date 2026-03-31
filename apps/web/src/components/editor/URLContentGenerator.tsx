import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Link2, Loader2, ExternalLink, AlertCircle, CheckCircle2, X, Scale } from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";

interface URLContentGeneratorProps {
  platform: string;
  onGenerated: (content: string, sourceUrl: string) => void;
}

export function URLContentGenerator({ platform, onGenerated }: URLContentGeneratorProps) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [legalAngle, setLegalAngle] = useState(false);

  const isValidUrl = (urlString: string): boolean => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const handleGenerate = async () => {
    setError(null);
    
    if (!url.trim()) {
      setError("Veuillez coller un lien");
      return;
    }

    if (!isValidUrl(url)) {
      setError("Le lien n'est pas valide. Vérifiez le format (ex: https://example.com/article)");
      return;
    }

    setLoading(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-from-url", {
        body: { url, platform, legalAngle },
      });

      if (fnError) throw fnError;

      if (data?.content) {
        onGenerated(data.content, url);
        setOpen(false);
        setUrl("");
        toast({
          title: "Contenu généré !",
          description: (
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
              <span>Prise de parole créée à partir du lien. Vous pouvez l'ajuster.</span>
            </div>
          ),
        });
      } else if (data?.error) {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error("URL content generation error:", err);
      setError(err instanceof Error ? err.message : "Impossible d'analyser le lien");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setUrl("");
    setError(null);
    setLegalAngle(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        setUrl("");
        setError(null);
        setLegalAngle(false);
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Link2 className="h-4 w-4" />
          Depuis un lien
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-primary" />
            Générer depuis un lien
          </DialogTitle>
          <DialogDescription>
            Collez un lien d'article, actualité ou décision pour générer automatiquement une prise de parole professionnelle.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="url-input">Lien à analyser</Label>
            <div className="relative">
              <Input
                id="url-input"
                type="url"
                placeholder="https://example.com/article-juridique..."
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError(null);
                }}
                className={`pr-10 ${error ? 'border-destructive' : ''}`}
              />
              {url && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Exemple : article de presse, actualité juridique, communiqué officiel...
            </p>
          </div>

          {/* Legal angle checkbox */}
          <div className="flex items-start space-x-3 p-3 rounded-lg border border-border bg-muted/30">
            <Checkbox
              id="legal-angle"
              checked={legalAngle}
              onCheckedChange={(checked) => setLegalAngle(checked === true)}
              className="mt-0.5"
            />
            <div className="flex-1 space-y-1">
              <Label 
                htmlFor="legal-angle" 
                className="flex items-center gap-2 text-sm font-medium cursor-pointer"
              >
                <Scale className="h-4 w-4 text-primary" />
                Orienter sous l'angle du droit
              </Label>
              <p className="text-xs text-muted-foreground">
                L'IA mettra en avant les enjeux juridiques et les implications légales
              </p>
            </div>
          </div>

          {/* Error display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Transparency notice */}
          <div className="bg-muted/50 rounded-lg p-3 text-sm">
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">ℹ️ Transparence :</span> Le contenu sera généré par l'IA comme aide à la rédaction. 
              Il reste entièrement modifiable et vous gardez le contrôle éditorial final.
            </p>
          </div>

          {/* Platform info */}
          <p className="text-xs text-muted-foreground">
            Le contenu sera adapté pour <span className="font-medium capitalize">{platform}</span>
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleGenerate} disabled={loading || !url.trim()}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyse en cours...
              </>
            ) : (
              <>
                <Link2 className="mr-2 h-4 w-4" />
                Générer
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
