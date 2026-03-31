import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[] | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export type FAQCategory = 
  | "all"
  | "Prise en main"
  | "Publications"
  | "Calendrier"
  | "Métriques"
  | "Tendances"
  | "Abonnement";

export function useFAQ() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("faq")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (fetchError) throw fetchError;
      
      setFaqs(data || []);
    } catch (err) {
      console.error("Error fetching FAQ:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch FAQ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFAQs();
  }, []);

  // Filter FAQs by category
  const getFAQsByCategory = useMemo(() => {
    return (category: FAQCategory) => {
      if (category === "all") return faqs;
      return faqs.filter(f => f.category === category);
    };
  }, [faqs]);

  // Search FAQs
  const searchFAQs = useMemo(() => {
    return (query: string) => {
      if (!query.trim()) return faqs;
      
      const lowerQuery = query.toLowerCase();
      return faqs.filter(f => 
        f.question.toLowerCase().includes(lowerQuery) ||
        f.answer.toLowerCase().includes(lowerQuery) ||
        f.keywords?.some(k => k.toLowerCase().includes(lowerQuery))
      );
    };
  }, [faqs]);

  // Group FAQs by category
  const groupedFAQs = useMemo(() => {
    const groups: Record<string, FAQ[]> = {};
    
    faqs.forEach(faq => {
      if (!groups[faq.category]) {
        groups[faq.category] = [];
      }
      groups[faq.category].push(faq);
    });

    return groups;
  }, [faqs]);

  // Get all categories
  const categories = useMemo(() => {
    return [...new Set(faqs.map(f => f.category))];
  }, [faqs]);

  return {
    faqs,
    loading,
    error,
    getFAQsByCategory,
    searchFAQs,
    groupedFAQs,
    categories,
    refetch: fetchFAQs
  };
}
