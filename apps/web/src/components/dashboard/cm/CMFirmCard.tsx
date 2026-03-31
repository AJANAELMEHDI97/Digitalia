import { Building2, ChevronRight, Clock, CalendarCheck, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LawFirm } from "@/contexts/LawFirmContext";

const FIRM_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
];

interface CMFirmCardProps {
  firm: LawFirm;
  pending: number;
  scheduled: number;
  drafts: number;
  published: number;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}

export function CMFirmCard({
  firm,
  pending,
  scheduled,
  drafts,
  published,
  index,
  isSelected,
  onSelect,
}: CMFirmCardProps) {
  const colorClass = FIRM_COLORS[index % FIRM_COLORS.length];

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md hover:border-primary/30 ${
        isSelected ? 'ring-2 ring-primary border-primary' : ''
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center`}>
              {firm.logo_url ? (
                <img 
                  src={firm.logo_url} 
                  alt={firm.name} 
                  className="w-8 h-8 rounded object-cover"
                />
              ) : (
                <span className="text-white font-semibold text-sm">
                  {firm.name.substring(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-sm line-clamp-1">{firm.name}</h3>
              {firm.city && (
                <p className="text-xs text-muted-foreground">{firm.city}</p>
              )}
            </div>
          </div>
          {isSelected && (
            <Badge variant="default" className="text-[10px] px-1.5 py-0.5">
              Actif
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <div className="flex items-center justify-center gap-1 text-amber-600 mb-0.5">
              <Clock className="h-3 w-3" />
              <span className="font-semibold text-sm">{pending}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">À valider</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <div className="flex items-center justify-center gap-1 text-blue-600 mb-0.5">
              <CalendarCheck className="h-3 w-3" />
              <span className="font-semibold text-sm">{scheduled}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Programmées</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">
              <FileText className="h-3 w-3" />
              <span className="font-semibold text-sm">{drafts}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Brouillons</p>
          </div>
        </div>

        {/* Action */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-between text-xs h-8"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          <span>Voir le calendrier</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </CardContent>
    </Card>
  );
}
