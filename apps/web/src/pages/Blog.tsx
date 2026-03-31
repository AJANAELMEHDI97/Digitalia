import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Newspaper, ExternalLink, Filter, TrendingUp } from "lucide-react";
import { useBlogArticles } from "@/hooks/useBlogArticles";
import { BlogArticleCard } from "@/components/blog/BlogArticleCard";
import { BlogArticleDialog } from "@/components/blog/BlogArticleDialog";
import { BlogEmptyState } from "@/components/blog/BlogEmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Publication, PublicationStatus } from "@/hooks/usePublications";

export default function Blog() {
  const { articles, loading, createArticle, updateArticle, deleteArticle } = useBlogArticles();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Publication | null>(null);
  const [statusFilter, setStatusFilter] = useState<PublicationStatus | "all">("all");

  const filteredArticles = articles.filter((article) => {
    if (statusFilter === "all") return true;
    return article.status === statusFilter;
  });

  const stats = {
    drafts: articles.filter((a) => a.status === "brouillon").length,
    toValidate: articles.filter((a) => a.status === "a_valider").length,
    scheduled: articles.filter((a) => a.status === "programme").length,
    published: articles.filter((a) => a.status === "publie").length,
  };

  const handleEdit = (article: Publication) => {
    setSelectedArticle(article);
    setDialogOpen(true);
  };

  const handleValidate = async (article: Publication) => {
    await updateArticle({ id: article.id, status: "programme" });
  };

  const handlePublish = async (article: Publication) => {
    await updateArticle({ 
      id: article.id, 
      status: "publie",
      published_at: new Date().toISOString(),
    });
  };

  const handleReject = async (article: Publication) => {
    await updateArticle({ id: article.id, status: "brouillon" });
  };

  const handleNewArticle = () => {
    setSelectedArticle(null);
    setDialogOpen(true);
  };

  const handleSave = async (data: any) => {
    if (selectedArticle) {
      await updateArticle({ id: selectedArticle.id, ...data });
    } else {
      await createArticle(data);
    }
    setDialogOpen(false);
    setSelectedArticle(null);
  };

  const handleDelete = async (id: string) => {
    await deleteArticle(id);
    setDialogOpen(false);
    setSelectedArticle(null);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Newspaper className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Blog</h1>
              <p className="text-sm text-muted-foreground">
                Préparez les articles pour votre site web
              </p>
            </div>
          </div>
          <Button onClick={handleNewArticle} className="gap-2">
            <Plus className="h-4 w-4" />
            Nouvel article
          </Button>
        </div>

        {/* Info Banner */}
        <Alert className="border-purple-200 bg-purple-50 dark:bg-purple-950/20 dark:border-purple-800">
          <ExternalLink className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-purple-800 dark:text-purple-200">
            <strong>Publication automatique.</strong> Une fois validé, votre article sera automatiquement publié sur votre site web à la date programmée.
          </AlertDescription>
        </Alert>
        
        {/* SEO Info */}
        <Alert className="border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-800">
          <TrendingUp className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="text-emerald-800 dark:text-emerald-200">
            <strong>Référencement naturel.</strong> Chaque article contribue à la visibilité de votre cabinet sur les moteurs de recherche.
          </AlertDescription>
        </Alert>

        {/* Stats */}
        <div className="flex flex-wrap gap-3">
          <Badge variant="outline" className="gap-1.5 py-1.5 px-3">
            <span className="text-muted-foreground">Brouillons</span>
            <span className="font-semibold">{stats.drafts}</span>
          </Badge>
          <Badge variant="outline" className="gap-1.5 py-1.5 px-3 border-amber-300 bg-amber-50 dark:bg-amber-950/30">
            <span className="text-amber-700 dark:text-amber-300">À valider</span>
            <span className="font-semibold text-amber-700 dark:text-amber-300">{stats.toValidate}</span>
          </Badge>
          <Badge variant="outline" className="gap-1.5 py-1.5 px-3 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30">
            <span className="text-emerald-700 dark:text-emerald-300">Programmés</span>
            <span className="font-semibold text-emerald-700 dark:text-emerald-300">{stats.scheduled}</span>
          </Badge>
          <Badge variant="outline" className="gap-1.5 py-1.5 px-3 border-blue-300 bg-blue-50 dark:bg-blue-950/30">
            <span className="text-blue-700 dark:text-blue-300">Publiés</span>
            <span className="font-semibold text-blue-700 dark:text-blue-300">{stats.published}</span>
          </Badge>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as PublicationStatus | "all")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les articles</SelectItem>
              <SelectItem value="brouillon">Brouillons</SelectItem>
              <SelectItem value="a_valider">À valider</SelectItem>
              <SelectItem value="programme">Programmés</SelectItem>
              <SelectItem value="publie">Publiés</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Articles List */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <BlogEmptyState onCreateArticle={handleNewArticle} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map((article) => (
              <BlogArticleCard
                key={article.id}
                article={article}
                onEdit={() => handleEdit(article)}
                onValidate={() => handleValidate(article)}
                onReject={() => handleReject(article)}
                onPublish={() => handlePublish(article)}
              />
            ))}
          </div>
        )}

        {/* Dialog */}
        <BlogArticleDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          article={selectedArticle}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      </div>
    </AppLayout>
  );
}
