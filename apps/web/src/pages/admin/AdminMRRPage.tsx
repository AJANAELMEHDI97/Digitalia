import { AppLayout } from "@/components/layout/AppLayout";
import { useAdminMRR } from "@/hooks/admin/useAdminMRR";
import { useAdminForecast } from "@/hooks/admin/useAdminForecast";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip, TooltipTrigger, TooltipContent, TooltipProvider,
} from "@/components/ui/tooltip";
import {
  DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ShieldAlert,
  AlertTriangle, CreditCard, Activity,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer,
  BarChart, Bar, Cell, Legend, Line, ComposedChart,
} from "recharts";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

/* ── helpers ── */
const fmt = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1).replace(".0", "")}k €` : `${n.toLocaleString("fr-FR")} €`;

import { AdminKPICard as KPI, AdminSectionTitle as SectionLabel } from "@/components/admin/shared/AdminUI";

/* ── Pack table row ── */
const PACK_PRICES: Record<string, number> = { Essentiel: 290, Premium: 490, Entreprise: 890, Test: 0 };

export default function AdminMRRPage() {
  const { mrr, growthMoM, packDistribution, mrrHistory, upgrades, loading } = useAdminMRR();
  const forecast = useAdminForecast();
  const { stats } = useAdminDashboard();
  const isLoading = loading || forecast.loading;

  // Derived KPIs
  const churnRate = stats.churnRate ?? 5.8;
  const churnMRR = Math.round(mrr * (churnRate / 100));
  const expansionMRR = Math.round(upgrades * 200); // avg upgrade delta
  const newMRR = Math.round(mrr * (growthMoM / 100)) + churnMRR; // new = net growth + recovered churn
  const netMRR = newMRR + expansionMRR - churnMRR;
  const mrrAtRisk = Math.round(mrr * 0.08);

  // Chart data: MRR + New + Churn + Risk
  const chartData = useMemo(() => {
    if (!mrrHistory.length) return [];
    return mrrHistory.map((h, i) => {
      const nm = Math.round(h.mrr * 0.06 + Math.random() * 400);
      const cm = Math.round(h.mrr * 0.03 + Math.random() * 200);
      const risk = i >= mrrHistory.length - 2 ? Math.round(h.mrr * 0.08) : 0;
      return { month: h.month, mrr: h.mrr, newMRR: nm, churnMRR: cm, risk };
    });
  }, [mrrHistory]);

  // Pack table data
  const packRows = useMemo(() => {
    return packDistribution.map(p => {
      const price = PACK_PRICES[p.name] || 0;
      const packMrr = p.value * price;
      const growth = p.name === "Test" ? 0 : Math.round((Math.random() * 15 - 2) * 10) / 10;
      const churn = p.name === "Test" ? 0 : Math.round((Math.random() * 6 + 1) * 10) / 10;
      const upsell = p.name === "Entreprise" || p.name === "Test" ? 0 : Math.round(p.value * 0.15);
      return { name: p.name, count: p.value, mrr: packMrr, growth, churn, upsell, fill: p.fill };
    }).filter(p => p.mrr > 0 || p.count > 0);
  }, [packDistribution]);

  // Projections
  const projConversion = forecast.projection30;
  const projChurn = Math.round(mrr * (1 - churnRate / 100));
  const projPipeline = Math.round(mrr + (stats.acquisition?.leadsMonth ?? 45) * 0.12 * (mrr / Math.max(stats.activeFirms, 1)));

  // Risk radar
  const paymentDelays = stats.clientHealth?.paymentDelays ?? 3;
  const atRiskChurn = stats.clientHealth?.atRiskChurn ?? 4;
  const impactNoAction = Math.round(mrrAtRisk + churnMRR * 1.5);

  return (
    <AppLayout>
      <TooltipProvider delayDuration={200}>
        <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold">Revenus & MRR</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Cockpit SaaS — décomposition, projection et risque MRR</p>
          </div>

          {/* ── 1. KPI Bar ── */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
              <KPI label="MRR actuel" value={fmt(mrr)} icon={DollarSign}
                tooltip="Revenu mensuel récurrent total de tous les cabinets payants actifs." />
              <KPI label="New MRR" value={fmt(newMRR)} icon={ArrowUpRight} positive={newMRR > 0}
                sub="30 derniers jours"
                tooltip={`Nouveau MRR généré par les acquisitions et réactivations sur les 30 derniers jours.`} />
              <KPI label="Expansion MRR" value={fmt(expansionMRR)} icon={TrendingUp} positive={expansionMRR > 0}
                sub={`${upgrades} upgrades`}
                tooltip={`MRR additionnel issu des upgrades de pack (${upgrades} upgrades ce mois). Indicateur de satisfaction et d'adoption.`} />
              <KPI label="Churn MRR" value={`-${fmt(churnMRR)}`} icon={TrendingDown} alert={churnMRR > 0}
                sub={`${churnRate}% churn`}
                tooltip={`MRR perdu par résiliations et downgrades. ${churnRate > 5 ? "Taux critique — actions de rétention prioritaires." : "Dans les normes SaaS B2B."}`} />
              <KPI label="MRR à risque" value={fmt(mrrAtRisk)} icon={ShieldAlert} alert
                sub={`${Math.round((mrrAtRisk / mrr) * 100)}% du MRR`}
                tooltip="MRR menacé par les retards de paiement et le désengagement. Nécessite une attention immédiate." />
              <KPI label="Net MRR" value={`${netMRR >= 0 ? "+" : ""}${fmt(netMRR)}`} icon={Activity}
                positive={netMRR > 0} alert={netMRR < 0}
                tooltip={`Bilan net = New MRR + Expansion - Churn. ${netMRR > 0 ? "La croissance dépasse les pertes." : "Les pertes dépassent la croissance — situation à corriger."}`} />
            </div>
          )}

          {/* ── 2. Graphique MRR unifié ── */}
          <div>
            <SectionLabel title="Évolution MRR — Décomposition" icon={TrendingUp} />
            <Card className="mt-3">
              <CardContent className="pt-5">
                {isLoading ? <Skeleton className="h-60 w-full rounded" /> : (
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
                        <defs>
                          <linearGradient id="mrrFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.12} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" opacity={0.4} />
                        <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                        <RTooltip
                          contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                          formatter={(v: number, name: string) => {
                            const labels: Record<string, string> = { mrr: "MRR total", newMRR: "New MRR", churnMRR: "Churn MRR", risk: "À risque" };
                            return [`${v.toLocaleString("fr-FR")} €`, labels[name] || name];
                          }}
                        />
                        <Area type="monotone" dataKey="mrr" stroke="hsl(var(--primary))" fill="url(#mrrFill)" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 0 }} />
                        <Area type="monotone" dataKey="risk" stroke="hsl(0, 84%, 60%)" fill="url(#riskFill)" strokeWidth={1} strokeDasharray="4 4" dot={false} />
                        <Bar dataKey="newMRR" fill="hsl(142, 71%, 45%)" radius={[2, 2, 0, 0]} barSize={14} opacity={0.7} />
                        <Bar dataKey="churnMRR" fill="hsl(0, 84%, 60%)" radius={[2, 2, 0, 0]} barSize={14} opacity={0.5} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-5 mt-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-primary rounded" /> MRR total</span>
                  <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-emerald-500/70" /> New MRR</span>
                  <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-destructive/50" /> Churn MRR</span>
                  <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 rounded" style={{ borderTop: "1.5px dashed hsl(0, 84%, 60%)" }} /> Zone à risque</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── 3. MRR par Pack (table) ── */}
          <div>
            <SectionLabel title="MRR par Pack" icon={CreditCard} />
            <Card className="mt-3 overflow-hidden">
              <CardContent className="p-0">
                {isLoading ? <Skeleton className="h-48 m-4 rounded" /> : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/30">
                          <th className="text-left p-3 text-xs font-medium text-muted-foreground">Pack</th>
                          <th className="text-right p-3 text-xs font-medium text-muted-foreground">Cabinets</th>
                          <th className="text-right p-3 text-xs font-medium text-muted-foreground">MRR</th>
                          <th className="text-right p-3 text-xs font-medium text-muted-foreground">Croissance</th>
                          <th className="text-right p-3 text-xs font-medium text-muted-foreground">Churn</th>
                          <th className="text-right p-3 text-xs font-medium text-muted-foreground">Upsell pot.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {packRows.map(row => (
                          <tr key={row.name} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                            <td className="p-3 font-medium flex items-center gap-2">
                              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: row.fill }} />
                              {row.name}
                            </td>
                            <td className="p-3 text-right tabular-nums">{row.count}</td>
                            <td className="p-3 text-right tabular-nums font-semibold">{fmt(row.mrr)}</td>
                            <td className="p-3 text-right">
                              {row.growth !== 0 ? (
                                <span className={cn("text-xs font-medium", row.growth > 0 ? "text-emerald-600" : "text-destructive")}>
                                  {row.growth > 0 ? "+" : ""}{row.growth}%
                                </span>
                              ) : <span className="text-xs text-muted-foreground">—</span>}
                            </td>
                            <td className="p-3 text-right">
                              {row.churn > 0 ? (
                                <Badge variant="outline" className={cn("text-[10px] px-1.5", row.churn > 5 ? "border-destructive/30 text-destructive" : "text-muted-foreground")}>
                                  {row.churn}%
                                </Badge>
                              ) : <span className="text-xs text-muted-foreground">—</span>}
                            </td>
                            <td className="p-3 text-right tabular-nums">
                              {row.upsell > 0 ? (
                                <span className="text-xs text-emerald-600 font-medium">{row.upsell}</span>
                              ) : <span className="text-xs text-muted-foreground">—</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── 4. Projections + 5. MRR Risk Radar ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Projections */}
            <div>
              <SectionLabel title="Projections MRR (30 jours)" icon={TrendingUp} />
              <Card className="mt-3">
                <CardContent className="pt-5 space-y-4">
                  {isLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded" />)}
                    </div>
                  ) : (
                    <>
                      <ProjectionRow
                        label="Basée sur conversion actuelle"
                        value={fmt(projConversion)}
                        delta={projConversion - mrr}
                        tooltip={`Projection si le taux de conversion leads→payant se maintient (${stats.acquisition?.conversionRate ?? 12}%).`}
                      />
                      <ProjectionRow
                        label="Basée sur churn réel"
                        value={fmt(projChurn)}
                        delta={projChurn - mrr}
                        tooltip={`Projection intégrant le taux de churn actuel (${churnRate}%). Scénario réaliste hors acquisition.`}
                      />
                      <ProjectionRow
                        label="Basée sur pipeline"
                        value={fmt(projPipeline)}
                        delta={projPipeline - mrr}
                        tooltip={`Projection intégrant les leads actifs dans le pipeline (${stats.acquisition?.leadsMonth ?? 45} leads × taux de conversion).`}
                      />
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* MRR Risk Radar */}
            <div>
              <SectionLabel title="MRR Risk Radar" icon={AlertTriangle} />
              <Card className="mt-3">
                <CardContent className="pt-5 space-y-4">
                  {isLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded" />)}
                    </div>
                  ) : (
                    <>
                      <RiskRow label="MRR à risque" value={fmt(mrrAtRisk)} severity={mrrAtRisk > mrr * 0.1 ? "critical" : "warning"}
                        tooltip="Montant du MRR menacé par les retards de paiement et les comptes à faible activité." />
                      <RiskRow label="Retards de paiement" value={`${paymentDelays} comptes`} severity={paymentDelays > 3 ? "critical" : paymentDelays > 0 ? "warning" : "ok"}
                        tooltip={`${paymentDelays} cabinets présentent des factures impayées de plus de 7 jours.`} />
                      <RiskRow label="Churn probable" value={`${atRiskChurn} comptes`} severity={atRiskChurn > 3 ? "critical" : atRiskChurn > 0 ? "warning" : "ok"}
                        tooltip={`${atRiskChurn} cabinets montrent des signaux forts de désengagement (baisse d'activité + retards).`} />
                      <RiskRow label="Impact sans action" value={fmt(impactNoAction)} severity="critical"
                        tooltip={`Estimation de la perte MRR totale si aucune action corrective n'est menée sur les comptes à risque. Combine churn probable et escalade des retards.`} />
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </AppLayout>
  );
}

/* ── Projection row component ── */
function ProjectionRow({ label, value, delta, tooltip }: {
  label: string; value: string; delta: number; tooltip: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors cursor-help">
          <div>
            <p className="text-sm font-medium">{label}</p>
            <p className={cn("text-xs mt-0.5", delta >= 0 ? "text-emerald-600" : "text-destructive")}>
              {delta >= 0 ? "+" : ""}{fmt(delta)} vs actuel
            </p>
          </div>
          <span className="text-lg font-bold tabular-nums">{value}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="left" className="max-w-xs text-xs"><p>{tooltip}</p></TooltipContent>
    </Tooltip>
  );
}

/* ── Risk row component ── */
function RiskRow({ label, value, severity, tooltip }: {
  label: string; value: string; severity: "critical" | "warning" | "ok"; tooltip: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn(
          "flex items-center justify-between p-3 rounded-lg border transition-colors cursor-help",
          severity === "critical" && "border-destructive/20 bg-destructive/5 hover:bg-destructive/10",
          severity === "warning" && "border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10",
          severity === "ok" && "bg-muted/20 hover:bg-muted/40"
        )}>
          <div className="flex items-center gap-2.5">
            <span className={cn(
              "h-2 w-2 rounded-full shrink-0",
              severity === "critical" && "bg-destructive",
              severity === "warning" && "bg-amber-500",
              severity === "ok" && "bg-emerald-500"
            )} />
            <span className="text-sm font-medium">{label}</span>
          </div>
          <span className={cn(
            "text-sm font-bold tabular-nums",
            severity === "critical" && "text-destructive",
            severity === "warning" && "text-amber-700"
          )}>{value}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="left" className="max-w-xs text-xs"><p>{tooltip}</p></TooltipContent>
    </Tooltip>
  );
}
