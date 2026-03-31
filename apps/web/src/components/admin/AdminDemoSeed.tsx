import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Database, Loader2, AlertCircle, Trash2, Sparkles,
  Building2, Users, FileText, Receipt, Target, ClipboardList, Bug, RefreshCw,
} from "lucide-react";
import { seedAdminDemoData, clearAdminDemoData, checkDemoState } from "@/utils/adminDemoSeed";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SeedStats {
  firms: number;
  cms: number;
  publications: number;
  invoices: number;
  leads: number;
  mrr: number;
  auditEntries: number;
}

export function AdminDemoSeed({ onComplete }: { onComplete?: () => void }) {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isSeeded, setIsSeeded] = useState(false);
  const [lastResult, setLastResult] = useState<{ success: boolean; stats?: SeedStats; seed_id?: string; seeded_at?: string; error?: string } | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  // Check seed state on mount
  useEffect(() => {
    checkState();
  }, []);

  const checkState = async () => {
    setIsChecking(true);
    try {
      const result = await checkDemoState();
      setIsSeeded(result.seeded);
    } catch {
      // ignore
    } finally {
      setIsChecking(false);
    }
  };

  const handleSeed = async () => {
    if (isSeeded) {
      toast.error("Données démo déjà présentes", { description: "Supprimez-les d'abord avant de régénérer." });
      return;
    }
    setIsSeeding(true);
    setLastResult(null);
    try {
      const result = await seedAdminDemoData();
      if (result.success) {
        toast.success(result.message);
        setLastResult({ success: true, stats: result.stats, seed_id: result.seed_id, seeded_at: result.seeded_at });
        setIsSeeded(true);
        onComplete?.();
      } else {
        toast.error("Erreur", { description: result.message });
        setLastResult({ success: false, error: result.message });
      }
    } catch (e: any) {
      toast.error("Erreur inattendue");
      setLastResult({ success: false, error: e.message });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClear = async () => {
    setIsClearing(true);
    try {
      const result = await clearAdminDemoData();
      if (result.success) {
        toast.success(result.message);
        setLastResult(null);
        setIsSeeded(false);
        onComplete?.();
      } else {
        toast.error("Erreur", { description: result.message });
      }
    } catch {
      toast.error("Erreur inattendue");
    } finally {
      setIsClearing(false);
    }
  };

  const s = lastResult?.stats;

  return (
    <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Données de démonstration Admin</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {isChecking ? (
              <Badge variant="secondary"><Loader2 className="h-3 w-3 animate-spin mr-1" />Vérification…</Badge>
            ) : isSeeded ? (
              <Badge variant="default" className="bg-green-600">Actif</Badge>
            ) : (
              <Badge variant="secondary">Inactif</Badge>
            )}
            <Badge variant="secondary">Super Admin</Badge>
          </div>
        </div>
        <CardDescription>
          Injectez des données fictives réalistes pour tester l'ensemble du cockpit Super Administrateur.
          {isSeeded && " Les données démo sont actuellement actives."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {s && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <StatPill icon={Building2} label="Cabinets" value={s.firms} />
              <StatPill icon={Users} label="CMs" value={s.cms} />
              <StatPill icon={FileText} label="Publications" value={s.publications} />
              <StatPill icon={Receipt} label="Factures" value={s.invoices} />
              <StatPill icon={Target} label="Leads" value={s.leads} />
              <StatPill icon={ClipboardList} label="Audit" value={s.auditEntries} />
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleSeed} disabled={isSeeding || isClearing || isChecking || isSeeded} className="gap-2">
              {isSeeding ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Génération en cours…</>
              ) : isSeeded ? (
                <><Database className="h-4 w-4" />Déjà généré</>
              ) : (
                <><Database className="h-4 w-4" />Générer les données démo</>
              )}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={isSeeding || isClearing || !isSeeded} className="gap-2 text-destructive hover:text-destructive">
                  {isClearing ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />Suppression…</>
                  ) : (
                    <><Trash2 className="h-4 w-4" />Supprimer les données démo</>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer les données de démonstration ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action supprimera tous les cabinets, publications, factures et leads de démonstration.
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

            <Button variant="ghost" size="icon" onClick={() => setShowDebug(!showDebug)} title="Debug">
              <Bug className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="icon" onClick={checkState} disabled={isChecking} title="Rafraîchir l'état">
              <RefreshCw className={`h-4 w-4 ${isChecking ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {/* Debug panel */}
          {showDebug && (
            <div className="p-3 bg-muted/50 rounded-lg text-xs font-mono space-y-1 border">
              <p className="font-semibold text-sm mb-2">🔧 Debug Seed</p>
              <p>État : {isSeeded ? "✅ Seedé" : "❌ Vide"}</p>
              {lastResult?.seed_id && <p>seed_id : {lastResult.seed_id}</p>}
              {lastResult?.seeded_at && <p>Dernier seed : {new Date(lastResult.seeded_at).toLocaleString("fr-FR")}</p>}
              {lastResult?.error && <p className="text-destructive">Erreur : {lastResult.error}</p>}
              {s && (
                <div className="mt-1">
                  <p>Tables remplies :</p>
                  <p className="pl-2">• law_firms: {s.firms}</p>
                  <p className="pl-2">• profiles (CMs): {s.cms}</p>
                  <p className="pl-2">• publications: {s.publications}</p>
                  <p className="pl-2">• invoices: {s.invoices}</p>
                  <p className="pl-2">• demo_requests: {s.leads}</p>
                  <p className="pl-2">• audit (trail + cm_logs): {s.auditEntries}</p>
                  <p className="pl-2">• MRR calculé: {s.mrr} €</p>
                </div>
              )}
              <p className="mt-1 text-muted-foreground">Tag données : [DEMO] / @demo-socialpulse.fr / __admin_demo__</p>
            </div>
          )}

          <div className="text-xs text-muted-foreground flex items-start gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>
              Crée 40 cabinets, 6 CMs, ~120 publications, 6 mois de factures, 32 leads et 50 entrées d'audit.
              Inclut 5 retards paiement, 3 risques churn, 6 comptes test et 1 CM surchargé.
              Données taggées [DEMO] pour suppression sûre.
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatPill({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 p-2.5 bg-background border rounded-lg">
      <Icon className="h-4 w-4 text-primary" />
      <div>
        <div className="text-sm font-bold">{value}</div>
        <div className="text-[10px] text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}
