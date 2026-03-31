import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bold, Italic, Strikethrough, List, Smile, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type SocialNetwork = "linkedin" | "instagram" | "facebook" | "twitter" | "google_business" | null;

// Capacités de formatage par réseau social
const PLATFORM_CAPABILITIES: Record<string, {
  bold: boolean;
  italic: boolean;
  strikethrough: boolean;
  list: boolean;
  emoji: boolean;
  description: string;
}> = {
  linkedin: {
    bold: true,
    italic: true,
    strikethrough: false,
    list: true,
    emoji: true,
    description: "LinkedIn supporte le gras, l'italique, les listes et les emojis"
  },
  instagram: {
    bold: false,
    italic: false,
    strikethrough: false,
    list: false,
    emoji: true,
    description: "Instagram ne supporte que les sauts de ligne et emojis"
  },
  facebook: {
    bold: false,
    italic: false,
    strikethrough: false,
    list: false,
    emoji: true,
    description: "Facebook ne supporte que les sauts de ligne et emojis"
  },
  twitter: {
    bold: false,
    italic: false,
    strikethrough: false,
    list: false,
    emoji: true,
    description: "X ne supporte que les sauts de ligne et emojis"
  },
  google_business: {
    bold: false,
    italic: false,
    strikethrough: false,
    list: false,
    emoji: true,
    description: "Google Business supporte le texte simple et les emojis (max 1500 caractères)"
  }
};

// Emojis professionnels organisés par catégorie
const EMOJI_CATEGORIES = [
  {
    name: "Professionnel",
    emojis: ["💼", "📊", "📈", "✅", "🎯", "💡", "🔑", "📝", "🏆", "⭐"]
  },
  {
    name: "Communication",
    emojis: ["👋", "🤝", "💬", "📣", "📢", "✉️", "📧", "💌", "🗣️", "👥"]
  },
  {
    name: "Temps & Dates",
    emojis: ["📅", "⏰", "🕐", "📆", "⚡", "🔔", "⏳", "🗓️", "🎉", "🥳"]
  },
  {
    name: "Juridique",
    emojis: ["⚖️", "📜", "🏛️", "📋", "🔒", "🛡️", "📖", "🎓", "👨‍⚖️", "👩‍⚖️"]
  }
];

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  platform: SocialNetwork;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ 
  value, 
  onChange, 
  platform, 
  placeholder = "Rédigez votre publication...",
  className 
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // Obtenir les capacités du réseau actuel (ou all enabled si pas de réseau)
  const capabilities = platform ? PLATFORM_CAPABILITIES[platform] : {
    bold: true,
    italic: true,
    strikethrough: true,
    list: true,
    emoji: true,
    description: "Sélectionnez un réseau pour adapter les options"
  };

  // Appliquer un format au texte sélectionné
  const applyFormat = useCallback((format: "bold" | "italic" | "strikethrough" | "list") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    let newText = "";
    let cursorOffset = 0;

    switch (format) {
      case "bold":
        // LinkedIn uses Unicode bold characters simulation with asterisks
        if (selectedText) {
          newText = value.substring(0, start) + `**${selectedText}**` + value.substring(end);
          cursorOffset = 2;
        } else {
          newText = value.substring(0, start) + "**texte en gras**" + value.substring(end);
          cursorOffset = 2;
        }
        break;
      case "italic":
        if (selectedText) {
          newText = value.substring(0, start) + `_${selectedText}_` + value.substring(end);
          cursorOffset = 1;
        } else {
          newText = value.substring(0, start) + "_texte en italique_" + value.substring(end);
          cursorOffset = 1;
        }
        break;
      case "strikethrough":
        if (selectedText) {
          newText = value.substring(0, start) + `~${selectedText}~` + value.substring(end);
          cursorOffset = 1;
        } else {
          newText = value.substring(0, start) + "~texte barré~" + value.substring(end);
          cursorOffset = 1;
        }
        break;
      case "list":
        // Add bullet point at line start
        const lines = value.split('\n');
        const beforeCursor = value.substring(0, start);
        const currentLineIndex = beforeCursor.split('\n').length - 1;
        
        if (lines[currentLineIndex].startsWith('• ')) {
          lines[currentLineIndex] = lines[currentLineIndex].substring(2);
        } else {
          lines[currentLineIndex] = '• ' + lines[currentLineIndex];
        }
        newText = lines.join('\n');
        break;
    }

    if (newText) {
      onChange(newText);
      // Restore focus
      setTimeout(() => {
        textarea.focus();
        if (format !== "list") {
          textarea.setSelectionRange(start + cursorOffset, end + cursorOffset);
        }
      }, 0);
    }
  }, [value, onChange]);

  // Insérer un emoji
  const insertEmoji = useCallback((emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const newText = value.substring(0, start) + emoji + value.substring(start);
    onChange(newText);
    setShowEmojiPicker(false);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  }, [value, onChange]);

  // Message d'avertissement si des formats ne sont pas supportés
  const unsupportedFormats = platform ? Object.entries(capabilities)
    .filter(([key, supported]) => key !== 'description' && key !== 'emoji' && !supported)
    .map(([key]) => {
      const labels: Record<string, string> = {
        bold: "gras",
        italic: "italique",
        strikethrough: "barré",
        list: "listes"
      };
      return labels[key];
    })
    .filter(Boolean) : [];

  return (
    <div className={cn("space-y-2", className)}>
      {/* Barre d'outils */}
      <TooltipProvider>
        <div className="flex items-center gap-1 p-1.5 bg-muted/50 rounded-lg border">
          {/* Gras */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-8 p-0",
                  !capabilities.bold && "opacity-40 cursor-not-allowed"
                )}
                onClick={() => capabilities.bold && applyFormat("bold")}
                disabled={!capabilities.bold}
              >
                <Bold className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {capabilities.bold 
                ? "Gras (sélectionner le texte)" 
                : "Non supporté par ce réseau"}
            </TooltipContent>
          </Tooltip>

          {/* Italique */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-8 p-0",
                  !capabilities.italic && "opacity-40 cursor-not-allowed"
                )}
                onClick={() => capabilities.italic && applyFormat("italic")}
                disabled={!capabilities.italic}
              >
                <Italic className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {capabilities.italic 
                ? "Italique (sélectionner le texte)" 
                : "Non supporté par ce réseau"}
            </TooltipContent>
          </Tooltip>

          {/* Barré */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-8 p-0",
                  !capabilities.strikethrough && "opacity-40 cursor-not-allowed"
                )}
                onClick={() => capabilities.strikethrough && applyFormat("strikethrough")}
                disabled={!capabilities.strikethrough}
              >
                <Strikethrough className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {capabilities.strikethrough 
                ? "Barré (sélectionner le texte)" 
                : "Non supporté par ce réseau"}
            </TooltipContent>
          </Tooltip>

          <div className="w-px h-5 bg-border mx-1" />

          {/* Liste */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-8 p-0",
                  !capabilities.list && "opacity-40 cursor-not-allowed"
                )}
                onClick={() => capabilities.list && applyFormat("list")}
                disabled={!capabilities.list}
              >
                <List className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {capabilities.list 
                ? "Ajouter une puce" 
                : "Non supporté par ce réseau"}
            </TooltipContent>
          </Tooltip>

          <div className="w-px h-5 bg-border mx-1" />

          {/* Emojis */}
          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>Insérer un emoji</TooltipContent>
            </Tooltip>
            <PopoverContent className="w-64 p-2" align="start">
              <div className="space-y-3">
                {EMOJI_CATEGORIES.map((category) => (
                  <div key={category.name}>
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">
                      {category.name}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {category.emojis.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          className="w-7 h-7 flex items-center justify-center hover:bg-muted rounded text-base transition-colors"
                          onClick={() => insertEmoji(emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Info réseau */}
          {platform && (
            <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground px-2">
              <span className="capitalize">{platform}</span>
            </div>
          )}
        </div>
      </TooltipProvider>

      {/* Message d'avertissement */}
      {platform && unsupportedFormats.length > 0 && (
        <div className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md text-xs text-amber-800 dark:text-amber-200">
          <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
          <span>
            {platform === "instagram" || platform === "facebook" || platform === "twitter"
              ? `${platform.charAt(0).toUpperCase() + platform.slice(1)} ne supporte que les sauts de ligne et emojis.`
              : `Les options ${unsupportedFormats.join(", ")} ne sont pas supportées par ${platform}.`
            }
          </span>
        </div>
      )}

      {/* Zone de texte */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
          "ring-offset-background placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "resize-none"
        )}
      />

      {/* Compteur de caractères */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{value.length} caractères</span>
        {platform === "twitter" && (
          <span className={cn(value.length > 280 && "text-destructive font-medium")}>
            {280 - value.length} restants
          </span>
        )}
        {platform === "linkedin" && (
          <span className={cn(value.length > 3000 && "text-destructive font-medium")}>
            Max: 3000
          </span>
        )}
        {platform === "google_business" && (
          <span className={cn(value.length > 1500 && "text-destructive font-medium")}>
            Max: 1500
          </span>
        )}
      </div>
    </div>
  );
}
