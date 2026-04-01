import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Lightbulb,
  Users,
  SkipForward,
  Sparkles,
  Search,
  Plus,
  X,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

const TOTAL_STEPS = 4;

const SECTORS = [
  "Juridique / Droit",
  "Finance / Banque",
  "Santé / Médical",
  "Immobilier",
  "Marketing / Communication",
  "Technologie / IT",
  "Education / Formation",
  "Commerce / Retail",
  "Conseil / Consulting",
  "Autre",
];

const ORG_SIZES = [
  { label: "1 - 5 personnes", value: "1-5" },
  { label: "6 - 20 personnes", value: "6-20" },
  { label: "21 - 100 personnes", value: "21-100" },
  { label: "100+ personnes", value: "100+" },
];

const SOCIAL_PLATFORMS = [
  {
    id: "linkedin",
    label: "LinkedIn",
    icon: Linkedin,
    color: "#0A66C2",
    bg: "#E8F0FA",
  },
  {
    id: "facebook",
    label: "Facebook",
    icon: Facebook,
    color: "#1877F2",
    bg: "#E7F0FD",
  },
  {
    id: "instagram",
    label: "Instagram",
    icon: Instagram,
    color: "#E1306C",
    bg: "#FCE8EF",
  },
  {
    id: "twitter",
    label: "X / Twitter",
    icon: Twitter,
    color: "#000000",
    bg: "#F0F0F0",
  },
  {
    id: "youtube",
    label: "YouTube",
    icon: Youtube,
    color: "#FF0000",
    bg: "#FFE8E8",
  },
];

const DEFAULT_KEYWORDS = [
  "droit des affaires",
  "actualité juridique",
  "intelligence artificielle",
  "réglementation RGPD",
  "jurisprudence",
];

const FEATURE_HIGHLIGHTS = [
  {
    icon: Building2,
    title: "Calendrier éditorial",
    desc: "Planifiez et organisez vos publications à l'avance.",
  },
  {
    icon: Sparkles,
    title: "Éditeur de post",
    desc: "Créez des contenus multi-plateformes en un clic.",
  },
  {
    icon: Users,
    title: "Workflow de validation",
    desc: "Soumettez vos posts pour approbation avant publication.",
  },
  {
    icon: Lightbulb,
    title: "Métriques & Tendances",
    desc: "Analysez vos performances et explorez les tendances.",
  },
];

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              index < step
                ? "bg-[#5b63d3] w-8"
                : index === step
                  ? "bg-[#5b63d3]/40 w-8"
                  : "bg-[#e9edf7] w-5"
            }`}
          />
        </div>
      ))}
    </div>
  );
}

function StepWrapper({
  children,
  direction,
}: {
  children: React.ReactNode;
  direction: number;
}) {
  return (
    <motion.div
      key={Math.random()}
      initial={{ x: direction > 0 ? 60 : -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: direction > 0 ? -60 : 60, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex flex-col gap-6"
    >
      {children}
    </motion.div>
  );
}

// ─── Step 1 : Organisation ───────────────────────────────────────────────────
function StepOrganisation({
  data,
  onChange,
  direction,
}: {
  data: { sector: string; size: string; website: string };
  onChange: (data: Partial<typeof data>) => void;
  direction: number;
}) {
  return (
    <StepWrapper direction={direction}>
      <div>
        <h2 className="text-2xl font-bold text-[#1f2538]">
          Parlez-nous de votre organisation
        </h2>
        <p className="mt-1 text-[15px] text-[#9aa1b8]">
          Ces informations personnaliseront votre expérience SocialPulse.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-[13px] font-semibold text-[#4b5270]">
            Secteur d'activité
          </Label>
          <div className="flex flex-wrap gap-2">
            {SECTORS.map((sector) => (
              <button
                key={sector}
                type="button"
                onClick={() => onChange({ sector })}
                className={`rounded-full border px-4 py-2 text-[13px] font-medium transition-all ${
                  data.sector === sector
                    ? "border-[#5b63d3] bg-[#5b63d3] text-white shadow-md"
                    : "border-[#e9edf7] bg-white text-[#4b5270] hover:border-[#5b63d3]/40"
                }`}
              >
                {sector}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[13px] font-semibold text-[#4b5270]">
            Taille de votre équipe
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {ORG_SIZES.map(({ label, value }) => (
              <button
                key={value}
                type="button"
                onClick={() => onChange({ size: value })}
                className={`rounded-xl border px-4 py-3 text-left text-[14px] font-medium transition-all ${
                  data.size === value
                    ? "border-[#5b63d3] bg-[#f0f1fd] text-[#5b63d3]"
                    : "border-[#e9edf7] bg-white text-[#4b5270] hover:border-[#5b63d3]/40"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="website"
            className="text-[13px] font-semibold text-[#4b5270]"
          >
            Site web (optionnel)
          </Label>
          <Input
            id="website"
            placeholder="https://votresite.com"
            value={data.website}
            onChange={(e) => onChange({ website: e.target.value })}
            className="h-11 border-[#e9edf7] bg-white focus-visible:ring-[#5b63d3]"
          />
        </div>
      </div>
    </StepWrapper>
  );
}

// ─── Step 2 : Réseaux Sociaux ────────────────────────────────────────────────
function StepSocialNetworks({
  selected,
  onChange,
  direction,
}: {
  selected: string[];
  onChange: (selected: string[]) => void;
  direction: number;
}) {
  const toggle = (id: string) => {
    onChange(
      selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id],
    );
  };

  return (
    <StepWrapper direction={direction}>
      <div>
        <h2 className="text-2xl font-bold text-[#1f2538]">
          Vos réseaux sociaux
        </h2>
        <p className="mt-1 text-[15px] text-[#9aa1b8]">
          Sélectionnez les plateformes sur lesquelles vous publiez. Vous pourrez
          les connecter depuis les Paramètres.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {SOCIAL_PLATFORMS.map(({ id, label, icon: Icon, color, bg }) => {
          const isSelected = selected.includes(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => toggle(id)}
              className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
                isSelected
                  ? "border-[#5b63d3] bg-[#f0f1fd] shadow-md"
                  : "border-[#e9edf7] bg-white hover:border-[#5b63d3]/40"
              }`}
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ background: bg }}
              >
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <span className="flex-1 text-[15px] font-semibold text-[#1f2538]">
                {label}
              </span>
              {isSelected && (
                <CheckCircle2 className="h-5 w-5 text-[#5b63d3]" />
              )}
            </button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <div className="rounded-xl border border-[#bff4df] bg-[#effff7] px-4 py-3 text-[14px] text-[#18ba7b]">
          <span className="font-semibold">{selected.length} réseau{selected.length > 1 ? "x" : ""} sélectionné{selected.length > 1 ? "s" : ""}.</span>{" "}
          Vous pourrez les connecter via OAuth depuis les intégrations.
        </div>
      )}
    </StepWrapper>
  );
}

// ─── Step 3 : Préférences de veille ─────────────────────────────────────────
function StepVeillePreferences({
  keywords,
  onChange,
  direction,
}: {
  keywords: string[];
  onChange: (keywords: string[]) => void;
  direction: number;
}) {
  const [input, setInput] = useState("");

  const addKeyword = (kw: string) => {
    const trimmed = kw.trim();
    if (!trimmed || keywords.includes(trimmed)) return;
    onChange([...keywords, trimmed]);
    setInput("");
  };

  const removeKeyword = (kw: string) => {
    onChange(keywords.filter((k) => k !== kw));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addKeyword(input);
    }
  };

  return (
    <StepWrapper direction={direction}>
      <div>
        <h2 className="text-2xl font-bold text-[#1f2538]">
          Vos préférences de veille
        </h2>
        <p className="mt-1 text-[15px] text-[#9aa1b8]">
          Ajoutez des mots-clés pour personnaliser les tendances et sujets qui
          vous seront recommandés.
        </p>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa1b8]" />
          <Input
            placeholder="Ex : intelligence artificielle, RGPD, fintech…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-11 border-[#e9edf7] bg-white pl-10 focus-visible:ring-[#5b63d3]"
          />
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#5b63d3]"
            onClick={() => addKeyword(input)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {keywords.map((kw) => (
              <Badge
                key={kw}
                className="gap-1 rounded-full border-[#e9edf7] bg-[#f0f1fd] px-3 py-1 text-[13px] text-[#5b63d3] hover:bg-[#e8e9f9]"
              >
                {kw}
                <button
                  type="button"
                  onClick={() => removeKeyword(kw)}
                  className="ml-1 text-[#5b63d3]/60 hover:text-[#5b63d3]"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <p className="text-[12px] text-[#9aa1b8]">Suggestions :</p>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_KEYWORDS.filter((k) => !keywords.includes(k)).map(
              (kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => addKeyword(kw)}
                  className="flex items-center gap-1 rounded-full border border-dashed border-[#d0d5ef] bg-transparent px-3 py-1 text-[13px] text-[#6b74a8] transition-all hover:border-[#5b63d3] hover:text-[#5b63d3]"
                >
                  <Plus className="h-3 w-3" />
                  {kw}
                </button>
              ),
            )}
          </div>
        </div>
      </div>
    </StepWrapper>
  );
}

// ─── Step 4 : Confirmation & Tutoriel ────────────────────────────────────────
function StepConfirmation({ direction }: { direction: number }) {
  return (
    <StepWrapper direction={direction}>
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#effff7]">
          <CheckCircle2 className="h-10 w-10 text-[#18ba7b]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#1f2538]">
            Votre espace est prêt !
          </h2>
          <p className="mt-2 text-[15px] text-[#9aa1b8]">
            Bienvenue sur SocialPulse. Voici un aperçu des fonctionnalités clés
            à explorer en premier.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {FEATURE_HIGHLIGHTS.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="flex items-start gap-3 rounded-2xl border border-[#e9edf7] bg-white p-4"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef2ff]">
              <Icon className="h-5 w-5 text-[#5b63d3]" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-[#1f2538]">
                {title}
              </p>
              <p className="mt-0.5 text-[13px] text-[#9aa1b8]">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-[#dde2f4] bg-[#f0f1fd] px-5 py-4 text-[14px] text-[#5b63d3]">
        <strong>Conseil :</strong> Commencez par créer votre premier post depuis
        le <strong>Calendrier</strong> ou le bouton{" "}
        <strong>"Nouveau post"</strong> du Dashboard.
      </div>
    </StepWrapper>
  );
}

// ─── Main Onboarding Page ────────────────────────────────────────────────────
export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [saving, setSaving] = useState(false);

  const [orgData, setOrgData] = useState({
    sector: "",
    size: "",
    website: "",
  });
  const [selectedNetworks, setSelectedNetworks] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);

  const STEP_LABELS = [
    "Organisation",
    "Réseaux Sociaux",
    "Préférences de Veille",
    "Confirmation",
  ];

  const canProceed = () => {
    if (step === 0) return orgData.sector !== "" && orgData.size !== "";
    if (step === 1) return selectedNetworks.length > 0;
    return true;
  };

  const saveOnboardingStep = async (stepIndex: number) => {
    try {
      await apiRequest("/user/onboarding", {
        method: "PUT",
        body: JSON.stringify({
          step: stepIndex,
          data: {
            orgData,
            selectedNetworks,
            keywords,
          },
        }),
      });
    } catch {
      // Non-blocking — continue even if save fails
    }
  };

  const handleNext = async () => {
    if (step < TOTAL_STEPS - 1) {
      await saveOnboardingStep(step);
      setDirection(1);
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      await apiRequest("/user/onboarding", {
        method: "PUT",
        body: JSON.stringify({
          step: TOTAL_STEPS - 1,
          completed: true,
          data: { orgData, selectedNetworks, keywords },
        }),
      });
      toast({
        title: "Bienvenue sur SocialPulse !",
        description: "Votre espace est configuré et prêt à l'emploi.",
      });
      navigate("/dashboard");
    } catch {
      // Proceed anyway
      navigate("/dashboard");
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#f5f6fb] flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#e9edf7]">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5b63d3]">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-[15px] font-bold text-[#1f2538]">
            SocialPulse
          </span>
        </div>
        <button
          type="button"
          onClick={handleSkip}
          className="flex items-center gap-1 text-[13px] text-[#9aa1b8] hover:text-[#5b63d3]"
        >
          <SkipForward className="h-4 w-4" />
          Passer l'onboarding
        </button>
      </header>

      <main className="flex flex-1 items-start justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          {/* Step indicator */}
          <div className="mb-8 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-[#9aa1b8]">
                Étape {step + 1} sur {TOTAL_STEPS}
              </span>
              <span className="text-[13px] font-semibold text-[#5b63d3]">
                {STEP_LABELS[step]}
              </span>
            </div>
            <ProgressBar step={step + 1} />
          </div>

          {/* Step breadcrumbs */}
          <div className="mb-6 flex items-center gap-2 overflow-x-auto">
            {STEP_LABELS.map((label, index) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-all ${
                    index < step
                      ? "bg-[#18ba7b] text-white"
                      : index === step
                        ? "bg-[#5b63d3] text-white"
                        : "bg-[#e9edf7] text-[#9aa1b8]"
                  }`}
                >
                  {index < step ? "✓" : index + 1}
                </div>
                <span
                  className={`hidden text-[12px] sm:block ${
                    index === step
                      ? "font-semibold text-[#1f2538]"
                      : "text-[#9aa1b8]"
                  }`}
                >
                  {label}
                </span>
                {index < STEP_LABELS.length - 1 && (
                  <ChevronRight className="h-3 w-3 shrink-0 text-[#d0d5ef]" />
                )}
              </div>
            ))}
          </div>

          {/* Step content */}
          <div className="rounded-3xl border border-[#e9edf7] bg-white p-6 shadow-[0_14px_40px_rgba(110,122,167,0.08)]">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <StepOrganisation
                  key="step-0"
                  data={orgData}
                  onChange={(partial) =>
                    setOrgData((prev) => ({ ...prev, ...partial }))
                  }
                  direction={direction}
                />
              )}
              {step === 1 && (
                <StepSocialNetworks
                  key="step-1"
                  selected={selectedNetworks}
                  onChange={setSelectedNetworks}
                  direction={direction}
                />
              )}
              {step === 2 && (
                <StepVeillePreferences
                  key="step-2"
                  keywords={keywords}
                  onChange={setKeywords}
                  direction={direction}
                />
              )}
              {step === 3 && (
                <StepConfirmation key="step-3" direction={direction} />
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={handleBack}
                disabled={step === 0}
                className="text-[#9aa1b8] hover:text-[#1f2538]"
              >
                Retour
              </Button>

              {step < TOTAL_STEPS - 1 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="gap-2 rounded-full bg-[#5b63d3] px-6 text-white hover:bg-[#4a52c0]"
                >
                  Continuer
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleFinish}
                  disabled={saving}
                  className="gap-2 rounded-full bg-[#18ba7b] px-6 text-white hover:bg-[#14a36a]"
                >
                  {saving ? "Finalisation…" : "Accéder au Dashboard"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Reassurance text */}
          <p className="mt-4 text-center text-[12px] text-[#b0b8d0]">
            Toutes ces informations sont modifiables à tout moment depuis vos
            paramètres.
          </p>
        </div>
      </main>
    </div>
  );
}
