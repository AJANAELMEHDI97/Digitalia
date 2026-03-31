import { Calendar, CheckCircle2, FileText, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Publication } from "@/hooks/usePublications";
import { FirmStats } from "@/hooks/useCMWorkspace";

interface CMPerformanceBlockProps {
  publications: Publication[];
  firmStats: FirmStats[];
}

interface MetricItemProps {
  icon: React.ElementType;
  value: string;
  label: string;
  iconColor: string;
  iconBg: string;
}

function MetricItem({ icon: Icon, value, label, iconColor, iconBg }: MetricItemProps) {
  return (
    <div className="rounded-[24px] bg-[#fbfcff] px-4 py-4">
      <div className="flex items-center gap-3">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-2xl", iconBg)}>
          <Icon className={cn("h-4 w-4", iconColor)} />
        </div>
        <div>
          <p className="text-[18px] font-bold leading-none text-[#23293d]">{value}</p>
          <p className="mt-1 text-[12px] text-[#9aa1b8]">{label}</p>
        </div>
      </div>
    </div>
  );
}

export function CMPerformanceBlock({ publications, firmStats }: CMPerformanceBlockProps) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const producedThisMonth = publications.filter((publication) => new Date(publication.created_at) >= startOfMonth).length;

  const submitted = publications.filter(
    (publication) =>
      publication.status === "a_valider" ||
      publication.status === "programme" ||
      publication.status === "publie" ||
      publication.status === "refuse",
  ).length;

  const validated = publications.filter(
    (publication) => publication.status === "programme" || publication.status === "publie",
  ).length;

  const validationRate = submitted > 0 ? Math.round((validated / submitted) * 100) : 0;
  const stableFirms = firmStats.filter((firm) => firm.status === "ok").length;

  return (
    <Card className="rounded-[32px] border border-[#e8ecf7] bg-white shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-[18px] font-semibold text-[#23293d]">Performance CM</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-3">
          <MetricItem
            icon={FileText}
            value={String(producedThisMonth)}
            label="Produites ce mois"
            iconColor="text-[#5546d7]"
            iconBg="bg-[#efeafe]"
          />
          <MetricItem
            icon={CheckCircle2}
            value={`${validationRate}%`}
            label="Taux validation"
            iconColor="text-[#18ba7b]"
            iconBg="bg-[#eafbf1]"
          />
          <MetricItem
            icon={Calendar}
            value="0"
            label="RDV realises"
            iconColor="text-[#ee9a1b]"
            iconBg="bg-[#fff4dc]"
          />
          <MetricItem
            icon={Shield}
            value={String(stableFirms)}
            label="Cabinets stabilises"
            iconColor="text-[#18ba7b]"
            iconBg="bg-[#eafbf1]"
          />
        </div>
      </CardContent>
    </Card>
  );
}
