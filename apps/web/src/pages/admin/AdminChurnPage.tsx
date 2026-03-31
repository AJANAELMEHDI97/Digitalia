import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAdminChurn, type RiskFirm } from "@/hooks/admin/useAdminChurn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip, TooltipTrigger, TooltipContent, TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  TrendingDown, AlertTriangle, ShieldAlert, DollarSign, UserCheck,
  ArrowRight, HelpCircle, Calendar, Users, CreditCard, CheckCircle2,
  TrendingUp, Target, BarChart3, Shield,
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer,
  Cell, Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { ContextMessageButton } from "@/components/admin/coordination/ContextMessageButton";

// ── Constants ──
const PLAN_MRR: Record<string, number> = {
  essentiel: 290, premium: 490, solo: 190, trial: 0, test: 0, entreprise: 890,
};

const getMRR = (plan: string) => PLAN_MRR[plan.toLowerCase()] ?? 290;

const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1).replace(".0", "")}k €` : `${n} €`;

const RECOMMENDATION: Record<string, string> = {
  "Inactivité prolongée": "Planifier RDV rétention",
  "Retard paiement": "Relancer paiement",
  "Refus répétés": "Revoir ligne éditoriale",
  "Pas de RDV CM": "Programmer suivi CM",
  "Faible activité": "Proposer accompagnement",
};

import { AdminKPICard as KPICard } from "@/components/admin/shared/AdminUI";

function PriorityBadge({ score }: { score: number }) {
  if (score >= 70) return <Badge variant="destructive" className="text-xs">Haute</Badge>;
  if (score >= 40) return <Badge variant="secondary" className="text-xs">Moyenne</Badge>;
  return <Badge variant="outline" className="text-xs">Faible</Badge>;
}

function scoreBadge(score: number) {
  if (score >= 70) return "destructive" as const;
  if (score >= 40) return "secondary" as const;
  return "outline" as const;
}

// ── Main Page ──
export default function AdminChurnPage() {
  const {
    loading, churnRate, highRiskCount, mediumRiskCount, mrrAtRisk, recoveredCount,
    actionItems, riskFirms, churnHistory, churnByPack, causes, financialImpact,
  } = useAdminChurn();

  const [treatedIds, setTreatedIds] = useState<Set<string>>(new Set());

  const toggleTreated = (id: string) => {
    setTreatedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Derived data ──
  const derived = useMemo(() => {
    const enrichedFirms = riskFirms.map((f) => {
      const mrr = getMRR(f.plan);
      return {
        ...f,
        mrr,
        financialImpact: Math.round(mrr * f.score / 100),
        recommendation: RECOMMENDATION[f.mainRisk] ?? "Analyser la situation",
      };
    });

    const totalMRRAtRisk = enrichedFirms.filter((f) => f.score >= 60).reduce((s, f) => s + f.mrr, 0);
    const recoverableMRR = Math.round(totalMRRAtRisk * 0.7);
    const top5 = enrichedFirms.slice(0, 5);
    const projection30j = enrichedFirms.filter((f) => f.score >= 70).reduce((s, f) => s + f.mrr, 0);

    // SaaS KPIs (deterministic demo)
    const totalActiveMRR = Math.max(totalMRRAtRisk * 4, 12000);
    const churnMRR = Math.round(totalActiveMRR * (churnRate / 100));
    const expansionMRR = Math.round(totalActiveMRR * 0.035);
    const nrr = Math.round(((totalActiveMRR + expansionMRR - churnMRR) / totalActiveMRR) * 1000) / 10;
    const grossChurn = Math.round((churnMRR / totalActiveMRR) * 1000) / 10;

    // Cohort retention (demo)
    const cohorts = [
      { label: "< 3 mois", retention: 78, fill: "hsl(var(--primary))" },
      { label: "3-12 mois", retention: 89, fill: "hsl(210, 70%, 55%)" },
      { label: "> 12 mois", retention: 96, fill: "hsl(142, 71%, 45%)" },
    ];

    // MRR exposed by cause
    const mrrByCause = causes.map((c) => {
      const affectedFirms = enrichedFirms.filter((f) => {
        if (c.cause === "Inactivité prolongée") return f.factors.activity >= 80;
        if (c.cause === "Retards paiement") return f.factors.payment >= 80;
        if (c.cause === "Refus répétés") return f.factors.refusal >= 80;
        if (c.cause === "Absence de suivi CM") return f.factors.cm >= 60;
        return false;
      });
      return {
        cause: c.cause,
        mrr: affectedFirms.reduce((s, f) => s + f.mrr, 0) || Math.round(200 + Math.random() * 800),
        fill: c.fill,
      };
    });

    return { enrichedFirms, totalMRRAtRisk, recoverableMRR, top5, projection30j, nrr, grossChurn, expansionMRR, cohorts, mrrByCause };
  }, [riskFirms, causes, churnRate]);

  const highRiskFirms = derived.enrichedFirms.filter((f) => f.score >= 60);

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-40 w-full rounded-lg" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}</div>
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <TooltipProvider delayDuration={300}>
        <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Rétention & Churn</h1>
              <p className="text-muted-foreground text-sm mt-1">Cockpit prédictif stratégique — MRR à risque, scoring et leviers de rétention</p>
            </div>
            <ContextMessageButton contextType="churn" contextId="" contextLabel="Rétention & Churn" />
          </div>

          {/* ── 1. RISK EXECUTIVE SUMMARY ── */}
          <Card className={cn(
            "border-l-4",
            derived.totalMRRAtRisk > 2000 ? "border-l-destructive" : "border-l-amber-500"
          )}>
            <CardContent className="p-6">
              <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-destructive" />
                Risk Executive Summary
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">MRR total à risque</p>
                  <p className="text-2xl font-bold text-destructive tabular-nums">{fmt(derived.totalMRRAtRisk)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">MRR récupérable</p>
                  <p className="text-2xl font-bold text-emerald-600 tabular-nums">{fmt(derived.recoverableMRR)}</p>
                  <p className="text-xs text-muted-foreground">~70% du MRR à risque</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Projection churn 30j</p>
                  <p className="text-2xl font-bold text-amber-600 tabular-nums">-{fmt(derived.projection30j)}</p>
                  <p className="text-xs text-muted-foreground">Si aucune action</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Cabinets risque élevé</p>
                  <p className="text-2xl font-bold tabular-nums">{highRiskCount}</p>
                  <p className="text-xs text-muted-foreground">{mediumRiskCount} en risque moyen</p>
                </div>
              </div>
              {/* Top 5 */}
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Top 5 comptes à sauver</p>
                <div className="flex flex-wrap gap-2">
                  {derived.top5.map((f) => (
                    <div key={f.id} className="flex items-center gap-2 bg-muted/50 rounded-md px-3 py-1.5 text-sm">
                      <span className="font-medium">{f.name}</span>
                      <Badge variant={scoreBadge(f.score)} className="font-mono text-xs">{f.score}</Badge>
                      <span className="text-muted-foreground text-xs">{fmt(f.mrr)}/mois</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── 2. KPI SaaS AVANCÉS ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              label="Net Revenue Retention"
              value={`${derived.nrr}%`}
              icon={TrendingUp}
              positive={derived.nrr >= 100}
              alert={derived.nrr < 95}
              sub={derived.nrr >= 100 ? "Croissance organique" : "En dessous du seuil"}
              tooltip="Rétention nette du revenu. > 100% = croissance organique. Benchmark SaaS B2B : 105-120%"
            />
            <KPICard
              label="Gross Churn"
              value={`${derived.grossChurn}%`}
              icon={TrendingDown}
              alert={derived.grossChurn > 3}
              sub="Objectif : < 3%"
              tooltip="Taux de perte brute de revenu mensuel. Objectif : < 3% mensuel"
            />
            <KPICard
              label="Expansion MRR"
              value={fmt(derived.expansionMRR)}
              icon={Target}
              positive
              sub="Upsells & montées en gamme"
              tooltip="Revenu additionnel généré par les montées en gamme de plan"
            />
            <KPICard
              label="Récupérés"
              value={String(recoveredCount)}
              icon={UserCheck}
              positive={recoveredCount > 0}
              sub="Cabinets stabilisés"
              tooltip="Cabinets identifiés à risque puis stabilisés grâce aux actions de rétention"
            />
          </div>

          {/* Cohorts mini */}
          <Card>
            <CardHeader className="pb-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <CardTitle className="text-base cursor-help inline-flex items-center gap-1.5">
                    Cohortes clients <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  </CardTitle>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-sm">
                  <p>Rétention segmentée par ancienneté. Les cohortes récentes sont les plus vulnérables.</p>
                </TooltipContent>
              </Tooltip>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {derived.cohorts.map((c) => (
                  <div key={c.label} className="text-center space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">{c.label}</p>
                    <p className="text-xl font-bold tabular-nums">{c.retention}%</p>
                    <Progress value={c.retention} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ── 3. SCORE RISQUE + MRR PAR CAUSE ── */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            {/* Score risque enrichi */}
            <div className="xl:col-span-2">
              <Card>
                <CardHeader className="pb-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CardTitle className="text-base cursor-help inline-flex items-center gap-1.5">
                        Score de risque par cabinet <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                      </CardTitle>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-sm">
                      <p>Score composite 0-100. Colonnes enrichies : MRR, impact financier, priorité et recommandation.</p>
                    </TooltipContent>
                  </Tooltip>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cabinet</TableHead>
                          <TableHead className="text-center">Score</TableHead>
                          <TableHead className="text-center">Priorité</TableHead>
                          <TableHead className="text-right">MRR</TableHead>
                          <TableHead className="text-right">Impact €</TableHead>
                          <TableHead>Risque</TableHead>
                          <TableHead>Recommandation</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {derived.enrichedFirms.map((firm) => (
                          <TableRow key={firm.id}>
                            <TableCell className="font-medium">{firm.name}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant={scoreBadge(firm.score)} className="font-mono">{firm.score}</Badge>
                            </TableCell>
                            <TableCell className="text-center"><PriorityBadge score={firm.score} /></TableCell>
                            <TableCell className="text-right tabular-nums text-sm">{fmt(firm.mrr)}</TableCell>
                            <TableCell className="text-right tabular-nums text-sm text-destructive">{fmt(firm.financialImpact)}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{firm.mainRisk}</TableCell>
                            <TableCell className="text-xs">{firm.recommendation}</TableCell>
                          </TableRow>
                        ))}
                        {derived.enrichedFirms.length === 0 && (
                          <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Aucun cabinet à risque détecté</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* MRR exposé par cause */}
            <Card>
              <CardHeader className="pb-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <CardTitle className="text-base cursor-help inline-flex items-center gap-1.5">
                      MRR exposé par cause <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                    </CardTitle>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-sm">
                    <p>Répartition du MRR menacé par facteur de risque. Ciblez les causes à fort impact financier.</p>
                  </TooltipContent>
                </Tooltip>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={derived.mrrByCause} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickFormatter={(v) => `${v} €`} />
                      <YAxis type="category" dataKey="cause" width={130} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                      <RTooltip formatter={(v: number) => [`${v.toLocaleString()} €`, "MRR exposé"]} />
                      <Bar dataKey="mrr" radius={[0, 4, 4, 0]} name="MRR exposé">
                        {derived.mrrByCause.map((e, i) => <Cell key={i} fill={e.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── 4. ACTION CENTER ── */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Action Center
              </CardTitle>
              <p className="text-xs text-muted-foreground">Cabinets à risque élevé — Actions de rétention prioritaires</p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cabinet</TableHead>
                      <TableHead className="text-center">Score</TableHead>
                      <TableHead>Risque</TableHead>
                      <TableHead>Actions</TableHead>
                      <TableHead className="text-center">Traité</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {highRiskFirms.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          <CheckCircle2 className="h-5 w-5 mx-auto mb-2 text-emerald-500" />
                          Aucun cabinet nécessitant une action immédiate
                        </TableCell>
                      </TableRow>
                    )}
                    {highRiskFirms.map((firm) => {
                      const treated = treatedIds.has(firm.id);
                      return (
                        <TableRow key={firm.id} className={cn(treated && "opacity-50")}>
                          <TableCell className={cn("font-medium", treated && "line-through")}>{firm.name}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant={scoreBadge(firm.score)} className="font-mono">{firm.score}</Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{firm.mainRisk}</TableCell>
                          <TableCell>
                            <div className="flex gap-1.5 flex-wrap">
                              <Button variant="outline" size="sm" className="h-7 text-xs gap-1" asChild>
                                <Link to="/admin/team/appointments"><Calendar className="h-3 w-3" /> RDV</Link>
                              </Button>
                              <Button variant="outline" size="sm" className="h-7 text-xs gap-1" asChild>
                                <Link to="/admin/firms"><Users className="h-3 w-3" /> CM</Link>
                              </Button>
                              <Button variant="outline" size="sm" className="h-7 text-xs gap-1" asChild>
                                <Link to="/admin/billing/delays"><CreditCard className="h-3 w-3" /> Paiement</Link>
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch checked={treated} onCheckedChange={() => toggleTreated(firm.id)} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* ── 5. ANALYSE ── */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Analyse</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Évolution churn */}
              <Card>
                <CardHeader className="pb-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CardTitle className="text-base cursor-help inline-flex items-center gap-1.5">
                        Évolution churn (6 mois) <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                      </CardTitle>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-sm">
                      <p>Suivi mensuel du taux de désabonnement. Une hausse continue nécessite une stratégie de rétention.</p>
                    </TooltipContent>
                  </Tooltip>
                </CardHeader>
                <CardContent>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={churnHistory}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                        <YAxis unit="%" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                        <RTooltip formatter={(v: number) => [`${v}%`, "Churn"]} />
                        <Line type="monotone" dataKey="rate" stroke="hsl(0, 84%, 60%)" strokeWidth={2} dot={{ fill: "hsl(0, 84%, 60%)", r: 3 }} name="Taux churn" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Churn par pack */}
              <Card>
                <CardHeader className="pb-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CardTitle className="text-base cursor-help inline-flex items-center gap-1.5">
                        Churn par pack <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                      </CardTitle>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-sm">
                      <p>Taux de churn par formule d'abonnement. Identifiez les offres les plus vulnérables.</p>
                    </TooltipContent>
                  </Tooltip>
                </CardHeader>
                <CardContent>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={churnByPack}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="pack" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                        <YAxis unit="%" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                        <RTooltip formatter={(v: number) => [`${v}%`, "Churn"]} />
                        <Bar dataKey="rate" radius={[4, 4, 0, 0]} name="Taux churn">
                          {churnByPack.map((e, i) => <Cell key={i} fill={e.fill} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Impact financier */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CardTitle className="text-base cursor-help inline-flex items-center gap-1.5">
                        Impact financier <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                      </CardTitle>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-sm">
                      <p>MRR perdu vs récupéré par mois. Mesure l'efficacité des actions de rétention sur le revenu.</p>
                    </TooltipContent>
                  </Tooltip>
                </CardHeader>
                <CardContent>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={financialImpact}>
                        <defs>
                          <linearGradient id="lostG" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="recG" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                        <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                        <RTooltip formatter={(v: number) => [`${v.toLocaleString()} €`]} />
                        <Legend />
                        <Area type="monotone" dataKey="lost" stroke="hsl(0, 84%, 60%)" fill="url(#lostG)" strokeWidth={2} name="MRR perdu" />
                        <Area type="monotone" dataKey="recovered" stroke="hsl(142, 71%, 45%)" fill="url(#recG)" strokeWidth={2} name="MRR récupéré" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </TooltipProvider>
    </AppLayout>
  );
}
