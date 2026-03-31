import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import type { TeamWorkloadItem } from "@/hooks/useAdminCoordination";

interface Props {
  workload: TeamWorkloadItem[];
  onSelectMember: (memberId: string) => void;
}

function LoadBadge({ count }: { count: number }) {
  if (count > 10) return <Badge className="bg-destructive/15 text-destructive border-destructive/30 text-[10px]">{count}</Badge>;
  if (count >= 5) return <Badge className="bg-amber-500/15 text-amber-700 border-amber-200 text-[10px]">{count}</Badge>;
  return <Badge className="bg-green-500/15 text-green-700 border-green-200 text-[10px]">{count}</Badge>;
}

export function TeamWorkloadTab({ workload, onSelectMember }: Props) {
  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs">CM</TableHead>
            <TableHead className="text-xs text-center">Discussions ouvertes</TableHead>
            <TableHead className="text-xs text-center">Urgentes</TableHead>
            <TableHead className="text-xs text-center">Temps moy. réponse</TableHead>
            <TableHead className="text-xs">Dernière activité</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workload.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                Aucun membre d'équipe trouvé
              </TableCell>
            </TableRow>
          )}
          {workload.map((item) => (
            <TableRow
              key={item.memberId}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => onSelectMember(item.memberId)}
            >
              <TableCell className="font-medium text-sm">{item.name}</TableCell>
              <TableCell className="text-center">
                <LoadBadge count={item.openDiscussions} />
              </TableCell>
              <TableCell className="text-center">
                {item.urgentCount > 0 ? (
                  <Badge className="bg-destructive/15 text-destructive text-[10px]">
                    {item.urgentCount}
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">0</span>
                )}
              </TableCell>
              <TableCell className="text-center text-sm">
                {item.avgResponseTime.toFixed(1)}h
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {item.lastActivity
                  ? formatDistanceToNow(new Date(item.lastActivity), { addSuffix: true, locale: fr })
                  : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
