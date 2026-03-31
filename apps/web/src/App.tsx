import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SimpleAuthProvider } from "@/hooks/useSimpleAuth";
import { AuthProvider } from "@/hooks/useAuth";
import { RoleSimulationProvider } from "@/contexts/RoleSimulationContext";
import { LawFirmProvider } from "@/contexts/LawFirmContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { DashboardRouter } from "@/components/routing/DashboardRouter";
import CalendarPage from "./pages/Calendar";
import Validation from "./pages/Validation";
import Editor from "./pages/Editor";
import Profile from "./pages/Profile";
import Pricing from "./pages/Pricing";
import Metrics from "./pages/Metrics";
import Trends from "./pages/Trends";
import Assistant from "./pages/Assistant";
import Media from "./pages/Media";
import Blog from "./pages/Blog";
import Emailing from "./pages/Emailing";
import SettingsPage from "./pages/Settings";
import Admin from "./pages/Admin";
import GoogleBusiness from "./pages/GoogleBusiness";
import NotFound from "./pages/NotFound";
import Demo from "./pages/Demo";

// Pages CM dédiées
import CMFirms from "./pages/cm/CMFirms";
import CMContent from "./pages/cm/CMContent";
import CMFirmSettings from "./pages/cm/CMFirmSettings";
import CMRequests from "./pages/cm/CMRequests";

// Pages Admin dédiées
import AdminFirmsPage from "./pages/admin/AdminFirmsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminPublicationsPage from "./pages/admin/AdminPublicationsPage";
import AdminCompliancePage from "./pages/admin/AdminCompliancePage";
import AdminAuditPage from "./pages/admin/AdminAuditPage";
import { Navigate } from "react-router-dom";
import AdminNotificationsPage from "./pages/admin/AdminNotificationsPage";
import AdminChannelsPage from "./pages/admin/AdminChannelsPage";
import AdminTicketsPage from "./pages/admin/AdminTicketsPage";

// Nouvelles pages Admin SaaS
import AdminBusinessPage from "./pages/admin/AdminBusinessPage";
import AdminMRRPage from "./pages/admin/AdminMRRPage";
import AdminPaymentsPage from "./pages/admin/AdminPaymentsPage";
import AdminOverduePage from "./pages/admin/AdminOverduePage";
import AdminForecastPage from "./pages/admin/AdminForecastPage";
import AdminChurnPage from "./pages/admin/AdminChurnPage";
import AdminConversionsPage from "./pages/admin/AdminConversionsPage";
import AdminAccountsPage from "./pages/admin/AdminAccountsPage";
import AdminKPISaaSPage from "./pages/admin/AdminKPISaaSPage";
import AdminLeadsPipelinePage from "./pages/admin/AdminLeadsPipelinePage";
import AdminLeadsAttributionPage from "./pages/admin/AdminLeadsAttributionPage";
import AdminLeadsDemosPage from "./pages/admin/AdminLeadsDemosPage";
import AdminLeadsConversionRatePage from "./pages/admin/AdminLeadsConversionRatePage";
import AdminLeadsStatusPage from "./pages/admin/AdminLeadsStatusPage";
import AdminBillingInvoicesPage from "./pages/admin/AdminBillingInvoicesPage";
import AdminBillingReceivedPage from "./pages/admin/AdminBillingReceivedPage";
import AdminBillingDelaysPage from "./pages/admin/AdminBillingDelaysPage";
import AdminBillingHistoryPage from "./pages/admin/AdminBillingHistoryPage";
import AdminTeamCMsPage from "./pages/admin/AdminTeamCMsPage";
import AdminTeamPerformancePage from "./pages/admin/AdminTeamPerformancePage";
import AdminTeamSalesPage from "./pages/admin/AdminTeamSalesPage";
import AdminTeamStatusPage from "./pages/admin/AdminTeamStatusPage";
import AdminTeamAppointmentsPage from "./pages/admin/AdminTeamAppointmentsPage";
import AdminPlatformSettingsPage from "./pages/admin/AdminPlatformSettingsPage";
import AdminRolesPage from "./pages/admin/AdminRolesPage";
import AdminPacksPage from "./pages/admin/AdminPacksPage";

import AdminDeontologyPage from "./pages/admin/AdminDeontologyPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminAcquisitionPage from "./pages/admin/AdminAcquisitionPage";
import AdminOperationsPage from "./pages/admin/AdminOperationsPage";
import AdminComplianceDashboardPage from "./pages/admin/AdminComplianceDashboardPage";
import AdminCoordinationPage from "./pages/admin/AdminCoordinationPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SimpleAuthProvider>
          <AuthProvider>
            <RoleSimulationProvider>
              <LawFirmProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/landing" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Signup />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/demo" element={<Demo />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/app/dashboard" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/app/*" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<DashboardRouter />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/validation" element={<Validation />} />
                  <Route path="/editor" element={<Editor />} />
                  <Route path="/editor/:id" element={<Editor />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/metrics" element={<Metrics />} />
                  <Route path="/trends" element={<Trends />} />
                  <Route path="/assistant" element={<Assistant />} />
                  <Route path="/media" element={<Media />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/emailing" element={<Emailing />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/google-business" element={<GoogleBusiness />} />
                  
                  {/* Routes CM dédiées */}
                  <Route path="/cm/firms" element={<CMFirms />} />
                  <Route path="/cm/content" element={<CMContent />} />
                  <Route path="/cm/firm-settings" element={<CMFirmSettings />} />
                  <Route path="/cm/requests" element={<CMRequests />} />

                  {/* Routes Admin existantes */}
                  <Route path="/admin/firms" element={<AdminFirmsPage />} />
                  <Route path="/admin/operations" element={<AdminOperationsPage />} />
                  <Route path="/admin/users" element={<AdminUsersPage />} />
                  <Route path="/admin/publications" element={<AdminPublicationsPage />} />
                  <Route path="/admin/compliance" element={<AdminComplianceDashboardPage />} />
                  <Route path="/admin/audit" element={<AdminAuditPage />} />
                  <Route path="/admin/validation-rules" element={<Navigate to="/admin/compliance" replace />} />
                  <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
                  <Route path="/admin/channels" element={<AdminChannelsPage />} />
                  <Route path="/admin/tickets" element={<AdminTicketsPage />} />

                  {/* Routes Admin Business */}
                  <Route path="/admin/business" element={<AdminBusinessPage />} />
                  <Route path="/admin/business/mrr" element={<AdminMRRPage />} />
                  <Route path="/admin/business/accounts" element={<AdminAccountsPage />} />
                  <Route path="/admin/business/forecast" element={<AdminForecastPage />} />
                  <Route path="/admin/business/churn" element={<AdminChurnPage />} />
                  <Route path="/admin/business/kpis" element={<AdminKPISaaSPage />} />
                  {/* Legacy business routes */}
                  <Route path="/admin/business/payments" element={<AdminPaymentsPage />} />
                  <Route path="/admin/business/overdue" element={<AdminOverduePage />} />
                  <Route path="/admin/business/conversions" element={<AdminConversionsPage />} />

                  {/* Routes Admin Acquisition */}
                  <Route path="/admin/acquisition" element={<AdminAcquisitionPage />} />
                  <Route path="/admin/acquisition/leads" element={<Navigate to="/admin/acquisition" replace />} />
                  <Route path="/admin/acquisition/attribution" element={<AdminLeadsAttributionPage />} />
                  <Route path="/admin/acquisition/demos" element={<AdminLeadsDemosPage />} />
                  <Route path="/admin/acquisition/conversion" element={<AdminLeadsConversionRatePage />} />
                  <Route path="/admin/acquisition/pipeline" element={<AdminLeadsStatusPage />} />
                  {/* Legacy leads routes */}
                  <Route path="/admin/leads/pipeline" element={<AdminLeadsPipelinePage />} />
                  <Route path="/admin/leads/attribution" element={<AdminLeadsAttributionPage />} />
                  <Route path="/admin/leads/demos" element={<AdminLeadsDemosPage />} />
                  <Route path="/admin/leads/conversion-rate" element={<AdminLeadsConversionRatePage />} />
                  <Route path="/admin/leads/status" element={<AdminLeadsStatusPage />} />

                  {/* Routes Admin Facturation */}
                  <Route path="/admin/billing/invoices" element={<AdminBillingInvoicesPage />} />
                  <Route path="/admin/billing/received" element={<AdminBillingReceivedPage />} />
                  <Route path="/admin/billing/delays" element={<AdminBillingDelaysPage />} />
                  <Route path="/admin/billing/history" element={<AdminBillingHistoryPage />} />

                  {/* Routes Admin Équipe */}
                  <Route path="/admin/team/cms" element={<AdminTeamCMsPage />} />
                  <Route path="/admin/team/performance" element={<AdminTeamPerformancePage />} />
                  <Route path="/admin/team/sales" element={<AdminTeamSalesPage />} />
                  <Route path="/admin/team/status" element={<AdminTeamStatusPage />} />
                  <Route path="/admin/team/appointments" element={<AdminTeamAppointmentsPage />} />

                  {/* Routes Admin Conformité */}
                  <Route path="/admin/conformity/validations" element={<Navigate to="/admin/compliance" replace />} />
                  <Route path="/admin/conformity/deontology" element={<AdminDeontologyPage />} />

                   {/* Route Admin Coordination */}
                   <Route path="/admin/coordination" element={<AdminCoordinationPage />} />

                   {/* Routes Admin Paramètres */}
                  <Route path="/admin/settings/roles" element={<AdminRolesPage />} />
                  <Route path="/admin/settings/packs" element={<AdminPacksPage />} />
                  <Route path="/admin/settings/notifications" element={<AdminNotificationsPage />} />
                  <Route path="/admin/settings/platform" element={<AdminSettingsPage />} />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </LawFirmProvider>
            </RoleSimulationProvider>
          </AuthProvider>
        </SimpleAuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
