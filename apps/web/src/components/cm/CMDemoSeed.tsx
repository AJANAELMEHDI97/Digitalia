import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Trash2,
  Sparkles
} from "lucide-react";
import { seedCMDemoData, clearCMDemoData } from "@/utils/cmDemoSeed";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CMDemoSeedProps {
  onComplete?: () => void;
}

export function CMDemoSeed({ onComplete }: CMDemoSeedProps) {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [lastResult, setLastResult] = useState<{ success: boolean; stats?: any } | null>(null);

  const handleSeed = async () => {
    setIsSeeding(true);
    setLastResult(null);
    
    try {
      const result = await seedCMDemoData();
      
      if (result.success) {
        toast.success(result.message, {
          description: `${result.stats?.firms} cabinets et ${result.stats?.publications} publications créés`
        });
        setLastResult({ success: true, stats: result.stats });
        onComplete?.();
      } else {
        toast.error("Erreur", { description: result.message });
        setLastResult({ success: false });
      }
    } catch (error) {
      toast.error("Erreur inattendue");
      setLastResult({ success: false });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClear = async () => {
    setIsClearing(true);
    
    try {
      const result = await clearCMDemoData();
      
      if (result.success) {
        toast.success(result.message);
        setLastResult(null);
        onComplete?.();
      } else {
        toast.error("Erreur", { description: result.message });
      }
    } catch (error) {
      toast.error("Erreur inattendue");
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Données de démonstration</CardTitle>
          </div>
          <Badge variant="secondary">Demo</Badge>
        </div>
        <CardDescription>
          Générez des cabinets et publications fictifs pour tester l'interface Community Manager
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {lastResult?.success && lastResult.stats && (
            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-sm text-green-700">
                {lastResult.stats.firms} cabinets et {lastResult.stats.publications} publications créés
              </span>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={handleSeed} 
              disabled={isSeeding || isClearing}
              className="gap-2"
            >
              {isSeeding ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4" />
                  Générer les données démo
                </>
              )}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  disabled={isSeeding || isClearing}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  {isClearing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Suppression...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Supprimer les données démo
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer les données de démonstration ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action supprimera tous les cabinets et publications de démonstration. 
                    Les données réelles ne seront pas affectées.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClear} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="text-xs text-muted-foreground flex items-start gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>
              Crée 25 cabinets fictifs avec 5-12 publications chacun (brouillons, programmées, publiées). 
              Ces données sont destinées aux tests et démonstrations uniquement.
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
