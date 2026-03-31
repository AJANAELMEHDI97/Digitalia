import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MessageSquare, AlertTriangle, Clock, TrendingDown, ShieldAlert } from "lucide-react";
import type { CoordinationStats } from "@/hooks/useAdminCoordination";

interface Props {
  stats: CoordinationStats;
}

const kpis = [
  {
    key: "activeConversations" as const,
    label: "Conversations actives",
    icon: MessageSquare,
    color: "text-primary",
    bgColor: "bg-primary/10",
    tooltip: "Nombre de discussions non résolues en cours. Permet de mesurer la charge de coordination globale.",
  },
  {
    key: "urgentDiscussions" as const,
    label: "Discussions urgentes",
    icon: AlertTriangle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    tooltip: "Discussions marquées urgentes ou avec statut urgent. À traiter en priorité.",
  },
  {
    key: "avgResponseTime" as const,
    label: "Temps moy. réponse",
    icon: Clock,
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
    tooltip: "Temps moyen entre la réception d'un message et la réponse, en heures. Au-delà de 4h, la réactivité est insuffisante.",
    suffix: "h",
  },
  {
    key: "churnDiscussions" as const,
    label: "Liées au churn",
    icon: TrendingDown,
    color: "text-orange-600",
    bgColor: "bg-orange-500/10",
    tooltip: "Discussions liées à un risque de churn (tag #churn ou contexte churn). Nécessitent une attention particulière.",
  },
  {
    key: "atRiskDiscussions" as const,
    label: "Cabinets à risque",
    icon: ShieldAlert,
    color: "text-red-600",
    bgColor: "bg-red-500/10",
    tooltip: "Discussions liées à un cabinet à risque (incident, churn). Indicateur de vigilance stratégique.",
  },
];

export function CoordinationKPIBar({ stats }: Props) {
  return (
    <TooltipProvider delayDuration={150}>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          const value = stats[kpi.key];
          return (
            <Tooltip key={kpi.key}>
              <TooltipTrigger asChild>
                <Card className="p-3 cursor-help hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                      <Icon className={`h-4 w-4 ${kpi.color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-lg font-bold leading-none">
                        {value}
                        {"suffix" in kpi ? kpi.suffix : ""}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                        {kpi.label}
                      </p>
                    </div>
                  </div>
                </Card>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs text-xs">
                {kpi.tooltip}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
