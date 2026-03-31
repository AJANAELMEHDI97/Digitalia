import { useState, useMemo, useCallback } from "react";
import {
  FileCheck,
  Inbox,
  Newspaper,
  ChevronLeft,
  ChevronRight,
  Shield,
  Send,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ValidationCardEnhanced } from "@/components/validation/ValidationCardEnhanced";
import {
  ValidationFilters,
  type ValidationFilterType,
} from "@/components/validation/ValidationFilters";
import { PublicationDialog } from "@/components/calendar/PublicationDialog";
import { BlogArticleDialog } from "@/components/blog/BlogArticleDialog";
import { usePublications, Publication } from "@/hooks/usePublications";
import { useBlogArticles, type CreateArticleData } from "@/hooks/useBlogArticles";
import { useValidationSLA, type ValidationTimeInfo } from "@/hooks/useValidationSLA";
import { useSimpleRole } from "@/hooks/useSimpleRole";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ITEMS_PER_PAGE = 8;

export default function Validation() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [blogDialogOpen, setBlogDialogOpen] = useState(false);
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Publication | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [activeTab, setActiveTab] = useState("all");
  const [activeFilter, setActiveFilter] = useState<ValidationFilterType>("all");

  const { isCommunityManager, isLawyer } = useSimpleRole();
  const isCMMode = isCommunityManager && !isLawyer;

  const {
    publications,
    loading,
    updatePublication,
    deletePublication,
    createPublication,
  } = usePublications({ showAllFirms: isCommunityManager });

  const { updateArticle, deleteArticle, createArticle } = useBlogArticles();
  const {
    getValidationTimeInfo,
    validatePublication,
    refusePublication,
    requestModification,
    approveByCM,
    rejectByCM,
    filterByValidationStatus,
  } = useValidationSLA();

  const sortedPublications = useMemo(() => {
    return [...publications].sort(
      (left, right) =>
        new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime(),
    );
  }, [publications]);

  const { pendingSocialPosts, pendingBlogArticles, allPending } = useMemo(() => {
    const pending = sortedPublications.filter((publication) => {
      if (isCMMode) {
        return (
          publication.status === "brouillon" ||
          publication.validation_status === "modified_by_lawyer"
        );
      }

      return publication.status === "a_valider";
    });

    return {
      pendingSocialPosts: pending.filter((publication) => publication.platform !== "blog"),
      pendingBlogArticles: pending.filter((publication) => publication.platform === "blog"),
      allPending: pending,
    };
  }, [isCMMode, sortedPublications]);

  const firmGroups = useMemo(() => {
    if (!isCMMode || allPending.length <= 1) return null;

    const groups: Record<string, { name: string; items: Publication[] }> = {};
    for (const publication of allPending) {
      const firmKey = publication.law_firm_id || "non-assigne";
      if (!groups[firmKey]) {
        groups[firmKey] = { name: firmKey, items: [] };
      }
      groups[firmKey].items.push(publication);
    }

    return Object.keys(groups).length > 1 ? groups : null;
  }, [allPending, isCMMode]);

  const filterCounts = useMemo(() => {
    if (isCMMode) {
      return { all: allPending.length, urgent: 0, today: 0, week: 0, expired: 0 };
    }

    return {
      all: allPending.length,
      urgent: filterByValidationStatus(allPending, "urgent").length,
      today: filterByValidationStatus(allPending, "today").length,
      week: filterByValidationStatus(allPending, "week").length,
      expired: filterByValidationStatus(allPending, "expired").length,
    };
  }, [allPending, filterByValidationStatus, isCMMode]);

  const currentItems = useMemo(() => {
    let items: Publication[];
    switch (activeTab) {
      case "social":
        items = pendingSocialPosts;
        break;
      case "blog":
        items = pendingBlogArticles;
        break;
      default:
        items = allPending;
    }

    if (!isCMMode && activeFilter !== "all") {
      items = filterByValidationStatus(items, activeFilter);
    }

    return items;
  }, [
    activeFilter,
    activeTab,
    allPending,
    filterByValidationStatus,
    isCMMode,
    pendingBlogArticles,
    pendingSocialPosts,
  ]);

  const totalPages = Math.ceil(currentItems.length / ITEMS_PER_PAGE);
  const paginatedItems = useMemo(() => {
    const start = currentPage * ITEMS_PER_PAGE;
    return currentItems.slice(start, start + ITEMS_PER_PAGE);
  }, [currentItems, currentPage]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(0);
  };

  const handleFilterChange = (filter: ValidationFilterType) => {
    setActiveFilter(filter);
    setCurrentPage(0);
  };

  const handleCMApprove = useCallback(async (id: string) => {
    return approveByCM(id);
  }, [approveByCM]);

  const handleCMReject = useCallback(async (id: string, reason: string) => {
    return rejectByCM(id, reason);
  }, [rejectByCM]);

  const handleValidate = useCallback(async (id: string) => {
    return validatePublication(id);
  }, [validatePublication]);

  const handleReject = useCallback(async (id: string, reason: string) => {
    return refusePublication(id, reason);
  }, [refusePublication]);

  const handleRequestModification = useCallback(async (id: string, comment: string) => {
    return requestModification(id, comment);
  }, [requestModification]);

  const handleEdit = (publication: Publication) => {
    if (publication.platform === "blog") {
      setSelectedArticle(publication);
      setBlogDialogOpen(true);
      return;
    }

    setSelectedPublication(publication);
    setDialogOpen(true);
  };

  const handleBlogSave = async (data: CreateArticleData) => {
    if (selectedArticle) {
      await updateArticle({ id: selectedArticle.id, ...data });
    } else {
      await createArticle(data);
    }

    setBlogDialogOpen(false);
    setSelectedArticle(null);
  };

  const handleBlogDelete = async (id: string) => {
    await deleteArticle(id);
    setBlogDialogOpen(false);
    setSelectedArticle(null);
  };

  const summaryCards = useMemo(() => {
    const cmReturnCount = allPending.filter(
      (publication) => publication.validation_status === "modified_by_lawyer",
    ).length;

    return [
      {
        label: isCMMode ? "A relire" : "En attente",
        value: allPending.length,
        icon: isCMMode ? Send : FileCheck,
        tone: isCMMode ? "blue" : "amber",
      },
      {
        label: "Reseaux sociaux",
        value: pendingSocialPosts.length,
        icon: Send,
        tone: "blue",
      },
      {
        label: "Articles blog",
        value: pendingBlogArticles.length,
        icon: Newspaper,
        tone: "purple",
      },
      {
        label: isCMMode ? "Retours avocat" : "Urgentes",
        value: isCMMode ? cmReturnCount : filterCounts.urgent,
        icon: Shield,
        tone: isCMMode ? "green" : "rose",
      },
    ] as const;
  }, [
    allPending,
    filterCounts.urgent,
    isCMMode,
    pendingBlogArticles.length,
    pendingSocialPosts.length,
  ]);

  return (
    <AppLayout>
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 pb-10">
        <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-[20px] ${
                isCMMode ? "bg-[#eaf2ff]" : "bg-[#fff3da]"
              }`}
            >
              {isCMMode ? (
                <Send className="h-6 w-6 text-[#4f6bff]" />
              ) : (
                <FileCheck className="h-6 w-6 text-[#f59f0d]" />
              )}
            </div>
            <div>
              <h1 className="text-[34px] font-bold tracking-[-0.04em] text-[#1f2538] md:text-[42px]">
                {isCMMode
                  ? "Publications a verifier avant envoi"
                  : "Publications en attente de validation"}
              </h1>
              <p className="mt-1 text-[18px] text-[#9aa1b8]">
                {isCMMode
                  ? "Controlez les contenus avant envoi au cabinet et gardez un flux editorial propre."
                  : "Validez, refusez ou demandez des ajustements avant toute diffusion."}
              </p>
            </div>
          </div>

          <div className="inline-flex h-11 items-center rounded-full border border-[#ebe0a9] bg-[#fff9ea] px-5 text-[14px] font-semibold text-[#a86507]">
            {allPending.length} element{allPending.length > 1 ? "s" : ""} a traiter
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <ValidationSummaryCard key={card.label} {...card} />
          ))}
        </div>

        <div
          className={`rounded-[30px] border px-7 py-6 ${
            isCMMode
              ? "border-[#cfe0ff] bg-[linear-gradient(90deg,#f4f8ff_0%,#fbfdff_100%)]"
              : "border-[#f4cf67] bg-[linear-gradient(90deg,#fffaf0_0%,#fffdf7_100%)]"
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                isCMMode ? "bg-[#e7f0ff]" : "bg-[#fff3da]"
              }`}
            >
              <Shield className={`h-5 w-5 ${isCMMode ? "text-[#4f6bff]" : "text-[#f59f0d]"}`} />
            </div>
            <div className="text-[15px] leading-7 text-[#6f7691]">
              {isCMMode ? (
                <>
                  <strong className="text-[#1f2538]">Revue CM avant envoi au cabinet.</strong>{" "}
                  Verifiez le fond, la forme et la conformite editoriale avant de soumettre.
                </>
              ) : (
                <>
                  <strong className="text-[#1f2538]">Aucune publication sans validation explicite de l'avocat.</strong>{" "}
                  Vous gardez le controle total sur chaque prise de parole diffusee au nom du cabinet.
                </>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-48 w-full rounded-[26px]" />
            ))}
          </div>
        ) : allPending.length === 0 ? (
          <EmptyState isCM={isCMMode} />
        ) : (
          <div className="space-y-6 rounded-[30px] border border-[#e9edf7] bg-white p-5 shadow-[0_14px_40px_rgba(110,122,167,0.05)] md:p-6">
            {!isCMMode && (
              <ValidationFilters
                activeFilter={activeFilter}
                onFilterChange={handleFilterChange}
                counts={filterCounts}
              />
            )}

            {firmGroups ? (
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-6 flex h-auto flex-wrap gap-3 rounded-[24px] bg-[#f4f6fc] p-2">
                  <TabsTrigger
                    value="all"
                    className="h-11 rounded-[16px] border border-transparent bg-white px-4 text-[14px] font-semibold text-[#68718d] data-[state=active]:border-[#dddafc] data-[state=active]:text-[#1f2538]"
                  >
                    Tous les cabinets
                    <Badge variant="secondary" className="ml-1">
                      {allPending.length}
                    </Badge>
                  </TabsTrigger>
                  {Object.entries(firmGroups).map(([firmId, group]) => (
                    <TabsTrigger key={firmId} value={firmId} className="gap-2">
                      {group.name}
                      <Badge variant="secondary" className="ml-1">
                        {group.items.length}
                      </Badge>
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  <ValidationItemsList
                    items={paginatedItems}
                    getValidationTimeInfo={getValidationTimeInfo}
                    onValidate={isCMMode ? handleCMApprove : handleValidate}
                    onReject={isCMMode ? handleCMReject : handleReject}
                    onRequestModification={handleRequestModification}
                    onEdit={handleEdit}
                    emptyType="social"
                    isCMMode={isCMMode}
                  />
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={currentItems.length}
                    onPageChange={setCurrentPage}
                  />
                </TabsContent>

                {Object.entries(firmGroups).map(([firmId, group]) => (
                  <TabsContent key={firmId} value={firmId} className="space-y-4">
                    <ValidationItemsList
                      items={group.items.slice(
                        currentPage * ITEMS_PER_PAGE,
                        (currentPage + 1) * ITEMS_PER_PAGE,
                      )}
                      getValidationTimeInfo={getValidationTimeInfo}
                      onValidate={isCMMode ? handleCMApprove : handleValidate}
                      onReject={isCMMode ? handleCMReject : handleReject}
                      onRequestModification={handleRequestModification}
                      onEdit={handleEdit}
                      emptyType="social"
                      isCMMode={isCMMode}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="mb-6 flex h-auto flex-wrap gap-3 rounded-[24px] bg-[#f4f6fc] p-2">
                  <TabsTrigger
                    value="all"
                    className="h-11 rounded-[16px] border border-transparent bg-white px-4 text-[14px] font-semibold text-[#68718d] data-[state=active]:border-[#dddafc] data-[state=active]:text-[#1f2538]"
                  >
                    Tout
                    <Badge variant="secondary" className="ml-1">
                      {allPending.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value="social"
                    className="h-11 rounded-[16px] border border-transparent bg-white px-4 text-[14px] font-semibold text-[#68718d] data-[state=active]:border-[#dddafc] data-[state=active]:text-[#1f2538]"
                  >
                    Reseaux sociaux
                    <Badge variant="secondary" className="ml-1">
                      {pendingSocialPosts.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value="blog"
                    className="h-11 rounded-[16px] border border-transparent bg-white px-4 text-[14px] font-semibold text-[#68718d] data-[state=active]:border-[#dddafc] data-[state=active]:text-[#1f2538]"
                  >
                    <Newspaper className="h-3.5 w-3.5" />
                    Blog
                    <Badge
                      variant="secondary"
                      className="ml-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                    >
                      {pendingBlogArticles.length}
                    </Badge>
                  </TabsTrigger>
                </TabsList>

                {["all", "social", "blog"].map((tab) => (
                  <TabsContent key={tab} value={tab} className="space-y-4">
                    <ValidationItemsList
                      items={paginatedItems}
                      getValidationTimeInfo={getValidationTimeInfo}
                      onValidate={isCMMode ? handleCMApprove : handleValidate}
                      onReject={isCMMode ? handleCMReject : handleReject}
                      onRequestModification={handleRequestModification}
                      onEdit={handleEdit}
                      emptyType={tab === "blog" ? "blog" : "social"}
                      isCMMode={isCMMode}
                    />
                    <PaginationControls
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={currentItems.length}
                      onPageChange={setCurrentPage}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </div>
        )}

        <PublicationDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          publication={selectedPublication}
          onSave={createPublication}
          onUpdate={updatePublication}
          onDelete={deletePublication}
        />

        <BlogArticleDialog
          open={blogDialogOpen}
          onOpenChange={setBlogDialogOpen}
          article={selectedArticle}
          onSave={handleBlogSave}
          onDelete={handleBlogDelete}
        />
      </div>
    </AppLayout>
  );
}

function ValidationSummaryCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof FileCheck;
  tone: "amber" | "blue" | "purple" | "green" | "rose";
}) {
  const toneMap = {
    amber: {
      iconWrap: "bg-[#fff3da]",
      icon: "text-[#f59f0d]",
    },
    blue: {
      iconWrap: "bg-[#eaf2ff]",
      icon: "text-[#4f6bff]",
    },
    purple: {
      iconWrap: "bg-[#f1ecff]",
      icon: "text-[#6557e8]",
    },
    green: {
      iconWrap: "bg-[#eafff2]",
      icon: "text-[#18ba7b]",
    },
    rose: {
      iconWrap: "bg-[#fff0f0]",
      icon: "text-[#ff655c]",
    },
  } as const;

  return (
    <div className="rounded-[26px] border border-[#e9edf7] bg-white px-5 py-5 shadow-[0_10px_30px_rgba(112,122,163,0.05)]">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-[18px] ${toneMap[tone].iconWrap}`}>
          <Icon className={`h-5 w-5 ${toneMap[tone].icon}`} />
        </div>
        <div>
          <p className="text-[24px] font-bold leading-none text-[#1f2538]">{value}</p>
          <p className="mt-1 text-[14px] text-[#9aa1b8]">{label}</p>
        </div>
      </div>
    </div>
  );
}

interface ValidationItemsListProps {
  items: Publication[];
  getValidationTimeInfo: (
    submittedAt: string | null | undefined,
    expiresAt: string | null | undefined,
    urgency: unknown,
  ) => ValidationTimeInfo;
  onValidate: (id: string) => Promise<boolean>;
  onReject: (id: string, reason: string) => Promise<boolean>;
  onRequestModification: (id: string, comment: string) => Promise<boolean>;
  onEdit: (publication: Publication) => void;
  emptyType: "social" | "blog";
  isCMMode?: boolean;
}

function ValidationItemsList({
  items,
  getValidationTimeInfo,
  onValidate,
  onReject,
  onRequestModification,
  onEdit,
  emptyType,
  isCMMode,
}: ValidationItemsListProps) {
  if (items.length === 0) {
    return <EmptyTabState type={emptyType} isCM={isCMMode} />;
  }

  return (
    <>
      {items.map((publication) => (
        <ValidationCardEnhanced
          key={publication.id}
          publication={publication}
          timeInfo={getValidationTimeInfo(
            publication.submitted_at,
            publication.expires_at,
            publication.urgency,
          )}
          onValidate={onValidate}
          onReject={onReject}
          onRequestModification={onRequestModification}
          onEdit={onEdit}
          isCMMode={isCMMode}
        />
      ))}
    </>
  );
}

function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const startItem = currentPage * ITEMS_PER_PAGE + 1;
  const endItem = Math.min((currentPage + 1) * ITEMS_PER_PAGE, totalItems);

  return (
    <div className="flex items-center justify-between border-t border-[#edf0f8] pt-4">
      <p className="text-sm text-[#8d94ab]">
        {startItem}-{endItem} sur {totalItems}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
        >
          <ChevronLeft className="h-4 w-4" />
          Precedent
        </Button>
        <span className="px-2 text-sm text-[#8d94ab]">
          {currentPage + 1} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
        >
          Suivant
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function EmptyState({ isCM }: { isCM?: boolean }) {
  return (
    <div className="rounded-[30px] border border-dashed border-[#d8ddec] bg-white px-6 py-16 text-center shadow-[0_10px_30px_rgba(112,122,163,0.04)]">
      <div className="mb-4 inline-flex rounded-full bg-[#f4f6fc] p-4">
        <Inbox className="h-8 w-8 text-[#9aa1b8]" />
      </div>
      <h2 className="mb-1 text-lg font-semibold text-[#1f2538]">
        {isCM ? "Aucune publication a verifier" : "Aucune communication en attente"}
      </h2>
      <p className="mx-auto max-w-sm text-sm text-[#8d94ab]">
        {isCM
          ? "Les brouillons prets a etre envoyes au cabinet apparaitront ici."
          : "Vos prises de parole validees seront publiees selon votre planification."}
      </p>
    </div>
  );
}

function EmptyTabState({ type, isCM }: { type: "social" | "blog"; isCM?: boolean }) {
  return (
    <div className="rounded-[26px] border border-dashed border-[#d8ddec] bg-[#fbfcff] px-6 py-12 text-center">
      <div className="mb-3 inline-flex rounded-full bg-[#f4f6fc] p-3">
        {type === "blog" ? (
          <Newspaper className="h-6 w-6 text-[#9aa1b8]" />
        ) : (
          <Inbox className="h-6 w-6 text-[#9aa1b8]" />
        )}
      </div>
      <h3 className="mb-1 font-medium text-[#1f2538]">
        {type === "blog" ? "Aucun article a valider" : "Aucune prise de parole a valider"}
      </h3>
      <p className="text-sm text-[#8d94ab]">
        {isCM
          ? "Les contenus a relire apparaitront ici."
          : type === "blog"
            ? "Vos articles de blog en attente apparaitront ici."
            : "Vos prises de parole reseaux sociaux en attente apparaitront ici."}
      </p>
    </div>
  );
}
