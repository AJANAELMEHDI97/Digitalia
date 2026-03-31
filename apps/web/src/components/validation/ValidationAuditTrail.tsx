import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { History, User, Check, X, Edit, Send, AlertCircle, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useValidationSLA, type AuditEntry } from "@/hooks/useValidationSLA";
import { cn } from "@/lib/utils";

interface ValidationAuditTrailProps {
  publicationId: string;
  className?: string;
}

const ACTION_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  submitted_for_validation: { icon: Send, color: "text-blue-500", label: "Soumis à validation" },
  validated: { icon: Check, color: "text-emerald-500", label: "Validé" },
  refused: { icon: X, color: "text-destructive", label: "Refusé" },
  modification_requested: { icon: Edit, color: "text-amber-500", label: "Modification demandée" },
  expired: { icon: AlertCircle, color: "text-gray-500", label: "Expiré" },
  resubmitted: { icon: Send, color: "text-primary", label: "Re-soumis" },
};

export function ValidationAuditTrail({ publicationId, className }: ValidationAuditTrailProps) {
  const { fetchAuditTrail, VALIDATION_STATUS_LABELS } = useValidationSLA();
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAuditTrail = async () => {
      setLoading(true);
      const data = await fetchAuditTrail(publicationId);
      setEntries(data);
      setLoading(false);
    };
    loadAuditTrail();
  }, [publicationId, fetchAuditTrail]);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="py-3">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            Historique
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucune action enregistrée
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" />
          Historique ({entries.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px] px-4 pb-4">
          <div className="relative pl-4">
            {/* Timeline line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-border" />

            <div className="space-y-4">
              {entries.map((entry, index) => {
                const config = ACTION_CONFIG[entry.action] || {
                  icon: FileText,
                  color: "text-muted-foreground",
                  label: entry.action,
                };
                const Icon = config.icon;

                return (
                  <div key={entry.id} className="relative flex gap-3">
                    {/* Timeline node */}
                    <div
                      className={cn(
                        "absolute -left-4 top-1 w-4 h-4 rounded-full border-2 border-background flex items-center justify-center",
                        index === 0 ? "bg-primary" : "bg-muted"
                      )}
                    >
                      <div className="w-2 h-2 rounded-full bg-background" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pl-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={cn("h-4 w-4", config.color)} />
                        <span className="font-medium text-sm">{config.label}</span>
                        {entry.new_status && (
                          <Badge variant="outline" className="text-xs">
                            {VALIDATION_STATUS_LABELS[entry.new_status as keyof typeof VALIDATION_STATUS_LABELS] || entry.new_status}
                          </Badge>
                        )}
                      </div>
                      {entry.comment && (
                        <p className="text-sm text-muted-foreground bg-muted/50 rounded-md p-2 mb-1">
                          "{entry.comment}"
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {format(new Date(entry.created_at), "d MMM yyyy à HH:mm", { locale: fr })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default ValidationAuditTrail;