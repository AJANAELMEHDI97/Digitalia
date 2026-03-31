import { AppLayout } from "@/components/layout/AppLayout";
import { useSimpleRole } from "@/hooks/useSimpleRole";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollText } from "lucide-react";
import { AdminActivityLog } from "@/components/dashboard/admin/AdminActivityLog";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { useAdminLogs } from "@/hooks/useAdminLogs";

export default function AdminAuditPage() {
  const { isAdmin, loading } = useSimpleRole();
  const { activityLog: fallbackActivityLog, loading: fallbackLoading } = useAdminDashboard();
  const { data: activityLogFromApi = [], isLoading: apiLoading } = useAdminLogs();
  const activityLog = activityLogFromApi.length ? activityLogFromApi as any : (fallbackActivityLog as any);
  const dataLoading = apiLoading || fallbackLoading;

  if (!loading && !isAdmin) return <Navigate to="/dashboard" replace />;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Journal d'activité</h1>
          <p className="text-muted-foreground">Historique horodaté des actions : validations, refus, publications, connexions</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScrollText className="h-5 w-5 text-primary" />
              Historique complet
            </CardTitle>
            <CardDescription>Traçabilité et conformité — toutes les actions sont enregistrées</CardDescription>
          </CardHeader>
          <CardContent>
            <AdminActivityLog entries={activityLog} loading={dataLoading} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
