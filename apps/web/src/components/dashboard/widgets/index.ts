// Widget Registry - Maps widget IDs to their components
import { lazy, ComponentType } from "react";
import { Publication } from "@/hooks/usePublications";

// Widget props interfaces
export interface BaseWidgetProps {
  isEditing?: boolean;
}

export interface PublicationsWidgetProps extends BaseWidgetProps {
  publications: Publication[];
  loading: boolean;
}

export interface MetricsWidgetProps extends BaseWidgetProps {
  loading: boolean;
  metrics: {
    received: number;
    receivedTrend: string;
    campaigns: number;
    campaignsTrend: string;
    opened: number;
    openedTrend: string;
    clicks: number;
    clicksTrend: string;
    totalSubscribers: number;
    totalPublications: number;
  };
}

// Widget component mapping
export const WIDGET_COMPONENTS: Record<string, ComponentType<any>> = {};

// Register widgets dynamically (will be populated in Dashboard)
export function registerWidget(id: string, component: ComponentType<any>) {
  WIDGET_COMPONENTS[id] = component;
}

// Category labels
export const CATEGORY_LABELS: Record<string, string> = {
  metrics: "📊 Métriques",
  content: "📝 Contenu",
  planning: "📅 Planification",
  actions: "⚡ Actions",
};

// Category icons
export const CATEGORY_ICONS: Record<string, string> = {
  metrics: "chart-line",
  content: "file-text",
  planning: "calendar",
  actions: "zap",
};
