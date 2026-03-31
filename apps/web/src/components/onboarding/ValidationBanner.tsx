import { useState } from "react";
import { Lightbulb, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const BANNER_KEY = "socialpulse_validation_banner_dismissed";

export function ValidationBanner() {
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem(BANNER_KEY) === "true";
  });

  if (dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(BANNER_KEY, "true");
    setDismissed(true);
  };

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
      <div className="p-2 rounded-full bg-primary/10 flex-shrink-0">
        <Lightbulb className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">
          Ces publications sont proposées par SocialPulse
        </p>
        <p className="text-sm text-muted-foreground mt-0.5">
          Vous gardez toujours le contrôle : validez, modifiez ou rejetez selon vos besoins.
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-foreground"
        onClick={handleDismiss}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}