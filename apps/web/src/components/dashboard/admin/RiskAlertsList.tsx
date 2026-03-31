import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Clock3,
  XCircle,
  TrendingDown,
  UserMinus,
  ShieldAlert,
  AlertOctagon,
  FlaskConical,
  Info,
} from "lucide-react";

interface Alert {
  type: string;
  label: string;
  count: number;
  severity: "critical" | "moderate" | "info";
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  blocked: Clock3,
  sla_breach: AlertTriangle,
  repeated_refusal: XCircle,
  payment_delay: AlertOctagon,
  declining_activity: TrendingDown,
  cm_inactive: UserMinus,
  high_churn_risk: ShieldAlert,
  test_expiring: FlaskConical,
  cm_overloaded: AlertTriangle,
};

const ALERT_STYLES = {
  critical: {
    row: "border-[#f6c8c2] bg-[#fff5f4]",
    dot: "bg-[#ff5448]",
    icon: "text-[#a0a8c0]",
    badge: "bg-[#fde9e7] text-[#ff5448]",
  },
  moderate: {
    row: "border-[#f4db85] bg-[#fffdf4]",
    dot: "bg-[#f5a110]",
    icon: "text-[#a0a8c0]",
    badge: "bg-[#5442d3] text-white",
  },
  info: {
    row: "border-[#e8eaf4] bg-[#f7f8fd]",
    dot: "bg-[#97a0bc]",
    icon: "text-[#a0a8c0]",
    badge: "bg-[#eef1fb] text-[#7b86a3]",
  },
};

export function RiskAlertsList({ alerts, loading }: { alerts: Alert[]; loading?: boolean }) {
  return (
    <Card className="rounded-[30px] border border-[#e8eaf4] bg-white shadow-[0_10px_30px_rgba(112,122,163,0.05)]">
      <CardHeader className="flex flex-row items-start justify-between px-10 pb-2 pt-9">
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <CardTitle className="flex items-center gap-2 text-[22px] font-semibold text-[#1f2538]">
                Risque & Alertes
                <Info className="h-5 w-5 text-[#a0a8c0]" />
              </CardTitle>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[260px]">
              <p>Vue synthetique des signaux critiques, moderes et informatifs a traiter.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {!loading && alerts.length > 0 && (
          <span className="inline-flex h-10 items-center rounded-full bg-[#fde9e7] px-5 text-[16px] font-semibold text-[#ff584f]">
            {alerts.length} alertes
          </span>
        )}
      </CardHeader>

      <CardContent className="space-y-4 px-10 pb-9 pt-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-[62px] w-full rounded-[22px]" />
          ))
        ) : (
          alerts.map((alert, index) => {
            const Icon = ICON_MAP[alert.type] || AlertTriangle;
            const styles = ALERT_STYLES[alert.severity];

            return (
              <div
                key={`${alert.type}-${index}`}
                className={cn(
                  "flex min-h-[62px] items-center gap-5 rounded-[22px] border px-6 py-4",
                  styles.row,
                )}
              >
                <span className={cn("h-3 w-3 shrink-0 rounded-full", styles.dot)} />
                <Icon className={cn("h-6 w-6 shrink-0", styles.icon)} />
                <p className="flex-1 text-[19px] font-medium text-[#1f2538]">{alert.label}</p>
                <span
                  className={cn(
                    "inline-flex min-w-[40px] items-center justify-center rounded-full px-4 py-2 text-[16px] font-semibold",
                    styles.badge,
                  )}
                >
                  {alert.count}
                </span>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
