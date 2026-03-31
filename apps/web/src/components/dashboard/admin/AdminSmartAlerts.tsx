import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  ShieldAlert, AlertTriangle, Info, Building2, Users, Heart, DollarSign, Scale,
  ChevronDown, ChevronUp, Filter,
} from "lucide-react";
import { useState } from "react";
import { type SmartAlert, type AlertSeverity, type AlertCategory } from "@/hooks/useAdminSmartAlerts";
import { Button } from "@/components/ui/button";

interface AdminSmartAlertsProps {
  alerts: SmartAlert[];
  loading?: boolean;
}

const severityConfig: Record<AlertSeverity, { label: string; icon: typeof ShieldAlert; badgeClass: string; borderClass: string }> = {
  critical: {
    label: "Critique",
    icon: ShieldAlert,
    badgeClass: "bg-destructive/10 text-destructive border-destructive/30",
    borderClass: "border-l-destructive",
  },
  moderate: {
    label: "Modérée",
    icon: AlertTriangle,
    badgeClass: "bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-400",
    borderClass: "border-l-amber-500",
  },
  info: {
    label: "Information",
    icon: Info,
    badgeClass: "bg-blue-500/10 text-blue-700 border-blue-500/30 dark:text-blue-400",
    borderClass: "border-l-blue-500",
  },
};

const categoryConfig: Record<AlertCategory, { label: string; icon: typeof Building2 }> = {
  behavioral: { label: "Comportement", icon: Building2 },
  cm: { label: "Community Manager", icon: Users },
  relational: { label: "Relationnel", icon: Heart },
  business: { label: "Business", icon: DollarSign },
  compliance: { label: "Déontologie", icon: Scale },
};

type FilterType = "all" | AlertSeverity | AlertCategory;

const INITIAL_LIMIT = 5;

export function AdminSmartAlerts({ alerts, loading }: AdminSmartAlertsProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const filtered = filter === "all"
    ? alerts
    : alerts.filter(a => a.severity === filter || a.category === filter);

  const visibleAlerts = showAll ? filtered : filtered.slice(0, INITIAL_LIMIT);
  const hasMore = filtered.length > INITIAL_LIMIT;

  const criticalCount = alerts.filter(a => a.severity === "critical").length;
  const moderateCount = alerts.filter(a => a.severity === "moderate").length;

  const filterOptions: { value: FilterType; label: string; count: number }[] = [
    { value: "all", label: "Toutes", count: alerts.length },
    { value: "critical", label: "Critiques", count: criticalCount },
    { value: "moderate", label: "Modérées", count: moderateCount },
    { value: "behavioral", label: "Comportement", count: alerts.filter(a => a.category === "behavioral").length },
    { value: "cm", label: "CM", count: alerts.filter(a => a.category === "cm").length },
    { value: "business", label: "Business", count: alerts.filter(a => a.category === "business").length },
    { value: "relational", label: "Relationnel", count: alerts.filter(a => a.category === "relational").length },
    { value: "compliance", label: "Déontologie", count: alerts.filter(a => a.category === "compliance").length },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-primary" />
            Alertes intelligentes
            {criticalCount > 0 && (
              <Badge variant="destructive" className="ml-1 text-[10px] px-1.5 py-0">
                {criticalCount} critique{criticalCount > 1 ? "s" : ""}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Filter className="h-3 w-3" />
            <span>{filtered.length} alerte{filtered.length !== 1 ? "s" : ""}</span>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-1.5 pt-2">
          {filterOptions.filter(o => o.count > 0 || o.value === "all").map(opt => (
            <button
              key={opt.value}
              onClick={() => { setFilter(opt.value); setShowAll(false); }}
              className={cn(
                "text-[11px] px-2 py-0.5 rounded-full border transition-colors",
                filter === opt.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
              )}
            >
              {opt.label} {opt.count > 0 && `(${opt.count})`}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-2.5">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ShieldAlert className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">Aucune alerte active</p>
            <p className="text-xs mt-1">La plateforme fonctionne normalement.</p>
          </div>
        ) : (
          <>
            {visibleAlerts.map(alert => {
              const sev = severityConfig[alert.severity];
              const cat = categoryConfig[alert.category];
              const SevIcon = sev.icon;
              const CatIcon = cat.icon;
              const isExpanded = expandedId === alert.id;

              return (
                <div
                  key={alert.id}
                  className={cn(
                    "border rounded-lg p-4 border-l-4 transition-all cursor-pointer hover:shadow-sm",
                    sev.borderClass
                  )}
                  onClick={() => setExpandedId(isExpanded ? null : alert.id)}
                >
                  <div className="flex items-start gap-3">
                    <SevIcon className={cn("h-5 w-5 shrink-0 mt-0.5", {
                      "text-destructive": alert.severity === "critical",
                      "text-amber-500": alert.severity === "moderate",
                      "text-blue-500": alert.severity === "info",
                    })} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold leading-tight">{alert.title}</p>
                        <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 h-4", sev.badgeClass)}>
                          {sev.label}
                        </Badge>
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 gap-0.5">
                          <CatIcon className="h-2.5 w-2.5" />
                          {cat.label}
                        </Badge>
                      </div>
                      {alert.entityName && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {alert.entityType === "firm" ? "Cabinet" : "CM"} : {alert.entityName}
                        </p>
                      )}

                      {isExpanded && (
                        <div className="mt-3 space-y-2 text-xs">
                          <div className="bg-muted/50 rounded-md p-3 space-y-1.5">
                            <p>
                              <span className="font-semibold text-foreground">Pourquoi : </span>
                              <span className="text-muted-foreground">{alert.reason}</span>
                            </p>
                            <p>
                              <span className="font-semibold text-foreground">Risque : </span>
                              <span className="text-muted-foreground">{alert.risk}</span>
                            </p>
                            <p>
                              <span className="font-semibold text-primary">Action recommandée : </span>
                              <span className="text-foreground">{alert.action}</span>
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {hasMore && !showAll && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setShowAll(true)}
              >
                Voir toutes les alertes ({filtered.length})
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
