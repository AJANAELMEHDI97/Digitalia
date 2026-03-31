import { Link } from "react-router-dom";
import { Bell, AlertTriangle, ChevronRight, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface LawyerAlertsCardProps {
  limit?: number;
}

export function LawyerAlertsCard({ limit = 3 }: LawyerAlertsCardProps) {
  const { notifications, unreadCount, loading, markAsRead } = useNotifications();
  
  // Get the most recent unread notifications
  const recentAlerts = notifications
    .filter(n => !n.is_read)
    .slice(0, limit);

  // Don't show the card if there are no unread notifications
  if (!loading && recentAlerts.length === 0) {
    return null;
  }

  const getAlertIcon = (type: string) => {
    if (type.includes('critical') || type.includes('late') || type.includes('refused')) {
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    }
    return <Bell className="h-4 w-4 text-amber-500" />;
  };

  const getAlertStyle = (type: string) => {
    if (type.includes('critical') || type.includes('late') || type.includes('refused')) {
      return "border-[#ffe3dd] bg-[#fff4ef] shadow-[inset_4px_0_0_0_#ff5a53]";
    }
    return "border-[#ffe7d0] bg-[#fff8ef] shadow-[inset_4px_0_0_0_#f7a623]";
  };

  const handleAlertClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
  };

  return (
    <Card className="h-full rounded-[30px] border border-[#f3cf6a] bg-[linear-gradient(135deg,#fff9eb_0%,#fffdf7_100%)] shadow-[0_10px_30px_rgba(223,181,76,0.06)]">
      <CardContent className="p-5">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff1c8]">
              <Bell className="h-5 w-5 text-[#f08a1c]" />
            </div>
            <span className="text-[18px] font-semibold text-[#2b3042]">Alertes</span>
            {unreadCount > 0 && (
              <Badge className="rounded-full border-0 bg-[#ffe7e5] px-3 py-1 text-sm font-semibold text-[#ff6f66] shadow-none">
                {unreadCount}
              </Badge>
            )}
          </div>
          <Button asChild variant="ghost" size="sm" className="h-9 rounded-full px-3 text-sm font-semibold text-[#9aa1b8] hover:bg-white/70 hover:text-[#6f7894]">
            <Link to="/validation">
              Tout voir
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Alerts list */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-4 text-muted-foreground text-sm">
              Chargement...
            </div>
          ) : (
            recentAlerts.map((alert) => (
              <Link
                key={alert.id}
                to={alert.action_url || "/validation"}
                onClick={() => handleAlertClick(alert)}
                className={`block rounded-[22px] border p-4 transition-all hover:shadow-sm ${getAlertStyle(alert.type)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="line-clamp-1 text-[15px] font-semibold text-[#2f3446]">
                      {alert.title}
                    </p>
                    {alert.message && (
                      <p className="mt-1 line-clamp-1 text-sm text-[#a0a7c1]">
                        {alert.message}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-1 text-sm text-[#a0a7c1]">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(alert.created_at), { 
                        addSuffix: true, 
                        locale: fr 
                      })}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
