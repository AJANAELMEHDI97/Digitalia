import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Send, Trash2, BarChart3, Clock, CheckCircle, XCircle, Users, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CampaignStatsDialog } from "./CampaignStatsDialog";
import type { EmailCampaign, EmailTemplate, ContactList, EmailRecipient } from "@/hooks/useEmailing";

interface CampaignsTabProps {
  campaigns: EmailCampaign[];
  templates: EmailTemplate[];
  contactLists: ContactList[];
  onCreateCampaign: (data: { name: string; template_id?: string }) => Promise<EmailCampaign | null>;
  onUpdateCampaign: (id: string, data: Partial<EmailCampaign>) => Promise<boolean>;
  onDeleteCampaign: (id: string) => Promise<boolean>;
  fetchCampaignRecipients: (campaignId: string) => Promise<EmailRecipient[]>;
}

const statusConfig: Record<string, { label: string; icon: React.ReactNode; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  draft: { label: "Brouillon", icon: <Clock className="h-3 w-3" />, variant: "secondary" },
  scheduled: { label: "Programmée", icon: <Clock className="h-3 w-3" />, variant: "outline" },
  sending: { label: "En cours", icon: <Send className="h-3 w-3" />, variant: "default" },
  sent: { label: "Envoyée", icon: <CheckCircle className="h-3 w-3" />, variant: "default" },
  failed: { label: "Échec", icon: <XCircle className="h-3 w-3" />, variant: "destructive" },
};

const getPerformanceBadge = (campaign: EmailCampaign) => {
  const sentCount = campaign.sent_count || 0;
  if (sentCount === 0) return null;
  
  const openRate = (campaign.opened_count / sentCount) * 100;
  
  if (openRate >= 25) return { label: "Excellent", color: "text-green-600", bg: "bg-green-100", icon: TrendingUp };
  if (openRate >= 15) return { label: "Bon", color: "text-amber-600", bg: "bg-amber-100", icon: Minus };
  return { label: "À améliorer", color: "text-red-600", bg: "bg-red-100", icon: TrendingDown };
};

export function CampaignsTab({
  campaigns,
  templates,
  onCreateCampaign,
  onDeleteCampaign,
  fetchCampaignRecipients,
}: CampaignsTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", template_id: "" });
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);
  const [statsOpen, setStatsOpen] = useState(false);

  const handleCreate = async () => {
    if (!formData.name.trim()) return;
    await onCreateCampaign({
      name: formData.name,
      template_id: formData.template_id || undefined,
    });
    setFormData({ name: "", template_id: "" });
    setDialogOpen(false);
  };

  const handleViewStats = (campaign: EmailCampaign) => {
    setSelectedCampaign(campaign);
    setStatsOpen(true);
  };

  const getTemplate = (templateId: string | null) => {
    if (!templateId) return null;
    return templates.find((t) => t.id === templateId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Campagnes</h2>
          <p className="text-sm text-muted-foreground">Gérez vos campagnes d'emailing</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle campagne
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Send className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune campagne</h3>
            <p className="text-sm text-muted-foreground mb-4">Créez votre première campagne d'emailing</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer une campagne
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campagne</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-center">Destinataires</TableHead>
                <TableHead className="text-center">Ouverts</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => {
                const status = statusConfig[campaign.status] || statusConfig.draft;
                const template = getTemplate(campaign.template_id);
                const openRate = campaign.sent_count > 0 
                  ? Math.round((campaign.opened_count / campaign.sent_count) * 100) 
                  : 0;
                const perf = getPerformanceBadge(campaign);

                return (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <div className="font-medium">{campaign.name}</div>
                    </TableCell>
                    <TableCell>
                      {template ? (
                        <span className="text-sm">{template.name}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Aucun</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant} className="gap-1">
                        {status.icon}
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        {campaign.total_recipients}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={openRate > 20 ? "text-green-600 font-medium" : "text-muted-foreground"}>
                        {campaign.sent_count > 0 ? `${openRate}%` : "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {perf ? (
                        <Badge variant="outline" className={`${perf.bg} ${perf.color} border-0 gap-1`}>
                          <perf.icon className="h-3 w-3" />
                          {perf.label}
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(campaign.created_at), "d MMM yyyy", { locale: fr })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => handleViewStats(campaign)}
                          title="Voir les statistiques"
                        >
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive" 
                          onClick={() => onDeleteCampaign(campaign.id)}
                          disabled={campaign.status === "sending"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Create Campaign Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle campagne</DialogTitle>
            <DialogDescription>Créez une nouvelle campagne d'emailing</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="campaign-name">Nom de la campagne</Label>
              <Input
                id="campaign-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Newsletter Janvier 2026"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaign-template">Template (optionnel)</Label>
              <Select
                value={formData.template_id}
                onValueChange={(value) => setFormData({ ...formData, template_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleCreate}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Campaign Stats Dialog */}
      <CampaignStatsDialog
        campaign={selectedCampaign}
        open={statsOpen}
        onOpenChange={setStatsOpen}
        fetchRecipients={fetchCampaignRecipients}
      />
    </div>
  );
}
