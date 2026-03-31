import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Users, FileText, Send, Info, Shield } from "lucide-react";
import { useEmailing } from "@/hooks/useEmailing";
import { ContactListsTab } from "@/components/emailing/ContactListsTab";
import { EmailTemplatesTab } from "@/components/emailing/EmailTemplatesTab";
import { CampaignsTab } from "@/components/emailing/CampaignsTab";
import { Skeleton } from "@/components/ui/skeleton";

export default function Emailing() {
  const {
    templates,
    campaigns,
    contactLists,
    loading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    createContactList,
    deleteContactList,
    fetchContacts,
    addContact,
    deleteContact,
    importContactsToList,
    fetchCampaignRecipients,
  } = useEmailing();

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Emailing</h1>
            <p className="text-muted-foreground">Gérez vos campagnes email et listes de contacts</p>
          </div>
        </div>

        {/* Purpose explanation */}
        <Alert className="border-primary/20 bg-primary/5">
          <Info className="h-4 w-4 text-primary" />
          <AlertDescription className="text-foreground">
            <strong>Communication ciblée.</strong> Utile pour informer vos clients de changements législatifs ou d'actualités du cabinet.
          </AlertDescription>
        </Alert>
        
        {/* RGPD compliance */}
        <Alert className="border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-800">
          <Shield className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="text-emerald-800 dark:text-emerald-200">
            <strong>Conformité RGPD.</strong> Respect des obligations légales et désinscription automatique pour tous vos contacts.
          </AlertDescription>
        </Alert>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full max-w-md" />
            <div className="grid gap-4 md:grid-cols-3">
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
            </div>
          </div>
        ) : (
          <Tabs defaultValue="contacts" className="space-y-6">
            <TabsList>
              <TabsTrigger value="contacts" className="gap-2">
                <Users className="h-4 w-4" />
                Contacts
              </TabsTrigger>
              <TabsTrigger value="templates" className="gap-2">
                <FileText className="h-4 w-4" />
                Templates
              </TabsTrigger>
              <TabsTrigger value="campaigns" className="gap-2">
                <Send className="h-4 w-4" />
                Campagnes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="contacts">
              <ContactListsTab
                contactLists={contactLists}
                onCreateList={createContactList}
                onDeleteList={deleteContactList}
                onFetchContacts={fetchContacts}
                onAddContact={addContact}
                onDeleteContact={deleteContact}
                onImportContacts={importContactsToList}
              />
            </TabsContent>

            <TabsContent value="templates">
              <EmailTemplatesTab
                templates={templates}
                onCreateTemplate={createTemplate}
                onUpdateTemplate={updateTemplate}
                onDeleteTemplate={deleteTemplate}
              />
            </TabsContent>

            <TabsContent value="campaigns">
              <CampaignsTab
                campaigns={campaigns}
                templates={templates}
                contactLists={contactLists}
                onCreateCampaign={createCampaign}
                onUpdateCampaign={updateCampaign}
                onDeleteCampaign={deleteCampaign}
                fetchCampaignRecipients={fetchCampaignRecipients}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppLayout>
  );
}
