import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Clock, FileCheck, FileX, Upload, UserCheck, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface AuditEntry {
  id: string;
  action: string;
  created_at: string;
  user_id: string;
  entity_type?: string;
}

interface AdminActivityTimelineProps {
  activities: AuditEntry[];
  loading?: boolean;
  className?: string;
}

const actionConfig: Record<string, { icon: typeof Clock; color: string; label: string }> = {
  validated: { icon: FileCheck, color: "text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/40", label: "Validation" },
  refused: { icon: FileX, color: "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/40", label: "Refus" },
  published: { icon: Upload, color: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/40", label: "Publication" },
  created: { icon: Activity, color: "text-violet-600 bg-violet-100 dark:text-violet-400 dark:bg-violet-900/40", label: "Création" },
  login: { icon: UserCheck, color: "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/40", label: "Connexion" },
};

function getConfig(action: string) {
  const key = Object.keys(actionConfig).find(k => action.toLowerCase().includes(k));
  return actionConfig[key || "created"] || actionConfig.created;
}

export function AdminActivityTimeline({ activities, loading, className }: AdminActivityTimelineProps) {
  const displayItems = activities.length > 0 ? activities.slice(0, 5) : [
    { id: "demo-1", action: "Publication validée", created_at: new Date(Date.now() - 2 * 3600000).toISOString(), user_id: "", entity_type: "publication" },
    { id: "demo-2", action: "Nouveau contenu créé", created_at: new Date(Date.now() - 5 * 3600000).toISOString(), user_id: "", entity_type: "publication" },
    { id: "demo-3", action: "CM connecté", created_at: new Date(Date.now() - 8 * 3600000).toISOString(), user_id: "", entity_type: "cm" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.3 }}
      className={className}
    >
      <Card>
        <CardHeader className="pb-3 pt-4 px-5">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Activité récente</h3>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-0">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3.5 w-3/4 rounded" />
                    <Skeleton className="h-3 w-1/3 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-4 top-4 bottom-4 w-px bg-border" />

              <div className="space-y-4">
                {displayItems.map((item, i) => {
                  const config = getConfig(item.action);
                  const Icon = config.icon;
                  return (
                    <div key={item.id} className="flex items-start gap-3 relative">
                      <div className={cn("p-1.5 rounded-lg shrink-0 relative z-10", config.color)}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-sm text-foreground truncate">{item.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: fr })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
