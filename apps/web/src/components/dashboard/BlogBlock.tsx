import { Link } from "react-router-dom";
import { Newspaper, Check, Edit, X, ArrowRight, Timer, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Publication } from "@/hooks/usePublications";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { AutoValidationInfo } from "@/components/validation/AutoValidationCountdown";
import { cn } from "@/lib/utils";

interface BlogBlockProps {
  publications: Publication[];
  loading: boolean;
  getAutoValidationInfo?: (createdAt: string, scheduledDate: string, scheduledTime: string) => AutoValidationInfo | null;
  onValidate?: (id: string) => void;
  onReject?: (id: string) => void;
}

export function BlogBlock({ 
  publications, 
  loading, 
  getAutoValidationInfo,
  onValidate,
  onReject,
}: BlogBlockProps) {
  // Filter only blog articles pending validation
  const pendingBlogArticles = publications
    .filter((p) => p.platform === "blog" && p.status === "a_valider")
    .slice(0, 3);

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
    <Card className="bg-card border border-l-4 border-l-primary transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-lg font-semibold">
            <div className="p-2 rounded-xl bg-primary/10">
              <Newspaper className="h-4 w-4 text-primary" />
            </div>
            <span>Articles Blog</span>
            {pendingBlogArticles.length > 0 && (
              <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
                {pendingBlogArticles.length}
              </Badge>
            )}
          </CardTitle>
          <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
            <Link to="/blog">
              Voir tout
              <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : pendingBlogArticles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Check className="h-6 w-6 text-primary" />
            </div>
            <p className="font-medium text-foreground">Aucun article en attente</p>
            <p className="text-sm mt-1">Tous vos articles sont validés ou programmés</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingBlogArticles.map((article) => {
              const autoValidationInfo = getAutoValidationInfo 
                ? getAutoValidationInfo(article.created_at, article.scheduled_date, article.scheduled_time) 
                : null;
              const autoValidation = formatAutoValidation(autoValidationInfo);

              return (
                <div
                  key={article.id}
                  className="p-4 rounded-xl border bg-card hover:bg-muted/30 transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    {/* Thumbnail */}
                    {article.image_url && (
                      <img 
                        src={article.image_url} 
                        alt="" 
                        className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-0">
                          <Newspaper className="h-3 w-3 mr-1" />
                          Blog
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(parseISO(article.scheduled_date), "d MMM", { locale: fr })} à {article.scheduled_time.slice(0, 5)}
                        </span>
                        {/* Chrono inline */}
                        {autoValidation && (
                          <>
                            <span className="text-muted-foreground/30">•</span>
                            <span className={cn(
                              "inline-flex items-center gap-1 text-xs font-medium",
                              autoValidation.blocked
                                ? "text-amber-600 dark:text-amber-400"
                                : autoValidation.urgent 
                                  ? "text-red-600 dark:text-red-400"
                                  : "text-muted-foreground"
                            )}>
                              <autoValidation.icon className="h-3 w-3" />
                              <span>{autoValidation.blocked ? "off" : autoValidation.label}</span>
                            </span>
                          </>
                        )}
                      </div>
                      {/* Title if available */}
                      {article.title && (
                        <p className="text-sm font-medium line-clamp-1 mb-1">{article.title}</p>
                      )}
                      <p className="text-xs text-muted-foreground line-clamp-1">{article.content}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg"
                        onClick={() => onValidate?.(article.id)}
                        title="Valider"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 rounded-lg"
                        asChild
                        title="Modifier"
                      >
                        <Link to={`/blog?edit=${article.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 text-muted-foreground hover:text-destructive rounded-lg"
                        onClick={() => onReject?.(article.id)}
                        title="Rejeter"
                      >
                        <X className="h-4 w-4" />
                      </Button>
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
