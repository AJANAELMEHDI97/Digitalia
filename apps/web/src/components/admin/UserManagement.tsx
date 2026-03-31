import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api-client";
import { 
  Shield, User, Loader2, Users, Gavel, UserPlus, Eye, EyeOff,
  Search, Activity, Clock, MousePointerClick, Wifi, TrendingUp,
  FileText, CheckCircle2, Building2, Timer, XCircle, Zap,
  Settings, Calendar, MessageSquare, Send, AlertTriangle, Info
} from "lucide-react";
import { useSimpleRole, type SimpleRole } from "@/hooks/useSimpleRole";
import { createUserWithRole } from "@/hooks/useSimpleAuth";

// ─── Types ───────────────────────────────────────────────────────────────────

interface UserWithRole {
  id: string;
  user_id: string;
  username: string | null;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  role: SimpleRole | null;
  role_id: string | null;
}

type HealthStatus = "active" | "low_activity" | "inactive" | "at_risk";
type ActivityFilter = "all" | HealthStatus;

interface UserMetrics {
  lastLoginHoursAgo: number;
  connections7d: number;
  avgSessionMin: number;
  activeTimeWeekMin: number;
  actions30d: number;
  health: HealthStatus;
}

interface RoleKPIs {
  // CM
  postsCreated?: number;
  postsPublished?: number;
  validationRate?: number;
  firmsManaged?: number;
  // Lawyer
  avgValidationDelayH?: number;
  refusalRate?: number;
  platformActivity?: string;
  // Admin
  lastAdminAction?: string;
  usersManaged?: number;
}

interface TimelineEntry {
  icon: React.ElementType;
  label: string;
  timestamp: string;
}

// ─── Config ──────────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<SimpleRole, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  admin: { label: "Super Admin", icon: Shield, color: "text-red-600", bgColor: "bg-red-500/10 border-red-200" },
  community_manager: { label: "Community Manager", icon: Users, color: "text-orange-600", bgColor: "bg-orange-500/10 border-orange-200" },
  lawyer: { label: "Avocat", icon: Gavel, color: "text-amber-600", bgColor: "bg-amber-500/10 border-amber-200" },
};

const HEALTH_CONFIG: Record<HealthStatus, { label: string; color: string; bgColor: string }> = {
  active: { label: "Actif", color: "text-emerald-700", bgColor: "bg-emerald-500/10 border-emerald-200" },
  low_activity: { label: "Faible activité", color: "text-amber-700", bgColor: "bg-amber-500/10 border-amber-200" },
  inactive: { label: "Inactif", color: "text-slate-500", bgColor: "bg-slate-500/10 border-slate-200" },
  at_risk: { label: "À risque", color: "text-red-600", bgColor: "bg-red-500/10 border-red-200" },
};

const HEALTH_EXPLANATION: Record<HealthStatus, string> = {
  active: "Connexions régulières et actions fréquentes sur la plateforme.",
  low_activity: "Moins de 5 connexions sur 7 jours ou peu d'actions récentes. Un suivi peut être nécessaire.",
  inactive: "Aucune connexion depuis plus de 7 jours. L'utilisateur ne consulte plus la plateforme.",
  at_risk: "Activité en forte baisse combinée à des signaux négatifs (refus, retards). Intervention recommandée.",
};

// ─── Demo users fallback ─────────────────────────────────────────────────────

function makeUUID(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  const hex = Math.abs(h).toString(16).padStart(8, "0");
  return `${hex.slice(0,8)}-demo-4000-a000-${hex.padEnd(12,"0").slice(0,12)}`;
}

function daysAgo(d: number): string {
  return new Date(Date.now() - d * 86400_000).toISOString();
}

const DEMO_USERS: (UserWithRole & { _forceMetrics?: Partial<{ lastLoginHoursAgo: number; connections7d: number; actions30d: number }> })[] = [
  // 6 CMs — mostly active
  { id: makeUUID("camille"), user_id: makeUUID("camille"), username: "camille.lefebvre", email: "camille.lefebvre@demo-socialpulse.fr", full_name: "Camille Lefebvre", avatar_url: null, created_at: daysAgo(120), role: "community_manager", role_id: null, _forceMetrics: { lastLoginHoursAgo: 2, connections7d: 14, actions30d: 52 } },
  { id: makeUUID("maxime"), user_id: makeUUID("maxime"), username: "maxime.dupuis", email: "maxime.dupuis@demo-socialpulse.fr", full_name: "Maxime Dupuis", avatar_url: null, created_at: daysAgo(90), role: "community_manager", role_id: null, _forceMetrics: { lastLoginHoursAgo: 5, connections7d: 11, actions30d: 38 } },
  { id: makeUUID("lea"), user_id: makeUUID("lea"), username: "lea.martin", email: "lea.martin@demo-socialpulse.fr", full_name: "Léa Martin", avatar_url: null, created_at: daysAgo(200), role: "community_manager", role_id: null, _forceMetrics: { lastLoginHoursAgo: 1, connections7d: 13, actions30d: 45 } },
  { id: makeUUID("antoine"), user_id: makeUUID("antoine"), username: "antoine.bernard", email: "antoine.bernard@demo-socialpulse.fr", full_name: "Antoine Bernard", avatar_url: null, created_at: daysAgo(60), role: "community_manager", role_id: null, _forceMetrics: { lastLoginHoursAgo: 48, connections7d: 6, actions30d: 15 } },
  { id: makeUUID("clara"), user_id: makeUUID("clara"), username: "clara.rousseau", email: "clara.rousseau@demo-socialpulse.fr", full_name: "Clara Rousseau", avatar_url: null, created_at: daysAgo(30), role: "community_manager", role_id: null, _forceMetrics: { lastLoginHoursAgo: 10, connections7d: 9, actions30d: 28 } },
  { id: makeUUID("hugo"), user_id: makeUUID("hugo"), username: "hugo.fontaine", email: "hugo.fontaine@demo-socialpulse.fr", full_name: "Hugo Fontaine", avatar_url: null, created_at: daysAgo(150), role: "community_manager", role_id: null, _forceMetrics: { lastLoginHoursAgo: 100, connections7d: 3, actions30d: 8 } },
  // 8 Lawyers — varied health
  { id: makeUUID("sophie"), user_id: makeUUID("sophie"), username: "me.sophie.durand", email: "sophie.durand@demo-socialpulse.fr", full_name: "Me Sophie Durand", avatar_url: null, created_at: daysAgo(280), role: "lawyer", role_id: null, _forceMetrics: { lastLoginHoursAgo: 4, connections7d: 8, actions30d: 25 } },
  { id: makeUUID("jeanpierre"), user_id: makeUUID("jeanpierre"), username: "me.jp.roux", email: "jeanpierre.roux@demo-socialpulse.fr", full_name: "Me Jean-Pierre Roux", avatar_url: null, created_at: daysAgo(300), role: "lawyer", role_id: null, _forceMetrics: { lastLoginHoursAgo: 400, connections7d: 0, actions30d: 1 } },
  { id: makeUUID("clairedupont"), user_id: makeUUID("clairedupont"), username: "me.claire.dupont", email: "claire.dupont@demo-socialpulse.fr", full_name: "Me Claire Dupont", avatar_url: null, created_at: daysAgo(180), role: "lawyer", role_id: null, _forceMetrics: { lastLoginHoursAgo: 72, connections7d: 4, actions30d: 12 } },
  { id: makeUUID("laurent"), user_id: makeUUID("laurent"), username: "me.laurent.mercier", email: "laurent.mercier@demo-socialpulse.fr", full_name: "Me Laurent Mercier", avatar_url: null, created_at: daysAgo(250), role: "lawyer", role_id: null, _forceMetrics: { lastLoginHoursAgo: 500, connections7d: 0, actions30d: 0 } },
  { id: makeUUID("isabelle"), user_id: makeUUID("isabelle"), username: "me.isabelle.faure", email: "isabelle.faure@demo-socialpulse.fr", full_name: "Me Isabelle Faure", avatar_url: null, created_at: daysAgo(100), role: "lawyer", role_id: null, _forceMetrics: { lastLoginHoursAgo: 20, connections7d: 5, actions30d: 18 } },
  { id: makeUUID("thomas"), user_id: makeUUID("thomas"), username: "me.thomas.renard", email: "thomas.renard@demo-socialpulse.fr", full_name: "Me Thomas Renard", avatar_url: null, created_at: daysAgo(220), role: "lawyer", role_id: null, _forceMetrics: { lastLoginHoursAgo: 200, connections7d: 1, actions30d: 3 } },
  { id: makeUUID("annemarie"), user_id: makeUUID("annemarie"), username: "me.am.blanc", email: "annemarie.blanc@demo-socialpulse.fr", full_name: "Me Anne-Marie Blanc", avatar_url: null, created_at: daysAgo(140), role: "lawyer", role_id: null, _forceMetrics: { lastLoginHoursAgo: 350, connections7d: 0, actions30d: 2 } },
  { id: makeUUID("richard"), user_id: makeUUID("richard"), username: "me.richard.fontaine", email: "richard.fontaine@demo-socialpulse.fr", full_name: "Me Richard Fontaine", avatar_url: null, created_at: daysAgo(50), role: "lawyer", role_id: null, _forceMetrics: { lastLoginHoursAgo: 8, connections7d: 7, actions30d: 22 } },
  // 2 Admins
  { id: makeUUID("marie"), user_id: makeUUID("marie"), username: "marie.admin", email: "marie.administrateur@demo-socialpulse.fr", full_name: "Marie Administrateur", avatar_url: null, created_at: daysAgo(290), role: "admin", role_id: null, _forceMetrics: { lastLoginHoursAgo: 1, connections7d: 12, actions30d: 40 } },
  { id: makeUUID("paul"), user_id: makeUUID("paul"), username: "paul.superviseur", email: "paul.superviseur@demo-socialpulse.fr", full_name: "Paul Superviseur", avatar_url: null, created_at: daysAgo(260), role: "admin", role_id: null, _forceMetrics: { lastLoginHoursAgo: 36, connections7d: 7, actions30d: 19 } },
  // 2 Non assignés
  { id: makeUUID("nouveau1"), user_id: makeUUID("nouveau1"), username: "nouveau.compte1", email: "nouveau.compte1@demo-socialpulse.fr", full_name: "Nouveau Compte 1", avatar_url: null, created_at: daysAgo(3), role: null, role_id: null, _forceMetrics: { lastLoginHoursAgo: 48, connections7d: 2, actions30d: 4 } },
  { id: makeUUID("nouveau2"), user_id: makeUUID("nouveau2"), username: "nouveau.compte2", email: "nouveau.compte2@demo-socialpulse.fr", full_name: "Nouveau Compte 2", avatar_url: null, created_at: daysAgo(1), role: null, role_id: null, _forceMetrics: { lastLoginHoursAgo: 12, connections7d: 1, actions30d: 2 } },
];

// Map of forced metrics for demo users
const DEMO_METRICS_MAP = new Map<string, { lastLoginHoursAgo: number; connections7d: number; actions30d: number }>();
DEMO_USERS.forEach(u => {
  if (u._forceMetrics) DEMO_METRICS_MAP.set(u.user_id, u._forceMetrics as any);
});

// ─── Demo data generator (deterministic) ─────────────────────────────────────

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function generateMetrics(userId: string): UserMetrics {
  const forced = DEMO_METRICS_MAP.get(userId);
  const seed = hashCode(userId);

  const lastLoginHoursAgo = forced?.lastLoginHoursAgo ?? (seed % 200);
  const connections7d = forced?.connections7d ?? ((seed % 15) + 1);
  const actions30d = forced?.actions30d ?? ((seed % 60) + 1);
  const avgSessionMin = (seed % 40) + 5;
  const activeTimeWeekMin = connections7d * avgSessionMin;

  let health: HealthStatus;
  if (lastLoginHoursAgo > 336 && actions30d < 3) health = "at_risk";
  else if (lastLoginHoursAgo > 168 || actions30d < 5) health = "inactive";
  else if (lastLoginHoursAgo < 24 && actions30d > 20) health = "active";
  else health = "low_activity";

  return { lastLoginHoursAgo, connections7d, avgSessionMin, activeTimeWeekMin, actions30d, health };
}

function generateRoleKPIs(userId: string, role: SimpleRole | null): RoleKPIs {
  if (!role) return {};
  const seed = hashCode(userId + role);
  if (role === "community_manager") {
    return {
      postsCreated: (seed % 30) + 5,
      postsPublished: (seed % 20) + 3,
      validationRate: 70 + (seed % 25),
      firmsManaged: (seed % 6) + 1,
    };
  }
  if (role === "lawyer") {
    return {
      avgValidationDelayH: (seed % 48) + 2,
      refusalRate: seed % 20,
      platformActivity: (seed % 3 === 0) ? "Élevée" : (seed % 3 === 1) ? "Moyenne" : "Faible",
    };
  }
  return { lastAdminAction: "Supervision", usersManaged: (seed % 20) + 5 };
}

function generateTimeline(userId: string, role: SimpleRole | null): TimelineEntry[] {
  const seed = hashCode(userId + "timeline");
  const actions: { icon: React.ElementType; label: string }[] = role === "community_manager"
    ? [
        { icon: FileText, label: "Post créé" },
        { icon: Send, label: "Post soumis à validation" },
        { icon: Calendar, label: "Publication planifiée" },
        { icon: MessageSquare, label: "Commentaire ajouté" },
        { icon: Building2, label: "Cabinet consulté" },
      ]
    : role === "lawyer"
    ? [
        { icon: CheckCircle2, label: "Publication validée" },
        { icon: XCircle, label: "Publication refusée" },
        { icon: Eye, label: "Contenu consulté" },
        { icon: Settings, label: "Paramètres modifiés" },
        { icon: Calendar, label: "Calendrier consulté" },
      ]
    : [
        { icon: Settings, label: "Configuration modifiée" },
        { icon: Users, label: "Utilisateur créé" },
        { icon: Eye, label: "Dashboard consulté" },
        { icon: Shield, label: "Rôle modifié" },
        { icon: Activity, label: "Rapport consulté" },
      ];

  return actions.map((a, i) => {
    const hoursAgo = ((seed + i * 17) % 72) + 1;
    return {
      ...a,
      timestamp: formatTimeAgo(hoursAgo),
    };
  });
}

function formatTimeAgo(hours: number): string {
  if (hours < 1) return "à l'instant";
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "il y a 1 jour";
  return `il y a ${days} jours`;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: SimpleRole | null }) {
  if (!role) {
    return <Badge variant="secondary" className="text-xs"><User className="h-3 w-3 mr-1" />Non assigné</Badge>;
  }
  const c = ROLE_CONFIG[role];
  const Icon = c.icon;
  return <Badge className={`${c.bgColor} ${c.color} text-xs border`}><Icon className="h-3 w-3 mr-1" />{c.label}</Badge>;
}

function HealthBadge({ status }: { status: HealthStatus }) {
  const c = HEALTH_CONFIG[status];
  return <Badge className={`${c.bgColor} ${c.color} text-xs border`}>{c.label}</Badge>;
}

function RoleKPISummary({ role, kpis }: { role: SimpleRole | null; kpis: RoleKPIs }) {
  if (role === "community_manager") {
    return <span className="text-xs text-muted-foreground tabular-nums">{kpis.postsCreated} posts · {kpis.validationRate}% validation</span>;
  }
  if (role === "lawyer") {
    return <span className="text-xs text-muted-foreground tabular-nums">Délai {kpis.avgValidationDelayH}h · {kpis.refusalRate}% refus</span>;
  }
  if (role === "admin") {
    return <span className="text-xs text-muted-foreground">Superviseur actif</span>;
  }
  return null;
}

function StatItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium tabular-nums">{value}</p>
      </div>
    </div>
  );
}

// ─── User Card ───────────────────────────────────────────────────────────────

function UserCard({ user, metrics, kpis, onClick }: {
  user: UserWithRole;
  metrics: UserMetrics;
  kpis: RoleKPIs;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-lg border bg-card p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/20"
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={user.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
            {getInitials(user.full_name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{user.full_name || "Sans nom"}</p>
          <p className="text-xs text-muted-foreground font-mono truncate">{user.username || "-"}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        <RoleBadge role={user.role} />
        <HealthBadge status={metrics.health} />
      </div>

      <div className="mt-3 space-y-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3" />
          <span>{formatTimeAgo(metrics.lastLoginHoursAgo)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Wifi className="h-3 w-3" />
          <span className="tabular-nums">{metrics.connections7d} connexions / 7j</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MousePointerClick className="h-3 w-3" />
          <span className="tabular-nums">{metrics.actions30d} actions / 30j</span>
        </div>
      </div>

      {user.role && (
        <div className="mt-2 pt-2 border-t">
          <RoleKPISummary role={user.role} kpis={kpis} />
        </div>
      )}
    </button>
  );
}

// ─── Detail Sheet ────────────────────────────────────────────────────────────

function UserDetailSheet({ user, open, onOpenChange, onRoleChange, updatingUserId }: {
  user: UserWithRole;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoleChange: (user: UserWithRole, newRole: string) => void;
  updatingUserId: string | null;
}) {
  const metrics = generateMetrics(user.user_id);
  const kpis = generateRoleKPIs(user.user_id, user.role);
  const timeline = generateTimeline(user.user_id, user.role);

  const lastLoginDate = new Date(Date.now() - metrics.lastLoginHoursAgo * 3600_000);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="sr-only">Profil utilisateur</SheetTitle>
        </SheetHeader>

        {/* Profile header */}
        <div className="flex items-center gap-4 mt-2">
          <Avatar className="h-14 w-14">
            <AvatarImage src={user.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(user.full_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-lg">{user.full_name || "Sans nom"}</h3>
            <p className="text-sm text-muted-foreground font-mono">{user.username || "-"}</p>
            <div className="flex gap-1.5 mt-1">
              <RoleBadge role={user.role} />
              <HealthBadge status={metrics.health} />
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          Inscrit le {new Date(user.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
        </p>

        {/* Health explanation callout */}
        <div className={`mt-3 flex items-start gap-2 rounded-lg border px-3 py-2 ${HEALTH_CONFIG[metrics.health].bgColor}`}>
          <Info className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${HEALTH_CONFIG[metrics.health].color}`} />
          <p className={`text-xs leading-relaxed ${HEALTH_CONFIG[metrics.health].color}`}>
            {HEALTH_EXPLANATION[metrics.health]}
          </p>
        </div>

        <Separator className="my-4" />

        {/* Activity metrics */}
        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><Activity className="h-4 w-4 text-primary" />Métriques d'activité</h4>
        <div className="grid grid-cols-2 gap-x-4">
          <StatItem icon={Clock} label="Dernière connexion" value={lastLoginDate.toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })} />
          <StatItem icon={Wifi} label="Connexions 7j" value={metrics.connections7d} />
          <StatItem icon={Timer} label="Session moyenne" value={`${metrics.avgSessionMin} min`} />
          <StatItem icon={Zap} label="Temps actif / sem." value={formatDuration(metrics.activeTimeWeekMin)} />
          <StatItem icon={MousePointerClick} label="Actions 30j" value={metrics.actions30d} />
        </div>

        <Separator className="my-4" />

        {/* Role KPIs */}
        {user.role && (
          <>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />KPIs rôle</h4>
            <div className="grid grid-cols-2 gap-x-4">
              {user.role === "community_manager" && (
                <>
                  <StatItem icon={FileText} label="Posts créés" value={kpis.postsCreated!} />
                  <StatItem icon={Send} label="Posts publiés" value={kpis.postsPublished!} />
                  <StatItem icon={CheckCircle2} label="Taux validation" value={`${kpis.validationRate}%`} />
                  <StatItem icon={Building2} label="Cabinets gérés" value={kpis.firmsManaged!} />
                </>
              )}
              {user.role === "lawyer" && (
                <>
                  <StatItem icon={Timer} label="Délai moy. validation" value={`${kpis.avgValidationDelayH}h`} />
                  <StatItem icon={XCircle} label="Taux de refus" value={`${kpis.refusalRate}%`} />
                  <StatItem icon={Activity} label="Activité plateforme" value={kpis.platformActivity!} />
                </>
              )}
              {user.role === "admin" && (
                <>
                  <StatItem icon={Shield} label="Dernière action" value={kpis.lastAdminAction!} />
                  <StatItem icon={Users} label="Utilisateurs gérés" value={kpis.usersManaged!} />
                </>
              )}
            </div>
            <Separator className="my-4" />
          </>
        )}

        {/* Timeline */}
        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" />Activité récente</h4>
        <div className="space-y-0">
          {timeline.map((entry, i) => {
            const Icon = entry.icon;
            return (
              <div key={i} className="flex items-center gap-3 py-2">
                <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{entry.label}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{entry.timestamp}</span>
              </div>
            );
          })}
        </div>

        <Separator className="my-4" />

        {/* Role change action */}
        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><Settings className="h-4 w-4 text-primary" />Actions</h4>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Changer le rôle</Label>
          <Select
            value={user.role || "none"}
            onValueChange={(value) => onRoleChange(user, value)}
            disabled={updatingUserId === user.user_id}
          >
            <SelectTrigger className="w-full">
              {updatingUserId === user.user_id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SelectValue />
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Non assigne</SelectItem>
              <SelectItem value="admin">Super Admin</SelectItem>
              <SelectItem value="community_manager">Community Manager</SelectItem>
              <SelectItem value="lawyer">Avocat</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

// ─── Main component ─────────────────────────────────────────────────────────

export function UserManagement() {
  const queryClient = useQueryClient();
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const { isAdmin } = useSimpleRole();

  // Filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>("all");

  // Detail sheet
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);

  // Create dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newUser, setNewUser] = useState({ email: "", password: "", fullName: "", role: "lawyer" as SimpleRole });

  // ── Fetch users ──

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users-simple"],
    queryFn: async () => {
      const members = await apiRequest<Array<{
        id: string;
        fullName: string | null;
        email: string | null;
        avatarUrl: string | null;
        createdAt: string;
        role: "super_admin" | "community_manager" | "lawyer";
      }>>("/organization/members");

      return members.map((member): UserWithRole => ({
        id: member.id,
        user_id: member.id,
        username: member.email?.split("@")[0] ?? null,
        email: member.email,
        full_name: member.fullName,
        avatar_url: member.avatarUrl,
        created_at: member.createdAt,
        role:
          member.role === "super_admin"
            ? "admin"
            : member.role === "community_manager"
              ? "community_manager"
              : "lawyer",
        role_id: member.id,
      }));
    },
  });

  // ── Filtered users ──

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter((u) => {
      // Search
      if (search) {
        const q = search.toLowerCase();
        const match = [u.full_name, u.username, u.email].some(f => f?.toLowerCase().includes(q));
        if (!match) return false;
      }
      // Role filter
      if (roleFilter !== "all") {
        if (roleFilter === "none" && u.role !== null) return false;
        if (roleFilter !== "none" && u.role !== roleFilter) return false;
      }
      // Activity filter
      if (activityFilter !== "all") {
        const m = generateMetrics(u.user_id);
        if (m.health !== activityFilter) return false;
      }
      return true;
    });
  }, [users, search, roleFilter, activityFilter]);

  // ── Role counters ──

  const counters = useMemo(() => {
    if (!users) return { total: 0, admin: 0, cm: 0, lawyer: 0, none: 0 };
    return {
      total: users.length,
      admin: users.filter(u => u.role === "admin").length,
      cm: users.filter(u => u.role === "community_manager").length,
      lawyer: users.filter(u => u.role === "lawyer").length,
      none: users.filter(u => !u.role).length,
    };
  }, [users]);

  // ── Mutations ──

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole, existingRoleId: _existingRoleId }: { userId: string; newRole: SimpleRole | "none"; existingRoleId: string | null }) => {
      if (newRole === "none") {
        throw new Error("La desaffectation de role n'est pas disponible sur le backend local.");
      }

      const backendRole =
        newRole === "admin"
          ? "super_admin"
          : newRole === "community_manager"
            ? "community_manager"
            : "lawyer";

      await apiRequest(`/organization/members/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: backendRole }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users-simple"] });
      toast.success("Rôle mis à jour avec succès");
      setUpdatingUserId(null);
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour du rôle");
      setUpdatingUserId(null);
    },
  });

  const handleRoleChange = (user: UserWithRole, newRole: string) => {
    setUpdatingUserId(user.user_id);
    updateRoleMutation.mutate({ userId: user.user_id, newRole: newRole as SimpleRole | "none", existingRoleId: user.role_id });
  };

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.fullName) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    setIsCreating(true);
    const { error } = await createUserWithRole(newUser.email, newUser.password, newUser.fullName, newUser.role);
    setIsCreating(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Utilisateur ${newUser.email} cree avec succes`);
    setCreateDialogOpen(false);
    setNewUser({ email: "", password: "", fullName: "", role: "lawyer" });
    queryClient.invalidateQueries({ queryKey: ["admin-users-simple"] });
  };

  // ── Render ──

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header counters */}
      <div className="flex flex-wrap items-center gap-3">
        <CounterPill label="Total" value={counters.total} />
        <CounterPill label="Super Admin" value={counters.admin} color="text-red-600" />
        <CounterPill label="CM" value={counters.cm} color="text-orange-600" />
        <CounterPill label="Avocats" value={counters.lawyer} color="text-amber-600" />
        {counters.none > 0 && <CounterPill label="Non assignés" value={counters.none} />}
        <div className="flex-1" />
        {isAdmin && (
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><UserPlus className="h-4 w-4" />Créer un utilisateur</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un nouveau compte</DialogTitle>
                <DialogDescription>Les identifiants seront communiqués à l'utilisateur par l'administrateur.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nom complet</Label>
                  <Input id="fullName" placeholder="Jean Dupont" value={newUser.fullName} onChange={(e) => setNewUser(prev => ({ ...prev, fullName: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email professionnel</Label>
                  <Input id="email" placeholder="jean.dupont@socialpulse.fr" value={newUser.email} onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value.toLowerCase() }))} />
                  <p className="text-xs text-muted-foreground">Cet email servira d'identifiant de connexion.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={newUser.password} onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">Minimum 8 caractères</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Rôle</Label>
                  <Select value={newUser.role} onValueChange={(v) => setNewUser(prev => ({ ...prev, role: v as SimpleRole }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin"><div className="flex items-center gap-2"><Shield className="h-4 w-4 text-red-600" />Super Admin</div></SelectItem>
                      <SelectItem value="community_manager"><div className="flex items-center gap-2"><Users className="h-4 w-4 text-orange-600" />Community Manager</div></SelectItem>
                      <SelectItem value="lawyer"><div className="flex items-center gap-2"><Gavel className="h-4 w-4 text-amber-600" />Avocat</div></SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Annuler</Button>
                <Button onClick={handleCreateUser} disabled={isCreating}>
                  {isCreating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Création...</> : "Créer le compte"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher un utilisateur..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[170px]"><SelectValue placeholder="Rôle" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les rôles</SelectItem>
            <SelectItem value="admin">Super Admin</SelectItem>
            <SelectItem value="community_manager">Community Manager</SelectItem>
            <SelectItem value="lawyer">Avocat</SelectItem>
            <SelectItem value="none">Non assigné</SelectItem>
          </SelectContent>
        </Select>
        <Select value={activityFilter} onValueChange={(v) => setActivityFilter(v as ActivityFilter)}>
          <SelectTrigger className="w-[170px]"><SelectValue placeholder="Activité" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toute activité</SelectItem>
            <SelectItem value="active">Actif</SelectItem>
            <SelectItem value="low_activity">Faible activité</SelectItem>
            <SelectItem value="inactive">Inactif</SelectItem>
            <SelectItem value="at_risk">À risque</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* User grid */}
      {filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredUsers.map((user) => {
            const metrics = generateMetrics(user.user_id);
            const kpis = generateRoleKPIs(user.user_id, user.role);
            return (
              <UserCard
                key={user.id}
                user={user}
                metrics={metrics}
                kpis={kpis}
                onClick={() => setSelectedUser(user)}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Aucun utilisateur trouvé</p>
        </div>
      )}

      {/* Detail sheet */}
      {selectedUser && (
        <UserDetailSheet
          user={selectedUser}
          open={!!selectedUser}
          onOpenChange={(open) => { if (!open) setSelectedUser(null); }}
          onRoleChange={handleRoleChange}
          updatingUserId={updatingUserId}
        />
      )}
    </div>
  );
}

// ─── Counter pill ────────────────────────────────────────────────────────────

function CounterPill({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border bg-card px-3 py-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-sm font-semibold tabular-nums ${color || ""}`}>{value}</span>
    </div>
  );
}
