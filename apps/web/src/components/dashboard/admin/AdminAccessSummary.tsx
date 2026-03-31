import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, UserX, UserPlus, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AdminAccessSummaryProps {
  admin: number;
  lawyer: number;
  community_manager: number;
  unassigned: number;
  totalProfiles: number;
  inactiveProfiles?: number;
  governance?: {
    newProfiles7d: number;
    cmWithoutFirm: number;
  };
  loading?: boolean;
}

const roles = [
  { key: "admin" as const, label: "Administrateurs", color: "bg-primary" },
  { key: "lawyer" as const, label: "Avocats", color: "bg-emerald-500" },
  { key: "community_manager" as const, label: "Community Managers", color: "bg-blue-500" },
  { key: "unassigned" as const, label: "Non assignés", color: "bg-muted-foreground/40" },
];

export function AdminAccessSummary({ admin, lawyer, community_manager, unassigned, totalProfiles, inactiveProfiles = 0, governance, loading }: AdminAccessSummaryProps) {
  const values = { admin, lawyer, community_manager, unassigned };
  const total = Math.max(totalProfiles, 1);

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">Gouvernance & accès</CardTitle>
        <span className="text-xs text-muted-foreground">{totalProfiles} utilisateur{totalProfiles !== 1 ? "s" : ""}</span>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          <div className="space-y-3">
            {roles.map(({ key, label, color }) => {
              const pct = Math.round((values[key] / total) * 100);
              return (
                <TooltipProvider key={key}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="space-y-1 cursor-default">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{label}</span>
                          <span className="font-semibold tabular-nums">{values[key]}</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${color} transition-all duration-500`}
                            style={{ width: `${(values[key] / total) * 100}%` }}
                          />
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      {pct}% du total ({values[key]}/{totalProfiles})
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}

            {/* Governance indicators */}
            <div className="space-y-1.5 pt-1 border-t border-border">
              {governance && governance.newProfiles7d > 0 && (
                <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>{governance.newProfiles7d} nouveau{governance.newProfiles7d > 1 ? "x" : ""} compte{governance.newProfiles7d > 1 ? "s" : ""} cette semaine</span>
                </div>
              )}

              {inactiveProfiles > 0 && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <UserX className="h-3.5 w-3.5 text-amber-500" />
                  <span>{inactiveProfiles} compte{inactiveProfiles > 1 ? "s" : ""} inactif{inactiveProfiles > 1 ? "s" : ""} (30j)</span>
                </div>
              )}

              {governance && governance.cmWithoutFirm > 0 && (
                <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>{governance.cmWithoutFirm} CM sans cabinet assigné</span>
                </div>
              )}
            </div>
          </div>
        )}
        <Link to="/admin" className="block mt-4">
          <Button variant="outline" size="sm" className="w-full text-xs gap-1">
            Gérer les accès <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
