import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Newspaper, PartyPopper, AlertTriangle, CalendarDays, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

interface SystemTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: "newsletter" | "voeux" | "alerte" | "evenement";
  description: string;
  icon: React.ReactNode;
}

const systemTemplates: SystemTemplate[] = [
  {
    id: "newsletter-mensuelle",
    name: "Newsletter Juridique Mensuelle",
    subject: "Actualités juridiques - {{mois}} {{annee}}",
    content: `Cher(e) {{prenom}},

Retrouvez les dernières actualités juridiques sélectionnées par notre cabinet.

📰 **{{article_1_titre}}**
{{article_1_resume}}
👉 Lire l'article complet : {{article_1_lien}}

---

📰 **{{article_2_titre}}**
{{article_2_resume}}
👉 Lire l'article complet : {{article_2_lien}}

---

📰 **{{article_3_titre}}**
{{article_3_resume}}
👉 Lire l'article complet : {{article_3_lien}}

---

Nous restons à votre disposition pour toute question.

Cordialement,
{{nom_cabinet}}
{{adresse}}
📞 {{telephone}}
🌐 {{website_url}}`,
    category: "newsletter",
    description: "Partagez vos derniers articles de blog avec vos clients chaque mois",
    icon: <Newspaper className="h-5 w-5" />,
  },
  {
    id: "voeux-annee",
    name: "Vœux de Nouvelle Année",
    subject: "Meilleurs vœux pour {{annee}} - {{nom_cabinet}}",
    content: `Cher(e) {{prenom}},

En cette nouvelle année {{annee}}, toute l'équipe du cabinet {{nom_cabinet}} vous adresse ses meilleurs vœux de bonheur, de santé et de réussite.

Nous sommes honorés de la confiance que vous nous accordez et nous nous engageons à continuer de vous accompagner avec le même dévouement dans vos projets juridiques.

Que cette année soit riche en succès et en belles opportunités.

Très cordialement,

{{nom_cabinet}}
{{adresse}}
📞 {{telephone}}
🌐 {{website_url}}`,
    category: "voeux",
    description: "Envoyez des vœux personnalisés à vos clients en fin d'année",
    icon: <PartyPopper className="h-5 w-5" />,
  },
  {
    id: "alerte-juridique",
    name: "Alerte Juridique",
    subject: "⚠️ Important : {{article_1_titre}}",
    content: `Cher(e) {{prenom}},

**ALERTE JURIDIQUE**

Une actualité importante nécessite votre attention :

📌 **{{article_1_titre}}**

{{article_1_resume}}

Cette évolution peut avoir des conséquences directes sur votre situation. Nous vous invitons à consulter notre analyse complète :

👉 {{article_1_lien}}

N'hésitez pas à nous contacter pour évaluer l'impact sur votre dossier.

Cordialement,
{{nom_cabinet}}
📞 {{telephone}}`,
    category: "alerte",
    description: "Alertez vos clients sur une nouvelle loi ou réforme importante",
    icon: <AlertTriangle className="h-5 w-5" />,
  },
  {
    id: "invitation-evenement",
    name: "Invitation Événement / Webinaire",
    subject: "Vous êtes invité(e) : {{titre_evenement}}",
    content: `Cher(e) {{prenom}},

Le cabinet {{nom_cabinet}} a le plaisir de vous inviter à :

🎯 **{{titre_evenement}}**

📅 Date : {{date_evenement}}
📍 Lieu : {{lieu_evenement}}
⏰ Horaire : {{heure_evenement}}

**Au programme :**
{{description_evenement}}

Cet événement est gratuit et réservé à nos clients.

👉 Confirmez votre présence : {{lien_inscription}}

Nous espérons vous y retrouver nombreux.

Cordialement,
{{nom_cabinet}}
{{adresse}}
📞 {{telephone}}`,
    category: "evenement",
    description: "Invitez vos clients à un événement ou webinaire",
    icon: <CalendarDays className="h-5 w-5" />,
  },
];

const categoryColors: Record<string, string> = {
  newsletter: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  voeux: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  alerte: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  evenement: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
};

const categoryLabels: Record<string, string> = {
  newsletter: "Newsletter",
  voeux: "Vœux",
  alerte: "Alerte",
  evenement: "Événement",
};

interface SystemTemplatesProps {
  onDuplicate: (template: { name: string; subject: string; content: string; category: string }) => void;
}

export function SystemTemplates({ onDuplicate }: SystemTemplatesProps) {
  const [previewTemplate, setPreviewTemplate] = useState<SystemTemplate | null>(null);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {systemTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {template.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge className={categoryColors[template.category]}>
                      {categoryLabels[template.category]}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">{template.description}</CardDescription>
              <p className="text-sm text-muted-foreground mb-4">
                <strong>Objet :</strong> {template.subject}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setPreviewTemplate(template)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Aperçu
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() =>
                    onDuplicate({
                      name: template.name,
                      subject: template.subject,
                      content: template.content,
                      category: template.category,
                    })
                  }
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Utiliser
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewTemplate?.icon}
              {previewTemplate?.name}
            </DialogTitle>
            <DialogDescription>
              <strong>Objet :</strong> {previewTemplate?.subject}
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted/50 p-4 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm font-sans">
              {previewTemplate?.content}
            </pre>
          </div>
          <div className="text-xs text-muted-foreground">
            <p className="font-medium mb-1">Variables disponibles :</p>
            <p>
              {"{{prenom}}"}, {"{{nom}}"}, {"{{email}}"}, {"{{nom_cabinet}}"}, {"{{website_url}}"}, 
              {"{{article_1_titre}}"}, {"{{article_1_resume}}"}, {"{{article_1_lien}}"}...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
