import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BookOpen, Newspaper, Lightbulb, HelpCircle, Scale, ChevronRight } from "lucide-react";

export type VisualType = "carousel" | "news_card" | "tip_card" | "qa_card" | "default";

interface PostVisualTemplateProps {
  contentType: string;
  title: string;
  content: string;
  firmName?: string;
  firmColors?: { primary: string; accent: string };
  hashtags?: string[];
  slideIndex?: number;
  totalSlides?: number;
  className?: string;
}

export function getVisualType(contentType: string): VisualType {
  switch (contentType) {
    case "pedagogique": return "carousel";
    case "actualite": return "news_card";
    case "conseil": return "tip_card";
    case "question": return "qa_card";
    default: return "default";
  }
}

export function getVisualTypeLabel(vt: VisualType): string {
  switch (vt) {
    case "carousel": return "Carrousel (3-5 slides)";
    case "news_card": return "Carte actualité";
    case "tip_card": return "Carte conseil";
    case "qa_card": return "Carte Q&A";
    default: return "Visuel standard";
  }
}

const FIRM_PALETTES = [
  { primary: "#1e3a5f", accent: "#c9a94e" },
  { primary: "#2d4a3e", accent: "#d4a574" },
  { primary: "#4a2d5e", accent: "#e8b960" },
  { primary: "#5c1a1a", accent: "#d4a574" },
  { primary: "#1a3d5c", accent: "#78b4c8" },
];

export function getFirmPalette(firmName?: string): { primary: string; accent: string } {
  if (!firmName) return FIRM_PALETTES[0];
  const hash = firmName.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return FIRM_PALETTES[hash % FIRM_PALETTES.length];
}

function extractKeyPoints(content: string, max: number = 3): string[] {
  const sentences = content.split(/[.!?\n]/).map(s => s.trim()).filter(s => s.length > 15);
  return sentences.slice(0, max);
}

export function PostVisualTemplate({
  contentType,
  title,
  content,
  firmName,
  firmColors,
  hashtags = [],
  slideIndex = 0,
  totalSlides = 1,
  className,
}: PostVisualTemplateProps) {
  const palette = firmColors || getFirmPalette(firmName);
  const vt = getVisualType(contentType);

  if (vt === "carousel") {
    return <CarouselTemplate title={title} content={content} palette={palette} firmName={firmName} slideIndex={slideIndex} totalSlides={totalSlides} className={className} />;
  }
  if (vt === "news_card") {
    return <NewsCardTemplate title={title} content={content} palette={palette} firmName={firmName} hashtags={hashtags} className={className} />;
  }
  if (vt === "tip_card") {
    return <TipCardTemplate title={title} content={content} palette={palette} firmName={firmName} hashtags={hashtags} className={className} />;
  }
  if (vt === "qa_card") {
    return <QACardTemplate title={title} content={content} palette={palette} firmName={firmName} className={className} />;
  }
  return <DefaultTemplate title={title} content={content} palette={palette} firmName={firmName} className={className} />;
}

interface TemplateProps {
  title: string;
  content: string;
  palette: { primary: string; accent: string };
  firmName?: string;
  hashtags?: string[];
  slideIndex?: number;
  totalSlides?: number;
  className?: string;
}

function CarouselTemplate({ title, content, palette, firmName, slideIndex = 0, totalSlides = 3, className }: TemplateProps) {
  const points = extractKeyPoints(content, 5);
  const slides = Math.max(totalSlides, Math.min(points.length + 2, 5));

  return (
    <div className={cn("relative rounded-lg overflow-hidden aspect-square max-w-[280px]", className)} style={{ backgroundColor: palette.primary }}>
      {/* Slide content */}
      <div className="absolute inset-0 flex flex-col justify-between p-5">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" style={{ color: palette.accent }} />
            <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: palette.accent }}>
              Éducation juridique
            </span>
          </div>
          <span className="text-[10px] font-bold text-white/60">
            {slideIndex + 1}/{slides}
          </span>
        </div>

        {/* Title */}
        <div className="flex-1 flex flex-col justify-center">
          <h3 className="text-base font-bold text-white leading-tight line-clamp-3 mb-3">
            {slideIndex === 0 ? title : (points[slideIndex - 1] || title)}
          </h3>
          {slideIndex === 0 && (
            <p className="text-xs text-white/70 flex items-center gap-1">
              Swipez pour en savoir plus <ChevronRight className="h-3 w-3" />
            </p>
          )}
          {slideIndex > 0 && slideIndex <= points.length && (
            <p className="text-xs text-white/60 line-clamp-3">
              {points[slideIndex - 1]?.slice(0, 120)}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-white/50 font-medium">{firmName || "Cabinet"}</span>
          {/* Slide dots */}
          <div className="flex gap-1">
            {Array.from({ length: slides }).map((_, i) => (
              <div
                key={i}
                className={cn("w-1.5 h-1.5 rounded-full", i === slideIndex ? "bg-white" : "bg-white/30")}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Decorative accent */}
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10" style={{ backgroundColor: palette.accent, transform: "translate(30%, -30%)" }} />
    </div>
  );
}

function NewsCardTemplate({ title, content, palette, firmName, hashtags = [], className }: TemplateProps) {
  return (
    <div className={cn("relative rounded-lg overflow-hidden aspect-[4/3] max-w-[280px]", className)} style={{ backgroundColor: "#f8f9fa" }}>
      {/* Colored top bar */}
      <div className="h-2" style={{ backgroundColor: palette.primary }} />
      
      <div className="p-4 flex flex-col h-[calc(100%-8px)] justify-between">
        {/* Category */}
        <div className="flex items-center gap-1.5 mb-2">
          <Newspaper className="h-3.5 w-3.5" style={{ color: palette.primary }} />
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: palette.primary }}>
            Actualité juridique
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-zinc-900 leading-tight line-clamp-3 mb-2">
          {title}
        </h3>

        {/* Summary */}
        <p className="text-[11px] text-zinc-600 line-clamp-3 flex-1">
          {content.slice(0, 150)}...
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-200">
          <div className="flex items-center gap-1.5">
            <Scale className="h-3 w-3" style={{ color: palette.accent }} />
            <span className="text-[10px] font-medium text-zinc-500">{firmName || "Cabinet"}</span>
          </div>
          {hashtags.length > 0 && (
            <span className="text-[9px] font-medium" style={{ color: palette.primary }}>
              {hashtags[0]?.startsWith("#") ? hashtags[0] : `#${hashtags[0]}`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function TipCardTemplate({ title, content, palette, firmName, className }: TemplateProps) {
  const tips = extractKeyPoints(content, 3);

  return (
    <div className={cn("relative rounded-lg overflow-hidden aspect-square max-w-[280px]", className)} style={{ background: `linear-gradient(135deg, ${palette.primary}, ${palette.primary}dd)` }}>
      <div className="absolute inset-0 flex flex-col p-5 justify-between">
        {/* Header */}
        <div className="flex items-center gap-1.5">
          <Lightbulb className="h-4 w-4" style={{ color: palette.accent }} />
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: palette.accent }}>
            Conseil pratique
          </span>
        </div>

        {/* Title */}
        <div>
          <h3 className="text-base font-bold text-white leading-tight line-clamp-2 mb-3">
            {title}
          </h3>

          {/* Tips list */}
          <div className="space-y-2">
            {tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold shrink-0 mt-0.5" style={{ backgroundColor: palette.accent, color: palette.primary }}>
                  {i + 1}
                </span>
                <p className="text-[11px] text-white/80 line-clamp-2">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <span className="text-[10px] text-white/40 font-medium">{firmName || "Cabinet"}</span>
      </div>
    </div>
  );
}

function QACardTemplate({ title, content, palette, firmName, className }: TemplateProps) {
  const answer = content.slice(0, 200);

  return (
    <div className={cn("relative rounded-lg overflow-hidden aspect-square max-w-[280px] bg-white", className)}>
      {/* Question section */}
      <div className="h-[45%] flex flex-col justify-center p-5" style={{ backgroundColor: palette.primary }}>
        <div className="flex items-center gap-1.5 mb-2">
          <HelpCircle className="h-4 w-4" style={{ color: palette.accent }} />
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: palette.accent }}>
            Question fréquente
          </span>
        </div>
        <h3 className="text-sm font-bold text-white leading-tight line-clamp-3">
          {title}
        </h3>
      </div>

      {/* Answer section */}
      <div className="h-[55%] flex flex-col justify-between p-5">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-2 block">Réponse</span>
          <p className="text-[11px] text-zinc-700 line-clamp-5 leading-relaxed">
            {answer}...
          </p>
        </div>
        <div className="flex items-center gap-1.5 pt-2 border-t border-zinc-100">
          <Scale className="h-3 w-3" style={{ color: palette.accent }} />
          <span className="text-[10px] font-medium text-zinc-500">{firmName || "Cabinet"}</span>
        </div>
      </div>
    </div>
  );
}

function DefaultTemplate({ title, content, palette, firmName, className }: TemplateProps) {
  return (
    <div className={cn("relative rounded-lg overflow-hidden aspect-[4/3] max-w-[280px]", className)} style={{ background: `linear-gradient(135deg, ${palette.primary}, ${palette.primary}cc)` }}>
      <div className="absolute inset-0 flex flex-col justify-between p-5">
        <Scale className="h-5 w-5" style={{ color: palette.accent }} />
        <div>
          <h3 className="text-base font-bold text-white leading-tight line-clamp-3 mb-2">
            {title}
          </h3>
          <p className="text-[11px] text-white/60 line-clamp-2">
            {content.slice(0, 100)}...
          </p>
        </div>
        <span className="text-[10px] text-white/40 font-medium">{firmName || "Cabinet"}</span>
      </div>
    </div>
  );
}

// Carousel preview with slide navigation
export function CarouselPreview({
  contentType,
  title,
  content,
  firmName,
  firmColors,
}: {
  contentType: string;
  title: string;
  content: string;
  firmName?: string;
  firmColors?: { primary: string; accent: string };
}) {
  const points = extractKeyPoints(content, 5);
  const totalSlides = Math.max(3, Math.min(points.length + 2, 5));

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {Array.from({ length: Math.min(totalSlides, 3) }).map((_, i) => (
        <PostVisualTemplate
          key={i}
          contentType={contentType}
          title={title}
          content={content}
          firmName={firmName}
          firmColors={firmColors}
          slideIndex={i}
          totalSlides={totalSlides}
          className="shrink-0 !max-w-[160px] !text-[9px]"
        />
      ))}
      {totalSlides > 3 && (
        <div className="shrink-0 w-[160px] aspect-square rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
          <span className="text-xs text-muted-foreground">+{totalSlides - 3} slides</span>
        </div>
      )}
    </div>
  );
}
