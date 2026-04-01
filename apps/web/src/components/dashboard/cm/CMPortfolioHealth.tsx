import { AlertTriangle, Eye, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FirmStats } from "@/hooks/useCMWorkspace";

interface CMPortfolioHealthProps {
  firmStats: FirmStats[];
}

interface HealthBarProps {
  icon: React.ElementType;
  label: string;
  count: number;
  total: number;
  barColor: string;
  iconColor: string;
}

function HealthBar({ icon: Icon, label, count, total, barColor, iconColor }: HealthBarProps) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Icon className={cn("h-4 w-4", iconColor)} />
          <span className="text-[#6e7697]">{label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-[#23293d]">{count}</span>
          <span className="text-xs text-[#9aa1b8]">({pct}%)</span>
        </div>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#eef1fb]">
        <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function CMPortfolioHealth({ firmStats }: CMPortfolioHealthProps) {
  const total = firmStats.length;
  const stable = firmStats.filter((firm) => firm.status === "ok").length;
  const attention = firmStats.filter((firm) => firm.status === "attention").length;
  const atRisk = firmStats.filter((firm) => firm.status === "blocked").length;

  return (
    <Card className="rounded-[32px] border border-[#e8ecf7] bg-white shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-[18px] font-semibold text-[#23293d]">Santé portefeuille</CardTitle>
          <span className="rounded-full bg-[#f3f5fc] px-3 py-1 text-[13px] font-semibold text-[#697496]">
            {total} cabinet{total !== 1 ? "s" : ""}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <HealthBar
          icon={Shield}
          label="Stables"
          count={stable}
          total={total}
          barColor="bg-[#18ba7b]"
          iconColor="text-[#18ba7b]"
        />
        <HealthBar
          icon={Eye}
          label="Sous surveillance"
          count={attention}
          total={total}
          barColor="bg-[#ee9a1b]"
          iconColor="text-[#ee9a1b]"
        />
        <HealthBar
          icon={AlertTriangle}
          label="À risque"
          count={atRisk}
          total={total}
          barColor="bg-[#ff655c]"
          iconColor="text-[#ff655c]"
        />
      </CardContent>
    </Card>
  );
}
