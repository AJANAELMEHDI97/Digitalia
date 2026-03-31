import { AppLayout } from "@/components/layout/AppLayout";
import { useAdminAccounts } from "@/hooks/admin/useAdminAccounts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, FlaskConical, UserCheck, UserX, AlertTriangle } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Cell,
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { AdminKPICard } from "@/components/admin/shared/AdminUI";

export default function AdminAccountsPage() {
  const { active, test, converted, churned, suspended, overdueList, statusDistribution, loading } = useAdminAccounts();

  return (
    <AppLayout>
      <TooltipProvider delayDuration={200}>
        <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Comptes</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Vue unifiée des comptes Test, Actifs, Convertis et Résiliés
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <AdminKPICard
                label="Actifs"
                value={String(active)}
                icon={Building2}
                tooltip="Nombre de cabinets avec un abonnement payant actif. Base principale de revenus récurrents."
              />
              <AdminKPICard
                label="En test"
                value={String(test)}
                icon={FlaskConical}
                tooltip="Cabinets en période d'essai. Cible prioritaire pour la conversion — suivez leur activation dans les 14 premiers jours."
              />
              <AdminKPICard
                label="Convertis (mois)"
                value={String(converted)}
                icon={UserCheck}
                positive={converted > 0}
                sub={converted > 0 ? "Ce mois" : undefined}
                tooltip={`${converted} cabinets passés de test à payant ce mois. ${converted >= 3 ? "Rythme de conversion sain." : "Rythme faible — vérifiez le parcours d'activation et le suivi commercial."}`}
              />
              <AdminKPICard
                label="Résiliés"
                value={String(churned)}
                icon={UserX}
                alert={churned > 5}
                tooltip={`${churned} cabinets ont résilié leur abonnement. ${churned > 5 ? "Nombre élevé — analysez les motifs de départ et renforcez la rétention." : "Niveau acceptable pour la base actuelle."}`}
              />
              <AdminKPICard
                label="Suspendus"
                value={String(suspended)}
                icon={AlertTriangle}
                alert={suspended > 0}
                tooltip={`${suspended} comptes suspendus (retard de paiement ou demande manuelle). ${suspended > 0 ? "Contactez ces comptes rapidement pour éviter une résiliation définitive." : "Aucun compte suspendu — situation saine."}`}
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Status distribution */}
            <Card>
              <CardHeader className="pb-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <CardTitle className="text-base cursor-help">Répartition par statut</CardTitle>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Distribution des comptes par statut. Un ratio élevé de comptes actifs vs test indique une bonne conversion. Surveillez les suspendus et résiliés.</p>
                  </TooltipContent>
                </Tooltip>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusDistribution} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <YAxis type="category" dataKey="status" width={80} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <RTooltip />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                        {statusDistribution.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Overdue table */}
            <Card>
              <CardHeader className="pb-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <CardTitle className="text-base cursor-help">Retards majeurs</CardTitle>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Cabinets avec des factures impayées. Les retards supérieurs à 30 jours augmentent fortement le risque de résiliation. Priorisez les relances.</p>
                  </TooltipContent>
                </Tooltip>
              </CardHeader>
              <CardContent>
                {overdueList.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">Aucun retard de paiement</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cabinet</TableHead>
                        <TableHead className="text-right">Montant</TableHead>
                        <TableHead className="text-right">Retard</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {overdueList.map((item, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium text-sm">{item.firmName}</TableCell>
                          <TableCell className="text-right text-sm">{item.amount} €</TableCell>
                          <TableCell className="text-right">
                            <Badge variant={item.daysOverdue > 30 ? "destructive" : "secondary"} className="text-xs">
                              {item.daysOverdue}j
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </TooltipProvider>
    </AppLayout>
  );
}