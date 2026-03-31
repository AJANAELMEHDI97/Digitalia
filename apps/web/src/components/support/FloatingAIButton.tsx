import { useState } from "react";
import { Bot, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AIAssistantPopover } from "./AIAssistantPopover";
import { cn } from "@/lib/utils";

export function FloatingAIButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Popover with CSS transition instead of framer-motion */}
        <div 
          className={cn(
            "absolute bottom-16 right-0 mb-2 transition-all duration-150 ease-out",
            isOpen 
              ? "opacity-100 scale-100 translate-y-0" 
              : "opacity-0 scale-95 translate-y-2 pointer-events-none"
          )}
        >
          {isOpen && <AIAssistantPopover onClose={() => setIsOpen(false)} />}
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setIsOpen(!isOpen)}
              size="icon"
              className={cn(
                "h-12 w-12 rounded-full shadow-lg transition-all duration-150",
                isOpen 
                  ? "bg-muted hover:bg-muted/80" 
                  : "bg-primary hover:bg-primary/90"
              )}
            >
              {/* Simple icon swap with CSS transition */}
              <div className="relative w-5 h-5">
                <X className={cn(
                  "absolute inset-0 h-5 w-5 transition-all duration-150",
                  isOpen ? "opacity-100 rotate-0" : "opacity-0 rotate-90"
                )} />
                <Bot className={cn(
                  "absolute inset-0 h-5 w-5 transition-all duration-150",
                  isOpen ? "opacity-0 -rotate-90" : "opacity-100 rotate-0"
                )} />
              </div>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>{isOpen ? "Fermer l'assistant" : "Aide IA"}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Backdrop for mobile - simple CSS transition */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/20 z-40 md:hidden transition-opacity duration-150",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />
    </>
  );
}
