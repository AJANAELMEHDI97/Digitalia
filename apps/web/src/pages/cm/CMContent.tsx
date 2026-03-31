import { useState } from "react";
import { usePublications } from "@/hooks/usePublications";
import { useLawFirmContextSafe } from "@/contexts/LawFirmContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlatformBadge } from "@/components/ui/platform-badge";
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  PenSquare,
  Calendar,
  Filter,
  Building2
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";

/**
 * Bibliothèque de contenus pour les Community Managers
 * Affiche brouillons, programmés et publiés avec filtres
 */
export default function CMContent() {
  const { publications, loading } = usePublications();
  const { assignedFirms, selectedFirmId, setSelectedFirmId } = useLawFirmContextSafe();
  const [platformFilter, setPlatformFilter] = useState<string>("all");

  // Filtrer par plateforme
  const filteredPublications = publications.filter(pub => {
    if (platformFilter === "all") return true;
    return pub.platform === platformFilter;
  });

  // Séparer par statut
  const drafts = filteredPublications.filter(p => p.status === 'brouillon');
  const scheduled = filteredPublications.filter(p => p.status === 'programme' || p.status === 'a_valider');
  const published = filteredPublications.filter(p => p.status === 'publie');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'brouillon':
        return <Badge variant="outline" className="gap-1"><FileText className="h-3 w-3" />Brouillon</Badge>;
      case 'programme':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Programmé</Badge>;
      case 'a_valider':
        return <Badge className="gap-1 bg-amber-500"><Clock className="h-3 w-3" />À valider</Badge>;
      case 'publie':
        return <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle2 className="h-3 w-3" />Publié</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderPublicationCard = (pub: typeof publications[0]) => (
    <Card key={pub.id} className="hover:shadow-md transition-shadow">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {pub.platform && <PlatformBadge platform={pub.platform} />}
              {getStatusBadge(pub.status)}
            </div>
            
            {pub.title && (
              <h4 className="font-medium truncate mb-1">{pub.title}</h4>
            )}
            
            <p className="text-sm text-muted-foreground line-clamp-2">
              {pub.content}
            </p>
            
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(pub.scheduled_date), 'dd MMM yyyy', { locale: fr })}
              </span>
              {pub.scheduled_time && (
                <span>{pub.scheduled_time}</span>
              )}
            </div>
          </div>
          
          {pub.image_url && (
            <img 
              src={pub.image_url} 
              alt="" 
              className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
            />
          )}
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/editor?id=${pub.id}`}>
              <PenSquare className="h-4 w-4 mr-1" />
              Modifier
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderEmptyState = (message: string) => (
    <div className="py-12 text-center text-muted-foreground">
      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
      <p>{message}</p>
      <Button variant="outline" className="mt-4" asChild>
        <Link to="/editor">
          <PenSquare className="h-4 w-4 mr-2" />
          Créer un post
        </Link>
      </Button>
    </div>
  );

  return (
    <AppLayout>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bibliothèque de contenus</h1>
          <p className="text-muted-foreground">
            {filteredPublications.length} publication{filteredPublications.length > 1 ? 's' : ''}
          </p>
        </div>
        
        <Button asChild>
          <Link to="/editor">
            <PenSquare className="h-4 w-4 mr-2" />
            Créer un post
          </Link>
        </Button>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtres :</span>
            </div>
            
            {/* Filtre cabinet */}
            <Select value={selectedFirmId || "all"} onValueChange={(v) => setSelectedFirmId(v === "all" ? null : v)}>
              <SelectTrigger className="w-[200px]">
                <Building2 className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Tous les cabinets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les cabinets</SelectItem>
                {assignedFirms.map((firm) => (
                  <SelectItem key={firm.id} value={firm.id}>{firm.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Filtre plateforme */}
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Toutes les plateformes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les plateformes</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="twitter">X (Twitter)</SelectItem>
                <SelectItem value="google_business">Google Business</SelectItem>
                <SelectItem value="blog">Blog</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs par statut */}
      <Tabs defaultValue="drafts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="drafts" className="gap-2">
            <FileText className="h-4 w-4" />
            Brouillons ({drafts.length})
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="gap-2">
            <Clock className="h-4 w-4" />
            Programmés ({scheduled.length})
          </TabsTrigger>
          <TabsTrigger value="published" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Publiés ({published.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="drafts" className="mt-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="h-24" />
                </Card>
              ))}
            </div>
          ) : drafts.length === 0 ? (
            renderEmptyState("Aucun brouillon")
          ) : (
            <div className="space-y-4">
              {drafts.map(renderPublicationCard)}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="scheduled" className="mt-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="h-24" />
                </Card>
              ))}
            </div>
          ) : scheduled.length === 0 ? (
            renderEmptyState("Aucune publication programmée")
          ) : (
            <div className="space-y-4">
              {scheduled.map(renderPublicationCard)}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="published" className="mt-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="h-24" />
                </Card>
              ))}
            </div>
          ) : published.length === 0 ? (
            renderEmptyState("Aucune publication publiée")
          ) : (
            <div className="space-y-4">
              {published.map(renderPublicationCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </AppLayout>
  );
}
