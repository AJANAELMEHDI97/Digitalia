import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// Widget definitions
export interface WidgetConfig {
  id: string;
  name: string;
  description: string;
  category: "metrics" | "content" | "planning" | "actions";
  defaultSize: { w: number; h: number };
  minSize?: { w: number; h: number };
  maxSize?: { w: number; h: number };
}

export const AVAILABLE_WIDGETS: WidgetConfig[] = [
  {
    id: "stats",
    name: "Statistiques clés",
    description: "Vue d'ensemble des métriques principales",
    category: "metrics",
    defaultSize: { w: 4, h: 1 },
  },
  {
    id: "engagements",
    name: "Graphique engagements",
    description: "Courbe d'évolution des engagements",
    category: "metrics",
    defaultSize: { w: 2, h: 2 },
  },
  {
    id: "subscribers",
    name: "Abonnés",
    description: "Répartition des abonnés par plateforme",
    category: "metrics",
    defaultSize: { w: 1, h: 2 },
  },
  {
    id: "publications",
    name: "Publications récentes",
    description: "Liste des dernières publications",
    category: "content",
    defaultSize: { w: 2, h: 2 },
  },
  {
    id: "topics",
    name: "Top Topics",
    description: "Sujets les plus performants",
    category: "content",
    defaultSize: { w: 2, h: 2 },
  },
  {
    id: "validation",
    name: "À valider",
    description: "Publications en attente de validation",
    category: "actions",
    defaultSize: { w: 2, h: 2 },
  },
  {
    id: "coverage",
    name: "Couverture",
    description: "Portée totale des publications",
    category: "metrics",
    defaultSize: { w: 1, h: 1 },
  },
];

// Layout item with position and size
export interface DashboardLayoutItem {
  i: string; // Widget ID
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DashboardLayoutData {
  widgets: string[]; // IDs of visible widgets
  layouts: {
    lg: DashboardLayoutItem[];
    md: DashboardLayoutItem[];
    sm: DashboardLayoutItem[];
  };
  version: number;
}

// Default layout
const DEFAULT_LAYOUT: DashboardLayoutData = {
  widgets: ["stats", "engagements", "subscribers", "validation", "topics", "publications"],
  layouts: {
    lg: [
      { i: "stats", x: 0, y: 0, w: 4, h: 1 },
      { i: "engagements", x: 0, y: 1, w: 2, h: 2 },
      { i: "subscribers", x: 2, y: 1, w: 1, h: 2 },
      { i: "validation", x: 3, y: 1, w: 1, h: 2 },
      { i: "topics", x: 0, y: 3, w: 2, h: 2 },
      { i: "publications", x: 2, y: 3, w: 2, h: 2 },
    ],
    md: [
      { i: "stats", x: 0, y: 0, w: 3, h: 1 },
      { i: "engagements", x: 0, y: 1, w: 2, h: 2 },
      { i: "subscribers", x: 2, y: 1, w: 1, h: 2 },
      { i: "validation", x: 0, y: 3, w: 1, h: 2 },
      { i: "topics", x: 1, y: 3, w: 1, h: 2 },
      { i: "publications", x: 2, y: 3, w: 1, h: 2 },
    ],
    sm: [
      { i: "stats", x: 0, y: 0, w: 2, h: 1 },
      { i: "engagements", x: 0, y: 1, w: 2, h: 2 },
      { i: "subscribers", x: 0, y: 3, w: 1, h: 2 },
      { i: "validation", x: 1, y: 3, w: 1, h: 2 },
      { i: "topics", x: 0, y: 5, w: 2, h: 2 },
      { i: "publications", x: 0, y: 7, w: 2, h: 2 },
    ],
  },
  version: 5,
};

export function useDashboardLayout() {
  const [layout, setLayout] = useState<DashboardLayoutData>(DEFAULT_LAYOUT);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch layout from database
  const fetchLayout = useCallback(async () => {
    if (!user) {
      setLayout(DEFAULT_LAYOUT);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("dashboard_layout")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data?.dashboard_layout) {
        const savedLayout = data.dashboard_layout as unknown as DashboardLayoutData;
        if (savedLayout.widgets && savedLayout.layouts && savedLayout.version) {
          setLayout(savedLayout);
        } else {
          setLayout(DEFAULT_LAYOUT);
        }
      } else {
        setLayout(DEFAULT_LAYOUT);
      }
    } catch (err) {
      console.error("Error fetching dashboard layout:", err);
      setLayout(DEFAULT_LAYOUT);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLayout();
  }, [fetchLayout]);

  return {
    layout,
    loading,
  };
}
