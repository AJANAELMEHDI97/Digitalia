import { AlertTriangle, Star, Clock, ArrowRight, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import type { GoogleReview } from "@/hooks/useGoogleBusiness";

interface NegativeReviewsAlertProps {
  reviews: GoogleReview[];
  onRespondClick: (reviewId: string) => void;
}

export function NegativeReviewsAlert({ reviews, onRespondClick }: NegativeReviewsAlertProps) {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  
  // Filter negative reviews (1-2 stars) without replies
  const negativeReviews = reviews.filter(
    r => (r.star_rating === 1 || r.star_rating === 2) && 
         !r.review_reply &&
         !dismissedIds.includes(r.id)
  );

  const handleDismiss = (id: string) => {
    setDismissedIds([...dismissedIds, id]);
  };

  const handleDismissAll = () => {
    setDismissedIds([...dismissedIds, ...negativeReviews.map(r => r.id)]);
  };

  if (negativeReviews.length === 0) {
    return null;
  }

  const renderStars = (rating: number | null) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= (rating || 0) 
                ? 'fill-red-500 text-red-500' 
                : 'text-muted-foreground/30'
            }`}
          />
        ))}
      </div>
    );
  };

  const getTimeAgo = (dateStr: string | null) => {
    if (!dateStr) return '';
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: fr });
  };

  return (
    <Alert className="border-red-200 bg-red-50">
      <AlertTriangle className="h-5 w-5 text-red-600" />
      <AlertTitle className="text-red-800 flex items-center justify-between">
        <span className="flex items-center gap-2">
          {negativeReviews.length} avis négatif{negativeReviews.length > 1 ? 's' : ''} nécessite{negativeReviews.length > 1 ? 'nt' : ''} une réponse rapide
          <Badge variant="destructive" className="text-xs">
            Urgent
          </Badge>
        </span>
        {negativeReviews.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismissAll}
            className="text-red-600 hover:text-red-700 hover:bg-red-100 -mr-2"
          >
            Tout ignorer
          </Button>
        )}
      </AlertTitle>
      <AlertDescription className="mt-3">
        <div className="space-y-3">
          {negativeReviews.slice(0, 3).map((review) => (
            <div 
              key={review.id}
              className="flex items-start gap-3 bg-white/80 rounded-lg p-3 border border-red-100"
            >
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={review.reviewer_photo_url || undefined} />
                <AvatarFallback className="bg-red-100 text-red-600 text-sm">
                  {(review.reviewer_name || 'A').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-foreground">
                    {review.reviewer_name || 'Anonyme'}
                  </span>
                  {renderStars(review.star_rating)}
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {getTimeAgo(review.create_time)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {review.comment || 'Aucun commentaire'}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Button
                  size="sm"
                  onClick={() => onRespondClick(review.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Répondre
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDismiss(review.id)}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {negativeReviews.length > 3 && (
            <p className="text-sm text-red-700 text-center">
              + {negativeReviews.length - 3} autre{negativeReviews.length - 3 > 1 ? 's' : ''} avis négatif{negativeReviews.length - 3 > 1 ? 's' : ''} en attente
            </p>
          )}
        </div>

        <div className="mt-4 p-3 bg-white/60 rounded-lg border border-red-100">
          <p className="text-xs text-red-700">
            💡 <strong>Conseil :</strong> Répondre rapidement aux avis négatifs montre que vous êtes à l'écoute. 
            Une réponse professionnelle peut transformer une expérience négative en opportunité.
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
}
