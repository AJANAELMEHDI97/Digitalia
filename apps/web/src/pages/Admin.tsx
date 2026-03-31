import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { useSimpleRole } from "@/hooks/useSimpleRole";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Search, Shield } from "lucide-react";
import { UserManagement } from "@/components/admin/UserManagement";
import { LawyerScraping } from "@/components/admin/LawyerScraping";
import { LawyersList } from "@/components/admin/LawyersList";

export default function Admin() {
  const navigate = useNavigate();
  const { isAdmin, loading } = useSimpleRole();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/dashboard");
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Administration</h1>
            <p className="text-muted-foreground">
              Gérez les utilisateurs et le scraping de données d'avocats
            </p>
          </div>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="scraping" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Scraping
            </TabsTrigger>
            <TabsTrigger value="lawyers" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Avocats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="scraping" className="mt-6">
            <LawyerScraping />
          </TabsContent>

          <TabsContent value="lawyers" className="mt-6">
            <LawyersList />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
