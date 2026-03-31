import { useMemo, useCallback } from "react";
import { usePublications, type UpdatePublicationData } from "./usePublications";

export interface CreateArticleData {
  title: string;
  content: string;
  image_url?: string | null;
  scheduled_date: string;
  scheduled_time: string;
  status: "brouillon" | "a_valider" | "programme";
}

export function useBlogArticles() {
  const {
    publications,
    loading,
    createPublication,
    updatePublication,
    deletePublication,
    refetch,
  } = usePublications();

  const articles = useMemo(() => {
    return publications.filter((publication) => publication.platform === "blog");
  }, [publications]);

  const createArticle = useCallback(async (data: CreateArticleData) => {
    const article = await createPublication({
      title: data.title,
      content: data.content,
      image_url: data.image_url || null,
      scheduled_date: data.scheduled_date,
      scheduled_time: data.scheduled_time,
      status: data.status,
      source: "manual",
      platform: "blog",
    });

    await refetch();
    return article;
  }, [createPublication, refetch]);

  const updateArticle = useCallback(async (data: UpdatePublicationData & { title?: string }) => {
    return updatePublication(data as UpdatePublicationData);
  }, [updatePublication]);

  const deleteArticle = useCallback(async (id: string) => {
    return deletePublication(id);
  }, [deletePublication]);

  return {
    articles,
    loading,
    createArticle,
    updateArticle,
    deleteArticle,
    refetch,
  };
}
