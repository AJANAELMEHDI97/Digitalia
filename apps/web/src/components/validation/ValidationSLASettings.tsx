import React, { useState } from "react";
import { Clock, AlertTriangle, Shield, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useValidationSLA, type SLASettings } from "@/hooks/useValidationSLA";
import type { ExpirationBehavior } from "@/hooks/usePublications";

const SLA_OPTIONS = [
  { value: 24, label: "24 heures" },
  { value: 48, label: "48 heures" },
  { value: 72, label: "72 heures" },
];

const URGENT_SLA_OPTIONS = [
  { value: 6, label: "6 heures" },
  { value: 12, label: "12 heures" },
];

export function ValidationSLASettings() {
  const { slaSettings, settingsLoading, updateSLASettings } = useValidationSLA();
  const [localSettings, setLocalSettings] = useState<SLASettings | null>(null);
  const [saving, setSaving] = useState(false);

  // Use local state if modified, otherwise use fetched settings
  const currentSettings = localSettings || slaSettings;

  const handleSave = async () => {
    if (!localSettings) return;
    setSaving(true);
    const success = await updateSLASettings(localSettings);
    if (success) {
      setLocalSettings(null);
    }
    setSaving(false);
  };

  const handleChange = (key: keyof SLASettings, value: number | ExpirationBehavior) => {
    setLocalSettings({
      ...(localSettings || slaSettings),
      [key]: value,
    });
  };

  const hasChanges = localSettings !== null;

  if (settingsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Délais de validation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Délais de validation
        </CardTitle>
        <CardDescription>
          Configurez le temps dont vous disposez pour valider chaque publication soumise par votre Community Manager.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Standard SLA */}
        <div className="space-y-2">
          <Label>Délai standard de validation</Label>
          <Select
            value={currentSettings.validationSlaHours.toString()}
            onValueChange={(v) => handleChange('validationSlaHours', parseInt(v))}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SLA_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value.toString()}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Temps par défaut pour valider une publication ordinaire
          </p>
        </div>

        {/* Urgent SLA */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Délai pour publications urgentes
          </Label>
          <Select
            value={currentSettings.urgentSlaHours.toString()}
            onValueChange={(v) => handleChange('urgentSlaHours', parseInt(v))}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {URGENT_SLA_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value.toString()}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Pour les sujets d'actualité nécessitant une validation rapide
          </p>
        </div>

        <Separator />

        {/* Expiration Behavior */}
        <div className="space-y-3">
          <Label>Si je ne réponds pas avant le délai :</Label>
          <RadioGroup
            value={currentSettings.expirationBehavior}
            onValueChange={(v) => handleChange('expirationBehavior', v as ExpirationBehavior)}
            className="space-y-3"
          >
            <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="do_not_publish" id="do_not_publish" className="mt-1" />
              <div className="space-y-1">
                <Label htmlFor="do_not_publish" className="font-medium cursor-pointer">
                  Ne pas publier (recommandé)
                </Label>
                <p className="text-xs text-muted-foreground">
                  La publication passe en statut "Expiré" et nécessite une action manuelle.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="save_as_draft" id="save_as_draft" className="mt-1" />
              <div className="space-y-1">
                <Label htmlFor="save_as_draft" className="font-medium cursor-pointer">
                  Mettre en brouillon planifié
                </Label>
                <p className="text-xs text-muted-foreground">
                  La publication est conservée pour une date ultérieure sans être publiée.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-lg border border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-900/10">
              <RadioGroupItem value="auto_publish" id="auto_publish" className="mt-1" />
              <div className="space-y-1">
                <Label htmlFor="auto_publish" className="font-medium cursor-pointer flex items-center gap-2">
                  Autoriser la publication automatique
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                </Label>
                <p className="text-xs text-muted-foreground">
                  La publication sera diffusée automatiquement après le délai.
                </p>
              </div>
            </div>
          </RadioGroup>

          {currentSettings.expirationBehavior === 'auto_publish' && (
            <Alert variant="destructive" className="mt-3">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Attention</AlertTitle>
              <AlertDescription>
                En activant cette option, les publications seront diffusées sans votre validation explicite si vous ne répondez pas à temps. 
                Vous restez responsable du contenu publié au nom de votre cabinet.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Separator />

        {/* Trust message */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Aucune publication sans validation explicite de l'avocat</strong> (sauf si vous activez volontairement la publication automatique ci-dessus).
          </AlertDescription>
        </Alert>

        {/* Save button */}
        {hasChanges && (
          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Enregistrement..." : "Enregistrer les modifications"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ValidationSLASettings;