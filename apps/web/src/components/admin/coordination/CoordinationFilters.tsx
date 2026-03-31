import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DiscussionStatus } from "@/hooks/useAdminCoordination";
import { AVAILABLE_TAGS } from "@/hooks/useAdminCoordination";

interface Props {
  statusFilter: DiscussionStatus | "all";
  tagFilter: string | "all";
  onStatusChange: (s: DiscussionStatus | "all") => void;
  onTagChange: (t: string | "all") => void;
}

const STATUS_OPTIONS: { value: DiscussionStatus | "all"; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "en_cours", label: "En cours" },
  { value: "attente_cm", label: "Attente CM" },
  { value: "attente_admin", label: "Attente Admin" },
  { value: "urgent", label: "Urgent" },
  { value: "resolu", label: "Résolu" },
];

export function CoordinationFilters({ statusFilter, tagFilter, onStatusChange, onTagChange }: Props) {
  return (
    <div className="space-y-2 px-1">
      {/* Status pills */}
      <div className="flex flex-wrap gap-1">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onStatusChange(opt.value)}
            className={cn(
              "px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors border",
              statusFilter === opt.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:bg-muted/50"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {/* Tag pills */}
      <div className="flex flex-wrap gap-1">
        <button
          onClick={() => onTagChange("all")}
          className={cn(
            "px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors border",
            tagFilter === "all"
              ? "bg-accent text-accent-foreground border-accent"
              : "bg-background text-muted-foreground border-border hover:bg-muted/50"
          )}
        >
          Tous tags
        </button>
        {AVAILABLE_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => onTagChange(tagFilter === tag ? "all" : tag)}
            className={cn(
              "px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors border",
              tagFilter === tag
                ? "bg-accent text-accent-foreground border-accent"
                : "bg-background text-muted-foreground border-border hover:bg-muted/50"
            )}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
