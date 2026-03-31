-- Table pour les templates d'emails
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les campagnes d'emails
CREATE TABLE public.email_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  template_id UUID REFERENCES public.email_templates(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les destinataires des campagnes
CREATE TABLE public.email_recipients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les listes de contacts
CREATE TABLE public.contact_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  contact_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les contacts dans les listes
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID NOT NULL REFERENCES public.contact_lists(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  company TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(list_id, email)
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Policies for email_templates
CREATE POLICY "Users can view their own templates" ON public.email_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own templates" ON public.email_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own templates" ON public.email_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own templates" ON public.email_templates FOR DELETE USING (auth.uid() = user_id);

-- Policies for email_campaigns
CREATE POLICY "Users can view their own campaigns" ON public.email_campaigns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own campaigns" ON public.email_campaigns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own campaigns" ON public.email_campaigns FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own campaigns" ON public.email_campaigns FOR DELETE USING (auth.uid() = user_id);

-- Policies for email_recipients (via campaign ownership)
CREATE POLICY "Users can view recipients of their campaigns" ON public.email_recipients FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.email_campaigns WHERE id = campaign_id AND user_id = auth.uid()));
CREATE POLICY "Users can add recipients to their campaigns" ON public.email_recipients FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.email_campaigns WHERE id = campaign_id AND user_id = auth.uid()));
CREATE POLICY "Users can update recipients of their campaigns" ON public.email_recipients FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.email_campaigns WHERE id = campaign_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete recipients from their campaigns" ON public.email_recipients FOR DELETE 
USING (EXISTS (SELECT 1 FROM public.email_campaigns WHERE id = campaign_id AND user_id = auth.uid()));

-- Policies for contact_lists
CREATE POLICY "Users can view their own contact lists" ON public.contact_lists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own contact lists" ON public.contact_lists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own contact lists" ON public.contact_lists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own contact lists" ON public.contact_lists FOR DELETE USING (auth.uid() = user_id);

-- Policies for contacts (via list ownership)
CREATE POLICY "Users can view contacts in their lists" ON public.contacts FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.contact_lists WHERE id = list_id AND user_id = auth.uid()));
CREATE POLICY "Users can add contacts to their lists" ON public.contacts FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.contact_lists WHERE id = list_id AND user_id = auth.uid()));
CREATE POLICY "Users can update contacts in their lists" ON public.contacts FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.contact_lists WHERE id = list_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete contacts from their lists" ON public.contacts FOR DELETE 
USING (EXISTS (SELECT 1 FROM public.contact_lists WHERE id = list_id AND user_id = auth.uid()));

-- Trigger for updating contact_count
CREATE OR REPLACE FUNCTION update_contact_list_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.contact_lists SET contact_count = contact_count + 1, updated_at = now() WHERE id = NEW.list_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.contact_lists SET contact_count = contact_count - 1, updated_at = now() WHERE id = OLD.list_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_contact_count_trigger
AFTER INSERT OR DELETE ON public.contacts
FOR EACH ROW EXECUTE FUNCTION update_contact_list_count();

-- Trigger for updated_at
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON public.email_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_email_campaigns_updated_at BEFORE UPDATE ON public.email_campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contact_lists_updated_at BEFORE UPDATE ON public.contact_lists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();