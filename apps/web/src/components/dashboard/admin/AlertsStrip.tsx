import { AlertTriangle, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Alert {
  type: "blocked" | "sla_breach" | "repeated_refusal";
  label: string;
  count: number;
  firmName?: string;
}

const ICON_MAP = {
  blocked: Clock,
  sla_breach: AlertTriangle,
  repeated_refusal: XCircle,
};

export function AlertsStrip({ alerts, loading }: { alerts: Alert[]; loading?: boolean }) {
  if (loading || alerts.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {alerts.map((a, i) => {
        const Icon = ICON_MAP[a.type] || AlertTriangle;
        return (
          <Badge
            key={i}
            variant="outline"
            className={cn(
              "gap-1.5 py-1.5 px-3 text-xs font-medium cursor-default",
              a.type === "blocked" && "border-amber-300 bg-amber-50 text-amber-800",
              a.type === "repeated_refusal" && "border-destructive/30 bg-destructive/5 text-destructive",
              a.type === "sla_breach" && "border-orange-300 bg-orange-50 text-orange-800"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {a.label} : {a.count}
          </Badge>
        );
      })}
    </div>
  );
}
