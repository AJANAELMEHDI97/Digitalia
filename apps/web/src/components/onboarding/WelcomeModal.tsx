import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Edit, Sparkles, ArrowRight } from "lucide-react";

interface WelcomeModalProps {
  open: boolean;
  onComplete: () => void;
}

export function WelcomeModal({ open, onComplete }: WelcomeModalProps) {
  const navigate = useNavigate();

  const handleDiscover = () => {
    onComplete();
    navigate("/validation");
  };

  const handleClose = () => {
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl">
            Bienvenue, Maître 👋
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            Votre plateforme de communication professionnelle, conçue pour les avocats et cabinets d'avocats.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <FeatureItem
            icon={Sparkles}
            title="Des prises de parole prêtes à valider"
            description="SocialPulse vous propose des communications adaptées à votre pratique juridique."
          />
          <FeatureItem
            icon={CheckCircle}
            title="Contrôle total sur votre image"
            description="Validez, modifiez ou rejetez chaque proposition avant diffusion."
          />
          <FeatureItem
            icon={Edit}
            title="Créez en toute liberté"
            description="Rédigez vos propres prises de parole à tout moment."
          />
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={handleDiscover} className="w-full">
            Voir mes communications à valider
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="ghost" onClick={handleClose} className="w-full">
            Explorer la plateforme
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FeatureItem({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-lg bg-muted flex-shrink-0">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}