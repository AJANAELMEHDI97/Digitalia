import { AppLayout } from "@/components/layout/AppLayout";
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { cn } from "@/lib/utils";
import { StrategicBar } from "./admin/StrategicBar";
import { MRREvolutionChart } from "./admin/MRREvolutionChart";
import { BusinessBlock } from "./admin/BusinessBlock";
import { PipelineConversionChart } from "./admin/PipelineConversionChart";
import { OperationalBlock } from "./admin/OperationalBlock";
import { OperationalActivityChart } from "./admin/OperationalActivityChart";
import { RiskAlertsList } from "./admin/RiskAlertsList";
import { AdminActivityLog } from "./admin/AdminActivityLog";

export function AdminDashboard() {
  const { showWelcome, completeOnboarding } = useOnboarding();
  const { stats, statsLoading, alerts, alertsLoading, activityLog, logLoading } = useAdminDashboard();

  const totalAlerts =
    (stats.clientHealth.atRiskChurn || 0) +
    (stats.clientHealth.paymentDelays || 0) +
    (stats.team.firmsWithoutCM || 0);

  const healthLabel =
    totalAlerts === 0 ? "Sain" : totalAlerts <= 3 ? "Attention" : "Critique";

  const healthTone =
    totalAlerts === 0
      ? "bg-[#eafaf1] text-[#15996f]"
      : totalAlerts <= 3
        ? "bg-[#fff6dd] text-[#d38411]"
        : "bg-[#fdeaea] text-[#ff584f]";

  return (
    <AppLayout>
      <div className="mx-auto max-w-[1480px] space-y-8 px-2 py-2 md:px-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[40px] font-bold tracking-[-0.04em] text-[#1f2538] md:text-[52px]">
              Cockpit Admin
            </h1>
            <p className="mt-1 text-[18px] text-[#9aa1b8]">Vue strategique temps reel</p>
          </div>
          <span
            className={cn(
              "inline-flex h-11 items-center rounded-full px-5 text-[16px] font-semibold",
              healthTone,
            )}
          >
            {healthLabel}
          </span>
        </div>

        <StrategicBar stats={stats} loading={statsLoading} />

        <MRREvolutionChart
          mrr={stats.revenue.mrr}
          mrrVariation={stats.revenue.mrrVariation}
          loading={statsLoading}
        />

        <BusinessBlock stats={stats} loading={statsLoading} />

        <PipelineConversionChart
          acquisition={stats.acquisition}
          demosCompleted={stats.demosCompleted}
          loading={statsLoading}
        />

        <OperationalBlock stats={stats} loading={statsLoading} />

        <OperationalActivityChart
          publications30d={stats.businessKPIs.publications30d}
          refusalRate={stats.businessKPIs.refusalRate}
          avgValidationTimeHours={stats.businessKPIs.avgValidationTimeHours}
          loading={statsLoading}
        />

        <RiskAlertsList alerts={alerts} loading={alertsLoading} />

        <AdminActivityLog entries={activityLog.slice(0, 5)} loading={logLoading} />

        <WelcomeModal open={showWelcome} onComplete={completeOnboarding} />
      </div>
    </AppLayout>
  );
}

export default AdminDashboard;
