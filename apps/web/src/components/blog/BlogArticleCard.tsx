import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Check, Edit2, X, Calendar, Newspaper, Globe, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Publication } from "@/hooks/usePublications";

interface BlogArticleCardProps {
  article: Publication;
  onEdit: () => void;
  onValidate: () => void;
  onReject: () => void;
  onPublish?: () => void;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  brouillon: {
    label: "Brouillon",
    className: "bg-muted text-muted-foreground",
  },
  a_valider: {
    label: "À valider",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  },
  programme: {
    label: "Programmé",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  publie: {
    label: "Publié",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  },
};

export function BlogArticleCard({ article, onEdit, onValidate, onReject, onPublish }: BlogArticleCardProps) {
  const statusConfig = STATUS_CONFIG[article.status] || STATUS_CONFIG.brouillon;
  const scheduledDate = new Date(article.scheduled_date);
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      {article.image_url && (
        <div className="aspect-video w-full overflow-hidden bg-muted">
          <img
            src={article.image_url}
            alt={article.title || "Article image"}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Newspaper className="h-4 w-4 text-purple-600" />
            <Badge className={statusConfig.className}>{statusConfig.label}</Badge>
          </div>
        </div>
        <h3 className="font-semibold text-lg line-clamp-2 mt-2">
          {article.title || "Sans titre"}
        </h3>
      </CardHeader>
      
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {article.content}
        </p>
        <div className="flex flex-col gap-1.5 mt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              Programmé : {format(scheduledDate, "d MMMM yyyy", { locale: fr })} à {article.scheduled_time.slice(0, 5)}
            </span>
          </div>
          {article.status === "publie" && article.published_at && (
            <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
              <Globe className="h-3.5 w-3.5" />
              <span>
                Publié le {format(new Date(article.published_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
              </span>
            </div>
          )}
          {/* Social media adaptation badge */}
          {(article.status === "programme" || article.status === "publie") && (
            <Badge variant="outline" className="w-fit text-[10px] mt-1 border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-300">
              Décliné en prises de parole réseaux sociaux
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 gap-2">
        {article.status === "a_valider" && (
          <>
            <Button size="sm" variant="default" onClick={onValidate} className="flex-1 gap-1">
              <Check className="h-3.5 w-3.5" />
              Valider
            </Button>
            <Button size="sm" variant="outline" onClick={onEdit} className="gap-1">
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onReject} className="gap-1 text-destructive hover:text-destructive">
              <X className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
        {article.status === "brouillon" && (
          <Button size="sm" variant="outline" onClick={onEdit} className="flex-1 gap-1">
            <Edit2 className="h-3.5 w-3.5" />
            Modifier
          </Button>
        )}
        {article.status === "programme" && (
          <>
            <Button 
              size="sm" 
              variant="default" 
              onClick={onPublish}
              className="flex-1 gap-1"
            >
              <Globe className="h-3.5 w-3.5" />
              Publier sur le site
            </Button>
            <Button size="sm" variant="outline" onClick={onEdit} className="gap-1">
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
        {article.status === "publie" && (
          <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
            <CheckCircle2 className="h-4 w-4" />
            <span>Article publié sur le site</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
