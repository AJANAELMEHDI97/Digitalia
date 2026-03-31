import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  Users, UserCheck, AlertTriangle, Clock, XCircle, Zap,
  ArrowUpDown, Search, ShieldAlert, Info, TrendingDown
} from "lucide-react";
import { ContextMessageButton } from "@/components/admin/coordination/ContextMessageButton";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// ── Tooltip Dictionaries ───────────────────────────────────

const KPI_TOOLTIPS = {
  total_cm: "Nombre total de Community Managers actifs dans l'équipe. Permet de dimensionner la capacité opérationnelle globale.",
  active_today: "CM ayant eu au moins une activité dans les 24 dernières heures. En dessous de 50% de l'équipe, une alerte est déclenchée.",
  overloaded: "CM gérant 5 cabinets ou plus. La surcharge augmente le risque de retard et de baisse de qualité éditoriale.",
  avg_delay: "Temps moyen entre la soumission d'un contenu et la décision de l'avocat, pour les cabinets du CM. Au-delà de 36h, un suivi est recommandé.",
  refusal_rate: "Pourcentage moyen de publications refusées par les avocats. Au-dessus de 20%, vérifier l'alignement éditorial et la formation des CM.",
  avg_processing: "Durée moyenne de création et préparation d'un contenu par le CM. Au-delà de 5h, analyser les causes de lenteur.",
};

const ALERT_TOOLTIPS: { pattern: string; tooltip: string }[] = [
  { pattern: "inactif depuis +48h", tooltip: "Ce CM n'a eu aucune activité sur la plateforme depuis plus de 2 jours. Vérifier sa disponibilité et redistribuer la charge si nécessaire." },
  { pattern: "surchargé avec taux refus élevé", tooltip: "Combinaison critique : le CM gère trop de cabinets et produit des contenus fréquemment refusés. Intervention prioritaire nécessaire." },
  { pattern: "en surcharge", tooltip: "Ce CM gère 5 cabinets ou plus. Risque de dégradation de la qualité et des délais de production." },
  { pattern: "validation anormal", tooltip: "Le délai moyen de validation dépasse 36h pour ce CM. Vérifier les cabinets concernés et relancer les avocats si besoin." },
  { pattern: "Sans activité récente", tooltip: "CM sans connexion depuis plus de 24h mais moins de 48h. À surveiller pour anticiper un éventuel décrochage." },
  { pattern: "Taux validation faible", tooltip: "Le taux de validation est inférieur à 70%. Peut indiquer un problème de qualité éditoriale ou de compréhension des attentes." },
];

const findAlertTooltip = (message: string) =>
  ALERT_TOOLTIPS.find(t => message.toLowerCase().includes(t.pattern.toLowerCase()))?.tooltip;

// ── Demo Data ──────────────────────────────────────────────

interface CMData {
  id: string;
  name: string;
  avatar: string;
  firms: number;
  pendingPosts: number;
  publishedPosts30d: number;
  validationRate: number;
  refusalRate: number;
  avgDelay: number; // hours
  avgProcessing: number; // hours
  lastActivity: Date;
  weeklyActivity: number[];
}

const NOW = new Date();
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3600000);

const DEMO_CMS: CMData[] = [
  {
    id: "cm-1", name: "Marie Dupont", avatar: "MD", firms: 7,
    pendingPosts: 12, publishedPosts30d: 48, validationRate: 85, refusalRate: 15,
    avgDelay: 22, avgProcessing: 2.8, lastActivity: hoursAgo(1),
    weeklyActivity: [14, 11, 13, 10],
  },
  {
    id: "cm-2", name: "Thomas Martin", avatar: "TM", firms: 4,
    pendingPosts: 6, publishedPosts30d: 31, validationRate: 78, refusalRate: 22,
    avgDelay: 30, avgProcessing: 3.5, lastActivity: hoursAgo(3),
    weeklyActivity: [8, 9, 7, 7],
  },
  {
    id: "cm-3", name: "Sophie Bernard", avatar: "SB", firms: 3,
    pendingPosts: 2, publishedPosts30d: 27, validationRate: 92, refusalRate: 8,
    avgDelay: 18, avgProcessing: 2.1, lastActivity: hoursAgo(0.5),
    weeklyActivity: [7, 6, 8, 6],
  },
  {
    id: "cm-4", name: "Lucas Moreau", avatar: "LM", firms: 6,
    pendingPosts: 15, publishedPosts30d: 22, validationRate: 65, refusalRate: 35,
    avgDelay: 42, avgProcessing: 5.2, lastActivity: hoursAgo(56),
    weeklyActivity: [9, 5, 4, 4],
  },
  {
    id: "cm-5", name: "Clara Rousseau", avatar: "CR", firms: 4,
    pendingPosts: 4, publishedPosts30d: 36, validationRate: 88, refusalRate: 12,
    avgDelay: 24, avgProcessing: 2.6, lastActivity: hoursAgo(2),
    weeklyActivity: [10, 8, 9, 9],
  },
  {
    id: "cm-6", name: "Hugo Fontaine", avatar: "HF", firms: 2,
    pendingPosts: 3, publishedPosts30d: 18, validationRate: 71, refusalRate: 29,
    avgDelay: 34, avgProcessing: 4.1, lastActivity: hoursAgo(26),
    weeklyActivity: [5, 4, 5, 4],
  },
];

// ── Helpers ────────────────────────────────────────────────

const getCharge = (firms: number): "faible" | "normale" | "élevée" | "surchargé" => {
  if (firms >= 6) return "surchargé";
  if (firms >= 5) return "élevée";
  if (firms >= 3) return "normale";
  return "faible";
};

const chargeBadge = (charge: string) => {
  const map: Record<string, string> = {
    faible: "bg-emerald-50 text-emerald-700 border-emerald-200",
    normale: "bg-blue-50 text-blue-700 border-blue-200",
    élevée: "bg-amber-50 text-amber-700 border-amber-200",
    surchargé: "bg-red-50 text-red-700 border-red-200",
  };
  return map[charge] || "";
};

const perfBadge = (rate: number) => {
  if (rate >= 80) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (rate >= 60) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-red-50 text-red-700 border-red-200";
};

const relativeTime = (d: Date) => {
  const diffH = Math.floor((NOW.getTime() - d.getTime()) / 3600000);
  if (diffH < 1) return "< 1h";
  if (diffH < 24) return `${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}j ${diffH % 24}h`;
};

const getPerformanceLevel = (rate: number) => {
  if (rate >= 80) return "excellent";
  if (rate >= 60) return "correct";
  return "faible";
};

// ── KPI Card ───────────────────────────────────────────────

function KPICard({ icon: Icon, label, value, suffix, alert, tooltip }: {
  icon: React.ElementType; label: string; value: string | number; suffix?: string; alert?: boolean; tooltip?: string;
}) {
  const card = (
    <Card className={`relative overflow-hidden transition-shadow hover:shadow-md ${alert ? "ring-1 ring-destructive/30" : ""} ${tooltip ? "cursor-help" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          {alert && <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />}
        </div>
        <div className="text-2xl font-bold tabular-nums tracking-tight">{value}{suffix}</div>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </CardContent>
    </Card>
  );

  if (!tooltip) return card;

  return (
    <UITooltip>
      <TooltipTrigger asChild>{card}</TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs text-xs"><p>{tooltip}</p></TooltipContent>
    </UITooltip>
  );
}

// ── Alert Item ─────────────────────────────────────────────

interface AlertItem {
  severity: "critical" | "warning" | "info";
  message: string;
  count?: number;
}

function AlertRow({ item, tooltip }: { item: AlertItem; tooltip?: string }) {
  const styles = {
    critical: { bg: "bg-red-50 border-red-200", icon: ShieldAlert, iconColor: "text-red-600", badge: "bg-red-100 text-red-700" },
    warning: { bg: "bg-amber-50 border-amber-200", icon: AlertTriangle, iconColor: "text-amber-600", badge: "bg-amber-100 text-amber-700" },
    info: { bg: "bg-slate-50 border-slate-200", icon: Info, iconColor: "text-slate-500", badge: "bg-slate-100 text-slate-600" },
  };
  const s = styles[item.severity];
  const row = (
    <div className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${s.bg} ${tooltip ? "cursor-help" : ""}`}>
      <s.icon className={`h-4 w-4 shrink-0 ${s.iconColor}`} />
      <span className="text-sm flex-1">{item.message}</span>
      {item.count !== undefined && (
        <Badge variant="outline" className={`text-xs font-medium ${s.badge}`}>{item.count}</Badge>
      )}
    </div>
  );

  if (!tooltip) return row;

  return (
    <UITooltip>
      <TooltipTrigger asChild>{row}</TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs text-xs"><p>{tooltip}</p></TooltipContent>
    </UITooltip>
  );
}

// ── Main Component ─────────────────────────────────────────

type SortKey = "name" | "firms" | "pendingPosts" | "publishedPosts30d" | "validationRate" | "refusalRate" | "avgDelay" | "lastActivity";

export default function AdminTeamCMsPage() {
  const [search, setSearch] = useState("");
  const [chargeFilter, setChargeFilter] = useState("all");
  const [perfFilter, setPerfFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortAsc, setSortAsc] = useState(true);

  const cms = DEMO_CMS;

  // ── KPI calculations ──
  const totalCM = cms.length;
  const activesToday = cms.filter(c => (NOW.getTime() - c.lastActivity.getTime()) < 24 * 3600000).length;
  const overloaded = cms.filter(c => c.firms >= 5).length;
  const avgDelay = Math.round(cms.reduce((s, c) => s + c.avgDelay, 0) / totalCM);
  const globalRefusal = Math.round(cms.reduce((s, c) => s + c.refusalRate, 0) / totalCM);
  const avgProcessing = (cms.reduce((s, c) => s + c.avgProcessing, 0) / totalCM).toFixed(1);

  // ── Alerts ──
  const alerts = useMemo<AlertItem[]>(() => {
    const list: AlertItem[] = [];
    const inactive48 = cms.filter(c => (NOW.getTime() - c.lastActivity.getTime()) > 48 * 3600000);
    if (inactive48.length) list.push({ severity: "critical", message: `CM inactif depuis +48h : ${inactive48.map(c => c.name).join(", ")}`, count: inactive48.length });

    const overloadedHighRefusal = cms.filter(c => c.firms >= 5 && c.refusalRate > 30);
    if (overloadedHighRefusal.length) list.push({ severity: "critical", message: `CM surchargé avec taux refus élevé : ${overloadedHighRefusal.map(c => c.name).join(", ")}`, count: overloadedHighRefusal.length });

    const overloadedCMs = cms.filter(c => c.firms >= 5 && c.refusalRate <= 30);
    if (overloadedCMs.length) list.push({ severity: "warning", message: `CM en surcharge (≥ 5 cabinets)`, count: overloadedCMs.length });

    const slowValidation = cms.filter(c => c.avgDelay > 36);
    if (slowValidation.length) list.push({ severity: "warning", message: `Délai validation anormal (> 36h) : ${slowValidation.map(c => c.name).join(", ")}`, count: slowValidation.length });

    const inactive24 = cms.filter(c => {
      const h = (NOW.getTime() - c.lastActivity.getTime()) / 3600000;
      return h > 24 && h <= 48;
    });
    if (inactive24.length) list.push({ severity: "info", message: `Sans activité récente (> 24h)`, count: inactive24.length });

    const lowValidation = cms.filter(c => c.validationRate < 70);
    if (lowValidation.length) list.push({ severity: "info", message: `Taux validation faible (< 70%)`, count: lowValidation.length });

    return list;
  }, [cms]);

  // ── Filtered & Sorted CMs ──
  const filtered = useMemo(() => {
    let list = [...cms];
    if (search) list = list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
    if (chargeFilter !== "all") list = list.filter(c => getCharge(c.firms) === chargeFilter);
    if (perfFilter !== "all") list = list.filter(c => getPerformanceLevel(c.validationRate) === perfFilter);

    list.sort((a, b) => {
      let va: number | string, vb: number | string;
      if (sortKey === "name") { va = a.name; vb = b.name; }
      else if (sortKey === "lastActivity") { va = a.lastActivity.getTime(); vb = b.lastActivity.getTime(); }
      else { va = a[sortKey]; vb = b[sortKey]; }
      if (va < vb) return sortAsc ? -1 : 1;
      if (va > vb) return sortAsc ? 1 : -1;
      return 0;
    });
    return list;
  }, [cms, search, chargeFilter, perfFilter, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  // ── Chart Data ──
  const chartData = useMemo(() => {
    const weeks = ["Sem -3", "Sem -2", "Sem -1", "Cette sem."];
    return weeks.map((w, i) => {
      const entry: Record<string, string | number> = { week: w };
      cms.forEach(c => { entry[c.name] = c.weeklyActivity[i]; });
      return entry;
    });
  }, [cms]);

  const chartConfig = useMemo(() => {
    const colors = ["#4F46E5", "#0EA5E9", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];
    const cfg: Record<string, { label: string; color: string }> = {};
    cms.forEach((c, i) => { cfg[c.name] = { label: c.name, color: colors[i % colors.length] }; });
    return cfg;
  }, [cms]);

  const SortableHead = ({ label, k }: { label: string; k: SortKey }) => (
    <TableHead className="cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort(k)}>
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown className="h-3 w-3 opacity-40" />
      </div>
    </TableHead>
  );

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">CM & Activité</h1>
            <p className="text-muted-foreground text-sm mt-1">Console de pilotage performance des Community Managers</p>
          </div>
          <ContextMessageButton contextType="cm_performance" contextId="" contextLabel="Performance CM" />
        </div>

      <TooltipProvider delayDuration={150}>
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          <KPICard icon={Users} label="Total CM" value={totalCM} tooltip={KPI_TOOLTIPS.total_cm} />
          <KPICard icon={UserCheck} label="Actifs aujourd'hui" value={activesToday} alert={activesToday < totalCM * 0.5} tooltip={KPI_TOOLTIPS.active_today} />
          <KPICard icon={AlertTriangle} label="Surchargés" value={overloaded} alert={overloaded > 0} tooltip={KPI_TOOLTIPS.overloaded} />
          <KPICard icon={Clock} label="Délai moy. validation" value={avgDelay} suffix="h" alert={avgDelay > 36} tooltip={KPI_TOOLTIPS.avg_delay} />
          <KPICard icon={XCircle} label="Taux refus global" value={globalRefusal} suffix="%" alert={globalRefusal > 20} tooltip={KPI_TOOLTIPS.refusal_rate} />
          <KPICard icon={Zap} label="Temps moy. traitement" value={avgProcessing} suffix="h" alert={Number(avgProcessing) > 5} tooltip={KPI_TOOLTIPS.avg_processing} />
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-destructive" />
                Alertes CM
                <Badge variant="outline" className="ml-auto text-xs">{alerts.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {alerts.map((a, i) => <AlertRow key={i} item={a} tooltip={findAlertTooltip(a.message)} />)}
            </CardContent>
          </Card>
        )}
      </TooltipProvider>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher un CM…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>
          <Select value={chargeFilter} onValueChange={setChargeFilter}>
            <SelectTrigger className="w-[160px] h-9"><SelectValue placeholder="Charge" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes charges</SelectItem>
              <SelectItem value="faible">Faible</SelectItem>
              <SelectItem value="normale">Normale</SelectItem>
              <SelectItem value="élevée">Élevée</SelectItem>
              <SelectItem value="surchargé">Surchargé</SelectItem>
            </SelectContent>
          </Select>
          <Select value={perfFilter} onValueChange={setPerfFilter}>
            <SelectTrigger className="w-[170px] h-9"><SelectValue placeholder="Performance" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes performances</SelectItem>
              <SelectItem value="excellent">Excellent (&gt; 80%)</SelectItem>
              <SelectItem value="correct">Correct (60-80%)</SelectItem>
              <SelectItem value="faible">Faible (&lt; 60%)</SelectItem>
            </SelectContent>
          </Select>
          {(search || chargeFilter !== "all" || perfFilter !== "all") && (
            <button onClick={() => { setSearch(""); setChargeFilter("all"); setPerfFilter("all"); }} className="text-xs text-muted-foreground hover:text-foreground underline">
              Réinitialiser
            </button>
          )}
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHead label="Nom CM" k="name" />
                  <SortableHead label="Cabinets" k="firms" />
                  <SortableHead label="En attente" k="pendingPosts" />
                  <SortableHead label="Publiés 30j" k="publishedPosts30d" />
                  <SortableHead label="Validation" k="validationRate" />
                  <SortableHead label="Refus" k="refusalRate" />
                  <SortableHead label="Délai moy." k="avgDelay" />
                  <TableHead>Charge</TableHead>
                  <SortableHead label="Dernière activité" k="lastActivity" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(cm => {
                  const charge = getCharge(cm.firms);
                  const inactive48 = (NOW.getTime() - cm.lastActivity.getTime()) > 48 * 3600000;
                  return (
                    <TableRow key={cm.id} className={inactive48 ? "bg-red-50/40" : ""}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                            {cm.avatar}
                          </div>
                          <span className="font-medium text-sm">{cm.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="tabular-nums">{cm.firms}</TableCell>
                      <TableCell>
                        <span className={`tabular-nums ${cm.pendingPosts > 10 ? "text-destructive font-medium" : ""}`}>{cm.pendingPosts}</span>
                      </TableCell>
                      <TableCell className="tabular-nums">{cm.publishedPosts30d}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs font-medium ${perfBadge(cm.validationRate)}`}>
                          {cm.validationRate}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs font-medium ${cm.refusalRate > 25 ? "bg-red-50 text-red-700 border-red-200" : cm.refusalRate > 15 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
                          {cm.refusalRate}%
                        </Badge>
                      </TableCell>
                      <TableCell className="tabular-nums text-sm">{cm.avgDelay}h</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs font-medium capitalize ${chargeBadge(charge)}`}>
                          {charge}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs ${inactive48 ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                          {inactive48 && <TrendingDown className="h-3 w-3 inline mr-1" />}
                          il y a {relativeTime(cm.lastActivity)}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      Aucun CM ne correspond aux filtres sélectionnés.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Activité mensuelle par CM</CardTitle>
            <p className="text-xs text-muted-foreground">Posts traités par semaine — 4 dernières semaines</p>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <BarChart data={chartData} barGap={2} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={30} />
                <ChartTooltip content={<ChartTooltipContent />} />
                {cms.map((c, i) => (
                  <Bar key={c.id} dataKey={c.name} fill={chartConfig[c.name]?.color} radius={[3, 3, 0, 0]} maxBarSize={18} />
                ))}
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
