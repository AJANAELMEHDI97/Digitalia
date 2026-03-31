import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  DollarSign,
  TrendingUp,
  Building2,
  Target,
  UserMinus,
  Wallet,
} from "lucide-react";

interface StrategicBarProps {
  stats: {
    revenue: { mrr: number; mrrVariation: number; collections: number };
    activeFirms: number;
    acquisition: { conversionRate: number };
    churnRate: number;
  };
  loading?: boolean;
}

interface MicroKPI {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "neutral" | "positive" | "negative";
  tooltip: string;
}

export function StrategicBar({ stats, loading }: StrategicBarProps) {
  const kpis: MicroKPI[] = [
    {
      label: "MRR actuel",
      value: `${stats.revenue.mrr.toLocaleString("fr-FR")} €`,
      icon: DollarSign,
      tone: "neutral",
      tooltip: "Revenu mensuel recurrent genere par les abonnements actifs.",
    },
    {
      label: "Variation M-1",
      value: `${stats.revenue.mrrVariation > 0 ? "+" : ""}${stats.revenue.mrrVariation}%`,
      icon: TrendingUp,
      tone:
        stats.revenue.mrrVariation > 0
          ? "positive"
          : stats.revenue.mrrVariation < 0
            ? "negative"
            : "neutral",
      tooltip: "Evolution du MRR par rapport au mois precedent.",
    },
    {
      label: "Cabinets actifs",
      value: `${stats.activeFirms}`,
      icon: Building2,
      tone: "positive",
      tooltip: "Nombre de cabinets avec activite recente.",
    },
    {
      label: "Taux conversion",
      value: `${stats.acquisition.conversionRate}%`,
      icon: Target,
      tone: stats.acquisition.conversionRate > 0 ? "neutral" : "neutral",
      tooltip: "Part des leads convertis en clients.",
    },
    {
      label: "Taux churn",
      value: `${stats.churnRate}%`,
      icon: UserMinus,
      tone: stats.churnRate > 5 ? "negative" : "neutral",
      tooltip: "Taux de perte client mensuel.",
    },
    {
      label: "Encaissements",
      value: `${stats.revenue.collections.toLocaleString("fr-FR")} €`,
      icon: Wallet,
      tone: "neutral",
      tooltip: "Paiements encaisses sur la periode.",
    },
  ];

  return (
    <TooltipProvider delayDuration={150}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
        {kpis.map((kpi) => (
          <Tooltip key={kpi.label}>
            <TooltipTrigger asChild>
              <Card className="rounded-[26px] border border-[#e8eaf4] bg-white px-5 py-5 shadow-[0_10px_30px_rgba(112,122,163,0.05)]">
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20 rounded-full" />
                    <Skeleton className="h-7 w-24 rounded-full" />
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                        kpi.tone === "positive" && "bg-[#e6faf2] text-[#0e9f75]",
                        kpi.tone === "negative" && "bg-[#fff1ef] text-[#ff5b4a]",
                        kpi.tone === "neutral" && "bg-[#f4f5fa] text-[#9ea5bf]",
                      )}
                    >
                      <kpi.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-medium text-[#9aa1b8]">{kpi.label}</p>
                      <p
                        className={cn(
                          "mt-1 text-[19px] font-bold leading-none text-[#1f2538]",
                          kpi.tone === "positive" && "text-[#0e9f75]",
                          kpi.tone === "negative" && "text-[#ff5b4a]",
                        )}
                      >
                        {kpi.value}
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[240px]">
              <p>{kpi.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
