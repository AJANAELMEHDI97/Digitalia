import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useSimpleRole } from "@/hooks/useSimpleRole";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Settings, Shield, Package, Bell, Link2, SlidersHorizontal,
  UserCog, Plus, Edit2, Trash2, Check, X, Info,
  CreditCard, Webhook, CheckCircle, AlertTriangle, Clock,
  Ban, TrendingDown, BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──
interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  editable: boolean;
}

interface Pack {
  id: string;
  name: string;
  posts: number;
  networks: string[];
  blogArticles: number;
  rdvIncluded: number;
  priceMonthly: number;
  active: boolean;
}

interface Integration {
  id: string;
  name: string;
  icon: string;
  status: "active" | "configured" | "placeholder";
  description: string;
}

// ── Mock data ──
const ROLES: Role[] = [
  { id: "admin", name: "Administrateur", description: "Accès complet à la plateforme", permissions: ["all"], userCount: 2, editable: false },
  { id: "cm", name: "Community Manager", description: "Création et gestion de contenu pour les cabinets assignés", permissions: ["content.create", "content.edit", "calendar.manage"], userCount: 5, editable: true },
  { id: "lawyer", name: "Avocat", description: "Validation des contenus et paramètres du cabinet", permissions: ["content.validate", "content.reject", "settings.own"], userCount: 18, editable: true },
];

const PERMISSIONS = [
  { key: "content.create", label: "Créer du contenu" },
  { key: "content.edit", label: "Modifier le contenu" },
  { key: "content.validate", label: "Valider les publications" },
  { key: "content.reject", label: "Refuser les publications" },
  { key: "content.publish", label: "Publier directement" },
  { key: "calendar.manage", label: "Gérer le calendrier" },
  { key: "settings.own", label: "Paramètres personnels" },
  { key: "settings.firm", label: "Paramètres cabinet" },
  { key: "billing.view", label: "Voir la facturation" },
  { key: "users.manage", label: "Gérer les utilisateurs" },
];

const PACKS: Pack[] = [
  { id: "essentiel", name: "Essentiel", posts: 8, networks: ["LinkedIn"], blogArticles: 1, rdvIncluded: 1, priceMonthly: 299, active: true },
  { id: "professionnel", name: "Professionnel", posts: 16, networks: ["LinkedIn", "Instagram"], blogArticles: 2, rdvIncluded: 2, priceMonthly: 499, active: true },
  { id: "premium", name: "Premium", posts: 30, networks: ["LinkedIn", "Instagram", "Facebook", "X"], blogArticles: 4, rdvIncluded: 4, priceMonthly: 799, active: true },
  { id: "test", name: "Test / Essai", posts: 4, networks: ["LinkedIn"], blogArticles: 0, rdvIncluded: 1, priceMonthly: 0, active: true },
];

const INTEGRATIONS: Integration[] = [
  { id: "linkedin", name: "LinkedIn", icon: "🔗", status: "active", description: "Publication et analytics" },
  { id: "facebook", name: "Facebook", icon: "📘", status: "configured", description: "Pages professionnelles" },
  { id: "instagram", name: "Instagram", icon: "📸", status: "configured", description: "Feed et Stories" },
  { id: "stripe", name: "Stripe", icon: "💳", status: "placeholder", description: "Paiements et abonnements" },
  { id: "webhooks", name: "Webhooks", icon: "🔌", status: "placeholder", description: "Intégrations personnalisées" },
];

export default function AdminSettingsPage() {
  const { isAdmin, loading } = useSimpleRole();
  const [activeTab, setActiveTab] = useState("roles");

  if (!loading && !isAdmin) return <Navigate to="/dashboard" replace />;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            Paramètres plateforme
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Configuration globale, rôles, offres et intégrations</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 max-w-2xl">
            <TabsTrigger value="roles" className="gap-1.5 text-xs sm:text-sm">
              <UserCog className="h-4 w-4" />
              <span className="hidden sm:inline">Rôles</span>
            </TabsTrigger>
            <TabsTrigger value="packs" className="gap-1.5 text-xs sm:text-sm">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Packs</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1.5 text-xs sm:text-sm">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifs</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="gap-1.5 text-xs sm:text-sm">
              <Link2 className="h-4 w-4" />
              <span className="hidden sm:inline">Intégrations</span>
            </TabsTrigger>
            <TabsTrigger value="rules" className="gap-1.5 text-xs sm:text-sm">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Règles</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="roles" className="mt-6"><RolesSection /></TabsContent>
          <TabsContent value="packs" className="mt-6"><PacksSection /></TabsContent>
          <TabsContent value="notifications" className="mt-6"><NotificationsSection /></TabsContent>
          <TabsContent value="integrations" className="mt-6"><IntegrationsSection /></TabsContent>
          <TabsContent value="rules" className="mt-6"><GlobalRulesSection /></TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

// ════════════════════════════════════════════════
// 1) RÔLES & PERMISSIONS
// ════════════════════════════════════════════════
function RolesSection() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Rôles & Permissions</h2>
          <p className="text-sm text-muted-foreground">Définir les accès et responsabilités de chaque profil</p>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Nouveau rôle
        </Button>
      </div>

      <div className="space-y-4">
        {ROLES.map(role => (
          <Card key={role.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-base">{role.name}</CardTitle>
                  <Badge variant="secondary">{role.userCount} utilisateurs</Badge>
                  {!role.editable && <Badge variant="outline" className="text-xs">Système</Badge>}
                </div>
                {role.editable && (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Edit2 className="h-4 w-4" /></Button>
                  </div>
                )}
              </div>
              <CardDescription>{role.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {role.permissions.includes("all") ? (
                  <Badge className="bg-primary/10 text-primary border-primary/20">Tous les accès</Badge>
                ) : (
                  role.permissions.map(perm => {
                    const permInfo = PERMISSIONS.find(p => p.key === perm);
                    return (
                      <Badge key={perm} variant="outline" className="text-xs">
                        {permInfo?.label || perm}
                      </Badge>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Permissions matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Matrice des permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Permission</TableHead>
                  {ROLES.map(r => <TableHead key={r.id} className="text-center">{r.name}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {PERMISSIONS.map(perm => (
                  <TableRow key={perm.key}>
                    <TableCell className="text-sm">{perm.label}</TableCell>
                    {ROLES.map(role => (
                      <TableCell key={role.id} className="text-center">
                        {role.permissions.includes("all") || role.permissions.includes(perm.key) ? (
                          <Check className="h-4 w-4 text-emerald-600 mx-auto" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════
// 2) PACKS & OFFRES
// ════════════════════════════════════════════════
function PacksSection() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Packs & Offres</h2>
          <p className="text-sm text-muted-foreground">Configurer les formules d'abonnement proposées aux cabinets</p>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Nouveau pack
        </Button>
      </div>

      <div className="border rounded-lg overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pack</TableHead>
              <TableHead className="text-center">Posts / mois</TableHead>
              <TableHead className="text-center">Réseaux</TableHead>
              <TableHead className="text-center">Articles blog</TableHead>
              <TableHead className="text-center">RDV inclus</TableHead>
              <TableHead className="text-center">Prix / mois</TableHead>
              <TableHead className="text-center">Statut</TableHead>
              <TableHead className="text-center w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PACKS.map(pack => (
              <TableRow key={pack.id}>
                <TableCell className="font-medium">{pack.name}</TableCell>
                <TableCell className="text-center">{pack.posts}</TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-wrap gap-1 justify-center">
                    {pack.networks.map(n => (
                      <Badge key={n} variant="outline" className="text-xs">{n}</Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-center">{pack.blogArticles}</TableCell>
                <TableCell className="text-center">{pack.rdvIncluded}</TableCell>
                <TableCell className="text-center font-semibold">
                  {pack.priceMonthly === 0 ? "Gratuit" : `${pack.priceMonthly} €`}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={pack.active ? "default" : "secondary"} className="text-xs">
                    {pack.active ? "Actif" : "Inactif"}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border text-sm text-muted-foreground">
        <Info className="h-4 w-4 mt-0.5 shrink-0" />
        <p>Les modifications de packs s'appliquent aux nouveaux abonnements. Les cabinets existants conservent leurs conditions jusqu'au prochain renouvellement.</p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════
// 3) NOTIFICATIONS
// ════════════════════════════════════════════════
function NotificationsSection() {
  const [emailValidation, setEmailValidation] = useState(true);
  const [emailPayment, setEmailPayment] = useState(true);
  const [emailChurn, setEmailChurn] = useState(false);
  const [inAppValidation, setInAppValidation] = useState(true);
  const [inAppPayment, setInAppPayment] = useState(true);
  const [inAppAlerts, setInAppAlerts] = useState(true);
  const [reminderAt50, setReminderAt50] = useState(true);
  const [reminderAt80, setReminderAt80] = useState(true);
  const [reminderAt95, setReminderAt95] = useState(true);
  const [paymentReminder7, setPaymentReminder7] = useState(true);
  const [paymentReminder14, setPaymentReminder14] = useState(true);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold">Notifications</h2>
        <p className="text-sm text-muted-foreground">Configurer les alertes email et in-app pour la plateforme</p>
      </div>

      {/* Email */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notifications email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <NotifToggle label="Validation en attente" desc="Email à l'avocat quand un contenu est soumis" checked={emailValidation} onChange={setEmailValidation} />
          <Separator />
          <NotifToggle label="Relances paiement" desc="Email au cabinet en cas de retard de paiement" checked={emailPayment} onChange={setEmailPayment} />
          <Separator />
          <NotifToggle label="Alertes risque churn" desc="Email à l'administrateur pour les comptes à risque" checked={emailChurn} onChange={setEmailChurn} />
        </CardContent>
      </Card>

      {/* In-app */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notifications in-app
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <NotifToggle label="Validation" desc="Notification dans l'application pour les contenus à valider" checked={inAppValidation} onChange={setInAppValidation} />
          <Separator />
          <NotifToggle label="Paiements" desc="Badge d'alerte pour les retards de paiement" checked={inAppPayment} onChange={setInAppPayment} />
          <Separator />
          <NotifToggle label="Alertes opérationnelles" desc="Alertes CM inactifs, surcharge, etc." checked={inAppAlerts} onChange={setInAppAlerts} />
        </CardContent>
      </Card>

      {/* Rappels validation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Rappels validation
          </CardTitle>
          <CardDescription>Relances automatiques à l'avocat pendant le délai de validation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <NotifToggle label="Rappel à 50% du délai" desc="Premier rappel discret" checked={reminderAt50} onChange={setReminderAt50} />
          <Separator />
          <NotifToggle label="Rappel à 80% du délai" desc="Rappel insistant" checked={reminderAt80} onChange={setReminderAt80} />
          <Separator />
          <NotifToggle label="Rappel à 95% du délai" desc="Alerte urgente avant expiration" checked={reminderAt95} onChange={setReminderAt95} />
        </CardContent>
      </Card>

      {/* Relances paiement */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Relances paiement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <NotifToggle label="Relance J+7" desc="Email 7 jours après l'échéance" checked={paymentReminder7} onChange={setPaymentReminder7} />
          <Separator />
          <NotifToggle label="Relance J+14" desc="Email 14 jours après l'échéance avec avertissement" checked={paymentReminder14} onChange={setPaymentReminder14} />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>Enregistrer les notifications</Button>
      </div>
    </div>
  );
}

function NotifToggle({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <Label className="text-sm font-medium">{label}</Label>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

// ════════════════════════════════════════════════
// 4) INTÉGRATIONS
// ════════════════════════════════════════════════
function IntegrationsSection() {
  const statusConfig = {
    active: { label: "Actif", variant: "default" as const, color: "text-emerald-600" },
    configured: { label: "Configuré", variant: "secondary" as const, color: "text-blue-600" },
    placeholder: { label: "À configurer", variant: "outline" as const, color: "text-muted-foreground" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Intégrations</h2>
        <p className="text-sm text-muted-foreground">Connexions aux plateformes sociales, paiement et outils externes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {INTEGRATIONS.map(integ => {
          const cfg = statusConfig[integ.status];
          return (
            <Card key={integ.id} className={cn(integ.status === "placeholder" && "opacity-75")}>
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{integ.icon}</span>
                    <div>
                      <h3 className="font-medium">{integ.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{integ.description}</p>
                    </div>
                  </div>
                  <Badge variant={cfg.variant} className="text-xs">{cfg.label}</Badge>
                </div>
                <div className="mt-4 flex justify-end">
                  {integ.status === "placeholder" ? (
                    <Button variant="outline" size="sm" disabled>Bientôt disponible</Button>
                  ) : (
                    <Button variant="outline" size="sm">Configurer</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Webhooks info */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <Webhook className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium">Webhooks personnalisés</p>
              <p className="text-xs text-muted-foreground mt-1">
                Les webhooks permettront de connecter SocialPulse à vos outils internes (CRM, facturation, etc.). Cette fonctionnalité sera disponible prochainement.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════
// 5) RÈGLES GLOBALES
// ════════════════════════════════════════════════
function GlobalRulesSection() {
  const [validationDelay, setValidationDelay] = useState("48");
  const [suspensionDays, setSuspensionDays] = useState("30");
  const [churnThreshold, setChurnThreshold] = useState("70");
  const [scoringActivity, setScoringActivity] = useState("30");
  const [scoringPayment, setScoringPayment] = useState("25");
  const [scoringRefusal, setScoringRefusal] = useState("20");
  const [scoringCM, setScoringCM] = useState("15");
  const [scoringValidation, setScoringValidation] = useState("10");

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold">Règles globales</h2>
        <p className="text-sm text-muted-foreground">Paramètres transversaux applicables à toute la plateforme</p>
      </div>

      {/* Validation delay */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Délai de validation par défaut
          </CardTitle>
          <CardDescription>Temps accordé à l'avocat avant expiration du contenu soumis</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={validationDelay} onValueChange={setValidationDelay}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24">24 heures</SelectItem>
              <SelectItem value="48">48 heures (recommandé)</SelectItem>
              <SelectItem value="72">72 heures</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Payment suspension */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Ban className="h-5 w-5 text-primary" />
            Suspension retard paiement
          </CardTitle>
          <CardDescription>Nombre de jours de retard avant suspension automatique du compte</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select value={suspensionDays} onValueChange={setSuspensionDays}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 jours</SelectItem>
              <SelectItem value="30">30 jours (recommandé)</SelectItem>
              <SelectItem value="45">45 jours</SelectItem>
              <SelectItem value="60">60 jours</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <p>Un compte suspendu ne peut plus publier de contenu. L'avocat en est informé par email.</p>
          </div>
        </CardContent>
      </Card>

      {/* Churn threshold */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-primary" />
            Seuil de risque churn
          </CardTitle>
          <CardDescription>Score en dessous duquel un cabinet est considéré « à risque »</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Input
              type="number"
              min="0"
              max="100"
              value={churnThreshold}
              onChange={e => setChurnThreshold(e.target.value)}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">/ 100</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Les cabinets avec un score de risque ≥ {churnThreshold} apparaîtront dans les alertes Rétention & Churn.
          </p>
        </CardContent>
      </Card>

      {/* Scoring weights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Paramètres scoring risque
          </CardTitle>
          <CardDescription>Pondération des facteurs dans le calcul du score de risque client</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScoringWeight label="Activité" value={scoringActivity} onChange={setScoringActivity} desc="Fréquence des publications" />
          <Separator />
          <ScoringWeight label="Paiement" value={scoringPayment} onChange={setScoringPayment} desc="Historique de paiement" />
          <Separator />
          <ScoringWeight label="Refus" value={scoringRefusal} onChange={setScoringRefusal} desc="Taux de contenus refusés" />
          <Separator />
          <ScoringWeight label="Interaction CM" value={scoringCM} onChange={setScoringCM} desc="Rendez-vous et échanges" />
          <Separator />
          <ScoringWeight label="Validation" value={scoringValidation} onChange={setScoringValidation} desc="Réactivité de l'avocat" />

          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border text-sm">
            <Info className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">
              Total : <strong className={cn(
                parseInt(scoringActivity) + parseInt(scoringPayment) + parseInt(scoringRefusal) + parseInt(scoringCM) + parseInt(scoringValidation) === 100
                  ? "text-emerald-600"
                  : "text-destructive"
              )}>
                {parseInt(scoringActivity || "0") + parseInt(scoringPayment || "0") + parseInt(scoringRefusal || "0") + parseInt(scoringCM || "0") + parseInt(scoringValidation || "0")}%
              </strong> (doit être égal à 100%)
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>Enregistrer les règles</Button>
      </div>
    </div>
  );
}

function ScoringWeight({ label, value, onChange, desc }: { label: string; value: string; onChange: (v: string) => void; desc: string }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <Label className="text-sm font-medium">{label}</Label>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min="0"
          max="100"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-20 text-center"
        />
        <span className="text-sm text-muted-foreground">%</span>
      </div>
    </div>
  );
}
