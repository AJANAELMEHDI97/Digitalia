import { AppLayout } from "@/components/layout/AppLayout";
import { useAdminBusiness } from "@/hooks/admin/useAdminBusiness";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip, TooltipTrigger, TooltipContent, TooltipProvider,
} from "@/components/ui/tooltip";
import {
  DollarSign, TrendingUp, ShieldAlert, Target,
  Users, CalendarCheck, UserMinus, AlertTriangle, Activity,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

/* ── Status indicator ── */
function BusinessHealthBadge({ growthMoM, mrrAtRisk, mrr }: { growthMoM: number; mrrAtRisk: number; mrr: number }) {
  const riskRatio = mrr > 0 ? mrrAtRisk / mrr : 0;
  const status = riskRatio > 0.15
    ? { label: "Risque MRR", color: "bg-destructive/10 text-destructive border-destructive/20" }
    : growthMoM < 2
    ? { label: "Croissance fragile", color: "bg-amber-500/10 text-amber-700 border-amber-500/20" }
    : { label: "Croissance saine", color: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" };

  return (
    <Badge variant="outline" className={cn("text-xs font-semibold px-3 py-1 gap-1.5", status.color)}>
      <span className={cn(
        "inline-block h-2 w-2 rounded-full",
        riskRatio > 0.15 ? "bg-destructive" : growthMoM < 2 ? "bg-amber-500" : "bg-emerald-500"
      )} />
      {status.label}
    </Badge>
  );
}

import { AdminKPICard as StatCard, AdminSectionTitle } from "@/components/admin/shared/AdminUI";
function SectionHeader({ title, icon }: { title: string; icon: React.ComponentType<{ className?: string }> }) {
  return <AdminSectionTitle title={title} icon={icon} />;
}

const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1).replace(".0", "")}k €` : `${n.toLocaleString("fr-FR")} €`;

export default function AdminBusinessPage() {
  const {
    mrr, growthMoM, testAccounts, convertedThisMonth, churnRate, mrrAtRisk,
    mrrHistory, conversionFunnel, churnHistory, loading,
  } = useAdminBusiness();
  const { stats } = useAdminDashboard();

  const projection3m = Math.round(mrr * (1 + growthMoM / 100) ** 3);

  // Build chart data with projection zone
  const chartData = useMemo(() => {
    if (!mrrHistory.length) return [];
    const base = mrrHistory.map(h => ({ ...h, projection: null as number | null, atRisk: null as number | null }));
    const last = base[base.length - 1];
    const growthFactor = 1 + growthMoM / 100;
    for (let i = 1; i <= 3; i++) {
      const projected = Math.round(last.mrr * growthFactor ** i);
      base.push({
        month: `M+${i}`,
        mrr: 0,
        projection: projected,
        atRisk: Math.round(projected * (mrrAtRisk / (mrr || 1))),
      });
    }
    // Connect projection line to last real point
    base[mrrHistory.length - 1].projection = last.mrr;
    return base;
  }, [mrrHistory, growthMoM, mrrAtRisk, mrr]);

  // Demo acquisition data
  const leadsMonth = stats.acquisition?.leadsMonth ?? 45;
  const demosCompleted = stats.demosCompleted ?? 18;
  const conversionRate = stats.acquisition?.conversionRate ?? 12;
  const mrrFromAcq = Math.round(convertedThisMonth * (mrr / Math.max(stats.activeFirms, 1)));

  // Demo retention data
  const atRiskChurn = stats.clientHealth?.atRiskChurn ?? 4;
  const decliningActivity = stats.clientHealth?.decliningActivity ?? 6;
  const potentialLostMRR = Math.round(mrrAtRisk * 0.6);

  return (
    <AppLayout>
      <TooltipProvider delayDuration={200}>
        <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Vue d'ensemble Business</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Cockpit stratégique — revenus, croissance et risque</p>
            </div>
            {!loading && <BusinessHealthBadge growthMoM={growthMoM} mrrAtRisk={mrrAtRisk} mrr={mrr} />}
          </div>

          {/* ── ZONE 1 — Statut Business ── */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label="MRR global"
                value={fmt(mrr)}
                icon={DollarSign}
                tooltip="Revenu mensuel récurrent total de l'ensemble des cabinets actifs. Indicateur clé de la santé financière de la plateforme."
              />
              <StatCard
                label="Croissance MoM"
                value={`${growthMoM > 0 ? "+" : ""}${growthMoM}%`}
                icon={TrendingUp}
                positive={growthMoM > 0}
                alert={growthMoM < 0}
                tooltip={growthMoM > 5
                  ? `Croissance solide de ${growthMoM}% par rapport au mois précédent. Le rythme d'acquisition dépasse le churn.`
                  : growthMoM > 0
                  ? `Croissance modérée de ${growthMoM}%. Surveillez le ratio acquisition/churn pour maintenir la dynamique.`
                  : `Croissance négative : le MRR recule de ${Math.abs(growthMoM)}%. Action corrective nécessaire sur la rétention ou l'acquisition.`
                }
              />
              <StatCard
                label="MRR à risque"
                value={fmt(mrrAtRisk)}
                sub={mrr > 0 ? `${Math.round((mrrAtRisk / mrr) * 100)}% du MRR` : undefined}
                icon={ShieldAlert}
                alert={mrrAtRisk > 0}
                tooltip={`Montant du MRR menacé par les retards de paiement et les comptes à risque de résiliation. ${
                  mrr > 0 && (mrrAtRisk / mrr) > 0.1
                    ? "Seuil critique dépassé (>10%) — prioriser les relances et le suivi client."
                    : "Niveau acceptable, mais à surveiller mensuellement."
                }`}
              />
              <StatCard
                label="Projection 3 mois"
                value={fmt(projection3m)}
                sub={`${growthMoM > 0 ? "+" : ""}${Math.round(((projection3m - mrr) / Math.max(mrr, 1)) * 100)}% vs actuel`}
                icon={Target}
                positive={projection3m > mrr}
                tooltip={`Estimation du MRR dans 3 mois basée sur le taux de croissance actuel (${growthMoM}%/mois). ${
                  projection3m > mrr
                    ? `Trajectoire positive : +${fmt(projection3m - mrr)} attendus.`
                    : "Trajectoire négative : le MRR risque de diminuer sans intervention."
                }`}
              />
            </div>
          )}

          {/* ── ZONE 2 — Croissance & Projection ── */}
          <div>
            <SectionHeader title="Croissance & Projection" icon={TrendingUp} />
            <Card className="mt-3">
              <CardContent className="pt-5">
                {loading ? <Skeleton className="h-56 w-full rounded" /> : (
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
                        <defs>
                          <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.06} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.12} />
                            <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" opacity={0.4} />
                        <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                        <RTooltip
                          contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                          formatter={(v: number, name: string) => {
                            if (!v) return [null, null];
                            const label = name === "mrr" ? "MRR" : name === "projection" ? "Projection" : "À risque";
                            return [`${v.toLocaleString("fr-FR")} €`, label];
                          }}
                        />
                        <Area type="monotone" dataKey="mrr" stroke="hsl(var(--primary))" fill="url(#mrrGrad)" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 0 }} connectNulls={false} />
                        <Area type="monotone" dataKey="projection" stroke="hsl(var(--primary))" strokeDasharray="6 3" fill="url(#projGrad)" strokeWidth={1.5} dot={false} connectNulls />
                        <Area type="monotone" dataKey="atRisk" stroke="hsl(0, 84%, 60%)" strokeDasharray="4 4" fill="url(#riskGrad)" strokeWidth={1} dot={false} connectNulls />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <div className="flex items-center gap-6 mt-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="h-0.5 w-4 bg-primary rounded" /> MRR réel
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-0.5 w-4 rounded" style={{ borderTop: "1.5px dashed hsl(var(--primary))", background: "none" }} /> Projection
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-0.5 w-4 rounded" style={{ borderTop: "1.5px dashed hsl(0, 84%, 60%)", background: "none" }} /> MRR à risque
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── ZONE 3 — Acquisition & Conversion ── */}
          <div>
            <SectionHeader title="Acquisition & Conversion" icon={Users} />
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-3">
                <StatCard
                  label="Leads 30 jours"
                  value={String(leadsMonth)}
                  icon={Users}
                  tooltip={`${leadsMonth} nouveaux leads entrants ce mois. ${leadsMonth > 40 ? "Volume solide — focus sur la qualification." : "Volume modéré — envisagez d'élargir les canaux d'acquisition."}`}
                />
                <StatCard
                  label="Démos réalisées"
                  value={String(demosCompleted)}
                  icon={CalendarCheck}
                  positive={demosCompleted > 0}
                  tooltip={`${demosCompleted} démonstrations effectuées. Taux de show-up : ${leadsMonth > 0 ? Math.round((demosCompleted / leadsMonth) * 100) : 0}%. ${demosCompleted > 15 ? "Bonne cadence commerciale." : "Envisagez d'augmenter le taux de conversion lead → démo."}`}
                />
                <StatCard
                  label="Taux conversion"
                  value={`${conversionRate}%`}
                  icon={Target}
                  positive={conversionRate >= 10}
                  tooltip={`${conversionRate}% des leads deviennent clients payants. ${conversionRate >= 15 ? "Excellent — au-dessus des standards SaaS B2B." : conversionRate >= 10 ? "Dans la norme SaaS B2B (10-15%)." : "En dessous des standards — optimisez le funnel de conversion."}`}
                />
                <StatCard
                  label="Nouveaux comptes"
                  value={String(convertedThisMonth)}
                  icon={Activity}
                  positive={convertedThisMonth > 0}
                  tooltip={`${convertedThisMonth} nouveaux comptes payants ce mois. ${convertedThisMonth >= 3 ? "Rythme d'acquisition soutenu." : "Rythme faible — vérifiez les blocages dans le cycle de vente."}`}
                />
                <StatCard
                  label="MRR acquisition"
                  value={fmt(mrrFromAcq)}
                  sub="Généré ce mois"
                  icon={DollarSign}
                  positive={mrrFromAcq > 0}
                  tooltip={`Nouveau MRR généré par les comptes acquis ce mois. Représente ${mrr > 0 ? Math.round((mrrFromAcq / mrr) * 100) : 0}% du MRR total — mesure l'efficacité de l'acquisition sur le revenu.`}
                />
              </div>
            )}
          </div>

          {/* ── ZONE 4 — Rétention & Risque ── */}
          <div>
            <SectionHeader title="Rétention & Risque" icon={AlertTriangle} />
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                <StatCard
                  label="Churn mensuel"
                  value={`${churnRate}%`}
                  sub={churnRate > 5 ? "Seuil critique dépassé" : "Dans les normes"}
                  icon={UserMinus}
                  alert={churnRate > 5}
                  tooltip={`Taux de résiliation mensuel : ${churnRate}%. ${churnRate > 8 ? "Critique — le churn dépasse largement le seuil acceptable (5%). Intervention urgente sur la rétention." : churnRate > 5 ? "Au-dessus du seuil recommandé (5%). Renforcez le suivi des comptes fragiles." : "Niveau sain pour un SaaS B2B. Maintenez la qualité de service."}`}
                />
                <StatCard
                  label="Comptes à risque"
                  value={String(atRiskChurn)}
                  icon={ShieldAlert}
                  alert={atRiskChurn > 2}
                  tooltip={`${atRiskChurn} cabinets présentent des signaux de désengagement (baisse d'activité, retards de paiement). ${atRiskChurn > 3 ? "Nombre élevé — déclenchez des actions de rétention ciblées." : "Nombre gérable — programmez un suivi personnalisé."}`}
                />
                <StatCard
                  label="Comptes inactifs"
                  value={String(decliningActivity)}
                  sub="Activité en baisse"
                  icon={Activity}
                  alert={decliningActivity > 4}
                  tooltip={`${decliningActivity} cabinets montrent une baisse significative d'activité sur 30 jours. ${decliningActivity > 5 ? "Signal fort de désengagement — contactez ces comptes proactivement avant qu'ils ne churent." : "À surveiller. Un CM dédié peut relancer l'engagement."}`}
                />
                <StatCard
                  label="MRR potentiel perdu"
                  value={fmt(potentialLostMRR)}
                  sub={mrr > 0 ? `${Math.round((potentialLostMRR / mrr) * 100)}% du MRR` : undefined}
                  icon={DollarSign}
                  alert={potentialLostMRR > 0}
                  tooltip={`Estimation du revenu mensuel qui pourrait être perdu si les comptes à risque résilient. ${mrr > 0 && (potentialLostMRR / mrr) > 0.05 ? `Représente ${Math.round((potentialLostMRR / mrr) * 100)}% du MRR — impact significatif sur les revenus.` : "Impact limité mais à anticiper pour protéger la base de revenus."}`}
                />
              </div>
            )}
          </div>
        </div>
      </TooltipProvider>
    </AppLayout>
  );
}
