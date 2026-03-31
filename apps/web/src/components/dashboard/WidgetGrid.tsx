import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { DashboardLayoutData } from "@/hooks/useDashboardLayout";

interface WidgetGridProps {
  layout: DashboardLayoutData;
  renderWidget: (widgetId: string) => React.ReactNode;
}

export function WidgetGrid({
  layout,
  renderWidget,
}: WidgetGridProps) {
  // Get widget size class based on layout
  const getWidgetSizeClass = useCallback((widgetId: string) => {
    const item = layout.layouts.lg.find(l => l.i === widgetId);
    if (!item) return "col-span-1";
    
    if (item.w >= 4) return "col-span-full";
    if (item.w >= 2) return "col-span-2 lg:col-span-2";
    return "col-span-1";
  }, [layout]);

  return (
    <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-4">
      {layout.widgets.map((widgetId) => (
        <div 
          key={widgetId} 
          className={cn(getWidgetSizeClass(widgetId))}
        >
          {renderWidget(widgetId)}
        </div>
      ))}
    </div>
  );
}
