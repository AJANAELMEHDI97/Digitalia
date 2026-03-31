import { useLocation, Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  Building2,
  Calendar,
  PenSquare,
  FolderOpen,
  Image,
  BarChart3,
  ClipboardCheck,
  LogOut,
  ChevronLeft
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

const overviewItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
];

const firmsItems = [
  { title: "Mes Cabinets", url: "/cm/firms", icon: Building2 },
];

const editorialItems = [
  { title: "Calendrier éditorial", url: "/calendar", icon: Calendar },
  { title: "Créer un post", url: "/editor", icon: PenSquare },
  { title: "À valider", url: "/validation", icon: ClipboardCheck },
  { title: "Bibliothèque de contenus", url: "/cm/content", icon: FolderOpen },
  { title: "Médiathèque", url: "/media", icon: Image },
];

const analysisItems = [
  { title: "Performances", url: "/metrics", icon: BarChart3 },
];

interface NavGroup {
  label: string;
  items: typeof overviewItems;
}

const cmNavGroups: NavGroup[] = [
  { label: "", items: overviewItems },
  { label: "Cabinets", items: firmsItems },
  { label: "Éditorial", items: editorialItems },
  { label: "Analyse", items: analysisItems },
];

export function CMSidebar() {
  const location = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";

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
        {cmNavGroups.map((group, groupIndex) => (
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
                {group.items.map((item) => (
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
        ))}
      </SidebarContent>

      <SidebarFooter className="px-4 pb-5">
        <Separator className="mb-3 bg-[#eef0f8]" />
        <SidebarMenu>
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
