import { Shield, TrendingUp, TrendingDown, Minus, Building2, Activity, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface AdminHeroBannerProps {
  alertCount: number;
  healthTrend: "improving" | "degrading" | "stable";
  activeFirms: number;
  activityRate: number;
  activeAlerts: number;
  loading?: boolean;
}

type HealthStatus = "stable" | "warning" | "critical";

const statusConfig: Record<HealthStatus, { label: string; dotClass: string; bgClass: string }> = {
  stable: {
    label: "Plateforme stable",
    dotClass: "bg-emerald-500 shadow-emerald-500/50",
    bgClass: "from-background via-emerald-50/40 to-background dark:via-emerald-950/20",
  },
  warning: {
    label: "Points d'attention",
    dotClass: "bg-amber-500 shadow-amber-500/50",
    bgClass: "from-background via-amber-50/40 to-background dark:via-amber-950/20",
  },
  critical: {
    label: "Alertes actives",
    dotClass: "bg-red-500 shadow-red-500/50",
    bgClass: "from-background via-red-50/30 to-background dark:via-red-950/20",
  },
};

const trendConfig = {
  improving: { label: "En amélioration", icon: TrendingUp, className: "text-emerald-600 dark:text-emerald-400" },
  stable: { label: "Stable", icon: Minus, className: "text-muted-foreground" },
  degrading: { label: "En dégradation", icon: TrendingDown, className: "text-amber-600 dark:text-amber-400" },
};

const megaKPIs = [
  { key: "activeFirms" as const, label: "Cabinets actifs", icon: Building2, color: "text-emerald-600 dark:text-emerald-400" },
  { key: "activityRate" as const, label: "Taux d'activité", icon: Activity, suffix: "%", color: "text-blue-600 dark:text-blue-400" },
  { key: "activeAlerts" as const, label: "Alertes", icon: AlertTriangle, color: "text-amber-600 dark:text-amber-400" },
];

export function AdminHeroBanner({ alertCount, healthTrend, activeFirms, activityRate, activeAlerts, loading }: AdminHeroBannerProps) {
  const { user } = useAuth();
  const userName = user?.user_metadata?.full_name?.split(" ")[0] || "";
  const today = format(new Date(), "EEEE d MMMM yyyy", { locale: fr });

  const healthStatus: HealthStatus = alertCount === 0 ? "stable" : alertCount <= 2 ? "warning" : "critical";
  const status = statusConfig[healthStatus];
  const trend = trendConfig[healthTrend];
  const TrendIcon = trend.icon;
  const values = { activeFirms, activityRate, activeAlerts };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn("rounded-2xl border bg-gradient-to-r p-6 md:p-8 relative overflow-hidden", status.bgClass)}
    >
      {/* Decorative circle */}
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary/5 blur-2xl pointer-events-none" />

      {/* Top: greeting + health */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 relative z-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            {userName ? `Bonjour ${userName}` : "Tableau de bord"}
          </h1>
          <p className="text-sm text-muted-foreground capitalize mt-0.5">{today}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className={cn("h-2.5 w-2.5 rounded-full shadow-lg animate-pulse", status.dotClass)} />
            <span className="text-sm font-semibold text-foreground">{status.label}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 border-l border-border pl-4">
            <TrendIcon className={cn("h-4 w-4", trend.className)} />
            <span className={cn("text-xs font-medium", trend.className)}>{trend.label}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground border-l border-border pl-4">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium">Admin</span>
          </div>
        </div>
      </div>

      {/* Mega KPIs */}
      <div className="grid grid-cols-3 gap-4 md:gap-8 relative z-10">
        {megaKPIs.map(({ key, label, icon: Icon, suffix, color }, index) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.08, duration: 0.3 }}
            className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl bg-background/60 backdrop-blur-sm border border-border/50"
          >
            {loading ? (
              <>
                <Skeleton className="h-9 w-20 rounded" />
                <Skeleton className="h-3.5 w-24 rounded" />
              </>
            ) : (
              <>
                <span className={cn(
                  "text-3xl md:text-4xl font-extrabold tabular-nums leading-none tracking-tight",
                  key === "activeAlerts" && values[key] > 0 ? "text-amber-600 dark:text-amber-400" : "text-foreground",
                )}>
                  {values[key]}{suffix || ""}
                </span>
                <div className={cn("flex items-center gap-1.5 text-xs font-medium", color)}>
                  <Icon className="h-3.5 w-3.5" />
                  <span>{label}</span>
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
