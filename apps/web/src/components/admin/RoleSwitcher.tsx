import { useState } from "react";
import { 
  Shield, 
  Users, 
  Scale, 
  ChevronDown,
  X,
  UserCog
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRoleSimulation } from "@/contexts/RoleSimulationContext";
import type { SimpleRole } from "@/hooks/useSimpleRole";
import { cn } from "@/lib/utils";

interface RoleOption {
  role: SimpleRole | null;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: null,
    label: "Mon compte réel",
    description: "Administrateur - Accès complet",
    icon: Shield,
    color: "text-purple-500",
  },
  {
    role: "community_manager",
    label: "Community Manager",
    description: "Création de contenu, multi-cabinets",
    icon: Users,
    color: "text-blue-500",
  },
  {
    role: "lawyer",
    label: "Avocat",
    description: "Validation, publication, cabinet unique",
    icon: Scale,
    color: "text-emerald-500",
  },
];

export function RoleSwitcher() {
  const { simulatedRole, setSimulatedRole, isSimulating } = useRoleSimulation();
  const [open, setOpen] = useState(false);

  const currentOption = ROLE_OPTIONS.find(
    (opt) => opt.role === simulatedRole
  ) || ROLE_OPTIONS[0];

  const CurrentIcon = currentOption.icon;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-11 gap-2 rounded-full border-dashed border-[#f2d8a1] bg-[#fffaf0] px-4 text-[#1d2638] shadow-[0_1px_0_rgba(242,216,161,0.18)] hover:bg-[#fff7ea]",
            isSimulating && "border-[#f2d8a1] bg-[#fffaf0]"
          )}
        >
          <CurrentIcon className={cn("h-4 w-4", currentOption.color)} />
          <span className="hidden max-w-[120px] truncate text-sm font-semibold sm:inline-block">
            {currentOption.label}
          </span>
          {isSimulating && (
            <Badge variant="outline" className="ml-1 h-6 rounded-full border-[#f4c65a] bg-[#fff4d0] px-2.5 text-[11px] font-medium text-[#dd7c11]">
              Simulation
            </Badge>
          )}
          <ChevronDown className="h-4 w-4 text-[#8f96b2]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[430px] rounded-[24px] border border-[#e5e7f2] p-0 shadow-[0_20px_50px_rgba(80,89,125,0.18)]">
        <DropdownMenuLabel className="flex items-center gap-2 px-6 py-5 text-[18px] font-semibold text-[#2a3042]">
          <UserCog className="h-4 w-4" />
          Changer de vue
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {ROLE_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isActive = option.role === simulatedRole;
          
          return (
            <DropdownMenuItem
              key={option.role || "real"}
              onClick={() => {
                setSimulatedRole(option.role);
                setOpen(false);
              }}
              className={cn(
                "mx-2 my-1.5 flex cursor-pointer items-start gap-3 rounded-2xl px-4 py-4",
                isActive && "bg-[#f0f2fb]"
              )}
            >
              <Icon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", option.color)} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[18px] font-semibold text-[#2a3042]">{option.label}</span>
                  {isActive && (
                    <Badge variant="secondary" className="h-6 rounded-full bg-[#eef1fb] px-2.5 text-[11px] font-medium text-[#7b859f]">
                      Actif
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-[14px] text-[#98a0bb]">
                  {option.description}
                </p>
              </div>
            </DropdownMenuItem>
          );
        })}

        {isSimulating && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setSimulatedRole(null);
                setOpen(false);
              }}
              className="mx-2 my-1.5 cursor-pointer rounded-2xl px-4 py-4 text-[16px] font-medium text-[#dd7c11]"
            >
              <X className="h-4 w-4 mr-2" />
              Quitter la simulation
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
