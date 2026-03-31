import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRoleSimulationSafe } from "@/contexts/RoleSimulationContext";
import type { SimpleRole } from "@/hooks/useSimpleRole";

const ROLE_LABELS: Record<SimpleRole, string> = {
  admin: "Super Admin",
  community_manager: "Community Manager",
  lawyer: "Avocat",
};

export function SimulationBanner() {
  const { simulatedRole, clearSimulation, isSimulating } = useRoleSimulationSafe();

  if (!isSimulating || !simulatedRole) {
    return null;
  }

  return (
    <div className="flex h-11 items-center gap-2 rounded-full border border-[#f4c65a] bg-[#fff7df] px-4 text-[#dd7c11] shadow-[0_1px_0_rgba(244,198,90,0.18)]">
      <AlertTriangle className="h-4 w-4 text-[#f08a1c]" />
      <span className="whitespace-nowrap text-sm font-medium">
        Vue : <span className="font-semibold">{ROLE_LABELS[simulatedRole]}</span>
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 rounded-full p-0 text-[#dd7c11] hover:bg-[#ffe9b8] hover:text-[#be6610]"
        onClick={clearSimulation}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}
