import { useState } from "react";
import { format, differenceInHours } from "date-fns";
import { fr } from "date-fns/locale";
import { Send, Calendar, Clock, AlertTriangle, Building2, Eye, FileText, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlatformBadge } from "@/components/ui/platform-badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { toast } from "sonner";
import type { Publication } from "@/hooks/usePublications";

interface ScheduledPublicationsCarouselProps {
  publications: Publication[];
  onSendToValidation: (id: string) => Promise<void>;
  onEditPublication: (id: string) => void;
  onDeletePublication?: (id: string) => Promise<void>;
  onPublicationClick: (publication: Publication) => void;
  // For CM global view
  showFirmBadge?: boolean;
  firmNamesMap?: Map<string, string>;
}

// Helper to calculate urgency level
function getUrgencyLevel(scheduledDate: string, scheduledTime: string | null): "critical" | "urgent" | null {
  const time = scheduledTime?.slice(0, 5) || "10:00";
  const [hours, minutes] = time.split(":").map(Number);
  const pubDate = new Date(scheduledDate);
  pubDate.setHours(hours, minutes, 0, 0);
  
  const now = new Date();
  const hoursUntil = differenceInHours(pubDate, now);
  
  if (hoursUntil <= 6) return "critical";
  if (hoursUntil <= 24) return "urgent";
  return null;
}

function UrgencyDot({ urgency }: { urgency: "critical" | "urgent" | null }) {
  if (!urgency) return null;
  
  return (
    <span 
      className={`inline-block h-2 w-2 rounded-full flex-shrink-0 ${
        urgency === "critical" 
          ? "bg-destructive" 
          : "bg-orange-500"
      }`}
      title={urgency === "critical" ? "< 6h" : "< 24h"}
    />
  );
}

function ScheduledPublicationCard({
  publication,
  onSendToValidation,
  onEdit,
  onClick,
  firmName,
}: {
  publication: Publication;
  onSendToValidation: (id: string) => Promise<void>;
  onEdit: (id: string) => void;
  onClick: () => void;
  firmName?: string;
}) {
  const [loading, setLoading] = useState(false);
  const urgency = getUrgencyLevel(publication.scheduled_date, publication.scheduled_time);

  const handleSendToValidation = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    try {
      await onSendToValidation(publication.id);
      toast.success("Publication envoyée en validation", {
        description: `${publication.platform || "Publication"} du ${format(
          new Date(publication.scheduled_date),
          "d MMMM",
          { locale: fr }
        )}`,
      });
    } catch (error) {
      toast.error("Erreur lors de l'envoi en validation");
    } finally {
      setLoading(false);
    }
  };

  const getPlatformIcon = () => {
    switch (publication.platform) {
      case "linkedin": return "text-blue-600";
      case "facebook": return "text-blue-700";
      case "instagram": return "text-pink-600";
      case "twitter": return "text-slate-800";
      default: return "text-primary";
    }
  };

  return (
    <Card
      className={`group relative cursor-pointer overflow-hidden
        bg-card hover:bg-muted/30
        border border-border/60 hover:border-primary/30
        shadow-sm hover:shadow-md
        transition-all duration-200 ease-out
        ${urgency === "critical" ? "border-l-2 border-l-destructive" : 
          urgency === "urgent" ? "border-l-2 border-l-orange-500" : ""}`}
      onClick={onClick}
    >
      <div className="p-4 space-y-3">
        {/* Row 1: Platform + Urgency + Date/Time */}
        <div className="flex items-center gap-2 text-xs">
          <UrgencyDot urgency={urgency} />
          {publication.platform && (
            <span className={`font-semibold capitalize ${getPlatformIcon()}`}>
              {publication.platform}
            </span>
          )}
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">
            {format(new Date(publication.scheduled_date), "d MMM", { locale: fr })}
          </span>
          <span className="text-muted-foreground">
            {publication.scheduled_time?.slice(0, 5) || "10:00"}
          </span>
        </div>

        {/* Row 2: Firm badge (CM only) */}
        {firmName && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Building2 className="h-3 w-3" />
            <span className="truncate">{firmName}</span>
          </div>
        )}

        {/* Row 3: Content with thumbnail */}
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted/50 flex items-center justify-center">
            {publication.image_url ? (
              <img
                src={publication.image_url}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <FileText className="h-7 w-7 text-muted-foreground/40" />
            )}
          </div>
          <p className="text-sm leading-relaxed text-foreground/90 line-clamp-5 flex-1">
            {publication.content}
          </p>
        </div>

        {/* Row 4: Actions */}
        <div className="flex gap-2 mt-1">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-8 text-xs font-medium
              border-muted-foreground/30 text-muted-foreground hover:bg-muted hover:text-foreground
              transition-colors duration-200"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(publication.id);
            }}
          >
            <Pencil className="h-3 w-3 mr-1" />
            Modifier
          </Button>
          <Button
            size="sm"
            className="flex-1 h-8 text-xs font-medium
              bg-primary text-primary-foreground hover:bg-primary/90
              transition-colors duration-200"
            onClick={handleSendToValidation}
            disabled={loading}
          >
            <Send className="h-3 w-3 mr-1" />
            Soumettre
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function ScheduledPublicationsCarousel({
  publications,
  onSendToValidation,
  onEditPublication,
  onDeletePublication,
  onPublicationClick,
  showFirmBadge = false,
  firmNamesMap,
}: ScheduledPublicationsCarouselProps) {
  const [selectedPub, setSelectedPub] = useState<Publication | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleCardClick = (pub: Publication) => {
    setSelectedPub(pub);
    setSheetOpen(true);
    onPublicationClick(pub);
  };

  const handleSendFromSheet = async () => {
    if (!selectedPub) return;
    setSending(true);
    try {
      await onSendToValidation(selectedPub.id);
      toast.success("Publication envoyée en validation", {
        description: `${selectedPub.platform || "Publication"} du ${format(
          new Date(selectedPub.scheduled_date),
          "d MMMM",
          { locale: fr }
        )}`,
      });
      setSheetOpen(false);
    } catch (error) {
      toast.error("Erreur lors de l'envoi en validation");
    } finally {
      setSending(false);
    }
  };

  const handleDeleteFromSheet = async () => {
    if (!selectedPub || !onDeletePublication) return;
    setDeleting(true);
    try {
      await onDeletePublication(selectedPub.id);
      toast.success("Publication supprimée", {
        description: `${selectedPub.platform || "Publication"} du ${format(
          new Date(selectedPub.scheduled_date),
          "d MMMM",
          { locale: fr }
        )}`,
      });
      setSheetOpen(false);
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    } finally {
      setDeleting(false);
    }
  };

  // Filter and sort scheduled publications
  const scheduledPubs = publications
    .filter((p) => p.status === "programme")
    .sort(
      (a, b) =>
        new Date(a.scheduled_date).getTime() -
        new Date(b.scheduled_date).getTime()
    );

  if (scheduledPubs.length === 0) {
    return (
      <div className="bg-gradient-to-br from-muted/30 to-muted/10 border border-dashed border-muted-foreground/20 rounded-xl p-8 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted/50 flex items-center justify-center">
          <Calendar className="h-6 w-6 text-muted-foreground/50" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          Aucune prise de parole programmée
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Créez-en une ou lancez une campagne éditoriale
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Prises de parole programmées</h3>
            <p className="text-xs text-muted-foreground">En attente de validation</p>
          </div>
        </div>
        <Badge 
          variant="secondary" 
          className="bg-primary/10 text-primary font-semibold px-3"
        >
          {scheduledPubs.length}
        </Badge>
      </div>

      {/* Carousel */}
      <div className="relative px-12">
        <Carousel
          opts={{
            align: "start",
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-3">
            {scheduledPubs.slice(0, 8).map((pub) => (
              <CarouselItem key={pub.id} className="pl-3 basis-[280px]">
                <ScheduledPublicationCard
                  publication={pub}
                  onSendToValidation={onSendToValidation}
                  onEdit={onEditPublication}
                  onClick={() => handleCardClick(pub)}
                  firmName={showFirmBadge && pub.law_firm_id ? firmNamesMap?.get(pub.law_firm_id) : undefined}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        {scheduledPubs.length > 1 && (
          <>
            <CarouselPrevious 
              className="left-0 -translate-x-full h-11 w-11 bg-white dark:bg-card shadow-xl border-0 hover:bg-primary hover:text-primary-foreground transition-all duration-200" 
            />
            <CarouselNext 
              className="right-0 translate-x-full h-11 w-11 bg-white dark:bg-card shadow-xl border-0 hover:bg-primary hover:text-primary-foreground transition-all duration-200" 
            />
          </>
        )}
        </Carousel>
      </div>

      {/* Side panel for full preview */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-[420px] sm:w-[480px] flex flex-col p-0">
          {/* Header with gradient */}
          <div className="relative bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5 px-6 pt-6 pb-4">
            <SheetHeader className="flex-shrink-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                {selectedPub?.platform && (
                  <PlatformBadge platform={selectedPub.platform} />
                )}
                {selectedPub && getUrgencyLevel(selectedPub.scheduled_date, selectedPub.scheduled_time) && (
                  <Badge variant="destructive" className="text-xs">
                    {getUrgencyLevel(selectedPub.scheduled_date, selectedPub.scheduled_time) === "critical" ? "< 6h" : "< 24h"}
                  </Badge>
                )}
              </div>
              <SheetTitle className="text-left flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                Prévisualisation
              </SheetTitle>
            </SheetHeader>

            {/* Date and time chips */}
            <div className="flex items-center gap-3 mt-4">
              <div className="flex items-center gap-1.5 text-sm bg-white/60 dark:bg-card/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="font-medium">
                  {selectedPub &&
                    format(new Date(selectedPub.scheduled_date), "d MMMM yyyy", {
                      locale: fr,
                    })}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-sm bg-white/60 dark:bg-card/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-medium">{selectedPub?.scheduled_time?.slice(0, 5) || "10:00"}</span>
              </div>
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {/* Full image */}
            {selectedPub?.image_url && (
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img
                  src={selectedPub.image_url}
                  alt=""
                  className="w-full object-cover max-h-72"
                />
              </div>
            )}

            {/* Full content */}
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap leading-relaxed text-foreground text-base">
                {selectedPub?.content}
              </p>
            </div>
          </div>

          {/* Actions - fixed at bottom */}
          <div className="p-6 border-t bg-gradient-to-t from-background to-transparent flex-shrink-0 space-y-3">
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-11 text-base font-medium border-muted-foreground/30 hover:bg-muted transition-colors"
                onClick={() => {
                  if (selectedPub) {
                    onEditPublication(selectedPub.id);
                    setSheetOpen(false);
                  }
                }}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Modifier
              </Button>
              <Button
                className="flex-1 h-11 text-base font-medium shadow-lg hover:shadow-xl transition-all"
                onClick={handleSendFromSheet}
                disabled={sending}
              >
                <Send className="h-4 w-4 mr-2" />
                {sending ? "Envoi..." : "Soumettre"}
              </Button>
            </div>
            
            {onDeletePublication && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full h-9 text-sm font-medium text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                    disabled={deleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {deleting ? "Suppression..." : "Supprimer cette publication"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer cette publication ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est irréversible. La publication programmée pour le{" "}
                      {selectedPub && format(new Date(selectedPub.scheduled_date), "d MMMM yyyy", { locale: fr })}{" "}
                      sera définitivement supprimée.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={handleDeleteFromSheet}
                    >
                      Supprimer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
