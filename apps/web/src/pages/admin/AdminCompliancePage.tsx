import { AppLayout } from "@/components/layout/AppLayout";
import { useSimpleRole } from "@/hooks/useSimpleRole";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Scale, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminCompliancePage() {
  const { isAdmin, loading } = useSimpleRole();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-compliance"],
    queryFn: async () => {
      const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

      const { count: blockedCount } = await supabase
        .from("publications")
        .select("id", { count: "exact", head: true })
        .in("validation_status", ["submitted_to_lawyer", "in_lawyer_review"])
        .lt("submitted_at", cutoff);

      const { count: refusedCount } = await supabase
        .from("publications")
        .select("id", { count: "exact", head: true })
        .eq("validation_status", "refused");

      return {
        blockedOver48h: blockedCount || 0,
        totalRefused: refusedCount || 0,
      };
    },
    enabled: isAdmin,
  });

  if (!loading && !isAdmin) return <Navigate to="/dashboard" replace />;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Déontologie & Conformité</h1>
          <p className="text-muted-foreground">Suivi des délais de validation et alertes de conformité</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Contenus bloqués &gt;48h
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{data?.blockedOver48h}</p>
                <p className="text-xs text-muted-foreground mt-1">En attente de validation depuis plus de 48 heures</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                  <AlertTriangle className="h-4 w-4" />
                  Total refusés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{data?.totalRefused}</p>
                <p className="text-xs text-muted-foreground mt-1">Publications refusées sur la plateforme</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4" />
                  État global
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {(data?.blockedOver48h || 0) === 0 ? "✓" : "⚠"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(data?.blockedOver48h || 0) === 0
                    ? "Aucune alerte de conformité active"
                    : "Des contenus nécessitent une attention"}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              Suivi de conformité
            </CardTitle>
            <CardDescription>Vision macro des retards et anomalies — aucune action éditoriale</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground py-4">
              Le suivi détaillé par cabinet sera disponible dans une prochaine version.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
