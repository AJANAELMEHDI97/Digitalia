import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useSimpleRole } from "@/hooks/useSimpleRole";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Building2, Search } from "lucide-react";

import { useAdminFirms, GlobalStatus, PaymentStatus, ChurnRiskLevel } from "@/hooks/useAdminFirms";
import type { AdminFirmEnriched } from "@/hooks/useAdminFirms";
import { AdminFirmDetailSheet } from "@/components/admin/AdminFirmDetailSheet";
import { FirmsSummaryCards } from "@/components/admin/firms/FirmsSummaryCards";
import { FirmsPriorityBlock } from "@/components/admin/firms/FirmsPriorityBlock";
import { cn } from "@/lib/utils";
import type { QuickFilter } from "@/components/admin/firms/types";

const statusConfig: Record<GlobalStatus, { label: string; className: string }> = {
  actif: { label: "Actif", className: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400" },
  "à_surveiller": { label: "À surveiller", className: "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400" },
  "à_risque": { label: "À risque", className: "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400" },
};

const paymentBadge: Record<PaymentStatus, { label: string; className: string }> = {
  "à_jour": { label: "OK", className: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400" },
  retard: { label: "Retard", className: "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400" },
  "bloqué": { label: "Bloqué", className: "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400" },
};

const churnConfig: Record<ChurnRiskLevel, { label: string; className: string; dot: string }> = {
  low: { label: "Faible", className: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
  moderate: { label: "Modéré", className: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
  high: { label: "Élevé", className: "text-red-600 dark:text-red-400 font-semibold", dot: "bg-red-500" },
};

function getAction(firm: AdminFirmEnriched): { label: string; className: string } {
  if (firm.paymentStatus === "bloqué") return { label: "Contacter", className: "text-red-600 dark:text-red-400" };
  if (firm.churnRiskData.level === "high") return { label: "Point stratégique", className: "text-amber-600 dark:text-amber-400" };
  if (firm.activityLevel === "faible" && !firm.cm_name) return { label: "Assigner CM", className: "text-blue-600 dark:text-blue-400" };
  if (firm.activityLevel === "faible") return { label: "Relancer", className: "text-amber-600 dark:text-amber-400" };
  if (firm.upsellPotential) return { label: "Upgrade", className: "text-emerald-600 dark:text-emerald-400" };
  return { label: "—", className: "text-muted-foreground" };
}

const quickFilters: { key: QuickFilter; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "at_risk", label: "À risque" },
  { key: "churn_risk", label: "Churn" },
  { key: "payment_issue", label: "Paiement" },
  { key: "inactive", label: "Inactifs" },
  { key: "no_cm", label: "Sans CM" },
];

export default function AdminFirmsPage() {
  const { isAdmin, loading: roleLoading } = useSimpleRole();
  const { data: firms, isLoading } = useAdminFirms();

  const [search, setSearch] = useState("");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [selectedFirm, setSelectedFirm] = useState<AdminFirmEnriched | null>(null);

  const filtered = useMemo(() => {
    if (!firms) return [];
    let list = firms;

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(f =>
        f.name.toLowerCase().includes(q) ||
        f.city?.toLowerCase().includes(q) ||
        f.bar_association?.toLowerCase().includes(q) ||
        f.cm_name?.toLowerCase().includes(q)
      );
    }

    switch (quickFilter) {
      case "at_risk": list = list.filter(f => f.globalStatus === "à_risque"); break;
      case "blocking": list = list.filter(f => f.behaviorBadge === "bloquant"); break;
      case "inactive": list = list.filter(f => f.behaviorBadge === "inactif" || f.activityLevel === "faible"); break;
      case "payment_issue": list = list.filter(f => f.paymentStatus !== "à_jour"); break;
      case "no_cm": list = list.filter(f => !f.cm_name); break;
      case "churn_risk": list = list.filter(f => f.churnRiskData.level !== "low"); break;
    }

    return list;
  }, [firms, search, quickFilter]);

  if (!roleLoading && !isAdmin) return <Navigate to="/dashboard" replace />;

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header + Search inline */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Cabinets</h1>
            <p className="text-muted-foreground text-xs">Pilotage et supervision</p>
          </div>
          <div className="flex items-center gap-2">
            
            <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Rechercher…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
            </div>
          </div>
        </div>

        {/* Summary KPIs (3 cards) */}
        {firms && firms.length > 0 && (
          <FirmsSummaryCards firms={firms} onFilter={setQuickFilter} activeFilter={quickFilter} />
        )}

        {/* Priority block (collapsible) */}
        {firms && firms.length > 0 && (
          <FirmsPriorityBlock firms={firms} onSelectFirm={setSelectedFirm} onFilter={setQuickFilter} />
        )}

        {/* Table */}
        <Card className="border-border/50">
          <CardHeader className="pb-3 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Building2 className="h-4 w-4 text-primary" />
                {filtered.length} cabinet{filtered.length !== 1 ? "s" : ""}
              </CardTitle>
              <div className="flex gap-1.5 flex-wrap">
                {quickFilters.map(f => (
                  <button
                    key={f.key}
                    onClick={() => setQuickFilter(f.key)}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors",
                      quickFilter === f.key
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-2">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/40 hover:bg-transparent">
                      <TableHead className="min-w-[140px] text-[11px] uppercase tracking-wider text-muted-foreground/60 font-medium h-9 pl-4">Cabinet</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground/60 font-medium h-9">CM</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground/60 font-medium h-9">Statut</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground/60 font-medium h-9">Churn</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground/60 font-medium h-9">Paiement</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground/60 font-medium h-9 text-right pr-4">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((firm, idx) => {
                      const status = statusConfig[firm.globalStatus];
                      const payment = paymentBadge[firm.paymentStatus];
                      const churn = churnConfig[firm.churnRiskData.level];
                      const action = getAction(firm);

                      return (
                        <TableRow
                          key={firm.id}
                          className={cn(
                            "cursor-pointer transition-colors h-11 border-b border-border/30",
                            idx % 2 === 1 && "bg-muted/10",
                            "hover:bg-muted/30"
                          )}
                          onClick={() => setSelectedFirm(firm)}
                        >
                          <TableCell className="text-sm font-medium text-foreground py-2 pl-4">{firm.name}</TableCell>
                          <TableCell className="py-2">
                            {firm.cm_name ? (
                              <span className="flex items-center gap-1.5 text-xs text-foreground/70">
                                <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", firm.cm_is_online ? "bg-green-500" : "bg-muted-foreground/30")} />
                                {firm.cm_name}
                              </span>
                            ) : (
                              <span className="text-xs text-amber-500">—</span>
                            )}
                          </TableCell>
                          <TableCell className="py-2">
                            <Badge className={cn(status.className, "text-[10px] px-1.5 py-0")} variant="secondary">{status.label}</Badge>
                          </TableCell>
                          <TableCell className="py-2">
                            <span className={cn("text-[11px] flex items-center gap-1", churn.className)}>
                              <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", churn.dot)} />
                              {churn.label}
                            </span>
                          </TableCell>
                          <TableCell className="py-2">
                            <Badge className={cn(payment.className, "text-[10px] px-1.5 py-0")} variant="secondary">{payment.label}</Badge>
                          </TableCell>
                          <TableCell className="py-2 text-right pr-4">
                            <span className={cn("text-[11px] font-medium", action.className)}>{action.label}</span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                          Aucun cabinet trouvé
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AdminFirmDetailSheet
        firm={selectedFirm}
        open={!!selectedFirm}
        onOpenChange={(open) => { if (!open) setSelectedFirm(null); }}
      />
    </AppLayout>
  );
}
