import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  TrendingUp,
  UserMinus,
  Calendar,
  BarChart3,
  Target,
  ArrowRightLeft,
  Building2,
  Users,
  Activity,
  Receipt,
  History,
  ScrollText,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  Shield,
  MessageSquare,
  PenSquare,
  ClipboardCheck,
} from "lucide-react";
import logo from "@/assets/logo.svg";
import { cn } from "@/lib/utils";
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

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const adminNavGroups: NavGroup[] = [
  {
    label: "",
    items: [{ title: "Dashboard", url: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Studio editorial",
    items: [
      { title: "Calendrier", url: "/calendar", icon: Calendar },
      { title: "Creer un post", url: "/editor", icon: PenSquare },
      { title: "Validation", url: "/validation", icon: ClipboardCheck },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Vue d'ensemble", url: "/admin/operations", icon: Activity },
      { title: "Cabinets", url: "/admin/firms", icon: Building2 },
      { title: "Utilisateurs", url: "/admin/users", icon: Users },
      { title: "Prises de parole", url: "/admin/publications", icon: ScrollText },
      { title: "CM & Activite", url: "/admin/team/cms", icon: Activity },
    ],
  },
  {
    label: "Business",
    items: [
      { title: "Vue d'ensemble", url: "/admin/business", icon: BarChart3 },
      { title: "Revenus & MRR", url: "/admin/business/mrr", icon: TrendingUp },
      { title: "Facturation", url: "/admin/billing/invoices", icon: Receipt },
      { title: "Acquisition & Pipeline", url: "/admin/acquisition", icon: Target },
      { title: "Retention & Churn", url: "/admin/business/churn", icon: UserMinus },
      { title: "KPIs SaaS", url: "/admin/business/kpis", icon: BarChart3 },
    ],
  },
  {
    label: "Coordination",
    items: [{ title: "Centre de coordination", url: "/admin/coordination", icon: MessageSquare }],
  },
  {
    label: "Conformite",
    items: [
      { title: "Vue d'ensemble", url: "/admin/compliance", icon: Shield },
      { title: "Journal d'activite", url: "/admin/audit", icon: History },
    ],
  },
  {
    label: "Parametres",
    items: [
      { title: "Vue d'ensemble", url: "/admin/settings/platform", icon: Settings },
      { title: "Notifications", url: "/admin/settings/notifications", icon: Bell },
      { title: "Canaux & integrations", url: "/admin/channels", icon: ArrowRightLeft },
    ],
  },
];

export function AdminSidebar() {
  const location = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";

  const isActive = (path: string) =>
    location.pathname === path || (path !== "/dashboard" && location.pathname.startsWith(`${path}/`));

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-[#ebeef6] bg-white"
      style={
        {
          "--sidebar-width": "18.8rem",
          "--sidebar-width-icon": "5.25rem",
        } as React.CSSProperties
      }
    >
      <SidebarHeader className={cn("px-5 pb-4 pt-8", collapsed && "px-3")}>
        <div className={cn("flex items-start justify-between", collapsed && "justify-center")}>
          <Link to="/dashboard" className={cn("flex items-center", collapsed ? "justify-center" : "pl-2")}>
            <img
              src={logo}
              alt="SocialPulse"
              className={cn(
                "object-contain transition-all duration-200",
                collapsed ? "h-[46px] w-auto max-w-[56px]" : "h-[62px] w-auto max-w-[106px]",
              )}
            />
          </Link>

          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="mt-1 h-10 w-10 rounded-full text-[#9aa1b8] hover:bg-[#f4f5fc] hover:text-[#6d7593]"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 pb-4">
        {adminNavGroups.map((group, groupIndex) => (
          <SidebarGroup key={group.label || groupIndex} className={cn("mt-2", groupIndex === 0 && "mt-0")}>
            {group.label && !collapsed && (
              <SidebarGroupLabel className="px-4 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b0b7ce]">
                {group.label}
              </SidebarGroupLabel>
            )}

            {group.label && collapsed && <Separator className="mx-2 my-3 bg-[#eef1f7]" />}

            <SidebarGroupContent>
              <SidebarMenu className="space-y-1.5">
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      tooltip={collapsed ? item.title : undefined}
                      className={cn(
                        "h-[46px] w-full justify-start gap-3 rounded-2xl px-4 text-[15px] transition-all",
                        isActive(item.url)
                          ? "bg-[#efebff] font-semibold text-[#5442d3]"
                          : "text-[#96a0be] hover:bg-[#f6f7fc] hover:text-[#5d6788]",
                        collapsed && "h-[48px] justify-center px-0",
                      )}
                    >
                      <Link to={item.url}>
                        <item.icon className={cn("h-5 w-5 shrink-0", collapsed && "h-[18px] w-[18px]")} />
                        {!collapsed && <span className="truncate">{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="px-3 pb-6">
        <Separator className="mb-4 bg-[#eef1f7]" />
        <SidebarMenu className="space-y-1.5">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive("/settings")}
              tooltip={collapsed ? "Parametres compte" : undefined}
              className={cn(
                "h-[46px] w-full justify-start gap-3 rounded-2xl px-4 text-[15px] transition-all",
                isActive("/settings")
                  ? "bg-[#efebff] font-semibold text-[#5442d3]"
                  : "text-[#96a0be] hover:bg-[#f6f7fc] hover:text-[#5d6788]",
                collapsed && "h-[48px] justify-center px-0",
              )}
            >
              <Link to="/settings">
                <Settings className="h-5 w-5 shrink-0" />
                {!collapsed && <span>Parametres compte</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip={collapsed ? "Deconnexion" : undefined}
              className={cn(
                "h-[46px] w-full justify-start gap-3 rounded-2xl px-4 text-[15px] text-[#96a0be] transition-all hover:bg-[#fff1f0] hover:text-[#ff5b4a]",
                collapsed && "h-[48px] justify-center px-0",
              )}
            >
              <Link to="/login">
                <LogOut className="h-5 w-5 shrink-0" />
                {!collapsed && <span>Deconnexion</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
