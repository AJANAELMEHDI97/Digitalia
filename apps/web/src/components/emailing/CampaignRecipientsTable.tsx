import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Mail, CheckCircle, MousePointerClick, AlertTriangle, Clock, UserMinus } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { EmailRecipient } from "@/hooks/useEmailing";

interface CampaignRecipientsTableProps {
  recipients: EmailRecipient[];
}

type FilterStatus = "all" | "pending" | "sent" | "opened" | "clicked" | "bounced" | "unsubscribed";

const statusConfig: Record<string, { label: string; icon: React.ReactNode; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  pending: { label: "En attente", icon: <Clock className="h-3 w-3" />, variant: "secondary" },
  sent: { label: "Envoyé", icon: <Mail className="h-3 w-3" />, variant: "outline" },
  opened: { label: "Ouvert", icon: <CheckCircle className="h-3 w-3" />, variant: "default" },
  clicked: { label: "Cliqué", icon: <MousePointerClick className="h-3 w-3" />, variant: "default" },
  bounced: { label: "Rebondi", icon: <AlertTriangle className="h-3 w-3" />, variant: "destructive" },
  unsubscribed: { label: "Désabo", icon: <UserMinus className="h-3 w-3" />, variant: "destructive" },
};

const filters: { value: FilterStatus; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "opened", label: "Ouverts" },
  { value: "clicked", label: "Cliqués" },
  { value: "sent", label: "Envoyés" },
  { value: "pending", label: "En attente" },
  { value: "bounced", label: "Rebondis" },
  { value: "unsubscribed", label: "Désabonnés" },
];

export function CampaignRecipientsTable({ recipients }: CampaignRecipientsTableProps) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("all");

  const getRecipientStatus = (recipient: EmailRecipient): string => {
    if (recipient.unsubscribed_at) return "unsubscribed";
    if (recipient.bounced_at) return "bounced";
    if (recipient.clicked_at) return "clicked";
    if (recipient.opened_at) return "opened";
    if (recipient.sent_at) return "sent";
    return "pending";
  };

  const filteredRecipients = recipients.filter((recipient) => {
    const matchesSearch =
      recipient.email.toLowerCase().includes(search.toLowerCase()) ||
      (recipient.name?.toLowerCase().includes(search.toLowerCase()) ?? false);

    if (!matchesSearch) return false;

    if (activeFilter === "all") return true;

    const status = getRecipientStatus(recipient);
    return status === activeFilter;
  });

  const getCounts = () => {
    const counts: Record<string, number> = { all: recipients.length };
    recipients.forEach((r) => {
      const status = getRecipientStatus(r);
      counts[status] = (counts[status] || 0) + 1;
    });
    return counts;
  };

  const counts = getCounts();

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un destinataire..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Button
            key={filter.value}
            variant={activeFilter === filter.value ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter(filter.value)}
            className="text-xs"
          >
            {filter.label}
            <Badge variant="secondary" className="ml-2 h-5 min-w-[20px] px-1">
              {counts[filter.value] || 0}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Table */}
      <ScrollArea className="h-[300px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Ouvert le</TableHead>
              <TableHead className="text-center">Clics</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecipients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Aucun destinataire trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredRecipients.map((recipient) => {
                const status = getRecipientStatus(recipient);
                const config = statusConfig[status] || statusConfig.pending;

                return (
                  <TableRow key={recipient.id}>
                    <TableCell className="font-medium">{recipient.email}</TableCell>
                    <TableCell>
                      {recipient.name ? (
                        <span>{recipient.name}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={config.variant} className="gap-1">
                        {config.icon}
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {recipient.opened_at ? (
                        <span className="text-sm">
                          {format(new Date(recipient.opened_at), "d MMM à HH:mm", { locale: fr })}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {recipient.click_count > 0 ? (
                        <Badge variant="outline">{recipient.click_count}</Badge>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </ScrollArea>

      <p className="text-xs text-muted-foreground text-center">
        {filteredRecipients.length} destinataire{filteredRecipients.length > 1 ? "s" : ""} affiché{filteredRecipients.length > 1 ? "s" : ""}
      </p>
    </div>
  );
}
