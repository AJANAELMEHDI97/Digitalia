import { useState } from "react";
import { Linkedin, Instagram, Facebook, Twitter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EditorialTipsInline } from "@/components/editorial/EditorialTips";
import type { SocialPlatform } from "@/hooks/usePublications";

type SocialNetwork = "linkedin" | "instagram" | "facebook" | "twitter";

interface SocialPreviewProps {
  content: string;
  imageUrl?: string | null;
  className?: string;
  showTips?: boolean;
}

export function SocialPreview({ content, imageUrl, className, showTips = true }: SocialPreviewProps) {
  const [network, setNetwork] = useState<SocialNetwork>("linkedin");

  return (
    <div className={cn("space-y-4", className)}>
      {/* Network Selector */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={network === "linkedin" ? "default" : "outline"}
          size="sm"
          onClick={() => setNetwork("linkedin")}
          className={cn(
            network === "linkedin" && "bg-[#0A66C2] hover:bg-[#004182]"
          )}
        >
          <Linkedin className="h-4 w-4 mr-1.5" />
          LinkedIn
        </Button>
        <Button
          variant={network === "instagram" ? "default" : "outline"}
          size="sm"
          onClick={() => setNetwork("instagram")}
          className={cn(
            network === "instagram" && "bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90"
          )}
        >
          <Instagram className="h-4 w-4 mr-1.5" />
          Instagram
        </Button>
        <Button
          variant={network === "facebook" ? "default" : "outline"}
          size="sm"
          onClick={() => setNetwork("facebook")}
          className={cn(
            network === "facebook" && "bg-[#1877F2] hover:bg-[#0d65d9]"
          )}
        >
          <Facebook className="h-4 w-4 mr-1.5" />
          Facebook
        </Button>
        <Button
          variant={network === "twitter" ? "default" : "outline"}
          size="sm"
          onClick={() => setNetwork("twitter")}
          className={cn(
            network === "twitter" && "bg-[#000000] hover:bg-[#1a1a1a]"
          )}
        >
          <Twitter className="h-4 w-4 mr-1.5" />
          X
        </Button>
      </div>

      {/* Editorial Tips */}
      {showTips && <EditorialTipsInline platform={network as SocialPlatform} />}

      {/* Preview */}
      {network === "linkedin" && <LinkedInPreview content={content} imageUrl={imageUrl} />}
      {network === "instagram" && <InstagramPreview content={content} imageUrl={imageUrl} />}
      {network === "facebook" && <FacebookPreview content={content} imageUrl={imageUrl} />}
      {network === "twitter" && <TwitterPreview content={content} imageUrl={imageUrl} />}
    </div>
  );
}

function LinkedInPreview({ content, imageUrl }: { content: string; imageUrl?: string | null }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-semibold text-sm">
          SP
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Votre cabinet</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Avocat · À l'instant</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-3 pb-3">
        {content ? (
          <p className="text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap line-clamp-6">
            {content}
          </p>
        ) : (
          <p className="text-sm text-zinc-400 italic">Votre texte apparaîtra ici...</p>
        )}
      </div>

      {/* Image */}
      {imageUrl && (
        <div className="w-full">
          <img
            src={imageUrl}
            alt="Publication"
            className="w-full h-auto max-h-[300px] object-cover"
          />
        </div>
      )}

      {/* Engagement Bar */}
      <div className="px-3 py-2 border-t border-zinc-100 dark:border-zinc-700">
        <div className="flex items-center gap-1 text-xs text-zinc-500">
          <span className="inline-flex items-center">
            <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[8px]">👍</span>
          </span>
          <span>0</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-3 py-2 border-t border-zinc-100 dark:border-zinc-700 flex justify-around text-xs text-zinc-600 dark:text-zinc-400">
        <span className="flex items-center gap-1 cursor-default">👍 J'aime</span>
        <span className="flex items-center gap-1 cursor-default">💬 Commenter</span>
        <span className="flex items-center gap-1 cursor-default">🔄 Republier</span>
        <span className="flex items-center gap-1 cursor-default">📤 Envoyer</span>
      </div>
    </div>
  );
}

function InstagramPreview({ content, imageUrl }: { content: string; imageUrl?: string | null }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-hidden max-w-[350px]">
      {/* Header */}
      <div className="p-3 flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-700">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] p-[2px]">
          <div className="w-full h-full rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center">
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">SP</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">votre_cabinet</p>
        </div>
        <span className="text-zinc-400">•••</span>
      </div>

      {/* Image */}
      <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Publication"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-zinc-400 dark:text-zinc-500 p-4">
              <Instagram className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Ajoutez une image pour un meilleur rendu</p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-3 flex items-center gap-4 text-zinc-900 dark:text-zinc-100">
        <span className="text-xl cursor-default">♡</span>
        <span className="text-xl cursor-default">💬</span>
        <span className="text-xl cursor-default">📤</span>
        <span className="ml-auto text-xl cursor-default">🔖</span>
      </div>

      {/* Likes */}
      <div className="px-3 pb-1">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">0 J'aime</p>
      </div>

      {/* Caption */}
      <div className="px-3 pb-3">
        {content ? (
          <p className="text-sm text-zinc-800 dark:text-zinc-200">
            <span className="font-semibold mr-1">votre_cabinet</span>
            <span className="whitespace-pre-wrap line-clamp-3">{content}</span>
          </p>
        ) : (
          <p className="text-sm text-zinc-400 italic">Votre légende apparaîtra ici...</p>
        )}
      </div>

      {/* Timestamp */}
      <div className="px-3 pb-3">
        <p className="text-[10px] text-zinc-400 uppercase">À l'instant</p>
      </div>
    </div>
  );
}

function FacebookPreview({ content, imageUrl }: { content: string; imageUrl?: string | null }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center text-white font-semibold text-sm">
          SP
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Votre Cabinet</p>
          <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
            <span>À l'instant</span>
            <span>·</span>
            <span>🌐</span>
          </div>
        </div>
        <span className="text-zinc-400">•••</span>
      </div>

      {/* Content */}
      <div className="px-3 pb-3">
        {content ? (
          <p className="text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap line-clamp-6">
            {content}
          </p>
        ) : (
          <p className="text-sm text-zinc-400 italic">Votre texte apparaîtra ici...</p>
        )}
      </div>

      {/* Image */}
      {imageUrl && (
        <div className="w-full">
          <img
            src={imageUrl}
            alt="Publication"
            className="w-full h-auto max-h-[300px] object-cover"
          />
        </div>
      )}

      {/* Engagement Bar */}
      <div className="px-3 py-2 border-t border-zinc-100 dark:border-zinc-700 flex items-center justify-between text-xs text-zinc-500">
        <div className="flex items-center gap-1">
          <span className="flex -space-x-1">
            <span className="w-4 h-4 rounded-full bg-[#1877F2] flex items-center justify-center text-white text-[8px]">👍</span>
            <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-[8px]">❤️</span>
          </span>
          <span>0</span>
        </div>
        <span>0 commentaires</span>
      </div>

      {/* Actions */}
      <div className="px-3 py-2 border-t border-zinc-100 dark:border-zinc-700 flex justify-around text-sm font-medium text-zinc-600 dark:text-zinc-400">
        <span className="flex items-center gap-2 cursor-default hover:bg-zinc-100 dark:hover:bg-zinc-800 px-4 py-1.5 rounded-md">👍 J'aime</span>
        <span className="flex items-center gap-2 cursor-default hover:bg-zinc-100 dark:hover:bg-zinc-800 px-4 py-1.5 rounded-md">💬 Commenter</span>
        <span className="flex items-center gap-2 cursor-default hover:bg-zinc-100 dark:hover:bg-zinc-800 px-4 py-1.5 rounded-md">↗️ Partager</span>
      </div>
    </div>
  );
}

function TwitterPreview({ content, imageUrl }: { content: string; imageUrl?: string | null }) {
  return (
    <div className="bg-white dark:bg-black rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-3 flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 font-bold text-sm flex-shrink-0">
          SP
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 flex-wrap">
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Votre Cabinet</p>
            <span className="text-zinc-500 dark:text-zinc-400 text-sm">@votrecabinet · À l'instant</span>
          </div>
          
          {/* Content */}
          <div className="mt-1">
            {content ? (
              <p className="text-sm text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap">
                {content}
              </p>
            ) : (
              <p className="text-sm text-zinc-400 italic">Votre texte apparaîtra ici...</p>
            )}
          </div>

          {/* Image */}
          {imageUrl && (
            <div className="mt-3 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
              <img
                src={imageUrl}
                alt="Publication"
                className="w-full h-auto max-h-[280px] object-cover"
              />
            </div>
          )}

          {/* Actions */}
          <div className="mt-3 flex items-center justify-between max-w-[400px] text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5 text-sm cursor-default hover:text-[#1D9BF0]">
              💬 <span className="text-xs">0</span>
            </span>
            <span className="flex items-center gap-1.5 text-sm cursor-default hover:text-green-500">
              🔄 <span className="text-xs">0</span>
            </span>
            <span className="flex items-center gap-1.5 text-sm cursor-default hover:text-red-500">
              ♡ <span className="text-xs">0</span>
            </span>
            <span className="flex items-center gap-1.5 text-sm cursor-default hover:text-[#1D9BF0]">
              📊 <span className="text-xs">0</span>
            </span>
            <span className="flex items-center gap-1 text-sm cursor-default hover:text-[#1D9BF0]">
              🔖 📤
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact version for validation cards
export function SocialPreviewCompact({ content, imageUrl }: SocialPreviewProps) {
  const [network, setNetwork] = useState<SocialNetwork>("linkedin");

  return (
    <div className="space-y-3">
      {/* Network Tabs */}
      <div className="flex gap-1 border-b border-zinc-200 dark:border-zinc-700 overflow-x-auto">
        <button
          onClick={() => setNetwork("linkedin")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px whitespace-nowrap",
            network === "linkedin"
              ? "border-[#0A66C2] text-[#0A66C2]"
              : "border-transparent text-zinc-500 hover:text-zinc-700"
          )}
        >
          <Linkedin className="h-3.5 w-3.5" />
          LinkedIn
        </button>
        <button
          onClick={() => setNetwork("instagram")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px whitespace-nowrap",
            network === "instagram"
              ? "border-[#E1306C] text-[#E1306C]"
              : "border-transparent text-zinc-500 hover:text-zinc-700"
          )}
        >
          <Instagram className="h-3.5 w-3.5" />
          Instagram
        </button>
        <button
          onClick={() => setNetwork("facebook")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px whitespace-nowrap",
            network === "facebook"
              ? "border-[#1877F2] text-[#1877F2]"
              : "border-transparent text-zinc-500 hover:text-zinc-700"
          )}
        >
          <Facebook className="h-3.5 w-3.5" />
          Facebook
        </button>
        <button
          onClick={() => setNetwork("twitter")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px whitespace-nowrap",
            network === "twitter"
              ? "border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
              : "border-transparent text-zinc-500 hover:text-zinc-700"
          )}
        >
          <Twitter className="h-3.5 w-3.5" />
          X
        </button>
      </div>

      {/* Editorial Tips */}
      <EditorialTipsInline platform={network as SocialPlatform} />

      {/* Preview */}
      <div className="scale-90 origin-top-left">
        {network === "linkedin" && <LinkedInPreview content={content} imageUrl={imageUrl} />}
        {network === "instagram" && <InstagramPreview content={content} imageUrl={imageUrl} />}
        {network === "facebook" && <FacebookPreview content={content} imageUrl={imageUrl} />}
        {network === "twitter" && <TwitterPreview content={content} imageUrl={imageUrl} />}
      </div>
    </div>
  );
}
