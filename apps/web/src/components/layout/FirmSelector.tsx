import React from "react";
import { Building2, ChevronDown, Check } from "lucide-react";
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
import { useLawFirmContextSafe } from "@/contexts/LawFirmContext";
import { useUserRole } from "@/hooks/useUserRole";
import { cn } from "@/lib/utils";

const FIRM_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-rose-500",
];

function getFirmColor(index: number): string {
  return FIRM_COLORS[index % FIRM_COLORS.length];
}

export function FirmSelector() {
  const { assignedFirms, selectedFirmId, selectedFirm, setSelectedFirmId, isLoading } = useLawFirmContextSafe();
  const { isCommunityManager } = useUserRole();

  // Only show for Community Managers
  if (!isCommunityManager) {
    return null;
  }

  // Don't show if no firms assigned
  if (assignedFirms.length === 0 && !isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-muted/50 rounded-md">
        <Building2 className="h-4 w-4" />
        <span>Aucun cabinet assigné</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span>Chargement...</span>
      </div>
    );
  }

  const selectedIndex = assignedFirms.findIndex(f => f.id === selectedFirmId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 min-w-[200px] justify-between"
        >
          <div className="flex items-center gap-2">
            {selectedFirm ? (
              <>
                <div className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  getFirmColor(selectedIndex)
                )} />
                <span className="truncate max-w-[150px]">{selectedFirm.name}</span>
              </>
            ) : (
              <>
                <Building2 className="h-4 w-4" />
                <span>Sélectionner un cabinet</span>
              </>
            )}
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="start" className="w-[280px]">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Mes cabinets ({assignedFirms.length})
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {assignedFirms.map((firm, index) => (
          <DropdownMenuItem
            key={firm.id}
            onClick={() => setSelectedFirmId(firm.id)}
            className="flex items-center justify-between gap-2 cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className={cn(
                "h-2.5 w-2.5 rounded-full shrink-0",
                getFirmColor(index)
              )} />
              <div className="min-w-0">
                <p className="font-medium truncate">{firm.name}</p>
                {firm.city && (
                  <p className="text-xs text-muted-foreground">{firm.city}</p>
                )}
              </div>
            </div>
            
            {firm.id === selectedFirmId && (
              <Check className="h-4 w-4 text-primary shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
        
        {assignedFirms.length > 1 && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5">
              <Badge variant="secondary" className="text-xs">
                {assignedFirms.length} cabinets assignés
              </Badge>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
