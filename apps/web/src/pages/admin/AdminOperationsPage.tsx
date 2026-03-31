import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell,
  Tooltip as RechartsTooltip,
} from "recharts";
import { useAdminOperations, OpFirm, OpCM, OpAlert } from "@/hooks/admin/useAdminOperations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Tooltip, TooltipTrigger, TooltipContent, TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Building2, Users, MessageSquare, Activity,
  Clock, Zap, XCircle, LayoutDashboard, AlertTriangle,
  UserX, Eye, CheckCircle2, Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

/* ── Helpers ── */
function scoreBadge(score: number) {
  if (score >= 70) return "destructive" as const;
  if (score >= 40) return "secondary" as const;
  return "outline" as const;
}

function paymentLabel(s: string) {
  if (s === "ok") return { text: "À jour", cls: "text-emerald-600" };
  if (s === "retard") return { text: "Retard", cls: "text-amber-600" };
  return { text: "Bloqué", cls: "text-destructive" };
}

/* ── Tabs ── */
type TabKey = "overview" | "cabinets" | "utilisateurs" | "parole" | "cm";
const TABS: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "overview", label: "Vue d'ensemble", icon: LayoutDashboard },
  { key: "cabinets", label: "Cabinets", icon: Building2 },
  { key: "utilisateurs", label: "Utilisateurs", icon: Users },
  { key: "parole", label: "Prises de parole", icon: MessageSquare },
  { key: "cm", label: "CM & Activité", icon: Activity },
];

/* ── Overview sub-components ── */

import { AdminKPICard } from "@/components/admin/shared/AdminUI";

function HealthCard({ label, value, icon, alert, tooltip }: {
  label: string; value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  alert?: boolean;
  tooltip?: string;
}) {
  return (
    <AdminKPICard
      label={label}
      value={String(value)}
      icon={icon}
      alert={alert}
      tooltip={tooltip}
    />
  );
}

function SectionTitle({ icon: Icon, title, tooltip }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  tooltip: string;
}) {
  return (
    <CardTitle className="text-base flex items-center gap-2">
      <Icon className="h-4 w-4 text-primary" />
      {title}
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs text-xs">{tooltip}</TooltipContent>
      </Tooltip>
    </CardTitle>
  );
}

function PriorityAlerts({ alerts }: { alerts: OpAlert[] }) {
  const navigate = useNavigate();
  const sorted = useMemo(() => {
    const order = { critical: 0, warning: 1, info: 2 };
    return [...alerts]
      .filter(a => a.count > 0)
      .sort((a, b) => order[a.severity] - order[b.severity]);
  }, [alerts]);

  if (sorted.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 text-muted-foreground">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          <p className="text-sm">Aucune alerte active — tout est opérationnel.</p>
        </div>
      </Card>
    );
  }

  const severityConfig = {
    critical: { dot: "bg-destructive", bg: "bg-destructive/10 text-destructive" },
    warning: { dot: "bg-amber-500", bg: "bg-amber-500/10 text-amber-700 dark:text-amber-400" },
    info: { dot: "bg-blue-500", bg: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <SectionTitle icon={AlertTriangle} title="Alertes prioritaires" tooltip="Résumé des problèmes opérationnels classés par sévérité. Les alertes critiques nécessitent une action immédiate." />
      </CardHeader>
      <CardContent className="p-0">
        {sorted.map((alert, i) => {
          const cfg = severityConfig[alert.severity];
          return (
            <div key={alert.id} className={cn("flex items-center gap-3 px-6 py-3", i < sorted.length - 1 && "border-b")}>
              <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", cfg.dot)} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{alert.label}</p>
                <p className="text-xs text-muted-foreground truncate">{alert.description}</p>
              </div>
              <Badge className={cn("text-xs font-mono shrink-0", cfg.bg)} variant="secondary">{alert.count}</Badge>
              <Button variant="ghost" size="sm" className="shrink-0 text-xs" onClick={() => navigate(alert.link)}>
                <Eye className="h-3.5 w-3.5 mr-1" />
                Voir
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function CMWorkloadGrid({ cms }: { cms: OpCM[] }) {
  if (cms.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 text-muted-foreground">
          <UserX className="h-5 w-5" />
          <p className="text-sm">Aucun Community Manager actif.</p>
        </div>
      </Card>
    );
  }

  function workloadBadge(cm: OpCM) {
    if (cm.overloaded) return { label: "Élevée", cls: "bg-amber-500/10 text-amber-700 dark:text-amber-400" };
    if (cm.firmsCount >= 3) return { label: "Moyenne", cls: "bg-blue-500/10 text-blue-700 dark:text-blue-400" };
    return { label: "Faible", cls: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" };
  }

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold flex items-center gap-2">
        <Users className="h-4 w-4 text-primary" />
        Charge des Community Managers
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs text-xs">Vue synthétique de la charge de travail de chaque CM : nombre de cabinets, taux de validation et dernière activité.</TooltipContent>
        </Tooltip>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {cms.map(cm => {
          const wl = workloadBadge(cm);
          const inactive48h = !cm.lastActivity || new Date(cm.lastActivity) < new Date(Date.now() - 48 * 60 * 60 * 1000);
          return (
            <Card key={cm.userId} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-sm">{cm.name}</span>
                <Badge variant="secondary" className={cn("text-xs", wl.cls)}>{wl.label}</Badge>
              </div>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Cabinets gérés</span>
                  <span className="font-medium text-foreground">{cm.firmsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taux validation</span>
                  <span className={cn("font-medium", cm.validationRate >= 70 ? "text-emerald-600" : cm.validationRate >= 40 ? "text-amber-600" : "text-destructive")}>
                    {cm.validationRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Dernière activité</span>
                  <span className={cn("font-medium", inactive48h ? "text-destructive" : "text-foreground")}>
                    {cm.lastActivity
                      ? formatDistanceToNow(new Date(cm.lastActivity), { addSuffix: true, locale: fr })
                      : "Aucune"}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminOperationsPage() {
  const { loading, firms, cms, validation, alerts } = useAdminOperations();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  // ── Overview derived data ──
  const inactiveFirms = useMemo(() => firms.filter(f => f.activityLabel === "Faible").length, [firms]);
  const overloadedCMs = useMemo(() => cms.filter(c => c.overloaded).length, [cms]);
  const inactiveCMs = useMemo(() => cms.filter(c => !c.lastActivity || new Date(c.lastActivity) < new Date(Date.now() - 48 * 60 * 60 * 1000)).length, [cms]);

  // Filters for Cabinets
  const [cmFilter, setCmFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [packFilter, setPackFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");

  const uniqueCMs = useMemo(() => {
    const set = new Map<string, string>();
    firms.forEach(f => { if (f.cmUserId && f.cmName) set.set(f.cmUserId, f.cmName); });
    return Array.from(set.entries()).map(([id, name]) => ({ id, name }));
  }, [firms]);
  const uniquePacks = useMemo(() => [...new Set(firms.map(f => f.pack))], [firms]);

  const filteredFirms = useMemo(() => {
    let list = [...firms];
    if (cmFilter !== "all") list = list.filter(f => f.cmUserId === cmFilter);
    if (statusFilter === "faible") list = list.filter(f => f.activityLabel === "Faible");
    else if (statusFilter === "normale") list = list.filter(f => f.activityLabel === "Normale");
    else if (statusFilter === "elevee") list = list.filter(f => f.activityLabel === "Élevée");
    if (packFilter !== "all") list = list.filter(f => f.pack === packFilter);
    if (riskFilter === "high") list = list.filter(f => f.riskScore >= 60);
    else if (riskFilter === "medium") list = list.filter(f => f.riskScore >= 30 && f.riskScore < 60);
    else if (riskFilter === "low") list = list.filter(f => f.riskScore < 30);
    return list.sort((a, b) => b.riskScore - a.riskScore);
  }, [firms, cmFilter, statusFilter, packFilter, riskFilter]);

  // Filters for Utilisateurs
  const [roleFilter, setRoleFilter] = useState("all");

  const users = useMemo(() => {
    const userMap = new Map<string, { name: string; role: string; firmsCount: number; lastActivity: string | null; active: boolean }>();
    cms.forEach(cm => {
      userMap.set(cm.userId, {
        name: cm.name,
        role: "Community Manager",
        firmsCount: cm.firmsCount,
        lastActivity: cm.lastActivity,
        active: cm.lastActivity ? new Date(cm.lastActivity) > new Date(Date.now() - 48 * 60 * 60 * 1000) : false,
      });
    });
    firms.forEach(f => {
      if (f.cmUserId && !userMap.has(f.cmUserId)) {
        userMap.set(f.cmUserId, { name: f.cmName || "CM", role: "Community Manager", firmsCount: 1, lastActivity: null, active: false });
      }
    });
    let list = Array.from(userMap.values());
    if (roleFilter !== "all") list = list.filter(u => u.role.toLowerCase().includes(roleFilter));
    return list;
  }, [cms, firms, roleFilter]);

  const validatedCount = useMemo(() => {
    return Math.max(0, validation.awaitingLawyer + validation.awaitingCM + validation.recentRefusals + validation.urgentCount);
  }, [validation]);

  const pendingValidation = validation.awaitingLawyer + validation.awaitingCM;

  return (
    <AppLayout>
      <TooltipProvider delayDuration={300}>
        <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Opérations</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Pilotage terrain — cabinets, utilisateurs, contenus et CM</p>
          </div>

          {/* Tab bar */}
          <div className="flex gap-2 border-b pb-0 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap",
                  activeTab === tab.key
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── VUE D'ENSEMBLE ── */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
                </div>
              ) : (
                <>
                  {/* A. Santé Opérationnelle */}
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <HealthCard label="Posts en attente" value={pendingValidation} icon={Clock} alert={pendingValidation > 5} tooltip="Nombre total de publications en attente de validation par un avocat ou un CM. Au-delà de 5, un retard opérationnel est probable." />
                    <HealthCard label="Délai moyen" value={`${validation.avgDelayHours}h`} icon={Clock} alert={validation.avgDelayHours > 48} tooltip="Temps moyen entre la soumission d'une publication et sa validation finale. Un délai supérieur à 48h signale un goulet d'étranglement." />
                    <HealthCard label="Cabinets inactifs" value={inactiveFirms} icon={Building2} alert={inactiveFirms > 5} tooltip="Cabinets n'ayant produit aucune publication dans les 30 derniers jours. Nécessite une relance commerciale ou éditoriale." />
                    <HealthCard label="CM surchargés" value={overloadedCMs} icon={Zap} alert={overloadedCMs > 0} tooltip="Community Managers gérant 5 cabinets ou plus. Risque de baisse de qualité et de délais accrus." />
                    <HealthCard label="CM inactifs > 48h" value={inactiveCMs} icon={UserX} alert={inactiveCMs > 0} tooltip="Community Managers sans activité enregistrée depuis plus de 48 heures. Vérifier disponibilité ou réassigner." />
                  </div>

                  {/* Chart A: Flux de validation */}
                  <Card>
                    <CardHeader className="pb-2">
                      <SectionTitle icon={Activity} title="Flux de validation" tooltip="Répartition des publications dans le cycle de validation. Permet d'identifier où se concentrent les blocages." />
                      <p className="text-xs text-muted-foreground">Répartition des publications par statut dans le cycle de validation</p>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[140px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            layout="vertical"
                            data={[
                              { name: "Attente avocat", value: validation.awaitingLawyer, color: "hsl(var(--primary))" },
                              { name: "Attente CM", value: validation.awaitingCM, color: "hsl(38 92% 50%)" },
                              { name: "Refus récents", value: validation.recentRefusals, color: "hsl(var(--destructive))" },
                              { name: "Urgents", value: validation.urgentCount, color: "hsl(217 91% 60%)" },
                            ]}
                            margin={{ top: 0, right: 20, bottom: 0, left: 100 }}
                            barSize={14}
                          >
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} width={100} />
                            <RechartsTooltip
                              cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
                              contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--background))", fontSize: 12 }}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                              {[0, 1, 2, 3].map(i => (
                                <Cell key={i} fill={[
                                  "hsl(var(--primary))",
                                  "hsl(38 92% 50%)",
                                  "hsl(var(--destructive))",
                                  "hsl(217 91% 60%)",
                                ][i]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* B. Alertes Prioritaires */}
                  <PriorityAlerts alerts={alerts} />

                  {/* Chart B: Distribution des risques cabinets */}
                  {(() => {
                    const riskData = [
                      { name: "Faible", value: firms.filter(f => f.riskScore < 30).length, color: "hsl(142 71% 45%)" },
                      { name: "Moyen", value: firms.filter(f => f.riskScore >= 30 && f.riskScore < 60).length, color: "hsl(38 92% 50%)" },
                      { name: "Élevé", value: firms.filter(f => f.riskScore >= 60).length, color: "hsl(var(--destructive))" },
                    ];
                    return (
                      <Card>
                        <CardHeader className="pb-2">
                          <SectionTitle icon={Building2} title="Distribution des risques cabinets" tooltip="Répartition du portefeuille cabinets par niveau de risque. Un nombre élevé de cabinets à risque élevé signale un besoin d'intervention." />
                          <p className="text-xs text-muted-foreground">Santé globale du portefeuille par niveau de risque</p>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[160px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={riskData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }} barSize={48}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                                <YAxis hide />
                                <RechartsTooltip
                                  cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
                                  contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--background))", fontSize: 12 }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]} label={{ position: "top", fontSize: 13, fontWeight: 600, fill: "hsl(var(--foreground))" }}>
                                  {riskData.map((d, i) => (
                                    <Cell key={i} fill={d.color} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })()}

                  {/* C. Charge CM */}
                  <CMWorkloadGrid cms={cms} />
                </>
              )}
            </div>
          )}

          {/* ── CABINETS ── */}
          {activeTab === "cabinets" && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Select value={cmFilter} onValueChange={setCmFilter}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="Par CM" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les CMs</SelectItem>
                    {uniqueCMs.map(cm => <SelectItem key={cm.id} value={cm.id}>{cm.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px]"><SelectValue placeholder="Par statut" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous statuts</SelectItem>
                    <SelectItem value="elevee">Activité élevée</SelectItem>
                    <SelectItem value="normale">Activité normale</SelectItem>
                    <SelectItem value="faible">Activité faible</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={packFilter} onValueChange={setPackFilter}>
                  <SelectTrigger className="w-[160px]"><SelectValue placeholder="Par pack" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les packs</SelectItem>
                    {uniquePacks.map(p => <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger className="w-[160px]"><SelectValue placeholder="Par risque" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous niveaux</SelectItem>
                    <SelectItem value="high">Risque élevé</SelectItem>
                    <SelectItem value="medium">Risque moyen</SelectItem>
                    <SelectItem value="low">Risque faible</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {loading ? <Skeleton className="h-80 rounded-lg" /> : (
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-left text-muted-foreground">
                            <th className="p-3 font-medium">Cabinet</th>
                            <th className="p-3 font-medium">Pack</th>
                            <th className="p-3 font-medium">CM assigné</th>
                            <th className="p-3 font-medium text-center">Paiement</th>
                            <th className="p-3 font-medium text-center">Risque</th>
                            <th className="p-3 font-medium text-center">Activité</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredFirms.map(firm => {
                            const pay = paymentLabel(firm.paymentStatus);
                            return (
                              <tr key={firm.id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                                <td className="p-3 font-medium">{firm.name}</td>
                                <td className="p-3"><Badge variant="outline" className="text-xs capitalize">{firm.pack}</Badge></td>
                                <td className="p-3 text-sm">{firm.cmName || <span className="text-destructive text-xs">Non assigné</span>}</td>
                                <td className={cn("p-3 text-center text-xs font-medium", pay.cls)}>{pay.text}</td>
                                <td className="p-3 text-center">
                                  <Badge variant={scoreBadge(firm.riskScore)} className="font-mono text-xs">{firm.riskScore}</Badge>
                                </td>
                                <td className="p-3 text-center">
                                  <Badge variant={firm.activityLabel === "Faible" ? "destructive" : firm.activityLabel === "Élevée" ? "default" : "secondary"} className="text-xs">
                                    {firm.recentPubCount} posts · {firm.activityLabel}
                                  </Badge>
                                </td>
                              </tr>
                            );
                          })}
                          {filteredFirms.length === 0 && (
                            <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Aucun cabinet trouvé</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
              <p className="text-xs text-muted-foreground">{filteredFirms.length} cabinet{filteredFirms.length > 1 ? "s" : ""}</p>
            </div>
          )}

          {/* ── UTILISATEURS ── */}
          {activeTab === "utilisateurs" && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[200px]"><SelectValue placeholder="Par rôle" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les rôles</SelectItem>
                    <SelectItem value="community">Community Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {loading ? <Skeleton className="h-80 rounded-lg" /> : (
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-left text-muted-foreground">
                            <th className="p-3 font-medium">Nom</th>
                            <th className="p-3 font-medium">Rôle</th>
                            <th className="p-3 font-medium">Dernière connexion</th>
                            <th className="p-3 font-medium text-center">Statut</th>
                            <th className="p-3 font-medium text-center">Cabinets gérés</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((u, i) => (
                            <tr key={i} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                              <td className="p-3 font-medium">{u.name}</td>
                              <td className="p-3"><Badge variant="outline" className="text-xs">{u.role}</Badge></td>
                              <td className="p-3 text-xs text-muted-foreground">
                                {u.lastActivity
                                  ? formatDistanceToNow(new Date(u.lastActivity), { addSuffix: true, locale: fr })
                                  : "Aucune activité"}
                              </td>
                              <td className="p-3 text-center">
                                <Badge variant={u.active ? "default" : "destructive"} className="text-xs">
                                  {u.active ? "Actif" : "Inactif"}
                                </Badge>
                              </td>
                              <td className="p-3 text-center">{u.firmsCount}</td>
                            </tr>
                          ))}
                          {users.length === 0 && (
                            <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Aucun utilisateur trouvé</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* ── PRISES DE PAROLE ── */}
          {activeTab === "parole" && (
            <div className="space-y-4">
              {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  <ValCard label="En attente validation" value={pendingValidation} icon={Clock} alert={pendingValidation > 5} />
                  <ValCard label="Refusées" value={validation.recentRefusals} icon={XCircle} alert={validation.recentRefusals > 3} />
                  <ValCard label="Validées (estimation)" value={validatedCount} icon={Activity} />
                  <ValCard label="Délai moyen" value={`${validation.avgDelayHours}h`} icon={Clock} alert={validation.avgDelayHours > 48} />
                  <ValCard label="Urgentes" value={validation.urgentCount} icon={Zap} alert={validation.urgentCount > 0} />
                </div>
              )}
            </div>
          )}

          {/* ── CM & ACTIVITÉ ── */}
          {activeTab === "cm" && (
            <div className="space-y-4">
              {loading ? <Skeleton className="h-80 rounded-lg" /> : (
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-left text-muted-foreground">
                            <th className="p-3 font-medium">CM</th>
                            <th className="p-3 font-medium text-center">Cabinets</th>
                            <th className="p-3 font-medium text-center">Taux validation</th>
                            <th className="p-3 font-medium text-center">Taux refus</th>
                            <th className="p-3 font-medium text-center">Charge</th>
                            <th className="p-3 font-medium">Inactivité</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cms.map(cm => {
                            const inactive48h = !cm.lastActivity || new Date(cm.lastActivity) < new Date(Date.now() - 48 * 60 * 60 * 1000);
                            return (
                              <tr key={cm.userId} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                                <td className="p-3 font-medium">{cm.name}</td>
                                <td className="p-3 text-center">{cm.firmsCount}</td>
                                <td className="p-3 text-center">
                                  <span className={cm.validationRate >= 70 ? "text-emerald-600" : cm.validationRate >= 40 ? "text-amber-600" : "text-destructive"}>
                                    {cm.validationRate}%
                                  </span>
                                </td>
                                <td className="p-3 text-center">
                                  <span className={cm.refusalRate > 30 ? "text-destructive" : "text-muted-foreground"}>
                                    {cm.refusalRate}%
                                  </span>
                                </td>
                                <td className="p-3 text-center">
                                  {cm.overloaded ? (
                                    <Badge variant="destructive" className="text-xs">Surchargé</Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs text-emerald-600">OK</Badge>
                                  )}
                                </td>
                                <td className="p-3">
                                  {inactive48h ? (
                                    <Badge variant="destructive" className="text-xs">Inactif &gt; 48h</Badge>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">
                                      {cm.lastActivity && formatDistanceToNow(new Date(cm.lastActivity), { addSuffix: true, locale: fr })}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                          {cms.length === 0 && (
                            <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Aucun CM actif</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </TooltipProvider>
    </AppLayout>
  );
}

/* ── Validation stat card (used by Prises de parole tab) ── */
function ValCard({ label, value, icon: Icon, alert }: {
  label: string; value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  alert?: boolean;
}) {
  return (
    <Card className={cn("p-4 transition-shadow hover:shadow-md", alert && "border-destructive/30")}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
        <Icon className={cn("h-4 w-4", alert ? "text-destructive" : "text-muted-foreground")} />
      </div>
      <div className={cn("text-2xl font-bold", alert && "text-destructive")}>{value}</div>
    </Card>
  );
}
