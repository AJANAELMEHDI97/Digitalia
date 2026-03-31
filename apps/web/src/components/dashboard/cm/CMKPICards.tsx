import {
  AlertTriangle,
  BarChart3,
  Building2,
  Calendar,
  CalendarCheck,
  Clock3,
  Send,
  ShieldAlert,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type KPIFilter =
  | "firms"
  | "pending"
  | "awaiting_lawyer"
  | "refused"
  | "scheduled"
  | "late"
  | "at_risk";

interface CMKPICardsProps {
  totalFirms: number;
  totalPending: number;
  totalAwaitingLawyer: number;
  totalRefused: number;
  totalScheduled: number;
  totalLate: number;
  totalAtRisk?: number;
  totalImminentAppointments?: number;
  totalPublications30d?: number;
  totalVolume?: number;
  activeFilter: KPIFilter | null;
  onFilterChange: (filter: KPIFilter | null) => void;
}

interface KPISectionProps {
  label: string;
  textClass: string;
  backgroundClass: string;
  children: React.ReactNode;
}

interface KPIItemProps {
  icon: LucideIcon;
  value: number;
  label: string;
  color: "neutral" | "warning" | "danger" | "success" | "info";
  onClick: () => void;
  active?: boolean;
}

const COLOR_STYLES = {
  neutral: {
    bg: "bg-[#f3f5fc]",
    icon: "text-[#9aa1b8]",
    ring: "ring-[#d9ddee]",
  },
  warning: {
    bg: "bg-[#fff4dc]",
    icon: "text-[#ee9a1b]",
    ring: "ring-[#f4c65a]",
  },
  danger: {
    bg: "bg-[#fff1f1]",
    icon: "text-[#ff655c]",
    ring: "ring-[#ffb6b1]",
  },
  success: {
    bg: "bg-[#eafbf1]",
    icon: "text-[#18ba7b]",
    ring: "ring-[#a6eccb]",
  },
  info: {
    bg: "bg-[#edf4ff]",
    icon: "text-[#5b7cff]",
    ring: "ring-[#bfd0ff]",
  },
} as const;

function KPISection({ label, textClass, backgroundClass, children }: KPISectionProps) {
  return (
    <section className={cn("rounded-[28px] p-5 md:p-6", backgroundClass)}>
      <p className={cn("mb-4 text-[12px] font-semibold uppercase tracking-[0.12em]", textClass)}>
        {label}
      </p>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">{children}</div>
    </section>
  );
}

function KPIItem({ icon: Icon, value, label, color, onClick, active }: KPIItemProps) {
  const styles = COLOR_STYLES[color];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-[86px] w-full items-center gap-4 rounded-[22px] border border-[#e9ebf5] bg-white px-5 text-left shadow-[0_1px_0_rgba(220,224,238,0.45)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(113,123,165,0.08)]",
        active && `border-transparent ring-2 ${styles.ring}`,
      )}
    >
      <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl", styles.bg)}>
        <Icon className={cn("h-5 w-5", styles.icon)} />
      </div>
      <div className="min-w-0">
        <p className="text-[18px] font-bold leading-none text-[#1e2436]">{value}</p>
        <p className="mt-1.5 text-[13px] text-[#9aa1b8]">{label}</p>
      </div>
    </button>
  );
}

export function CMKPICards({
  totalFirms,
  totalPending,
  totalAwaitingLawyer,
  totalRefused,
  totalScheduled,
  totalLate,
  totalAtRisk = 0,
  totalImminentAppointments = 0,
  totalPublications30d = 0,
  totalVolume = 0,
  activeFilter,
  onFilterChange,
}: CMKPICardsProps) {
  const handleClick = (filter: KPIFilter) => {
    onFilterChange(activeFilter === filter ? null : filter);
  };

  return (
    <div className="space-y-5">
      <KPISection
        label="Priorité immédiate"
        textClass="text-[#ff655c]"
        backgroundClass="bg-[#fff6f7]"
      >
        <KPIItem
          icon={AlertTriangle}
          value={totalLate}
          label="En retard"
          color={totalLate > 0 ? "danger" : "neutral"}
          onClick={() => handleClick("late")}
          active={activeFilter === "late"}
        />
        <KPIItem
          icon={Calendar}
          value={totalImminentAppointments}
          label="RDV imminents"
          color={totalImminentAppointments > 0 ? "danger" : "neutral"}
          onClick={() => handleClick("scheduled")}
          active={activeFilter === "scheduled"}
        />
        <KPIItem
          icon={ShieldAlert}
          value={totalAtRisk}
          label="Cabinets à risque"
          color={totalAtRisk > 0 ? "danger" : "neutral"}
          onClick={() => handleClick("at_risk")}
          active={activeFilter === "at_risk"}
        />
      </KPISection>

      <KPISection
        label="À traiter aujourd'hui"
        textClass="text-[#ee9a1b]"
        backgroundClass="bg-[#fffaf1]"
      >
        <KPIItem
          icon={Clock3}
          value={totalPending}
          label="À valider"
          color={totalPending > 0 ? "warning" : "neutral"}
          onClick={() => handleClick("pending")}
          active={activeFilter === "pending"}
        />
        <KPIItem
          icon={Send}
          value={totalAwaitingLawyer}
          label="Attente avocat"
          color={totalAwaitingLawyer > 0 ? "info" : "neutral"}
          onClick={() => handleClick("awaiting_lawyer")}
          active={activeFilter === "awaiting_lawyer"}
        />
        <KPIItem
          icon={XCircle}
          value={totalRefused}
          label="Refusées"
          color={totalRefused > 0 ? "danger" : "neutral"}
          onClick={() => handleClick("refused")}
          active={activeFilter === "refused"}
        />
      </KPISection>

      <KPISection
        label="Vue d'ensemble"
        textClass="text-[#5b7cff]"
        backgroundClass="bg-[#f3f6ff]"
      >
        <KPIItem
          icon={Building2}
          value={totalFirms}
          label="Cabinets gérés"
          color="neutral"
          onClick={() => handleClick("firms")}
          active={activeFilter === "firms"}
        />
        <KPIItem
          icon={CalendarCheck}
          value={totalPublications30d}
          label="Publications 30j"
          color={totalPublications30d > 0 ? "success" : "neutral"}
          onClick={() => handleClick("scheduled")}
        />
        <KPIItem
          icon={BarChart3}
          value={totalVolume}
          label="Volume global"
          color="info"
          onClick={() => handleClick("firms")}
        />
      </KPISection>
    </div>
  );
}
