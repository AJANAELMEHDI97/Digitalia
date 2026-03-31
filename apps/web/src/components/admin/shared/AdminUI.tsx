import { cn } from "@/lib/utils";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

/* ══════════════════════════════════════════════════
   Shared Admin Design Components
   Ensures visual consistency across all admin pages
   ══════════════════════════════════════════════════ */

/* ── Page Header ── */
export function AdminPageHeader({
  title,
  subtitle,
  icon: Icon,
  actions,
}: {
  title: string;
  subtitle: string;
  icon?: React.ComponentType<{ className?: string }>;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight flex items-center gap-2">
          {Icon && <Icon className="h-6 w-6 text-primary" />}
          {title}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
      {actions}
    </div>
  );
}

/* ── Section Title ── */
export function AdminSectionTitle({
  title,
  icon: Icon,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-5 w-5 text-muted-foreground" />
      <h2 className="text-[20px] font-semibold text-foreground">{title}</h2>
    </div>
  );
}

/* ── KPI Card — Unified design across all admin pages ── */
export function AdminKPICard({
  label,
  value,
  sub,
  icon: Icon,
  alert,
  positive,
  tooltip,
  className,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  alert?: boolean;
  positive?: boolean;
  tooltip?: string;
  className?: string;
}) {
  const card = (
    <div
      className={cn(
        "rounded-lg border bg-card p-4 flex flex-col gap-1.5 transition-shadow hover:shadow-elevated min-h-[96px]",
        alert && "border-destructive/20",
        tooltip && "cursor-help",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider truncate">
          {label}
        </span>
        <Icon
          className={cn(
            "h-4 w-4 shrink-0",
            alert ? "text-destructive/60" : "text-muted-foreground/50"
          )}
        />
      </div>
      <span
        className={cn(
          "text-[28px] font-bold tabular-nums leading-tight",
          alert ? "text-destructive" : positive ? "text-sp-success" : "text-primary"
        )}
      >
        {value}
      </span>
      {sub && (
        <span
          className={cn(
            "text-xs font-medium",
            positive ? "text-sp-success" : alert ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {sub}
        </span>
      )}
    </div>
  );

  if (!tooltip) return card;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{card}</TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs text-xs leading-relaxed">
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}

/* ── Mini KPI — For inline compact stats ── */
export function AdminMiniKPI({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="text-center p-4 rounded-lg bg-muted/30 min-h-[80px] flex flex-col justify-center">
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p className={cn("text-xl font-bold tabular-nums mt-1", color || "text-foreground")}>
        {value}
      </p>
      {sub && (
        <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
      )}
    </div>
  );
}

/* ── Chart tooltip style — Consistent across all charts ── */
export const ADMIN_CHART_TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
} as const;

/* ── Chart axis tick — Consistent across all charts ── */
export const ADMIN_CHART_AXIS_TICK = {
  fill: "hsl(var(--muted-foreground))",
  fontSize: 11,
} as const;

/* ── Chart legend item ── */
export function AdminChartLegend({
  items,
}: {
  items: { label: string; color: string; dashed?: boolean }[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-5 mt-3 text-[11px] text-muted-foreground">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          {item.dashed ? (
            <span
              className="h-0.5 w-4 rounded"
              style={{ borderTop: `1.5px dashed ${item.color}`, background: "none" }}
            />
          ) : (
            <span
              className="h-0.5 w-4 rounded"
              style={{ backgroundColor: item.color }}
            />
          )}
          {item.label}
        </span>
      ))}
    </div>
  );
}
