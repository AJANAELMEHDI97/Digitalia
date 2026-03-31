import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, Trash2, Loader2, Newspaper, ExternalLink, Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ImageUpload } from "@/components/calendar/ImageUpload";
import { AIArticleAssistant } from "./AIArticleAssistant";
import { AIImageGenerator } from "@/components/editor/AIImageGenerator";
import { BlogArticlePreview } from "./BlogArticlePreview";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Publication, PublicationStatus } from "@/hooks/usePublications";

interface BlogArticleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  article?: Publication | null;
  onSave: (data: {
    title: string;
    content: string;
    image_url?: string | null;
    scheduled_date: string;
    scheduled_time: string;
    status: PublicationStatus;
  }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

const STATUS_OPTIONS = [
  { value: "brouillon", label: "Brouillon" },
  { value: "a_valider", label: "À valider" },
  { value: "programme", label: "Programmé" },
];

export function BlogArticleDialog({
  open,
  onOpenChange,
  article,
  onSave,
  onDelete,
}: BlogArticleDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState("09:00");
  const [status, setStatus] = useState<PublicationStatus>("brouillon");
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  useEffect(() => {
    if (article) {
      setTitle(article.title || "");
      setContent(article.content);
      setImageUrl(article.image_url);
      setDate(new Date(article.scheduled_date));
      setTime(article.scheduled_time.slice(0, 5));
      setStatus(article.status);
    } else {
      setTitle("");
      setContent("");
      setImageUrl(null);
      setDate(new Date());
      setTime("09:00");
      setStatus("brouillon");
    }
    setActiveTab("edit");
  }, [article, open]);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;

    setLoading(true);
    try {
      await onSave({
        title: title.trim(),
        content: content.trim(),
        image_url: imageUrl,
        scheduled_date: format(date, "yyyy-MM-dd"),
        scheduled_time: time,
        status,
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!article || !onDelete) return;
    setLoading(true);
    try {
      await onDelete(article.id);
      onOpenChange(false);
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleAIGenerated = (generated: { title: string; content: string }) => {
    if (generated.title) setTitle(generated.title);
    if (generated.content) setContent(generated.content);
  };

  const handleImageGenerated = (url: string) => {
    setImageUrl(url);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <div className="flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-purple-600" />
              <DialogTitle>
                {article ? "Modifier l'article" : "Nouvel article de blog"}
              </DialogTitle>
            </div>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "edit" | "preview")} className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="edit">Édition</TabsTrigger>
                <TabsTrigger value="preview" className="gap-2">
                  <Eye className="h-4 w-4" />
                  Aperçu
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="edit" className="flex-1 overflow-y-auto px-6 pb-4 mt-4">
              {/* Info Banner */}
              <Alert className="border-purple-200 bg-purple-50/50 dark:bg-purple-950/20 dark:border-purple-800 mb-4">
                <ExternalLink className="h-4 w-4 text-purple-600" />
                <AlertDescription className="text-sm text-purple-800 dark:text-purple-200">
                  Une fois validé, cet article sera automatiquement publié sur votre site web à la date programmée.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                {/* AI Assistant */}
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Assistance IA</Label>
                  <div className="flex gap-2">
                    <AIArticleAssistant 
                      onGenerated={handleAIGenerated}
                      existingContent={content}
                      existingTitle={title}
                    />
                    <AIImageGenerator 
                      postContent={`${title}\n\n${content}`}
                      onGenerated={handleImageGenerated}
                    />
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Titre de l&apos;article *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Les nouvelles obligations du RGPD en 2025"
                    className="text-lg font-medium"
                  />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <Label htmlFor="content">Contenu de l&apos;article *</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={`Rédigez votre article ici...

Introduction
Présentez le sujet et son importance pour vos lecteurs.

Développement
Détaillez les points clés avec des exemples concrets.

Conclusion
Résumez et proposez des conseils pratiques.`}
                    className="min-h-[200px] leading-relaxed"
                  />
                  <p className="text-xs text-muted-foreground">
                    {content.length} caractères • ~{Math.ceil(content.split(/\s+/).filter(Boolean).length / 200)} min de lecture
                  </p>
                </div>

                {/* Image */}
                <div className="space-y-2">
                  <Label>Image principale</Label>
                  <ImageUpload
                    value={imageUrl}
                    onChange={setImageUrl}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Utilisez l&apos;assistant IA pour générer une image adaptée au sujet juridique.
                  </p>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date de publication</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP", { locale: fr }) : "Sélectionner"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={(d) => d && setDate(d)}
                          initialFocus
                          locale={fr}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Heure</Label>
                    <Input
                      id="time"
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label>Statut</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as PublicationStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="flex-1 overflow-hidden mt-0">
              <BlogArticlePreview
                title={title}
                content={content}
                imageUrl={imageUrl}
                date={date}
                time={time}
                onClose={() => setActiveTab("edit")}
              />
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex-col sm:flex-row gap-2 px-6 py-4 border-t">
            {article && onDelete && (
              <Button
                variant="ghost"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-destructive hover:text-destructive sm:mr-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={loading || !title.trim() || !content.trim()}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {article ? "Enregistrer" : "Créer l'article"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet article ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'article sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
