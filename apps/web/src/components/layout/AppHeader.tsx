import { Search, Bell, Menu, CheckCheck, Trash2, ChevronDown, Scale, Shield, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSidebar } from "@/components/ui/sidebar";
import { Link, useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/hooks/useAuth";
import { useSimpleRole } from "@/hooks/useSimpleRole";
import { RoleSwitcher } from "@/components/admin/RoleSwitcherRef";

import { SimulationBanner } from "./SimulationBanner";
import { LatePublicationsBadge } from "./LatePublicationsBadge";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

const ROLE_META = {
  admin: {
    label: "Super Admin",
    icon: Shield,
    iconClassName: "text-[#9158f7]",
    className:
      "border border-[#e7e1fb] bg-[#faf8ff] text-[#1f2840] shadow-[0_1px_0_rgba(161,135,246,0.08)]",
  },
  community_manager: {
    label: "Community Manager",
    icon: Users,
    iconClassName: "text-[#3b82f6]",
    className:
      "border border-[#f4d594] bg-[#fffaf0] text-[#1f2840] shadow-[0_1px_0_rgba(245,198,100,0.12)]",
  },
  lawyer: {
    label: "Avocat",
    icon: Scale,
    iconClassName: "text-[#12b981]",
    className:
      "border border-[#f4d594] bg-[#fffaf0] text-[#1f2840] shadow-[0_1px_0_rgba(245,198,100,0.12)]",
  },
} as const;

function CurrentRolePill({ role }: { role: "admin" | "community_manager" | "lawyer" }) {
  const meta = ROLE_META[role];
  const Icon = meta.icon;

  return (
    <div
      className={cn(
        "hidden h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold md:flex",
        meta.className,
      )}
    >
      <Icon className={cn("h-4 w-4", meta.iconClassName)} />
      <span className="whitespace-nowrap">{meta.label}</span>
    </div>
  );
}

export function AppHeader() {
  const { toggleSidebar, state } = useSidebar();
  const { displayName, initials, profile } = useProfile();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const { signOut } = useAuth();
  const { realRole, effectiveRole } = useSimpleRole();
  const navigate = useNavigate();
  const canUseRoleSwitcher = realRole === "admin";
  const showSimulationBanner = canUseRoleSwitcher && effectiveRole !== realRole;
  const showLateBadge = effectiveRole === "lawyer";
  const showStaticRolePill = !canUseRoleSwitcher && !!effectiveRole;

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 flex h-[84px] w-full items-center justify-between overflow-hidden border-b border-[#ececf6] bg-white/95 px-5 backdrop-blur-sm md:px-8">
      <div className="flex min-w-0 flex-shrink items-center gap-4">
        {state === "collapsed" && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-10 w-10 flex-shrink-0 rounded-full text-[#8f96b2] hover:bg-[#f3f4fb]"
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}
        <div className="relative w-[280px] max-w-md min-w-0 flex-shrink md:w-[410px]">
          <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9aa1b8]" />
          <Input
            placeholder="Rechercher..."
            className="h-12 rounded-[18px] border-0 bg-[#f4f5fc] pl-14 text-[15px] text-[#66708c] shadow-none focus-visible:ring-2 focus-visible:ring-[#d7daf3]"
          />
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center gap-3">
        {showLateBadge && <LatePublicationsBadge />}
        {showSimulationBanner && <SimulationBanner />}
        {showStaticRolePill && <CurrentRolePill role={effectiveRole} />}
        {canUseRoleSwitcher && (
          <div className="hidden md:block">
            <RoleSwitcher />
          </div>
        )}
        
        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10 rounded-full text-[#7f87a7] hover:bg-[#f4f5fc] hover:text-[#4a5373]"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-[6px] top-[6px] flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[9px] font-medium text-primary-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between p-3 border-b">
              <h4 className="font-medium text-sm">Notifications</h4>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => markAllAsRead()}
                >
                  <CheckCheck className="h-3 w-3 mr-1" />
                  Tout marquer lu
                </Button>
              )}
            </div>
            <ScrollArea className="h-72">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bell className="h-6 w-6 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Aucune notification
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.slice(0, 10).map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-3 hover:bg-muted/50 transition-colors cursor-pointer",
                        !notification.is_read && "bg-primary/3"
                      )}
                      onClick={() => {
                        if (!notification.is_read) markAsRead(notification.id);
                        if (notification.action_url) navigate(notification.action_url);
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            {!notification.is_read && (
                              <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                            )}
                            <p className="text-sm font-medium truncate">
                              {notification.title}
                            </p>
                          </div>
                          {notification.message && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                              {notification.message}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground/70 mt-1">
                            {formatDistanceToNow(new Date(notification.created_at), {
                              addSuffix: true,
                              locale: fr,
                            })}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex h-11 items-center gap-3 rounded-full px-3 hover:bg-[#f4f5fc]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white shadow-sm">
                {initials}
              </div>
              <div className="hidden flex-col items-start md:flex">
                <span className="text-sm font-semibold leading-none text-[#20263a]">{displayName}</span>
              </div>
              <ChevronDown className="hidden h-4 w-4 text-[#8f96b2] md:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
                {effectiveRole === "admin"
                  ? "Super Admin"
                  : effectiveRole === "community_manager"
                    ? "Community Manager"
                    : "Avocat"}
              </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile">Profil</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings">Paramètres</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/pricing">Abonnement</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive cursor-pointer"
              onClick={handleSignOut}
            >
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
