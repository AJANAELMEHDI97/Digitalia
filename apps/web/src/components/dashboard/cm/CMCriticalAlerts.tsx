import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ChevronRight,
  Clock3,
  PauseCircle,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Publication } from "@/hooks/usePublications";
import { FirmStats } from "@/hooks/useCMWorkspace";
import { differenceInHours, parseISO, subDays } from "date-fns";
import { cn } from "@/lib/utils";

type AlertCategory = "late" | "blocked" | "refused" | "inactive";

interface FirmAlert {
  firmId: string;
  firmName: string;
  late: number;
  blocked: number;
  refused: number;
  inactive: boolean;
}

interface CMCriticalAlertsProps {
  publications: Publication[];
  firmNamesMap: Map<string, string>;
  firmStats?: FirmStats[];
}

interface AlertRow {
  key: AlertCategory;
  title: string;
  subtitle: string;
  count: number;
  icon: React.ElementType;
  href: string;
  tone: "critical" | "warning";
}

const ROW_STYLES = {
  critical: {
    container: "border-[#ffd6d2] bg-[#fff5f4]",
    icon: "text-[#ff5f56]",
    dot: "bg-[#ff5f56]",
    badge: "bg-[#ffe1de] text-[#ff5f56]",
  },
  warning: {
    container: "border-[#f3da94] bg-[#fffaf0]",
    icon: "text-[#ef9a1b]",
    dot: "bg-[#ef9a1b]",
    badge: "bg-[#fff0c9] text-[#dd8c12]",
  },
} as const;

function buildFirmAlerts(
  publications: Publication[],
  firmNamesMap: Map<string, string>,
  firmStats?: FirmStats[],
) {
  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);
  const firmsMap = new Map<string, FirmAlert>();

  const ensureFirm = (firmId: string) => {
    if (!firmsMap.has(firmId)) {
      firmsMap.set(firmId, {
        firmId,
        firmName: firmNamesMap.get(firmId) || "Cabinet inconnu",
        late: 0,
        blocked: 0,
        refused: 0,
        inactive: false,
      });
    }

    return firmsMap.get(firmId)!;
  };

  publications.forEach((publication) => {
    const firmId = publication.law_firm_id || "";
    if (!firmId) return;

    if (publication.status === "programme" && parseISO(publication.scheduled_date) < now) {
      ensureFirm(firmId).late += 1;
    }

    if (publication.status === "a_valider" && differenceInHours(now, parseISO(publication.created_at)) > 48) {
      ensureFirm(firmId).blocked += 1;
    }

    if (publication.status === "refuse") {
      ensureFirm(firmId).refused += 1;
    }
  });

  if (firmStats) {
    firmStats.forEach((firmStat) => {
      const hasRecentPublication = publications.some(
        (publication) =>
          publication.law_firm_id === firmStat.firm.id && parseISO(publication.created_at) > thirtyDaysAgo,
      );

      if ((firmStat.total === 0 || firmStat.status === "blocked") && !hasRecentPublication) {
        ensureFirm(firmStat.firm.id).inactive = true;
      }
    });
  }

  const firms = Array.from(firmsMap.values());
  const counts = {
    late: firms.reduce((sum, firm) => sum + firm.late, 0),
    blocked: firms.reduce((sum, firm) => sum + firm.blocked, 0),
    refused: firms.reduce((sum, firm) => sum + firm.refused, 0),
    inactive: firms.filter((firm) => firm.inactive).length,
  };

  return { firms, counts };
}

function summarizeFirms(firms: FirmAlert[], predicate: (firm: FirmAlert) => boolean) {
  const impacted = firms.filter(predicate).slice(0, 2).map((firm) => firm.firmName);
  if (impacted.length === 0) return "Aucun cabinet concerné";
  if (impacted.length === 1) return impacted[0];
  return `${impacted[0]} · ${impacted[1]}`;
}

function AlertItem({ row }: { row: AlertRow }) {
  const styles = ROW_STYLES[row.tone];
  const Icon = row.icon;

  return (
    <Link
      to={row.href}
      className={cn(
        "flex items-center justify-between gap-4 rounded-[24px] border px-5 py-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(113,123,165,0.08)]",
        styles.container,
      )}
    >
      <div className="flex min-w-0 items-center gap-4">
        <span className={cn("h-3 w-3 shrink-0 rounded-full", styles.dot)} />
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white", styles.icon)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[16px] font-semibold text-[#242a3d]">{row.title}</p>
          <p className="truncate text-[13px] text-[#99a0b9]">{row.subtitle}</p>
        </div>
      </div>

      <span className={cn("rounded-full px-3 py-1 text-[13px] font-semibold", styles.badge)}>
        {row.count}
      </span>
    </Link>
  );
}

export function CMCriticalAlerts({ publications, firmNamesMap, firmStats }: CMCriticalAlertsProps) {
  const { firms, counts } = buildFirmAlerts(publications, firmNamesMap, firmStats);
  const totalAlerts = counts.late + counts.blocked + counts.refused + counts.inactive;

  const rows: AlertRow[] = [
    {
      key: "late",
      title: "Publications en retard",
      subtitle: summarizeFirms(firms, (firm) => firm.late > 0),
      count: counts.late,
      icon: AlertTriangle,
      href: "/validation",
      tone: "critical",
    },
    {
      key: "blocked",
      title: "Validations bloquées",
      subtitle: summarizeFirms(firms, (firm) => firm.blocked > 0),
      count: counts.blocked,
      icon: Clock3,
      href: "/validation",
      tone: "critical",
    },
    {
      key: "refused",
      title: "Refus client",
      subtitle: summarizeFirms(firms, (firm) => firm.refused > 0),
      count: counts.refused,
      icon: XCircle,
      href: "/validation",
      tone: "warning",
    },
    {
      key: "inactive",
      title: "Cabinets à surveiller",
      subtitle: summarizeFirms(firms, (firm) => firm.inactive),
      count: counts.inactive,
      icon: PauseCircle,
      href: "/cm/firms",
      tone: "warning",
    },
  ].filter((row) => row.count > 0);

  if (rows.length === 0) {
    return (
      <Card className="rounded-[32px] border border-[#e8ecf7] bg-white shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-[18px] font-semibold text-[#23293d]">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eafbf1]">
              <ShieldAlert className="h-5 w-5 text-[#18ba7b]" />
            </span>
            Alertes critiques
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="rounded-[24px] border border-[#d6f0df] bg-[#f2fff7] px-5 py-6 text-center">
            <p className="text-[16px] font-semibold text-[#1e2436]">Aucune alerte critique</p>
            <p className="mt-1 text-[14px] text-[#8e97b6]">
              Tous vos cabinets sont dans une situation saine aujourd&apos;hui.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-[32px] border border-[#e8ecf7] bg-white shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-3 text-[18px] font-semibold text-[#23293d]">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff4dc]">
              <AlertTriangle className="h-5 w-5 text-[#ef9a1b]" />
            </span>
            Alertes critiques
          </CardTitle>
          <span className="rounded-full bg-[#ffe5e2] px-3 py-1 text-[13px] font-semibold text-[#ff655c]">
            {totalAlerts}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {rows.map((row) => (
          <AlertItem key={row.key} row={row} />
        ))}

        <Link
          to="/validation"
          className="flex items-center justify-between pt-2 text-[14px] font-medium text-[#6e77a0] transition-colors hover:text-[#4f59d6]"
        >
          <span>Voir toutes les alertes</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
