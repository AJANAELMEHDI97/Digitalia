import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Mail } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSimpleAuth } from "@/hooks/useSimpleAuth";
import { useToast } from "@/hooks/use-toast";
import { TOKEN_STORAGE_KEY, refreshStoredSession } from "@/lib/local-auth";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { signIn, user, loading } = useSimpleAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Compute API base URL for OAuth redirects (always use backend)
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:4000";

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  // handle OAuth redirect tokens
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const error = params.get("error");
    if (error) {
      toast({ variant: "destructive", title: "Erreur OAuth", description: error });
      return;
    }
    if (token) {
      try {
        window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
      } catch (e) {
        // ignore storage errors
      }
      (async () => {
        const session = await refreshStoredSession().catch(() => null);
        if (session) {
          navigate("/dashboard");
        } else {
          toast({ variant: "destructive", title: "Connexion impossible", description: "Impossible de recuperer le profil depuis le token." });
        }
      })();
    }
  }, [navigate, toast]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: error.message,
      });
      setIsLoading(false);
      return;
    }

    toast({
      title: "Connexion reussie",
      description: "Bienvenue sur SocialPulse.",
    });

    navigate("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthLayout tagline="Connectez-vous parfaitement avec votre public.">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Se connecter a votre compte
          </h1>
          <p className="text-muted-foreground">
            Utilisez votre email et votre mot de passe SocialPulse.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="sr-only">Email</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="nassimelhattabi@gmail.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-12 pl-12 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
                required
                disabled={isLoading}
                autoComplete="email"
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
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-12 bg-muted/50 border-0 pr-12 focus-visible:ring-1 focus-visible:ring-primary"
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
              Mot de passe oublie ?
            </Link>
          </div>

          <Button type="submit" className="w-full h-12 font-semibold uppercase tracking-wide" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connexion...
              </>
            ) : (
              "Connexion"
            )}
          </Button>
        </form>

        <div className="grid grid-cols-1 gap-3">
          <Button onClick={() => (window.location.href = `${apiBase}/auth/oauth/google`)} className="w-full h-12 bg-white text-black border">
            Se connecter avec Google
          </Button>
          <Button onClick={() => toast({ title: "Bientôt", description: "Connexion via Apple disponible prochainement." })} className="w-full h-12">
            Se connecter avec Apple (bientot)
          </Button>
          <Button
            onClick={async () => {
              try {
                const phone = window.prompt("Entrez votre numero de telephone (ex: +33123456789)");
                if (!phone) return;
                const startRes = await fetch(`${apiBase}/auth/phone/start`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ phone }),
                });
                const startJson = await startRes.json();
                if (!startRes.ok) {
                  toast({ variant: "destructive", title: "Erreur", description: startJson?.message ?? "Impossible d'envoyer le code." });
                  return;
                }
                if (startJson?.debug?.code) {
                  // In dev, show the code to the user
                  window.alert(`Code (dev): ${startJson.debug.code}`);
                } else {
                  toast({ title: "Code envoye", description: "Un code a ete envoye par SMS." });
                }
                const code = window.prompt("Entrez le code recu par SMS");
                if (!code) return;
                const verifyRes = await fetch(`${apiBase}/auth/phone/verify`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ phone, code }),
                });
                const verifyJson = await verifyRes.json();
                if (!verifyRes.ok) {
                  toast({ variant: "destructive", title: "Erreur de verification", description: verifyJson?.message ?? "Code invalide." });
                  return;
                }
                try {
                  window.localStorage.setItem(TOKEN_STORAGE_KEY, verifyJson.token);
                } catch (e) {
                  // ignore
                }
                const session = await refreshStoredSession().catch(() => null);
                if (session) {
                  navigate("/dashboard");
                } else {
                  toast({ variant: "destructive", title: "Connexion impossible", description: "Impossible de recuperer le profil depuis le token." });
                }
              } catch (error: any) {
                toast({ variant: "destructive", title: "Erreur", description: error?.message ?? String(error) });
              }
            }}
            className="w-full h-12"
          >
            Se connecter par telephone
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            Vous n'avez pas de compte ?{" "}
            <Link to="/demo" className="text-primary font-medium hover:underline">
              Contactez-nous
            </Link>
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Cette version locale utilise le backend Docker SocialPulse deja demarre sur ta machine.
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
