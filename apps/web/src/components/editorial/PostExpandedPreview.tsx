import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Trash2,
  Calendar,
  Clock,
  Building2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Pencil,
  Check,
  X,
  Linkedin,
  Instagram,
  Facebook,
  Twitter,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { GeneratedPublication } from "@/hooks/useEditorialCampaign";
import { PlatformBadge } from "@/components/ui/platform-badge";
import {
  PostVisualTemplate,
  CarouselPreview,
  getVisualType,
  getVisualTypeLabel,
  getFirmPalette,
} from "./PostVisualTemplate";
import { cn } from "@/lib/utils";

interface PostExpandedPreviewProps {
  publication: GeneratedPublication;
  index: number;
  onToggleSelection: (index: number) => void;
  onRemove: (index: number) => void;
  onUpdateContent?: (index: number, content: string) => void;
}

export function PostExpandedPreview({
  publication: pub,
  index,
  onToggleSelection,
  onRemove,
  onUpdateContent,
}: PostExpandedPreviewProps) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(pub.content);
  const [previewPlatform, setPreviewPlatform] = useState<string>(pub.platform);

  const vt = getVisualType(pub.content_type || pub.format_suggestion?.includes("carrousel") ? "pedagogique" : "default");
  const vtLabel = getVisualTypeLabel(vt);
  const palette = getFirmPalette(pub.firmName);

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "EEE d MMM", { locale: fr });
    } catch {
      return dateStr;
    }
  };

  const handleSaveEdit = () => {
    onUpdateContent?.(index, editContent);
    setEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(pub.content);
    setEditing(false);
  };

  const getObjectiveBadge = (objective: string) => {
    const colors: Record<string, string> = {
      pédagogie: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      notoriété: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      actualité: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      "information générale": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    };
    return colors[objective] || "bg-muted text-muted-foreground";
  };

  const PlatformIcon = ({ platform }: { platform: string }) => {
    const icons: Record<string, typeof Linkedin> = {
      linkedin: Linkedin,
      instagram: Instagram,
      facebook: Facebook,
      twitter: Twitter,
    };
    const Icon = icons[platform] || Linkedin;
    return <Icon className="h-3.5 w-3.5" />;
  };

  return (
    <Card className={cn("transition-all", pub.selected ? "opacity-100 ring-1 ring-primary/20" : "opacity-50")}>
      {/* Compact header */}
      <CardHeader className="py-3 px-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={pub.selected}
            onCheckedChange={() => onToggleSelection(index)}
            className="mt-0.5"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold line-clamp-1 flex-1">{pub.title}</span>
              <Badge variant="outline" className="text-[10px] gap-1 shrink-0">
                <ImageIcon className="h-3 w-3" />
                {vtLabel}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground flex-wrap">
              <PlatformBadge platform={pub.platform as any} />
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span className="capitalize">{formatDate(pub.date)}</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {pub.time}
              </span>
              {pub.firmName && (
                <span className="flex items-center gap-1 font-medium text-foreground">
                  <Building2 className="h-3 w-3" />
                  {pub.firmName}
                </span>
              )}
              <Badge className={cn("text-[10px]", getObjectiveBadge(pub.objective))}>
                {pub.objective}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => onRemove(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Expanded content */}
      {expanded && (
        <CardContent className="pt-0 px-4 pb-4">
          <Separator className="mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Text content */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Texte</span>
                {!editing ? (
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setEditing(true)}>
                    <Pencil className="h-3 w-3" />
                    Modifier
                  </Button>
                ) : (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={handleSaveEdit}>
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={handleCancelEdit}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              {editing ? (
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={8}
                  className="text-sm"
                />
              ) : (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {pub.content}
                </p>
              )}
              {pub.hashtags?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {pub.hashtags.map((tag, i) => (
                    <span key={i} className="text-xs text-primary font-medium">
                      {tag.startsWith("#") ? tag : `#${tag}`}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Visual + Social preview */}
            <div className="space-y-4">
              {/* Visual template */}
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Visuel généré
                </span>
                {vt === "carousel" ? (
                  <CarouselPreview
                    contentType={pub.content_type || "pedagogique"}
                    title={pub.title}
                    content={pub.content}
                    firmName={pub.firmName}
                    firmColors={palette}
                  />
                ) : (
                  <PostVisualTemplate
                    contentType={pub.content_type || "default"}
                    title={pub.title}
                    content={pub.content}
                    firmName={pub.firmName}
                    firmColors={palette}
                    hashtags={pub.hashtags}
                    className="!max-w-[220px]"
                  />
                )}
              </div>

              {/* Mini social preview */}
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Aperçu réseau
                </span>
                <div className="flex gap-1 mb-2">
                  {["linkedin", "facebook", "instagram"].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPreviewPlatform(p)}
                      className={cn(
                        "p-1.5 rounded-md transition-colors",
                        previewPlatform === p ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <PlatformIcon platform={p} />
                    </button>
                  ))}
                </div>
                <MiniSocialPreview
                  platform={previewPlatform}
                  content={pub.content}
                  title={pub.title}
                  firmName={pub.firmName}
                />
              </div>
            </div>
          </div>
        </CardContent>
      )}

      {/* Compact content preview when collapsed */}
      {!expanded && (
        <CardContent className="pt-0 px-4 pb-3">
          <p className="text-xs text-muted-foreground line-clamp-2">{pub.content}</p>
        </CardContent>
      )}
    </Card>
  );
}

function MiniSocialPreview({ platform, content, title, firmName }: { platform: string; content: string; title: string; firmName?: string }) {
  const platformStyles: Record<string, { bg: string; name: string }> = {
    linkedin: { bg: "bg-white dark:bg-zinc-900 border-[#0A66C2]/20", name: "LinkedIn" },
    facebook: { bg: "bg-white dark:bg-zinc-900 border-[#1877F2]/20", name: "Facebook" },
    instagram: { bg: "bg-white dark:bg-zinc-900 border-[#E1306C]/20", name: "Instagram" },
  };
  const style = platformStyles[platform] || platformStyles.linkedin;

  return (
    <div className={cn("rounded-lg border p-3 text-xs", style.bg)}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-bold text-primary">
          {(firmName || "C").charAt(0)}
        </div>
        <div>
          <span className="font-semibold text-foreground block leading-none">{firmName || "Cabinet"}</span>
          <span className="text-muted-foreground text-[10px]">À l'instant · {style.name}</span>
        </div>
      </div>
      <p className="text-muted-foreground line-clamp-3 leading-relaxed">{content.slice(0, 150)}...</p>
      <div className="mt-2 pt-2 border-t border-muted flex gap-4 text-muted-foreground/60">
        <span>👍 J'aime</span>
        <span>💬 Commenter</span>
        <span>↗️ Partager</span>
      </div>
    </div>
  );
}
