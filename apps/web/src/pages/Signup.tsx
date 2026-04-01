import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Eye, EyeOff, Loader2, Mail, User } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function Signup() {
  const { user, loading, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password.length < 8) {
      toast({
        variant: "destructive",
        title: "Mot de passe trop court",
        description: "Le mot de passe doit contenir au moins 8 caracteres.",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Confirmation invalide",
        description: "Les deux mots de passe doivent etre identiques.",
      });
      return;
    }

    setIsSubmitting(true);
    const { error } = await signUp(email, password, fullName, organizationName);

    if (error) {
      toast({
        variant: "destructive",
        title: "Creation impossible",
        description: error.message,
      });
      setIsSubmitting(false);
      return;
    }

    toast({
      title: "Compte cree",
      description: "Votre espace Digitalia est pret.",
    });
    navigate("/onboarding");
  };

  return (
    <AuthLayout
      illustration="people"
      tagline="Rejoignez-nous et maitrisez votre communication."
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Creer un compte
          </h1>
          <p className="text-muted-foreground">
            Utilise le frontend complet du zip avec le backend local Docker.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="sr-only">Nom complet</Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="fullName"
                type="text"
                placeholder="Nom complet"
                className="h-12 pl-12 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                autoComplete="name"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="organizationName" className="sr-only">Organisation</Label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="organizationName"
                type="text"
                placeholder="Nom de l'organisation"
                className="h-12 pl-12 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
                value={organizationName}
                onChange={(event) => setOrganizationName(event.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="sr-only">Email</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="vous@cabinet.ma"
                className="h-12 pl-12 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="sr-only">Mot de passe</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                className="h-12 bg-muted/50 border-0 pr-12 focus-visible:ring-1 focus-visible:ring-primary"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                disabled={isSubmitting}
                required
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="sr-only">Confirmation</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirmer le mot de passe"
                className="h-12 bg-muted/50 border-0 pr-12 focus-visible:ring-1 focus-visible:ring-primary"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                disabled={isSubmitting}
                required
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowConfirmPassword((value) => !value)}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full h-12 font-semibold uppercase tracking-wide" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creation...
              </>
            ) : (
              "Creer mon compte"
            )}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          <span>Deja inscrit ? </span>
          <Link to="/login" className="text-primary font-medium hover:underline">
            Connectez-vous
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
