import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, addDays, startOfWeek, isSameDay, isWeekend, isBefore, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar as CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Mail,
  Phone,
  Scale,
  Sparkles,
  User,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.svg";

const formSchema = z.object({
  fullName: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(100),
  email: z.string().email("Email invalide").max(255),
  phone: z.string().min(10, "Numéro de téléphone invalide").max(20),
  firmName: z.string().max(100).optional(),
  specialty: z.string().min(1, "Veuillez sélectionner une spécialité"),
  firmSize: z.string().min(1, "Veuillez sélectionner la taille du cabinet"),
  message: z.string().max(500).optional(),
});

type FormData = z.infer<typeof formSchema>;

const specialties = [
  { value: "affaires", label: "Droit des affaires" },
  { value: "famille", label: "Droit de la famille" },
  { value: "penal", label: "Droit pénal" },
  { value: "immobilier", label: "Droit immobilier" },
  { value: "travail", label: "Droit du travail" },
  { value: "fiscal", label: "Droit fiscal" },
  { value: "social", label: "Droit social" },
  { value: "propriete-intellectuelle", label: "Propriété intellectuelle" },
  { value: "autre", label: "Autre" },
];

const firmSizes = [
  { value: "1", label: "Avocat individuel" },
  { value: "2-5", label: "2 à 5 avocats" },
  { value: "6-10", label: "6 à 10 avocats" },
  { value: "11-20", label: "11 à 20 avocats" },
  { value: "20+", label: "Plus de 20 avocats" },
];

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
];

export default function Demo() {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      firmName: "",
      specialty: "",
      firmSize: "",
      message: "",
    },
  });

  const handleStep1Submit = async (data: FormData) => {
    setStep(2);
  };

  const handleStep2Continue = () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Sélection incomplète",
        description: "Veuillez sélectionner une date et un créneau horaire.",
        variant: "destructive",
      });
      return;
    }
    setStep(3);
  };

  const handleConfirm = async () => {
    if (!termsAccepted) {
      toast({
        title: "Conditions requises",
        description: "Veuillez accepter les conditions pour continuer.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const formData = form.getValues();

    try {
      const { error } = await supabase.from("demo_requests").insert({
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        firm_name: formData.firmName || null,
        specialty: formData.specialty,
        firm_size: formData.firmSize,
        preferred_date: format(selectedDate!, "yyyy-MM-dd"),
        preferred_time: selectedTime,
        message: formData.message || null,
        terms_accepted: termsAccepted,
      });

      if (error) throw error;

      setStep(4);
    } catch (error) {
      console.error("Error submitting demo request:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const disabledDays = (date: Date) => {
    return isWeekend(date) || isBefore(date, startOfDay(new Date()));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="SocialPulse" className="h-14 w-auto object-contain" />
          </Link>
          <Button variant="ghost" asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Progress Steps */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-center gap-2 md:gap-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                    step >= s
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  } ${step === 4 ? "bg-green-500 text-white" : ""}`}
                >
                  {step > s || step === 4 ? <Check className="h-4 w-4" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-12 md:w-24 h-1 mx-2 rounded transition-colors ${
                      step > s ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs md:text-sm text-muted-foreground">
            <span className={step >= 1 ? "text-primary font-medium" : ""}>
              Coordonnées
            </span>
            <span className={step >= 2 ? "text-primary font-medium" : ""}>
              Créneau
            </span>
            <span className={step >= 3 ? "text-primary font-medium" : ""}>
              Confirmation
            </span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Contact Form */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="shadow-lg border-2">
                <CardContent className="p-6 md:p-8">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                      <Scale className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold">
                      Demandez votre démo personnalisée
                    </h1>
                    <p className="text-muted-foreground mt-2">
                      Découvrez comment SocialPulse peut transformer votre communication
                    </p>
                  </div>

                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(handleStep1Submit)}
                      className="space-y-4"
                    >
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nom complet *</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    placeholder="Me Jean Dupont"
                                    className="pl-10"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email professionnel *</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    type="email"
                                    placeholder="jean.dupont@cabinet.fr"
                                    className="pl-10"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Téléphone *</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    type="tel"
                                    placeholder="06 12 34 56 78"
                                    className="pl-10"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="firmName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cabinet / Structure</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    placeholder="Cabinet Dupont & Associés"
                                    className="pl-10"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="specialty"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Spécialité juridique *</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sélectionnez..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {specialties.map((s) => (
                                    <SelectItem key={s.value} value={s.value}>
                                      {s.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="firmSize"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Taille du cabinet *</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sélectionnez..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {firmSizes.map((s) => (
                                    <SelectItem key={s.value} value={s.value}>
                                      {s.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message (optionnel)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Décrivez vos besoins ou posez vos questions..."
                                className="min-h-[80px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full" size="lg">
                        Choisir un créneau
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Calendar Selection */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto"
            >
              <Card className="shadow-lg border-2">
                <CardContent className="p-6 md:p-8">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                      <CalendarIcon className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold">
                      Choisissez votre créneau
                    </h2>
                    <p className="text-muted-foreground mt-2">
                      Sélectionnez une date et un horaire pour votre démonstration de 30 minutes
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Calendar */}
                    <div className="flex justify-center">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={disabledDays}
                        locale={fr}
                        className="rounded-lg border p-3 pointer-events-auto"
                        fromDate={new Date()}
                      />
                    </div>

                    {/* Time Slots */}
                    <div>
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {selectedDate
                          ? `Créneaux du ${format(selectedDate, "EEEE d MMMM", { locale: fr })}`
                          : "Sélectionnez une date"}
                      </h3>
                      {selectedDate ? (
                        <div className="grid grid-cols-3 gap-2">
                          {timeSlots.map((time) => (
                            <Button
                              key={time}
                              variant={selectedTime === time ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedTime(time)}
                              className="text-sm"
                            >
                              {time}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          Veuillez d'abord sélectionner une date dans le calendrier
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Retour
                    </Button>
                    <Button
                      onClick={handleStep2Continue}
                      className="flex-1"
                      disabled={!selectedDate || !selectedTime}
                    >
                      Continuer
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="shadow-lg border-2">
                <CardContent className="p-6 md:p-8">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                      <Check className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold">
                      Confirmez votre demande
                    </h2>
                    <p className="text-muted-foreground mt-2">
                      Vérifiez les informations avant de valider
                    </p>
                  </div>

                  <div className="space-y-4 bg-muted/50 rounded-lg p-4 mb-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Nom</p>
                        <p className="font-medium">{form.getValues("fullName")}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{form.getValues("email")}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Téléphone</p>
                        <p className="font-medium">{form.getValues("phone")}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Cabinet</p>
                        <p className="font-medium">
                          {form.getValues("firmName") || "Non renseigné"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Spécialité</p>
                        <p className="font-medium">
                          {specialties.find(
                            (s) => s.value === form.getValues("specialty")
                          )?.label}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Taille du cabinet
                        </p>
                        <p className="font-medium">
                          {firmSizes.find(
                            (s) => s.value === form.getValues("firmSize")
                          )?.label}
                        </p>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex items-center gap-3 text-primary">
                        <CalendarIcon className="h-5 w-5" />
                        <span className="font-semibold">
                          {selectedDate &&
                            format(selectedDate, "EEEE d MMMM yyyy", {
                              locale: fr,
                            })}{" "}
                          à {selectedTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 mb-6">
                    <Checkbox
                      id="terms"
                      checked={termsAccepted}
                      onCheckedChange={(checked) =>
                        setTermsAccepted(checked as boolean)
                      }
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm text-muted-foreground cursor-pointer"
                    >
                      J'accepte d'être recontacté par l'équipe SocialPulse concernant
                      ma demande de démonstration
                    </label>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setStep(2)}
                      className="flex-1"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Modifier
                    </Button>
                    <Button
                      onClick={handleConfirm}
                      className="flex-1"
                      disabled={!termsAccepted || isSubmitting}
                    >
                      {isSubmitting ? "Envoi en cours..." : "Confirmer ma demande"}
                      <Sparkles className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-lg mx-auto text-center"
            >
              <Card className="shadow-lg border-2 border-green-200">
                <CardContent className="p-8 md:p-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6"
                  >
                    <Check className="h-10 w-10 text-green-600" />
                  </motion.div>

                  <h2 className="text-2xl md:text-3xl font-bold text-green-700 mb-4">
                    Demande envoyée !
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Nous avons bien reçu votre demande de démonstration. Notre équipe
                    vous contactera très prochainement pour confirmer votre créneau.
                  </p>

                  <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
                    <div className="flex items-center gap-3 text-primary">
                      <CalendarIcon className="h-5 w-5" />
                      <span className="font-semibold">
                        {selectedDate &&
                          format(selectedDate, "EEEE d MMMM yyyy", {
                            locale: fr,
                          })}{" "}
                        à {selectedTime}
                      </span>
                    </div>
                  </div>

                  <Button onClick={() => navigate("/")} className="w-full">
                    Retour à l'accueil
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
