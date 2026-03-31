import { AppLayout } from "@/components/layout/AppLayout";
import { BusinessKPICard } from "@/components/admin/business/BusinessKPICard";
import { useAdminKPISaaS } from "@/hooks/admin/useAdminKPISaaS";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DollarSign, Target, Percent, Zap, Clock, TrendingUp, Users, BarChart3,
  Activity, Heart, ArrowDownRight,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Cell, LabelList,
} from "recharts";
import { useState } from "react";

const HEALTH_CONFIG = {
  healthy: { label: "Sain", emoji: "🟢", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
  warning: { label: "À surveiller", emoji: "🟡", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  fragile: { label: "Fragile", emoji: "🔴", color: "text-red-600", bg: "bg-red-50 border-red-200" },
} as const;

function getSaaSHealth(ltvCac: number, churnRate: number, paybackMonths: number, nrr: number) {
  let score = 0;
  if (ltvCac >= 3) score += 2; else if (ltvCac >= 2) score += 1;
  if (churnRate <= 3) score += 2; else if (churnRate <= 5) score += 1;
  if (paybackMonths <= 12) score += 2; else if (paybackMonths <= 18) score += 1;
  if (nrr >= 105) score += 2; else if (nrr >= 95) score += 1;
  if (score >= 6) return "healthy";
  if (score >= 3) return "warning";
  return "fragile";
}

function KPITooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function AdminKPISaaSPage() {
  const d = useAdminKPISaaS();

  if (d.loading) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
          </div>
        </div>
      </AppLayout>
    );
  }

  const health = getSaaSHealth(d.ltvCacRatio, d.grossChurn, d.paybackMonths, d.nrr);
  const hc = HEALTH_CONFIG[health];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
        {/* Header + Health */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">KPIs SaaS</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Unit economics, efficience revenue et métriques investisseur
            </p>
          </div>
          <div className={`flex items-center gap-3 px-5 py-3 rounded-lg border ${hc.bg}`}>
            <span className="text-2xl">{hc.emoji}</span>
            <div>
              <p className="text-xs text-muted-foreground font-medium">SaaS Health Score</p>
              <p className={`text-sm font-bold ${hc.color}`}>{hc.label}</p>
            </div>
          </div>
        </div>

        {/* Unit Economics */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Unit Economics</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
            <KPITooltip label="Valeur vie client basée sur ARPU et churn réel. Benchmark B2B : 5 000–15 000 €">
              <div><BusinessKPICard label="LTV" value={`${d.ltv.toLocaleString()} €`} icon={DollarSign} variation={`ARPU ${d.arpu} € × ${d.avgLifetimeMonths} mois`} /></div>
            </KPITooltip>
            <KPITooltip label="Coût d'acquisition moyen par client. Inclut marketing + commercial">
              <div><BusinessKPICard label="CAC" value={`${d.cac} €`} icon={Target} variation={`${d.totalLeads} leads × 85 €/lead`} /></div>
            </KPITooltip>
            <KPITooltip label="Ratio LTV/CAC. > 3x = sain, > 5x = excellent. Benchmark SaaS : 3–5x">
              <div><BusinessKPICard label="LTV / CAC" value={`${d.ltvCacRatio}x`} icon={Zap} variationPositive={d.ltvCacRatio >= 3} variation={d.ltvCacRatio >= 5 ? "Excellent" : d.ltvCacRatio >= 3 ? "Sain" : "À améliorer"} /></div>
            </KPITooltip>
            <KPITooltip label="Nombre de mois pour récupérer le CAC. Objectif : < 12 mois">
              <div><BusinessKPICard label="Payback Period" value={`${d.paybackMonths} mois`} icon={Clock} variationPositive={d.paybackMonths <= 12} variation={d.paybackMonths <= 12 ? "< 12 mois ✓" : "À optimiser"} /></div>
            </KPITooltip>
            <KPITooltip label="Marge après coûts directs (CM, infra). Objectif SaaS : > 70%">
              <div><BusinessKPICard label="Contribution Margin" value={`${d.contributionMargin}%`} icon={Percent} variationPositive={d.contributionMargin >= 70} variation={d.contributionMargin >= 70 ? "Benchmark atteint" : "Sous benchmark"} /></div>
            </KPITooltip>
          </div>
        </section>

        {/* Revenue Efficiency */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Revenue Efficiency</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPITooltip label="MRR total divisé par le nombre d'employés (équipe). Benchmark : 8–15k €">
              <div><BusinessKPICard label="MRR / employé" value={`${d.mrrPerEmployee.toLocaleString()} €`} icon={Users} /></div>
            </KPITooltip>
            <KPITooltip label="Coût moyen d'un CM rapporté au nombre de cabinets gérés">
              <div><BusinessKPICard label="Coût CM / cabinet" value={`${d.cmCostPerFirm} €`} icon={BarChart3} /></div>
            </KPITooltip>
            <KPITooltip label="Marge brute après coûts infrastructure et services. Objectif : > 75%">
              <div><BusinessKPICard label="Gross Margin" value={`${d.grossMargin}%`} icon={TrendingUp} variationPositive={d.grossMargin >= 75} /></div>
            </KPITooltip>
            <KPITooltip label="Coût d'acquisition ventilé par canal principal">
              <div><BusinessKPICard label="CAC moy. / canal" value={`${d.cacPerChannel} €`} icon={Activity} /></div>
            </KPITooltip>
          </div>
        </section>

        {/* SaaS KPIs */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Indicateurs SaaS avancés</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPITooltip label="Rétention nette du revenu. > 100% = croissance organique. Benchmark : 105–120%">
              <div><BusinessKPICard label="Net Revenue Retention" value={`${d.nrr}%`} icon={Heart} variationPositive={d.nrr >= 100} variation={d.nrr >= 100 ? "Croissance organique" : "Contraction"} /></div>
            </KPITooltip>
            <KPITooltip label="Taux de perte brute de revenu mensuel. Objectif : < 3%">
              <div><BusinessKPICard label="Gross Churn" value={`${d.grossChurn}%`} icon={ArrowDownRight} variationPositive={d.grossChurn <= 3} variation={d.grossChurn <= 3 ? "Sous contrôle" : "À surveiller"} /></div>
            </KPITooltip>
            <KPITooltip label="MRR additionnel généré par montées en gamme. Signe de product-market fit">
              <div><BusinessKPICard label="Expansion MRR" value={`${d.expansionMRR.toLocaleString()} €`} icon={TrendingUp} /></div>
            </KPITooltip>
            <KPITooltip label="Taux d'activation : cabinets avec ≥ 1 publication dans les 30 premiers jours">
              <div><BusinessKPICard label="Activation Rate" value={`${d.activationRate}%`} icon={Zap} variationPositive={d.activationRate >= 75} /></div>
            </KPITooltip>
          </div>
        </section>

        {/* Funnel + Cohorts side by side */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Enhanced Funnel */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Funnel SaaS — Volume & MRR</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={d.funnel} layout="vertical" margin={{ left: 10, right: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                    <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <YAxis dataKey="stage" type="category" width={80} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <RechartsTooltip
                      formatter={(value: number, name: string) =>
                        name === "mrr" ? [`${value.toLocaleString()} €`, "MRR potentiel"] : [value, "Comptes"]
                      }
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} name="count" barSize={20}>
                      {d.funnel.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      <LabelList dataKey="count" position="right" className="text-xs fill-foreground" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Drop-off row */}
              <div className="mt-4 flex flex-wrap gap-2">
                {d.funnel.map((s, i) => {
                  if (i === 0) return null;
                  const prev = d.funnel[i - 1];
                  const dropPct = prev.count > 0 ? Math.round((1 - s.count / prev.count) * 100) : 0;
                  const dropMRR = prev.mrr - s.mrr;
                  return (
                    <Badge key={s.stage} variant="outline" className="text-xs font-normal gap-1">
                      {prev.stage} → {s.stage}: -{dropPct}% ({dropMRR.toLocaleString()} € perdu)
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Cohorts */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Cohortes — Rétention & MRR</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground text-xs">
                      <th className="text-left py-2 font-medium">Cohorte</th>
                      <th className="text-right py-2 font-medium">Cabinets</th>
                      <th className="text-right py-2 font-medium">Rétention</th>
                      <th className="text-right py-2 font-medium">Churn cumulé</th>
                      <th className="text-right py-2 font-medium">MRR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.cohorts.map(c => (
                      <tr key={c.label} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 font-medium">{c.label}</td>
                        <td className="text-right tabular-nums">{c.firms}</td>
                        <td className="text-right tabular-nums">
                          <Badge variant={c.retention >= 85 ? "default" : c.retention >= 70 ? "secondary" : "destructive"} className="text-xs">
                            {c.retention}%
                          </Badge>
                        </td>
                        <td className="text-right tabular-nums text-muted-foreground">{c.churnCumul}%</td>
                        <td className="text-right tabular-nums font-medium">{c.mrr.toLocaleString()} €</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
