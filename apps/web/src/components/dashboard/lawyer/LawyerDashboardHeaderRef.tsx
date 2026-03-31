import { Shield, Lock, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LawyerDashboardHeaderProps {
  userName?: string;
}

export function LawyerDashboardHeader({ userName }: LawyerDashboardHeaderProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-[30px] font-semibold tracking-[-0.03em] text-[#24283a]">
          Bonjour, Maitre {userName || ""}
        </h1>
        <p className="text-lg text-[#9aa1b8]">Votre espace de pilotage editorial</p>
      </div>

      <div
        className={cn(
          "flex flex-col justify-between gap-4 rounded-[28px] border px-7 py-6",
          "border-[#c8efdf] bg-[linear-gradient(90deg,#ebfff7_0%,#f8fffd_64%,#f3fefa_100%)]",
          "sm:flex-row sm:items-center",
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#c8f6de]">
            <CheckCircle2 className="h-6 w-6 text-[#00a36f]" />
          </div>
          <p className="text-[18px] font-semibold text-[#253042]">
            Votre communication est active et maitrisee.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Badge
            variant="outline"
            className="rounded-full border-[#57d7a3] bg-[#ebfff7] px-4 py-1.5 text-sm font-semibold text-[#0e9d6e]"
          >
            <Shield className="mr-1 h-3 w-3" />
            Conforme RIN
          </Badge>
          <Badge
            variant="outline"
            className="rounded-full border-[#7aa5ff] bg-[#f4f8ff] px-4 py-1.5 text-sm font-semibold text-[#2c64f6]"
          >
            <Lock className="mr-1 h-3 w-3" />
            Aucune publication automatique
          </Badge>
        </div>
      </div>
    </div>
  );
}
