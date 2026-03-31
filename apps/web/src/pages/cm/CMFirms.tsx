import { useState, useMemo } from "react";
import { useLawFirmContextSafe } from "@/contexts/LawFirmContext";
import { useCMWorkspace } from "@/hooks/useCMWorkspace";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, MapPin, Phone, Mail, Globe, CheckCircle2, Settings, Search, X, Scale, SearchX, AlertCircle, Briefcase, Info } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useNavigate } from "react-router-dom";
import { CMFirmInfoDrawer } from "@/components/cm/CMFirmInfoDrawer";
import { LawFirm } from "@/contexts/LawFirmContext";

// Status labels in French
const statusLabels: Record<string, string> = {
  'blocked': 'Bloqué',
  'attention': 'Attention requise',
  'ok': 'OK'
};

/**
 * Page "Mes Cabinets" pour les Community Managers
 * Affiche la liste des cabinets assignés avec possibilité de changer de contexte
 */
export default function CMFirms() {
  const { assignedFirms, selectedFirmId, setSelectedFirmId, isLoading } = useLawFirmContextSafe();
  const { firmStats, isLoading: statsLoading } = useCMWorkspace();
  const navigate = useNavigate();
  const [infoFirm, setInfoFirm] = useState<LawFirm | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [barFilter, setBarFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [specializationFilter, setSpecializationFilter] = useState<string | null>(null);

  console.log("CMFirms - assignedFirms:", assignedFirms.length, "selectedFirmId:", selectedFirmId);

  // Extract unique bar associations
  const uniqueBars = useMemo(() => 
    [...new Set(assignedFirms.map(f => f.bar_association).filter(Boolean))].sort() as string[],
  [assignedFirms]);

  // Extract unique specializations from all firms
  const uniqueSpecializations = useMemo(() => {
    const allSpecs = assignedFirms.flatMap(f => f.specialization_areas || []);
    return [...new Set(allSpecs)].sort();
  }, [assignedFirms]);

  // Get firm status from firmStats
  const getFirmStatus = (firmId: string): string | undefined => {
    const stats = firmStats.find(s => s.firm.id === firmId);
    return stats?.status;
  };

  // Filter firms based on search and filters
  const filteredFirms = useMemo(() => {
    return assignedFirms.filter(firm => {
      // Text search
      const matchesSearch = !searchQuery || 
        firm.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Bar association filter
      const matchesBar = !barFilter || firm.bar_association === barFilter;
      
      // Status filter (via firmStats)
      const firmStatus = getFirmStatus(firm.id);
      const matchesStatus = !statusFilter || firmStatus === statusFilter;
      
      // Specialization filter
      const matchesSpec = !specializationFilter || 
        (firm.specialization_areas || []).includes(specializationFilter);
      
      return matchesSearch && matchesBar && matchesStatus && matchesSpec;
    });
  }, [assignedFirms, searchQuery, barFilter, statusFilter, specializationFilter, firmStats]);

  const hasActiveFilters = searchQuery || barFilter || statusFilter || specializationFilter;

  const resetFilters = () => {
    setSearchQuery("");
    setBarFilter(null);
    setStatusFilter(null);
    setSpecializationFilter(null);
  };

  const handleSelectFirm = (firmId: string) => {
    console.log("Selecting firm:", firmId);
    setSelectedFirmId(firmId);
    navigate('/calendar', { state: { viewMode: 'firm' } });
  };

  const handleViewDetails = (firmId: string) => {
    setSelectedFirmId(firmId);
    navigate('/cm/firm-settings');
  };

  // Status badge component
  const StatusBadge = ({ firmId }: { firmId: string }) => {
    const status = getFirmStatus(firmId);
    if (!status || statsLoading) return null;

    const variants: Record<string, { variant: "destructive" | "secondary" | "outline"; className: string }> = {
      'blocked': { variant: 'destructive', className: '' },
      'attention': { variant: 'secondary', className: 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100' },
      'ok': { variant: 'outline', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
    };

    const config = variants[status] || variants['ok'];

    return (
      <Badge variant={config.variant} className={config.className}>
        {statusLabels[status] || status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Mes Cabinets</h1>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="h-24 bg-muted" />
                <CardContent className="space-y-2 pt-4">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (assignedFirms.length === 0) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Mes Cabinets</h1>
          <Card className="py-12">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Aucun cabinet assigné</h3>
              <p className="text-muted-foreground mt-2">
                Vous n'avez pas encore de cabinet assigné. Contactez votre administrateur.
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Mes Cabinets</h1>
          <p className="text-muted-foreground max-w-2xl">
            Gérez les cabinets d'avocats qui vous sont assignés. Sélectionnez un cabinet pour travailler sur son contenu éditorial, ou accédez à ses paramètres pour proposer des modifications.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un cabinet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {uniqueBars.length > 0 && (
            <Select 
              value={barFilter || "all"} 
              onValueChange={(value) => setBarFilter(value === "all" ? null : value)}
            >
              <SelectTrigger className="w-[180px]">
                <Scale className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Tous les barreaux" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les barreaux</SelectItem>
                {uniqueBars.map((bar) => (
                  <SelectItem key={bar} value={bar}>{bar}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select 
            value={statusFilter || "all"} 
            onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}
          >
            <SelectTrigger className="w-[180px]">
              <AlertCircle className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="blocked">Bloqué</SelectItem>
              <SelectItem value="attention">Attention requise</SelectItem>
              <SelectItem value="ok">OK</SelectItem>
            </SelectContent>
          </Select>

          {uniqueSpecializations.length > 0 && (
            <Select 
              value={specializationFilter || "all"} 
              onValueChange={(value) => setSpecializationFilter(value === "all" ? null : value)}
            >
              <SelectTrigger className="w-[200px]">
                <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Toutes spécialisations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes spécialisations</SelectItem>
                {uniqueSpecializations.map((spec) => (
                  <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1">
              <X className="h-4 w-4" />
              Réinitialiser
            </Button>
          )}
        </div>

        {/* Results counter */}
        <p className="text-sm text-muted-foreground">
          {filteredFirms.length} cabinet{filteredFirms.length > 1 ? 's' : ''} affiché{filteredFirms.length > 1 ? 's' : ''} sur {assignedFirms.length}
        </p>

        {/* Empty state when no results */}
        {filteredFirms.length === 0 ? (
          <Card className="py-12">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <SearchX className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Aucun cabinet trouvé</h3>
              <p className="text-muted-foreground mt-2">
                Aucun cabinet ne correspond à vos critères de recherche.
              </p>
              <Button variant="outline" className="mt-4" onClick={resetFilters}>
                Réinitialiser les filtres
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredFirms.map((firm) => {
              const isSelected = selectedFirmId === firm.id;
              
              return (
                <Card 
                  key={firm.id} 
                  className={`transition-all hover:shadow-md ${
                    isSelected ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{firm.name}</CardTitle>
                        {firm.bar_association && (
                          <CardDescription className="truncate">{firm.bar_association}</CardDescription>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => { e.stopPropagation(); setInfoFirm(firm); }}
                          title="Info cabinet"
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                        <StatusBadge firmId={firm.id} />
                        {isSelected && (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Actif
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {firm.city && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{firm.city}{firm.postal_code ? `, ${firm.postal_code}` : ''}</span>
                      </div>
                    )}
                    
                    {firm.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{firm.phone}</span>
                      </div>
                    )}
                    
                    {firm.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{firm.email}</span>
                      </div>
                    )}
                    
                    {firm.website_url && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Globe className="h-4 w-4" />
                        <span className="truncate">{firm.website_url}</span>
                      </div>
                    )}

                    {/* Specializations tags */}
                    {firm.specialization_areas && firm.specialization_areas.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {firm.specialization_areas.slice(0, 3).map((spec) => (
                          <Badge key={spec} variant="outline" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                        {firm.specialization_areas.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{firm.specialization_areas.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="pt-3 flex gap-2">
                      <Button 
                        variant={isSelected ? "secondary" : "outline"} 
                        className="flex-1"
                        onClick={() => handleSelectFirm(firm.id)}
                      >
                        {isSelected ? 'Sélectionné' : 'Sélectionner'}
                      </Button>
                      <Button 
                        variant="default"
                        size="icon"
                        onClick={() => handleViewDetails(firm.id)}
                        title="Voir les détails et modifier"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <CMFirmInfoDrawer
        firm={infoFirm}
        firmStats={infoFirm ? firmStats.find(s => s.firm.id === infoFirm.id) : undefined}
        open={!!infoFirm}
        onOpenChange={(v) => { if (!v) setInfoFirm(null); }}
        onNavigate={(path) => { if (infoFirm) setSelectedFirmId(infoFirm.id); navigate(path); }}
      />
    </AppLayout>
  );
}