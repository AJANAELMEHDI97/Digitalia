import { AppLayout } from "@/components/layout/AppLayout";
import { useSimpleRole } from "@/hooks/useSimpleRole";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bell, Info } from "lucide-react";

export default function AdminNotificationsPage() {
  const { isAdmin, loading } = useSimpleRole();

  if (!loading && !isAdmin) return <Navigate to="/dashboard" replace />;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications globales</h1>
          <p className="text-muted-foreground">Alertes retards, urgences et anomalies système</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Configuration des notifications
            </CardTitle>
            <CardDescription>Paramétrer les alertes envoyées aux administrateurs de la plateforme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border">
              <Info className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">Configuration à venir</p>
                <p className="text-sm text-muted-foreground mt-1">
                  La configuration des notifications globales (seuils de retard, alertes urgence, anomalies système) sera disponible dans une prochaine mise à jour.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
