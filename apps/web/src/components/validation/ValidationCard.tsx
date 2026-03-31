import { useState, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CheckCircle,
  XCircle,
  Edit,
  MessageSquare,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
  Send,
  Trash2,
  Sparkles,
  User,
  Eye,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useComments, Comment } from "@/hooks/useComments";
import { SocialPreviewCompact } from "@/components/preview/SocialPreview";
import { DuplicateButton } from "@/components/duplication/DuplicateButton";
import { PlatformBadge } from "@/components/ui/platform-badge";
import { AutoValidationCountdown, AutoValidationInfo } from "@/components/validation/AutoValidationCountdown";
import { useUserRole } from "@/hooks/useUserRole";
import type { Publication } from "@/hooks/usePublications";

interface ValidationCardProps {
  publication: Publication;
  onValidate: (id: string) => Promise<boolean>;
  onReject: (id: string) => Promise<boolean>;
  onEdit: (publication: Publication) => void;
  autoValidationInfo?: AutoValidationInfo | null;
}

export function ValidationCard({
  publication,
  onValidate,
  onReject,
  onEdit,
  autoValidationInfo,
}: ValidationCardProps) {
  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [showValidateConfirm, setShowValidateConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [keepTone, setKeepTone] = useState(false);

  // Permissions basées sur les rôles
  const { 
    canValidatePublications, 
    canRejectPublications,
    canEditOwnContent,
    canEditAllCabinetContent,
    isReadOnlyMode 
  } = useUserRole();

  // Peut modifier si c'est un CM (son contenu) ou un Lawyer (tout le cabinet)
  const canEdit = canEditOwnContent || canEditAllCabinetContent;

  const { comments, fetchComments, addComment, deleteComment } = useComments(
    publication.id
  );

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments, fetchComments]);

  const handleValidate = async () => {
    setLoading(true);
    await onValidate(publication.id);
    setLoading(false);
    setShowValidateConfirm(false);
  };

  const handleReject = async () => {
    setLoading(true);
    await onReject(publication.id);
    setLoading(false);
    setShowRejectConfirm(false);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    await addComment(newComment);
    setNewComment("");
  };

  const scheduledDate = new Date(publication.scheduled_date);

  // Generate explanation based on publication source and context
  const getProposalExplanation = () => {
    if (publication.source === "socialpulse") {
      const explanations = [
        "Proposé en lien avec l'actualité juridique récente.",
        "Proposé en lien avec une date clé du calendrier juridique.",
        "Proposé pour renforcer votre présence pédagogique.",
      ];
      // Use a deterministic selection based on publication id
      const index = publication.id.charCodeAt(0) % explanations.length;
      return explanations[index];
    }
    return null;
  };

  const proposalExplanation = getProposalExplanation();

  return (
    <>
      <Card className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="pending">
                À valider
              </Badge>
              <PlatformBadge platform={publication.platform} />
              {publication.source === "socialpulse" ? (
                <Badge variant="outline" className="text-xs border-primary/50 text-primary">
                  <Sparkles className="h-3 w-3 mr-1" />
                  SocialPulse
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  <User className="h-3 w-3 mr-1" />
                  Manuel
                </Badge>
              )}
              {/* Chrono inline - toujours visible pour les publications SocialPulse */}
              {autoValidationInfo && publication.source === "socialpulse" && (
                <span className="text-muted-foreground">•</span>
              )}
              {autoValidationInfo && publication.source === "socialpulse" && (
                <AutoValidationCountdown 
                  info={autoValidationInfo}
                  variant="inline"
                />
              )}
            </div>
            {/* Blog article title */}
            {publication.platform === "blog" && publication.title && (
              <h3 className="font-semibold text-base mb-1">{publication.title}</h3>
            )}
            <p className="text-sm text-foreground line-clamp-3">
              {publication.content}
            </p>
            {/* Proposal explanation for SocialPulse content */}
            {proposalExplanation && (
              <p className="text-xs text-muted-foreground mt-2 italic">
                {proposalExplanation}
              </p>
            )}
            {/* Tone preference checkbox for SocialPulse */}
            {publication.source === "socialpulse" && (
              <div className="flex items-center gap-2 mt-3">
                <input
                  type="checkbox"
                  id={`keep-tone-${publication.id}`}
                  checked={keepTone}
                  onChange={(e) => setKeepTone(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-muted-foreground/30"
                />
                <label 
                  htmlFor={`keep-tone-${publication.id}`}
                  className="text-xs text-muted-foreground cursor-pointer"
                >
                  Conserver ce ton pour les prochaines prises de parole
                </label>
              </div>
            )}
          </div>
          {publication.image_url && (
            <img
              src={publication.image_url}
              alt=""
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            />
          )}
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>{format(scheduledDate, "d MMMM yyyy", { locale: fr })}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>{publication.scheduled_time.slice(0, 5)}</span>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {/* Bouton Valider - uniquement pour Lawyer */}
          {canValidatePublications && !isReadOnlyMode && (
            <Button
              size="sm"
              onClick={() => setShowValidateConfirm(true)}
              disabled={loading}
              className="bg-status-scheduled-foreground hover:opacity-90 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-1.5" />
              Valider
            </Button>
          )}
          
          {/* Bouton Modifier - pour CM et Lawyer */}
          {canEdit && !isReadOnlyMode && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(publication)}
              disabled={loading}
            >
              <Edit className="h-4 w-4 mr-1.5" />
              Modifier
            </Button>
          )}
          
          {/* Bouton Rejeter - uniquement pour Lawyer */}
          {canRejectPublications && !isReadOnlyMode && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowRejectConfirm(true)}
              disabled={loading}
              className="text-destructive hover:text-destructive"
            >
              <XCircle className="h-4 w-4 mr-1.5" />
              Rejeter
            </Button>
          )}
          
          {/* Duplication - pour CM et Lawyer */}
          {canEdit && !isReadOnlyMode && (
            <DuplicateButton publication={publication} />
          )}
          
          {/* Aperçu - visible pour tous */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setShowPreview(!showPreview);
              if (showComments) setShowComments(false);
            }}
          >
            <Eye className="h-4 w-4 mr-1.5" />
            Aperçu
          </Button>
          
          {/* Commentaires - visible pour tous */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setShowComments(!showComments);
              if (showPreview) setShowPreview(false);
            }}
            className="ml-auto"
          >
            <MessageSquare className="h-4 w-4 mr-1.5" />
            {comments.length > 0 && `(${comments.length})`}
            {showComments ? (
              <ChevronUp className="h-4 w-4 ml-1" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-1" />
            )}
          </Button>
        </div>

        {/* Social Preview Section */}
        {showPreview && (
          <div className="pt-2">
            <Separator className="mb-4" />
            <SocialPreviewCompact 
              content={publication.content} 
              imageUrl={publication.image_url} 
            />
          </div>
        )}

        {/* Comments Section */}
        {showComments && (
          <div className="space-y-3 pt-2">
            <Separator />
            
            {/* Comments List */}
            {comments.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    onDelete={deleteComment}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-2">
                Aucun commentaire
              </p>
            )}

            {/* Add Comment */}
            <div className="flex gap-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Ajouter un commentaire..."
                className="min-h-[60px] resize-none text-sm"
              />
              <Button
                size="icon"
                onClick={handleAddComment}
                disabled={!newComment.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Validate Confirmation */}
      <AlertDialog open={showValidateConfirm} onOpenChange={setShowValidateConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Valider cette publication ?</AlertDialogTitle>
            <AlertDialogDescription>
              La publication passera en statut "Programmé" et sera prête pour diffusion 
              le {format(scheduledDate, "d MMMM yyyy", { locale: fr })} à {publication.scheduled_time.slice(0, 5)}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleValidate}
              disabled={loading}
              className="bg-status-scheduled-foreground hover:opacity-90"
            >
              Valider
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Confirmation */}
      <AlertDialog open={showRejectConfirm} onOpenChange={setShowRejectConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rejeter cette publication ?</AlertDialogTitle>
            <AlertDialogDescription>
              La publication passera en statut "Brouillon". Vous pourrez la modifier et la resoumettre ultérieurement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={loading}
              className="bg-destructive hover:bg-destructive/90"
            >
              Rejeter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function CommentItem({
  comment,
  onDelete,
}: {
  comment: Comment;
  onDelete: (id: string) => Promise<boolean>;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(comment.id);
    setDeleting(false);
  };

  return (
    <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/50 group">
      <div className="flex-1 min-w-0">
        <p className="text-sm">{comment.content}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {format(new Date(comment.created_at), "d MMM à HH:mm", { locale: fr })}
        </p>
      </div>
      <Button
        size="icon"
        variant="ghost"
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleDelete}
        disabled={deleting}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}
