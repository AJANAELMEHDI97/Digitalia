import { useState } from "react";
import { Star, MessageSquare, RefreshCw, User, Check, Send, Sparkles, Loader2, ChevronDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { GoogleReview } from "@/hooks/useGoogleBusiness";

interface GoogleReviewsListProps {
  reviews: GoogleReview[];
  syncing: boolean;
  onSync: () => void;
  onReply: (reviewId: string, reply: string) => void;
  businessName?: string;
}

export function GoogleReviewsList({ reviews, syncing, onSync, onReply, businessName }: GoogleReviewsListProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | number>('all');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const filteredReviews = reviews.filter(review => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !review.review_reply;
    return review.star_rating === filter;
  });

  const handleSubmitReply = (reviewId: string) => {
    if (replyText.trim()) {
      onReply(reviewId, replyText);
      setReplyingTo(null);
      setReplyText('');
    }
  };

  const handleGenerateAIReply = async (review: GoogleReview) => {
    // Auto-expand and set replying mode
    if (!expandedItems.includes(review.id)) {
      setExpandedItems([...expandedItems, review.id]);
    }
    setReplyingTo(review.id);
    setGeneratingFor(review.id);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-review-reply', {
        body: {
          reviewerName: review.reviewer_name,
          starRating: review.star_rating,
          comment: review.comment,
          businessName: businessName,
        },
      });

      if (error) throw error;

      if (data?.reply) {
        setReplyText(data.reply);
        toast.success('Réponse générée avec succès');
      } else {
        throw new Error('Aucune réponse générée');
      }
    } catch (error) {
      console.error('Error generating AI reply:', error);
      toast.error('Erreur lors de la génération de la réponse');
    } finally {
      setGeneratingFor(null);
    }
  };

  const handleStartReply = (review: GoogleReview) => {
    if (!expandedItems.includes(review.id)) {
      setExpandedItems([...expandedItems, review.id]);
    }
    setReplyingTo(review.id);
    setReplyText(review.review_reply || '');
  };

  const renderStars = (rating: number | null) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= (rating || 0) 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-muted-foreground/30'
            }`}
          />
        ))}
      </div>
    );
  };

  const truncateText = (text: string | null, maxLength: number = 80) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const pendingCount = reviews.filter(r => !r.review_reply).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Avis Google
            </CardTitle>
            <CardDescription>
              {reviews.length} avis • {pendingCount} en attente de réponse
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onSync} disabled={syncing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            Synchroniser
          </Button>
        </div>
        
        {/* Response templates hint */}
        <div className="flex items-center gap-2 mt-3 p-2 rounded-md bg-primary/5 border border-primary/10">
          <Sparkles className="h-4 w-4 text-primary" />
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Réponses professionnelles recommandées.</strong> Utilisez l'IA pour générer des réponses adaptées à chaque avis.
          </p>
        </div>

        <div className="flex gap-2 mt-4 flex-wrap">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('all')}
          >
            Tous
          </Button>
          <Button 
            variant={filter === 'pending' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('pending')}
          >
            Sans réponse
          </Button>
          {[5, 4, 3, 2, 1].map(rating => (
            <Button 
              key={rating}
              variant={filter === rating ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter(rating)}
              className="gap-1"
            >
              {rating} <Star className="h-3 w-3 fill-current" />
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {filteredReviews.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Aucun avis à afficher</p>
            <p className="text-sm mt-1">
              {reviews.length === 0 
                ? 'Synchronisez vos avis Google pour les voir ici'
                : 'Aucun avis ne correspond à ce filtre'
              }
            </p>
          </div>
        ) : (
          <Accordion 
            type="multiple" 
            value={expandedItems}
            onValueChange={setExpandedItems}
            className="space-y-3"
          >
            {filteredReviews.map((review) => (
              <AccordionItem 
                key={review.id}
                id={`review-${review.id}`}
                value={review.id}
                className="border rounded-lg px-4 data-[state=open]:bg-muted/30 transition-colors duration-200"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={review.reviewer_photo_url || undefined} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="font-medium text-sm">{review.reviewer_name || 'Anonyme'}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {renderStars(review.star_rating)}
                          {review.create_time && (
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(review.create_time), 'dd MMM yyyy', { locale: fr })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground hidden sm:block max-w-[200px] truncate">
                        {truncateText(review.comment)}
                      </span>
                      {review.review_reply ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 shrink-0">
                          <Check className="h-3 w-3 mr-1" />
                          Répondu
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="shrink-0">En attente</Badge>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                
                <AccordionContent className="pb-4">
                  <div className="space-y-4 pt-2">
                    {/* Full comment */}
                    {review.comment && (
                      <div className="bg-background rounded-lg p-3 border">
                        <p className="text-sm text-foreground leading-relaxed">{review.comment}</p>
                      </div>
                    )}

                    {/* Existing reply */}
                    {review.review_reply && replyingTo !== review.id && (
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                        <p className="text-xs font-medium text-primary mb-2">Votre réponse</p>
                        <p className="text-sm">{review.review_reply}</p>
                        {review.reply_updated_at && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {format(new Date(review.reply_updated_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Reply form */}
                    {replyingTo === review.id ? (
                      <div className="bg-accent/50 border-2 border-primary/30 rounded-lg p-4 space-y-4 transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-primary" />
                            Rédiger une réponse
                          </h4>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleGenerateAIReply(review)}
                            disabled={generatingFor === review.id}
                            className="gap-2"
                          >
                            {generatingFor === review.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Sparkles className="h-4 w-4" />
                            )}
                            {generatingFor === review.id ? 'Génération...' : 'Générer avec IA'}
                          </Button>
                        </div>
                        
                        <Textarea
                          placeholder="Écrivez votre réponse personnalisée..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows={6}
                          className="resize-none bg-background text-base"
                        />
                        
                        <div className="flex gap-2 justify-end">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText('');
                            }}
                          >
                            Annuler
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleSubmitReply(review.id)}
                            disabled={!replyText.trim()}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Envoyer la réponse
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleStartReply(review)}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          {review.review_reply ? 'Modifier la réponse' : 'Répondre'}
                        </Button>
                        {!review.review_reply && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleGenerateAIReply(review)}
                            disabled={generatingFor === review.id}
                          >
                            {generatingFor === review.id ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Sparkles className="h-4 w-4 mr-2" />
                            )}
                            Réponse IA
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
