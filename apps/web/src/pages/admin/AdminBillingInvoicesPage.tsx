import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Receipt, FileText, Clock, AlertTriangle, TrendingUp, ShieldAlert,
  Search, ArrowUpDown, Download, AlertCircle, Ban, CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, subDays, subMonths, differenceInDays, isAfter, isBefore, startOfMonth } from "date-fns";
import { fr } from "date-fns/locale";

// ── Demo data ──────────────────────────────────────────────
interface DemoInvoice {
  id: string;
  invoice_number: string;
  firm_name: string;
  plan_name: string;
  amount: number;
  period_start: string;
  period_end: string;
  status: "paid" | "pending" | "failed";
  created_at: string;
  payment_attempts: number;
  stripe_id: string;
}

const FIRMS = [
  { name: "Cabinet Dupont & Associés", plan: "Entreprise", amount: 890 },
  { name: "Cabinet Martin Avocats", plan: "Premium", amount: 490 },
  { name: "SCP Lefebvre-Girard", plan: "Essentiel", amount: 290 },
  { name: "Cabinet Moreau Legal", plan: "Premium", amount: 490 },
  { name: "Avocats Bernard & Co", plan: "Entreprise", amount: 890 },
  { name: "Cabinet Petit Droit", plan: "Essentiel", amount: 290 },
];

function generateDemoInvoices(): DemoInvoice[] {
  const now = new Date();
  const invoices: DemoInvoice[] = [];
  const statuses: ("paid" | "pending" | "failed")[] = [
    "paid","paid","paid","paid","paid","paid","paid","paid","paid","paid",
    "pending","pending","pending","pending","pending",
    "failed","failed","failed",
  ];

  for (let i = 0; i < 18; i++) {
    const firm = FIRMS[i % FIRMS.length];
    const monthOffset = Math.floor(i / 6);
    const periodStart = subMonths(startOfMonth(now), monthOffset);
    const periodEnd = subDays(subMonths(startOfMonth(now), monthOffset - 1), 1);
    const status = statuses[i];

    invoices.push({
      id: `demo-inv-${i}`,
      invoice_number: `SP-2026-${String(200 + i).padStart(4, "0")}`,
      firm_name: firm.name,
      plan_name: firm.plan,
      amount: firm.amount,
      period_start: format(periodStart, "yyyy-MM-dd"),
      period_end: format(periodEnd, "yyyy-MM-dd"),
      status,
      created_at: format(periodStart, "yyyy-MM-dd"),
      payment_attempts: status === "failed" ? 3 : status === "pending" ? 1 : 1,
      stripe_id: `pi_demo_${Math.random().toString(36).slice(2, 10)}`,
    });
  }
  return invoices;
}

// ── KPI Card ───────────────────────────────────────────────
function KPICard({ label, value, icon: Icon, tooltip, alert = false }: {
  label: string; value: string; icon: React.ElementType; tooltip: string; alert?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn(
          "rounded-lg border bg-card p-4 flex flex-col gap-2 transition-all hover:shadow-elevated cursor-help",
          alert && "border-destructive/30 bg-destructive/5"
        )}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{label}</span>
            <Icon className={cn("h-4 w-4", alert ? "text-destructive/70" : "text-muted-foreground/60")} />
          </div>
          <div className="text-2xl font-semibold tracking-tight tabular-nums">{value}</div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs text-xs"><p>{tooltip}</p></TooltipContent>
    </Tooltip>
  );
}

// ── Status badge ───────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    paid: { label: "Payée", cls: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" },
    pending: { label: "En attente", cls: "bg-amber-500/10 text-amber-700 border-amber-500/20" },
    failed: { label: "Échouée", cls: "bg-destructive/10 text-destructive border-destructive/20" },
  };
  const s = map[status] || map.pending;
  return <Badge variant="outline" className={s.cls}>{s.label}</Badge>;
}

// ── Page ───────────────────────────────────────────────────
export default function AdminBillingInvoicesPage() {
  const invoices = useMemo(() => generateDemoInvoices(), []);

  const [statusFilter, setStatusFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [packFilter, setPackFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"amount" | "period_end">("period_end");
  const [sortAsc, setSortAsc] = useState(false);

  const now = new Date();
  const monthStart = startOfMonth(now);

  // ── KPI calculations ──
  const paidThisMonth = invoices.filter(i => i.status === "paid" && isAfter(new Date(i.period_start), subDays(monthStart, 1)));
  const encaissements = paidThisMonth.reduce((s, i) => s + i.amount, 0);
  const emises = invoices.filter(i => isAfter(new Date(i.created_at), subDays(monthStart, 1))).length;
  const enAttente = invoices.filter(i => i.status === "pending").length;
  const overdue = invoices.filter(i => i.status === "pending" && isBefore(new Date(i.period_end), now));
  const enRetard = overdue.length;
  const total = invoices.length;
  const paid = invoices.filter(i => i.status === "paid").length;
  const tauxPaiement = total > 0 ? Math.round((paid / total) * 100) : 100;
  const mrrBloque = overdue.reduce((s, i) => s + i.amount, 0);

  // ── Alerts ──
  const alertsCritiques = overdue.filter(i => differenceInDays(now, new Date(i.period_end)) > 7);
  const alertsFailed = invoices.filter(i => i.status === "failed");
  const alertsSuspend = overdue.filter(i => differenceInDays(now, new Date(i.period_end)) > 30);

  // ── Projections ──
  const pending30 = invoices.filter(i => i.status === "pending" && isBefore(new Date(i.period_end), subDays(now, -30)));
  const pending90 = invoices.filter(i => i.status === "pending" && isBefore(new Date(i.period_end), subDays(now, -90)));
  const proj30 = pending30.reduce((s, i) => s + i.amount, 0) + invoices.filter(i => i.status === "pending").reduce((s, i) => s + i.amount, 0);
  const proj90 = pending90.reduce((s, i) => s + i.amount, 0) + invoices.filter(i => i.status === "pending").reduce((s, i) => s + i.amount, 0);

  // ── Filtered & sorted list ──
  const filtered = useMemo(() => {
    let list = [...invoices];
    if (statusFilter !== "all") list = list.filter(i => i.status === statusFilter);
    if (packFilter !== "all") list = list.filter(i => i.plan_name === packFilter);
    if (search) list = list.filter(i => i.firm_name.toLowerCase().includes(search.toLowerCase()));
    if (periodFilter === "month") list = list.filter(i => isAfter(new Date(i.created_at), subDays(monthStart, 1)));
    else if (periodFilter === "3months") list = list.filter(i => isAfter(new Date(i.created_at), subMonths(now, 3)));
    else if (periodFilter === "6months") list = list.filter(i => isAfter(new Date(i.created_at), subMonths(now, 6)));

    list.sort((a, b) => {
      const va = sortKey === "amount" ? a.amount : new Date(a.period_end).getTime();
      const vb = sortKey === "amount" ? b.amount : new Date(b.period_end).getTime();
      return sortAsc ? va - vb : vb - va;
    });
    return list;
  }, [invoices, statusFilter, periodFilter, packFilter, search, sortKey, sortAsc]);

  const toggleSort = (key: "amount" | "period_end") => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const fmt = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

  return (
    <AppLayout>
      <TooltipProvider delayDuration={200}>
        <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Facturation</h1>
            <p className="text-sm text-muted-foreground mt-1">Centre de contrôle financier — encaissements, factures et projections</p>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            <KPICard label="Encaissements du mois" value={fmt(encaissements)} icon={Receipt} tooltip="Total des paiements reçus ce mois" />
            <KPICard label="Factures émises" value={String(emises)} icon={FileText} tooltip="Nombre total de factures générées ce mois" />
            <KPICard label="En attente" value={String(enAttente)} icon={Clock} tooltip="Factures en attente de paiement" alert={enAttente > 10} />
            <KPICard label="En retard" value={String(enRetard)} icon={AlertTriangle} tooltip="Factures dont l'échéance est dépassée" alert={enRetard > 0} />
            <KPICard label="Taux de paiement" value={`${tauxPaiement}%`} icon={TrendingUp} tooltip="Ratio paiements reçus / factures émises" alert={tauxPaiement < 90} />
            <KPICard label="MRR bloqué" value={fmt(mrrBloque)} icon={ShieldAlert} tooltip="Revenu mensuel bloqué par les impayés" alert={mrrBloque > 0} />
          </div>

          {/* Alertes critiques */}
          {(alertsCritiques.length > 0 || alertsFailed.length > 0 || alertsSuspend.length > 0) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  Alertes critiques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {alertsCritiques.map(a => (
                  <div key={a.id} className="flex items-center gap-3 text-sm p-2 rounded-md bg-destructive/5 border border-destructive/15">
                    <Badge variant="destructive" className="text-[10px] shrink-0">CRITIQUE</Badge>
                    <span className="text-foreground">{a.firm_name}</span>
                    <span className="text-muted-foreground">—</span>
                    <span className="font-medium">{fmt(a.amount)}</span>
                    <span className="text-muted-foreground ml-auto">{differenceInDays(now, new Date(a.period_end))}j de retard</span>
                  </div>
                ))}
                {alertsFailed.map(a => (
                  <div key={a.id} className="flex items-center gap-3 text-sm p-2 rounded-md bg-amber-500/5 border border-amber-500/15">
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/20 text-[10px] shrink-0">WARNING</Badge>
                    <span className="text-foreground">{a.firm_name}</span>
                    <span className="text-muted-foreground">— Paiement échoué ({a.payment_attempts} tentatives)</span>
                    <span className="font-medium ml-auto">{fmt(a.amount)}</span>
                  </div>
                ))}
                {alertsSuspend.map(a => (
                  <div key={a.id} className="flex items-center gap-3 text-sm p-2 rounded-md bg-muted/50 border">
                    <Badge variant="outline" className="text-[10px] shrink-0">INFO</Badge>
                    <Ban className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-foreground">{a.firm_name}</span>
                    <span className="text-muted-foreground">— Compte à suspendre ({differenceInDays(now, new Date(a.period_end))}j)</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Filtres */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher un cabinet…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-9"><SelectValue placeholder="Statut" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="paid">Payée</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="failed">Échouée</SelectItem>
              </SelectContent>
            </Select>
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-[140px] h-9"><SelectValue placeholder="Période" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tout</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
                <SelectItem value="3months">3 mois</SelectItem>
                <SelectItem value="6months">6 mois</SelectItem>
              </SelectContent>
            </Select>
            <Select value={packFilter} onValueChange={setPackFilter}>
              <SelectTrigger className="w-[140px] h-9"><SelectValue placeholder="Pack" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="Essentiel">Essentiel</SelectItem>
                <SelectItem value="Premium">Premium</SelectItem>
                <SelectItem value="Entreprise">Entreprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tableau */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cabinet</TableHead>
                    <TableHead>Pack</TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("amount")}>
                      <span className="flex items-center gap-1">Montant <ArrowUpDown className="h-3 w-3" /></span>
                    </TableHead>
                    <TableHead>Émission</TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("period_end")}>
                      <span className="flex items-center gap-1">Échéance <ArrowUpDown className="h-3 w-3" /></span>
                    </TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-center">Tentatives</TableHead>
                    <TableHead>Stripe ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(inv => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">{inv.firm_name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px]">{inv.plan_name}</Badge>
                      </TableCell>
                      <TableCell className="tabular-nums">{fmt(inv.amount)}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {format(new Date(inv.period_start), "dd MMM yyyy", { locale: fr })}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {format(new Date(inv.period_end), "dd MMM yyyy", { locale: fr })}
                      </TableCell>
                      <TableCell><StatusBadge status={inv.status} /></TableCell>
                      <TableCell className="text-center tabular-nums">{inv.payment_attempts}</TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">{inv.stripe_id}</TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        Aucune facture trouvée
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Projection */}
          <div>
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              Projection des encaissements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">Prévus à 30 jours</p>
                  <p className="text-xl font-semibold tabular-nums">{fmt(proj30)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">Prévus à 90 jours</p>
                  <p className="text-xl font-semibold tabular-nums">{fmt(proj90)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">Impact impayés sur MRR</p>
                  <p className={cn("text-xl font-semibold tabular-nums", mrrBloque > 0 && "text-destructive")}>{fmt(mrrBloque)}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </AppLayout>
  );
}
