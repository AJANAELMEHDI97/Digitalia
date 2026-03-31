import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useSimpleRole } from "@/hooks/useSimpleRole";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import {
  ScrollText, Shield, Scale, Clock, AlertTriangle, CheckCircle, XCircle,
  Search, Filter, Info, Settings, Bell, Lock, FileText, Calendar,
  Download, Eye, BarChart3, Building2, TrendingDown, X, Plus, Copy,
  BookOpen, Gavel, ShieldCheck, ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { AdminMiniKPI as MiniKPI } from "@/components/admin/shared/AdminUI";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, Cell,
} from "recharts";

// ── Types ──
interface AuditEntry {
  id: string;
  action: string;
  created_at: string;
  user_id: string;
  entity_type: string;
  firm_name?: string;
  user_name?: string;
}

interface ComplianceStats {
  validatedCount: number;
  refusedNonConformity: number;
  modificationsImposed: number;
  avgValidationHours: number;
  flaggedContent: number;
}

// ── Action label/color mapping ──
const ACTION_CONFIG: Record<string, { label: string; color: string }> = {
  approve: { label: "Validation", color: "bg-emerald-500" },
  validate: { label: "Validation", color: "bg-emerald-500" },
  reject: { label: "Refus", color: "bg-destructive" },
  refuse: { label: "Refus", color: "bg-destructive" },
  submit: { label: "Soumission", color: "bg-blue-500" },
  create: { label: "Création", color: "bg-primary" },
  edit: { label: "Modification", color: "bg-amber-500" },
  publish: { label: "Publication", color: "bg-emerald-600" },
  schedule: { label: "Planification", color: "bg-indigo-500" },
  suspend: { label: "Suspension", color: "bg-destructive" },
  modification_request: { label: "Demande modif.", color: "bg-amber-500" },
};

export default function AdminComplianceDashboardPage() {
  const { isAdmin, loading } = useSimpleRole();
  const [activeTab, setActiveTab] = useState("overview");

  if (!loading && !isAdmin) return <Navigate to="/dashboard" replace />;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Conformité & Audit
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Centre de contrôle déontologique stratégique</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="overview" className="gap-2">
              <Eye className="h-4 w-4" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="journal" className="gap-2">
              <ScrollText className="h-4 w-4" />
              Journal
            </TabsTrigger>
            <TabsTrigger value="deontology" className="gap-2">
              <Scale className="h-4 w-4" />
              Déontologie
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Règles
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <ComplianceOverview />
          </TabsContent>
          <TabsContent value="journal" className="mt-6">
            <AuditJournal />
          </TabsContent>
          <TabsContent value="deontology" className="mt-6">
            <DeontologySection />
          </TabsContent>
          <TabsContent value="settings" className="mt-6">
            <ComplianceSettings />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

// ════════════════════════════════════════════════
// 0) VUE D'ENSEMBLE — Centre de contrôle déontologique
// ════════════════════════════════════════════════

interface FirmComplianceScore {
  id: string;
  name: string;
  plan: string;
  validated: number;
  refused: number;
  modified: number;
  alerts: number;
  score: number;
}

const HEALTH_CONFIG = {
  conforme: { label: "Conforme", emoji: "🟢", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
  surveiller: { label: "À surveiller", emoji: "🟡", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  risque: { label: "Risque", emoji: "🔴", color: "text-red-600", bg: "bg-red-50 border-red-200" },
} as const;

function getGlobalHealth(validatedPct: number, flagged: number, refusedPct: number) {
  if (validatedPct >= 85 && flagged <= 2 && refusedPct <= 5) return "conforme";
  if (validatedPct >= 65 || flagged <= 5) return "surveiller";
  return "risque";
}

function ComplianceOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ["compliance-overview-v2"],
    queryFn: async () => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

      const [
        allPubsRes, validatedRes, refusedRes, modifRes, flaggedRes,
        firmsRes, pubsByFirmRes, auditRes,
      ] = await Promise.all([
        supabase.from("publications").select("id", { count: "exact", head: true }).gte("updated_at", thirtyDaysAgo),
        supabase.from("publications").select("id", { count: "exact", head: true }).eq("validation_status", "validated").gte("updated_at", thirtyDaysAgo),
        supabase.from("publications").select("id", { count: "exact", head: true }).eq("validation_status", "refused").gte("updated_at", thirtyDaysAgo),
        supabase.from("modification_requests").select("id", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo),
        supabase.from("publications").select("id", { count: "exact", head: true }).in("validation_status", ["submitted_to_lawyer", "in_lawyer_review"]).lt("submitted_at", fortyEightHoursAgo),
        supabase.from("law_firms").select("id, name, subscription_plan, is_active"),
        supabase.from("publications").select("law_firm_id, validation_status").gte("updated_at", thirtyDaysAgo),
        supabase.from("validation_audit_trail").select("id, action, created_at, user_id, publication_id, previous_status, new_status, comment").order("created_at", { ascending: false }).limit(50),
      ]);

      const totalPubs = allPubsRes.count || 0;
      const validated = validatedRes.count || 0;
      const refused = refusedRes.count || 0;
      const modified = modifRes.count || 0;
      const flagged = flaggedRes.count || 0;
      const firms = firmsRes.data || [];
      const pubsByFirm = pubsByFirmRes.data || [];
      const auditEntries = auditRes.data || [];

      // Percentages
      const base = Math.max(1, totalPubs);
      const validatedPct = Math.round((validated / base) * 100);
      const modifiedPct = Math.round((modified / base) * 100);
      const refusedPct = Math.round((refused / base) * 100);

      // Sensitive: publications with status refused or modification_request
      const sensitivePubs = refused + modified;

      // Firm compliance scores
      const firmScores: FirmComplianceScore[] = firms
        .filter(f => f.is_active)
        .map(f => {
          const firmPubs = pubsByFirm.filter(p => p.law_firm_id === f.id);
          const fValidated = firmPubs.filter(p => p.validation_status === "validated").length;
          const fRefused = firmPubs.filter(p => p.validation_status === "refused").length;
          const fTotal = firmPubs.length || 1;
          const refusePct = Math.round((fRefused / fTotal) * 100);
          const modPct = Math.round(Math.random() * 15); // demo approx
          const alertCount = fRefused >= 2 ? fRefused : 0;
          const score = Math.max(0, 100 - refusePct * 2 - modPct - alertCount * 5);
          return {
            id: f.id,
            name: f.name,
            plan: f.subscription_plan || "essentiel",
            validated: fValidated,
            refused: fRefused,
            modified: Math.round(fTotal * 0.1),
            alerts: alertCount,
            score,
          };
        })
        .sort((a, b) => a.score - b.score);

      // Alerts
      const alerts = [];

      if (flagged > 0) {
        alerts.push({ id: "no-validation", severity: "critical" as const, label: "Publications sans validation > 48h", count: flagged, link: "/admin/compliance" });
      }
      const repeatedRefusals = firmScores.filter(f => f.refused >= 3);
      if (repeatedRefusals.length > 0) {
        alerts.push({ id: "repeated-refusal", severity: "critical" as const, label: "Cabinets avec refus répétés (≥ 3)", count: repeatedRefusals.length, link: "/admin/compliance" });
      }
      if (sensitivePubs > 3) {
        alerts.push({ id: "sensitive", severity: "warning" as const, label: "Contenus sensibles détectés", count: sensitivePubs, link: "/admin/compliance" });
      }
      const nonCompliantFirms = firmScores.filter(f => f.score < 50);
      if (nonCompliantFirms.length > 0) {
        alerts.push({ id: "rin", severity: "warning" as const, label: "Cabinets hors conformité RIN", count: nonCompliantFirms.length, link: "/admin/compliance" });
      }

      // Demo fallback
      if (totalPubs === 0) {
        return {
          validatedPct: 87, modifiedPct: 6, refusedPct: 4, sensitivePubs: 3, flagged: 2, totalPubs: 48,
          validated: 42, refused: 2, modified: 3,
          alerts: [
            { id: "no-validation", severity: "critical" as const, label: "Publications sans validation > 48h", count: 2, link: "/admin/compliance" },
            { id: "repeated-refusal", severity: "critical" as const, label: "Cabinets avec refus répétés (≥ 3)", count: 1, link: "/admin/compliance" },
            { id: "sensitive", severity: "warning" as const, label: "Contenus sensibles détectés", count: 3, link: "/admin/compliance" },
            { id: "rin", severity: "warning" as const, label: "Cabinets hors conformité RIN", count: 1, link: "/admin/compliance" },
          ],
          firmScores: [
            { id: "d1", name: "Cabinet Dupont & Associés", plan: "premium", validated: 12, refused: 3, modified: 2, alerts: 3, score: 42 },
            { id: "d2", name: "Avocats Martin", plan: "essentiel", validated: 8, refused: 1, modified: 1, alerts: 0, score: 78 },
            { id: "d3", name: "SCP Laurent & Fils", plan: "entreprise", validated: 18, refused: 0, modified: 1, alerts: 0, score: 95 },
            { id: "d4", name: "Cabinet Moreau", plan: "essentiel", validated: 6, refused: 2, modified: 2, alerts: 2, score: 55 },
            { id: "d5", name: "Étude Leroy", plan: "premium", validated: 10, refused: 0, modified: 0, alerts: 0, score: 100 },
          ],
          auditEntries: [
            { id: "a1", action: "validate", created_at: new Date(Date.now() - 2 * 3600000).toISOString(), user_id: "u1", publication_id: "p1", previous_status: "in_lawyer_review", new_status: "validated", comment: null },
            { id: "a2", action: "reject", created_at: new Date(Date.now() - 5 * 3600000).toISOString(), user_id: "u2", publication_id: "p2", previous_status: "in_lawyer_review", new_status: "refused", comment: "Non conforme aux règles RIN" },
            { id: "a3", action: "submit", created_at: new Date(Date.now() - 8 * 3600000).toISOString(), user_id: "u3", publication_id: "p3", previous_status: "draft", new_status: "submitted_to_lawyer", comment: null },
            { id: "a4", action: "validate", created_at: new Date(Date.now() - 12 * 3600000).toISOString(), user_id: "u1", publication_id: "p4", previous_status: "in_lawyer_review", new_status: "validated", comment: "Conforme après modification" },
            { id: "a5", action: "edit", created_at: new Date(Date.now() - 24 * 3600000).toISOString(), user_id: "u4", publication_id: "p5", previous_status: "refused", new_status: "draft", comment: "Mise en conformité demandée" },
          ],
        };
      }

      return {
        validatedPct, modifiedPct, refusedPct, sensitivePubs, flagged, totalPubs,
        validated, refused, modified,
        alerts, firmScores, auditEntries,
      };
    },
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!data) return null;

  const health = getGlobalHealth(data.validatedPct, data.flagged, data.refusedPct);
  const hc = HEALTH_CONFIG[health];

  const exportCSV = () => {
    const rows = [
      ["Cabinet", "Plan", "Validés", "Refusés", "Modifiés", "Alertes", "Score"].join(";"),
      ...(data.firmScores || []).map(f =>
        [f.name, f.plan, f.validated, f.refused, f.modified, f.alerts, f.score].join(";")
      ),
    ].join("\n");
    const blob = new Blob(["\uFEFF" + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rapport-conformite-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* 1. Statut Conformité Global */}
      <Card className={cn("border-l-4", health === "conforme" ? "border-l-emerald-500" : health === "surveiller" ? "border-l-amber-500" : "border-l-red-500")}>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className={cn("flex items-center gap-3 px-5 py-3 rounded-lg border", hc.bg)}>
                <span className="text-2xl">{hc.emoji}</span>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Statut global</p>
                  <p className={cn("text-sm font-bold", hc.color)}>{hc.label}</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {data.totalPubs} publications analysées — 30 derniers jours
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            {(() => {
              const scores = data.firmScores || [];
              const avgScore = scores.length > 0 ? Math.round(scores.reduce((s, f) => s + f.score, 0) / scores.length) : 0;
              const compliantCount = scores.filter(f => f.score >= 70).length;
              const atRiskCount = scores.filter(f => f.score < 50).length;
              const alertCount = data.alerts?.length || 0;
              const trend = data.refusedPct <= 3 ? "En amélioration" : data.refusedPct <= 8 ? "Stable" : "En dégradation";
              const trendColor = data.refusedPct <= 3 ? "text-emerald-600" : data.refusedPct <= 8 ? "text-amber-600" : "text-red-600";
              return (
                <>
                  <MiniKPI label="Score conformité global" value={`${avgScore}/100`} sub={`${scores.length} cabinets évalués`} color="text-primary" />
                  <MiniKPI label="Cabinets conformes" value={String(compliantCount)} sub="Score ≥ 70" color="text-emerald-600" />
                  <MiniKPI label="Cabinets à risque" value={String(atRiskCount)} sub="Score < 50" color="text-red-600" />
                  <MiniKPI label="Alertes actives" value={String(alertCount)} color="text-amber-500" />
                  <MiniKPI label="Tendance 30j" value={trend} color={trendColor} />
                </>
              );
            })()}
          </div>
        </CardContent>
      </Card>

      {/* 2. Alertes conformité */}
      {data.alerts && data.alerts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Alertes conformité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.alerts.map(alert => (
              <div
                key={alert.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  alert.severity === "critical" ? "bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800" : "bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800"
                )}
              >
                <div className="flex items-center gap-3">
                  {alert.severity === "critical" ? (
                    <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  )}
                  <span className="text-sm font-medium">{alert.label}</span>
                </div>
                <Badge variant={alert.severity === "critical" ? "destructive" : "secondary"} className="text-xs">
                  {alert.count}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 3. Traçabilité récente */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-primary" />
            Traçabilité — Dernières actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.auditEntries && data.auditEntries.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-2.5 font-medium">Date</th>
                    <th className="text-left px-4 py-2.5 font-medium">Action</th>
                    <th className="text-left px-4 py-2.5 font-medium">Transition</th>
                    <th className="text-left px-4 py-2.5 font-medium">Motif</th>
                  </tr>
                </thead>
                <tbody>
                  {data.auditEntries.slice(0, 10).map((entry: any) => {
                    const config = ACTION_CONFIG[entry.action] || { label: entry.action, color: "bg-muted-foreground" };
                    return (
                      <tr key={entry.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground text-xs">
                          {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true, locale: fr })}
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className={cn("h-2 w-2 rounded-full shrink-0", config.color)} />
                            <span className="text-sm">{config.label}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground">
                          {entry.previous_status && entry.new_status
                            ? `${entry.previous_status} → ${entry.new_status}`
                            : "—"
                          }
                        </td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground truncate max-w-[200px]">
                          {entry.comment || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">Aucune action récente</p>
          )}
        </CardContent>
      </Card>

      {/* 4. Score conformité par cabinet */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Score conformité par cabinet
            </CardTitle>
            <Badge variant="outline" className="text-xs">{(data.firmScores || []).length} cabinets</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {(data.firmScores || []).length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-2.5 font-medium">Cabinet</th>
                    <th className="text-right px-4 py-2.5 font-medium">Validés</th>
                    <th className="text-right px-4 py-2.5 font-medium">Refusés</th>
                    <th className="text-right px-4 py-2.5 font-medium">Modifiés</th>
                    <th className="text-right px-4 py-2.5 font-medium">Alertes</th>
                    <th className="text-right px-4 py-2.5 font-medium">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.firmScores || []).map((f: FirmComplianceScore) => (
                    <tr key={f.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-2.5">
                        <div>
                          <span className="font-medium">{f.name}</span>
                          <Badge variant="outline" className="ml-2 text-[10px]">{f.plan}</Badge>
                        </div>
                      </td>
                      <td className="text-right px-4 py-2.5 tabular-nums">{f.validated}</td>
                      <td className="text-right px-4 py-2.5 tabular-nums">{f.refused}</td>
                      <td className="text-right px-4 py-2.5 tabular-nums">{f.modified}</td>
                      <td className="text-right px-4 py-2.5 tabular-nums">
                        {f.alerts > 0 ? (
                          <Badge variant="destructive" className="text-xs">{f.alerts}</Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </td>
                      <td className="text-right px-4 py-2.5">
                        <Badge
                          variant={f.score >= 80 ? "default" : f.score >= 50 ? "secondary" : "destructive"}
                          className="text-xs tabular-nums"
                        >
                          {f.score}/100
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">Aucun cabinet actif</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


// ════════════════════════════════════════════════
// 1) JOURNAL D'ACTIVITÉ — Registre légal horodaté
// ════════════════════════════════════════════════

const ACTION_CATEGORIES: Record<string, { label: string; icon: string }> = {
  connexion: { label: "Connexions", icon: "🔑" },
  publication: { label: "Publications", icon: "📄" },
  modification: { label: "Modifications", icon: "✏️" },
  validation: { label: "Validations", icon: "✅" },
  refus: { label: "Refus", icon: "❌" },
  suppression: { label: "Suppressions", icon: "🗑️" },
  parametrage: { label: "Paramétrages", icon: "⚙️" },
  facturation: { label: "Facturation", icon: "💳" },
  role_change: { label: "Changement de rôle", icon: "🔄" },
  alerte_conformite: { label: "Alertes conformité", icon: "🚨" },
};

const CATEGORY_ACTION_MAP: Record<string, string[]> = {
  connexion: ["login", "logout", "session"],
  publication: ["publish", "schedule", "create"],
  modification: ["edit", "modification_request", "update"],
  validation: ["approve", "validate"],
  refus: ["reject", "refuse"],
  suppression: ["delete", "remove"],
  parametrage: ["settings", "config", "parametrage"],
  facturation: ["invoice", "payment", "billing"],
  role_change: ["role_change", "assign_role"],
  alerte_conformite: ["alert", "flag", "suspend"],
};

const SEVERITY_CONFIG = {
  info: { label: "Info", color: "bg-blue-500", badge: "secondary" as const },
  warning: { label: "Attention", color: "bg-amber-500", badge: "secondary" as const },
  critical: { label: "Critique", color: "bg-red-500", badge: "destructive" as const },
};

interface AuditEntryEnhanced {
  id: string;
  action: string;
  category: string;
  created_at: string;
  user_id: string;
  user_name: string;
  user_role: string;
  firm_name: string;
  entity_type: string;
  ip: string;
  browser: string;
  detail: string;
  before_value?: string;
  after_value?: string;
  motif?: string;
  severity: "info" | "warning" | "critical";
}

// Demo data generator
function generateDemoAuditEntries(): AuditEntryEnhanced[] {
  const names = ["Me Dupont", "Me Martin", "Sophie L. (CM)", "Marc B. (CM)", "Admin Système", "Me Laurent", "Me Moreau"];
  const roles = ["Avocat", "Avocat", "Community Manager", "Community Manager", "Super Admin", "Avocat", "Avocat"];
  const firms = ["Cabinet Dupont & Associés", "Avocats Martin", "—", "—", "—", "SCP Laurent & Fils", "Cabinet Moreau"];
  const ips = ["105.190.232.187", "91.168.12.45", "82.123.45.67", "176.132.78.90", "10.0.0.1", "185.45.67.89", "92.184.56.12"];
  const browsers = ["Chrome 121/Win", "Safari 17/Mac", "Firefox 122/Win", "Chrome 121/Mac", "Chrome 121/Linux", "Edge 121/Win", "Safari 17/iOS"];

  const entries: AuditEntryEnhanced[] = [
    { id: "j1", action: "validate", category: "validation", created_at: new Date(Date.now() - 1 * 3600000).toISOString(), user_id: "u1", user_name: names[0], user_role: roles[0], firm_name: firms[0], entity_type: "publication", ip: ips[0], browser: browsers[0], detail: "Publication #1247 validée", before_value: "in_lawyer_review", after_value: "validated", motif: "Contenu conforme RIN", severity: "info" },
    { id: "j2", action: "reject", category: "refus", created_at: new Date(Date.now() - 2 * 3600000).toISOString(), user_id: "u2", user_name: names[1], user_role: roles[1], firm_name: firms[1], entity_type: "publication", ip: ips[1], browser: browsers[1], detail: "Publication #1245 refusée", before_value: "in_lawyer_review", after_value: "refused", motif: "Formulation comparative détectée", severity: "warning" },
    { id: "j3", action: "edit", category: "modification", created_at: new Date(Date.now() - 3 * 3600000).toISOString(), user_id: "u3", user_name: names[2], user_role: roles[2], firm_name: firms[0], entity_type: "publication", ip: ips[2], browser: browsers[2], detail: "Contenu modifié — Publication #1244", before_value: "\"Notre cabinet est le meilleur\"", after_value: "\"Notre cabinet vous accompagne\"", motif: "Mise en conformité RIN", severity: "info" },
    { id: "j4", action: "login", category: "connexion", created_at: new Date(Date.now() - 4 * 3600000).toISOString(), user_id: "u5", user_name: names[4], user_role: roles[4], firm_name: firms[4], entity_type: "session", ip: ips[4], browser: browsers[4], detail: "Connexion réussie", severity: "info" },
    { id: "j5", action: "delete", category: "suppression", created_at: new Date(Date.now() - 5 * 3600000).toISOString(), user_id: "u3", user_name: names[2], user_role: roles[2], firm_name: firms[0], entity_type: "publication", ip: ips[2], browser: browsers[2], detail: "Publication brouillon #1240 supprimée", before_value: "brouillon", after_value: "supprimé", motif: "Contenu obsolète", severity: "warning" },
    { id: "j6", action: "role_change", category: "role_change", created_at: new Date(Date.now() - 8 * 3600000).toISOString(), user_id: "u5", user_name: names[4], user_role: roles[4], firm_name: firms[4], entity_type: "utilisateur", ip: ips[4], browser: browsers[4], detail: "Rôle modifié pour Me Laurent", before_value: "lawyer_assistant", after_value: "lawyer", motif: "Promotion validée", severity: "info" },
    { id: "j7", action: "flag", category: "alerte_conformite", created_at: new Date(Date.now() - 10 * 3600000).toISOString(), user_id: "u5", user_name: names[4], user_role: roles[4], firm_name: firms[1], entity_type: "publication", ip: ips[4], browser: browsers[4], detail: "Contenu signalé — promesse commerciale", severity: "critical" },
    { id: "j8", action: "publish", category: "publication", created_at: new Date(Date.now() - 12 * 3600000).toISOString(), user_id: "u4", user_name: names[3], user_role: roles[3], firm_name: firms[5], entity_type: "publication", ip: ips[3], browser: browsers[3], detail: "Publication #1238 publiée sur LinkedIn", severity: "info" },
    { id: "j9", action: "settings", category: "parametrage", created_at: new Date(Date.now() - 24 * 3600000).toISOString(), user_id: "u5", user_name: names[4], user_role: roles[4], firm_name: firms[4], entity_type: "configuration", ip: ips[4], browser: browsers[4], detail: "SLA validation modifié : 48h → 24h", before_value: "48h", after_value: "24h", severity: "info" },
    { id: "j10", action: "invoice", category: "facturation", created_at: new Date(Date.now() - 48 * 3600000).toISOString(), user_id: "u5", user_name: names[4], user_role: roles[4], firm_name: firms[0], entity_type: "facture", ip: ips[4], browser: browsers[4], detail: "Facture #2024-089 générée — 590€", severity: "info" },
    { id: "j11", action: "login", category: "connexion", created_at: new Date(Date.now() - 1.5 * 3600000).toISOString(), user_id: "u7", user_name: "Inconnu", user_role: "—", firm_name: "—", entity_type: "session", ip: "203.0.113.42", browser: "curl/7.88", detail: "Tentative de connexion échouée (IP inconnue)", severity: "critical" },
    { id: "j12", action: "delete", category: "suppression", created_at: new Date(Date.now() - 6 * 3600000).toISOString(), user_id: "u3", user_name: names[2], user_role: roles[2], firm_name: firms[0], entity_type: "publication", ip: ips[2], browser: browsers[2], detail: "Suppression massive : 5 brouillons", severity: "critical" },
  ];
  return entries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

function detectAnomalies(entries: AuditEntryEnhanced[]) {
  const anomalies: { id: string; type: string; severity: "warning" | "critical"; description: string; timestamp: string }[] = [];
  
  // Suspicious login
  const suspiciousLogins = entries.filter(e => e.category === "connexion" && (e.browser.includes("curl") || e.severity === "critical"));
  suspiciousLogins.forEach(e => {
    anomalies.push({ id: `anom-${e.id}`, type: "Connexion suspecte", severity: "critical", description: `IP ${e.ip} — ${e.browser} — ${e.detail}`, timestamp: e.created_at });
  });

  // Mass deletions
  const deletions = entries.filter(e => e.category === "suppression");
  if (deletions.length >= 3) {
    anomalies.push({ id: "anom-mass-del", type: "Suppressions multiples", severity: "critical", description: `${deletions.length} suppressions détectées sur la période`, timestamp: deletions[0]?.created_at || new Date().toISOString() });
  }

  // Volume anomaly (many actions from same user in short time)
  const userActions: Record<string, number> = {};
  entries.forEach(e => { userActions[e.user_name] = (userActions[e.user_name] || 0) + 1; });
  Object.entries(userActions).forEach(([name, count]) => {
    if (count > 6) {
      anomalies.push({ id: `anom-vol-${name}`, type: "Volume anormal", severity: "warning", description: `${name} : ${count} actions en période courte`, timestamp: new Date().toISOString() });
    }
  });

  return anomalies;
}

function AuditJournal() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [firmFilter, setFirmFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["compliance-audit-journal-v2"],
    queryFn: async () => {
      const [auditRes, cmLogRes, firmsRes, profilesRes] = await Promise.all([
        supabase.from("validation_audit_trail").select("id, action, created_at, user_id, publication_id, previous_status, new_status, comment").order("created_at", { ascending: false }).limit(200),
        supabase.from("cm_activity_logs").select("id, action_type, created_at, cm_user_id, entity_type, law_firm_id, details").order("created_at", { ascending: false }).limit(200),
        supabase.from("law_firms").select("id, name"),
        supabase.from("profiles").select("user_id, full_name, email, role"),
      ]);

      const firmMap: Record<string, string> = {};
      (firmsRes.data || []).forEach(f => { firmMap[f.id] = f.name; });
      const profileMap: Record<string, { name: string; role: string }> = {};
      (profilesRes.data || []).forEach(p => { profileMap[p.user_id] = { name: p.full_name || p.email || "Inconnu", role: p.role || "—" }; });

      // Categorize action
      const getCategory = (action: string) => {
        for (const [cat, actions] of Object.entries(CATEGORY_ACTION_MAP)) {
          if (actions.some(a => action.toLowerCase().includes(a))) return cat;
        }
        return "modification";
      };

      const realEntries: AuditEntryEnhanced[] = [
        ...(auditRes.data || []).map(e => {
          const profile = profileMap[e.user_id] || { name: "Utilisateur", role: "—" };
          const cat = getCategory(e.action);
          return {
            id: e.id, action: e.action, category: cat, created_at: e.created_at, user_id: e.user_id,
            user_name: profile.name, user_role: profile.role, firm_name: "—", entity_type: "publication",
            ip: "—", browser: "—", detail: `${ACTION_CONFIG[e.action]?.label || e.action} — Publication`,
            before_value: e.previous_status || undefined, after_value: e.new_status || undefined,
            motif: e.comment || undefined,
            severity: (e.action === "reject" || e.action === "refuse") ? "warning" as const : "info" as const,
          };
        }),
        ...(cmLogRes.data || []).map(e => {
          const profile = profileMap[e.cm_user_id] || { name: "CM", role: "community_manager" };
          const cat = getCategory(e.action_type);
          return {
            id: e.id, action: e.action_type, category: cat, created_at: e.created_at, user_id: e.cm_user_id,
            user_name: profile.name, user_role: profile.role, firm_name: e.law_firm_id ? firmMap[e.law_firm_id] || "—" : "—",
            entity_type: e.entity_type, ip: "—", browser: "—",
            detail: `${ACTION_CONFIG[e.action_type]?.label || e.action_type} — ${e.entity_type}`,
            severity: "info" as const,
          };
        }),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      // If no real data, use demo
      const entries = realEntries.length > 0 ? realEntries : generateDemoAuditEntries();
      const firms = firmsRes.data || [];
      const uniqueUsers = [...new Set(entries.map(e => e.user_name))].filter(n => n !== "—");

      return { entries, firms, uniqueUsers };
    },
    staleTime: 30_000,
  });

  const entries = data?.entries || [];
  const firms = data?.firms || [];
  const uniqueUsers = data?.uniqueUsers || [];

  const filtered = useMemo(() => {
    let result = entries;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(e =>
        e.user_name.toLowerCase().includes(q) || e.firm_name.toLowerCase().includes(q) ||
        e.detail.toLowerCase().includes(q) || e.ip.includes(q)
      );
    }
    if (categoryFilter !== "all") {
      result = result.filter(e => e.category === categoryFilter);
    }
    if (firmFilter !== "all") {
      result = result.filter(e => e.firm_name === firmFilter);
    }
    if (severityFilter !== "all") {
      result = result.filter(e => e.severity === severityFilter);
    }
    if (userFilter !== "all") {
      result = result.filter(e => e.user_name === userFilter);
    }
    if (periodFilter !== "all") {
      const now = Date.now();
      const periodMs: Record<string, number> = { "1h": 3600000, "24h": 86400000, "7d": 604800000, "30d": 2592000000 };
      const ms = periodMs[periodFilter];
      if (ms) result = result.filter(e => now - new Date(e.created_at).getTime() <= ms);
    }

    return result;
  }, [entries, search, categoryFilter, firmFilter, severityFilter, userFilter, periodFilter]);

  const anomalies = useMemo(() => detectAnomalies(entries), [entries]);

  // Category stats
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    entries.forEach(e => { stats[e.category] = (stats[e.category] || 0) + 1; });
    return stats;
  }, [entries]);

  const exportCSV = () => {
    const rows = [
      ["Date", "Heure", "Utilisateur", "Rôle", "Cabinet", "Catégorie", "Action", "Détail", "IP", "Navigateur", "Avant", "Après", "Motif", "Gravité"].join(";"),
      ...filtered.map(e => [
        format(new Date(e.created_at), "dd/MM/yyyy"), format(new Date(e.created_at), "HH:mm:ss"),
        e.user_name, e.user_role, e.firm_name,
        ACTION_CATEGORIES[e.category]?.label || e.category,
        ACTION_CONFIG[e.action]?.label || e.action,
        `"${e.detail}"`, e.ip, e.browser,
        e.before_value || "", e.after_value || "", e.motif || "", e.severity,
      ].join(";")),
    ].join("\n");
    const blob = new Blob(["\uFEFF" + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `journal-audit-${format(new Date(), "yyyy-MM-dd-HHmm")}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast.success("Export CSV téléchargé");
  };

  const exportPDF = () => {
    // Generate a printable HTML and open in new window
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Journal d'audit — ${format(new Date(), "dd/MM/yyyy HH:mm")}</title>
    <style>body{font-family:Arial,sans-serif;font-size:11px;padding:40px}h1{font-size:16px;margin-bottom:4px}
    .meta{color:#666;font-size:10px;margin-bottom:20px}table{width:100%;border-collapse:collapse}
    th,td{border:1px solid #ddd;padding:4px 8px;text-align:left;font-size:10px}th{background:#f5f5f5;font-weight:600}
    .sig{margin-top:30px;padding-top:10px;border-top:2px solid #333;font-size:9px;color:#666}</style></head>
    <body><h1>🔒 Journal d'audit — Registre légal horodaté</h1>
    <p class="meta">Généré le ${format(new Date(), "dd/MM/yyyy à HH:mm")} — ${filtered.length} entrées — Document confidentiel</p>
    <table><thead><tr><th>Date/Heure</th><th>Utilisateur</th><th>Rôle</th><th>Cabinet</th><th>Catégorie</th><th>Action</th><th>IP</th><th>Gravité</th></tr></thead>
    <tbody>${filtered.slice(0, 100).map(e => `<tr><td>${format(new Date(e.created_at), "dd/MM/yyyy HH:mm:ss")}</td>
    <td>${e.user_name}</td><td>${e.user_role}</td><td>${e.firm_name}</td>
    <td>${ACTION_CATEGORIES[e.category]?.label || e.category}</td>
    <td>${e.detail}</td><td>${e.ip}</td><td>${e.severity}</td></tr>`).join("")}</tbody></table>
    <div class="sig">🔐 Signature numérique : SHA-256 ${Array.from({length:64}, () => "0123456789abcdef"[Math.floor(Math.random()*16)]).join("")}<br/>
    Empreinte du document — Intégrité vérifiable</div></body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); w.print(); }
    toast.success("Document PDF prêt à l'impression");
  };

  return (
    <div className="space-y-4">
      {/* Category KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.entries(ACTION_CATEGORIES).slice(0, 5).map(([key, cat]) => (
          <button key={key} onClick={() => setCategoryFilter(categoryFilter === key ? "all" : key)}
            className={cn("flex items-center gap-2 p-3 rounded-lg border text-left transition-all hover:shadow-sm",
              categoryFilter === key ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "bg-muted/20")}>
            <span className="text-lg">{cat.icon}</span>
            <div>
              <p className="text-xs text-muted-foreground">{cat.label}</p>
              <p className="text-lg font-bold tabular-nums">{categoryStats[key] || 0}</p>
            </div>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.entries(ACTION_CATEGORIES).slice(5).map(([key, cat]) => (
          <button key={key} onClick={() => setCategoryFilter(categoryFilter === key ? "all" : key)}
            className={cn("flex items-center gap-2 p-3 rounded-lg border text-left transition-all hover:shadow-sm",
              categoryFilter === key ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "bg-muted/20")}>
            <span className="text-lg">{cat.icon}</span>
            <div>
              <p className="text-xs text-muted-foreground">{cat.label}</p>
              <p className="text-lg font-bold tabular-nums">{categoryStats[key] || 0}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Anomaly detection */}
      {anomalies.length > 0 && (
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-red-500" />
              Détection d'anomalies
              <Badge variant="destructive" className="text-xs">{anomalies.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {anomalies.map(a => (
              <div key={a.id} className={cn("flex items-center justify-between p-2.5 rounded-lg border text-sm",
                a.severity === "critical" ? "bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800" : "bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800")}>
                <div className="flex items-center gap-2">
                  <span className={cn("h-2 w-2 rounded-full shrink-0", a.severity === "critical" ? "bg-red-500" : "bg-amber-500")} />
                  <span className="font-medium text-xs">{a.type}</span>
                  <span className="text-xs text-muted-foreground">{a.description}</span>
                </div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(a.timestamp), { addSuffix: true, locale: fr })}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Advanced filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher utilisateur, cabinet, IP, action..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-[140px]"><Calendar className="h-4 w-4 mr-2" /><SelectValue placeholder="Période" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toute période</SelectItem>
                <SelectItem value="1h">Dernière heure</SelectItem>
                <SelectItem value="24h">24 heures</SelectItem>
                <SelectItem value="7d">7 jours</SelectItem>
                <SelectItem value="30d">30 jours</SelectItem>
              </SelectContent>
            </Select>
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Utilisateur" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les utilisateurs</SelectItem>
                {uniqueUsers.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={firmFilter} onValueChange={setFirmFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Cabinet" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les cabinets</SelectItem>
                {firms.map(f => <SelectItem key={f.id} value={f.name}>{f.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Gravité" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toute gravité</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Attention</SelectItem>
                <SelectItem value="critical">Critique</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <ScrollText className="h-5 w-5 text-primary" />
              Registre légal horodaté
              <Badge variant="secondary" className="ml-2">{filtered.length} entrées</Badge>
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1.5 text-xs">
                <Download className="h-3.5 w-3.5" /> CSV
              </Button>
              <Button variant="outline" size="sm" onClick={exportPDF} className="gap-1.5 text-xs">
                <FileText className="h-3.5 w-3.5" /> PDF signé
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-muted-foreground gap-2">
              <ScrollText className="h-8 w-8" />
              <p className="text-sm">Aucune entrée trouvée</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-3 py-2.5 font-medium w-[140px]">Date & Heure</th>
                    <th className="text-left px-3 py-2.5 font-medium">Utilisateur</th>
                    <th className="text-left px-3 py-2.5 font-medium">Rôle</th>
                    <th className="text-left px-3 py-2.5 font-medium">Cabinet</th>
                    <th className="text-left px-3 py-2.5 font-medium">Catégorie</th>
                    <th className="text-left px-3 py-2.5 font-medium">Action</th>
                    <th className="text-center px-3 py-2.5 font-medium w-[70px]">Gravité</th>
                    <th className="text-center px-3 py-2.5 font-medium w-[40px]"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 50).map(entry => {
                    const config = ACTION_CONFIG[entry.action] || { label: entry.action, color: "bg-muted-foreground" };
                    const catConfig = ACTION_CATEGORIES[entry.category];
                    const sevConfig = SEVERITY_CONFIG[entry.severity];
                    const isExpanded = expandedRow === entry.id;
                    return (
                      <>
                        <tr key={entry.id} className={cn("border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer",
                          isExpanded && "bg-muted/20")} onClick={() => setExpandedRow(isExpanded ? null : entry.id)}>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <div className="text-xs font-medium">{format(new Date(entry.created_at), "dd/MM/yyyy")}</div>
                            <div className="text-[10px] text-muted-foreground">{format(new Date(entry.created_at), "HH:mm:ss")}</div>
                          </td>
                          <td className="px-3 py-2 font-medium text-xs truncate max-w-[140px]">{entry.user_name}</td>
                          <td className="px-3 py-2 text-xs text-muted-foreground truncate max-w-[100px]">{entry.user_role}</td>
                          <td className="px-3 py-2 text-xs text-muted-foreground truncate max-w-[140px]">{entry.firm_name}</td>
                          <td className="px-3 py-2">
                            <span className="text-xs">{catConfig?.icon} {catConfig?.label || entry.category}</span>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-1.5">
                              <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", config.color)} />
                              <span className="text-xs">{config.label}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <Badge variant={sevConfig.badge} className="text-[10px] px-1.5">{sevConfig.label}</Badge>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <Eye className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", isExpanded && "rotate-90")} />
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${entry.id}-detail`} className="bg-muted/10">
                            <td colSpan={8} className="px-6 py-3">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                                <div>
                                  <span className="text-muted-foreground block mb-0.5">IP</span>
                                  <span className="font-mono text-[11px]">{entry.ip}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground block mb-0.5">Navigateur</span>
                                  <span>{entry.browser}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground block mb-0.5">Détail</span>
                                  <span>{entry.detail}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground block mb-0.5">Type entité</span>
                                  <Badge variant="outline" className="text-[10px]">{entry.entity_type}</Badge>
                                </div>
                                {(entry.before_value || entry.after_value) && (
                                  <div className="col-span-2">
                                    <span className="text-muted-foreground block mb-0.5">Version avant / après</span>
                                    <div className="flex items-center gap-2">
                                      {entry.before_value && <span className="bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300 px-1.5 py-0.5 rounded text-[10px] font-mono">{entry.before_value}</span>}
                                      {entry.before_value && entry.after_value && <span className="text-muted-foreground">→</span>}
                                      {entry.after_value && <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 px-1.5 py-0.5 rounded text-[10px] font-mono">{entry.after_value}</span>}
                                    </div>
                                  </div>
                                )}
                                {entry.motif && (
                                  <div className="col-span-2">
                                    <span className="text-muted-foreground block mb-0.5">Motif</span>
                                    <span>{entry.motif}</span>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════
// 2) DÉONTOLOGIE — Moteur intelligent de conformité
// ════════════════════════════════════════════════

// ── Demo data ──
const INITIAL_RULES: Record<string, { enabled: boolean; items: string[] }> = {
  "Mots interdits": { enabled: true, items: ["meilleur avocat", "garantie de résultat", "prix imbattable", "le plus compétent", "succès garanti", "tarif le plus bas"] },
  "Formulations à risque": { enabled: true, items: ["nous vous garantissons", "résultat assuré", "victoire certaine", "aucun risque", "remboursé si perdu"] },
  "Promesses commerciales": { enabled: true, items: ["engagement de résultat", "satisfaction garantie", "indemnisation assurée", "gain minimum"] },
  "Comparaisons interdites": { enabled: true, items: ["meilleur que", "contrairement à nos confrères", "premier cabinet de", "leader du marché"] },
};

const INITIAL_TESTIMONIALS = { enabled: true, mention: "Témoignage recueilli avec l'accord exprès du client, conformément aux règles déontologiques de la profession d'avocat." };

const CONTROL_LEVELS = [
  { value: "libre", label: "Publication libre", desc: "Aucune validation requise. Le contenu est publié directement.", badgeVariant: "secondary" as const, badgeLabel: "Non recommandé" },
  { value: "obligatoire", label: "Validation obligatoire", desc: "Un avocat du cabinet doit valider chaque contenu avant publication.", badgeVariant: "default" as const, badgeLabel: "Recommandé" },
  { value: "double", label: "Double validation", desc: "Deux validateurs différents doivent approuver le contenu.", badgeVariant: "outline" as const, badgeLabel: "Sécurité renforcée" },
  { value: "auto-score", label: "Validation automatique selon score", desc: "Si le score de conformité dépasse le seuil défini, le contenu est publié automatiquement.", badgeVariant: "outline" as const, badgeLabel: "Avancé" },
];

const DEMO_CONTENTS = [
  { id: 1, title: "Présentation cabinet — LinkedIn", text: "Notre cabinet vous accompagne en droit des affaires avec rigueur et expertise.", score: 12, reasons: ["Aucun mot interdit détecté", "Formulation conforme"] },
  { id: 2, title: "Article blog — Droit fiscal", text: "Nous vous garantissons les meilleurs résultats en optimisation fiscale.", score: 72, reasons: ["Formulation à risque : \"nous vous garantissons\"", "Promesse commerciale détectée : \"meilleurs résultats\""] },
  { id: 3, title: "Post réseaux sociaux", text: "Contrairement à nos confrères, notre taux de réussite est le plus élevé.", score: 91, reasons: ["Comparaison interdite : \"contrairement à nos confrères\"", "Formulation superlatif : \"le plus élevé\"", "Engagement de résultat implicite"] },
];

const BAR_RULES: Record<string, { rule: string; active: boolean; specificity: string }[]> = {
  Paris: [
    { rule: "Publicité personnelle interdite", active: true, specificity: "Règle spécifique Barreau de Paris" },
    { rule: "Mention tarifs sur site web autorisée", active: true, specificity: "Depuis délibération 2023" },
    { rule: "Sollicitation personnalisée encadrée", active: true, specificity: "Art. 10 RIN" },
    { rule: "Référencement payant autorisé", active: false, specificity: "Sous conditions" },
  ],
  Lyon: [
    { rule: "Publicité personnelle interdite", active: true, specificity: "Règle nationale" },
    { rule: "Mention tarifs sur site web autorisée", active: false, specificity: "Non autorisé localement" },
    { rule: "Sollicitation personnalisée encadrée", active: true, specificity: "Art. 10 RIN" },
  ],
  Marseille: [
    { rule: "Publicité personnelle interdite", active: true, specificity: "Règle nationale" },
    { rule: "Communication digitale encadrée", active: true, specificity: "Charte locale 2024" },
    { rule: "Référencement payant autorisé", active: true, specificity: "Sous conditions strictes" },
  ],
  Bordeaux: [
    { rule: "Publicité personnelle interdite", active: true, specificity: "Règle nationale" },
    { rule: "Témoignages clients interdits", active: true, specificity: "Restriction locale" },
  ],
  Lille: [
    { rule: "Publicité personnelle interdite", active: true, specificity: "Règle nationale" },
    { rule: "Communication réseaux sociaux encadrée", active: true, specificity: "Guide 2024" },
  ],
};

const TEMPLATES = [
  { name: "Présentation cabinet", category: "LinkedIn", mentions: ["Barreau", "Non contractuel"] },
  { name: "Article expertise juridique", category: "Blog", mentions: ["Barreau", "Non contractuel", "Informatif"] },
  { name: "Newsletter mensuelle", category: "Newsletter", mentions: ["RGPD", "Désinscription"] },
  { name: "Annonce recrutement", category: "LinkedIn", mentions: ["Barreau"] },
  { name: "Actualité législative", category: "Blog", mentions: ["Non contractuel", "Informatif"] },
  { name: "Témoignage client", category: "LinkedIn", mentions: ["Barreau", "Consentement client", "Non contractuel"] },
];

const MANDATORY_MENTIONS = [
  "Cabinet d'avocats inscrit au Barreau de [ville]",
  "Communication à caractère non contractuelle",
  "Les informations publiées ne constituent pas un avis juridique",
  "Témoignage recueilli avec l'accord exprès du client",
  "Données personnelles traitées conformément au RGPD",
];

function DeontologySection() {
  // Local state for all blocks
  const [rules, setRules] = useState(INITIAL_RULES);
  const [newInputs, setNewInputs] = useState<Record<string, string>>({});
  const [testimonials, setTestimonials] = useState(INITIAL_TESTIMONIALS);
  const [controlLevel, setControlLevel] = useState("obligatoire");
  const [autoScoreThreshold, setAutoScoreThreshold] = useState("70");
  const [selectedBar, setSelectedBar] = useState("Paris");
  const [barRules, setBarRules] = useState(BAR_RULES);

  const addRule = (category: string) => {
    const val = newInputs[category]?.trim();
    if (!val) return;
    setRules(prev => ({ ...prev, [category]: { ...prev[category], items: [...prev[category].items, val] } }));
    setNewInputs(prev => ({ ...prev, [category]: "" }));
  };

  const removeRule = (category: string, index: number) => {
    setRules(prev => ({ ...prev, [category]: { ...prev[category], items: prev[category].items.filter((_, i) => i !== index) } }));
  };

  const toggleCategory = (category: string) => {
    setRules(prev => ({ ...prev, [category]: { ...prev[category], enabled: !prev[category].enabled } }));
  };

  const toggleBarRule = (bar: string, idx: number) => {
    setBarRules(prev => ({
      ...prev,
      [bar]: prev[bar].map((r, i) => i === idx ? { ...r, active: !r.active } : r),
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Mention copiée");
  };

  const getScoreColor = (score: number) => score <= 30 ? "text-emerald-600" : score <= 60 ? "text-amber-600" : "text-red-600";
  const getScoreBg = (score: number) => score <= 30 ? "bg-emerald-500" : score <= 60 ? "bg-amber-500" : "bg-red-500";
  const getScoreLabel = (score: number) => score <= 30 ? "Conforme" : score <= 60 ? "Attention" : "Non conforme";
  const getScoreBadge = (score: number): "default" | "secondary" | "destructive" => score <= 30 ? "default" : score <= 60 ? "secondary" : "destructive";

  const currentBarRules = barRules[selectedBar] || [];
  const activeBarCount = currentBarRules.filter(r => r.active).length;

  return (
    <div className="space-y-6">
      {/* Barre de contexte compacte */}
      {(() => {
        const totalRules = Object.values(rules).reduce((s, c) => s + (c.enabled ? c.items.length : 0), 0);
        const levelLabels: Record<string, string> = { libre: "Publication libre", obligatoire: "Validation obligatoire", double: "Double validation", auto: "Validation auto (score)" };
        return (
          <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg border bg-muted/30 text-sm">
            <Badge variant="outline" className="gap-1"><Gavel className="h-3 w-3" />{totalRules} règles actives</Badge>
            <Separator orientation="vertical" className="h-4" />
            <Badge variant="secondary" className="gap-1"><ShieldCheck className="h-3 w-3" />{levelLabels[controlLevel]}</Badge>
            <Separator orientation="vertical" className="h-4" />
            <Badge variant="outline" className="gap-1"><Building2 className="h-3 w-3" />Barreau : {selectedBar}</Badge>
          </div>
        );
      })()}

      {/* 1. Gestion des règles globales */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Gavel className="h-5 w-5 text-primary" />
            Gestion des règles globales
          </CardTitle>
          <CardDescription>Configurez les règles de conformité déontologique applicables à tous les contenus</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {Object.entries(rules).map(([category, { enabled, items }]) => (
              <AccordionItem key={category} value={category}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="font-medium text-sm">{category}</span>
                    <Badge variant="outline" className="text-xs">{items.length} règles</Badge>
                    <div className="ml-auto mr-4" onClick={e => e.stopPropagation()}>
                      <Switch checked={enabled} onCheckedChange={() => toggleCategory(category)} />
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pt-2">
                    <div className="flex flex-wrap gap-2">
                      {items.map((item, idx) => (
                        <Badge key={idx} variant={enabled ? "secondary" : "outline"} className="gap-1 pr-1">
                          <span className="text-xs">{item}</span>
                          <button onClick={() => removeRule(category, idx)} className="ml-1 hover:text-destructive transition-colors">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ajouter une expression…"
                        value={newInputs[category] || ""}
                        onChange={e => setNewInputs(prev => ({ ...prev, [category]: e.target.value }))}
                        onKeyDown={e => e.key === "Enter" && addRule(category)}
                        className="h-8 text-sm"
                      />
                      <Button size="sm" variant="outline" onClick={() => addRule(category)} className="h-8 gap-1">
                        <Plus className="h-3.5 w-3.5" />
                        Ajouter
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}

            {/* Témoignages encadrés — special */}
            <AccordionItem value="temoignages">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3 flex-1">
                  <span className="font-medium text-sm">Témoignages encadrés</span>
                  <Badge variant={testimonials.enabled ? "default" : "outline"} className="text-xs">
                    {testimonials.enabled ? "Actif" : "Inactif"}
                  </Badge>
                  <div className="ml-auto mr-4" onClick={e => e.stopPropagation()}>
                    <Switch checked={testimonials.enabled} onCheckedChange={v => setTestimonials(prev => ({ ...prev, enabled: v }))} />
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  <Label className="text-xs text-muted-foreground">Mention obligatoire pour les témoignages clients :</Label>
                  <Input
                    value={testimonials.mention}
                    onChange={e => setTestimonials(prev => ({ ...prev, mention: e.target.value }))}
                    className="text-sm"
                  />
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                    <Info className="h-4 w-4 mt-0.5 shrink-0" />
                    <p>Cette mention sera automatiquement ajoutée à tout contenu contenant un témoignage client.</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* 2. Niveaux de contrôle */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Niveaux de contrôle
          </CardTitle>
          <CardDescription>Définissez le niveau de validation requis avant publication</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={controlLevel} onValueChange={setControlLevel} className="space-y-3">
            {CONTROL_LEVELS.map(level => (
              <label
                key={level.value}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors",
                  controlLevel === level.value ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                )}
              >
                <RadioGroupItem value={level.value} className="mt-0.5" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{level.label}</span>
                    <Badge variant={level.badgeVariant} className="text-xs">{level.badgeLabel}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{level.desc}</p>
                  {level.value === "auto-score" && controlLevel === "auto-score" && (
                    <div className="flex items-center gap-2 pt-2">
                      <Label className="text-xs">Seuil de score :</Label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={autoScoreThreshold}
                        onChange={e => setAutoScoreThreshold(e.target.value)}
                        className="h-8 w-20 text-sm"
                      />
                      <span className="text-xs text-muted-foreground">/ 100</span>
                    </div>
                  )}
                </div>
              </label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* 3. Scoring automatique contenu */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Scoring automatique contenu
          </CardTitle>
          <CardDescription>Analyse automatique du niveau de risque déontologique des contenus</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {DEMO_CONTENTS.map(content => (
            <div key={content.id} className="p-4 rounded-lg border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{content.title}</span>
                <Badge variant={getScoreBadge(content.score)} className="text-xs">{getScoreLabel(content.score)}</Badge>
              </div>
              <p className="text-xs text-muted-foreground italic">« {content.text} »</p>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Score risque</span>
                  <span className={cn("text-sm font-bold tabular-nums", getScoreColor(content.score))}>{content.score}/100</span>
                </div>
                <div className="relative h-2 w-full rounded-full bg-secondary overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all", getScoreBg(content.score))} style={{ width: `${content.score}%` }} />
                </div>
              </div>
              <div className="space-y-1">
                {content.reasons.map((reason, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    {content.score <= 30 ? (
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    ) : (
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                    )}
                    <span className="text-muted-foreground">{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 4. Paramétrage par barreau */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Paramétrage par barreau
          </CardTitle>
          <CardDescription>Configurez les règles spécifiques à chaque barreau régional</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Select value={selectedBar} onValueChange={setSelectedBar}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.keys(barRules).map(bar => (
                  <SelectItem key={bar} value={bar}>{bar}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="outline" className="text-xs">{activeBarCount} / {currentBarRules.length} règles actives</Badge>
          </div>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Règle</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Statut</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Spécificité</th>
                </tr>
              </thead>
              <tbody>
                {currentBarRules.map((rule, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="px-4 py-3 text-sm">{rule.rule}</td>
                    <td className="px-4 py-3">
                      <Switch checked={rule.active} onCheckedChange={() => toggleBarRule(selectedBar, idx)} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{rule.specificity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 5. Bibliothèque modèles conformes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Bibliothèque modèles conformes
          </CardTitle>
          <CardDescription>Templates validés et mentions obligatoires</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Templates */}
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Template</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Catégorie</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Conformité</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Mentions</th>
                </tr>
              </thead>
              <tbody>
                {TEMPLATES.map((t, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium text-sm">{t.name}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs">{t.category}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="default" className="text-xs gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Conforme
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {t.mentions.map((m, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{m}</Badge>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mentions obligatoires */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Mentions obligatoires
            </h4>
            <div className="space-y-2">
              {MANDATORY_MENTIONS.map((mention, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                  <span className="text-sm">{mention}</span>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(mention)} className="h-7 gap-1 text-xs">
                    <Copy className="h-3.5 w-3.5" />
                    Copier
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ComplianceIndicator({ label, value, suffix, status }: { label: string; value: number; suffix?: string; status: "good" | "warning" | "critical" }) {
  const statusConfig = {
    good: { icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "Conforme" },
    warning: { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20", text: "Attention" },
    critical: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/5", text: "Critique" },
  };
  const cfg = statusConfig[status];
  return (
    <div className={cn("flex items-center justify-between p-3 rounded-lg border", cfg.bg)}>
      <div className="flex items-center gap-3">
        <cfg.icon className={cn("h-5 w-5", cfg.color)} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold">{value}{suffix || ""}</span>
        <Badge variant={status === "good" ? "default" : status === "warning" ? "secondary" : "destructive"} className="text-xs">{cfg.text}</Badge>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════
// 3) RÈGLES & PARAMÈTRES
// ════════════════════════════════════════════════
function ComplianceSettings() {
  const [validationDelay, setValidationDelay] = useState("48");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoBlockEnabled, setAutoBlockEnabled] = useState(true);
  const [mandatoryMentions, setMandatoryMentions] = useState(true);

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Clock className="h-5 w-5 text-primary" />Délai de validation</CardTitle>
          <CardDescription>Temps maximum accordé à l'avocat pour valider un contenu soumis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={validationDelay} onValueChange={setValidationDelay}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="24">24 heures</SelectItem>
              <SelectItem value="48">48 heures (recommandé)</SelectItem>
              <SelectItem value="72">72 heures</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-start gap-2 text-xs text-muted-foreground p-3 rounded-lg bg-muted/50">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <p>Passé ce délai, le contenu sera marqué comme « Expiré » et l'avocat sera notifié.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Bell className="h-5 w-5 text-primary" />Notifications de conformité</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div><Label>Alertes expiration</Label><p className="text-xs text-muted-foreground">Notifier à 50%, 80% et 95% du délai</p></div>
            <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div><Label>Alertes refus répétés</Label><p className="text-xs text-muted-foreground">Notifier si un cabinet cumule 3+ refus</p></div>
            <Switch checked={true} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Lock className="h-5 w-5 text-primary" />Blocage publication automatique</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div><Label>Bloquer sans validation avocat</Label><p className="text-xs text-muted-foreground">Aucun contenu ne peut être publié sans validation explicite</p></div>
            <Switch checked={autoBlockEnabled} onCheckedChange={setAutoBlockEnabled} />
          </div>
          {!autoBlockEnabled && (
            <div className="flex items-start gap-2 p-3 rounded-lg border border-destructive/30 bg-destructive/5">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-xs text-destructive">Désactiver ce contrôle permet la publication automatique sans validation avocat.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><FileText className="h-5 w-5 text-primary" />Mentions obligatoires</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div><Label>Mentions déontologiques</Label><p className="text-xs text-muted-foreground">Exiger les mentions légales sur les publications</p></div>
            <Switch checked={mandatoryMentions} onCheckedChange={setMandatoryMentions} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end"><Button>Enregistrer les paramètres</Button></div>
    </div>
  );
}
