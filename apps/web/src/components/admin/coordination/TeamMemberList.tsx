import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import type { TeamMember } from "@/hooks/useAdminCoordination";

interface TeamMemberListProps {
  members: TeamMember[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  filter: "all" | "community_manager" | "commercial";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const roleLabels: Record<string, string> = {
  community_manager: "CM",
  commercial: "Commercial",
};

export function TeamMemberList({ members, selectedId, onSelect, filter }: TeamMemberListProps) {
  const filtered = filter === "all" ? members : members.filter((m) => m.role === filter);

  if (filtered.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
        Aucun membre trouvé
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      {filtered.map((member) => (
        <button
          key={member.id}
          onClick={() => onSelect(member.id)}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors w-full",
            selectedId === member.id
              ? "bg-primary/10"
              : "hover:bg-muted/50"
          )}
        >
          {/* Avatar + online indicator */}
          <div className="relative shrink-0">
            <Avatar className="h-9 w-9">
              <AvatarImage src={member.avatar_url || undefined} />
              <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                {getInitials(member.full_name)}
              </AvatarFallback>
            </Avatar>
            <span
              className={cn(
                "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background",
                member.isOnline ? "bg-green-500" : "bg-muted-foreground/40"
              )}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium truncate">{member.full_name}</span>
              <Badge variant="outline" className="text-[9px] px-1 py-0 shrink-0">
                {roleLabels[member.role] || member.role}
              </Badge>
            </div>
            {member.lastMessage && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {member.lastMessage.is_urgent && (
                  <span className="text-destructive font-medium">⚡ </span>
                )}
                {member.lastMessage.content}
              </p>
            )}
          </div>

          {/* Right: unread + open discussions + time */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            <div className="flex items-center gap-1">
              {(member.openDiscussions ?? 0) > 0 && (
                <Badge variant="outline" className="h-4 min-w-[16px] px-1 text-[9px] text-muted-foreground">
                  {member.openDiscussions}
                </Badge>
              )}
              {member.unreadCount > 0 && (
                <Badge className="h-5 min-w-[20px] px-1.5 text-[10px] bg-primary text-primary-foreground">
                  {member.unreadCount}
                </Badge>
              )}
            </div>
            {member.lastMessage && (
              <span className="text-[10px] text-muted-foreground">
                {formatDistanceToNow(new Date(member.lastMessage.created_at), {
                  addSuffix: false,
                  locale: fr,
                })}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
