import { useState, useMemo } from "react";
import { 
  Calendar as CalendarIcon, 
  Phone, 
  Video, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  User,
  Building2,
  MessageSquare,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Bell,
  History,
  Plus,
  MoreVertical,
  Edit,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, addDays, startOfWeek, isSameDay, isToday, isBefore, addHours } from "date-fns";
import { fr } from "date-fns/locale";

// Types
interface Appointment {
  id: string;
  type: "video" | "phone";
  date: Date;
  duration: number; // minutes
  lawyerName: string;
  lawFirmName: string;
  subject: string;
  description?: string;
  status: "upcoming" | "in_progress" | "completed" | "cancelled";
  reminders: { type: string; sent: boolean; scheduledAt: Date }[];
  notes: string;
  followUpActions: { id: string; text: string; completed: boolean }[];
  conversationHistory: { date: Date; preview: string; type: "message" | "email" }[];
  aiPreparation?: {
    summary: string;
    keyPoints: string[];
    suggestedTopics: string[];
  };
}

// Mock data
const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: "1",
    type: "video",
    date: addHours(new Date(), 2),
    duration: 30,
    lawyerName: "Me Sophie Martin",
    lawFirmName: "Cabinet Martin & Associés",
    subject: "Revue stratégie éditoriale Q1",
    description: "Point sur les performances des publications LinkedIn et ajustement de la ligne éditoriale.",
    status: "upcoming",
    reminders: [
      { type: "1h", sent: false, scheduledAt: addHours(new Date(), 1) },
      { type: "15min", sent: false, scheduledAt: addHours(new Date(), 1.75) }
    ],
    notes: "",
    followUpActions: [],
    conversationHistory: [
      { date: addDays(new Date(), -2), preview: "Pouvez-vous me préparer un bilan des posts du mois dernier ?", type: "message" },
      { date: addDays(new Date(), -5), preview: "Les visuels de la dernière campagne sont parfaits, merci !", type: "message" }
    ],
    aiPreparation: {
      summary: "Me Martin souhaite revoir la stratégie LinkedIn suite à une baisse d'engagement (-15% ce mois). Elle s'intéresse particulièrement aux formats vidéo qui performent bien chez ses confrères.",
      keyPoints: [
        "Engagement LinkedIn en baisse de 15%",
        "Intérêt pour les formats vidéo courts",
        "Budget com stable pour Q1"
      ],
      suggestedTopics: [
        "Proposer un calendrier de Reels/vidéos courtes",
        "Analyser les meilleurs horaires de publication",
        "Discuter du ton éditorial (plus personnel ?)"
      ]
    }
  },
  {
    id: "2",
    type: "phone",
    date: addDays(addHours(new Date(), 4), 1),
    duration: 15,
    lawyerName: "Me Jean Dupont",
    lawFirmName: "Dupont Avocats",
    subject: "Validation urgente article blog",
    description: "Validation rapide d'un article sur la réforme des retraites avant publication.",
    status: "upcoming",
    reminders: [
      { type: "1j", sent: true, scheduledAt: addDays(new Date(), -1) }
    ],
    notes: "",
    followUpActions: [],
    conversationHistory: [
      { date: addDays(new Date(), -1), preview: "L'article est prêt, j'ai besoin de votre validation.", type: "email" }
    ]
  },
  {
    id: "3",
    type: "video",
    date: addDays(new Date(), -1),
    duration: 45,
    lawyerName: "Me Claire Leroy",
    lawFirmName: "Leroy & Partners",
    subject: "Onboarding - Présentation SocialPulse",
    status: "completed",
    reminders: [],
    notes: "RDV très positif. Me Leroy souhaite publier 3x/semaine sur LinkedIn. Préfère un ton professionnel mais accessible. A mentionné vouloir éviter les sujets politiques.",
    followUpActions: [
      { id: "1", text: "Envoyer le guide de démarrage", completed: true },
      { id: "2", text: "Préparer 5 posts de lancement", completed: false },
      { id: "3", text: "Configurer les accès LinkedIn", completed: true }
    ],
    conversationHistory: []
  }
];

const HOURS = Array.from({ length: 10 }, (_, i) => i + 8); // 8h - 17h

export function CMAppointments() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [activeTab, setActiveTab] = useState<"preparation" | "notes" | "actions">("preparation");
  const [notes, setNotes] = useState("");
  const [appointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);

  const weekDays = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter(apt => isSameDay(apt.date, day) && apt.status !== "cancelled");
  };

  const upcomingAppointments = useMemo(() => {
    return appointments
      .filter(apt => apt.status === "upcoming" && !isBefore(apt.date, new Date()))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [appointments]);

  const handleSelectAppointment = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setNotes(apt.notes);
    setActiveTab("preparation");
  };

  const getTimePosition = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return ((hours - 8) * 60 + minutes) / 60;
  };

  const getAppointmentHeight = (duration: number) => {
    return duration / 60;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full min-h-[600px]">
      {/* Left: Week Calendar */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Calendrier des rendez-vous</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[180px] text-center">
              {format(currentWeekStart, "d MMM", { locale: fr })} - {format(addDays(currentWeekStart, 4), "d MMM yyyy", { locale: fr })}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
            >
              Aujourd'hui
            </Button>
          </div>
        </div>

        {/* Week Grid */}
        <Card className="flex-1 overflow-hidden min-h-[400px]">
          <ScrollArea className="h-full min-h-[400px]">
            <div className="min-w-[600px]">
              {/* Days header */}
              <div className="grid grid-cols-[60px_repeat(5,1fr)] border-b sticky top-0 bg-background z-10">
                <div className="p-2 border-r" />
                {weekDays.map((day) => (
                  <div
                    key={day.toISOString()}
                    className={`p-2 text-center border-r last:border-r-0 ${
                      isToday(day) ? "bg-primary/5" : ""
                    }`}
                  >
                    <p className="text-xs text-muted-foreground uppercase">
                      {format(day, "EEE", { locale: fr })}
                    </p>
                    <p className={`text-lg font-semibold ${isToday(day) ? "text-primary" : ""}`}>
                      {format(day, "d")}
                    </p>
                  </div>
                ))}
              </div>

              {/* Hours grid */}
              <div className="relative">
                {HOURS.map((hour) => (
                  <div key={hour} className="grid grid-cols-[60px_repeat(5,1fr)] h-16 border-b">
                    <div className="p-2 border-r text-xs text-muted-foreground text-right pr-3">
                      {hour}:00
                    </div>
                    {weekDays.map((day) => (
                      <div
                        key={`${day.toISOString()}-${hour}`}
                        className={`border-r last:border-r-0 relative ${
                          isToday(day) ? "bg-primary/5" : ""
                        }`}
                      />
                    ))}
                  </div>
                ))}

                {/* Appointments overlay */}
                <div className="absolute inset-0 grid grid-cols-[60px_repeat(5,1fr)] pointer-events-none">
                  <div />
                  {weekDays.map((day, dayIndex) => {
                    const dayAppointments = getAppointmentsForDay(day);
                    return (
                      <div key={day.toISOString()} className="relative">
                        {dayAppointments.map((apt) => {
                          const top = getTimePosition(apt.date) * 64; // 64px per hour
                          const height = getAppointmentHeight(apt.duration) * 64;
                          const isSelected = selectedAppointment?.id === apt.id;
                          
                          return (
                            <button
                              key={apt.id}
                              className={`absolute left-1 right-1 rounded-md p-2 text-left pointer-events-auto transition-all ${
                                apt.type === "video"
                                  ? isSelected
                                    ? "bg-primary text-primary-foreground shadow-lg"
                                    : "bg-primary/20 hover:bg-primary/30 border border-primary/30"
                                  : isSelected
                                    ? "bg-emerald-600 text-white shadow-lg"
                                    : "bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50"
                              }`}
                              style={{ top: `${top}px`, height: `${Math.max(height, 40)}px` }}
                              onClick={() => handleSelectAppointment(apt)}
                            >
                              <div className="flex items-center gap-1 text-xs font-medium truncate">
                                {apt.type === "video" ? (
                                  <Video className="h-3 w-3 shrink-0" />
                                ) : (
                                  <Phone className="h-3 w-3 shrink-0" />
                                )}
                                <span className="truncate">{format(apt.date, "HH:mm")}</span>
                              </div>
                              {height >= 48 && (
                                <p className="text-xs truncate mt-1 opacity-90">
                                  {apt.lawyerName}
                                </p>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </ScrollArea>
        </Card>

        {/* Upcoming appointments mini-list */}
        <div className="mt-4 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Prochains RDV</h3>
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              <Plus className="h-3 w-3 mr-1" />
              Nouveau
            </Button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {upcomingAppointments.slice(0, 4).map((apt) => (
              <button
                key={apt.id}
                onClick={() => handleSelectAppointment(apt)}
                className={`shrink-0 p-3 rounded-lg border text-left transition-colors ${
                  selectedAppointment?.id === apt.id
                    ? "border-primary bg-primary/5"
                    : "hover:border-primary/50"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {apt.type === "video" ? (
                    <Video className="h-3 w-3 text-primary" />
                  ) : (
                    <Phone className="h-3 w-3 text-emerald-600" />
                  )}
                  <span className="text-xs font-medium">
                    {isToday(apt.date) ? "Aujourd'hui" : format(apt.date, "EEE d", { locale: fr })} • {format(apt.date, "HH:mm")}
                  </span>
                </div>
                <p className="text-sm font-medium truncate max-w-[150px]">{apt.lawyerName}</p>
                <p className="text-xs text-muted-foreground truncate max-w-[150px]">{apt.subject}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Appointment Detail Panel */}
      <div className="w-[340px] shrink-0 hidden lg:block">
        {selectedAppointment ? (
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {selectedAppointment.type === "video" ? (
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Video className="h-4 w-4 text-primary" />
                    </div>
                  ) : (
                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                      <Phone className="h-4 w-4 text-emerald-600" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-base">
                      {format(selectedAppointment.date, "EEEE d MMMM", { locale: fr })}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {format(selectedAppointment.date, "HH:mm")} • {selectedAppointment.duration} min
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Annuler
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Lawyer info */}
              <div className="mt-3 p-3 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{selectedAppointment.lawyerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{selectedAppointment.lawFirmName}</span>
                </div>
              </div>

              {/* Subject */}
              <div className="mt-3">
                <p className="text-sm font-medium">{selectedAppointment.subject}</p>
                {selectedAppointment.description && (
                  <p className="text-sm text-muted-foreground mt-1">{selectedAppointment.description}</p>
                )}
              </div>

              {/* Reminders status */}
              {selectedAppointment.reminders.length > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <div className="flex gap-1">
                    {selectedAppointment.reminders.map((reminder, idx) => (
                      <Badge
                        key={idx}
                        variant={reminder.sent ? "secondary" : "outline"}
                        className="text-xs"
                      >
                        {reminder.type} {reminder.sent && "✓"}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardHeader>

            <Separator />

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex-1 flex flex-col">
              <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0">
                <TabsTrigger
                  value="preparation"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  Préparation
                </TabsTrigger>
                <TabsTrigger
                  value="notes"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Notes
                </TabsTrigger>
                <TabsTrigger
                  value="actions"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Suivi
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1">
                <TabsContent value="preparation" className="m-0 p-4 space-y-4">
                  {/* AI Preparation */}
                  {selectedAppointment.aiPreparation ? (
                    <>
                      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Résumé IA</span>
                        </div>
                        <p className="text-sm">{selectedAppointment.aiPreparation.summary}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                          Points clés
                        </h4>
                        <ul className="space-y-1">
                          {selectedAppointment.aiPreparation.keyPoints.map((point, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-primary">•</span>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">Sujets suggérés</h4>
                        <div className="space-y-1">
                          {selectedAppointment.aiPreparation.suggestedTopics.map((topic, idx) => (
                            <div key={idx} className="text-sm p-2 rounded bg-muted/50 flex items-start gap-2">
                              <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                              {topic}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Pas de préparation IA disponible</p>
                    </div>
                  )}

                  {/* Conversation History */}
                  {selectedAppointment.conversationHistory.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Historique des échanges
                      </h4>
                      <div className="space-y-2">
                        {selectedAppointment.conversationHistory.map((conv, idx) => (
                          <div key={idx} className="p-2 rounded border text-sm">
                            <div className="flex items-center justify-between mb-1">
                              <Badge variant="outline" className="text-xs">
                                {conv.type === "message" ? "Message" : "Email"}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {format(conv.date, "d MMM", { locale: fr })}
                              </span>
                            </div>
                            <p className="text-muted-foreground">{conv.preview}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="notes" className="m-0 p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Notes du RDV</h4>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        Sauvegarder
                      </Button>
                    </div>
                    <Textarea
                      placeholder="Prenez vos notes ici en temps réel..."
                      className="min-h-[300px] resize-none"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Vos notes sont sauvegardées automatiquement
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="actions" className="m-0 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Actions post-RDV</h4>
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      <Plus className="h-3 w-3 mr-1" />
                      Ajouter
                    </Button>
                  </div>

                  {selectedAppointment.followUpActions.length > 0 ? (
                    <div className="space-y-2">
                      {selectedAppointment.followUpActions.map((action) => (
                        <div
                          key={action.id}
                          className={`p-3 rounded-lg border flex items-start gap-3 ${
                            action.completed ? "bg-muted/50" : ""
                          }`}
                        >
                          <button
                            className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                              action.completed
                                ? "bg-primary border-primary"
                                : "border-muted-foreground/30 hover:border-primary"
                            }`}
                          >
                            {action.completed && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
                          </button>
                          <span className={`text-sm ${action.completed ? "line-through text-muted-foreground" : ""}`}>
                            {action.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Aucune action définie</p>
                      <p className="text-xs mt-1">Ajoutez des actions de suivi après le RDV</p>
                    </div>
                  )}
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </Card>
        ) : (
          <Card className="h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground p-6">
              <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Sélectionnez un rendez-vous</p>
              <p className="text-sm mt-1">
                Cliquez sur un RDV dans le calendrier pour voir les détails
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
