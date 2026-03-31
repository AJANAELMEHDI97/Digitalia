import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { CMSidebar } from "./CMSidebar";
import { AdminSidebar } from "./AdminSidebar";
import { AppHeader } from "./AppHeader";
import { ScrapingProgressTracker } from "@/components/admin/ScrapingProgressTracker";
import { FloatingAIButton } from "@/components/support/FloatingAIButton";
import { FloatingCoordinationWidget } from "@/components/admin/coordination/FloatingCoordinationWidget";
import { useSimpleRole } from "@/hooks/useSimpleRole";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { effectiveRole } = useSimpleRole();

  const SidebarComponent =
    effectiveRole === 'community_manager' ? CMSidebar
    : effectiveRole === 'admin' ? AdminSidebar
    : AppSidebar;

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full max-w-full flex-col overflow-x-hidden bg-[#f5f6fd]">
        <div className="flex flex-1 overflow-hidden">
          <SidebarComponent />
          <div className="flex flex-1 flex-col overflow-hidden min-w-0">
            <AppHeader />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#f5f6fd] px-5 py-7 min-w-0 md:px-8 md:py-8">
              {children}
            </main>
          </div>
        </div>
        <ScrapingProgressTracker />
        <FloatingAIButton />
        <FloatingCoordinationWidget />
      </div>
    </SidebarProvider>
  );
}
