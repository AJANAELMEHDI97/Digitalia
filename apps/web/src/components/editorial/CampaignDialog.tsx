import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CampaignConfigStep } from "./CampaignConfigStep";
import { CampaignPreviewStep } from "./CampaignPreviewStep";
import { CampaignConfirmStep } from "./CampaignConfirmStep";
import {
  useEditorialCampaign,
  CampaignConfig,
} from "@/hooks/useEditorialCampaign";
import { Settings2, Eye, CheckCircle2, Sparkles } from "lucide-react";

interface CampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CampaignDialog({
  open,
  onOpenChange,
  onSuccess,
}: CampaignDialogProps) {
  const [activeTab, setActiveTab] = useState("config");
  const [config, setConfig] = useState<CampaignConfig | null>(null);

  const {
    isGenerating,
    isInserting,
    publications,
    generationProgress,
    generatePlan,
    togglePublicationSelection,
    removePublication,
    updatePublicationContent,
    insertPublications,
    setPublications,
  } = useEditorialCampaign();

  const handleGenerate = async (newConfig: CampaignConfig) => {
    setConfig(newConfig);
    const result = await generatePlan(newConfig);
    if (result.length > 0) {
      setActiveTab("preview");
    }
  };

  const handleConfirm = async () => {
    const success = await insertPublications();
    if (success) {
      setActiveTab("config");
      setConfig(null);
      onOpenChange(false);
      onSuccess?.();
    }
  };

  const handleClose = () => {
    setActiveTab("config");
    setConfig(null);
    setPublications([]);
    onOpenChange(false);
  };

  const selectedCount = publications.filter((p) => p.selected).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[820px] max-h-[90vh] overflow-hidden flex flex-col px-6 sm:px-8 pt-6 sm:pt-8 mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Générer les prises de parole du mois
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              Configuration
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              disabled={publications.length === 0}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Aperçu ({publications.length})
            </TabsTrigger>
            <TabsTrigger
              value="confirm"
              disabled={selectedCount === 0}
              className="flex items-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Confirmation ({selectedCount})
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto mt-4">
            <TabsContent value="config" className="m-0 h-full">
              <CampaignConfigStep
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                initialConfig={config}
                generationProgress={generationProgress}
              />
            </TabsContent>

            <TabsContent value="preview" className="m-0 h-full">
              <CampaignPreviewStep
                publications={publications}
                onToggleSelection={togglePublicationSelection}
                onRemove={removePublication}
                onUpdateContent={updatePublicationContent}
                onRegenerate={() => config && handleGenerate(config)}
                onNext={() => setActiveTab("confirm")}
                isGenerating={isGenerating}
              />
            </TabsContent>

            <TabsContent value="confirm" className="m-0 h-full">
              <CampaignConfirmStep
                publications={publications.filter((p) => p.selected)}
                config={config}
                onConfirm={handleConfirm}
                onBack={() => setActiveTab("preview")}
                isInserting={isInserting}
              />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
