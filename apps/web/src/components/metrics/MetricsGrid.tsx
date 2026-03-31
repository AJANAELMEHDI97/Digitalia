import { useState, useMemo, memo } from "react";
import { MetricsCard } from "./MetricsCard";
import type { PerformanceLevel, PerformanceAnalysis } from "@/data/mockMetrics";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export interface MetricsPublication {
  id: string;
  publicationId?: string;
  content: string;
  platform: "linkedin" | "instagram" | "facebook" | "twitter";
  publishedAt: string;
  imageUrl?: string;
  reach: number;
  likes: number;
  comments: number;
  shares?: number;
  clicks?: number;
  engagementRate: number;
  performanceLevel: PerformanceLevel;
  analysis: PerformanceAnalysis;
  audienceAge?: { range: string; percentage: number }[];
  audienceLocation?: { location: string; percentage: number }[];
  audienceGender?: { gender: string; percentage: number }[];
  peakTimes?: { day: string; hour: string }[];
}

interface MetricsGridProps {
  publications: MetricsPublication[];
  onSelect: (publication: MetricsPublication) => void;
  itemsPerPage?: number;
}

const ITEMS_PER_PAGE = 9;

// Memoized card component for performance
const MemoizedMetricsCard = memo(MetricsCard);

export function MetricsGrid({ publications, onSelect, itemsPerPage = ITEMS_PER_PAGE }: MetricsGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(publications.length / itemsPerPage);
  
  const paginatedPublications = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return publications.slice(start, start + itemsPerPage);
  }, [publications, currentPage, itemsPerPage]);

  // Reset to page 1 when publications change (filters applied)
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  if (publications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <span className="text-2xl">📊</span>
        </div>
        <h3 className="text-lg font-medium mb-2">Aucune publication trouvée</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Modifiez vos filtres pour afficher d'autres publications.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {paginatedPublications.map((pub) => (
          <MemoizedMetricsCard
            key={pub.id}
            id={pub.id}
            content={pub.content}
            platform={pub.platform}
            publishedAt={pub.publishedAt}
            imageUrl={pub.imageUrl}
            reach={pub.reach}
            likes={pub.likes}
            comments={pub.comments}
            engagementRate={pub.engagementRate}
            performanceLevel={pub.performanceLevel}
            analysis={pub.analysis}
            onClick={() => onSelect(pub)}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    onClick={() => setCurrentPage(pageNum)}
                    isActive={currentPage === pageNum}
                    className="cursor-pointer"
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Results summary */}
      <p className="text-center text-xs text-muted-foreground">
        Affichage {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, publications.length)} sur {publications.length}
      </p>
    </div>
  );
}
