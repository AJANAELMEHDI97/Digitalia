import { AppLayout } from "@/components/layout/AppLayout";
import { useSimpleRole } from "@/hooks/useSimpleRole";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link2, Info } from "lucide-react";

export default function AdminChannelsPage() {
  const { isAdmin, loading } = useSimpleRole();

  if (!loading && !isAdmin) return <Navigate to="/dashboard" replace />;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Canaux & Intégrations</h1>
          <p className="text-muted-foreground">Statut des connexions sociales — LinkedIn, Google Business, etc.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              État des intégrations
            </CardTitle>
            <CardDescription>Vue globale des connexions actives — aucun paramétrage individuel de compte social</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border">
              <Info className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">Vue d'ensemble à venir</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Le tableau de bord des intégrations (statut des connexions LinkedIn, Google Business, mode Preview/Actif) sera disponible dans une prochaine mise à jour.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
