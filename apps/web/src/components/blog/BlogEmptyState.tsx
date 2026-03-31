import { Button } from "@/components/ui/button";
import { Newspaper, Plus } from "lucide-react";

interface BlogEmptyStateProps {
  onCreateArticle: () => void;
}

export function BlogEmptyState({ onCreateArticle }: BlogEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="p-4 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-4">
        <Newspaper className="h-8 w-8 text-purple-600 dark:text-purple-400" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Aucun article pour le moment
      </h3>
      <p className="text-muted-foreground max-w-md mb-6">
        Créez votre premier article de blog. Une fois validé, il sera automatiquement publié sur votre site web.
      </p>
      <Button onClick={onCreateArticle} className="gap-2">
        <Plus className="h-4 w-4" />
        Créer un article
      </Button>
    </div>
  );
}
