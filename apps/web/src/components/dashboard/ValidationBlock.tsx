import { Link } from "react-router-dom";
import { Clock, Check, Edit, X, ArrowRight, ShieldAlert, Timer, FileCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlatformBadge } from "@/components/ui/platform-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Publication } from "@/hooks/usePublications";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { AutoValidationInfo } from "@/components/validation/AutoValidationCountdown";
import { cn } from "@/lib/utils";

interface ValidationBlockProps {
  publications: Publication[];
  loading: boolean;
  getAutoValidationInfo?: (createdAt: string, scheduledDate: string, scheduledTime: string) => AutoValidationInfo | null;
  onValidate?: (id: string) => void;
  onReject?: (id: string) => void;
}

export function ValidationBlock({ 
  publications, 
  loading, 
  getAutoValidationInfo,
  onValidate,
  onReject,
}: ValidationBlockProps) {
  const pendingPublications = publications
    .filter((p) => p.status === "a_valider")
    .slice(0, 4);

  // Helper to format time - ultra compact
  const formatAutoValidation = (info: AutoValidationInfo | null) => {
    if (!info) return null;
    
    if (info.isBlocked) {
      return { label: "off", icon: ShieldAlert, urgent: true, blocked: true };
    }
    
    const { hours, minutes } = info;
    if (hours === 0 && minutes === 0) {
      return { label: "0m", icon: Timer, urgent: true, blocked: false };
    }
    
    let label = "";
    if (hours > 0 && minutes > 0) {
      label = `${hours}h${minutes < 10 ? '0' : ''}${minutes}`;
    } else if (hours > 0) {
      label = `${hours}h`;
    } else {
      label = `${minutes}m`;
    }
    
    return { 
      label, 
      icon: Timer, 
      urgent: hours < 4,
      blocked: false 
    };
  };

  return (
    <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-white/20 dark:border-white/10 transition-all duration-200 hover:shadow-md group h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-2 pt-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-500/5">
              <FileCheck className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            <CardTitle className="text-sm font-semibold text-foreground">Communications en attente</CardTitle>
            {pendingPublications.length > 0 && (
              <Badge className="bg-amber-500/90 hover:bg-amber-600 text-white text-[10px] px-1.5 py-0 h-4">
                {pendingPublications.length}
              </Badge>
            )}
          </div>
          <Button asChild variant="ghost" size="sm" className="text-[10px] text-muted-foreground hover:text-foreground h-6 px-2">
            <Link to="/validation">
              Voir tout
              <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-3 px-4 flex-1 flex flex-col">
        <p className="text-[10px] text-muted-foreground mb-3">Publications à valider avant mise en ligne</p>
        
        {loading ? (
          <div className="space-y-2 flex-1">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : pendingPublications.length === 0 ? (
          <div className="text-center py-6 flex-1 flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
              <Check className="h-5 w-5 text-emerald-500" />
            </div>
            <p className="font-medium text-sm text-foreground">Tout est à jour !</p>
            <p className="text-[10px] text-muted-foreground mt-1">Aucune publication en attente</p>
          </div>
        ) : (
          <div className="relative pl-4 space-y-2 flex-1">
            {/* Timeline line */}
            <div className="absolute left-[5px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-amber-500/60 via-amber-500/30 to-transparent rounded-full" />
            
            {pendingPublications.map((pub, index) => {
              const autoValidationInfo = getAutoValidationInfo 
                ? getAutoValidationInfo(pub.created_at, pub.scheduled_date, pub.scheduled_time) 
                : null;
              const autoValidation = formatAutoValidation(autoValidationInfo);

              return (
                <div
                  key={pub.id}
                  className="relative flex items-start gap-3"
                >
                  {/* Timeline node */}
                  <div className={cn(
                    "absolute -left-4 top-3 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 shadow-sm flex items-center justify-center",
                    index === 0 ? "bg-amber-500 animate-pulse" : "bg-amber-500/60"
                  )}>
                    <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
                  </div>
                  
                  {/* Content card */}
                  <div className="flex-1 p-2.5 rounded-lg bg-gradient-to-br from-white/60 to-white/30 dark:from-slate-800/60 dark:to-slate-800/30 border border-white/40 dark:border-white/10 shadow-sm">
                    <div className="flex items-start gap-2">
                      {/* Thumbnail */}
                      {pub.image_url && (
                        <img 
                          src={pub.image_url} 
                          alt="" 
                          className="w-10 h-10 rounded-md object-cover flex-shrink-0"
                        />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          {pub.platform && <PlatformBadge platform={pub.platform} />}
                          <span className="text-[10px] text-muted-foreground">
                            {format(parseISO(pub.scheduled_date), "d MMM", { locale: fr })} à {pub.scheduled_time.slice(0, 5)}
                          </span>
                          {/* Chrono inline */}
                          {autoValidation && (
                            <>
                              <span className="text-muted-foreground/30">•</span>
                              <span className={cn(
                                "inline-flex items-center gap-0.5 text-[10px] font-medium",
                                autoValidation.blocked
                                  ? "text-amber-600 dark:text-amber-400"
                                  : autoValidation.urgent 
                                    ? "text-red-600 dark:text-red-400"
                                    : "text-muted-foreground"
                              )}>
                                <autoValidation.icon className="h-2.5 w-2.5" />
                                <span>{autoValidation.blocked ? "off" : autoValidation.label}</span>
                              </span>
                            </>
                          )}
                        </div>
                        <p className="text-[11px] line-clamp-2 text-foreground/80 leading-relaxed">{pub.content}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-emerald-600 hover:bg-emerald-500/10 rounded-md"
                          onClick={() => onValidate?.(pub.id)}
                          title="Valider"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 rounded-md"
                          asChild
                          title="Modifier"
                        >
                          <Link to="/editor">
                            <Edit className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md"
                          onClick={() => onReject?.(pub.id)}
                          title="Rejeter"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
