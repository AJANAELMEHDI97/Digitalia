import { AlertTriangle, CheckCircle2, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface Alert {
  type: "blocked" | "sla_breach" | "repeated_refusal";
  label: string;
  count: number;
  firmName?: string;
}

interface AdminAlertsFeedProps {
  alerts: Alert[];
  loading?: boolean;
}

const alertTypeConfig: Record<string, { color: string; badgeVariant: "destructive" | "outline"; url: string }> = {
  blocked: { color: "text-red-600 dark:text-red-400", badgeVariant: "destructive", url: "/validation" },
  sla_breach: { color: "text-amber-600 dark:text-amber-400", badgeVariant: "outline", url: "/validation" },
  repeated_refusal: { color: "text-amber-600 dark:text-amber-400", badgeVariant: "outline", url: "/admin/firms" },
};

export function AdminAlertsFeed({ alerts, loading }: AdminAlertsFeedProps) {
  const navigate = useNavigate();

  if (loading) return null;

  const hasAlerts = alerts.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.3 }}
    >
      <Card className={cn(
        "border transition-colors",
        hasAlerts
          ? "border-amber-200/60 bg-amber-50/30 dark:border-amber-800/30 dark:bg-amber-950/10"
          : "border-emerald-200/60 bg-emerald-50/30 dark:border-emerald-800/30 dark:bg-emerald-950/10"
      )}>
        <CardHeader className="pb-2 pt-4 px-5">
          <div className="flex items-center gap-2">
            {hasAlerts ? (
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            )}
            <h3 className="text-sm font-semibold text-foreground">
              {hasAlerts ? `${alerts.reduce((s, a) => s + a.count, 0)} alertes actives` : "Aucune alerte — plateforme saine"}
            </h3>
          </div>
        </CardHeader>
        {hasAlerts && (
          <CardContent className="px-5 pb-4 pt-1">
            <div className="space-y-2">
              {alerts.map((alert, i) => {
                const config = alertTypeConfig[alert.type] || alertTypeConfig.blocked;
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between py-1.5 cursor-pointer group"
                    onClick={() => navigate(config.url)}
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant={config.badgeVariant} className="text-[10px] px-1.5 py-0">
                        {alert.count}
                      </Badge>
                      <span className="text-sm text-foreground">{alert.label}</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
}
