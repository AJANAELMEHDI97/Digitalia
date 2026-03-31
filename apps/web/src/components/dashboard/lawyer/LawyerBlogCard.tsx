import { Link } from "react-router-dom";
import { Newspaper, ChevronRight, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBlogArticles } from "@/hooks/useBlogArticles";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { useMemo } from "react";

export function LawyerBlogCard() {
  const { articles, loading } = useBlogArticles();

  // Get the 3 most recent published articles
  const recentArticles = useMemo(() => {
    const published = articles.filter(a => a.status === 'publie');
    return published
      .sort((a, b) => new Date(b.published_at || b.scheduled_date).getTime() - new Date(a.published_at || a.scheduled_date).getTime())
      .slice(0, 3);
  }, [articles]);

  // Count published this month
  const publishedThisMonth = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return articles.filter(a => 
      a.status === 'publie' && 
      new Date(a.published_at || a.scheduled_date) >= startOfMonth
    ).length;
  }, [articles]);

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Demo fallback data
  const displayArticles = recentArticles.length > 0 ? recentArticles : [
    { id: '1', title: 'Licenciement économique : les nouvelles règles', scheduled_date: '2025-01-12', status: 'publie' as const },
    { id: '2', title: 'Garde alternée : ce qui change en 2025', scheduled_date: '2025-01-08', status: 'publie' as const },
    { id: '3', title: 'Réforme des retraites : impacts pratiques', scheduled_date: '2025-01-03', status: 'publie' as const },
  ];

  const displayCount = publishedThisMonth || 3;

  return (
    <Card className="bg-card border transition-all duration-200 hover:shadow-md h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-lg font-semibold">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/20">
              <Newspaper className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <span>Blog du cabinet</span>
          </CardTitle>
          <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
            <Link to="/blog">
              Voir tout
              <ChevronRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="flex items-center justify-between pb-2 border-b">
          <span className="text-sm text-muted-foreground">Articles publiés ce mois</span>
          <Badge variant="secondary" className="text-sm font-semibold">
            {displayCount}
          </Badge>
        </div>

        {/* Articles list */}
        <div className="space-y-2">
          {displayArticles.map((article) => (
            <Link
              key={article.id}
              to={`/blog?article=${article.id}`}
              className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
                  {article.title || article.content?.substring(0, 40) + '...'}
                </p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {format(parseISO(article.scheduled_date), 'dd/MM', { locale: fr })}
              </span>
            </Link>
          ))}
        </div>

        {/* SEO tip */}
        <p className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-2 text-center">
          💡 Les articles renforcent votre référencement naturel
        </p>
      </CardContent>
    </Card>
  );
}
