import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Clock, Save, Send, Loader2, ArrowLeft, CheckCircle2, Link2, X, Trash2, Lock } from "lucide-react";
import { ImageUpload } from "@/components/calendar/ImageUpload";
import { SourceBadge } from "@/components/ui/source-badge";
import { SocialPreview } from "@/components/preview/SocialPreview";
import { DuplicateButton } from "@/components/duplication/DuplicateButton";
import { PlatformBadge } from "@/components/ui/platform-badge";
import { RichTextEditor, SocialNetwork } from "@/components/editor/RichTextEditor";
import { AIPostAssistant } from "@/components/editor/AIPostAssistant";
import { URLContentGenerator } from "@/components/editor/URLContentGenerator";
import { AIImageGenerator } from "@/components/editor/AIImageGenerator";
import { usePublications, PublicationStatus, Publication, SocialPlatform } from "@/hooks/usePublications";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AVAILABLE_PLATFORMS: { value: SocialNetwork; label: string }[] = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "twitter", label: "X (Twitter)" },
  { value: "google_business", label: "Google Business" },
];

export default function Editor() {
  const navigate = useNavigate();
  const { id: routeId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const searchId = searchParams.get("id");
  
  // Priorité au paramètre de route, fallback sur query param
  const publicationId = routeId || searchId;
  
  const { publications, createPublication, updatePublication, deletePublication } = usePublications();
  
  // Permissions basées sur les rôles
  const { 
    canCreatePublications,
    canSubmitForValidation,
    canPublishDirectly,
    canScheduleContent,
    canEditOwnContent,
    canEditAllCabinetContent,
    isReadOnlyMode,
    loading: roleLoading
  } = useUserRole();

  // Peut créer/éditer du contenu
  const canEdit = canCreatePublications || canEditOwnContent || canEditAllCabinetContent;
  
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [time, setTime] = useState("09:00");
  const [status, setStatus] = useState<PublicationStatus>("brouillon");
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialNetwork[]>(["linkedin"]);
  const [loading, setLoading] = useState(false);
  const [editingPublication, setEditingPublication] = useState<Publication | null>(null);
  const [generatedFromUrl, setGeneratedFromUrl] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isEditing = !!publicationId;
  
  // For preview, use the first selected platform
  const previewPlatform = selectedPlatforms[0] || "linkedin";

  // Load publication data when editing
  useEffect(() => {
    if (publicationId && publications.length > 0) {
      const pub = publications.find(p => p.id === publicationId);
      if (pub) {
        setEditingPublication(pub);
        setContent(pub.content);
        setImageUrl(pub.image_url);
        setDate(pub.scheduled_date);
        setTime(pub.scheduled_time.slice(0, 5));
        setStatus(pub.status);
        if (pub.platform && pub.platform !== "blog") {
          setSelectedPlatforms([pub.platform as SocialNetwork]);
        }
      }
    }
  }, [publicationId, publications]);

  const togglePlatform = (platform: SocialNetwork) => {
    setSelectedPlatforms(prev => {
      if (prev.includes(platform)) {
        // Don't allow deselecting if it's the last one
        if (prev.length === 1) return prev;
        return prev.filter(p => p !== platform);
      }
      return [...prev, platform];
    });
  };

  const handleSave = async (submitStatus: PublicationStatus) => {
    if (!content.trim() || selectedPlatforms.length === 0) return;
    
    setLoading(true);
    
    if (isEditing && publicationId) {
      // When editing, update the single publication
      const success = await updatePublication({
        id: publicationId,
        content: content.trim(),
        image_url: imageUrl,
        scheduled_date: date,
        scheduled_time: time,
        status: submitStatus,
        platform: selectedPlatforms[0] as SocialPlatform,
      });
      if (success) {
        if (submitStatus === "a_valider") {
          toast({
            title: "Publication envoyée pour validation",
            description: "Statut : À valider • Validation automatique dans 24h",
          });
        } else if (submitStatus === "brouillon") {
          toast({
            title: "Brouillon enregistré",
            description: "Votre publication a été sauvegardée.",
          });
        }
        navigate("/calendar");
      }
    } else {
      // When creating, create one publication per selected platform
      let successCount = 0;
      for (const platform of selectedPlatforms) {
        const result = await createPublication({
          content: content.trim(),
          image_url: imageUrl,
          scheduled_date: date,
          scheduled_time: time,
          status: submitStatus,
          source: "manual",
          platform: platform as SocialPlatform,
        });
        if (result) successCount++;
      }
      
      if (successCount > 0) {
        if (submitStatus === "a_valider") {
          toast({
            title: successCount > 1 
              ? `${successCount} publications envoyées pour validation`
              : "Publication envoyée pour validation",
            description: "Statut : À valider • Validation automatique dans 24h",
          });
        } else if (submitStatus === "brouillon") {
          toast({
            title: successCount > 1 
              ? `${successCount} brouillons enregistrés`
              : "Brouillon enregistré",
            description: "Vos publications ont été sauvegardées.",
          });
        }
        navigate("/calendar");
      }
    }
    
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!publicationId) return;
    
    setLoading(true);
    const success = await deletePublication(publicationId);
    setLoading(false);
    
    if (success) {
      toast({
        title: "Publication supprimée",
        description: "La prise de parole a été supprimée avec succès.",
      });
      navigate("/calendar");
    }
  };

  // Afficher un message si l'utilisateur est en mode lecture seule
  if (isReadOnlyMode && !roleLoading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
          <div className="p-4 rounded-full bg-muted mb-4">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold mb-1">Accès en lecture seule</h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            Vous n'avez pas les permissions pour créer ou modifier du contenu.
          </p>
          <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="grid gap-6 lg:grid-cols-2 animate-fade-in">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">
                {isEditing ? "Modifier la prise de parole" : "Nouvelle prise de parole"}
              </h1>
              {editingPublication && (
                <div className="mt-2 flex items-center gap-2">
                  <SourceBadge source={editingPublication.source} />
                  <PlatformBadge platform={editingPublication.platform} />
                </div>
              )}
            </div>
          </div>
          
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Votre message</CardTitle>
                <div className="flex items-center gap-2">
                  <URLContentGenerator 
                    platform={previewPlatform} 
                    onGenerated={(generatedContent, sourceUrl) => {
                      setContent(generatedContent);
                      setGeneratedFromUrl(sourceUrl);
                    }}
                  />
                  <AIPostAssistant 
                    platform={previewPlatform} 
                    onGenerated={(generatedContent) => {
                      setContent(generatedContent);
                      setGeneratedFromUrl(null);
                    }}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Source URL indicator */}
              {generatedFromUrl && (
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg text-sm">
                  <Link2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Généré depuis :</span>
                  <a 
                    href={generatedFromUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline truncate max-w-[300px]"
                  >
                    {generatedFromUrl}
                  </a>
                  <button 
                    onClick={() => setGeneratedFromUrl(null)}
                    className="ml-auto text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              {/* Sélecteur de réseaux sociaux multiples */}
              <div className="space-y-3">
                <Label>Canaux de diffusion</Label>
                <div className="grid grid-cols-2 gap-3">
                  {AVAILABLE_PLATFORMS.map((platform) => (
                    <div
                      key={platform.value}
                      className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedPlatforms.includes(platform.value)
                          ? "bg-primary/10 border-primary"
                          : "bg-muted/30 border-border hover:bg-muted/50"
                      }`}
                      onClick={() => togglePlatform(platform.value)}
                    >
                      <Checkbox
                        id={platform.value}
                        checked={selectedPlatforms.includes(platform.value)}
                        onCheckedChange={() => togglePlatform(platform.value)}
                      />
                      <label
                        htmlFor={platform.value}
                        className="text-sm font-medium cursor-pointer flex-1"
                      >
                        {platform.label}
                      </label>
                    </div>
                  ))}
                </div>
                {selectedPlatforms.length > 1 && !isEditing && (
                  <p className="text-xs text-muted-foreground">
                    {selectedPlatforms.length} prises de parole seront créées, une par canal sélectionné.
                  </p>
                )}
              </div>
              
              {/* Éditeur de texte enrichi */}
              <RichTextEditor
                value={content}
                onChange={setContent}
                platform={previewPlatform}
                placeholder="Rédigez votre publication..."
              />
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Image (optionnel)</Label>
                  <AIImageGenerator 
                    postContent={content} 
                    onGenerated={(url) => setImageUrl(url)}
                  />
                </div>
                <ImageUpload
                  value={imageUrl}
                  onChange={setImageUrl}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader><CardTitle>Planification</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      type="date" 
                      className="pl-10" 
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Heure</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      type="time" 
                      className="pl-10" 
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as PublicationStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brouillon">Brouillon</SelectItem>
                    <SelectItem value="a_valider">À valider</SelectItem>
                    {/* Statut Programmé uniquement pour les Lawyers */}
                    {canScheduleContent && (
                      <SelectItem value="programme">Programmé</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {!canScheduleContent && (
                  <p className="text-xs text-muted-foreground">
                    Seul l'avocat peut programmer directement une publication.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3">
            {/* Bouton Sauvegarder - pour CM et Lawyer */}
            <Button 
              variant="outline" 
              className="flex-1 min-w-[140px]" 
              onClick={() => handleSave("brouillon")}
              disabled={loading || !content.trim() || selectedPlatforms.length === 0}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Sauvegarder {!isEditing && selectedPlatforms.length > 1 && `(${selectedPlatforms.length})`}
            </Button>
            
            {/* Bouton Soumettre à validation - pour CM */}
            {canSubmitForValidation && !canPublishDirectly && (
              <Button 
                className="flex-1 min-w-[140px] bg-accent hover:bg-accent/90" 
                onClick={() => handleSave("a_valider")}
                disabled={loading || !content.trim() || selectedPlatforms.length === 0}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Soumettre à validation {!isEditing && selectedPlatforms.length > 1 && `(${selectedPlatforms.length})`}
              </Button>
            )}
            
            {/* Bouton Programmer directement - pour Lawyer uniquement */}
            {canPublishDirectly && (
              <Button 
                className="flex-1 min-w-[140px] bg-primary hover:bg-primary/90" 
                onClick={() => handleSave("programme")}
                disabled={loading || !content.trim() || selectedPlatforms.length === 0}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                Programmer {!isEditing && selectedPlatforms.length > 1 && `(${selectedPlatforms.length})`}
              </Button>
            )}
          </div>

          {/* Duplication et suppression */}
          {isEditing && editingPublication && (
            <div className="pt-2 border-t space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Décliner ce contenu pour un autre réseau
                </p>
                <DuplicateButton 
                  publication={editingPublication} 
                  onDuplicated={(newPub) => navigate(`/editor?id=${newPub.id}`)}
                />
              </div>
              
              <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full" disabled={loading}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer cette prise de parole
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer cette publication ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est irréversible. La prise de parole sera définitivement supprimée.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                      Supprimer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        <Card className="shadow-card h-fit">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Prévisualisation</CardTitle>
              {!isEditing && (
                <SourceBadge source="manual" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <SocialPreview content={content} imageUrl={imageUrl} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
