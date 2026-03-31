import { useState } from "react";
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
  Sparkles,
  User,
  Eye,
  AlertTriangle,
  Zap,
  Send,
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
import { SocialPreviewCompact } from "@/components/preview/SocialPreview";
import { DuplicateButton } from "@/components/duplication/DuplicateButton";
import { PlatformBadge } from "@/components/ui/platform-badge";
import { ValidationSLATimer } from "@/components/validation/ValidationSLATimer";
import { ModificationRequestDialog } from "@/components/validation/ModificationRequestDialog";
import { ValidationAuditTrail } from "@/components/validation/ValidationAuditTrail";
import { useUserRole } from "@/hooks/useUserRole";
import type { Publication } from "@/hooks/usePublications";
import type { ValidationTimeInfo } from "@/hooks/useValidationSLA";

interface ValidationCardEnhancedProps {
  publication: Publication;
  timeInfo: ValidationTimeInfo;
  onValidate: (id: string) => Promise<boolean>;
  onReject: (id: string, reason: string) => Promise<boolean>;
  onRequestModification: (id: string, comment: string) => Promise<boolean>;
  onEdit: (publication: Publication) => void;
  isCMMode?: boolean;
}

export function ValidationCardEnhanced({
  publication,
  timeInfo,
  onValidate,
  onReject,
  onRequestModification,
  onEdit,
  isCMMode = false,
}: ValidationCardEnhancedProps) {
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [showValidateConfirm, setShowValidateConfirm] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showModificationDialog, setShowModificationDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const { 
    canValidatePublications, 
    canRejectPublications,
    canEditOwnContent,
    canEditAllCabinetContent,
    isReadOnlyMode 
  } = useUserRole();

  const canEdit = canEditOwnContent || canEditAllCabinetContent;

  const handleValidate = async () => {
    setLoading(true);
    await onValidate(publication.id);
    setLoading(false);
    setShowValidateConfirm(false);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setLoading(true);
    await onReject(publication.id, rejectReason);
    setLoading(false);
    setShowRejectDialog(false);
    setRejectReason("");
  };

  const handleRequestModification = async (comment: string) => {
    setLoading(true);
    await onRequestModification(publication.id, comment);
    setLoading(false);
    setShowModificationDialog(false);
  };

  const scheduledDate = new Date(publication.scheduled_date);

  const getProposalExplanation = () => {
    if (publication.source === "socialpulse") {
      const explanations = [
        "Proposé en lien avec l'actualité juridique récente.",
        "Proposé en lien avec une date clé du calendrier juridique.",
        "Proposé pour renforcer votre présence pédagogique.",
      ];
      const index = publication.id.charCodeAt(0) % explanations.length;
      return explanations[index];
    }
    return null;
  };

  const proposalExplanation = getProposalExplanation();

  return (
    <>
      <Card className={cn(
        "p-5 space-y-4 transition-all",
        isCMMode && "border-blue-200 dark:border-blue-800",
        !isCMMode && timeInfo.isExpired && "border-destructive/50 bg-destructive/5",
        !isCMMode && timeInfo.isCritical && !timeInfo.isExpired && "border-amber-500/50 bg-amber-50/50 dark:bg-amber-900/10",
        !isCMMode && timeInfo.isUrgent && !timeInfo.isCritical && "border-amber-300"
      )}>
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {/* Status badges */}
              {isCMMode ? (
                <Badge variant="outline" className="border-blue-500 text-blue-600 dark:text-blue-400">
                  <Send className="h-3 w-3 mr-1" />
                  À vérifier
                </Badge>
              ) : timeInfo.isExpired ? (
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Expiré
                </Badge>
              ) : (
                <Badge variant="pending">
                  À valider
                </Badge>
              )}
              
              <PlatformBadge platform={publication.platform} />
              
              {publication.urgency === 'urgent' && (
                <Badge variant="outline" className="border-amber-500 text-amber-600">
                  <Zap className="h-3 w-3 mr-1" />
                  Urgent
                </Badge>
              )}
              
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
              
              {/* SLA Timer - only for lawyer mode */}
              {!isCMMode && (timeInfo.submittedAt || timeInfo.expiresAt) && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <ValidationSLATimer timeInfo={timeInfo} variant="compact" />
                </>
              )}
            </div>
            
            {publication.platform === "blog" && publication.title && (
              <h3 className="font-semibold text-base mb-1">{publication.title}</h3>
            )}
            
            <p className="text-sm text-foreground line-clamp-3">
              {publication.content}
            </p>
            
            {proposalExplanation && (
              <p className="text-xs text-muted-foreground mt-2 italic">
                {proposalExplanation}
              </p>
            )}

            {publication.modification_request_comment && (
              <div className="mt-3 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <p className="text-xs font-medium text-amber-800 dark:text-amber-200 mb-1">
                  Modification demandée :
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  "{publication.modification_request_comment}"
                </p>
              </div>
            )}
          </div>
          
          {publication.image_url && (
            <img
              src={publication.image_url}
              alt=""
              className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
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
          {isCMMode ? (
            /* ===== CM Actions ===== */
            <>
              {!isReadOnlyMode && (
                <Button
                  size="sm"
                  onClick={() => setShowValidateConfirm(true)}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Send className="h-4 w-4 mr-1.5" />
                  Approuver et envoyer
                </Button>
              )}
              
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
              
              {!isReadOnlyMode && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowRejectDialog(true)}
                  disabled={loading}
                  className="text-destructive hover:text-destructive"
                >
                  <XCircle className="h-4 w-4 mr-1.5" />
                  Rejeter
                </Button>
              )}
            </>
          ) : (
            /* ===== Lawyer Actions ===== */
            <>
              {canValidatePublications && !isReadOnlyMode && !timeInfo.isExpired && (
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
              
              {canValidatePublications && !isReadOnlyMode && !timeInfo.isExpired && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowModificationDialog(true)}
                  disabled={loading}
                  className="text-amber-600 hover:text-amber-700"
                >
                  <MessageSquare className="h-4 w-4 mr-1.5" />
                  Demander modification
                </Button>
              )}
              
              {canRejectPublications && !isReadOnlyMode && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowRejectDialog(true)}
                  disabled={loading}
                  className="text-destructive hover:text-destructive"
                >
                  <XCircle className="h-4 w-4 mr-1.5" />
                  Refuser
                </Button>
              )}
            </>
          )}
          
          {/* Common actions */}
          {canEdit && !isReadOnlyMode && !isCMMode && (
            <DuplicateButton publication={publication} />
          )}
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setShowPreview(!showPreview);
              if (showAuditTrail) setShowAuditTrail(false);
            }}
          >
            <Eye className="h-4 w-4 mr-1.5" />
            Aperçu
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setShowAuditTrail(!showAuditTrail);
              if (showPreview) setShowPreview(false);
            }}
            className="ml-auto"
          >
            Historique
            {showAuditTrail ? (
              <ChevronUp className="h-4 w-4 ml-1" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-1" />
            )}
          </Button>
        </div>

        {/* Preview Section */}
        {showPreview && (
          <div className="pt-2">
            <Separator className="mb-4" />
            <SocialPreviewCompact 
              content={publication.content} 
              imageUrl={publication.image_url} 
            />
          </div>
        )}

        {/* Audit Trail Section */}
        {showAuditTrail && (
          <div className="pt-2">
            <Separator className="mb-4" />
            <ValidationAuditTrail publicationId={publication.id} />
          </div>
        )}
      </Card>

      {/* Validate/Approve Confirmation */}
      <AlertDialog open={showValidateConfirm} onOpenChange={setShowValidateConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isCMMode 
                ? "Approuver et envoyer à l'avocat ?"
                : "Valider cette publication ?"
              }
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isCMMode 
                ? `Cette publication sera envoyée à l'avocat pour validation finale. Programmée le ${format(scheduledDate, "d MMMM yyyy", { locale: fr })} à ${publication.scheduled_time.slice(0, 5)}.`
                : `La publication passera en statut "Programmé" et sera prête pour diffusion le ${format(scheduledDate, "d MMMM yyyy", { locale: fr })} à ${publication.scheduled_time.slice(0, 5)}.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleValidate}
              disabled={loading}
              className={isCMMode ? "bg-blue-600 hover:bg-blue-700" : "bg-status-scheduled-foreground hover:opacity-90"}
            >
              {isCMMode ? "Envoyer à l'avocat" : "Valider"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isCMMode ? "Rejeter cette publication ?" : "Refuser cette publication ?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isCMMode 
                ? "La publication sera retirée de la file d'attente. Indiquez la raison."
                : "Indiquez la raison du refus. Le Community Manager sera notifié."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder={isCMMode ? "Raison du rejet..." : "Motif du refus..."}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={loading || !rejectReason.trim()}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isCMMode ? "Rejeter" : "Refuser"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modification Request Dialog - only for lawyer */}
      {!isCMMode && (
        <ModificationRequestDialog
          open={showModificationDialog}
          onOpenChange={setShowModificationDialog}
          onConfirm={handleRequestModification}
          loading={loading}
        />
      )}
    </>
  );
}

export default ValidationCardEnhanced;
