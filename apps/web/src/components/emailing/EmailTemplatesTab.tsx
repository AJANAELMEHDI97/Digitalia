import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, Trash2, Edit2, Copy, LayoutTemplate, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { EmailTemplate } from "@/hooks/useEmailing";
import { SystemTemplates } from "./SystemTemplates";
import { TemplateEditor } from "./TemplateEditor";

interface EmailTemplatesTabProps {
  templates: EmailTemplate[];
  onCreateTemplate: (data: { name: string; subject: string; content: string; category?: string }) => Promise<EmailTemplate | null>;
  onUpdateTemplate: (id: string, data: Partial<EmailTemplate>) => Promise<boolean>;
  onDeleteTemplate: (id: string) => Promise<boolean>;
}

export function EmailTemplatesTab({
  templates,
  onCreateTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
}: EmailTemplatesTabProps) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [initialData, setInitialData] = useState<{ name: string; subject: string; content: string; category: string } | undefined>();

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setInitialData(undefined);
    setEditorOpen(true);
  };

  const handleOpenEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setInitialData({
      name: template.name,
      subject: template.subject,
      content: template.content,
      category: template.category || "custom",
    });
    setEditorOpen(true);
  };

  const handleDuplicateSystem = (data: { name: string; subject: string; content: string; category: string }) => {
    setEditingTemplate(null);
    setInitialData(data);
    setEditorOpen(true);
  };

  const handleDuplicate = async (template: EmailTemplate) => {
    await onCreateTemplate({
      name: `${template.name} (copie)`,
      subject: template.subject,
      content: template.content,
      category: template.category || undefined,
    });
  };

  const handleSave = async (data: { name: string; subject: string; content: string; category: string }) => {
    if (editingTemplate) {
      await onUpdateTemplate(editingTemplate.id, data);
    } else {
      await onCreateTemplate(data);
    }
    setEditorOpen(false);
  };

  const userTemplates = templates.filter(t => !t.is_system_template);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Templates d'emails</h2>
          <p className="text-sm text-muted-foreground">Modèles pour vos newsletters et campagnes</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau template
        </Button>
      </div>

      <Tabs defaultValue="system" className="w-full">
        <TabsList>
          <TabsTrigger value="system" className="gap-1">
            <Sparkles className="h-4 w-4" />
            Templates prêts à l'emploi
          </TabsTrigger>
          <TabsTrigger value="custom" className="gap-1">
            <LayoutTemplate className="h-4 w-4" />
            Mes templates ({userTemplates.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="mt-6">
          <SystemTemplates onDuplicate={handleDuplicateSystem} />
        </TabsContent>

        <TabsContent value="custom" className="mt-6">
          {userTemplates.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucun template personnalisé</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Utilisez un template système ou créez le vôtre
                </p>
                <Button onClick={handleOpenCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un template
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {userTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{template.name}</CardTitle>
                        <CardDescription className="truncate">{template.subject}</CardDescription>
                      </div>
                      <Badge variant="outline">
                        {template.category || "custom"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[40px]">
                      {template.content.substring(0, 100)}...
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Modifié le {format(new Date(template.updated_at), "d MMM yyyy", { locale: fr })}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleOpenEdit(template)}>
                        <Edit2 className="h-4 w-4 mr-1" />
                        Modifier
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDuplicate(template)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => onDeleteTemplate(template.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Editor Dialog */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? "Modifier le template" : "Créer un template"}</DialogTitle>
          </DialogHeader>
          <TemplateEditor
            initialData={initialData}
            onSave={handleSave}
            onCancel={() => setEditorOpen(false)}
            isEditing={!!editingTemplate}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
