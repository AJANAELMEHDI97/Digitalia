import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Calendar,
  FileText,
  Target,
  Building2,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { GeneratedPublication, CampaignConfig, EDITORIAL_TONES, FREQUENCIES } from "@/hooks/useEditorialCampaign";

interface CampaignConfirmStepProps {
  publications: GeneratedPublication[];
  config: CampaignConfig | null;
  onConfirm: () => void;
  onBack: () => void;
  isInserting: boolean;
}

export function CampaignConfirmStep({
  publications,
  config,
  onConfirm,
  onBack,
  isInserting,
}: CampaignConfirmStepProps) {
  const groupedByDate = publications.reduce((acc, pub) => {
    const date = pub.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(pub);
    return acc;
  }, {} as Record<string, GeneratedPublication[]>);

  const byPlatform = publications.reduce((acc, pub) => {
    acc[pub.platform] = (acc[pub.platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byThematic = publications.reduce((acc, pub) => {
    acc[pub.thematic] = (acc[pub.thematic] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const uniqueFirms = new Set(publications.map(p => p.firmName).filter(Boolean));

  const formatDateLabel = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "EEEE d MMMM yyyy", { locale: fr });
    } catch {
      return dateStr;
    }
  };

  const tonLabel = EDITORIAL_TONES.find(t => t.id === config?.tone)?.label || config?.tone;

  return (
    <div className="flex flex-col h-full">
      {/* Récapitulatif */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Publications
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <p className="text-2xl font-bold">{publications.length}</p>
            <p className="text-xs text-muted-foreground">
              sur {Object.keys(groupedByDate).length} jours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Période
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <p className="text-sm font-medium">
              {config?.startDate && format(config.startDate, "d MMM", { locale: fr })}
              {" - "}
              {config?.endDate && format(config.endDate, "d MMM yyyy", { locale: fr })}
            </p>
            <p className="text-xs text-muted-foreground">
              Ton : {tonLabel}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Répartition
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="flex flex-wrap gap-1">
              {Object.entries(byPlatform).map(([platform, count]) => (
                <Badge key={platform} variant="secondary" className="text-xs">
                  {platform}: {count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cabinets concernés */}
      {uniqueFirms.size > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            {uniqueFirms.size} cabinet{uniqueFirms.size > 1 ? "s" : ""} concerné{uniqueFirms.size > 1 ? "s" : ""}
          </h4>
          <div className="flex flex-wrap gap-2">
            {Array.from(uniqueFirms).map((name) => (
              <Badge key={name} variant="outline">{name}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Thématiques */}
      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2">Thématiques couvertes</h4>
        <div className="flex flex-wrap gap-2">
          {Object.entries(byThematic).map(([thematic, count]) => (
            <Badge key={thematic} variant="outline">
              {thematic} ({count})
            </Badge>
          ))}
        </div>
      </div>

      <Separator className="my-4" />

      {/* Liste résumée par date */}
      <ScrollArea className="flex-1">
        <div className="space-y-4">
          {Object.entries(groupedByDate)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, pubs]) => (
              <div key={date}>
                <h4 className="text-sm font-medium capitalize mb-2">
                  {formatDateLabel(date)}
                </h4>
                <div className="space-y-1 pl-4 border-l-2 border-primary/20">
                  {pubs.map((pub, i) => (
                    <div key={i} className="text-sm flex items-center gap-2">
                      <span className="text-muted-foreground">{pub.time}</span>
                      <Badge variant="outline" className="text-xs">
                        {pub.platform}
                      </Badge>
                      <span className="truncate">{pub.title}</span>
                      {pub.firmName && (
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {pub.firmName}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </ScrollArea>

      <Separator className="my-4" />

      <div className="bg-muted/50 rounded-lg p-3 mb-4">
        <p className="text-sm text-muted-foreground">
          <CheckCircle2 className="inline h-4 w-4 mr-1 text-amber-500" />
          Toutes les publications seront créées avec le statut{" "}
          <strong>"À valider"</strong>. L'avocat devra les valider avant publication.
        </p>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <Button onClick={onConfirm} disabled={isInserting}>
          {isInserting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Insertion en cours...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Créer les {publications.length} publications
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
