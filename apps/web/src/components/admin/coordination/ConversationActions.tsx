import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Tag, Link2, CheckCircle2 } from "lucide-react";
import type { DiscussionStatus, Message } from "@/hooks/useAdminCoordination";
import { AVAILABLE_TAGS } from "@/hooks/useAdminCoordination";

interface Props {
  lastMessage: Message | undefined;
  onStatusChange: (status: DiscussionStatus) => void;
  onTagsChange: (tags: string[]) => void;
  onLinkFirm: () => void;
}

const STATUS_LABELS: Record<DiscussionStatus, string> = {
  en_cours: "En cours",
  attente_cm: "Attente CM",
  attente_admin: "Attente Admin",
  urgent: "Urgent",
  resolu: "Résolu",
};

const STATUS_COLORS: Record<DiscussionStatus, string> = {
  en_cours: "bg-blue-500/10 text-blue-700 border-blue-200",
  attente_cm: "bg-amber-500/10 text-amber-700 border-amber-200",
  attente_admin: "bg-purple-500/10 text-purple-700 border-purple-200",
  urgent: "bg-destructive/10 text-destructive border-destructive/30",
  resolu: "bg-green-500/10 text-green-700 border-green-200",
};

export function ConversationActions({ lastMessage, onStatusChange, onTagsChange, onLinkFirm }: Props) {
  if (!lastMessage) return null;

  const currentStatus = (lastMessage.status || "en_cours") as DiscussionStatus;
  const currentTags = lastMessage.tags || [];

  const handleTagToggle = (tag: string) => {
    const next = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];
    onTagsChange(next);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap px-4 py-2 border-b border-border/30 bg-muted/20">
      {/* Status selector */}
      <Select value={currentStatus} onValueChange={(v) => onStatusChange(v as DiscussionStatus)}>
        <SelectTrigger className="h-7 w-auto min-w-[120px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(STATUS_LABELS).map(([val, label]) => (
            <SelectItem key={val} value={val} className="text-xs">
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status badge */}
      <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[currentStatus]}`}>
        {STATUS_LABELS[currentStatus]}
      </Badge>

      {/* Tags popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
            <Tag className="h-3 w-3" />
            Tags ({currentTags.length})
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2" align="start">
          <div className="space-y-1.5">
            {AVAILABLE_TAGS.map((tag) => (
              <label key={tag} className="flex items-center gap-2 text-xs cursor-pointer">
                <Checkbox
                  checked={currentTags.includes(tag)}
                  onCheckedChange={() => handleTagToggle(tag)}
                />
                {tag}
              </label>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Tags display */}
      {currentTags.map((tag) => (
        <Badge key={tag} variant="secondary" className="text-[10px] px-1.5">
          {tag}
        </Badge>
      ))}

      {/* Link firm */}
      <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs ml-auto" onClick={onLinkFirm}>
        <Link2 className="h-3 w-3" />
        Lier cabinet
      </Button>
    </div>
  );
}
