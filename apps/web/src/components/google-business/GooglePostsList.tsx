import { Megaphone, CalendarDays, Tag, Trash2, Send, Clock, CheckCircle, Image } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { GooglePost } from "@/hooks/useGoogleBusiness";

interface GooglePostsListProps {
  posts: GooglePost[];
  onPublish: (postId: string) => void;
  onDelete: (postId: string) => void;
}

export function GooglePostsList({ posts, onPublish, onDelete }: GooglePostsListProps) {
  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'EVENT': return <CalendarDays className="h-4 w-4" />;
      case 'OFFER': return <Tag className="h-4 w-4" />;
      default: return <Megaphone className="h-4 w-4" />;
    }
  };

  const getPostTypeLabel = (type: string) => {
    switch (type) {
      case 'EVENT': return 'Événement';
      case 'OFFER': return 'Offre';
      default: return 'Actualité';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            Publié
          </Badge>
        );
      case 'scheduled':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            <Clock className="h-3 w-3 mr-1" />
            Programmé
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            Brouillon
          </Badge>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-5 w-5" />
          Publications
        </CardTitle>
        <CardDescription>
          {posts.length} publication{posts.length > 1 ? 's' : ''} Google Business
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Megaphone className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Aucune publication</p>
            <p className="text-sm mt-1">
              Créez votre première publication Google Business
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <div 
              key={post.id} 
              className="border rounded-lg p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {getPostTypeIcon(post.post_type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {getPostTypeLabel(post.post_type)}
                      </span>
                      {post.event_title && (
                        <span className="text-sm text-muted-foreground">
                          — {post.event_title}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Créé le {format(new Date(post.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
                    </p>
                  </div>
                </div>
                {getStatusBadge(post.status)}
              </div>

              {post.media_url && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Image className="h-4 w-4" />
                  <span className="truncate">{post.media_url}</span>
                </div>
              )}

              <p className="text-sm line-clamp-3">{post.summary}</p>

              {(post.event_start_date || post.event_end_date) && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  {post.event_start_date && (
                    <span>
                      Du {format(new Date(post.event_start_date), 'dd MMM yyyy', { locale: fr })}
                    </span>
                  )}
                  {post.event_end_date && (
                    <span>
                      au {format(new Date(post.event_end_date), 'dd MMM yyyy', { locale: fr })}
                    </span>
                  )}
                </div>
              )}

              {post.scheduled_at && post.status === 'scheduled' && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Clock className="h-4 w-4" />
                  <span>
                    Programmé pour le {format(new Date(post.scheduled_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
                  </span>
                </div>
              )}

              {post.published_at && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>
                    Publié le {format(new Date(post.published_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
                  </span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                {post.status !== 'published' && (
                  <Button 
                    size="sm" 
                    onClick={() => onPublish(post.id)}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Publier
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onDelete(post.id)}
                  className="text-destructive hover:text-destructive gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
