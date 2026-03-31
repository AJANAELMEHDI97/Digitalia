import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminAppointments, useAdminCMStatus } from "@/hooks/useAdminOperational";
import { CalendarClock, CalendarX, Users, AlertTriangle, Building2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<string, string> = {
  onboarding: "Onboarding",
  suivi_editorial: "Suivi éditorial",
  point_mensuel: "Point mensuel",
  autre: "Autre",
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  upcoming: { label: "À venir", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  completed: { label: "Effectué", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  cancelled: { label: "Annulé", className: "bg-muted text-muted-foreground" },
  missed: { label: "Manqué", className: "bg-destructive/10 text-destructive" },
};

type FilterType = "today" | "week" | "all";

interface AdminAppointmentsBlockProps {
  firmsWithoutAppointment?: number;
}

export function AdminAppointmentsBlock({ firmsWithoutAppointment = 0 }: AdminAppointmentsBlockProps) {
  const [filter, setFilter] = useState<FilterType>("week");
  const [cmFilter, setCmFilter] = useState<string | null>(null);

  const { data, isLoading } = useAdminAppointments(filter, cmFilter);
  const { data: cmList } = useAdminCMStatus();

  const appointments = data?.appointments || [];
  const todayCount = data?.todayCount || 0;
  const weekCount = data?.weekCount || 0;
  const missedCount = data?.missedCount || 0;
  const isEmpty = !isLoading && appointments.length === 0;

  return (
    <Card className={cn(isEmpty && "opacity-70")}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-primary" />
          Rendez-vous programmés
        </CardTitle>

        <div className="flex gap-3 mt-2 flex-wrap">
          {isLoading ? (
            <Skeleton className="h-6 w-48" />
          ) : (
            <>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md font-medium">
                Aujourd'hui : {todayCount}
              </span>
              <span className="text-xs bg-secondary px-2 py-1 rounded-md font-medium text-secondary-foreground">
                Semaine : {weekCount}
              </span>
              {missedCount > 0 && (
                <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-md font-medium flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Manqués : {missedCount}
                </span>
              )}
              {firmsWithoutAppointment > 0 && (
                <span className="text-xs bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-md font-medium flex items-center gap-1">
                  <Building2 className="h-3 w-3" /> {firmsWithoutAppointment} cabinet{firmsWithoutAppointment > 1 ? "s" : ""} sans RDV
                </span>
              )}
            </>
          )}
        </div>

        <div className="flex gap-2 mt-2 flex-wrap">
          <div className="flex border rounded-md overflow-hidden text-xs">
            {(["today", "week", "all"] as FilterType[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              >
                {f === "today" ? "Aujourd'hui" : f === "week" ? "Semaine" : "Tous"}
              </button>
            ))}
          </div>
          <Select value={cmFilter || "all"} onValueChange={v => setCmFilter(v === "all" ? null : v)}>
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue placeholder="Tous les CM" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les CM</SelectItem>
              {(cmList || []).map(cm => (
                <SelectItem key={cm.user_id} value={cm.user_id}>{cm.full_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 max-h-[320px] overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
            <CalendarX className="h-7 w-7" />
            <p className="text-sm">Aucun rendez-vous prévu sur cette période</p>
          </div>
        ) : (
          appointments.map(appt => {
            const statusCfg = STATUS_CONFIG[appt.status] || STATUS_CONFIG.upcoming;
            return (
              <div key={appt.id} className="border rounded-lg p-4 flex flex-col gap-1.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">
                    {format(new Date(appt.scheduled_at), "EEE dd MMM · HH:mm", { locale: fr })}
                  </span>
                  <Badge className={statusCfg.className}>{statusCfg.label}</Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>{appt.cm_name}</span>
                  <span>→</span>
                  <span>{appt.lawyer_name}</span>
                  {appt.firm_name && <span className="text-muted-foreground/60">({appt.firm_name})</span>}
                </div>
                <Badge variant="outline" className="w-fit text-xs mt-0.5">
                  {TYPE_LABELS[appt.type] || appt.type}
                </Badge>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
