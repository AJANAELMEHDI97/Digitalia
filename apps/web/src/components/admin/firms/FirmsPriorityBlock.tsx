import { useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { AdminFirmEnriched, QuickFilter } from "./types";

type Priority = "urgent" | "warning" | "opportunity";

interface PriorityItem {
  id: string;
  message: string;
  priority: Priority;
  action: string;
  firmId: string;
}

const priorityStyles: Record<Priority, { dot: string; text: string; label: string }> = {
  urgent: { dot: "bg-red-500", text: "text-red-600 dark:text-red-400", label: "Urgent" },
  warning: { dot: "bg-amber-500", text: "text-amber-600 dark:text-amber-400", label: "Attention" },
  opportunity: { dot: "bg-blue-500", text: "text-blue-600 dark:text-blue-400", label: "Opportunité" },
};

interface Props {
  firms: AdminFirmEnriched[];
  onSelectFirm: (firm: AdminFirmEnriched) => void;
  onFilter: (filter: QuickFilter) => void;
}

export function FirmsPriorityBlock({ firms, onSelectFirm, onFilter }: Props) {
  const [expanded, setExpanded] = useState(false);

  const items = useMemo(() => {
    const result: PriorityItem[] = [];

    firms.forEach(f => {
      if (f.paymentStatus === "bloqué") {
        result.push({ id: `pay-${f.id}`, message: `${f.name} — Paiement bloqué`, priority: "urgent", action: "Contacter", firmId: f.id });
      }
      if (f.churnRiskData.level === "high") {
        result.push({ id: `churn-${f.id}`, message: `${f.name} — Risque churn élevé`, priority: "urgent", action: "Point stratégique", firmId: f.id });
      }
      if (f.behaviorBadge === "inactif" && !f.cm_user_id) {
        result.push({ id: `nocm-${f.id}`, message: `${f.name} — Inactif sans CM`, priority: "warning", action: "Assigner CM", firmId: f.id });
      }
      if (f.refusalRate > 50 && f.totalPublications >= 3) {
        result.push({ id: `refusal-${f.id}`, message: `${f.name} — Taux de refus ${f.refusalRate}%`, priority: "warning", action: "Analyser", firmId: f.id });
      }
      if (f.upsellPotential && f.paymentStatus === "à_jour" && f.churnRiskData.level === "low") {
        result.push({ id: `upsell-${f.id}`, message: `${f.name} — Potentiel upgrade`, priority: "opportunity", action: "Proposer", firmId: f.id });
      }
    });

    const order: Record<Priority, number> = { urgent: 0, warning: 1, opportunity: 2 };
    return result.sort((a, b) => order[a.priority] - order[b.priority]);
  }, [firms]);

  if (items.length === 0) return null;

  const visible = expanded ? items : items.slice(0, 4);
  const urgentCount = items.filter(i => i.priority === "urgent").length;

  return (
    <div className="rounded-lg border border-border/50 bg-card">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-muted/20 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-primary" />
          <span className="text-sm font-medium text-foreground">Priorités</span>
          {urgentCount > 0 && (
            <Badge className="bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 text-[10px] px-1.5 py-0" variant="secondary">
              {urgentCount} urgent{urgentCount > 1 ? "s" : ""}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">{items.length} action{items.length > 1 ? "s" : ""}</span>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {(expanded || items.length <= 4) && (
        <div className="divide-y divide-border/30 border-t border-border/30">
          {visible.map(item => {
            const style = priorityStyles[item.priority];
            const firm = firms.find(f => f.id === item.firmId);

            return (
              <button
                key={item.id}
                onClick={() => firm && onSelectFirm(firm)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted/20 group"
              >
                <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", style.dot)} />
                <span className="flex-1 text-sm text-foreground/80 truncate">{item.message}</span>
                <span className={cn("text-[11px] font-medium shrink-0", style.text)}>{item.action}</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-primary transition-colors shrink-0" />
              </button>
            );
          })}
        </div>
      )}

      {!expanded && items.length > 4 && (
        <button
          onClick={() => setExpanded(true)}
          className="flex w-full items-center justify-center gap-1 py-2 text-[11px] text-muted-foreground hover:text-foreground transition-colors border-t border-border/30"
        >
          <ChevronDown className="h-3 w-3" />
          Voir les {items.length - 4} autres
        </button>
      )}
    </div>
  );
}
