import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Star, 
  MessageSquare, 
  AlertTriangle, 
  ArrowRight, 
  Building2,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useGoogleBusiness } from '@/hooks/useGoogleBusiness';
import { useNavigate } from 'react-router-dom';

export function LawyerGoogleBusinessCard() {
  const { reviews, loading, useDemoData } = useGoogleBusiness();
  const navigate = useNavigate();

  // Calculate stats
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? reviews.reduce((sum, r) => sum + (r.star_rating || 0), 0) / totalReviews 
    : 0;
  const pendingReplies = reviews.filter(r => !r.review_reply).length;
  const responseRate = totalReviews > 0 
    ? Math.round(((totalReviews - pendingReplies) / totalReviews) * 100) 
    : 0;

  // Get negative reviews without response
  const negativeReviews = reviews.filter(
    r => (r.star_rating || 0) <= 2 && !r.review_reply
  ).slice(0, 2);

  // Get latest reviews for preview
  const latestReviews = reviews.slice(0, 3);

  const getTimeAgo = (dateStr: string | null): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `il y a ${diffDays}j`;
    if (diffDays < 30) return `il y a ${Math.floor(diffDays / 7)} sem.`;
    return `il y a ${Math.floor(diffDays / 30)} mois`;
  };

  const renderStars = (rating: number | null) => {
    const stars = [];
    const ratingValue = rating || 0;
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`h-3 w-3 ${i <= ratingValue ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} 
        />
      );
    }
    return <div className="flex gap-0.5">{stars}</div>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
          <Skeleton className="h-20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-base font-medium">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/20">
              <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            E-Réputation Google
          </CardTitle>
          {useDemoData && (
            <Badge variant="secondary" className="text-xs">
              Démo
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 flex-1 flex flex-col">
        {/* KPIs Row */}
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <div className="flex items-center justify-center gap-1 text-lg font-bold text-amber-500">
              <Star className="h-4 w-4 fill-amber-500" />
              {averageRating.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Note</p>
          </div>

          <div className="text-center p-2 rounded-lg bg-muted/50">
            <div className="text-lg font-bold">{totalReviews}</div>
            <p className="text-xs text-muted-foreground">Avis</p>
          </div>

          <div className="text-center p-2 rounded-lg bg-muted/50">
            <div className={`text-lg font-bold ${pendingReplies > 0 ? 'text-orange-500' : 'text-green-600'}`}>
              {pendingReplies}
            </div>
            <p className="text-xs text-muted-foreground">En attente</p>
          </div>

          <div className="text-center p-2 rounded-lg bg-muted/50">
            <div className={`text-lg font-bold ${responseRate >= 80 ? 'text-green-600' : 'text-orange-500'}`}>
              {responseRate}%
            </div>
            <p className="text-xs text-muted-foreground">Réponses</p>
          </div>
        </div>

        {/* Negative Reviews Alert */}
        {negativeReviews.length > 0 && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-center gap-2 text-sm font-medium text-destructive mb-2">
              <AlertTriangle className="h-4 w-4" />
              {negativeReviews.length} avis négatif{negativeReviews.length > 1 ? 's' : ''} sans réponse
            </div>
            <div className="space-y-2">
              {negativeReviews.map((review) => (
                <div 
                  key={review.id} 
                  className="flex items-center justify-between p-2 rounded bg-background/80 text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="font-medium truncate max-w-[80px]">
                      {review.reviewer_name?.split(' ')[0] || 'Anonyme'}
                    </span>
                    {renderStars(review.star_rating)}
                    <span className="text-muted-foreground truncate text-xs max-w-[100px]">
                      "{review.comment?.slice(0, 30)}..."
                    </span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 text-xs shrink-0"
                    onClick={() => navigate('/google-business')}
                  >
                    Répondre
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Latest Reviews Preview */}
        {latestReviews.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-3.5 w-3.5" />
              Derniers avis
            </h4>
            <div className="space-y-2">
              {latestReviews.map((review) => (
                <div 
                  key={review.id}
                  className="flex items-center justify-between p-2 rounded-lg border bg-card text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary shrink-0">
                      {review.reviewer_name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate text-xs">
                          {review.reviewer_name?.split(' ').slice(0, 2).join(' ') || 'Anonyme'}
                        </span>
                        {renderStars(review.star_rating)}
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {getTimeAgo(review.create_time)}
                      </p>
                    </div>
                  </div>
                  {review.review_reply ? (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 shrink-0">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Répondu
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200 shrink-0">
                      <Clock className="h-3 w-3 mr-1" />
                      En attente
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Spacer + Action Button */}
        <div className="flex-1" />
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={() => navigate('/google-business')}
        >
          Gérer ma fiche Google
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
