import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, Building2, CalendarDays, Plus, RotateCcw } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useCMWorkspace } from "@/hooks/useCMWorkspace";
import { useLawFirmContext } from "@/contexts/LawFirmContext";
import { CMKPICards, KPIFilter } from "@/components/dashboard/cm/CMKPICards";
import { CMCriticalAlerts } from "@/components/dashboard/cm/CMCriticalAlerts";
import { CMCriticalAlertsMonitor } from "@/components/dashboard/cm/CMCriticalAlertsMonitor";
import { CMFirmsList } from "@/components/dashboard/cm/CMFirmsList";
import { CMQuickActions } from "@/components/dashboard/cm/CMQuickActions";
import { CMUpcomingAppointments } from "@/components/dashboard/cm/CMUpcomingAppointments";
import { CMPortfolioHealth } from "@/components/dashboard/cm/CMPortfolioHealth";
import { CMPerformanceBlock } from "@/components/dashboard/cm/CMPerformanceBlock";
import { CMDemoSeed } from "@/components/cm/CMDemoSeed";

export default function CMDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { setSelectedFirmId, refetchFirms } = useLawFirmContext();
  const {
    assignedFirms,
    selectedFirmId,
    firmStats,
    allPublications,
    globalStats,
    isLoading,
    refetch,
  } = useCMWorkspace();

  const [activeFilter, setActiveFilter] = useState<KPIFilter | null>(null);

  const handleDemoSeedComplete = async () => {
    await refetchFirms();
    refetch();
  };

  const userName = user?.user_metadata?.full_name?.split(" ")[0] || "CM";

  const handleFirmSelect = (firmId: string) => {
    setSelectedFirmId(firmId);
    navigate("/calendar");
  };

  const firmNamesMap = useMemo(
    () => new Map(assignedFirms.map((firm) => [firm.id, firm.name])),
    [assignedFirms],
  );

  const filteredFirmStats = useMemo(() => {
    if (!activeFilter || activeFilter === "firms") return firmStats;

    return firmStats.filter((firmStat) => {
      switch (activeFilter) {
        case "pending":
          return firmStat.pending > 0;
        case "refused":
          return firmStat.refused > 0;
        case "scheduled":
          return firmStat.scheduled > 0;
        case "late":
          return firmStat.late > 0;
        case "at_risk":
          return firmStat.status === "blocked";
        default:
          return true;
      }
    });
  }, [activeFilter, firmStats]);

  const totalAwaitingLawyer = 0;

  if (!isLoading && assignedFirms.length === 0) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-2xl space-y-6 py-16">
          <div className="space-y-4 text-center">
            <div className="mx-auto flex w-fit rounded-full bg-amber-50 p-4">
              <Building2 className="h-12 w-12 text-amber-600" />
            </div>
            <div>
              <h1 className="mb-2 text-2xl font-bold">Aucun cabinet assigne</h1>
              <p className="text-muted-foreground">
                Vous n&apos;etes actuellement assigne a aucun cabinet. Contactez votre
                administrateur pour etre rattache a un ou plusieurs cabinets.
              </p>
            </div>
          </div>
          <CMDemoSeed onComplete={handleDemoSeedComplete} />
          <Card className="text-left">
            <CardContent className="flex items-start gap-3 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Besoin d&apos;aide ?</p>
                <p className="text-sm text-muted-foreground">
                  Contactez le support ou votre responsable pour etre assigne a vos cabinets
                  clients.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <CMCriticalAlertsMonitor publications={allPublications} firmNamesMap={firmNamesMap} />

      <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-7 pb-10">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-[34px] font-bold tracking-[-0.04em] text-[#1e2436] md:text-[44px]">
              Bonjour, {userName}
            </h1>
            <p className="mt-1 text-[18px] text-[#9aa1b8]">Vos cabinets en un coup d&apos;oeil</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              asChild
              variant="outline"
              className="h-12 rounded-[18px] border-[#e6e9f4] bg-white px-5 text-[15px] font-semibold text-[#23293d] shadow-[0_10px_30px_rgba(112,122,163,0.05)] hover:bg-[#f7f8fd]"
            >
              <Link to="/calendar">
                <CalendarDays className="mr-2 h-4 w-4" />
                Calendrier
              </Link>
            </Button>
            <Button
              asChild
              className="h-12 rounded-[18px] bg-[#5546d7] px-5 text-[15px] font-semibold text-white shadow-[0_14px_30px_rgba(85,70,215,0.24)] hover:bg-[#4a3aca]"
            >
              <Link to="/editor">
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle publication
              </Link>
            </Button>
          </div>
        </section>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <Skeleton key={index} className="h-[124px] rounded-[28px]" />
            ))}
          </div>
        ) : (
          <>
            <CMKPICards
              totalFirms={globalStats.totalFirms}
              totalPending={globalStats.totalPending}
              totalAwaitingLawyer={totalAwaitingLawyer}
              totalRefused={globalStats.totalRefused}
              totalScheduled={globalStats.totalScheduled}
              totalLate={globalStats.totalLate}
              totalAtRisk={globalStats.totalAtRisk}
              totalImminentAppointments={0}
              totalPublications30d={globalStats.totalPublications30d}
              totalVolume={globalStats.totalVolume}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />

            {activeFilter && (
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="flex h-10 items-center gap-2 rounded-full bg-[#eef2ff] px-4 text-[14px] font-semibold text-[#5b63d3]"
                >
                  Filtre actif
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 text-[#5b63d3] hover:bg-transparent hover:text-[#4047b8]"
                    onClick={() => setActiveFilter(null)}
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                </Badge>
              </div>
            )}
          </>
        )}

        <div className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
          {isLoading ? (
            <Skeleton className="h-[360px] rounded-[32px]" />
          ) : (
            <CMCriticalAlerts
              publications={allPublications}
              firmNamesMap={firmNamesMap}
              firmStats={firmStats}
            />
          )}

          <CMUpcomingAppointments />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.14fr_0.86fr]">
          {isLoading ? (
            <Skeleton className="h-[360px] rounded-[32px]" />
          ) : (
            <CMFirmsList
              firmStats={filteredFirmStats}
              selectedFirmId={selectedFirmId}
              onSelectFirm={handleFirmSelect}
            />
          )}

          <div className="space-y-6">
            {!isLoading && <CMPortfolioHealth firmStats={firmStats} />}
            {!isLoading && <CMPerformanceBlock publications={allPublications} firmStats={firmStats} />}
            <CMQuickActions />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
