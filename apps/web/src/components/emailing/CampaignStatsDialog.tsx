import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, Users, Mail, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CampaignStatsOverview } from "./CampaignStatsOverview";
import { CampaignRecipientsTable } from "./CampaignRecipientsTable";
import type { EmailCampaign, EmailRecipient } from "@/hooks/useEmailing";

interface CampaignStatsDialogProps {
  campaign: EmailCampaign | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fetchRecipients: (campaignId: string) => Promise<EmailRecipient[]>;
}

const getOverallPerformance = (campaign: EmailCampaign) => {
  const sentCount = campaign.sent_count || 0;
  const openRate = sentCount > 0 ? (campaign.opened_count / sentCount) * 100 : 0;
  const clickRate = sentCount > 0 ? (campaign.clicked_count / sentCount) * 100 : 0;

  // Score based on open rate (60%) and click rate (40%)
  const score = openRate * 0.6 + clickRate * 8; // click rate weighted more heavily

  if (score >= 20) return { label: "Excellente", color: "text-green-600", bg: "bg-green-100", icon: TrendingUp };
  if (score >= 12) return { label: "Bonne", color: "text-amber-600", bg: "bg-amber-100", icon: Minus };
  return { label: "À améliorer", color: "text-red-600", bg: "bg-red-100", icon: TrendingDown };
};

export function CampaignStatsDialog({
  campaign,
  open,
  onOpenChange,
  fetchRecipients,
}: CampaignStatsDialogProps) {
  const [recipients, setRecipients] = useState<EmailRecipient[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && campaign) {
      setLoading(true);
      fetchRecipients(campaign.id)
        .then(setRecipients)
        .finally(() => setLoading(false));
    } else {
      setRecipients([]);
    }
  }, [open, campaign, fetchRecipients]);

  if (!campaign) return null;

  const performance = getOverallPerformance(campaign);
  const PerfIcon = performance.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between pr-6">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Mail className="h-5 w-5" />
                {campaign.name}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <span>
                  {campaign.sent_at
                    ? `Envoyée le ${format(new Date(campaign.sent_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}`
                    : `Créée le ${format(new Date(campaign.created_at), "d MMMM yyyy", { locale: fr })}`}
                </span>
              </div>
            </div>
            <Badge className={`${performance.bg} ${performance.color} border-0 gap-1`}>
              <PerfIcon className="h-3 w-3" />
              {performance.label}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="recipients" className="gap-2">
              <Users className="h-4 w-4" />
              Destinataires
              <Badge variant="secondary" className="ml-1">
                {campaign.total_recipients}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            {loading ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-24" />
                  ))}
                </div>
                <Skeleton className="h-16" />
                <Skeleton className="h-[200px]" />
              </div>
            ) : (
              <CampaignStatsOverview campaign={campaign} recipients={recipients} />
            )}
          </TabsContent>

          <TabsContent value="recipients" className="mt-4">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-10" />
                <Skeleton className="h-8" />
                <Skeleton className="h-[300px]" />
              </div>
            ) : (
              <CampaignRecipientsTable recipients={recipients} />
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
