import { AppLayout } from "@/components/layout/AppLayout";
import { useSimpleRole } from "@/hooks/useSimpleRole";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  FileText, Clock, CheckCircle2, XCircle, AlertTriangle, TrendingUp,
  BarChart3, Filter, RotateCcw, ShieldAlert, Info, Eye
} from "lucide-react";
import { Tooltip as UITooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

// ─── Tooltip dictionaries ────────────────────────────────────
const KPI_TOOLTIPS: Record<string, string> = {
  total: "Nombre total de publications créées sur les 30 derniers jours, tous statuts confondus.",
  pending: "Publications soumises à l'avocat mais pas encore validées ni refusées. Un chiffre élevé indique un goulot de validation.",
  validated: "Publications approuvées par l'avocat, prêtes à être publiées ou déjà publiées.",
  refused: "Publications refusées par l'avocat. Un nombre élevé peut indiquer un problème de qualité ou d'alignement éditorial.",
  delay: "Temps moyen écoulé entre la soumission à l'avocat et la décision (validation ou refus). Au-delà de 48h, un suivi est recommandé.",
  refusalRate: "Pourcentage de publications refusées par rapport au total des décisions. Au-dessus de 15%, une analyse qualitative est nécessaire.",
};

const ALERT_TOOLTIPS: Record<string, string> = {
  "Publications en attente > 48h": "Ces publications attendent une décision depuis plus de 2 jours. Risque de dépassement de SLA et de retard de publication.",
  "Taux de refus élevé": "Le taux de refus dépasse 20%. Vérifiez l'alignement entre les contenus proposés et les attentes des avocats.",
  "Contenus urgents non traités": "Publications marquées comme urgentes qui n'ont pas encore été validées ou publiées. Elles nécessitent une action prioritaire.",
  "Délai moyen élevé": "Le délai de validation moyen dépasse 36h. Cela peut impacter la réactivité éditoriale et la pertinence des contenus.",
  "Publications sans titre": "Publications sans titre défini, ce qui complique le suivi et la recherche. À corriger pour une meilleure organisation.",
  "Brouillons > 7 jours": "Brouillons non soumis depuis plus d'une semaine. Ils encombrent le pipeline et méritent d'être finalisés ou archivés.",
};
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, Cell } from "recharts";

// ─── Types ───────────────────────────────────────────────────
interface EnrichedPublication {
  id: string;
  title: string | null;
  content: string;
  platform: string | null;
  validation_status: string | null;
  status: string;
  scheduled_date: string;
  created_at: string;
  submitted_at: string | null;
  urgency: string | null;
  law_firm_id: string | null;
  firm_name: string;
  cm_name: string;
}

// ─── Status config ───────────────────────────────────────────
const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Brouillon", variant: "secondary" },
  submitted_to_lawyer: { label: "En attente", variant: "outline" },
  in_lawyer_review: { label: "En revue", variant: "outline" },
  validated: { label: "Validée", variant: "default" },
  published: { label: "Publiée", variant: "default" },
  refused: { label: "Refusée", variant: "destructive" },
  cm_review: { label: "Retour CM", variant: "outline" },
};

// ─── Demo data ───────────────────────────────────────────────
const DEMO_FIRMS = ["Cabinet Durand & Associés", "SCP Martin-Lefebvre", "Cabinet Rousseau", "AARPI Fontaine", "Cabinet Bernard"];
const DEMO_CMS = ["Camille Lefebvre", "Maxime Dupuis", "Léa Martin", "Antoine Bernard", "Clara Rousseau"];
const DEMO_STATUSES: string[] = ["draft", "submitted_to_lawyer", "in_lawyer_review", "validated", "published", "refused", "cm_review"];
const DEMO_PLATFORMS = ["linkedin", "instagram", "facebook", "twitter", "blog"];
const DEMO_TITLES = [
  "Réforme du droit du travail : impacts pour les entreprises",
  "RGPD : les nouvelles obligations 2025",
  "Droit de la famille : évolutions jurisprudentielles",
  "Cybersécurité et responsabilité des dirigeants",
  "Intelligence artificielle et propriété intellectuelle",
  "Fiscalité des entreprises : actualités",
  "Droit immobilier : les pièges à éviter",
  "Protection des données personnelles",
  "Contentieux commercial : bonnes pratiques",
  "Droit social : les arrêts marquants",
  "Compliance et conformité réglementaire",
  "Médiation et modes alternatifs de résolution",
  "Droit des sociétés : restructurations",
  "Contrats internationaux : clauses essentielles",
  "Responsabilité civile professionnelle",
  "Droit pénal des affaires : tendances",
  "Propriété industrielle : brevets et marques",
  "Droit bancaire et financier",
  "Urbanisme : permis de construire",
  "Droit de l'environnement : nouvelles normes",
  "Succession et patrimoine",
  "Bail commercial : renouvellement",
  "Procédures collectives : prévention",
  "Droit du numérique : e-commerce",
  "Assurance et indemnisation",
];

function makeUUID(seed: number): string {
  const hex = seed.toString(16).padStart(8, "0");
  return `d${hex}-0000-4000-a000-000000000000`;
}

function generateDemoPublications(): EnrichedPublication[] {
  const now = Date.now();
  return DEMO_TITLES.map((title, i) => {
    const statusIdx = i % DEMO_STATUSES.length;
    const vs = DEMO_STATUSES[statusIdx];
    const daysAgo = Math.floor((i * 3.7) % 35);
    const createdAt = new Date(now - daysAgo * 86400000).toISOString();
    const isSubmitted = ["submitted_to_lawyer", "in_lawyer_review"].includes(vs);
    const submittedAt = isSubmitted
      ? new Date(now - (daysAgo - 1) * 86400000 - (i % 3 === 0 ? 60 * 60 * 1000 * 60 : 60 * 60 * 1000 * 12)).toISOString()
      : vs === "validated" || vs === "refused"
        ? new Date(now - (daysAgo + 2) * 86400000).toISOString()
        : null;

    return {
      id: makeUUID(8000 + i),
      title,
      content: `Contenu de la publication ${i + 1}`,
      platform: DEMO_PLATFORMS[i % DEMO_PLATFORMS.length],
      validation_status: vs,
      status: vs === "published" ? "publie" : "brouillon",
      scheduled_date: new Date(now + (7 - daysAgo) * 86400000).toISOString().split("T")[0],
      created_at: createdAt,
      submitted_at: submittedAt,
      urgency: i % 5 === 0 ? "urgent" : "normal",
      law_firm_id: makeUUID(9000 + (i % DEMO_FIRMS.length)),
      firm_name: DEMO_FIRMS[i % DEMO_FIRMS.length],
      cm_name: DEMO_CMS[i % DEMO_CMS.length],
    };
  });
}

// ─── Helpers ─────────────────────────────────────────────────
function hoursSince(dateStr: string | null): number {
  if (!dateStr) return 0;
  return Math.max(0, (Date.now() - new Date(dateStr).getTime()) / 3600000);
}

function formatDelay(dateStr: string | null): string {
  if (!dateStr) return "—";
  const h = hoursSince(dateStr);
  if (h < 1) return "< 1h";
  if (h < 24) return `${Math.round(h)}h`;
  const d = Math.floor(h / 24);
  const rem = Math.round(h % 24);
  return `${d}j ${rem}h`;
}

function getWeekLabel(date: Date): string {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay() + 1);
  return `${start.getDate()}/${start.getMonth() + 1}`;
}

// ─── Main Component ─────────────────────────────────────────
export default function AdminPublicationsPage() {
  const { isAdmin, loading } = useSimpleRole();

  // Filters state
  const [search, setSearch] = useState("");
  const [filterFirm, setFilterFirm] = useState("all");
  const [filterCM, setFilterCM] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  // Fetch publications with joins
  const { data: publications = [], isLoading } = useQuery({
    queryKey: ["admin-publications-supervision"],
    queryFn: async () => {
      const { data: pubs, error } = await supabase
        .from("publications")
        .select("id, title, content, platform, validation_status, status, scheduled_date, created_at, submitted_at, urgency, law_firm_id")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;

      // Fetch firm names
      const firmIds = [...new Set((pubs || []).map(p => p.law_firm_id).filter(Boolean))];
      let firmMap: Record<string, string> = {};
      if (firmIds.length > 0) {
        const { data: firms } = await supabase.from("law_firms").select("id, name").in("id", firmIds);
        firmMap = Object.fromEntries((firms || []).map(f => [f.id, f.name]));
      }

      // Fetch CM assignments
      const firmIdsForCM = firmIds.filter(Boolean);
      let cmMap: Record<string, string> = {};
      if (firmIdsForCM.length > 0) {
        const { data: assignments } = await supabase
          .from("cm_assignments")
          .select("law_firm_id, cm_user_id")
          .in("law_firm_id", firmIdsForCM)
          .eq("is_active", true);
        if (assignments && assignments.length > 0) {
          const cmIds = [...new Set(assignments.map(a => a.cm_user_id))];
          const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", cmIds);
          const profileMap = Object.fromEntries((profiles || []).map(p => [p.user_id, p.full_name || "CM"]));
          for (const a of assignments) {
            if (a.law_firm_id) cmMap[a.law_firm_id] = profileMap[a.cm_user_id] || "CM";
          }
        }
      }

      const enriched: EnrichedPublication[] = (pubs || []).map(p => ({
        ...p,
        firm_name: p.law_firm_id ? firmMap[p.law_firm_id] || "—" : "—",
        cm_name: p.law_firm_id ? cmMap[p.law_firm_id] || "—" : "—",
      }));

      // Inject demo fallback
      if (enriched.length < 10) {
        return [...enriched, ...generateDemoPublications()];
      }
      return enriched;
    },
    enabled: isAdmin,
  });

  // ─── Computed KPIs ─────────────────────────────────────────
  const kpis = useMemo(() => {
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 86400000;
    const recent = publications.filter(p => new Date(p.created_at).getTime() > thirtyDaysAgo);
    const pending = publications.filter(p => ["submitted_to_lawyer", "in_lawyer_review"].includes(p.validation_status || ""));
    const validated = publications.filter(p => ["validated", "published"].includes(p.validation_status || ""));
    const refused = publications.filter(p => p.validation_status === "refused");

    // Average delay for pending
    const pendingDelays = pending.map(p => hoursSince(p.submitted_at)).filter(h => h > 0);
    const avgDelay = pendingDelays.length > 0 ? pendingDelays.reduce((a, b) => a + b, 0) / pendingDelays.length : 0;

    const totalDecisions = validated.length + refused.length;
    const refusalRate = totalDecisions > 0 ? Math.round((refused.length / totalDecisions) * 100) : 0;

    return {
      total30d: recent.length,
      pending: pending.length,
      validated: validated.length,
      refused: refused.length,
      avgDelayHours: avgDelay,
      refusalRate,
    };
  }, [publications]);

  // ─── Editorial Alerts ──────────────────────────────────────
  const alerts = useMemo(() => {
    const items: { level: "critical" | "warning" | "info"; label: string; count: number }[] = [];
    const pending48h = publications.filter(
      p => ["submitted_to_lawyer", "in_lawyer_review"].includes(p.validation_status || "") && hoursSince(p.submitted_at) > 48
    );
    if (pending48h.length > 0) items.push({ level: "critical", label: "Publications en attente > 48h", count: pending48h.length });
    if (kpis.refusalRate > 20) items.push({ level: "critical", label: `Taux de refus élevé (${kpis.refusalRate}%)`, count: kpis.refused });

    const urgent = publications.filter(p => p.urgency === "urgent" && !["validated", "published"].includes(p.validation_status || ""));
    if (urgent.length > 0) items.push({ level: "warning", label: "Contenus urgents non traités", count: urgent.length });
    if (kpis.avgDelayHours > 36) items.push({ level: "warning", label: `Délai moyen élevé (${Math.round(kpis.avgDelayHours)}h)`, count: kpis.pending });

    const noTitle = publications.filter(p => !p.title);
    if (noTitle.length > 0) items.push({ level: "info", label: "Publications sans titre", count: noTitle.length });
    const oldDrafts = publications.filter(p => p.validation_status === "draft" && hoursSince(p.created_at) > 168);
    if (oldDrafts.length > 0) items.push({ level: "info", label: "Brouillons > 7 jours", count: oldDrafts.length });

    return items;
  }, [publications, kpis]);

  // ─── Chart Data ────────────────────────────────────────────
  const weeklyData = useMemo(() => {
    const weeks: Record<string, number> = {};
    const now = new Date();
    for (let i = 3; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      weeks[getWeekLabel(d)] = 0;
    }
    publications.forEach(p => {
      const d = new Date(p.created_at);
      if (Date.now() - d.getTime() < 28 * 86400000) {
        const wk = getWeekLabel(d);
        if (wk in weeks) weeks[wk]++;
      }
    });
    return Object.entries(weeks).map(([name, count]) => ({ name, count }));
  }, [publications]);

  const validationChartData = useMemo(() => {
    return [
      { name: "Validées", count: kpis.validated, fill: "hsl(142, 71%, 45%)" },
      { name: "Refusées", count: kpis.refused, fill: "hsl(0, 72%, 51%)" },
      { name: "En attente", count: kpis.pending, fill: "hsl(45, 93%, 47%)" },
    ];
  }, [kpis]);

  // ─── Filtered List ─────────────────────────────────────────
  const firms = useMemo(() => [...new Set(publications.map(p => p.firm_name).filter(n => n !== "—"))], [publications]);
  const cms = useMemo(() => [...new Set(publications.map(p => p.cm_name).filter(n => n !== "—"))], [publications]);

  const filtered = useMemo(() => {
    return publications.filter(p => {
      if (search && !(p.title || "").toLowerCase().includes(search.toLowerCase())) return false;
      if (filterFirm !== "all" && p.firm_name !== filterFirm) return false;
      if (filterCM !== "all" && p.cm_name !== filterCM) return false;
      if (filterStatus !== "all" && p.validation_status !== filterStatus) return false;
      if (filterPriority !== "all" && (p.urgency || "normal") !== filterPriority) return false;
      return true;
    });
  }, [publications, search, filterFirm, filterCM, filterStatus, filterPriority]);

  const hasActiveFilters = search || filterFirm !== "all" || filterCM !== "all" || filterStatus !== "all" || filterPriority !== "all";

  if (!loading && !isAdmin) return <Navigate to="/dashboard" replace />;

  const alertIcon = (level: string) => {
    if (level === "critical") return <ShieldAlert className="h-4 w-4 text-destructive" />;
    if (level === "warning") return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    return <Info className="h-4 w-4 text-muted-foreground" />;
  };

  const alertBadgeVariant = (level: string): "destructive" | "outline" | "secondary" => {
    if (level === "critical") return "destructive";
    if (level === "warning") return "outline";
    return "secondary";
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Prises de parole</h1>
          <p className="text-muted-foreground">Centre de supervision éditoriale — Vue globale en lecture seule</p>
        </div>

        {/* KPI Cards */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            <KPICard icon={FileText} label="Total (30j)" value={kpis.total30d} tooltip={KPI_TOOLTIPS.total} />
            <KPICard icon={Clock} label="En attente" value={kpis.pending} alert={kpis.pending > 5} tooltip={KPI_TOOLTIPS.pending} />
            <KPICard icon={CheckCircle2} label="Validées" value={kpis.validated} color="text-emerald-600" tooltip={KPI_TOOLTIPS.validated} />
            <KPICard icon={XCircle} label="Refusées" value={kpis.refused} alert={kpis.refused > 3} color="text-destructive" tooltip={KPI_TOOLTIPS.refused} />
            <KPICard icon={TrendingUp} label="Délai moy." value={`${Math.round(kpis.avgDelayHours)}h`} alert={kpis.avgDelayHours > 48} tooltip={KPI_TOOLTIPS.delay} />
            <KPICard icon={BarChart3} label="Taux refus" value={`${kpis.refusalRate}%`} alert={kpis.refusalRate > 15} tooltip={KPI_TOOLTIPS.refusalRate} />
          </div>
        )}

        {/* Editorial Alerts */}
        {!isLoading && alerts.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-primary" />
                Alertes éditoriales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {alerts.map((a, i) => {
                const alertKey = Object.keys(ALERT_TOOLTIPS).find(k => a.label.startsWith(k));
                const alertTooltip = alertKey ? ALERT_TOOLTIPS[alertKey] : undefined;
                const row = (
                  <div key={i} className={`flex items-center gap-3 py-1.5 border-b border-border/50 last:border-0 ${alertTooltip ? "cursor-help" : ""}`}>
                    {alertIcon(a.level)}
                    <span className="text-sm flex-1">{a.label}</span>
                    <Badge variant={alertBadgeVariant(a.level)} className="text-xs tabular-nums">{a.count}</Badge>
                  </div>
                );
                if (!alertTooltip) return row;
                return (
                  <UITooltip key={i}>
                    <TooltipTrigger asChild>{row}</TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs text-xs leading-relaxed">
                      <p>{alertTooltip}</p>
                    </TooltipContent>
                  </UITooltip>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Mini Charts */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Publications par semaine</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Validation vs Refus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={validationChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={80} />
                      <Tooltip />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                        {validationChartData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" />
                Filtres
              </CardTitle>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setSearch(""); setFilterFirm("all"); setFilterCM("all"); setFilterStatus("all"); setFilterPriority("all"); }}
                  className="text-xs gap-1"
                >
                  <RotateCcw className="h-3 w-3" /> Réinitialiser
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Input
                placeholder="Rechercher par titre…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-48 h-9 text-sm"
              />
              <Select value={filterFirm} onValueChange={setFilterFirm}>
                <SelectTrigger className="w-44 h-9 text-sm"><SelectValue placeholder="Cabinet" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les cabinets</SelectItem>
                  {firms.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterCM} onValueChange={setFilterCM}>
                <SelectTrigger className="w-40 h-9 text-sm"><SelectValue placeholder="CM" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les CM</SelectItem>
                  {cms.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40 h-9 text-sm"><SelectValue placeholder="Statut" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  {Object.entries(statusConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-36 h-9 text-sm"><SelectValue placeholder="Priorité" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Enriched Listing */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Eye className="h-4 w-4 text-primary" />
                  Publications
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  {filtered.length} résultat{filtered.length > 1 ? "s" : ""} — lecture seule
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Titre</TableHead>
                      <TableHead>Cabinet</TableHead>
                      <TableHead>CM</TableHead>
                      <TableHead>Plateforme</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Priorité</TableHead>
                      <TableHead>Délai</TableHead>
                      <TableHead>Date prévue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(pub => {
                      const st = statusConfig[pub.validation_status || "draft"] || statusConfig.draft;
                      const isPending = ["submitted_to_lawyer", "in_lawyer_review"].includes(pub.validation_status || "");
                      return (
                        <TableRow key={pub.id}>
                          <TableCell className="font-medium max-w-[250px] truncate">{pub.title || "Sans titre"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{pub.firm_name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{pub.cm_name}</TableCell>
                          <TableCell>
                            {pub.platform ? (
                              <Badge variant="secondary" className="text-xs capitalize">{pub.platform}</Badge>
                            ) : "—"}
                          </TableCell>
                          <TableCell><Badge variant={st.variant}>{st.label}</Badge></TableCell>
                          <TableCell>
                            {pub.urgency === "urgent" ? (
                              <Badge variant="destructive" className="text-xs">Urgent</Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">Normal</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm tabular-nums text-muted-foreground">
                            {isPending ? formatDelay(pub.submitted_at) : "—"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {pub.scheduled_date ? new Date(pub.scheduled_date).toLocaleDateString("fr-FR") : "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          Aucune publication trouvée
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
    </AppLayout>
  );
}

// ─── KPI Card Component ──────────────────────────────────────
function KPICard({
  icon: Icon,
  label,
  value,
  alert,
  color,
  tooltip,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  alert?: boolean;
  color?: string;
  tooltip?: string;
}) {
  const card = (
    <Card className={`relative overflow-hidden ${alert ? "border-destructive/30" : ""} ${tooltip ? "cursor-help" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon className={`h-4 w-4 ${color || "text-muted-foreground"}`} />
          <span className="text-xs text-muted-foreground font-medium">{label}</span>
        </div>
        <p className={`text-2xl font-bold tabular-nums ${color || "text-foreground"}`}>{value}</p>
        {alert && (
          <div className="absolute top-2 right-2">
            <span className="h-2 w-2 rounded-full bg-destructive inline-block animate-pulse" />
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (!tooltip) return card;

  return (
    <UITooltip>
      <TooltipTrigger asChild>{card}</TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs text-xs leading-relaxed">
        <p>{tooltip}</p>
      </TooltipContent>
    </UITooltip>
  );
}
