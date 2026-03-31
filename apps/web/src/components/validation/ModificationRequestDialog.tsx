import React, { useState } from "react";
import { MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ModificationRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (comment: string) => Promise<void>;
  loading?: boolean;
}

export function ModificationRequestDialog({
  open,
  onOpenChange,
  onConfirm,
  loading = false,
}: ModificationRequestDialogProps) {
  const [comment, setComment] = useState("");

  const handleConfirm = async () => {
    if (!comment.trim()) return;
    await onConfirm(comment.trim());
    setComment("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) setComment("");
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Demander une modification
          </DialogTitle>
          <DialogDescription>
            Indiquez les modifications souhaitées. Le Community Manager sera notifié et pourra corriger la publication.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="modification-comment">
              Commentaire <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="modification-comment"
              placeholder="Décrivez les modifications que vous souhaitez apporter à cette publication..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[120px] resize-none"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Soyez précis pour faciliter le travail du CM (ton, formulation, informations manquantes, etc.)
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!comment.trim() || loading}
          >
            Demander la modification
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ModificationRequestDialog;