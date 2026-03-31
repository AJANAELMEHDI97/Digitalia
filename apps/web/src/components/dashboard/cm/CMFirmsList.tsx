import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Building2,
  CalendarCheck,
  ChevronRight,
  Clock3,
  FileText,
  ShieldAlert,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FirmStats } from "@/hooks/useCMWorkspace";
import { cn } from "@/lib/utils";

interface CMFirmsListProps {
  firmStats: FirmStats[];
  selectedFirmId: string | null;
  onSelectFirm: (firmId: string) => void;
}

const STATUS_META = {
  ok: {
    label: "Stable",
    pill: "bg-[#eafbf1] text-[#18ba7b]",
    icon: ShieldAlert,
    iconClass: "text-[#18ba7b]",
  },
  attention: {
    label: "À suivre",
    pill: "bg-[#fff4dc] text-[#ee9a1b]",
    icon: AlertTriangle,
    iconClass: "text-[#ee9a1b]",
  },
  blocked: {
    label: "Bloqué",
    pill: "bg-[#ffe7e5] text-[#ff655c]",
    icon: AlertTriangle,
    iconClass: "text-[#ff655c]",
  },
} as const;

export function CMFirmsList({ firmStats, selectedFirmId, onSelectFirm }: CMFirmsListProps) {
  const orderedFirms = [...firmStats]
    .sort((left, right) => {
      const priority = { blocked: 0, attention: 1, ok: 2 };
      const priorityDiff = priority[left.status] - priority[right.status];
      if (priorityDiff !== 0) return priorityDiff;
      return right.pending - left.pending;
    })
    .slice(0, 5);

  return (
    <Card className="rounded-[32px] border border-[#e8ecf7] bg-white shadow-none">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-3 text-[18px] font-semibold text-[#23293d]">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f3f5fc]">
              <Building2 className="h-5 w-5 text-[#697496]" />
            </span>
            Mes cabinets
          </CardTitle>

          <Link
            to="/cm/firms"
            className="flex items-center gap-1 text-[14px] font-medium text-[#6e77a0] transition-colors hover:text-[#4f59d6]"
          >
            Voir tout
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {orderedFirms.map((firmStat) => {
          const StatusIcon = STATUS_META[firmStat.status].icon;
          const isActive = selectedFirmId === firmStat.firm.id;

          return (
            <button
              key={firmStat.firm.id}
              type="button"
              onClick={() => onSelectFirm(firmStat.firm.id)}
              className={cn(
                "w-full rounded-[24px] border border-[#edf0f8] bg-[#fbfcff] px-5 py-4 text-left transition-all hover:-translate-y-0.5 hover:border-[#dadff0] hover:shadow-[0_12px_30px_rgba(113,123,165,0.08)]",
                isActive && "border-[#cfd5ff] bg-[#f5f3ff] ring-2 ring-[#d9d5ff]",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#eef1fb] text-[13px] font-semibold text-[#57617f]">
                      {firmStat.firm.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[16px] font-semibold text-[#23293d]">
                        {firmStat.firm.name}
                      </p>
                      <p className="truncate text-[13px] text-[#9aa1b8]">
                        {firmStat.firm.city || "Cabinet suivi dans SocialPulse"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={cn("rounded-full px-3 py-1 text-[12px] font-semibold", STATUS_META[firmStat.status].pill)}>
                    {STATUS_META[firmStat.status].label}
                  </span>
                  <StatusIcon className={cn("h-4 w-4", STATUS_META[firmStat.status].iconClass)} />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-white px-4 py-3">
                  <div className="flex items-center gap-2 text-[#ee9a1b]">
                    <Clock3 className="h-4 w-4" />
                    <span className="text-[18px] font-bold">{firmStat.pending}</span>
                  </div>
                  <p className="mt-1 text-[12px] text-[#9aa1b8]">À valider</p>
                </div>
                <div className="rounded-2xl bg-white px-4 py-3">
                  <div className="flex items-center gap-2 text-[#18ba7b]">
                    <CalendarCheck className="h-4 w-4" />
                    <span className="text-[18px] font-bold">{firmStat.scheduled}</span>
                  </div>
                  <p className="mt-1 text-[12px] text-[#9aa1b8]">Planifiées</p>
                </div>
                <div className="rounded-2xl bg-white px-4 py-3">
                  <div className="flex items-center gap-2 text-[#8c94af]">
                    <FileText className="h-4 w-4" />
                    <span className="text-[18px] font-bold">{firmStat.drafts}</span>
                  </div>
                  <p className="mt-1 text-[12px] text-[#9aa1b8]">Brouillons</p>
                </div>
              </div>
            </button>
          );
        })}

        <div className="flex items-center justify-between pt-2 text-[13px] text-[#99a0b9]">
          <span>{firmStats.length} cabinet(s) suivis</span>
          <span className="font-medium text-[#677091]">Vue portefeuille</span>
        </div>
      </CardContent>
    </Card>
  );
}
