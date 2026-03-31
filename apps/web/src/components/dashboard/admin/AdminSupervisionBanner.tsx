import { Shield, TrendingUp, TrendingDown, Minus, Building2, Activity, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminSupervisionBannerProps {
  alertCount?: number;
  healthTrend?: "improving" | "degrading" | "stable";
  activeFirms?: number;
  activityRate?: number;
  activeAlerts?: number;
  loading?: boolean;
}

type HealthStatus = "stable" | "warning" | "critical";

const statusConfig: Record<HealthStatus, { label: string; description: string; dotClass: string; bgClass: string }> = {
  stable: {
    label: "Plateforme stable",
    description: "Aucune anomalie détectée",
    dotClass: "bg-emerald-500",
    bgClass: "bg-emerald-50/50 border-emerald-200/60 dark:bg-emerald-950/20 dark:border-emerald-800/30",
  },
  warning: {
    label: "Points d'attention",
    description: "Des éléments nécessitent votre vigilance",
    dotClass: "bg-amber-500",
    bgClass: "bg-amber-50/50 border-amber-200/60 dark:bg-amber-950/20 dark:border-amber-800/30",
  },
  critical: {
    label: "Alertes actives",
    description: "Action recommandée",
    dotClass: "bg-destructive",
    bgClass: "bg-destructive/5 border-destructive/20 dark:bg-destructive/10",
  },
};

const trendConfig = {
  improving: { label: "En amélioration", icon: TrendingDown, className: "text-emerald-600 dark:text-emerald-400" },
  stable: { label: "Stable", icon: Minus, className: "text-muted-foreground" },
  degrading: { label: "En dégradation", icon: TrendingUp, className: "text-amber-600 dark:text-amber-400" },
};

const kpis = [
  { key: "activeFirms" as const, label: "Cabinets actifs", icon: Building2 },
  { key: "activityRate" as const, label: "Taux d'activité", icon: Activity, suffix: "%" },
  { key: "activeAlerts" as const, label: "Alertes", icon: AlertTriangle },
];

export function AdminSupervisionBanner({
  alertCount = 0,
  healthTrend = "stable",
  activeFirms = 0,
  activityRate = 0,
  activeAlerts = 0,
  loading,
}: AdminSupervisionBannerProps) {
  const healthStatus: HealthStatus =
    alertCount === 0 ? "stable" : alertCount <= 2 ? "warning" : "critical";
  const status = statusConfig[healthStatus];
  const trend = trendConfig[healthTrend];
  const TrendIcon = trend.icon;
  const values = { activeFirms, activityRate, activeAlerts };

  return (
    <div className={cn("rounded-xl border p-5 transition-colors", status.bgClass)}>
      {/* Top row: supervision label + health status */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4 text-primary shrink-0" />
          <span>
            Mode <span className="font-semibold text-foreground">Administrateur</span> — supervision
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className={cn("h-2.5 w-2.5 rounded-full", status.dotClass)} />
            <span className="text-sm font-semibold">{status.label}</span>
          </div>
          <div className="flex items-center gap-1 border-l border-border pl-3">
            <TrendIcon className={cn("h-3.5 w-3.5", trend.className)} />
            <span className={cn("text-xs font-medium", trend.className)}>{trend.label}</span>
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-3 divide-x divide-border">
        {kpis.map(({ key, label, icon: Icon, suffix }) => (
          <div key={key} className="flex flex-col items-center gap-1 px-4">
            {loading ? (
              <>
                <Skeleton className="h-8 w-16 rounded" />
                <Skeleton className="h-3 w-20 rounded" />
              </>
            ) : (
              <>
                <div className="flex items-baseline gap-1">
                  <span className={cn(
                    "text-3xl font-bold tabular-nums",
                    key === "activeAlerts" && values[key] > 0 && "text-amber-600 dark:text-amber-400",
                  )}>
                    {values[key]}{suffix || ""}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon className="h-3.5 w-3.5" />
                  <span>{label}</span>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
