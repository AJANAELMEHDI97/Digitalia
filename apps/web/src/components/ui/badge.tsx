import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive/10 text-destructive",
        outline: "text-foreground border-border",
        // Statuts de publication
        draft: "status-draft border",
        pending: "status-pending border",
        scheduled: "status-scheduled border",
        published: "status-published border",
        refused: "border-transparent bg-destructive/10 text-destructive",
        // Sensibilité
        opportune: "sensitivity-opportune border-transparent",
        watch: "sensitivity-watch border-transparent",
        avoid: "sensitivity-avoid border-transparent",
        // Performance
        good: "perf-good border-transparent",
        average: "perf-average border-transparent",
        poor: "perf-poor border-transparent",
        // Éléments calendrier
        keydate: "keydate border",
        event: "judicial-event border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
