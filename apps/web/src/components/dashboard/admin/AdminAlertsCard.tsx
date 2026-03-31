import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, AlertTriangle, Timer, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AdminAlertsCardProps {
  overdueCount?: number;
  atRiskFirms?: number;
  loading?: boolean;
}

export function AdminAlertsCard({ overdueCount = 0, atRiskFirms = 0, loading }: AdminAlertsCardProps) {
  const total = overdueCount + atRiskFirms;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-primary" />
          Cabinets à risque
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-14 w-full rounded-lg" />
            <Skeleton className="h-14 w-full rounded-lg" />
          </div>
        ) : total === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <ShieldAlert className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">Aucun cabinet à risque</p>
            <p className="text-xs mt-1">Situation nominale</p>
          </div>
        ) : (
          <div className="space-y-3">
            {overdueCount > 0 && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-destructive/5 border border-destructive/15">
                <Timer className="h-5 w-5 text-destructive shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Publications en retard</p>
                  <p className="text-2xl font-bold tabular-nums text-destructive">{overdueCount}</p>
                </div>
              </div>
            )}

            {atRiskFirms > 0 && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/30">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Cabinets nécessitant attention</p>
                  <p className="text-2xl font-bold tabular-nums text-amber-600 dark:text-amber-400">{atRiskFirms}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <Link to="/admin/firms">
          <Button variant="outline" size="sm" className="w-full text-xs gap-1 mt-1">
            Voir les cabinets <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
