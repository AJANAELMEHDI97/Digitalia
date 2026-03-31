import { useLocation, Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  Calendar, 
  ClipboardCheck,
  BarChart3,
  TrendingUp,
  MessageCircle,
  Image,
  Settings,
  ChevronLeft,
  LogOut,
  Newspaper,
  Shield,
  Mail,
  Building2
} from "lucide-react";
import logo from "@/assets/logo.svg";
import { cn } from "@/lib/utils";
import { useSimpleRole } from "@/hooks/useSimpleRole";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const overviewItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
];

const contentItems = [
  { title: "Calendrier", url: "/calendar", icon: Calendar },
  { title: "Communications", url: "/validation", icon: ClipboardCheck },
  { title: "Blog", url: "/blog", icon: Newspaper },
  { title: "Médiathèque", url: "/media", icon: Image },
];

const channelsItems = [
  { title: "Google Business", url: "/google-business", icon: Building2 },
  { title: "Emailing", url: "/emailing", icon: Mail },
];

const insightsItems = [
  { title: "Performances", url: "/metrics", icon: BarChart3 },
  { title: "Actualités juridiques", url: "/trends", icon: TrendingUp },
];

const supportItems = [
  { title: "Conseiller éditorial", url: "/assistant", icon: MessageCircle },
];

const bottomNavItems = [
  { title: "Paramètres", url: "/settings", icon: Settings },
];

interface NavGroup {
  label: string;
  items: typeof overviewItems;
}

const navGroups: NavGroup[] = [
  { label: "", items: overviewItems },
  { label: "Contenu", items: contentItems },
  { label: "Canaux", items: channelsItems },
  { label: "Analyse", items: insightsItems },
  { label: "Support", items: supportItems },
];

export function AppSidebar() {
  const location = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const { 
    isAdmin,
    isCommunityManager,
    isLawyer,
    canAccessAdmin,
    canViewCalendar,
    canAccessBlog,
    canAccessMedia,
    canAccessEmailing,
    canViewMetrics,
    isReadOnlyMode,
    loading: roleLoading 
  } = useSimpleRole();
  const collapsed = state === "collapsed";

  const canAccessGoogleBusiness = isLawyer || isCommunityManager;
  const canViewTrends = true;
  const canViewEditorialAdvice = true;
  const canModifySettings = isAdmin || isLawyer;
  const isDemoObserver = false;

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar 
      className={cn(
        "border-r border-[#ececf6] bg-white transition-all duration-200",
        collapsed ? "w-[84px]" : "w-[284px]"
      )}
      collapsible="icon"
    >
      <SidebarHeader className="px-4 pb-3 pt-6">
        <div className="flex items-start justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img 
              src={logo} 
              alt="SocialPulse" 
              className={cn(
                "object-contain transition-all",
                collapsed ? "h-11 w-auto max-w-[54px]" : "h-[58px] w-auto max-w-[98px]"
              )} 
            />
          </Link>
          {!collapsed && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleSidebar}
              className="mt-1 h-8 w-8 rounded-full text-[#a2a8bf] hover:bg-[#f3f4fb] hover:text-[#6b728b]"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 pb-4">
        {navGroups.map((group, groupIndex) => {
          const filteredItems = group.items.filter(item => {
            switch (item.url) {
              case "/calendar":
              case "/validation":
                return canViewCalendar;
              case "/blog":
                return canAccessBlog;
              case "/media":
                return canAccessMedia;
              case "/google-business":
                return canAccessGoogleBusiness;
              case "/emailing":
                return canAccessEmailing;
              case "/metrics":
                return canViewMetrics;
              case "/trends":
                return canViewTrends;
              case "/assistant":
                return canViewEditorialAdvice;
              default:
                return true;
            }
          });

          if (filteredItems.length === 0) return null;

          return (
            <SidebarGroup key={groupIndex} className={groupIndex > 0 ? "mt-3" : "mt-1"}>
              {group.label && !collapsed && (
                <SidebarGroupLabel className="px-2 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b2b8cb]">
                  {group.label}
                </SidebarGroupLabel>
              )}
              {group.label && collapsed && groupIndex > 0 && (
                <Separator className="my-2 mx-1 bg-[#eef0f8]" />
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.url)}
                        tooltip={collapsed ? item.title : undefined}
                        className={cn(
                          "h-[46px] w-full justify-start gap-3 rounded-2xl px-4 py-3 text-[15px] transition-colors",
                          isActive(item.url)
                            ? "bg-[#ede9ff] font-semibold text-[#5546d7]"
                            : "text-[#9aa1b8] hover:bg-[#f5f6fc] hover:text-[#4c5370]"
                        )}
                      >
                        <Link to={item.url}>
                          <item.icon className="h-4 w-4" />
                          {!collapsed && <span>{item.title}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="px-4 pb-5">
        <Separator className="mb-3 bg-[#eef0f8]" />
        <SidebarMenu>
          {!roleLoading && canAccessAdmin && (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive("/admin")}
                tooltip={collapsed ? "Administration" : undefined}
                  className={cn(
                    "h-[46px] w-full justify-start gap-3 rounded-2xl px-4 py-3 text-[15px] transition-colors",
                    isActive("/admin")
                      ? "bg-[#ede9ff] font-semibold text-[#5546d7]"
                      : "text-[#9aa1b8] hover:bg-[#f5f6fc] hover:text-[#4c5370]"
                )}
              >
                <Link to="/admin">
                  <Shield className="h-4 w-4" />
                  {!collapsed && <span>Administration</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          
          {!roleLoading && isReadOnlyMode && !collapsed && (
            <div className="mx-1 mb-1 px-2.5 py-1.5 rounded-md bg-muted text-xs text-muted-foreground font-medium">
              Mode lecture seule
            </div>
          )}
          
          {!roleLoading && isDemoObserver && !collapsed && (
            <div className="mx-1 mb-1 px-2.5 py-1.5 rounded-md bg-muted text-xs text-muted-foreground font-medium">
              Mode Démonstration
            </div>
          )}
          
          {canModifySettings && bottomNavItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.url)}
              tooltip={collapsed ? item.title : undefined}
              className={cn(
                  "h-[46px] w-full justify-start gap-3 rounded-2xl px-4 py-3 text-[15px] transition-colors",
                  isActive(item.url)
                    ? "bg-[#ede9ff] font-semibold text-[#5546d7]"
                    : "text-[#9aa1b8] hover:bg-[#f5f6fc] hover:text-[#4c5370]"
                )}
              >
                <Link to={item.url}>
                  <item.icon className="h-4 w-4" />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip={collapsed ? "Déconnexion" : undefined}
              className="h-[46px] w-full justify-start gap-3 rounded-2xl px-4 py-3 text-[15px] text-[#9aa1b8] transition-colors hover:bg-[#fff1f1] hover:text-[#ea554d]"
            >
              <Link to="/login">
                <LogOut className="h-4 w-4" />
                {!collapsed && <span>Déconnexion</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
