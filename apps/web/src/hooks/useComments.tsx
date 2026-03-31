import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";

export interface Comment {
  id: string;
  publication_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export function useComments(publicationId: string) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!publicationId) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from("publication_comments")
      .select("*")
      .eq("publication_id", publicationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);
    } else {
      setComments(data as Comment[]);
    }
    setLoading(false);
  }, [publicationId]);

  const addComment = async (content: string) => {
    if (!user || !publicationId || !content.trim()) return null;

    const { data, error } = await supabase
      .from("publication_comments")
      .insert({
        publication_id: publicationId,
        user_id: user.id,
        content: content.trim(),
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le commentaire",
        variant: "destructive",
      });
      return null;
    }

    toast({
      title: "Commentaire ajouté",
    });
    
    await fetchComments();
    return data as Comment;
  };

  const deleteComment = async (commentId: string) => {
    const { error } = await supabase
      .from("publication_comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le commentaire",
        variant: "destructive",
      });
      return false;
    }

    await fetchComments();
    return true;
  };

  return {
    comments,
    loading,
    fetchComments,
    addComment,
    deleteComment,
  };
}
