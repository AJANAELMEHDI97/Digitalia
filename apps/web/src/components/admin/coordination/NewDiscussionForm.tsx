import { useState, useEffect } from "react";
import { Plus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import type { TeamMember } from "@/hooks/useAdminCoordination";

const SUBJECT_OPTIONS = [
  { value: "general", label: "Général" },
  { value: "performance", label: "Performance" },
  { value: "cabinet", label: "Cabinet" },
  { value: "churn", label: "Churn" },
  { value: "acquisition", label: "Acquisition" },
  { value: "upsell", label: "Upsell" },
  { value: "conformite", label: "Conformité" },
  { value: "facturation", label: "Facturation" },
  { value: "urgence", label: "Urgence" },
] as const;

const FIRM_LINKED_SUBJECTS = ["cabinet", "churn", "facturation", "upsell"];

const PRIORITY_OPTIONS = [
  { value: "normal", label: "Normal" },
  { value: "important", label: "Important" },
  { value: "urgent", label: "Urgent" },
] as const;

interface Firm {
  id: string;
  name: string;
}

interface NewDiscussionFormProps {
  teamMembers: TeamMember[];
  onSubmit: (
    recipientId: string,
    content: string,
    isUrgent: boolean,
    context?: { type: string; id: string; label: string }
  ) => void;
  onCancel: () => void;
}

export function NewDiscussionForm({ teamMembers, onSubmit, onCancel }: NewDiscussionFormProps) {
  const [recipientId, setRecipientId] = useState("");
  const [subject, setSubject] = useState("");
  const [firmId, setFirmId] = useState("");
  const [priority, setPriority] = useState("normal");
  const [message, setMessage] = useState("");
  const [firms, setFirms] = useState<Firm[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Load active firms
  useEffect(() => {
    supabase
      .from("law_firms")
      .select("id, name")
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => {
        if (data) setFirms(data);
      });
  }, []);

  const showFirmSelect = FIRM_LINKED_SUBJECTS.includes(subject);
  const isValid = recipientId && subject && message.trim().length >= 5;

  const cmMembers = teamMembers.filter((m) => m.role === "community_manager");
  const commercialMembers = teamMembers.filter((m) => m.role === "commercial");
  const otherMembers = teamMembers.filter(
    (m) => m.role !== "community_manager" && m.role !== "commercial"
  );

  const handleSubmit = () => {
    if (!isValid || submitting) return;
    setSubmitting(true);

    const subjectLabel = SUBJECT_OPTIONS.find((s) => s.value === subject)?.label || subject;
    const firmName = firmId ? firms.find((f) => f.id === firmId)?.name : null;
    const priorityLabel = priority === "important" ? "[Important] " : "";
    const contextLabel = `${priorityLabel}${subjectLabel}${firmName ? " – " + firmName : ""}`;

    const isUrgent = priority === "urgent";
    const context = {
      type: subject,
      id: firmId || "",
      label: contextLabel,
    };

    onSubmit(recipientId, message.trim(), isUrgent, context);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
        <Plus className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">Nouvelle discussion</span>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {/* Recipient */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Assigner à</label>
          <Select value={recipientId} onValueChange={setRecipientId}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Sélectionner un membre…" />
            </SelectTrigger>
            <SelectContent>
              {cmMembers.length > 0 && (
                <SelectGroup>
                  <SelectLabel>Community Managers</SelectLabel>
                  {cmMembers.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.full_name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              )}
              {commercialMembers.length > 0 && (
                <SelectGroup>
                  <SelectLabel>Commerciaux</SelectLabel>
                  {commercialMembers.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.full_name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              )}
              {otherMembers.length > 0 && (
                <SelectGroup>
                  <SelectLabel>Autres</SelectLabel>
                  {otherMembers.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.full_name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Subject */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Sujet</label>
          <Select
            value={subject}
            onValueChange={(v) => {
              setSubject(v);
              if (!FIRM_LINKED_SUBJECTS.includes(v)) setFirmId("");
            }}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Choisir un sujet…" />
            </SelectTrigger>
            <SelectContent>
              {SUBJECT_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Firm (conditional) */}
        {showFirmSelect && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Cabinet concerné</label>
            <Select value={firmId} onValueChange={setFirmId}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Sélectionner un cabinet…" />
              </SelectTrigger>
              <SelectContent>
                {firms.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Priority */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Priorité</label>
          <div className="flex gap-1.5">
            {PRIORITY_OPTIONS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPriority(p.value)}
                className={cn(
                  "flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border",
                  priority === p.value
                    ? p.value === "urgent"
                      ? "bg-destructive text-destructive-foreground border-destructive"
                      : p.value === "important"
                        ? "bg-accent text-accent-foreground border-accent"
                        : "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:bg-muted"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Message</label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Décrivez le sujet de la discussion…"
            className="min-h-[100px] text-sm resize-none"
          />
          {message.length > 0 && message.trim().length < 5 && (
            <p className="text-[11px] text-destructive">Minimum 5 caractères requis.</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-4 py-3 border-t border-border/50">
        <Button variant="outline" size="sm" className="flex-1" onClick={onCancel}>
          Annuler
        </Button>
        <Button
          size="sm"
          className="flex-1 gap-1.5"
          disabled={!isValid || submitting}
          onClick={handleSubmit}
        >
          <Send className="h-3.5 w-3.5" />
          Démarrer
        </Button>
      </div>
    </div>
  );
}
