import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Clock3,
  FlaskConical,
  UserRoundCheck,
  Users,
  CalendarDays,
  CalendarCheck2,
} from "lucide-react";

interface BusinessBlockProps {
  stats: {
    revenue: { overdue: number };
    acquisition: {
      leadsMonth: number;
      demosScheduled: number;
      converted: number;
      testAccounts: number;
    };
    clientHealth: { paymentDelays: number };
    demosCompleted: number;
  };
  loading?: boolean;
}

interface KPIItem {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "danger" | "success" | "neutral";
}

function KPIList({ items }: { items: KPIItem[] }) {
  return (
    <div className="space-y-5">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-4">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl",
              item.tone === "danger" && "bg-[#fff1ef] text-[#ff5b4a]",
              item.tone === "success" && "bg-[#e8fbf2] text-[#0e9f75]",
              (!item.tone || item.tone === "neutral") && "bg-[#f4f5fa] text-[#9ea5bf]",
            )}
          >
            <item.icon className="h-5 w-5" />
          </div>
          <p className="flex-1 text-[17px] font-medium text-[#97a0bc]">{item.label}</p>
          <p
            className={cn(
              "text-[18px] font-semibold text-[#1f2538]",
              item.tone === "danger" && "text-[#ff5b4a]",
              item.tone === "success" && "text-[#0e9f75]",
            )}
          >
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-5">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-2xl" />
          <Skeleton className="h-6 flex-1 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function BusinessBlock({ stats, loading }: BusinessBlockProps) {
  const financierItems: KPIItem[] = [
    {
      label: "Retards paiement",
      value: `${stats.clientHealth.paymentDelays} · ${stats.revenue.overdue.toLocaleString("fr-FR")} €`,
      icon: Clock3,
      tone: stats.clientHealth.paymentDelays > 0 ? "danger" : "neutral",
    },
    {
      label: "Comptes en test",
      value: stats.acquisition.testAccounts,
      icon: FlaskConical,
      tone: "neutral",
    },
    {
      label: "Convertis ce mois",
      value: stats.acquisition.converted,
      icon: UserRoundCheck,
      tone: stats.acquisition.converted > 0 ? "success" : "neutral",
    },
  ];

  const commercialItems: KPIItem[] = [
    { label: "Leads du mois", value: stats.acquisition.leadsMonth, icon: Users, tone: "neutral" },
    {
      label: "Demos planifiees",
      value: stats.acquisition.demosScheduled,
      icon: CalendarDays,
      tone: "neutral",
    },
    {
      label: "Demos realisees",
      value: stats.demosCompleted,
      icon: CalendarCheck2,
      tone: stats.demosCompleted > 0 ? "success" : "neutral",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <Card className="rounded-[30px] border border-[#e8eaf4] bg-white shadow-[0_10px_30px_rgba(112,122,163,0.05)]">
        <CardHeader className="px-10 pb-2 pt-9">
          <CardTitle className="text-[22px] font-semibold text-[#1f2538]">Financier</CardTitle>
        </CardHeader>
        <CardContent className="px-10 pb-8 pt-3">
          {loading ? <LoadingState /> : <KPIList items={financierItems} />}
        </CardContent>
      </Card>

      <Card className="rounded-[30px] border border-[#e8eaf4] bg-white shadow-[0_10px_30px_rgba(112,122,163,0.05)]">
        <CardHeader className="px-10 pb-2 pt-9">
          <CardTitle className="text-[22px] font-semibold text-[#1f2538]">Commercial</CardTitle>
        </CardHeader>
        <CardContent className="px-10 pb-8 pt-3">
          {loading ? <LoadingState /> : <KPIList items={commercialItems} />}
        </CardContent>
      </Card>
    </div>
  );
}
