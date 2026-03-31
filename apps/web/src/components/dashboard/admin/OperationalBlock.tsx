import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  FileClock,
  BadgeCheck,
  Wifi,
  UserX2,
  CalendarCheck2,
} from "lucide-react";

interface OperationalBlockProps {
  stats: {
    publicationsByStatus: { pending: number };
    businessKPIs: { validationRate: number };
    team: { cmOnline: number; appointmentsToday: number };
    inactiveProfiles: number;
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

function LoadingState({ count }: { count: number }) {
  return (
    <div className="space-y-5">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-2xl" />
          <Skeleton className="h-6 flex-1 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function OperationalBlock({ stats, loading }: OperationalBlockProps) {
  const productionItems: KPIItem[] = [
    {
      label: "Posts en attente",
      value: stats.publicationsByStatus.pending,
      icon: FileClock,
      tone: stats.publicationsByStatus.pending > 5 ? "danger" : "neutral",
    },
    {
      label: "Taux validation",
      value: `${stats.businessKPIs.validationRate}%`,
      icon: BadgeCheck,
      tone: stats.businessKPIs.validationRate >= 70 ? "success" : "neutral",
    },
    {
      label: "CM en ligne",
      value: stats.team.cmOnline,
      icon: Wifi,
      tone: stats.team.cmOnline > 0 ? "success" : "neutral",
    },
  ];

  const cabinetItems: KPIItem[] = [
    {
      label: "Cabinets inactifs (30j)",
      value: stats.inactiveProfiles,
      icon: UserX2,
      tone: stats.inactiveProfiles > 0 ? "danger" : "neutral",
    },
    {
      label: "RDV du jour",
      value: stats.team.appointmentsToday,
      icon: CalendarCheck2,
      tone: "neutral",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <Card className="rounded-[30px] border border-[#e8eaf4] bg-white shadow-[0_10px_30px_rgba(112,122,163,0.05)]">
        <CardHeader className="px-10 pb-2 pt-9">
          <CardTitle className="text-[22px] font-semibold text-[#1f2538]">Production</CardTitle>
        </CardHeader>
        <CardContent className="px-10 pb-8 pt-3">
          {loading ? <LoadingState count={3} /> : <KPIList items={productionItems} />}
        </CardContent>
      </Card>

      <Card className="rounded-[30px] border border-[#e8eaf4] bg-white shadow-[0_10px_30px_rgba(112,122,163,0.05)]">
        <CardHeader className="px-10 pb-2 pt-9">
          <CardTitle className="text-[22px] font-semibold text-[#1f2538]">Activite cabinets</CardTitle>
        </CardHeader>
        <CardContent className="px-10 pb-8 pt-3">
          {loading ? <LoadingState count={2} /> : <KPIList items={cabinetItems} />}
        </CardContent>
      </Card>
    </div>
  );
}
