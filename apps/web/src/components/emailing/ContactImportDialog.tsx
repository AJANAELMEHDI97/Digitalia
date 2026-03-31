import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Upload, FileSpreadsheet, AlertCircle, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ContactImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (contacts: ImportedContact[]) => Promise<void>;
}

export interface ImportedContact {
  email: string;
  first_name?: string;
  last_name?: string;
  company?: string;
}

interface ParsedRow {
  data: string[];
  isValid: boolean;
  error?: string;
}

export function ContactImportDialog({ open, onOpenChange, onImport }: ContactImportDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<"upload" | "mapping" | "preview">("upload");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<{
    email: number;
    first_name: number;
    last_name: number;
    company: number;
  }>({ email: -1, first_name: -1, last_name: -1, company: -1 });
  const [parsedContacts, setParsedContacts] = useState<ImportedContact[]>([]);
  const [importing, setImporting] = useState(false);

  const resetState = () => {
    setStep("upload");
    setHeaders([]);
    setRows([]);
    setMapping({ email: -1, first_name: -1, last_name: -1, company: -1 });
    setParsedContacts([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").filter((line) => line.trim());
      
      if (lines.length < 2) {
        toast({
          title: "Fichier invalide",
          description: "Le fichier doit contenir au moins une ligne d'en-tête et une ligne de données",
          variant: "destructive",
        });
        return;
      }

      // Parse CSV (handle both comma and semicolon delimiters)
      const delimiter = lines[0].includes(";") ? ";" : ",";
      const parsedHeaders = lines[0].split(delimiter).map((h) => h.trim().replace(/^"|"$/g, ""));
      const parsedRows = lines.slice(1).map((line) =>
        line.split(delimiter).map((cell) => cell.trim().replace(/^"|"$/g, ""))
      );

      setHeaders(parsedHeaders);
      setRows(parsedRows);

      // Auto-detect column mapping
      const emailIndex = parsedHeaders.findIndex((h) =>
        /^(email|e-mail|mail|courriel)$/i.test(h)
      );
      const firstNameIndex = parsedHeaders.findIndex((h) =>
        /^(prenom|prénom|firstname|first_name|first name)$/i.test(h)
      );
      const lastNameIndex = parsedHeaders.findIndex((h) =>
        /^(nom|lastname|last_name|last name|name)$/i.test(h)
      );
      const companyIndex = parsedHeaders.findIndex((h) =>
        /^(entreprise|company|societe|société|organisation|organization)$/i.test(h)
      );

      setMapping({
        email: emailIndex,
        first_name: firstNameIndex,
        last_name: lastNameIndex,
        company: companyIndex,
      });

      setStep("mapping");
    };
    reader.readAsText(file);
  };

  const handleMappingConfirm = () => {
    if (mapping.email === -1) {
      toast({
        title: "Colonne email requise",
        description: "Veuillez sélectionner la colonne contenant les adresses email",
        variant: "destructive",
      });
      return;
    }

    const contacts: ImportedContact[] = rows
      .filter((row) => row[mapping.email]?.includes("@"))
      .map((row) => ({
        email: row[mapping.email],
        first_name: mapping.first_name >= 0 ? row[mapping.first_name] : undefined,
        last_name: mapping.last_name >= 0 ? row[mapping.last_name] : undefined,
        company: mapping.company >= 0 ? row[mapping.company] : undefined,
      }));

    setParsedContacts(contacts);
    setStep("preview");
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      await onImport(parsedContacts);
      toast({
        title: "Import réussi",
        description: `${parsedContacts.length} contacts ont été importés`,
      });
      onOpenChange(false);
      resetState();
    } catch (error) {
      toast({
        title: "Erreur d'import",
        description: "Impossible d'importer les contacts",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetState(); }}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Importer des contacts</DialogTitle>
          <DialogDescription>
            {step === "upload" && "Uploadez un fichier CSV ou Excel contenant vos contacts"}
            {step === "mapping" && "Associez les colonnes de votre fichier aux champs de contact"}
            {step === "preview" && "Vérifiez les contacts avant l'import"}
          </DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
            <FileSpreadsheet className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Glissez votre fichier ici</h3>
            <p className="text-sm text-muted-foreground mb-4">ou cliquez pour sélectionner</p>
            <Input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Choisir un fichier
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              Formats acceptés : CSV (séparateur virgule ou point-virgule)
            </p>
          </div>
        )}

        {step === "mapping" && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Email *</Label>
                <Select
                  value={mapping.email.toString()}
                  onValueChange={(v) => setMapping({ ...mapping, email: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner la colonne" />
                  </SelectTrigger>
                  <SelectContent>
                    {headers.map((h, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Prénom</Label>
                <Select
                  value={mapping.first_name.toString()}
                  onValueChange={(v) => setMapping({ ...mapping, first_name: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Optionnel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-1">Non mappé</SelectItem>
                    {headers.map((h, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nom</Label>
                <Select
                  value={mapping.last_name.toString()}
                  onValueChange={(v) => setMapping({ ...mapping, last_name: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Optionnel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-1">Non mappé</SelectItem>
                    {headers.map((h, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Entreprise</Label>
                <Select
                  value={mapping.company.toString()}
                  onValueChange={(v) => setMapping({ ...mapping, company: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Optionnel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-1">Non mappé</SelectItem>
                    {headers.map((h, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm font-medium mb-2">Aperçu des données :</p>
              <ScrollArea className="h-32">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {headers.map((h, i) => (
                        <TableHead key={i} className="text-xs">
                          {h}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.slice(0, 3).map((row, i) => (
                      <TableRow key={i}>
                        {row.map((cell, j) => (
                          <TableCell key={j} className="text-xs py-1">
                            {cell}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Check className="h-3 w-3" />
                {parsedContacts.length} contacts valides
              </Badge>
              {rows.length - parsedContacts.length > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {rows.length - parsedContacts.length} ignorés (email invalide)
                </Badge>
              )}
            </div>

            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Prénom</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Entreprise</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedContacts.slice(0, 50).map((contact, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-mono text-sm">{contact.email}</TableCell>
                      <TableCell>{contact.first_name || "-"}</TableCell>
                      <TableCell>{contact.last_name || "-"}</TableCell>
                      <TableCell>{contact.company || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {parsedContacts.length > 50 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  ... et {parsedContacts.length - 50} autres contacts
                </p>
              )}
            </ScrollArea>
          </div>
        )}

        <DialogFooter>
          {step === "upload" && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
          )}
          {step === "mapping" && (
            <>
              <Button variant="outline" onClick={() => setStep("upload")}>
                Retour
              </Button>
              <Button onClick={handleMappingConfirm}>Continuer</Button>
            </>
          )}
          {step === "preview" && (
            <>
              <Button variant="outline" onClick={() => setStep("mapping")}>
                Retour
              </Button>
              <Button onClick={handleImport} disabled={importing || parsedContacts.length === 0}>
                {importing ? "Import en cours..." : `Importer ${parsedContacts.length} contacts`}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
