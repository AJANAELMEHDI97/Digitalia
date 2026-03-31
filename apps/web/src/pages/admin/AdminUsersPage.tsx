import { AppLayout } from "@/components/layout/AppLayout";
import { useSimpleRole } from "@/hooks/useSimpleRole";
import { Navigate } from "react-router-dom";
import { UserManagement } from "@/components/admin/UserManagement";

export default function AdminUsersPage() {
  const { isAdmin, loading } = useSimpleRole();

  if (!loading && !isAdmin) return <Navigate to="/dashboard" replace />;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Utilisateurs</h1>
          <p className="text-muted-foreground">Gestion des accès, rôles et comptes de la plateforme</p>
        </div>
        <UserManagement />
      </div>
    </AppLayout>
  );
}
