import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminCMStatus } from "@/hooks/useAdminOperational";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, CalendarClock, UserX, Building2 } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

const ACTION_LABELS: Record<string, string> = {
  creation_contenu: "Création de contenu",
  envoi_validation: "Envoi pour validation",
  planification: "Planification",
  create_publication: "Création de contenu",
  submit_publication: "Envoi pour validation",
  schedule_publication: "Planification",
  edit_publication: "Édition de contenu",
};

function getWorkloadBadge(count: number) {
  if (count <= 2) return { label: "Faible", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" };
  if (count <= 4) return { label: "Normale", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" };
  return { label: "Élevée", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" };
}

export function AdminCMStatusBlock() {
  const { data: cmList, isLoading } = useAdminCMStatus();

  // Fetch firm counts per CM
  const cmIds = (cmList || []).map(cm => cm.user_id);
  const { data: firmCounts } = useQuery({
    queryKey: ["admin-cm-firm-counts", cmIds],
    enabled: cmIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase
        .from("cm_assignments")
        .select("cm_user_id")
        .eq("is_active", true)
        .in("cm_user_id", cmIds);
      const counts: Record<string, number> = {};
      (data || []).forEach((a: { cm_user_id: string }) => {
        counts[a.cm_user_id] = (counts[a.cm_user_id] || 0) + 1;
      });
      return counts;
    },
    staleTime: 30_000,
  });

  const isEmpty = !isLoading && (!cmList || cmList.length === 0);

  return (
    <Card className={cn(isEmpty && "opacity-70")}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          Statut des Community Managers
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 max-h-[320px] overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
            <UserX className="h-7 w-7" />
            <p className="text-sm">Aucun Community Manager actif sur la plateforme</p>
          </div>
        ) : (
          cmList!.map(cm => {
            const firms = firmCounts?.[cm.user_id] || 0;
            const workload = getWorkloadBadge(firms);
            return (
              <div key={cm.user_id} className="border rounded-lg p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-3 w-3 rounded-full ${cm.is_online ? "bg-green-500" : "bg-muted-foreground/30"}`} />
                    <span className="font-semibold text-base text-foreground">{cm.full_name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge className={workload.className} variant="secondary">
                      {workload.label}
                    </Badge>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${cm.is_online ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-muted text-muted-foreground"}`}>
                      {cm.is_online ? "En ligne" : "Hors ligne"}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground space-y-0.5">
                  <div className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    <span>{firms} cabinet{firms > 1 ? "s" : ""} géré{firms > 1 ? "s" : ""}</span>
                  </div>

                  {cm.last_activity_at ? (
                    <>
                      <p>
                        Actif {formatDistanceToNow(new Date(cm.last_activity_at), { addSuffix: true, locale: fr })}
                      </p>
                      {cm.last_action_type && (
                        <p className="text-muted-foreground/80">
                          {ACTION_LABELS[cm.last_action_type] || cm.last_action_type}
                        </p>
                      )}
                    </>
                  ) : (
                    <p>Aucune activité récente</p>
                  )}

                  {cm.next_appointment_at && (
                    <p className="flex items-center gap-1 mt-1 text-primary/80">
                      <CalendarClock className="h-3 w-3" />
                      Prochain RDV : {format(new Date(cm.next_appointment_at), "dd/MM · HH:mm", { locale: fr })}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
