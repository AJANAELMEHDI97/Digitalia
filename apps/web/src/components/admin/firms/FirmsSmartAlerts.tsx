import { useMemo, useState } from "react";
import { AlertTriangle, TrendingDown, UserX, CreditCard, Clock, ChevronDown, ChevronUp, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { AdminFirmEnriched, QuickFilter } from "./types";

type Severity = "critical" | "warning" | "info";

interface SmartAlert {
  id: string;
  message: string;
  severity: Severity;
  firmName: string;
  firmId: string;
  filterKey: QuickFilter;
  icon: React.ElementType;
}

const severityStyles: Record<Severity, { badge: string; border: string; icon: string }> = {
  critical: {
    badge: "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400",
    border: "border-l-red-400 dark:border-l-red-500",
    icon: "text-red-500",
  },
  warning: {
    badge: "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400",
    border: "border-l-amber-400 dark:border-l-amber-500",
    icon: "text-amber-500",
  },
  info: {
    badge: "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400",
    border: "border-l-blue-400 dark:border-l-blue-500",
    icon: "text-blue-500",
  },
};

const severityLabels: Record<Severity, string> = {
  critical: "Critique",
  warning: "Modéré",
  info: "Info",
};

interface Props {
  firms: AdminFirmEnriched[];
  onFilter: (filter: QuickFilter) => void;
  onSelectFirm: (firm: AdminFirmEnriched) => void;
}

export function FirmsSmartAlerts({ firms, onFilter, onSelectFirm }: Props) {
  const [expanded, setExpanded] = useState(false);

  const alerts = useMemo(() => {
    const result: SmartAlert[] = [];

    firms.forEach(f => {
      if (f.refusalRate > 50 && f.totalPublications >= 3) {
        result.push({
          id: `refusal-${f.id}`,
          message: `${f.name} — Taux de refus élevé (${f.refusalRate}%)`,
          severity: "critical",
          firmName: f.name,
          firmId: f.id,
          filterKey: "blocking",
          icon: AlertTriangle,
        });
      }

      if (f.churnRiskData.level === "high") {
        result.push({
          id: `churn-${f.id}`,
          message: `${f.name} — Risque churn élevé (score ${f.churnRiskData.score}/100)`,
          severity: "critical",
          firmName: f.name,
          firmId: f.id,
          filterKey: "churn_risk",
          icon: TrendingDown,
        });
      }

      if (f.behaviorBadge === "inactif") {
        result.push({
          id: `inactive-${f.id}`,
          message: `${f.name} — Aucune activité depuis 30 jours`,
          severity: "warning",
          firmName: f.name,
          firmId: f.id,
          filterKey: "inactive",
          icon: Clock,
        });
      }

      if (!f.cm_user_id && f.totalPublications > 0) {
        result.push({
          id: `nocm-${f.id}`,
          message: `${f.name} — Aucun CM assigné`,
          severity: "warning",
          firmName: f.name,
          firmId: f.id,
          filterKey: "no_cm",
          icon: UserX,
        });
      }

      if (f.paymentStatus === "bloqué") {
        result.push({
          id: `payment-${f.id}`,
          message: `${f.name} — Paiement bloqué`,
          severity: "critical",
          firmName: f.name,
          firmId: f.id,
          filterKey: "payment_issue",
          icon: CreditCard,
        });
      } else if (f.paymentStatus === "retard") {
        result.push({
          id: `payment-${f.id}`,
          message: `${f.name} — Retard de paiement`,
          severity: "warning",
          firmName: f.name,
          firmId: f.id,
          filterKey: "payment_issue",
          icon: CreditCard,
        });
      }
    });

    return result.sort((a, b) => {
      const order: Record<Severity, number> = { critical: 0, warning: 1, info: 2 };
      return order[a.severity] - order[b.severity];
    });
  }, [firms]);

  if (alerts.length === 0) return null;

  const visible = expanded ? alerts : alerts.slice(0, 5);
  const hasMore = alerts.length > 5;

  return (
    <div className="rounded-xl border border-border/60 bg-card">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/40">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-semibold text-foreground">Alertes intelligentes</h3>
          <Badge className="bg-muted text-muted-foreground text-[10px] px-1.5 py-0" variant="secondary">
            {alerts.length}
          </Badge>
        </div>
      </div>

      <div className="divide-y divide-border/30">
        {visible.map(alert => {
          const style = severityStyles[alert.severity];
          const firm = firms.find(f => f.id === alert.firmId);

          return (
            <div
              key={alert.id}
              className={cn(
                "flex items-center gap-3 px-5 py-3 border-l-[3px] transition-colors hover:bg-muted/30",
                style.border
              )}
            >
              <alert.icon className={cn("h-4 w-4 shrink-0", style.icon)} />
              <p className="flex-1 text-sm text-foreground/90">{alert.message}</p>
              <Badge className={cn("text-[10px] shrink-0", style.badge)} variant="secondary">
                {severityLabels[alert.severity]}
              </Badge>
              <button
                onClick={() => firm && onSelectFirm(firm)}
                className="shrink-0 text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
              >
                <Eye className="h-3.5 w-3.5" />
                Voir
              </button>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-center gap-1 py-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors border-t border-border/30"
        >
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          {expanded ? "Réduire" : `Voir toutes les alertes (${alerts.length})`}
        </button>
      )}
    </div>
  );
}
