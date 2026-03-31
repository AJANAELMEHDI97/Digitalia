import { AppLayout } from "@/components/layout/AppLayout";
import { useSimpleRole } from "@/hooks/useSimpleRole";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LifeBuoy, Info } from "lucide-react";

export default function AdminTicketsPage() {
  const { isAdmin, loading } = useSimpleRole();

  if (!loading && !isAdmin) return <Navigate to="/dashboard" replace />;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tickets & Incidents</h1>
          <p className="text-muted-foreground">Problèmes remontés par les Avocats et Community Managers</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LifeBuoy className="h-5 w-5 text-primary" />
              Support & suivi
            </CardTitle>
            <CardDescription>Gestion des tickets de support et suivi des incidents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border">
              <Info className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">Module de support à venir</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Le système de tickets et d'incidents sera disponible dans une prochaine mise à jour. Les avocats et CM pourront remonter des problèmes directement depuis leur interface.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
