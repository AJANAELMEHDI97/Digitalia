import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, Clock, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface BlogArticlePreviewProps {
  title: string;
  content: string;
  imageUrl?: string | null;
  date: Date;
  time: string;
  onClose: () => void;
}

export function BlogArticlePreview({
  title,
  content,
  imageUrl,
  date,
  time,
  onClose,
}: BlogArticlePreviewProps) {
  // Parse content into paragraphs
  const paragraphs = content.split("\n\n").filter((p) => p.trim());

  // Estimate reading time (average 200 words per minute)
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-muted/30">
        <Button variant="ghost" size="sm" onClick={onClose} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Retour à l'édition
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <span className="text-sm text-muted-foreground">Aperçu de l'article</span>
      </div>

      {/* Article Preview */}
      <ScrollArea className="flex-1">
        <article className="max-w-3xl mx-auto px-6 py-8">
          {/* Hero Image */}
          {imageUrl && (
            <div className="aspect-[16/9] w-full overflow-hidden rounded-xl mb-8 bg-muted">
              <img
                src={imageUrl}
                alt={title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {/* Article Header */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4">
              {title || "Titre de l'article"}
            </h1>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                <span>Cabinet juridique</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{format(date, "d MMMM yyyy", { locale: fr })}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{readingTime} min de lecture</span>
              </div>
            </div>
          </header>

          <Separator className="mb-8" />

          {/* Article Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {paragraphs.length > 0 ? (
              paragraphs.map((paragraph, index) => {
                // Check if it looks like a heading (short line, possibly ending with punctuation)
                const isHeading = paragraph.length < 60 && !paragraph.includes(".") && index > 0;
                
                if (isHeading) {
                  return (
                    <h2 key={index} className="text-xl font-semibold text-foreground mt-8 mb-4">
                      {paragraph}
                    </h2>
                  );
                }

                return (
                  <p key={index} className="text-muted-foreground leading-relaxed mb-4">
                    {paragraph}
                  </p>
                );
              })
            ) : (
              <p className="text-muted-foreground italic">
                Le contenu de votre article apparaîtra ici...
              </p>
            )}
          </div>

          {/* Footer */}
          <Separator className="my-8" />
          
          <footer className="bg-muted/30 rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-2">
              Cet article a été préparé par votre cabinet juridique.
            </p>
            <p className="text-xs text-muted-foreground">
              Publication prévue le {format(date, "d MMMM yyyy", { locale: fr })} à {time}
            </p>
          </footer>
        </article>
      </ScrollArea>
    </div>
  );
}
