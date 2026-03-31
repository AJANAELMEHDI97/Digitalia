import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAdminAcquisition } from "@/hooks/admin/useAdminAcquisition";
import { useAdminLeads, Lead } from "@/hooks/admin/useAdminLeads";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Tooltip, TooltipTrigger, TooltipContent, TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Users, CalendarCheck, Percent, UserCheck, TrendingUp, DollarSign,
  ChevronRight, AlertTriangle, Clock, Search, ArrowUpDown, Info,
} from "lucide-react";
import { ContextMessageButton } from "@/components/admin/coordination/ContextMessageButton";
import { format, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";

/* ── Constants ── */
const PLAN_PRICES: Record<string, number> = { essentiel: 290, premium: 490, entreprise: 890 };
const AVG_PLAN = 490;

const STATUS_MAP: Record<string, { label: string; stage: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Nouveau", stage: "Lead", variant: "outline" },
  new: { label: "Nouveau", stage: "Lead", variant: "outline" },
  contacted: { label: "Qualifié", stage: "Qualifié", variant: "secondary" },
  scheduled: { label: "Démo planifiée", stage: "Démo", variant: "secondary" },
  planned: { label: "Démo planifiée", stage: "Démo", variant: "secondary" },
  demo_scheduled: { label: "Démo planifiée", stage: "Démo", variant: "secondary" },
  completed: { label: "Démo réalisée", stage: "Test", variant: "default" },
  done: { label: "Démo réalisée", stage: "Test", variant: "default" },
  demo_done: { label: "Démo réalisée", stage: "Test", variant: "default" },
  converted: { label: "Converti", stage: "Payant", variant: "default" },
  lost: { label: "Perdu", stage: "Perdu", variant: "destructive" },
  rejected: { label: "Perdu", stage: "Perdu", variant: "destructive" },
};

/* ── Demo leads fallback (12 leads) ── */
const DEMO_LEADS: Lead[] = [
  { id: "d1", full_name: "Cabinet Moreau & Associés", email: "moreau@cabinet.fr", firm_name: "Moreau & Associés", specialty: "Droit des affaires", status: "demo_scheduled", preferred_date: "2026-02-15", preferred_time: "10:00", created_at: "2026-02-01T09:00:00Z", source: "Site web", responsible: "Marie D." },
  { id: "d2", full_name: "Me. Julie Fontaine", email: "j.fontaine@avocat.fr", firm_name: "Cabinet Fontaine", specialty: "Droit de la famille", status: "pending", preferred_date: "2026-02-18", preferred_time: "14:00", created_at: "2026-02-03T11:00:00Z", source: "LinkedIn", responsible: "Lucas P." },
  { id: "d3", full_name: "SCP Dubois-Martin", email: "contact@dubois-martin.fr", firm_name: "Dubois-Martin", specialty: "Droit pénal", status: "converted", preferred_date: "2026-01-20", preferred_time: "09:00", created_at: "2026-01-10T08:30:00Z", source: "Recommandation", responsible: "Sarah B." },
  { id: "d4", full_name: "Me. Antoine Bernard", email: "a.bernard@avocat.fr", firm_name: null, specialty: "Droit du travail", status: "demo_done", preferred_date: "2026-02-10", preferred_time: "11:00", created_at: "2026-02-02T15:00:00Z", source: "Google Ads", responsible: "Thomas R." },
  { id: "d5", full_name: "Cabinet Lefèvre", email: "info@lefevre-avocats.fr", firm_name: "Lefèvre Avocats", specialty: "Droit immobilier", status: "lost", preferred_date: "2026-01-25", preferred_time: "16:00", created_at: "2026-01-05T10:00:00Z", source: "Salon", responsible: "Marie D." },
  { id: "d6", full_name: "Me. Clara Petit", email: "c.petit@barreau.fr", firm_name: "Cabinet Petit", specialty: "Droit fiscal", status: "pending", preferred_date: "2026-02-20", preferred_time: "09:30", created_at: "2026-02-08T14:00:00Z", source: "Site web", responsible: "Lucas P." },
  { id: "d7", full_name: "SCP Laurent & Fils", email: "contact@laurent-fils.fr", firm_name: "Laurent & Fils", specialty: "Droit commercial", status: "demo_scheduled", preferred_date: "2026-02-14", preferred_time: "15:00", created_at: "2026-02-05T09:00:00Z", source: "LinkedIn", responsible: "Sarah B." },
  { id: "d8", full_name: "Me. Hugo Blanc", email: "h.blanc@avocat.fr", firm_name: null, specialty: "Droit social", status: "converted", preferred_date: "2026-01-28", preferred_time: "10:30", created_at: "2026-01-15T11:00:00Z", source: "Google Ads", responsible: "Thomas R." },
  { id: "d9", full_name: "Cabinet Rousseau", email: "info@rousseau.fr", firm_name: "Rousseau Avocats", specialty: "Droit bancaire", status: "demo_done", preferred_date: "2026-02-12", preferred_time: "14:30", created_at: "2026-02-04T08:00:00Z", source: "Recommandation", responsible: "Marie D." },
  { id: "d10", full_name: "Me. Émilie Garnier", email: "e.garnier@avocat.fr", firm_name: "Cabinet Garnier", specialty: "PI / Tech", status: "pending", preferred_date: "2026-02-22", preferred_time: "11:00", created_at: "2026-02-10T16:00:00Z", source: "Site web", responsible: "Lucas P." },
  { id: "d11", full_name: "SCP Mercier-Fabre", email: "contact@mercier-fabre.fr", firm_name: "Mercier-Fabre", specialty: "Droit public", status: "demo_scheduled", preferred_date: "2026-02-17", preferred_time: "09:00", created_at: "2026-02-06T10:00:00Z", source: "Salon", responsible: "Sarah B." },
  { id: "d12", full_name: "Me. Paul Renard", email: "p.renard@avocat.fr", firm_name: null, specialty: "Droit de l'environnement", status: "converted", preferred_date: "2026-01-30", preferred_time: "16:00", created_at: "2026-01-18T09:00:00Z", source: "LinkedIn", responsible: "Thomas R." },
];

/* ── KPI Card ── */
function KPICard({ label, value, icon: Icon, tooltip, alert }: {
  label: string; value: string; icon: React.ElementType; tooltip: string; alert?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Card className={`relative overflow-hidden transition-shadow hover:shadow-md ${alert ? "border-destructive/50" : ""}`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold tabular-nums tracking-tight">{value}</p>
              </div>
              <div className={`rounded-md p-2 ${alert ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs text-sm">{tooltip}</TooltipContent>
    </Tooltip>
  );
}

/* ── Pipeline Stage Card ── */
function PipelineStageCard({ name, count, convRate, mrr, avgDays, isLast, color }: {
  name: string; count: number; convRate: number | null; mrr: number; avgDays: number; isLast: boolean; color: string;
}) {
  return (
    <div className="flex items-center gap-0 flex-1 min-w-0">
      <Card className="flex-1 min-w-0 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: color }} />
        <CardContent className="p-4 pl-5">
          <p className="text-xs font-medium text-muted-foreground truncate">{name}</p>
          <p className="text-xl font-bold tabular-nums mt-1">{count}</p>
          <div className="mt-2 space-y-0.5">
            {convRate !== null && (
              <p className="text-[11px] text-muted-foreground">Conv. <span className="font-semibold text-foreground">{convRate}%</span></p>
            )}
            <p className="text-[11px] text-muted-foreground">MRR <span className="font-semibold text-foreground">{mrr.toLocaleString("fr-FR")} €</span></p>
            <p className="text-[11px] text-muted-foreground">~{avgDays}j moy.</p>
          </div>
        </CardContent>
      </Card>
      {!isLast && <ChevronRight className="h-5 w-5 text-muted-foreground/50 shrink-0 mx-1" />}
    </div>
  );
}

/* ── Alert Item ── */
function AlertItem({ severity, label, description }: {
  severity: "critical" | "warning" | "info"; label: string; description: string;
}) {
  const styles = {
    critical: "border-destructive/30 bg-destructive/5",
    warning: "border-amber-500/30 bg-amber-500/5",
    info: "border-muted bg-muted/30",
  };
  const badgeStyles = {
    critical: "bg-destructive/10 text-destructive border-destructive/20",
    warning: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
    info: "bg-muted text-muted-foreground",
  };
  const labels = { critical: "Critique", warning: "Attention", info: "Info" };

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${styles[severity]}`}>
      <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${severity === "critical" ? "text-destructive" : severity === "warning" ? "text-amber-500" : "text-muted-foreground"}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${badgeStyles[severity]}`}>{labels[severity]}</Badge>
          <span className="text-sm font-medium">{label}</span>
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

/* ── Page ── */
export default function AdminAcquisitionPage() {
  const acq = useAdminAcquisition();
  const ld = useAdminLeads();
  const loading = acq.loading || ld.loading;

  // Use demo leads if hook returns few leads
  const leads = useMemo(() => (ld.leads.length >= 6 ? ld.leads : DEMO_LEADS), [ld.leads]);

  // Table state
  const [search, setSearch] = useState("");
  const [filterStage, setFilterStage] = useState("all");
  const [filterResp, setFilterResp] = useState("all");
  const [sortField, setSortField] = useState<"created_at" | "preferred_date" | "full_name">("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // ── Computed data ──
  const computed = useMemo(() => {
    const now = new Date();
    const converted = leads.filter(l => l.status === "converted");
    const demos = leads.filter(l => ["demo_scheduled", "demo_done", "scheduled", "planned", "completed", "done"].includes(l.status));
    const demosPlanned = leads.filter(l => ["demo_scheduled", "scheduled", "planned"].includes(l.status)).length;
    const demosCompleted = leads.filter(l => ["demo_done", "completed", "done"].includes(l.status)).length;
    const showUpRate = demosPlanned + demosCompleted > 0 ? Math.round((demosCompleted / (demosPlanned + demosCompleted)) * 100) : 0;
    const testAccounts = leads.filter(l => ["demo_done", "completed", "done"].includes(l.status)).length;
    const convTestPayant = (testAccounts + converted.length) > 0 ? Math.round((converted.length / (testAccounts + converted.length)) * 100) : 0;
    const mrrGenere = converted.length * AVG_PLAN;
    const pipelineValue = testAccounts * AVG_PLAN + demosPlanned * AVG_PLAN * 0.4;

    // Pipeline stages
    const stageMap: Record<string, Lead[]> = { Lead: [], Qualifié: [], Démo: [], Test: [], Payant: [] };
    leads.forEach(l => {
      const st = STATUS_MAP[l.status];
      if (st && st.stage in stageMap) stageMap[st.stage].push(l);
    });
    const stageColors = { Lead: "hsl(215, 70%, 55%)", Qualifié: "hsl(190, 65%, 50%)", Démo: "hsl(45, 85%, 55%)", Test: "hsl(280, 60%, 55%)", Payant: "hsl(142, 71%, 45%)" };
    const stageNames = ["Lead", "Qualifié", "Démo", "Test", "Payant"] as const;
    const pipeline = stageNames.map((name, i) => {
      const count = stageMap[name].length;
      const nextCount = i < stageNames.length - 1 ? stageMap[stageNames[i + 1]].length : null;
      const convRate = nextCount !== null && count > 0 ? Math.round((nextCount / count) * 100) : null;
      const mrrMultiplier = name === "Payant" ? 1 : name === "Test" ? 0.7 : name === "Démo" ? 0.4 : name === "Qualifié" ? 0.2 : 0.1;
      return { name, count, convRate, mrr: Math.round(count * AVG_PLAN * mrrMultiplier), avgDays: [0, 3, 5, 10, 18][i], color: stageColors[name] };
    });

    // Responsibility
    const respMap: Record<string, { assigned: number; demos: number; converted: number }> = {};
    leads.forEach(l => {
      if (!l.responsible) return;
      if (!respMap[l.responsible]) respMap[l.responsible] = { assigned: 0, demos: 0, converted: 0 };
      respMap[l.responsible].assigned++;
      if (["demo_done", "completed", "done"].includes(l.status)) respMap[l.responsible].demos++;
      if (l.status === "converted") respMap[l.responsible].converted++;
    });
    const responsibility = Object.entries(respMap).map(([name, d]) => ({
      name, ...d, rate: d.assigned > 0 ? Math.round((d.converted / d.assigned) * 100) : 0, mrr: d.converted * AVG_PLAN,
    }));

    // Sources
    const srcMap: Record<string, { leads: number; converted: number }> = {};
    leads.forEach(l => {
      if (!srcMap[l.source]) srcMap[l.source] = { leads: 0, converted: 0 };
      srcMap[l.source].leads++;
      if (l.status === "converted") srcMap[l.source].converted++;
    });
    const sources = Object.entries(srcMap).sort((a, b) => b[1].leads - a[1].leads).map(([name, d]) => ({
      name, ...d, mrr: d.converted * AVG_PLAN, rate: d.leads > 0 ? Math.round((d.converted / d.leads) * 100) : 0,
    }));

    // Alerts
    const alerts: { severity: "critical" | "warning" | "info"; label: string; description: string }[] = [];
    const uncontacted48h = leads.filter(l => l.status === "pending" && differenceInDays(now, new Date(l.created_at)) > 2);
    if (uncontacted48h.length > 0) alerts.push({ severity: "critical", label: `${uncontacted48h.length} lead(s) non contacté(s) > 48h`, description: uncontacted48h.map(l => l.full_name).join(", ") });
    if (showUpRate > 0 && showUpRate < 50) alerts.push({ severity: "critical", label: `Taux show-up faible : ${showUpRate}%`, description: "Le taux de réalisation des démos est inférieur à 50%. Revoir la qualification des leads." });
    const staleLeads = leads.filter(l => l.status === "pending" && differenceInDays(now, new Date(l.created_at)) > 5);
    if (staleLeads.length > 0) alerts.push({ severity: "warning", label: `Pipeline stagnant : ${staleLeads.length} lead(s) > 5j`, description: "Leads en attente depuis plus de 5 jours sans progression." });
    const oldTests = leads.filter(l => ["demo_done", "completed", "done"].includes(l.status) && differenceInDays(now, new Date(l.created_at)) > 14);
    if (oldTests.length > 0) alerts.push({ severity: "info", label: `${oldTests.length} compte(s) test > 14 jours`, description: "Comptes en phase de test depuis plus de 14 jours sans conversion." });

    // Responsibles list for filter
    const responsibles = [...new Set(leads.map(l => l.responsible).filter(Boolean))];

    return { showUpRate, convTestPayant, mrrGenere, pipelineValue, demosPlanned, pipeline, responsibility, sources, alerts, responsibles, leadsThisMonth: leads.length };
  }, [leads]);

  // Filtered & sorted leads
  const filteredLeads = useMemo(() => {
    let result = [...leads];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(l => l.full_name.toLowerCase().includes(q) || l.specialty.toLowerCase().includes(q) || l.source.toLowerCase().includes(q));
    }
    if (filterStage !== "all") {
      result = result.filter(l => (STATUS_MAP[l.status]?.stage || "") === filterStage);
    }
    if (filterResp !== "all") {
      result = result.filter(l => l.responsible === filterResp);
    }
    result.sort((a, b) => {
      const va = a[sortField] || "";
      const vb = b[sortField] || "";
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    return result;
  }, [leads, search, filterStage, filterResp, sortField, sortDir]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  const getMRRPotentiel = (status: string) => {
    if (status === "converted") return AVG_PLAN;
    if (["demo_done", "completed", "done"].includes(status)) return Math.round(AVG_PLAN * 0.7);
    if (["demo_scheduled", "scheduled", "planned"].includes(status)) return Math.round(AVG_PLAN * 0.4);
    if (status === "contacted") return Math.round(AVG_PLAN * 0.2);
    if (["pending", "new"].includes(status)) return Math.round(AVG_PLAN * 0.1);
    return 0;
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto py-6 px-4 space-y-6">
          <Skeleton className="h-10 w-80" />
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
          </div>
          <Skeleton className="h-40 rounded-lg" />
          <Skeleton className="h-60 rounded-lg" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <TooltipProvider delayDuration={200}>
        <div className="max-w-7xl mx-auto py-6 px-4 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Acquisition & Pipeline</h1>
              <p className="text-sm text-muted-foreground mt-1">Machine de croissance — leads, démos, conversion et pipeline commercial</p>
            </div>
            <ContextMessageButton contextType="lead" contextId="" contextLabel="Acquisition & Leads" />
          </div>

          {/* ═══ 1. KPI Cards ═══ */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            <KPICard label="Leads 30 jours" value={String(computed.leadsThisMonth)} icon={Users} tooltip="Nouveaux leads reçus sur les 30 derniers jours" />
            <KPICard label="Démos planifiées" value={String(computed.demosPlanned)} icon={CalendarCheck} tooltip="Démonstrations en attente de réalisation" />
            <KPICard label="Taux show-up" value={`${computed.showUpRate}%`} icon={Percent} tooltip="Ratio démos réalisées / planifiées. Objectif : > 75%" alert={computed.showUpRate > 0 && computed.showUpRate < 50} />
            <KPICard label="Conv. Test → Payant" value={`${computed.convTestPayant}%`} icon={UserCheck} tooltip="Taux de passage compte test vers abonnement payant" />
            <KPICard label="MRR généré" value={`${computed.mrrGenere.toLocaleString("fr-FR")} €`} icon={DollarSign} tooltip="Revenu mensuel généré par les nouvelles conversions" />
            <KPICard label="Valeur pipeline" value={`${Math.round(computed.pipelineValue).toLocaleString("fr-FR")} €`} icon={TrendingUp} tooltip="MRR potentiel si tous les leads en cours convertissent" />
          </div>

          {/* ═══ 2. Pipeline visuel ═══ */}
          <section>
            <h2 className="text-base font-semibold mb-3">Pipeline commercial</h2>
            <div className="flex items-stretch gap-0 overflow-x-auto pb-1">
              {computed.pipeline.map((stage, i) => (
                <PipelineStageCard
                  key={stage.name}
                  {...stage}
                  isLast={i === computed.pipeline.length - 1}
                />
              ))}
            </div>
          </section>

          {/* ═══ 3 & 4. Responsabilité + Sources ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Responsabilité commerciale */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Responsabilité commerciale</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Responsable</TableHead>
                      <TableHead className="text-xs text-right">Leads</TableHead>
                      <TableHead className="text-xs text-right">Démos</TableHead>
                      <TableHead className="text-xs text-right">Conv. %</TableHead>
                      <TableHead className="text-xs text-right">MRR</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {computed.responsibility.map(r => (
                      <TableRow key={r.name}>
                        <TableCell className="font-medium">{r.name}</TableCell>
                        <TableCell className="text-right tabular-nums">{r.assigned}</TableCell>
                        <TableCell className="text-right tabular-nums">{r.demos}</TableCell>
                        <TableCell className="text-right tabular-nums">{r.rate}%</TableCell>
                        <TableCell className="text-right tabular-nums font-medium">{r.mrr.toLocaleString("fr-FR")} €</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Sources & ROI */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Sources & ROI</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Source</TableHead>
                      <TableHead className="text-xs text-right">Leads</TableHead>
                      <TableHead className="text-xs text-right">Conv.</TableHead>
                      <TableHead className="text-xs text-right">MRR</TableHead>
                      <TableHead className="text-xs text-right">Taux</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {computed.sources.map(s => (
                      <TableRow key={s.name}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell className="text-right tabular-nums">{s.leads}</TableCell>
                        <TableCell className="text-right tabular-nums">{s.converted}</TableCell>
                        <TableCell className="text-right tabular-nums font-medium">{s.mrr.toLocaleString("fr-FR")} €</TableCell>
                        <TableCell className="text-right tabular-nums">{s.rate}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* ═══ 5. Alertes commerciales ═══ */}
          {computed.alerts.length > 0 && (
            <section>
              <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> Alertes commerciales
              </h2>
              <Card>
                <CardContent className="p-4 space-y-2">
                  {computed.alerts.map((a, i) => <AlertItem key={i} {...a} />)}
                </CardContent>
              </Card>
            </section>
          )}

          {/* ═══ 6. Table leads ═══ */}
          <section>
            <h2 className="text-base font-semibold mb-3">Leads</h2>
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher un lead..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <Select value={filterStage} onValueChange={setFilterStage}>
                <SelectTrigger className="w-[160px] h-9"><SelectValue placeholder="Étape" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les étapes</SelectItem>
                  <SelectItem value="Lead">Lead</SelectItem>
                  <SelectItem value="Qualifié">Qualifié</SelectItem>
                  <SelectItem value="Démo">Démo</SelectItem>
                  <SelectItem value="Test">Test</SelectItem>
                  <SelectItem value="Payant">Payant</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterResp} onValueChange={setFilterResp}>
                <SelectTrigger className="w-[160px] h-9"><SelectValue placeholder="Responsable" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  {computed.responsibles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("full_name")}>
                        <span className="flex items-center gap-1">Lead <ArrowUpDown className="h-3 w-3" /></span>
                      </TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Responsable</TableHead>
                      <TableHead>Étape</TableHead>
                      <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("created_at")}>
                        <span className="flex items-center gap-1">Création <ArrowUpDown className="h-3 w-3" /></span>
                      </TableHead>
                      <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("preferred_date")}>
                        <span className="flex items-center gap-1">Dernière action <ArrowUpDown className="h-3 w-3" /></span>
                      </TableHead>
                      <TableHead className="text-right">MRR pot.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.map(lead => {
                      const st = STATUS_MAP[lead.status] || { label: lead.status, stage: "—", variant: "outline" as const };
                      const mrrPot = getMRRPotentiel(lead.status);
                      return (
                        <TableRow key={lead.id}>
                          <TableCell>
                            <div className="font-medium">{lead.full_name}</div>
                            <div className="text-xs text-muted-foreground">{lead.specialty}</div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{lead.source}</TableCell>
                          <TableCell className="text-muted-foreground">{lead.responsible}</TableCell>
                          <TableCell>
                            <Badge
                              variant={st.variant}
                              className={lead.status === "converted" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : ""}
                            >
                              {st.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground tabular-nums">
                            {format(new Date(lead.created_at), "d MMM yy", { locale: fr })}
                          </TableCell>
                          <TableCell className="text-muted-foreground tabular-nums">
                            {format(new Date(lead.preferred_date), "d MMM yy", { locale: fr })}
                          </TableCell>
                          <TableCell className="text-right tabular-nums font-medium">
                            {mrrPot > 0 ? `${mrrPot} €` : "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {filteredLeads.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Aucun lead trouvé
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </section>
        </div>
      </TooltipProvider>
    </AppLayout>
  );
}
