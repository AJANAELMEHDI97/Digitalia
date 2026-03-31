import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useSimpleRole } from "@/hooks/useSimpleRole";
import { useSimpleAuth } from "@/hooks/useSimpleAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AppLayout } from "@/components/layout/AppLayout";
import { AlertTriangle, RefreshCw, Loader2 } from "lucide-react";

// Lazy imports for dashboards
import { lazy, Suspense } from "react";
const AdminDashboard = lazy(() => import("@/components/dashboard/AdminDashboard"));
const CMDashboard = lazy(() => import("@/pages/CMDashboard"));
const LawyerDashboard = lazy(() => import("@/components/dashboard/LawyerDashboard"));

function DashboardSkeleton() {
  return (
    <div className="space-y-4 w-full max-w-4xl mx-auto">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <Skeleton className="h-64 lg:col-span-2" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}

export function DashboardRouter() {
  const { user, loading: authLoading } = useSimpleAuth();
  const { effectiveRole, loading: roleLoading, error, errorMessage, isSimulating } = useSimpleRole();
  
  // Timeout warning state
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  
  const loading = authLoading || roleLoading;
  
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => setShowTimeoutWarning(true), 10000);
      return () => clearTimeout(timer);
    } else {
      setShowTimeoutWarning(false);
    }
  }, [loading]);

  // Not logged in - redirect to login
  if (!authLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  // Error state - show friendly error with retry button
  if (error) {
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
              Veuillez réessayer dans quelques instants.
            </p>
            {errorMessage && (
              <p className="text-xs text-muted-foreground/70 font-mono mt-2">
                Détail : {errorMessage}
              </p>
            )}
          </div>
          <Button onClick={() => window.location.reload()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Rafraîchir la page
          </Button>
        </div>
      </AppLayout>
    );
  }

  // Loading state
  if (loading) {
    return (
      <AppLayout>
        <DashboardSkeleton />
        
        {/* Timeout warning */}
        {showTimeoutWarning && (
          <Alert className="border-amber-200 bg-amber-50 mt-6 max-w-2xl mx-auto">
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
      </AppLayout>
    );
  }

  // Route to appropriate dashboard based on effectiveRole (includes simulation)
  return (
    <Suspense fallback={<AppLayout><DashboardSkeleton /></AppLayout>}>
      {effectiveRole === 'admin' && <AdminDashboard />}
      {effectiveRole === 'community_manager' && <CMDashboard />}
      {effectiveRole === 'lawyer' && <LawyerDashboard />}
      {!effectiveRole && <Navigate to="/login" replace />}
    </Suspense>
  );
}
