import { useMemo } from "react";
import { AlertTriangle, TrendingDown, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminFirmEnriched, QuickFilter } from "./types";

interface Props {
  firms: AdminFirmEnriched[];
  onFilter: (filter: QuickFilter) => void;
  activeFilter: QuickFilter;
}

export function FirmsSummaryCards({ firms, onFilter, activeFilter }: Props) {
  const stats = useMemo(() => {
    const atRisk = firms.filter(f => f.globalStatus === "à_risque").length;
    const highChurn = firms.filter(f => f.churnRiskData.level === "high").length;
    const paymentIssues = firms.filter(f => f.paymentStatus !== "à_jour").length;

    return [
      {
        key: "at_risk" as QuickFilter,
        label: "À risque",
        value: atRisk,
        total: firms.length,
        icon: AlertTriangle,
        accent: atRisk > 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground",
        iconAccent: atRisk > 0 ? "text-red-500" : "text-muted-foreground/50",
      },
      {
        key: "churn_risk" as QuickFilter,
        label: "Churn élevé",
        value: highChurn,
        total: firms.length,
        icon: TrendingDown,
        accent: highChurn > 0 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground",
        iconAccent: highChurn > 0 ? "text-amber-500" : "text-muted-foreground/50",
      },
      {
        key: "payment_issue" as QuickFilter,
        label: "Paiement",
        value: paymentIssues,
        total: firms.length,
        icon: CreditCard,
        accent: paymentIssues > 0 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground",
        iconAccent: paymentIssues > 0 ? "text-amber-500" : "text-muted-foreground/50",
      },
    ];
  }, [firms]);

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map(s => {
        const isActive = activeFilter === s.key;
        return (
          <button
            key={s.key}
            onClick={() => onFilter(isActive ? "all" : s.key)}
            className={cn(
              "flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all",
              isActive
                ? "ring-2 ring-primary/30 border-primary/40 bg-primary/5"
                : "border-border/50 hover:bg-muted/30"
            )}
          >
            <s.icon className={cn("h-4 w-4 shrink-0", s.iconAccent)} />
            <div className="flex items-baseline gap-1.5">
              <span className={cn("text-xl font-bold tabular-nums leading-none", s.accent)}>
                {s.value}
              </span>
              <span className="text-xs text-muted-foreground">/ {s.total}</span>
            </div>
            <span className="text-xs text-muted-foreground font-medium ml-auto hidden sm:block">
              {s.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
