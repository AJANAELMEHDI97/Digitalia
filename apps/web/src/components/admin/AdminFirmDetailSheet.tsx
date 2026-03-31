import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AdminFirmEnriched, ChurnRiskLevel } from "@/hooks/useAdminFirms";
import {
  Building2, User, Activity, FileText, CheckCircle, XCircle, Clock,
  CalendarClock, CreditCard, AlertTriangle, TrendingUp, TrendingDown,
  ShieldAlert, UserX, Briefcase, Target, Eye, ArrowRight,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface AdminFirmDetailSheetProps {
  firm: AdminFirmEnriched | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const behaviorConfig = {
  collaboratif: { label: "Collaboratif", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
  exigeant: { label: "Exigeant", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
  bloquant: { label: "Bloquant", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
  inactif: { label: "Inactif", className: "bg-muted text-muted-foreground" },
};

const paymentConfig = {
  à_jour: { label: "À jour", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
  retard: { label: "En retard", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
  bloqué: { label: "Bloqué", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
};

const churnLevelConfig: Record<ChurnRiskLevel, { label: string; color: string; bgClass: string; borderClass: string }> = {
  low: { label: "Risque faible", color: "text-emerald-700 dark:text-emerald-300", bgClass: "bg-emerald-50 dark:bg-emerald-950/20", borderClass: "border-emerald-200 dark:border-emerald-800/40" },
  moderate: { label: "Risque modéré", color: "text-amber-700 dark:text-amber-300", bgClass: "bg-amber-50 dark:bg-amber-950/20", borderClass: "border-amber-200 dark:border-amber-800/40" },
  high: { label: "Risque élevé", color: "text-red-700 dark:text-red-300", bgClass: "bg-red-50 dark:bg-red-950/20", borderClass: "border-red-200 dark:border-red-800/40" },
};

function SectionTitle({ icon: Icon, title }: { icon: React.ComponentType<{ className?: string }>; title: string }) {
  return (
    <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
      <Icon className="h-4 w-4 text-primary" />
      {title}
    </h3>
  );
}

function Stat({ label, value, className }: { label: string; value: string | number; className?: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("text-sm font-semibold tabular-nums", className)}>{value}</p>
    </div>
  );
}

export function AdminFirmDetailSheet({ firm, open, onOpenChange }: AdminFirmDetailSheetProps) {
  if (!firm) return null;

  const behavior = behaviorConfig[firm.behaviorBadge];
  const payment = paymentConfig[firm.paymentStatus];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            {firm.name}
          </SheetTitle>
          <div className="flex gap-2 flex-wrap">
            <Badge className={behavior.className}>{behavior.label}</Badge>
            <Badge className={payment.className}>{payment.label}</Badge>
            {firm.upsellPotential && <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Upsell potentiel</Badge>}
            {firm.churnRisk && <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">Risque churn</Badge>}
          </div>
        </SheetHeader>

        <div className="space-y-5 mt-6">
          {/* A. Identity */}
          <section className="space-y-2">
            <SectionTitle icon={Building2} title="Identité & abonnement" />
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Barreau" value={firm.bar_association || "—"} />
              <Stat label="Ville" value={firm.city || "—"} />
              <Stat label="Pack" value={firm.subscription_plan || "Non défini"} />
              <Stat label="Depuis" value={firm.created_at ? format(new Date(firm.created_at), "MMM yyyy", { locale: fr }) : "—"} />
            </div>
          </section>

          <Separator />

          {/* B. CM */}
          <section className="space-y-2">
            <SectionTitle icon={User} title="Community Manager" />
            {firm.cm_name ? (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${firm.cm_is_online ? "bg-green-500" : "bg-muted-foreground/30"}`} />
                  <span className="text-sm font-medium">{firm.cm_name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({firm.cm_firms_count} cabinet{firm.cm_firms_count > 1 ? "s" : ""})
                  </span>
                </div>
                {firm.cm_last_activity && (
                  <p className="text-xs text-muted-foreground">
                    Dernière activité : {formatDistanceToNow(new Date(firm.cm_last_activity), { addSuffix: true, locale: fr })}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-600 text-sm">
                <UserX className="h-4 w-4" />
                Aucun CM assigné
              </div>
            )}
          </section>

          <Separator />

          {/* C. Behavior */}
          <section className="space-y-2">
            <SectionTitle icon={Activity} title="Profil comportemental" />
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Taux de validation" value={`${firm.validationRate}%`} className={firm.validationRate >= 70 ? "text-emerald-600" : "text-amber-600"} />
              <Stat label="Taux de refus" value={`${firm.refusalRate}%`} className={firm.refusalRate > 30 ? "text-red-600" : ""} />
              <Stat label="Délai moyen" value={`${firm.avgValidationHours}h`} className={firm.avgValidationHours > 48 ? "text-amber-600" : ""} />
              <Stat label="En attente" value={firm.pendingCount} className={firm.pendingCount > 3 ? "text-amber-600" : ""} />
            </div>
          </section>

          <Separator />

          {/* D. Editorial */}
          <section className="space-y-2">
            <SectionTitle icon={FileText} title="Activité éditoriale" />
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Total" value={firm.totalPublications} />
              <Stat label="Validées" value={firm.validatedCount} />
              <Stat label="Refusées" value={firm.refusedCount} />
            </div>
            <p className="text-xs text-muted-foreground">
              Dernière publication : {firm.lastPublicationDate
                ? formatDistanceToNow(new Date(firm.lastPublicationDate), { addSuffix: true, locale: fr })
                : "Jamais"}
            </p>
          </section>

          <Separator />

          {/* E. Appointments */}
          <section className="space-y-2">
            <SectionTitle icon={CalendarClock} title="Relation & engagement" />
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Dernier RDV" value={firm.lastAppointment
                ? format(new Date(firm.lastAppointment), "dd/MM/yyyy", { locale: fr })
                : "Aucun"} />
              <Stat label="Prochain RDV" value={firm.nextAppointment
                ? format(new Date(firm.nextAppointment), "dd/MM/yyyy", { locale: fr })
                : "Aucun"} />
            </div>
          </section>

          <Separator />

          {/* F. Financial */}
          <section className="space-y-2">
            <SectionTitle icon={CreditCard} title="Facturation & business" />
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Statut paiement" value={payment.label} />
              <Stat label="Dernière facture" value={firm.lastInvoiceDate
                ? format(new Date(firm.lastInvoiceDate), "dd/MM/yyyy", { locale: fr })
                : "—"} />
            </div>
          </section>

          {/* Churn Risk Section */}
          <Separator />
          <section className="space-y-3">
            <SectionTitle icon={Target} title="Prévision de churn" />
            {(() => {
              const c = churnLevelConfig[firm.churnRiskData.level];
              return (
                <div className={cn("rounded-lg border p-3 space-y-3", c.bgClass, c.borderClass)}>
                  <div className="flex items-center justify-between">
                    <span className={cn("text-sm font-semibold", c.color)}>{c.label}</span>
                    <span className={cn("text-xs font-medium tabular-nums", c.color)}>
                      Score : {firm.churnRiskData.score}/100
                    </span>
                  </div>

                  {/* Risk progress bar */}
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", {
                        "bg-emerald-500": firm.churnRiskData.level === "low",
                        "bg-amber-500": firm.churnRiskData.level === "moderate",
                        "bg-red-500": firm.churnRiskData.level === "high",
                      })}
                      style={{ width: `${firm.churnRiskData.score}%` }}
                    />
                  </div>
                </div>
              );
            })()}

            {firm.churnRiskData.factors.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                  Facteurs de risque identifiés
                </p>
                <ul className="space-y-1">
                  {firm.churnRiskData.factors.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <span className={cn("mt-0.5 h-1.5 w-1.5 rounded-full shrink-0", {
                        "bg-red-500": f.weight === 3,
                        "bg-amber-500": f.weight === 2,
                        "bg-blue-500": f.weight === 1,
                      })} />
                      <span className="text-muted-foreground">{f.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {firm.churnRiskData.suggestedActions.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-foreground">Actions suggérées</p>
                <ul className="space-y-1">
                  {firm.churnRiskData.suggestedActions.map((a, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-primary">
                      <ArrowRight className="h-3 w-3 shrink-0" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* G. Alerts */}
          {firm.alerts.length > 0 && (
            <>
              <Separator />
              <section className="space-y-2">
                <SectionTitle icon={ShieldAlert} title="Alertes & signaux faibles" />
                <ul className="space-y-1.5">
                  {firm.alerts.map((alert, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      {alert}
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
