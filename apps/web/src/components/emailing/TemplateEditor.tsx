import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Variable, Newspaper, User, Building, Calendar, Mail, ExternalLink } from "lucide-react";
import { ArticlePickerDialog, SelectedArticle } from "./ArticlePickerDialog";
import { useProfile } from "@/hooks/useProfile";

interface TemplateEditorProps {
  initialData?: {
    name: string;
    subject: string;
    content: string;
    category: string;
  };
  onSave: (data: { name: string; subject: string; content: string; category: string }) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const variableGroups = [
  {
    label: "Contact",
    icon: <User className="h-4 w-4" />,
    variables: [
      { key: "{{prenom}}", label: "Prénom" },
      { key: "{{nom}}", label: "Nom" },
      { key: "{{email}}", label: "Email" },
      { key: "{{entreprise}}", label: "Entreprise" },
    ],
  },
  {
    label: "Cabinet",
    icon: <Building className="h-4 w-4" />,
    variables: [
      { key: "{{nom_cabinet}}", label: "Nom du cabinet" },
      { key: "{{adresse}}", label: "Adresse" },
      { key: "{{telephone}}", label: "Téléphone" },
      { key: "{{website_url}}", label: "Site web" },
    ],
  },
  {
    label: "Date",
    icon: <Calendar className="h-4 w-4" />,
    variables: [
      { key: "{{date_jour}}", label: "Date du jour" },
      { key: "{{mois}}", label: "Mois" },
      { key: "{{annee}}", label: "Année" },
    ],
  },
];

export function TemplateEditor({ initialData, onSave, onCancel, isEditing }: TemplateEditorProps) {
  const { profile } = useProfile();
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    subject: initialData?.subject || "",
    content: initialData?.content || "",
    category: initialData?.category || "custom",
  });
  const [articlePickerOpen, setArticlePickerOpen] = useState(false);

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById("template-content") as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent =
        formData.content.substring(0, start) + variable + formData.content.substring(end);
      setFormData({ ...formData, content: newContent });
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  const handleArticlesSelected = (articles: SelectedArticle[]) => {
    let insertText = "";
    articles.forEach((article, index) => {
      const num = index + 1;
      insertText += `\n📰 **{{article_${num}_titre}}**\n{{article_${num}_resume}}\n👉 Lire l'article : {{article_${num}_lien}}\n`;
    });
    setFormData({ ...formData, content: formData.content + insertText });
  };

  const getPreviewContent = () => {
    let preview = formData.content;
    const now = new Date();
    const months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
    
    const replacements: Record<string, string> = {
      "{{prenom}}": "Jean",
      "{{nom}}": "Dupont",
      "{{email}}": "jean.dupont@example.com",
      "{{entreprise}}": "Société ABC",
      "{{nom_cabinet}}": profile?.cabinet_name || "Cabinet Juridique",
      "{{adresse}}": "123 Rue du Droit, 75001 Paris",
      "{{telephone}}": "01 23 45 67 89",
      "{{website_url}}": profile?.website_url || "https://votresite.com",
      "{{date_jour}}": now.toLocaleDateString("fr-FR"),
      "{{mois}}": months[now.getMonth()],
      "{{annee}}": now.getFullYear().toString(),
      "{{article_1_titre}}": "Nouvelle réforme du droit du travail",
      "{{article_1_resume}}": "Découvrez les changements majeurs de la réforme 2025 et leurs implications pour les employeurs...",
      "{{article_1_lien}}": `${profile?.website_url || "https://votresite.com"}/blog/reforme-droit-travail`,
      "{{article_2_titre}}": "Les obligations RGPD en 2025",
      "{{article_2_resume}}": "Mise à jour des exigences en matière de protection des données personnelles...",
      "{{article_2_lien}}": `${profile?.website_url || "https://votresite.com"}/blog/obligations-rgpd-2025`,
      "{{article_3_titre}}": "Guide des successions",
      "{{article_3_resume}}": "Tout ce qu'il faut savoir sur la transmission de patrimoine...",
      "{{article_3_lien}}": `${profile?.website_url || "https://votresite.com"}/blog/guide-successions`,
    };

    Object.entries(replacements).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(key.replace(/[{}]/g, "\\$&"), "g"), value);
    });

    return preview;
  };

  const getPreviewSubject = () => {
    const now = new Date();
    const months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
    return formData.subject
      .replace("{{mois}}", months[now.getMonth()])
      .replace("{{annee}}", now.getFullYear().toString())
      .replace("{{nom_cabinet}}", profile?.cabinet_name || "Cabinet Juridique")
      .replace("{{prenom}}", "Jean")
      .replace("{{nom}}", "Dupont");
  };

  // Convert markdown-like syntax to styled content
  const renderPreviewContent = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, index) => {
      // Bold text with **
      let processedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // Links with 👉
      if (line.includes("👉") && line.includes("http")) {
        const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
        if (urlMatch) {
          processedLine = processedLine.replace(
            urlMatch[0],
            `<a href="${urlMatch[0]}" class="text-primary hover:underline inline-flex items-center gap-1">${urlMatch[0]}</a>`
          );
        }
      }

      if (line.trim() === "---") {
        return <hr key={index} className="my-4 border-border" />;
      }

      if (line.trim() === "") {
        return <br key={index} />;
      }

      return (
        <p 
          key={index} 
          className="leading-relaxed"
          dangerouslySetInnerHTML={{ __html: processedLine }}
        />
      );
    });
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.subject.trim() || !formData.content.trim()) return;
    onSave(formData);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="template-name">Nom du template</Label>
          <Input
            id="template-name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Newsletter mensuelle"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="template-category">Catégorie</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">Personnalisé</SelectItem>
              <SelectItem value="newsletter">Newsletter</SelectItem>
              <SelectItem value="voeux">Vœux</SelectItem>
              <SelectItem value="alerte">Alerte juridique</SelectItem>
              <SelectItem value="evenement">Événement</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="template-subject">Objet de l'email</Label>
        <Input
          id="template-subject"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          placeholder="Ex: Actualités juridiques de {{mois}}"
        />
      </div>

      {/* Editor + Preview side by side */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Editor */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Contenu de l'email</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setArticlePickerOpen(true)}
              >
                <Newspaper className="h-4 w-4 mr-1" />
                Articles
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Variable className="h-4 w-4 mr-1" />
                    Variables
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {variableGroups.map((group) => (
                    <div key={group.label}>
                      <DropdownMenuLabel className="flex items-center gap-2">
                        {group.icon}
                        {group.label}
                      </DropdownMenuLabel>
                      {group.variables.map((v) => (
                        <DropdownMenuItem
                          key={v.key}
                          onClick={() => insertVariable(v.key)}
                        >
                          <code className="text-xs bg-muted px-1 rounded mr-2">
                            {v.key}
                          </code>
                          {v.label}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <Textarea
            id="template-content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Rédigez le contenu de votre email...&#10;&#10;Utilisez **texte** pour mettre en gras&#10;Ajoutez --- pour une ligne de séparation"
            className="min-h-[350px] font-mono text-sm resize-none"
          />
          <p className="text-xs text-muted-foreground">
            💡 **texte** = gras • --- = séparation • Les variables seront remplacées automatiquement
          </p>
        </div>

        {/* Live Preview */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Aperçu en temps réel
          </Label>
          <Card className="min-h-[350px] overflow-hidden">
            {/* Email Header */}
            <div className="bg-muted/50 px-4 py-3 border-b">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <span className="font-medium">De :</span>
                <span>{profile?.cabinet_name || "Cabinet Juridique"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <span className="font-medium">À :</span>
                <span>jean.dupont@example.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-muted-foreground">Objet :</span>
                <span className="font-medium text-foreground">
                  {getPreviewSubject() || "Objet de l'email..."}
                </span>
              </div>
            </div>
            {/* Email Body */}
            <div className="p-4 bg-background max-h-[280px] overflow-y-auto">
              {formData.content ? (
                <div className="text-sm space-y-1">
                  {renderPreviewContent(getPreviewContent())}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm italic">
                  Commencez à rédiger pour voir l'aperçu...
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button onClick={handleSubmit}>
          {isEditing ? "Enregistrer" : "Créer le template"}
        </Button>
      </div>

      <ArticlePickerDialog
        open={articlePickerOpen}
        onOpenChange={setArticlePickerOpen}
        onSelectArticles={handleArticlesSelected}
        maxArticles={3}
      />
    </div>
  );
}
