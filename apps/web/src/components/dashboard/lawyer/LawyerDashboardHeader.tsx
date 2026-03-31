import { Shield, Lock, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LawyerDashboardHeaderProps {
  userName?: string;
}

export function LawyerDashboardHeader({ userName }: LawyerDashboardHeaderProps) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[34px] font-bold tracking-[-0.04em] text-[#1f2538] md:text-[46px]">
          Bonjour, Maitre {userName || ""}
        </h1>
        <p className="mt-1 text-[18px] text-[#9aa1b8]">
          Votre espace de pilotage editorial
        </p>
      </div>

      <div
        className={cn(
          "flex flex-col justify-between gap-4 rounded-[30px] border border-[#bff4df] px-7 py-7",
          "bg-[linear-gradient(90deg,#effff8_0%,#f6fffc_60%,#f1f8ff_100%)] sm:flex-row sm:items-center",
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#d8fbeb]">
            <CheckCircle2 className="h-6 w-6 text-[#0f9b6e]" />
          </div>
          <p className="text-[18px] font-semibold text-[#1f2538]">
            Votre communication est active et maitrisee.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Badge
            variant="outline"
            className="h-10 rounded-full border-[#7fe0b1] bg-[#effff7] px-4 text-[14px] font-semibold text-[#109266]"
          >
            <Shield className="mr-1.5 h-3.5 w-3.5" />
            Conforme RIN
          </Badge>
          <Badge
            variant="outline"
            className="h-10 rounded-full border-[#a8c7ff] bg-[#f2f7ff] px-4 text-[14px] font-semibold text-[#3f6fff]"
          >
            <Lock className="mr-1.5 h-3.5 w-3.5" />
            Aucune publication automatique
          </Badge>
        </div>
      </div>
    </div>
  );
}
