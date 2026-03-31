import { useState } from "react";
import { Phone, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PhoneSignInProps {
  onBack: () => void;
  onSuccess: () => void;
  disabled?: boolean;
}

export function PhoneSignIn({ onBack, onSuccess, disabled }: PhoneSignInProps) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const formatPhoneNumber = (value: string): string => {
    // Remove non-digit characters except +
    let cleaned = value.replace(/[^\d+]/g, "");
    
    // If starts with 0, assume French number and convert to +33
    if (cleaned.startsWith("0")) {
      cleaned = "+33" + cleaned.slice(1);
    }
    
    // If no country code, assume French
    if (cleaned && !cleaned.startsWith("+")) {
      cleaned = "+33" + cleaned;
    }
    
    return cleaned;
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formattedPhone = formatPhoneNumber(phone);
    
    if (!formattedPhone || formattedPhone.length < 10) {
      toast({
        variant: "destructive",
        title: "Numéro invalide",
        description: "Veuillez entrer un numéro de téléphone valide",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: error.message,
        });
        return;
      }

      toast({
        title: "Code envoyé",
        description: "Un code de vérification a été envoyé à votre téléphone",
      });
      setStep("otp");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'envoyer le code",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast({
        variant: "destructive",
        title: "Code incomplet",
        description: "Veuillez entrer le code à 6 chiffres",
      });
      return;
    }

    setIsLoading(true);

    try {
      const formattedPhone = formatPhoneNumber(phone);
      
      const { error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: "sms",
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Code invalide",
          description: "Le code entré est incorrect ou a expiré",
        });
        return;
      }

      toast({
        title: "Connexion réussie",
        description: "Bienvenue !",
      });
      onSuccess();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de vérifier le code",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "otp") {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => setStep("phone")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Modifier le numéro
        </button>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-primary">Vérification</h2>
          <p className="text-muted-foreground">
            Entrez le code à 6 chiffres envoyé au {phone}
          </p>
        </div>

        <form onSubmit={handleVerifyOTP} className="space-y-6">
          <div className="flex justify-center">
            <InputOTP
              value={otp}
              onChange={setOtp}
              maxLength={6}
              disabled={isLoading || disabled}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            type="submit"
            className="w-full h-12 font-semibold"
            disabled={isLoading || disabled || otp.length !== 6}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Vérification...
              </>
            ) : (
              "Vérifier le code"
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={handleSendOTP}
            disabled={isLoading || disabled}
          >
            Renvoyer le code
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </button>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-primary">Connexion par téléphone</h2>
        <p className="text-muted-foreground">
          Entrez votre numéro de téléphone pour recevoir un code de vérification
        </p>
      </div>

      <form onSubmit={handleSendOTP} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone" className="sr-only">Numéro de téléphone</Label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              placeholder="06 12 34 56 78"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-12 pl-12 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
              required
              disabled={isLoading || disabled}
              autoComplete="tel"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Format français (06...) ou international (+33...)
          </p>
        </div>

        <Button
          type="submit"
          className="w-full h-12 font-semibold"
          disabled={isLoading || disabled || !phone.trim()}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            "Envoyer le code"
          )}
        </Button>
      </form>
    </div>
  );
}
