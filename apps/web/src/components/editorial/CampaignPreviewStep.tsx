import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  RefreshCw,
  ArrowRight,
  Building2,
} from "lucide-react";
import { GeneratedPublication } from "@/hooks/useEditorialCampaign";
import { PostExpandedPreview } from "./PostExpandedPreview";

interface CampaignPreviewStepProps {
  publications: GeneratedPublication[];
  onToggleSelection: (index: number) => void;
  onRemove: (index: number) => void;
  onRegenerate: () => void;
  onNext: () => void;
  onUpdateContent?: (index: number, content: string) => void;
  isGenerating: boolean;
}

export function CampaignPreviewStep({
  publications,
  onToggleSelection,
  onRemove,
  onRegenerate,
  onNext,
  onUpdateContent,
  isGenerating,
}: CampaignPreviewStepProps) {
  const selectedCount = publications.filter((p) => p.selected).length;
  
  const firmGroups = useMemo(() => {
    const groups = new Map<string, { name: string; pubs: { pub: GeneratedPublication; globalIndex: number }[] }>();
    publications.forEach((pub, i) => {
      const key = pub.firmId || "_default";
      if (!groups.has(key)) {
        groups.set(key, { name: pub.firmName || "Mon cabinet", pubs: [] });
      }
      groups.get(key)!.pubs.push({ pub, globalIndex: i });
    });
    return groups;
  }, [publications]);

  const hasMultipleFirms = firmGroups.size > 1;
  const [activeFirmTab, setActiveFirmTab] = useState<string>(
    Array.from(firmGroups.keys())[0] || "_default"
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          {selectedCount} / {publications.length} sélectionnées
          {hasMultipleFirms && (
            <span className="ml-2">· {firmGroups.size} cabinets</span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRegenerate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Régénérer
        </Button>
      </div>

      {/* Content: tabs if multiple firms, list if single */}
      <ScrollArea className="flex-1 pr-2">
        {hasMultipleFirms ? (
          <Tabs value={activeFirmTab} onValueChange={setActiveFirmTab}>
            <TabsList className="mb-3 flex-wrap h-auto gap-1">
              {Array.from(firmGroups.entries()).map(([key, group]) => (
                <TabsTrigger key={key} value={key} className="text-xs gap-1.5">
                  <Building2 className="h-3 w-3" />
                  {group.name}
                  <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                    {group.pubs.length}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
            {Array.from(firmGroups.entries()).map(([key, group]) => (
              <TabsContent key={key} value={key} className="space-y-3 m-0">
                {group.pubs.map(({ pub, globalIndex }) => (
                  <PostExpandedPreview
                    key={globalIndex}
                    publication={pub}
                    index={globalIndex}
                    onToggleSelection={onToggleSelection}
                    onRemove={onRemove}
                    onUpdateContent={onUpdateContent}
                  />
                ))}
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="space-y-3">
            {publications.map((pub, index) => (
              <PostExpandedPreview
                key={index}
                publication={pub}
                index={index}
                onToggleSelection={onToggleSelection}
                onRemove={onRemove}
                onUpdateContent={onUpdateContent}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      <Separator className="my-4" />

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={selectedCount === 0}>
          Continuer
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
