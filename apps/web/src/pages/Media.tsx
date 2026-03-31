import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Image, FolderOpen, CheckCircle2, Filter, Info } from "lucide-react";
import { MediaFilters } from "@/components/media/MediaFilters";
import { MediaCard } from "@/components/media/MediaCard";
import { MediaDetailSheet } from "@/components/media/MediaDetailSheet";
import { AIMediaGenerator } from "@/components/media/AIMediaGenerator";
import { MOCK_MEDIA, type MediaItem } from "@/data/mockMedia";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Media() {
  const [selectedThematic, setSelectedThematic] = useState<MediaItem['thematic'] | 'all'>('all');
  const [selectedContentType, setSelectedContentType] = useState<'all' | 'post' | 'article'>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | 'linkedin' | 'instagram' | 'facebook' | 'twitter'>('all');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);

  const filteredMedia = useMemo(() => {
    return MOCK_MEDIA.filter((media) => {
      if (selectedThematic !== 'all' && media.thematic !== selectedThematic) return false;
      if (selectedContentType !== 'all' && !media.contentTypes.includes(selectedContentType)) return false;
      if (selectedPlatform !== 'all' && !media.platforms.includes(selectedPlatform)) return false;
      return true;
    });
  }, [selectedThematic, selectedContentType, selectedPlatform]);

  const handleViewDetails = (media: MediaItem) => {
    setSelectedMedia(media);
    setDetailSheetOpen(true);
  };

  const totalUsage = MOCK_MEDIA.reduce((sum, m) => sum + m.usageCount, 0);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Image className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Centre de ressources</h1>
              <p className="text-muted-foreground mt-1">
                Visuels validés et conformes pour vos prises de parole
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border/50 bg-card">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Visuels conformes</p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 text-muted-foreground/50 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[220px] text-xs">
                        <p>Visuels respectant les standards de communication professionnelle des avocats.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-2xl font-bold tabular-nums mt-0.5">{MOCK_MEDIA.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <FolderOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Thématiques</p>
                <p className="text-2xl font-bold tabular-nums mt-0.5">7</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-500/10">
                <Image className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Utilisations totales</p>
                <p className="text-2xl font-bold tabular-nums mt-0.5">{totalUsage}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Filters */}
            <Card className="border-border/50 bg-card">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">Filtres</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <MediaFilters
                  selectedThematic={selectedThematic}
                  selectedContentType={selectedContentType}
                  selectedPlatform={selectedPlatform}
                  onThematicChange={setSelectedThematic}
                  onContentTypeChange={setSelectedContentType}
                  onPlatformChange={setSelectedPlatform}
                />
              </CardContent>
            </Card>

            {/* AI Generator */}
            <AIMediaGenerator />
          </div>

          {/* Media Grid */}
          <div className="lg:col-span-3 space-y-6">
            {/* Results header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold">Bibliothèque</h2>
                <Badge variant="secondary" className="text-xs">
                  {filteredMedia.length} média{filteredMedia.length > 1 ? 's' : ''}
                </Badge>
              </div>
              {(selectedThematic !== 'all' || selectedContentType !== 'all' || selectedPlatform !== 'all') && (
                <button
                  onClick={() => {
                    setSelectedThematic('all');
                    setSelectedContentType('all');
                    setSelectedPlatform('all');
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>

            {/* Grid */}
            {filteredMedia.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredMedia.map((media) => (
                  <MediaCard
                    key={media.id}
                    media={media}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            ) : (
              <Card className="border-border/50 bg-card">
                <CardContent className="py-16 text-center">
                  <div className="p-4 rounded-full bg-muted inline-flex mb-4">
                    <Image className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-1">Aucun média trouvé</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    Aucun média ne correspond aux filtres sélectionnés. 
                    Essayez d'élargir vos critères de recherche.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Detail Sheet */}
      <MediaDetailSheet
        media={selectedMedia}
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
      />
    </AppLayout>
  );
}
