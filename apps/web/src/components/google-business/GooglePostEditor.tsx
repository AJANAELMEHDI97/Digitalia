import { useState } from "react";
import { Send, Calendar, Image, Link, X, Megaphone, CalendarDays, Tag } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import type { GooglePost } from "@/hooks/useGoogleBusiness";

interface GooglePostEditorProps {
  onCreatePost: (post: Partial<GooglePost>) => Promise<GooglePost | null>;
}

export function GooglePostEditor({ onCreatePost }: GooglePostEditorProps) {
  const [postType, setPostType] = useState<'STANDARD' | 'EVENT' | 'OFFER'>('STANDARD');
  const [summary, setSummary] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [ctaType, setCtaType] = useState<string>('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventStartDate, setEventStartDate] = useState('');
  const [eventEndDate, setEventEndDate] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (publish: boolean = false) => {
    if (!summary.trim()) return;

    setCreating(true);
    try {
      const postData: Partial<GooglePost> = {
        post_type: postType,
        summary: summary.trim(),
        media_url: mediaUrl || null,
        call_to_action_type: ctaType || null,
        call_to_action_url: ctaUrl || null,
        event_title: eventTitle || null,
        event_start_date: eventStartDate || null,
        event_end_date: eventEndDate || null,
        scheduled_at: scheduledAt || null,
      };

      await onCreatePost(postData);
      
      // Reset form
      setSummary('');
      setMediaUrl('');
      setCtaType('');
      setCtaUrl('');
      setEventTitle('');
      setEventStartDate('');
      setEventEndDate('');
      setScheduledAt('');
    } finally {
      setCreating(false);
    }
  };

  const ctaOptions = [
    { value: '', label: 'Aucun' },
    { value: 'LEARN_MORE', label: 'En savoir plus' },
    { value: 'BOOK', label: 'Réserver' },
    { value: 'ORDER', label: 'Commander' },
    { value: 'SHOP', label: 'Acheter' },
    { value: 'SIGN_UP', label: "S'inscrire" },
    { value: 'CALL', label: 'Appeler' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Nouvelle publication
        </CardTitle>
        <CardDescription>
          Créez un post pour votre fiche Google Business
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs value={postType} onValueChange={(v) => setPostType(v as typeof postType)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="STANDARD" className="gap-2">
              <Megaphone className="h-4 w-4" />
              Actualité
            </TabsTrigger>
            <TabsTrigger value="EVENT" className="gap-2">
              <CalendarDays className="h-4 w-4" />
              Événement
            </TabsTrigger>
            <TabsTrigger value="OFFER" className="gap-2">
              <Tag className="h-4 w-4" />
              Offre
            </TabsTrigger>
          </TabsList>

          <TabsContent value="STANDARD" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="summary">Contenu (max 1500 caractères)</Label>
              <Textarea
                id="summary"
                placeholder="Partagez une actualité avec vos clients..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={4}
                maxLength={1500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {summary.length}/1500
              </p>
            </div>
          </TabsContent>

          <TabsContent value="EVENT" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="eventTitle">Titre de l'événement</Label>
              <Input
                id="eventTitle"
                placeholder="Conférence sur le droit des affaires"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eventStart">Date de début</Label>
                <Input
                  id="eventStart"
                  type="datetime-local"
                  value={eventStartDate}
                  onChange={(e) => setEventStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventEnd">Date de fin</Label>
                <Input
                  id="eventEnd"
                  type="datetime-local"
                  value={eventEndDate}
                  onChange={(e) => setEventEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventDesc">Description</Label>
              <Textarea
                id="eventDesc"
                placeholder="Décrivez votre événement..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
                maxLength={1500}
              />
            </div>
          </TabsContent>

          <TabsContent value="OFFER" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="offerTitle">Titre de l'offre</Label>
              <Input
                id="offerTitle"
                placeholder="Consultation gratuite"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="offerStart">Début de l'offre</Label>
                <Input
                  id="offerStart"
                  type="date"
                  value={eventStartDate}
                  onChange={(e) => setEventStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="offerEnd">Fin de l'offre</Label>
                <Input
                  id="offerEnd"
                  type="date"
                  value={eventEndDate}
                  onChange={(e) => setEventEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="offerDesc">Conditions de l'offre</Label>
              <Textarea
                id="offerDesc"
                placeholder="Décrivez les conditions..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
                maxLength={1500}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-2">
          <Label htmlFor="mediaUrl">Image (URL)</Label>
          <div className="flex gap-2">
            <Input
              id="mediaUrl"
              placeholder="https://..."
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
            />
            {mediaUrl && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setMediaUrl('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Format recommandé : 1200x900px (JPG, PNG)
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ctaType">Bouton d'action</Label>
            <select
              id="ctaType"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={ctaType}
              onChange={(e) => setCtaType(e.target.value)}
            >
              {ctaOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          {ctaType && (
            <div className="space-y-2">
              <Label htmlFor="ctaUrl">URL du bouton</Label>
              <Input
                id="ctaUrl"
                placeholder="https://..."
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="scheduled">Programmer la publication</Label>
          <Input
            id="scheduled"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
          />
          <p className="text-xs text-muted-foreground">
            Laissez vide pour enregistrer comme brouillon
          </p>
        </div>

        <div className="flex gap-2 pt-4">
          <Button 
            onClick={() => handleSubmit(false)} 
            disabled={!summary.trim() || creating}
            className="flex-1"
          >
            {creating ? 'Création...' : 'Enregistrer le brouillon'}
          </Button>
          <Button 
            variant="default"
            onClick={() => handleSubmit(true)} 
            disabled={!summary.trim() || creating}
            className="flex-1 gap-2"
          >
            <Send className="h-4 w-4" />
            Publier maintenant
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
