import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Eye, 
  XCircle, 
  FileText, 
  CalendarDays, 
  Scale,
  Newspaper,
  Info
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function StrategicCalendarLegend() {
  return (
    <div className="flex flex-wrap gap-6 text-sm">
      {/* Publications */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground font-medium">Publications :</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-muted" />
            <span className="text-xs text-muted-foreground">Brouillon</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-amber-200 dark:bg-amber-800" />
            <span className="text-xs text-muted-foreground">À valider</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-200 dark:bg-emerald-800" />
            <span className="text-xs text-muted-foreground">Programmé</span>
          </div>
        </div>
      </div>

      {/* Blog */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Newspaper className="h-4 w-4 text-purple-600" />
          <span className="text-muted-foreground font-medium">Blog</span>
        </div>
      </div>

      {/* Key dates */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground font-medium">Dates clés :</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[hsl(var(--keydate-text))]" />
          <span className="text-xs text-muted-foreground">Événement juridique</span>
        </div>
      </div>

      {/* Judicial events */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Scale className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground font-medium">Actualité :</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="h-3 w-3 text-emerald-600" />
            <span className="text-xs text-muted-foreground">Opportun</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Eye className="h-3 w-3 text-amber-600" />
            <span className="text-xs text-muted-foreground">À surveiller</span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 cursor-help">
                  <XCircle className="h-3 w-3 text-red-600" />
                  <span className="text-xs text-muted-foreground">À éviter</span>
                  <Info className="h-3 w-3 text-muted-foreground/50" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[220px] text-xs">
                <p>Sujets sensibles pouvant nuire à votre image professionnelle.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
