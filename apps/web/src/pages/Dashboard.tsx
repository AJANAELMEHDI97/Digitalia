import { useState, useEffect } from "react";
import { useUserRole } from "@/hooks/useUserRole";
import { useDeferredSeed } from "@/hooks/useDeferredSeed";
import { LawyerDashboard } from "@/components/dashboard/LawyerDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AppLayout } from "@/components/layout/AppLayout";
import { AlertTriangle, RefreshCw, Loader2 } from "lucide-react";

export default function Dashboard() {
  // Deferred demo content seeding - runs 3s after mount
  useDeferredSeed({ delayMs: 3000 });
  
  // Use useUserRole for role checks (handles simulation!)
  const { 
    isLawyer, 
    isSuperAdmin, 
    isOpsAdmin, 
    isFinance,
    isSimulatingRole,
    loading: roleLoading,
    error: roleError,
    errorMessage 
  } = useUserRole();
  
  // Timeout indicator state
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  
  useEffect(() => {
    if (roleLoading) {
      const timer = setTimeout(() => setShowTimeoutWarning(true), 10000);
      return () => clearTimeout(timer);
    } else {
      setShowTimeoutWarning(false);
    }
  }, [roleLoading]);
  
  // Error state - show friendly error message with retry
  if (roleError) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto text-center py-16 space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-amber-100 p-4">
              <AlertTriangle className="h-12 w-12 text-amber-600" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              Connexion temporairement indisponible
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Nous rencontrons des difficultés à charger vos données. 
              Cela peut être dû à un problème de réseau temporaire.
            </p>
            {errorMessage && (
              <p className="text-xs text-muted-foreground/70 font-mono mt-2">
                Détail : {errorMessage}
              </p>
            )}
          </div>
          <div className="flex justify-center gap-3">
            <Button onClick={() => window.location.reload()} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Rafraîchir la page
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  // Show skeleton while roles are loading to prevent flash of wrong dashboard
  if (roleLoading) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto space-y-6 p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Skeleton className="h-64 lg:col-span-2 rounded-lg" />
            <Skeleton className="h-64 rounded-lg" />
          </div>
          
          {/* Timeout warning */}
          {showTimeoutWarning && (
            <Alert className="border-amber-200 bg-amber-50">
              <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
              <AlertTitle className="text-amber-800">Chargement en cours...</AlertTitle>
              <AlertDescription className="text-amber-700">
                Le chargement prend plus de temps que prévu.{" "}
                <button 
                  onClick={() => window.location.reload()} 
                  className="underline font-medium hover:text-amber-900"
                >
                  Rafraîchir la page
                </button>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </AppLayout>
    );
  }

  // Show Lawyer dashboard:
  // - If simulating a role: show lawyer dashboard if simulated role is lawyer
  // - Otherwise: show for "pure" lawyers (not admins)
  const showLawyerDashboard = isSimulatingRole 
    ? isLawyer 
    : (isLawyer && !isSuperAdmin && !isOpsAdmin && !isFinance);

  // Route to role-specific dashboard
  if (showLawyerDashboard) {
    return <LawyerDashboard />;
  }

  return <AdminDashboard />;
}
