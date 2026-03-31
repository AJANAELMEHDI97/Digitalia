import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Clock, CheckCircle, XCircle, Inbox, Timer } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface AdminValidationOverviewProps {
  draft: number;
  pending: number;
  approved: number;
  rejected: number;
  overdueCount?: number;
  atRiskFirms?: number;
  loading?: boolean;
  secondaryKPIs?: {
    publications30d: number;
    validationRate: number;
    avgValidationTimeHours: number;
    refusalRate: number;
  };
}

const items = [
  { key: "pending" as const, label: "En attente", icon: Clock, color: "text-amber-600", bgActive: "bg-amber-50 dark:bg-amber-950/30" },
  { key: "rejected" as const, label: "Refusées", icon: XCircle, color: "text-destructive", bgActive: "bg-destructive/5" },
  { key: "approved" as const, label: "Validées", icon: CheckCircle, color: "text-emerald-600", bgActive: "bg-emerald-50 dark:bg-emerald-950/30" },
  { key: "draft" as const, label: "Brouillons", icon: FileText, color: "text-muted-foreground", bgActive: "bg-muted/50" },
  { key: "overdue" as const, label: "En retard", icon: Timer, color: "text-red-600", bgActive: "bg-red-50 dark:bg-red-950/30" },
];

export function AdminValidationOverview({ draft, pending, approved, rejected, overdueCount = 0, loading, secondaryKPIs }: AdminValidationOverviewProps) {
  const values = { draft, pending, approved, rejected, overdue: overdueCount };
  const total = draft + pending + approved + rejected;

  return (
    <Card className={cn(total === 0 && !loading && "opacity-70")}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-muted-foreground">Communications</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {items.slice(0, 4).map(({ key }) => (
              <div key={key} className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded" />
                <div>
                  <Skeleton className="h-3 w-12 mb-1" />
                  <Skeleton className="h-4 w-8" />
                </div>
              </div>
            ))}
          </div>
        ) : total === 0 ? (
          <div className="flex flex-col items-center justify-center py-4 gap-1.5 text-muted-foreground">
            <Inbox className="h-6 w-6" />
            <p className="text-xs text-center">Plateforme au repos</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {items.map(({ key, label, icon: Icon, color, bgActive }) => {
              const val = values[key];
              if (key === "overdue" && val === 0) return null;
              return (
                <div
                  key={key}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors",
                    val > 0 ? bgActive : ""
                  )}
                >
                  <Icon className={`h-3.5 w-3.5 ${color} shrink-0`} />
                  <div>
                    <p className="text-[11px] text-muted-foreground">{label}</p>
                    <p className={cn(
                      "text-base font-bold tabular-nums",
                      val > 0 && key === "pending" && "text-amber-600",
                      val > 0 && key === "rejected" && "text-destructive",
                      val > 0 && key === "overdue" && "text-red-600",
                    )}>{val}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Secondary KPIs from deleted AdminKPICards */}
        {secondaryKPIs && !loading && (
          <div className="border-t border-border pt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pub. 30j</span>
              <span className="font-semibold tabular-nums">{secondaryKPIs.publications30d}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Validation</span>
              <span className="font-semibold tabular-nums">{secondaryKPIs.validationRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Temps moy.</span>
              <span className="font-semibold tabular-nums">{secondaryKPIs.avgValidationTimeHours}h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Refus</span>
              <span className="font-semibold tabular-nums">{secondaryKPIs.refusalRate}%</span>
            </div>
          </div>
        )}

        {total > 0 && (
          <Link to="/validation" className="inline-block text-[11px] text-primary hover:underline">
            Voir les détails →
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
