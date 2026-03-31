import { useState, useEffect } from "react";
import { useLawFirmContextSafe } from "@/contexts/LawFirmContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Send,
  AlertCircle,
  ArrowLeft,
  Pencil,
  X,
  Check
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { useNavigate } from "react-router-dom";

interface FormData {
  name: string;
  bar_association: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  website_url: string;
}

/**
 * Page paramètres cabinet pour les Community Managers
 * Formulaire éditable avec envoi pour validation
 */
export default function CMFirmSettings() {
  const { selectedFirm, assignedFirms, selectedFirmId, setSelectedFirmId, isLoading } = useLawFirmContextSafe();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    bar_association: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    website_url: '',
  });
  const [justification, setJustification] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fieldLabels: Record<keyof FormData, string> = {
    name: "Nom du cabinet",
    bar_association: "Barreau",
    email: "Email",
    phone: "Téléphone",
    address: "Adresse",
    city: "Ville",
    postal_code: "Code postal",
    website_url: "Site web",
  };

  // Sync form data with selected firm
  useEffect(() => {
    if (selectedFirm) {
      setFormData({
        name: selectedFirm.name || '',
        bar_association: selectedFirm.bar_association || '',
        email: selectedFirm.email || '',
        phone: selectedFirm.phone || '',
        address: selectedFirm.address || '',
        city: selectedFirm.city || '',
        postal_code: selectedFirm.postal_code || '',
        website_url: selectedFirm.website_url || '',
      });
      setIsEditing(false);
      setJustification("");
    }
  }, [selectedFirm]);

  // Get modified fields
  const getModifiedFields = (): Array<{ field: keyof FormData; oldValue: string; newValue: string }> => {
    if (!selectedFirm) return [];
    
    const modifications: Array<{ field: keyof FormData; oldValue: string; newValue: string }> = [];
    
    (Object.keys(formData) as Array<keyof FormData>).forEach((field) => {
      const oldValue = (selectedFirm as any)[field] || '';
      const newValue = formData[field] || '';
      
      if (oldValue !== newValue) {
        modifications.push({ field, oldValue, newValue });
      }
    });
    
    return modifications;
  };

  const modifiedFields = getModifiedFields();
  const hasModifications = modifiedFields.length > 0;

  const handleSubmitRequest = async () => {
    if (!selectedFirm || !hasModifications) {
      toast.error("Aucune modification à envoyer");
      return;
    }
    
    if (!justification.trim()) {
      toast.error("Veuillez fournir une justification pour vos modifications");
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      // Create one modification request per changed field
      const requests = modifiedFields.map((mod) => ({
        requester_id: user.id,
        law_firm_id: selectedFirm.id,
        request_type: 'firm_info',
        field_name: mod.field,
        current_value: mod.oldValue,
        requested_value: mod.newValue,
        justification: justification,
        status: 'pending'
      }));

      const { error } = await supabase.from('modification_requests').insert(requests);

      if (error) throw error;

      toast.success(`${modifiedFields.length} demande(s) de modification envoyée(s)`, {
        description: "Un administrateur ou l'avocat examinera vos demandes."
      });
      
      // Reset form to original values
      if (selectedFirm) {
        setFormData({
          name: selectedFirm.name || '',
          bar_association: selectedFirm.bar_association || '',
          email: selectedFirm.email || '',
          phone: selectedFirm.phone || '',
          address: selectedFirm.address || '',
          city: selectedFirm.city || '',
          postal_code: selectedFirm.postal_code || '',
          website_url: selectedFirm.website_url || '',
        });
      }
      setIsEditing(false);
      setJustification("");
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error("Erreur lors de l'envoi des demandes");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    if (selectedFirm) {
      setFormData({
        name: selectedFirm.name || '',
        bar_association: selectedFirm.bar_association || '',
        email: selectedFirm.email || '',
        phone: selectedFirm.phone || '',
        address: selectedFirm.address || '',
        city: selectedFirm.city || '',
        postal_code: selectedFirm.postal_code || '',
        website_url: selectedFirm.website_url || '',
      });
    }
    setIsEditing(false);
    setJustification("");
  };

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Paramètres du cabinet</h1>
          <Card className="animate-pulse">
            <CardContent className="h-64" />
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (!selectedFirm) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/cm/firms')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Paramètres du cabinet</h1>
          </div>
          <Card className="py-12">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Aucun cabinet sélectionné</h3>
              <p className="text-muted-foreground mt-2">
                Veuillez sélectionner un cabinet pour voir ses paramètres.
              </p>
              {assignedFirms.length > 0 && (
                <Select value={selectedFirmId || ""} onValueChange={setSelectedFirmId}>
                  <SelectTrigger className="w-[250px] mt-4">
                    <SelectValue placeholder="Choisir un cabinet" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignedFirms.map((firm) => (
                      <SelectItem key={firm.id} value={firm.id}>{firm.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/cm/firms')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Paramètres du cabinet</h1>
              <p className="text-muted-foreground">
                {selectedFirm.name}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Modifier les informations
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleCancelEdit}>
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
                <Button 
                  onClick={handleSubmitRequest} 
                  disabled={!hasModifications || submitting}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {submitting ? "Envoi..." : "Envoyer pour validation"}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Sélecteur de cabinet */}
        {assignedFirms.length > 1 && (
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-4">
                <Label>Cabinet actif :</Label>
                <Select value={selectedFirmId || ""} onValueChange={setSelectedFirmId}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {assignedFirms.map((firm) => (
                      <SelectItem key={firm.id} value={firm.id}>{firm.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Formulaire d'informations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informations générales
              {hasModifications && isEditing && (
                <Badge variant="secondary" className="ml-2">
                  {modifiedFields.length} modification{modifiedFields.length > 1 ? 's' : ''}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {isEditing 
                ? "Modifiez les informations puis envoyez pour validation"
                : "Ces informations sont gérées par l'avocat ou un administrateur"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Nom du cabinet */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Nom du cabinet
                  {modifiedFields.some(m => m.field === 'name') && (
                    <Badge variant="outline" className="text-xs">Modifié</Badge>
                  )}
                </Label>
                {isEditing ? (
                  <Input 
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Nom du cabinet"
                  />
                ) : (
                  <div className="p-3 bg-muted rounded-md font-medium">
                    {selectedFirm.name}
                  </div>
                )}
              </div>
              
              {/* Barreau */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Barreau
                  {modifiedFields.some(m => m.field === 'bar_association') && (
                    <Badge variant="outline" className="text-xs">Modifié</Badge>
                  )}
                </Label>
                {isEditing ? (
                  <Input 
                    value={formData.bar_association}
                    onChange={(e) => updateField('bar_association', e.target.value)}
                    placeholder="Barreau de rattachement"
                  />
                ) : (
                  <div className="p-3 bg-muted rounded-md">
                    {selectedFirm.bar_association || <span className="text-muted-foreground italic">Non renseigné</span>}
                  </div>
                )}
              </div>
              
              {/* Email */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                  {modifiedFields.some(m => m.field === 'email') && (
                    <Badge variant="outline" className="text-xs">Modifié</Badge>
                  )}
                </Label>
                {isEditing ? (
                  <Input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="email@cabinet.fr"
                  />
                ) : (
                  <div className="p-3 bg-muted rounded-md">
                    {selectedFirm.email || <span className="text-muted-foreground italic">Non renseigné</span>}
                  </div>
                )}
              </div>
              
              {/* Téléphone */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Téléphone
                  {modifiedFields.some(m => m.field === 'phone') && (
                    <Badge variant="outline" className="text-xs">Modifié</Badge>
                  )}
                </Label>
                {isEditing ? (
                  <Input 
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="01 23 45 67 89"
                  />
                ) : (
                  <div className="p-3 bg-muted rounded-md">
                    {selectedFirm.phone || <span className="text-muted-foreground italic">Non renseigné</span>}
                  </div>
                )}
              </div>
              
              {/* Adresse */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Adresse
                  {modifiedFields.some(m => m.field === 'address') && (
                    <Badge variant="outline" className="text-xs">Modifié</Badge>
                  )}
                </Label>
                {isEditing ? (
                  <Input 
                    value={formData.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    placeholder="123 rue de la Loi"
                  />
                ) : (
                  <div className="p-3 bg-muted rounded-md">
                    {selectedFirm.address || <span className="text-muted-foreground italic">Non renseignée</span>}
                  </div>
                )}
              </div>
              
              {/* Ville et Code postal */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Ville
                    {modifiedFields.some(m => m.field === 'city') && (
                      <Badge variant="outline" className="text-xs">Modifié</Badge>
                    )}
                  </Label>
                  {isEditing ? (
                    <Input 
                      value={formData.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      placeholder="Paris"
                    />
                  ) : (
                    <div className="p-3 bg-muted rounded-md">
                      {selectedFirm.city || <span className="text-muted-foreground italic">-</span>}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Code postal
                    {modifiedFields.some(m => m.field === 'postal_code') && (
                      <Badge variant="outline" className="text-xs">Modifié</Badge>
                    )}
                  </Label>
                  {isEditing ? (
                    <Input 
                      value={formData.postal_code}
                      onChange={(e) => updateField('postal_code', e.target.value)}
                      placeholder="75001"
                    />
                  ) : (
                    <div className="p-3 bg-muted rounded-md">
                      {selectedFirm.postal_code || <span className="text-muted-foreground italic">-</span>}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Site web */}
              <div className="space-y-2 md:col-span-2">
                <Label className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Site web
                  {modifiedFields.some(m => m.field === 'website_url') && (
                    <Badge variant="outline" className="text-xs">Modifié</Badge>
                  )}
                </Label>
                {isEditing ? (
                  <Input 
                    value={formData.website_url}
                    onChange={(e) => updateField('website_url', e.target.value)}
                    placeholder="https://www.cabinet.fr"
                  />
                ) : (
                  <div className="p-3 bg-muted rounded-md">
                    {selectedFirm.website_url ? (
                      <a href={selectedFirm.website_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {selectedFirm.website_url}
                      </a>
                    ) : (
                      <span className="text-muted-foreground italic">Non renseigné</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Zone de justification (visible en mode édition avec modifications) */}
        {isEditing && hasModifications && (
          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                Résumé des modifications
              </CardTitle>
              <CardDescription>
                Récapitulatif des changements et justification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Liste des modifications */}
              <div className="space-y-2">
                {modifiedFields.map((mod) => (
                  <div key={mod.field} className="flex items-center gap-2 p-2 bg-muted rounded-md text-sm">
                    <Badge variant="secondary">{fieldLabels[mod.field]}</Badge>
                    <span className="text-muted-foreground line-through">{mod.oldValue || '(vide)'}</span>
                    <span>→</span>
                    <span className="font-medium">{mod.newValue || '(vide)'}</span>
                  </div>
                ))}
              </div>
              
              {/* Justification */}
              <div className="space-y-2">
                <Label htmlFor="justification">Justification de la demande *</Label>
                <Textarea 
                  id="justification"
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Expliquez pourquoi ces modifications sont nécessaires..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Note d'information */}
        {!isEditing && (
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
            <CardContent className="pt-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">
                    Modifications soumises à validation
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    En tant que Community Manager, vos modifications doivent être validées par l'avocat ou un administrateur. 
                    Cliquez sur "Modifier les informations" pour proposer des changements.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
