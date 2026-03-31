import { useCallback, useMemo } from "react";
import { format } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";
import { useAuth } from "./useAuth";
import { useUserRole } from "./useUserRole";
import { useLawFirmContextSafe } from "@/contexts/LawFirmContext";
import { toast } from "@/hooks/use-toast";

export type PublicationStatus = "brouillon" | "a_valider" | "programme" | "publie" | "refuse";
export type PublicationSource = "manual" | "socialpulse";
export type SocialPlatform =
  | "linkedin"
  | "instagram"
  | "facebook"
  | "twitter"
  | "blog"
  | "google_business";
export type ValidationExtendedStatus =
  | "draft"
  | "cm_review"
  | "submitted_to_lawyer"
  | "in_lawyer_review"
  | "validated"
  | "refused"
  | "modified_by_lawyer"
  | "expired"
  | "published";
export type UrgencyLevel = "normal" | "urgent";
export type ExpirationBehavior = "do_not_publish" | "save_as_draft" | "auto_publish";

export interface PublicationAttempt {
  id: string;
  provider: string;
  status: string;
  externalPostId: string | null;
  publishedUrl: string | null;
  publishedAt: string | null;
  deletedAt: string | null;
  errorMessage: string | null;
  accountName: string | null;
  accountHandle: string | null;
  canDelete: boolean;
}

interface ApiPost {
  id: string;
  lawFirmId: string | null;
  title: string;
  content: string;
  source: PublicationSource;
  imageUrl: string | null;
  parentId: string | null;
  priority: "routine" | "important" | "strategique" | null;
  platforms: string[];
  status: "draft" | "pending" | "approved" | "scheduled" | "rejected" | "published";
  scheduledAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  approvalRequired: boolean;
  hashtags: string[];
  location: string;
  mediaIds: string[];
  targetConnections: string[];
  preview: Record<string, unknown>;
  authorName: string;
  publications: PublicationAttempt[];
  rejectionReason: string | null;
  rejectedAt: string | null;
  modificationRequestComment: string | null;
}

export interface Publication {
  id: string;
  user_id: string;
  law_firm_id: string | null;
  title: string | null;
  content: string;
  image_url: string | null;
  scheduled_date: string;
  scheduled_time: string;
  status: PublicationStatus;
  source: PublicationSource;
  platform: SocialPlatform | null;
  platforms?: string[];
  parent_id: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  rejection_reason: string | null;
  rejected_at: string | null;
  priority?: "routine" | "important" | "strategique" | null;
  validation_status?: ValidationExtendedStatus | null;
  submitted_at?: string | null;
  expires_at?: string | null;
  urgency?: UrgencyLevel | null;
  modification_request_comment?: string | null;
  last_reminder_sent_at?: string | null;
  reminder_count?: number | null;
  hashtags?: string[];
  location?: string;
  target_connections?: string[];
  media_ids?: string[];
  author_name?: string;
  publications?: PublicationAttempt[];
  preview?: Record<string, unknown>;
}

export interface CreatePublicationData {
  title?: string | null;
  content: string;
  image_url?: string | null;
  scheduled_date: string;
  scheduled_time: string;
  status: PublicationStatus;
  source?: PublicationSource;
  platform?: SocialPlatform | null;
  platforms?: SocialPlatform[];
  parent_id?: string | null;
  published_at?: string | null;
  law_firm_id?: string | null;
  priority?: "routine" | "important" | "strategique" | null;
  hashtags?: string[];
  location?: string;
  media_ids?: string[];
  target_connections?: string[];
}

export interface UpdatePublicationData extends Partial<CreatePublicationData> {
  id: string;
  rejection_reason?: string | null;
  modification_request_comment?: string | null;
}

export interface UsePublicationsOptions {
  lawFirmIdOverride?: string | null;
  showAllFirms?: boolean;
  limit?: number;
  enabled?: boolean;
}

const BASE_QUERY_KEY = "publications";

const API_STATUS_TO_PUBLICATION_STATUS: Record<ApiPost["status"], PublicationStatus> = {
  draft: "brouillon",
  pending: "a_valider",
  approved: "programme",
  scheduled: "programme",
  rejected: "refuse",
  published: "publie",
};

const PUBLICATION_STATUS_TO_API_STATUS: Record<PublicationStatus, ApiPost["status"]> = {
  brouillon: "draft",
  a_valider: "pending",
  programme: "scheduled",
  publie: "published",
  refuse: "rejected",
};

const SUPPORTED_PLATFORMS: SocialPlatform[] = [
  "linkedin",
  "instagram",
  "facebook",
  "twitter",
  "blog",
  "google_business",
];

const buildTitle = (title: string | null | undefined, content: string) => {
  const normalizedTitle = title?.trim();
  if (normalizedTitle && normalizedTitle.length >= 3) {
    return normalizedTitle;
  }

  return content.replace(/\s+/g, " ").trim().slice(0, 80);
};

const resolveScheduledAt = (scheduledDate?: string | null, scheduledTime?: string | null) => {
  if (!scheduledDate) {
    return null;
  }

  const candidate = new Date(`${scheduledDate}T${scheduledTime ?? "09:00"}:00`);
  if (Number.isNaN(candidate.getTime())) {
    return null;
  }

  return candidate.toISOString();
};

const resolvePrimaryPlatform = (platforms: string[]): SocialPlatform | null => {
  const firstSupported = platforms.find((platform) =>
    SUPPORTED_PLATFORMS.includes(platform as SocialPlatform),
  );

  return firstSupported ? (firstSupported as SocialPlatform) : null;
};

const mapValidationStatus = (post: ApiPost): ValidationExtendedStatus => {
  if (post.status === "pending") return "submitted_to_lawyer";
  if (post.status === "rejected") return "refused";
  if (post.status === "published") return "published";
  if (post.modificationRequestComment) return "modified_by_lawyer";
  if (post.status === "approved" || post.status === "scheduled") return "validated";
  return "draft";
};

const mapApiPostToPublication = (post: ApiPost): Publication => {
  const scheduledReference = post.scheduledAt ?? post.createdAt;
  const scheduledDate = new Date(scheduledReference);
  const urgency: UrgencyLevel =
    post.priority && post.priority !== "routine" ? "urgent" : "normal";
  const submittedAt = post.status === "pending" ? post.updatedAt : null;
  const expiresAt =
    post.status === "pending"
      ? post.scheduledAt ??
        new Date(
          new Date(post.updatedAt).getTime() +
            (urgency === "urgent" ? 12 : 48) * 60 * 60 * 1000,
        ).toISOString()
      : null;

  return {
    id: post.id,
    user_id: post.authorName || "local-user",
    law_firm_id: post.lawFirmId,
    title: post.title,
    content: post.content,
    image_url: post.imageUrl,
    scheduled_date: format(scheduledDate, "yyyy-MM-dd"),
    scheduled_time: format(scheduledDate, "HH:mm"),
    status: API_STATUS_TO_PUBLICATION_STATUS[post.status],
    source: post.source || "manual",
    platform: resolvePrimaryPlatform(post.platforms),
    platforms: post.platforms,
    parent_id: post.parentId,
    published_at: post.publishedAt,
    created_at: post.createdAt,
    updated_at: post.updatedAt,
    rejection_reason: post.rejectionReason,
    rejected_at: post.rejectedAt,
    priority: post.priority,
    validation_status: mapValidationStatus(post),
    submitted_at: submittedAt,
    expires_at: expiresAt,
    urgency,
    modification_request_comment: post.modificationRequestComment,
    last_reminder_sent_at: null,
    reminder_count: 0,
    hashtags: post.hashtags,
    location: post.location,
    target_connections: post.targetConnections,
    media_ids: post.mediaIds,
    author_name: post.authorName,
    publications: post.publications,
    preview: post.preview,
  };
};

export function usePublications(options?: UsePublicationsOptions) {
  const { lawFirmIdOverride, showAllFirms = false, limit = 50, enabled = true } = options || {};
  const { user } = useAuth();
  const { isCommunityManager } = useUserRole();
  const { selectedFirmId, assignedFirms } = useLawFirmContextSafe();
  const queryClient = useQueryClient();

  const allFirmIds = useMemo(() => assignedFirms.map((firm) => firm.id), [assignedFirms]);

  const effectiveFirmId =
    lawFirmIdOverride !== undefined
      ? lawFirmIdOverride
      : isCommunityManager && !showAllFirms
        ? selectedFirmId
        : null;

  const baseQueryKey = useMemo(
    () => [BASE_QUERY_KEY, user?.id, limit],
    [user?.id, limit],
  );

  const { data: allPublications = [], isLoading: loading, refetch } = useQuery({
    queryKey: baseQueryKey,
    queryFn: async () => {
      if (!user) {
        return [] as Publication[];
      }

      const posts = await apiRequest<ApiPost[]>("/posts");
      return posts.map(mapApiPostToPublication);
    },
    enabled: enabled && Boolean(user),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const publications = useMemo(() => {
    let items = allPublications;

    if (isCommunityManager && showAllFirms && allFirmIds.length > 0) {
      items = items.filter(
        (publication) =>
          !publication.law_firm_id || allFirmIds.includes(publication.law_firm_id),
      );
    } else if (effectiveFirmId) {
      items = items.filter((publication) => publication.law_firm_id === effectiveFirmId);
    }

    return items.slice(0, limit);
  }, [allFirmIds, allPublications, effectiveFirmId, isCommunityManager, limit, showAllFirms]);

  const createPublication = useCallback(
    async (data: CreatePublicationData) => {
      if (!user) return null;

      const firmIdToUse = data.law_firm_id ?? (isCommunityManager ? selectedFirmId : null);
      const scheduledAt = resolveScheduledAt(data.scheduled_date, data.scheduled_time);
      const apiStatus = PUBLICATION_STATUS_TO_API_STATUS[data.status];
      const requestedPlatforms =
        data.platforms && data.platforms.length > 0
          ? data.platforms
          : data.platform
            ? [data.platform]
            : ["linkedin"];
      const payload = {
        title: buildTitle(data.title, data.content),
        content: data.content,
        platforms: requestedPlatforms,
        status: apiStatus,
        scheduledAt,
        approvalRequired: apiStatus === "pending",
        hashtags: data.hashtags ?? [],
        location: data.location ?? "",
        mediaIds: data.media_ids ?? [],
        targetConnections: data.target_connections ?? [],
        lawFirmId: firmIdToUse,
        source: data.source ?? "manual",
        imageUrl: data.image_url ?? null,
        parentId: data.parent_id ?? null,
        priority: data.priority ?? null,
      };

      try {
        const created = await apiRequest<ApiPost>("/posts", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        await queryClient.invalidateQueries({ queryKey: [BASE_QUERY_KEY] });
        toast({
          title: "Succes",
          description: "Publication creee",
        });

        return mapApiPostToPublication(created);
      } catch (error) {
        toast({
          title: "Erreur",
          description:
            error instanceof Error
              ? error.message
              : "Impossible de creer la publication",
          variant: "destructive",
        });
        return null;
      }
    },
    [isCommunityManager, queryClient, selectedFirmId, user],
  );

  const updatePublication = useCallback(
    async (data: UpdatePublicationData) => {
      const { id, ...updateData } = data;
      const existing = allPublications.find((publication) => publication.id === id);
      const nextContent = updateData.content ?? existing?.content;
      const nextTitle = buildTitle(updateData.title ?? existing?.title, nextContent ?? "");
      const nextPlatforms =
        updateData.platforms && updateData.platforms.length > 0
          ? updateData.platforms
          : updateData.platform !== undefined
          ? updateData.platform
            ? [updateData.platform]
            : existing?.platforms ?? ["linkedin"]
          : existing?.platforms ?? ["linkedin"];
      const nextScheduledDate = updateData.scheduled_date ?? existing?.scheduled_date;
      const nextScheduledTime = updateData.scheduled_time ?? existing?.scheduled_time;

      const payload: Record<string, unknown> = {};

      if (updateData.title !== undefined || updateData.content !== undefined) {
        payload.title = nextTitle;
      }
      if (updateData.content !== undefined) payload.content = updateData.content;
      if (updateData.platform !== undefined || updateData.platforms !== undefined) {
        payload.platforms = nextPlatforms;
      }
      if (updateData.status !== undefined) {
        payload.status = PUBLICATION_STATUS_TO_API_STATUS[updateData.status];
      }
      if (
        updateData.scheduled_date !== undefined ||
        updateData.scheduled_time !== undefined ||
        updateData.status === "programme"
      ) {
        payload.scheduledAt = resolveScheduledAt(nextScheduledDate, nextScheduledTime);
      }
      if (updateData.image_url !== undefined) payload.imageUrl = updateData.image_url;
      if (updateData.source !== undefined) payload.source = updateData.source;
      if (updateData.parent_id !== undefined) payload.parentId = updateData.parent_id;
      if (updateData.law_firm_id !== undefined) payload.lawFirmId = updateData.law_firm_id;
      if (updateData.priority !== undefined) payload.priority = updateData.priority;
      if (updateData.hashtags !== undefined) payload.hashtags = updateData.hashtags;
      if (updateData.location !== undefined) payload.location = updateData.location;
      if (updateData.media_ids !== undefined) payload.mediaIds = updateData.media_ids;
      if (updateData.target_connections !== undefined) {
        payload.targetConnections = updateData.target_connections;
      }
      if (updateData.rejection_reason !== undefined) {
        payload.rejectionReason = updateData.rejection_reason;
      }
      if (updateData.modification_request_comment !== undefined) {
        payload.modificationRequestComment = updateData.modification_request_comment;
      }

      try {
        await apiRequest(`/posts/${id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        await queryClient.invalidateQueries({ queryKey: [BASE_QUERY_KEY] });
        toast({
          title: "Succes",
          description: "Publication modifiee",
        });
        return true;
      } catch (error) {
        toast({
          title: "Erreur",
          description:
            error instanceof Error
              ? error.message
              : "Impossible de modifier la publication",
          variant: "destructive",
        });
        return false;
      }
    },
    [allPublications, queryClient],
  );

  const deletePublication = useCallback(
    async (id: string) => {
      try {
        await apiRequest(`/posts/${id}`, {
          method: "DELETE",
        });

        await queryClient.invalidateQueries({ queryKey: [BASE_QUERY_KEY] });
        toast({
          title: "Succes",
          description: "Publication supprimee",
        });
        return true;
      } catch (error) {
        toast({
          title: "Erreur",
          description:
            error instanceof Error
              ? error.message
              : "Impossible de supprimer la publication",
          variant: "destructive",
        });
        return false;
      }
    },
    [queryClient],
  );

  const publishPublicationNow = useCallback(
    async (id: string) => {
      try {
        const result = await apiRequest<{
          success: boolean;
          publicationOutcome?: {
            successCount?: number;
            failureCount?: number;
          };
        }>(`/posts/${id}/publish-now`, {
          method: "POST",
        });

        await queryClient.invalidateQueries({ queryKey: [BASE_QUERY_KEY] });
        const successCount = result.publicationOutcome?.successCount ?? 0;
        const failureCount = result.publicationOutcome?.failureCount ?? 0;

        toast({
          title: "Publication envoyee",
          description:
            successCount > 0
              ? `${successCount} reseau${successCount > 1 ? "x" : ""} publie${successCount > 1 ? "s" : ""}${failureCount > 0 ? `, ${failureCount} echec${failureCount > 1 ? "s" : ""}` : ""}.`
              : "Le post a ete envoye immediatement.",
        });
        return true;
      } catch (error) {
        toast({
          title: "Erreur",
          description:
            error instanceof Error
              ? error.message
              : "Impossible de publier ce contenu maintenant",
          variant: "destructive",
        });
        return false;
      }
    },
    [queryClient],
  );

  const deleteNetworkPublication = useCallback(
    async (postId: string, publicationId: string) => {
      try {
        const result = await apiRequest<{ success: boolean; message?: string }>(
          `/posts/${postId}/publications/${publicationId}`,
          {
            method: "DELETE",
          },
        );

        await queryClient.invalidateQueries({ queryKey: [BASE_QUERY_KEY] });
        toast({
          title: "Publication retiree",
          description: result.message ?? "Le contenu a ete retire du reseau.",
        });
        return true;
      } catch (error) {
        toast({
          title: "Erreur",
          description:
            error instanceof Error
              ? error.message
              : "Impossible de retirer la publication du reseau",
          variant: "destructive",
        });
        return false;
      }
    },
    [queryClient],
  );

  return {
    publications,
    loading,
    createPublication,
    updatePublication,
    deletePublication,
    publishPublicationNow,
    deleteNetworkPublication,
    refetch,
  };
}
