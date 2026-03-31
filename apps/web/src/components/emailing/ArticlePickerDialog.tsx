import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Calendar, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useBlogArticles } from "@/hooks/useBlogArticles";

interface ArticlePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectArticles: (articles: SelectedArticle[]) => void;
  maxArticles?: number;
}

export interface SelectedArticle {
  id: string;
  title: string;
  content: string;
  image_url?: string | null;
  scheduled_date: string;
}

export function ArticlePickerDialog({
  open,
  onOpenChange,
  onSelectArticles,
  maxArticles = 3,
}: ArticlePickerDialogProps) {
  const { articles, loading } = useBlogArticles();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filter only published or scheduled articles
  const availableArticles = articles.filter(
    (a) => a.status === "programme" || a.status === "publie"
  );

  const toggleArticle = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else if (selectedIds.length < maxArticles) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleConfirm = () => {
    const selected = availableArticles
      .filter((a) => selectedIds.includes(a.id))
      .map((a) => ({
        id: a.id,
        title: a.title || "Sans titre",
        content: a.content,
        image_url: a.image_url,
        scheduled_date: a.scheduled_date,
      }));
    onSelectArticles(selected);
    setSelectedIds([]);
    onOpenChange(false);
  };

  const truncateContent = (content: string, maxLength = 150) => {
    const plainText = content.replace(/<[^>]*>/g, "");
    return plainText.length > maxLength
      ? plainText.substring(0, maxLength) + "..."
      : plainText;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Sélectionner des articles</DialogTitle>
          <DialogDescription>
            Choisissez jusqu'à {maxArticles} articles de votre blog à inclure dans l'email.
            Les liens redirigeront vers votre site web.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Chargement des articles...</p>
            </div>
          ) : availableArticles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Aucun article publié disponible</p>
              <p className="text-sm text-muted-foreground">
                Créez des articles dans la section Blog pour les inclure ici
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableArticles.map((article) => {
                const isSelected = selectedIds.includes(article.id);
                const isDisabled = !isSelected && selectedIds.length >= maxArticles;

                return (
                  <div
                    key={article.id}
                    className={`flex gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : isDisabled
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => !isDisabled && toggleArticle(article.id)}
                  >
                    <Checkbox
                      checked={isSelected}
                      disabled={isDisabled}
                      className="mt-1"
                    />
                    
                    {article.image_url ? (
                      <img
                        src={article.image_url}
                        alt=""
                        className="w-20 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-20 h-16 bg-muted rounded flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">
                        {article.title || "Sans titre"}
                      </h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {truncateContent(article.content)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(article.scheduled_date), "d MMM yyyy", { locale: fr })}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <span className="text-sm text-muted-foreground">
              {selectedIds.length}/{maxArticles} articles sélectionnés
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button onClick={handleConfirm} disabled={selectedIds.length === 0}>
                Insérer les articles
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
