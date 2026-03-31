import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, XCircle, ChevronRight, FileCheck, Timer, ShieldAlert, Check, Edit } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AutoValidationInfo } from '@/hooks/useAutoValidation';
import { cn } from '@/lib/utils';

interface Publication {
  id: string;
  title: string | null;
  content: string;
  platform: string | null;
  scheduled_date: string;
  scheduled_time: string;
  created_at: string;
  source: string;
  image_url?: string | null;
}

interface ValidationWidgetProps {
  publications: Publication[];
  loading: boolean;
  getAutoValidationInfo?: (createdAt: string, scheduledDate: string, scheduledTime: string) => AutoValidationInfo | null;
  onValidate?: (id: string) => void;
  onReject?: (id: string) => void;
}

const ValidationWidget: React.FC<ValidationWidgetProps> = ({
  publications,
  loading,
  getAutoValidationInfo,
  onValidate,
  onReject,
}) => {
  const navigate = useNavigate();
  
  // Sort by scheduled date to get the most urgent first - show up to 5
  const sortedPublications = [...publications].sort((a, b) => 
    new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime()
  ).slice(0, 5);
  const pendingCount = publications.length;

  const formatAutoValidation = (info: AutoValidationInfo | null) => {
    if (!info) return null;
    if (info.isBlocked) {
      return { label: 'off', icon: ShieldAlert, urgent: true, blocked: true };
    }
    const { hours, minutes } = info;
    if (hours === 0 && minutes === 0) {
      return { label: '0m', icon: Timer, urgent: true, blocked: false };
    }
    let label = '';
    if (hours > 0 && minutes > 0) {
      label = `${hours}h${minutes < 10 ? '0' : ''}${minutes}`;
    } else if (hours > 0) {
      label = `${hours}h`;
    } else {
      label = `${minutes}m`;
    }
    return { label, icon: Timer, urgent: hours < 4, blocked: false };
  };

  const getPlatformInfo = (platform: string | null) => {
    switch (platform) {
      case 'linkedin': return { emoji: '💼', name: 'LinkedIn', color: 'text-blue-600' };
      case 'instagram': return { emoji: '📸', name: 'Instagram', color: 'text-pink-500' };
      case 'facebook': return { emoji: '👥', name: 'Facebook', color: 'text-blue-500' };
      case 'twitter': return { emoji: '𝕏', name: 'X', color: 'text-foreground' };
      case 'google_business': return { emoji: '📍', name: 'Google', color: 'text-emerald-500' };
      default: return { emoji: '📱', name: 'Social', color: 'text-muted-foreground' };
    }
  };

  if (loading) {
    return (
      <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-white/20 dark:border-white/10">
        <CardHeader className="pb-2 pt-3 px-4 flex-shrink-0">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-2 px-4 pb-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-white/20 dark:border-white/10 transition-all duration-200 hover:shadow-md group overflow-hidden">
      <CardHeader className="pb-2 pt-3 px-4 flex-shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-500/5">
              <FileCheck className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            <CardTitle className="text-sm font-semibold text-foreground">Communications en attente</CardTitle>
            {pendingCount > 0 && (
              <Badge className="bg-amber-500/90 hover:bg-amber-600 text-white text-[10px] px-1.5 py-0 h-4">
                {pendingCount}
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground pl-8">
            À valider avant diffusion
          </p>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-2 px-4">
        {pendingCount === 0 ? (
          <div className="text-center py-4 flex flex-col items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="font-medium text-xs text-foreground">Tout est à jour !</p>
          </div>
        ) : (
          <div className="relative pl-4 space-y-1.5">
            {/* Timeline line */}
            <div className="absolute left-[5px] top-1.5 bottom-1.5 w-[2px] bg-gradient-to-b from-amber-500/60 via-amber-500/30 to-transparent rounded-full" />
            
            {sortedPublications.map((pub, index) => {
              const autoInfo = getAutoValidationInfo?.(pub.created_at, pub.scheduled_date, pub.scheduled_time);
              const autoValidation = formatAutoValidation(autoInfo);
              const platformInfo = getPlatformInfo(pub.platform);

              return (
                <div key={pub.id} className="relative flex items-center gap-2">
                  {/* Timeline node */}
                  <div className={cn(
                    "absolute -left-4 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-800 shadow-sm",
                    index === 0 ? "bg-amber-500" : "bg-amber-500/60"
                  )} />
                  
                  {/* Content row */}
                  <div className="flex-1 flex items-center gap-2 p-1.5 rounded-md bg-gradient-to-br from-white/60 to-white/30 dark:from-slate-800/60 dark:to-slate-800/30 border border-white/40 dark:border-white/10">
                    <span className="text-xs flex-shrink-0">{platformInfo.emoji}</span>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">
                      {format(new Date(pub.scheduled_date), 'dd MMM', { locale: fr })}
                    </span>
                    {autoValidation && (
                      <span className={cn(
                        "inline-flex items-center gap-0.5 text-[9px] font-medium flex-shrink-0",
                        autoValidation.blocked ? "text-amber-600" : autoValidation.urgent ? "text-red-600" : "text-muted-foreground"
                      )}>
                        <autoValidation.icon className="h-2 w-2" />
                        {autoValidation.label}
                      </span>
                    )}
                    <p className="text-[10px] line-clamp-1 text-foreground/80 flex-1 min-w-0">
                      {pub.content.slice(0, 50)}...
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-5 w-5 text-emerald-600 hover:bg-emerald-500/10 rounded"
                        onClick={() => onValidate?.(pub.id)}
                        title="Valider"
                      >
                        <Check className="h-2.5 w-2.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-5 w-5 text-muted-foreground hover:text-destructive rounded"
                        onClick={() => onReject?.(pub.id)}
                        title="Rejeter"
                      >
                        <XCircle className="h-2.5 w-2.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            
          </div>
        )}
        
        {/* Footer - Voir tout */}
        <div className="mt-2 pt-2 border-t border-border/30 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">En attente</span>
          <Link to="/validation" className="flex items-center gap-1.5 group/link">
            <span className="text-lg font-bold text-primary">{pendingCount}</span>
            <span className="text-[10px] text-muted-foreground group-hover/link:text-foreground transition-colors">Voir tout</span>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover/link:text-foreground transition-colors" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default ValidationWidget;
