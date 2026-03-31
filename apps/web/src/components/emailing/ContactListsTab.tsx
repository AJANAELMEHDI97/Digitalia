import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Trash2, Eye, UserPlus, Upload } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { ContactList, Contact } from "@/hooks/useEmailing";
import { ContactImportDialog, ImportedContact } from "./ContactImportDialog";

interface ContactListsTabProps {
  contactLists: ContactList[];
  onCreateList: (data: { name: string; description?: string }) => Promise<ContactList | null>;
  onDeleteList: (id: string) => Promise<boolean>;
  onFetchContacts: (listId: string) => Promise<Contact[]>;
  onAddContact: (listId: string, data: { email: string; first_name?: string; last_name?: string; company?: string }) => Promise<Contact | null>;
  onDeleteContact: (contactId: string) => Promise<boolean>;
  onImportContacts?: (listId: string, contacts: ImportedContact[]) => Promise<void>;
}

export function ContactListsTab({
  contactLists,
  onCreateList,
  onDeleteList,
  onFetchContacts,
  onAddContact,
  onDeleteContact,
  onImportContacts,
}: ContactListsTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const [selectedList, setSelectedList] = useState<ContactList | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsDialogOpen, setContactsDialogOpen] = useState(false);
  const [addContactDialogOpen, setAddContactDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [newContact, setNewContact] = useState({ email: "", first_name: "", last_name: "", company: "" });

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    await onCreateList({ name: newListName, description: newListDescription || undefined });
    setNewListName("");
    setNewListDescription("");
    setDialogOpen(false);
  };

  const handleViewContacts = async (list: ContactList) => {
    setSelectedList(list);
    const data = await onFetchContacts(list.id);
    setContacts(data);
    setContactsDialogOpen(true);
  };

  const handleAddContact = async () => {
    if (!selectedList || !newContact.email.trim()) return;
    await onAddContact(selectedList.id, newContact);
    const data = await onFetchContacts(selectedList.id);
    setContacts(data);
    setNewContact({ email: "", first_name: "", last_name: "", company: "" });
    setAddContactDialogOpen(false);
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!selectedList) return;
    await onDeleteContact(contactId);
    const data = await onFetchContacts(selectedList!.id);
    setContacts(data);
  };

  const handleImportContacts = async (importedContacts: ImportedContact[]) => {
    if (!selectedList || !onImportContacts) return;
    await onImportContacts(selectedList.id, importedContacts);
    const data = await onFetchContacts(selectedList.id);
    setContacts(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Listes de contacts</h2>
          <p className="text-sm text-muted-foreground">Gérez vos listes de destinataires</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle liste
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une liste de contacts</DialogTitle>
              <DialogDescription>Ajoutez une nouvelle liste pour organiser vos contacts</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="list-name">Nom de la liste</Label>
                <Input
                  id="list-name"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Ex: Avocats Paris"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="list-description">Description (optionnel)</Label>
                <Textarea
                  id="list-description"
                  value={newListDescription}
                  onChange={(e) => setNewListDescription(e.target.value)}
                  placeholder="Description de la liste..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button onClick={handleCreateList}>Créer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {contactLists.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune liste de contacts</h3>
            <p className="text-sm text-muted-foreground mb-4">Créez votre première liste pour commencer</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer une liste
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {contactLists.map((list) => (
            <Card key={list.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{list.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{list.description || "Aucune description"}</CardDescription>
                  </div>
                  <Badge variant="secondary">
                    <Users className="h-3 w-3 mr-1" />
                    {list.contact_count}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-4">
                  Créée le {format(new Date(list.created_at), "d MMM yyyy", { locale: fr })}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewContacts(list)}>
                    <Eye className="h-4 w-4 mr-1" />
                    Voir
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => onDeleteList(list.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Contacts Dialog */}
      <Dialog open={contactsDialogOpen} onOpenChange={setContactsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {selectedList?.name}
            </DialogTitle>
            <DialogDescription>{selectedList?.contact_count} contact(s)</DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-end gap-2 mb-4">
            <Button size="sm" variant="outline" onClick={() => setImportDialogOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Importer CSV
            </Button>
            <Button size="sm" onClick={() => setAddContactDialogOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Ajouter un contact
            </Button>
          </div>

          {contacts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Aucun contact dans cette liste</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Entreprise</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium">{contact.email}</TableCell>
                    <TableCell>{[contact.first_name, contact.last_name].filter(Boolean).join(" ") || "-"}</TableCell>
                    <TableCell>{contact.company || "-"}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteContact(contact.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Contact Dialog */}
      <Dialog open={addContactDialogOpen} onOpenChange={setAddContactDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un contact</DialogTitle>
            <DialogDescription>Ajoutez un nouveau contact à la liste "{selectedList?.name}"</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contact-email">Email *</Label>
              <Input
                id="contact-email"
                type="email"
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                placeholder="email@exemple.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact-firstname">Prénom</Label>
                <Input
                  id="contact-firstname"
                  value={newContact.first_name}
                  onChange={(e) => setNewContact({ ...newContact, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-lastname">Nom</Label>
                <Input
                  id="contact-lastname"
                  value={newContact.last_name}
                  onChange={(e) => setNewContact({ ...newContact, last_name: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-company">Entreprise / Cabinet</Label>
              <Input
                id="contact-company"
                value={newContact.company}
                onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddContactDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleAddContact}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <ContactImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImport={handleImportContacts}
      />
    </div>
  );
}
