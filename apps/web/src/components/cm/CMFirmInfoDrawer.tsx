import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Building2, MapPin, Scale, Calendar, Package, CreditCard,
  User, UserPlus, Globe, BarChart3, Clock, HeartPulse,
  AlertTriangle, CalendarDays, LineChart, Settings,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { LawFirm } from "@/contexts/LawFirmContext";
import { FirmStats } from "@/hooks/useCMWorkspace";

interface CMFirmInfoDrawerProps {
  firm: LawFirm | null;
  firmStats?: FirmStats;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onNavigate: (path: string) => void;
}

const planAmounts: Record<string, string> = {
  starter: "149 €/mois",
  pro: "299 €/mois",
  premium: "499 €/mois",
};

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-1.5">
      <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate">{value || "Non renseigné"}</p>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">{children}</h4>;
}

export function CMFirmInfoDrawer({ firm, firmStats, open, onOpenChange, onNavigate }: CMFirmInfoDrawerProps) {
  if (!firm) return null;

  const createdAt = (firm as any).created_at as string | undefined;
  const clientSince = createdAt
    ? format(parseISO(createdAt), "MMMM yyyy", { locale: fr })
    : "Inconnu";

  const plan = firm.subscription_plan || "Non défini";
  const amount = planAmounts[plan.toLowerCase()] || "—";

  // Health
  const status = firmStats?.status || "ok";
  const healthConfig: Record<string, { label: string; color: string }> = {
    blocked: { label: "Critique", color: "bg-destructive text-destructive-foreground" },
    attention: { label: "Attention", color: "bg-amber-100 text-amber-800" },
    ok: { label: "Stable", color: "bg-emerald-50 text-emerald-700" },
  };
  const health = healthConfig[status] || healthConfig.ok;

  const alertCauses: string[] = [];
  if (firmStats) {
    if (firmStats.late > 0) alertCauses.push(`${firmStats.late} publication(s) en retard`);
    if (firmStats.refused > 0) alertCauses.push(`${firmStats.refused} refus client`);
    if (firmStats.pending > 0) alertCauses.push(`${firmStats.pending} en attente de validation`);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[380px] sm:max-w-[420px] overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            {firm.name}
          </SheetTitle>
          <SheetDescription>Fiche récapitulative du cabinet</SheetDescription>
        </SheetHeader>

        <div className="space-y-5">
          {/* Section 1 – Général */}
          <div>
            <SectionTitle>Informations générales</SectionTitle>
            <InfoRow icon={Building2} label="Nom" value={firm.name} />
            <InfoRow icon={Scale} label="Barreau" value={firm.bar_association} />
            <InfoRow icon={MapPin} label="Ville" value={firm.city} />
          </div>

          <Separator />

          {/* Section 2 – Business */}
          <div>
            <SectionTitle>Informations business</SectionTitle>
            <InfoRow icon={Calendar} label="Client depuis" value={clientSince} />
            <InfoRow icon={Package} label="Pack souscrit" value={plan} />
            <InfoRow icon={CreditCard} label="Montant mensuel" value={amount} />
          </div>

          <Separator />

          {/* Section 3 – Gestion */}
          <div>
            <SectionTitle>Gestion du compte</SectionTitle>
            <InfoRow icon={User} label="CM assigné" value="Vous" />
            <InfoRow icon={UserPlus} label="Commercial recruteur" value="Non renseigné" />
            <InfoRow icon={Globe} label="Source d'acquisition" value="Non renseigné" />
          </div>

          <Separator />

          {/* Section 4 – Activité */}
          <div>
            <SectionTitle>Activité</SectionTitle>
            <InfoRow icon={BarChart3} label="Publications ce mois" value={firmStats ? String(firmStats.published) : "—"} />
            <InfoRow icon={Clock} label="Dernière publication" value="Non disponible" />
            <InfoRow icon={CalendarDays} label="Dernier RDV client" value="Non disponible" />
          </div>

          <Separator />

          {/* Section 5 – Santé */}
          <div>
            <SectionTitle>Santé du compte</SectionTitle>
            <div className="flex items-center gap-2 mb-2">
              <HeartPulse className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Score santé</span>
              <Badge className={health.color}>{health.label}</Badge>
            </div>
            {alertCauses.length > 0 ? (
              <ul className="space-y-1 ml-7">
                {alertCauses.map((c) => (
                  <li key={c} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground ml-7">Aucune alerte</p>
            )}
          </div>

          <Separator />

          {/* Section 6 – Actions */}
          <div>
            <SectionTitle>Actions rapides</SectionTitle>
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" className="justify-start gap-2" onClick={() => { onNavigate("/calendar"); onOpenChange(false); }}>
                <CalendarDays className="h-4 w-4" /> Voir calendrier éditorial
              </Button>
              <Button variant="outline" size="sm" className="justify-start gap-2" onClick={() => { onNavigate("/metrics"); onOpenChange(false); }}>
                <LineChart className="h-4 w-4" /> Voir performances
              </Button>
              <Button variant="outline" size="sm" className="justify-start gap-2" onClick={() => { onNavigate("/cm/firm-settings"); onOpenChange(false); }}>
                <Settings className="h-4 w-4" /> Ouvrir fiche complète
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
