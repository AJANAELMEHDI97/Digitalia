import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Settings, User, Bell, Shield, CreditCard, Clock, Download, FileText, Loader2, Share2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useInvoices } from "@/hooks/useInvoices";
import { SocialConnectionsTab } from "@/components/settings/SocialConnectionsTab";
import { ValidationSLASettings } from "@/components/validation/ValidationSLASettings";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Invoices List Component
function InvoicesList() {
  const { invoices, loading, downloadInvoice } = useInvoices();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Aucune facture pour le moment</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Payée</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">En attente</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Échouée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const recentInvoices = invoices.slice(0, 6);

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Facture</TableHead>
              <TableHead>Période</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentInvoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                <TableCell>
                  {format(new Date(invoice.period_start), 'MMM yyyy', { locale: fr })}
                </TableCell>
                <TableCell>{invoice.amount.toFixed(2)} €</TableCell>
                <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                <TableCell>
                  {invoice.pdf_url && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => downloadInvoice(invoice)}
                      title="Télécharger"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {recentInvoices.map((invoice) => (
          <div 
            key={invoice.id} 
            className="p-4 rounded-lg border bg-card flex items-center justify-between"
          >
            <div className="space-y-1">
              <p className="font-medium text-sm">{invoice.invoice_number}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(invoice.period_start), 'MMMM yyyy', { locale: fr })}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{invoice.amount.toFixed(2)} €</span>
                {getStatusBadge(invoice.status)}
              </div>
            </div>
            {invoice.pdf_url && (
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => downloadInvoice(invoice)}
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {invoices.length > 6 && (
        <Button variant="link" className="w-full">
          Voir toutes les factures ({invoices.length})
        </Button>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") === "connections" ? "connections" : "general";

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Paramètres</h1>
            <p className="text-sm text-muted-foreground">
              Compte, connexions et préférences
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            const next = new URLSearchParams(searchParams);
            if (value === "connections") {
              next.set("tab", "connections");
            } else {
              next.delete("tab");
            }
            setSearchParams(next);
          }}
          className="space-y-6"
        >
          <TabsList>
            <TabsTrigger value="general" className="gap-2">
              <Settings className="h-4 w-4" />
              Général
            </TabsTrigger>
            <TabsTrigger value="connections" className="gap-2">
              <Share2 className="h-4 w-4" />
              Réseaux sociaux
            </TabsTrigger>
          </TabsList>

          {/* General Settings Tab */}
          <TabsContent value="general" className="space-y-6 max-w-2xl">

        {/* Account */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Compte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled />
            </div>
            <Button variant="outline" asChild>
              <Link to="/profile">Modifier mon profil</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Validation SLA Settings */}
        <ValidationSLASettings />

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Nouvelles propositions</p>
                <p className="text-xs text-muted-foreground">
                  Recevoir un email quand SocialPulse propose du contenu
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Rappels de validation</p>
                <p className="text-xs text-muted-foreground">
                  Rappel pour les publications en attente
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Sécurité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Modifier mon mot de passe</Button>
          </CardContent>
        </Card>

        {/* Subscription & Billing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Abonnement & Facturation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Plan */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm text-muted-foreground">Formule actuelle</p>
                <p className="font-semibold text-lg">Solo</p>
              </div>
              <Button variant="outline" asChild>
                <Link to="/pricing">Changer de formule</Link>
              </Button>
            </div>

            <Separator />

            {/* Invoices Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium">Historique des factures</h3>
              </div>

              <InvoicesList />
            </div>
          </CardContent>
        </Card>
          </TabsContent>

          {/* Social Connections Tab */}
          <TabsContent value="connections" className="max-w-3xl">
            <SocialConnectionsTab />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
