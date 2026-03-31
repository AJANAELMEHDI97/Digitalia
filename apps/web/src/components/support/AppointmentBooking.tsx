import { useState } from "react";
import { Calendar as CalendarIcon, Phone, Video, MessageSquare, Clock, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { APPOINTMENT_TYPES, CONTACT_REASONS, ContactReason, generateMockSlots, AppointmentSlot } from "@/data/mockSupport";
import { format, addDays, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Phone: Phone,
  Video: Video,
  MessageSquare: MessageSquare,
};

export function AppointmentBooking() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedReason, setSelectedReason] = useState<ContactReason | "">("");
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  
  const slots = generateMockSlots();
  
  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 5; i++) {
      days.push(addDays(currentWeekStart, i));
    }
    return days;
  };

  const getSlotsForDay = (day: Date) => {
    return slots.filter(slot => isSameDay(new Date(slot.date), day));
  };

  const handleConfirm = () => {
    // Simulate booking confirmation
    setStep(4);
  };

  const resetBooking = () => {
    setStep(1);
    setSelectedType("");
    setSelectedReason("");
    setSelectedSlot(null);
    setAdditionalInfo("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          Prendre rendez-vous
        </CardTitle>
        <CardDescription>
          Planifiez un échange avec votre community manager
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= s 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {step > s ? <Check className="h-4 w-4" /> : s}
              </div>
              {s < 3 && (
                <div className={`w-16 h-0.5 mx-2 ${step > s ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Type selection */}
        {step === 1 && (
          <div className="space-y-4">
            <Label className="text-base font-medium">Type de rendez-vous</Label>
            <RadioGroup value={selectedType} onValueChange={setSelectedType}>
              <div className="grid gap-3">
                {APPOINTMENT_TYPES.map((type) => {
                  const Icon = TYPE_ICONS[type.icon];
                  return (
                    <label
                      key={type.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedType === type.id 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:border-primary/50'
                      }`}
                    >
                      <RadioGroupItem value={type.id} className="sr-only" />
                      <div className={`p-2 rounded-lg ${
                        selectedType === type.id ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                        <Icon className={`h-5 w-5 ${
                          selectedType === type.id ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{type.label}</p>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </div>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {type.duration}
                      </Badge>
                    </label>
                  );
                })}
              </div>
            </RadioGroup>
            
            <div className="pt-4">
              <Label className="text-base font-medium">Motif du rendez-vous</Label>
              <Select value={selectedReason} onValueChange={(v) => setSelectedReason(v as ContactReason)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Sélectionnez un motif" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(CONTACT_REASONS) as ContactReason[]).map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {CONTACT_REASONS[reason].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              className="w-full" 
              disabled={!selectedType || !selectedReason}
              onClick={() => setStep(2)}
            >
              Choisir un créneau
            </Button>
          </div>
        )}

        {/* Step 2: Slot selection */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Choisissez un créneau</Label>
              <div className="flex gap-1">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-5 gap-2">
              {getWeekDays().map((day) => (
                <div key={day.toISOString()} className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">
                    {format(day, 'EEE', { locale: fr })}
                  </p>
                  <p className="text-sm font-medium mb-2">
                    {format(day, 'd MMM', { locale: fr })}
                  </p>
                  <div className="space-y-1">
                    {getSlotsForDay(day).map((slot) => (
                      <Button
                        key={slot.id}
                        variant={selectedSlot?.id === slot.id ? "default" : "outline"}
                        size="sm"
                        className="w-full text-xs"
                        disabled={!slot.available}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        {slot.time}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                Retour
              </Button>
              <Button 
                className="flex-1" 
                disabled={!selectedSlot}
                onClick={() => setStep(3)}
              >
                Continuer
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && selectedSlot && (
          <div className="space-y-4">
            <Label className="text-base font-medium">Confirmation</Label>
            
            <Card className="bg-muted/50">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <span className="font-medium">
                    {APPOINTMENT_TYPES.find(t => t.id === selectedType)?.label}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Motif</span>
                  <span className="font-medium">
                    {CONTACT_REASONS[selectedReason as ContactReason]?.label}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Date</span>
                  <span className="font-medium">
                    {format(selectedSlot.date, 'EEEE d MMMM', { locale: fr })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Heure</span>
                  <span className="font-medium">{selectedSlot.time}</span>
                </div>
              </CardContent>
            </Card>
            
            <div>
              <Label className="text-sm">Informations complémentaires (optionnel)</Label>
              <Textarea
                className="mt-2"
                placeholder="Précisez le sujet que vous souhaitez aborder..."
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                Retour
              </Button>
              <Button className="flex-1" onClick={handleConfirm}>
                Confirmer le rendez-vous
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Rendez-vous confirmé !</h3>
            <p className="text-muted-foreground mb-6">
              Vous recevrez un email de confirmation avec les détails du rendez-vous.
            </p>
            <Button onClick={resetBooking}>
              Prendre un autre rendez-vous
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
