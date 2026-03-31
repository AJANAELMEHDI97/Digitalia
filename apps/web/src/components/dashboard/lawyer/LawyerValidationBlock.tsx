import { Link, useNavigate } from "react-router-dom";
import { Clock, AlertCircle, ChevronRight, ShieldCheck, Linkedin, Globe, Instagram, Facebook, FileText, Check, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Publication } from "@/hooks/usePublications";
import { useValidationSLA } from "@/hooks/useValidationSLA";
import { AutoValidationInfo } from "@/hooks/useAutoValidation";
import { toast } from "@/hooks/use-toast";

// Urgency dot indicator matching carousel style
function UrgencyDot({ urgency }: { urgency: "critical" | "warning" | "normal" }) {
  if (urgency === 'normal') return null;
  
  return (
    <span 
      className={cn(
        "inline-block h-2 w-2 rounded-full flex-shrink-0",
        urgency === "critical" ? "bg-destructive" : "bg-orange-500"
      )}
    />
  );
}

interface LawyerValidationBlockProps {
  publications: Publication[];
  loading?: boolean;
  getAutoValidationInfo?: (createdAt: string, scheduledDate: string, scheduledTime: string) => AutoValidationInfo | null;
}

// Platform icon mapping with size option
const getPlatformIcon = (platform: string | null, size: 'sm' | 'lg' = 'sm') => {
  const sizeClass = size === 'lg' ? 'h-8 w-8' : 'h-4 w-4';
  switch (platform?.toLowerCase()) {
    case 'linkedin':
      return <Linkedin className={cn(sizeClass, "text-[#0A66C2]")} />;
    case 'instagram':
      return <Instagram className={cn(sizeClass, "text-[#E4405F]")} />;
    case 'facebook':
      return <Facebook className={cn(sizeClass, "text-[#1877F2]")} />;
    case 'google':
      return <Globe className={cn(sizeClass, "text-[#4285F4]")} />;
    default:
      return <Globe className={cn(sizeClass, "text-muted-foreground")} />;
  }
};

// Truncate text to a maximum length
const truncateText = (text: string, maxLength: number = 45) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '…';
};

export function LawyerValidationBlock({ 
  publications, 
  loading,
  getAutoValidationInfo 
}: LawyerValidationBlockProps) {
  const navigate = useNavigate();
  const { validatePublication } = useValidationSLA();
  const pendingPublications = publications.filter(p => p.status === 'a_valider');
  const pendingCount = pendingPublications.length;

  const handleValidate = async (e: React.MouseEvent, pubId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const success = await validatePublication(pubId);
    if (success) {
      toast({
        title: "Publication validée",
        description: "La publication a été programmée pour diffusion.",
      });
    }
  };

  const handleEdit = (e: React.MouseEvent, pubId: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/editor/${pubId}`);
  };

  // Get publications with their urgency info, sorted by deadline
  const getUrgentPublications = () => {
    if (!getAutoValidationInfo || pendingPublications.length === 0) return [];
    
    const withInfo = pendingPublications
      .map(pub => {
        const info = getAutoValidationInfo(pub.created_at, pub.scheduled_date, pub.scheduled_time);
        const totalMinutes = info ? (info.hours * 60 + info.minutes) : Infinity;
        return { pub, info, totalMinutes };
      })
      .filter(item => item.info && !item.info.isBlocked)
      .sort((a, b) => a.totalMinutes - b.totalMinutes);
    
    // Return top 3 most urgent
    return withInfo.slice(0, 3);
  };

  const urgentPubs = getUrgentPublications();

  // Get the soonest auto-validation deadline
  const getSoonestDeadline = () => {
    if (urgentPubs.length === 0) return null;
    return { hours: urgentPubs[0].info!.hours, minutes: urgentPubs[0].info!.minutes };
  };

  const soonestDeadline = getSoonestDeadline();

  // Format remaining time for display
  const formatRemainingTime = (hours: number, minutes: number) => {
    if (hours < 24) {
      return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''} restantes`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (days === 1) {
      return remainingHours > 0 ? `1j ${remainingHours}h restantes` : '1 jour restant';
    }
    return `${days}j restants`;
  };

  // Determine urgency level for styling
  const getUrgencyLevel = (hours: number): 'critical' | 'warning' | 'normal' => {
    if (hours <= 12) return 'critical';
    if (hours <= 24) return 'warning';
    return 'normal';
  };

  if (loading) {
    return (
      <Card className="border-amber-200/60 bg-amber-50/30 dark:border-amber-800/40 dark:bg-amber-950/20">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (pendingCount === 0) {
    return (
      <Card className="border-emerald-200/60 bg-emerald-50/30 dark:border-emerald-800/40 dark:bg-emerald-950/20">
        <CardContent className="py-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50">
              <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="font-medium text-emerald-700 dark:text-emerald-300">
                Aucune publication en attente
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Toutes vos communications ont été validées.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "border-amber-200/60 bg-gradient-to-r from-amber-50/50 to-orange-50/30",
      "dark:border-amber-800/40 dark:from-amber-950/30 dark:to-orange-950/20"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            Publications en attente de validation
          </CardTitle>
          <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
            {pendingCount} en attente
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary info */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {soonestDeadline ? (
              <span>
                Prochaine échéance : {soonestDeadline.hours}h{soonestDeadline.minutes > 0 ? ` ${soonestDeadline.minutes}min` : ''}
              </span>
            ) : (
              <span>Délai de validation actif</span>
            )}
          </div>
        </div>

        {/* Urgent Publications Cards */}
        {urgentPubs.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Validations prioritaires
            </p>
            <TooltipProvider delayDuration={300}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {urgentPubs.map(({ pub, info }) => {
                  const urgencyLevel = getUrgencyLevel(info!.hours);
                  
                  return (
                    <Tooltip key={pub.id}>
                      <TooltipTrigger asChild>
                        <Link
                          to={`/validation?highlight=${pub.id}`}
                          className={cn(
                            "group block overflow-hidden rounded-lg",
                            "bg-card hover:bg-muted/30",
                            "border border-border/60 hover:border-primary/30",
                            "shadow-sm hover:shadow-md",
                            "transition-all duration-200 ease-out cursor-pointer",
                            urgencyLevel === 'critical' && "border-l-2 border-l-destructive",
                            urgencyLevel === 'warning' && "border-l-2 border-l-orange-500"
                          )}
                        >
                          <div className="p-4 space-y-3">
                            {/* Row 1: UrgencyDot + Platform + Time */}
                            <div className="flex items-center gap-2 text-xs">
                              <UrgencyDot urgency={urgencyLevel} />
                              {getPlatformIcon(pub.platform)}
                              <span className="font-semibold capitalize">{pub.platform}</span>
                              <span className="text-muted-foreground">•</span>
                              <span className={cn(
                                "font-medium",
                                urgencyLevel === 'critical' && "text-destructive",
                                urgencyLevel === 'warning' && "text-orange-500",
                                urgencyLevel === 'normal' && "text-muted-foreground"
                              )}>
                                {formatRemainingTime(info!.hours, info!.minutes)}
                              </span>
                            </div>
                            
                            {/* Row 2: Image + Content */}
                            <div className="flex gap-3">
                              <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted/50 flex items-center justify-center">
                                {pub.image_url ? (
                                  <img 
                                    src={pub.image_url} 
                                    alt="" 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <FileText className="h-7 w-7 text-muted-foreground/40" />
                                )}
                              </div>
                              <p className="text-sm leading-relaxed text-foreground/90 line-clamp-4 flex-1">
                                {pub.content}
                              </p>
                            </div>
                            
                            {/* Row 3: Action buttons */}
                            <div className="flex gap-2 pt-1">
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="flex-1 h-8 text-xs"
                                onClick={(e) => handleEdit(e, pub.id)}
                              >
                                <Pencil className="h-3.5 w-3.5 mr-1" />
                                Modifier
                              </Button>
                              <Button 
                                size="sm" 
                                className="flex-1 h-8 text-xs"
                                onClick={(e) => handleValidate(e, pub.id)}
                              >
                                <Check className="h-3.5 w-3.5 mr-1" />
                                Valider
                              </Button>
                            </div>
                          </div>
                        </Link>
                      </TooltipTrigger>
                      
                      {/* Tooltip with full content */}
                      <TooltipContent 
                        side="bottom" 
                        className="max-w-xs p-3"
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                          {pub.content}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </TooltipProvider>
          </div>
        )}

        {/* CTA */}
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link to="/validation">
            Voir et valider mes publications
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>

        {/* Helper text */}
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
            <span>
              Ces prises de parole nécessitent votre validation prioritaire.
              <br className="hidden sm:block" />
              <span className="sm:ml-0"> Aucune publication ne sera diffusée sans votre décision.</span>
            </span>
          </span>
        </p>
      </CardContent>
    </Card>
  );
}
