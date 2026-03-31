import { useMemo } from "react";
import { ArrowRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminFirmEnriched } from "./types";

type Priority = "urgent" | "important" | "opportunity";

interface ActionItem {
  id: string;
  label: string;
  firmName: string;
  firmId: string;
  priority: Priority;
  action: string;
}

const priorityStyles: Record<Priority, { dot: string; text: string }> = {
  urgent: { dot: "bg-red-500", text: "text-red-600 dark:text-red-400" },
  important: { dot: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
  opportunity: { dot: "bg-blue-500", text: "text-blue-600 dark:text-blue-400" },
};

interface Props {
  firms: AdminFirmEnriched[];
  onSelectFirm: (firm: AdminFirmEnriched) => void;
}

export function FirmsActionItems({ firms, onSelectFirm }: Props) {
  const items = useMemo(() => {
    const result: ActionItem[] = [];

    firms.forEach(f => {
      // Urgent: blocked payment
      if (f.paymentStatus === "bloqué") {
        result.push({
          id: `pay-${f.id}`,
          label: `Paiement bloqué — ${f.name}`,
          firmName: f.name,
          firmId: f.id,
          priority: "urgent",
          action: "Contacter le responsable",
        });
      }

      // Urgent: high churn + blocking behavior
      if (f.churnRiskData.level === "high" && f.behaviorBadge === "bloquant") {
        result.push({
          id: `churn-block-${f.id}`,
          label: `Churn critique + bloquant — ${f.name}`,
          firmName: f.name,
          firmId: f.id,
          priority: "urgent",
          action: "Action immédiate requise",
        });
      }

      // Important: inactive + no CM
      if (f.behaviorBadge === "inactif" && !f.cm_user_id) {
        result.push({
          id: `inactive-nocm-${f.id}`,
          label: `Cabinet inactif sans CM — ${f.name}`,
          firmName: f.name,
          firmId: f.id,
          priority: "important",
          action: "Assigner un CM",
        });
      }

      // Important: high churn (not already covered above)
      if (f.churnRiskData.level === "high" && f.behaviorBadge !== "bloquant") {
        result.push({
          id: `churn-${f.id}`,
          label: `Risque churn élevé — ${f.name}`,
          firmName: f.name,
          firmId: f.id,
          priority: "important",
          action: "Planifier un point stratégique",
        });
      }

      // Opportunity: high activity on basic plan
      if (f.upsellPotential) {
        result.push({
          id: `upsell-${f.id}`,
          label: `Potentiel upsell — ${f.name}`,
          firmName: f.name,
          firmId: f.id,
          priority: "opportunity",
          action: "Proposer un upgrade",
        });
      }
    });

    const order: Record<Priority, number> = { urgent: 0, important: 1, opportunity: 2 };
    return result.sort((a, b) => order[a.priority] - order[b.priority]).slice(0, 8);
  }, [firms]);

  if (items.length === 0) return null;

  return (
    <div className="rounded-xl border border-border/60 bg-card">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border/40">
        <Zap className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">À traiter aujourd'hui</h3>
      </div>

      <div className="divide-y divide-border/30">
        {items.map(item => {
          const style = priorityStyles[item.priority];
          const firm = firms.find(f => f.id === item.firmId);

          return (
            <button
              key={item.id}
              onClick={() => firm && onSelectFirm(firm)}
              className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-muted/30 group"
            >
              <span className={cn("h-2 w-2 rounded-full shrink-0", style.dot)} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground/90 truncate">{item.label}</p>
                <p className={cn("text-xs font-medium mt-0.5", style.text)}>{item.action}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
