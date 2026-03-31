import { useMemo, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { usePublications } from "@/hooks/usePublications";
import { useAutoValidation } from "@/hooks/useAutoValidation";
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useAuth } from "@/hooks/useAuth";
import { useMetrics } from "@/hooks/useMetrics";
import { useSocialConnections } from "@/hooks/useSocialConnections";
import { useUserSession } from "@/hooks/useUserSession";

// Lawyer Dashboard components - critical path (above the fold)
import {
  LawyerDashboardHeader,
  LawyerValidationBlock,
  LawyerSupportCard,
  LawyerAlertsCard,
  LawyerPerformanceCard,
  LawyerQuickStatsCard,
  LawyerEmailingCard,
  LawyerBlogCard,
  LawyerDigitalScoreCard,
  LawyerJudicialEventsCard,
  LawyerTrendsOpportunitiesCard,
} from "@/components/dashboard/lawyer";

// Lazy loaded components (below the fold)
import {
  SuspenseCalendarCard,
  SuspenseSettingsCard,
  SuspenseGoogleBusinessCard,
} from "@/components/dashboard/lazy/LazyDashboardComponents";

import "@/styles/dashboard-animations.css";

export function LawyerDashboard() {
  // Auth & Onboarding
  const { user } = useAuth();
  const { showWelcome, completeOnboarding } = useOnboarding();
  
  // Consolidated session data (profile + firms in ONE query)
  const { profile, firms } = useUserSession();
  
  // Data hooks with pagination limits
  const { publications, loading } = usePublications({ limit: 30 });
  const { delay, getAutoValidationInfo } = useAutoValidation();
  const { metrics, globalMetrics, loading: metricsLoading } = useMetrics({ limit: 15 });
  const { connections } = useSocialConnections();

  // Get current user's law firm subscription plan
  const subscriptionPlan = useMemo(() => {
    if (!firms || firms.length === 0) return 'essentiel';
    const firmData = firms[0]?.law_firms;
    return (firmData as { subscription_plan?: string | null })?.subscription_plan || 'essentiel';
  }, [firms]);

  // Get user's first name
  const userName =
    profile?.first_name ||
    profile?.full_name?.split(" ")[0] ||
    user?.user_metadata?.full_name?.split(" ")[0] ||
    "";

  // Calculate engagement metrics
  const engagementMetrics = useMemo(() => {
    const hasRealMetrics = metrics.length > 0;
    
    const totalLikes = hasRealMetrics 
      ? metrics.reduce((sum, m) => sum + m.likes, 0) 
      : 342;
    const totalComments = hasRealMetrics 
      ? metrics.reduce((sum, m) => sum + m.comments_count, 0) 
      : 87;
    const totalShares = hasRealMetrics 
      ? metrics.reduce((sum, m) => sum + m.shares, 0) 
      : 56;
    
    return {
      totalInteractions: totalLikes + totalComments + totalShares,
      likes: totalLikes,
      comments: totalComments,
      shares: totalShares,
    };
  }, [metrics]);

  // Get active networks from connections
  const activeNetworks = useMemo(() => {
    if (!connections || connections.length === 0) {
      return ['linkedin'];
    }
    return connections
      .filter(c => c.is_active)
      .map(c => c.platform);
  }, [connections]);

  // Get validation delay display
  const validationDelayDisplay = useMemo(() => {
    if (delay === '24h') return '24h';
    if (delay === '48h') return '48h';
    return '72h';
  }, [delay]);

  // Get notification channels from profile
  const notificationChannels = useMemo(() => {
    const channels: string[] = [];
    if (profile?.notification_new_proposals !== false) {
      channels.push('Email');
    }
    if (profile?.notification_reminders !== false) {
      channels.push('App');
    }
    return channels.length > 0 ? channels : ['Email', 'App'];
  }, [profile]);

  return (
    <AppLayout>
      <div className="mx-auto flex max-w-[1120px] flex-col gap-6 pb-10">
        {/* 1. HEADER - GLOBAL STATUS */}
        <div className="dashboard-fade-in" style={{ animationDelay: '0ms' }}>
          <LawyerDashboardHeader userName={userName} />
        </div>

        {/* 2. SCORE DE PRÉSENCE DIGITALE */}
        <div className="dashboard-fade-in" style={{ animationDelay: '50ms' }}>
          <LawyerDigitalScoreCard />
        </div>

        {/* 3. ALERTES + STATS RAPIDES (2 colonnes) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="dashboard-slide-left" style={{ animationDelay: '100ms' }}>
            <LawyerAlertsCard limit={3} />
          </div>
          <div className="dashboard-slide-right" style={{ animationDelay: '150ms' }}>
            <LawyerQuickStatsCard
              totalReach={globalMetrics.totalReach}
              previousMonthReach={9000}
              totalInteractions={engagementMetrics.totalInteractions}
              likes={engagementMetrics.likes}
              comments={engagementMetrics.comments}
              shares={engagementMetrics.shares}
              loading={metricsLoading}
              engagementRate={globalMetrics.avgEngagementRate}
              totalPublications={globalMetrics.totalPublications}
              clicks={metrics.reduce((sum, m) => sum + (m.clicks || 0), 0) || 89}
              goodPerformers={globalMetrics.goodPerformers}
              mediumPerformers={globalMetrics.mediumPerformers}
              improvePerformers={globalMetrics.improvePerformers}
            />
          </div>
        </div>

        {/* 4. PRIORITY BLOCK - POSTS TO VALIDATE */}
        <div className="dashboard-fade-in" style={{ animationDelay: '200ms' }}>
          <LawyerValidationBlock
            publications={publications}
            loading={loading}
            getAutoValidationInfo={getAutoValidationInfo}
          />
        </div>

        {/* 5. PERFORMANCES RECENTES */}
        <div className="dashboard-fade-in" style={{ animationDelay: '250ms' }}>
          <LawyerPerformanceCard 
            metrics={metrics} 
            loading={metricsLoading} 
          />
        </div>

        {/* 6. SUPPORT CM + E-REPUTATION (2 columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="dashboard-slide-left" style={{ animationDelay: '300ms' }}>
            <LawyerSupportCard subscriptionPlan={subscriptionPlan} />
          </div>
          <div className="dashboard-slide-right" style={{ animationDelay: '350ms' }}>
            <SuspenseGoogleBusinessCard />
          </div>
        </div>

        {/* 7. EMAILING + BLOG (2 columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="dashboard-slide-left" style={{ animationDelay: '400ms' }}>
            <LawyerEmailingCard />
          </div>
          <div className="dashboard-slide-right" style={{ animationDelay: '450ms' }}>
            <LawyerBlogCard />
          </div>
        </div>

        {/* 8. CALENDAR + JUDICIAL EVENTS (2 columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="dashboard-slide-left" style={{ animationDelay: '500ms' }}>
            <SuspenseCalendarCard 
              publications={publications} 
              loading={loading} 
            />
          </div>
          <div className="dashboard-slide-right" style={{ animationDelay: '550ms' }}>
            <LawyerJudicialEventsCard />
          </div>
        </div>

        {/* 9. OPPORTUNITÉS + PARAMÈTRES (2 colonnes) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="dashboard-slide-left" style={{ animationDelay: '600ms' }}>
            <LawyerTrendsOpportunitiesCard />
          </div>
          <div className="dashboard-slide-right" style={{ animationDelay: '650ms' }}>
            <SuspenseSettingsCard
              validationDelay={validationDelayDisplay}
              notificationChannels={notificationChannels}
              activeNetworks={activeNetworks}
            />
          </div>
        </div>
        
        {/* Welcome Modal */}
        <WelcomeModal open={showWelcome} onComplete={completeOnboarding} />
      </div>
    </AppLayout>
  );
}

export default LawyerDashboard;
