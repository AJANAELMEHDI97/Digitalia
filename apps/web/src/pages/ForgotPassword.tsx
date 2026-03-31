import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'envoyer l'email de réinitialisation. Vérifiez votre adresse email.",
      });
      setIsLoading(false);
      return;
    }

    setSubmitted(true);
    setIsLoading(false);
  };

  if (submitted) {
    return (
      <AuthLayout tagline="Réinitialisez votre mot de passe en toute sécurité.">
        <div className="space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
            <Mail className="h-8 w-8 text-accent" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Vérifiez votre boîte mail
            </h1>
            <p className="text-muted-foreground">
              Nous avons envoyé un lien de réinitialisation à{" "}
              <span className="font-medium text-foreground">{email}</span>
            </p>
          </div>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-12"
              onClick={() => setSubmitted(false)}
            >
              Renvoyer l'email
            </Button>
            <Link to="/login">
              <Button variant="ghost" className="w-full h-12">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la connexion
              </Button>
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout tagline="Réinitialisez votre mot de passe en toute sécurité.">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-gradient-pink">
            Mot de passe oublié?
          </h1>
          <p className="text-muted-foreground">
            Entrez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="sr-only">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
              required
            />
          </div>

          <Button 
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold uppercase tracking-wide"
          >
            {isLoading ? "Envoi en cours..." : "Envoyer le lien"}
          </Button>
        </form>

        {/* Back to login */}
        <div className="text-center">
          <Link 
            to="/login"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la connexion
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
