
-- Phase 1: Création des tables pour une application 100% dynamique

-- 1. Enum pour les rôles utilisateur
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. Table user_roles (sécurité)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Fonction sécurisée pour vérifier les rôles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 3. Table trends (Tendances juridiques)
CREATE TABLE public.trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  why_trending TEXT,
  attention_level TEXT CHECK (attention_level IN ('high', 'medium', 'low')),
  evolution TEXT CHECK (evolution IN ('rising', 'stable', 'falling')),
  relevance TEXT CHECK (relevance IN ('pertinent', 'watch', 'avoid')),
  platforms TEXT[],
  regions TEXT[],
  peak_region TEXT,
  intensity INTEGER DEFAULT 50 CHECK (intensity >= 0 AND intensity <= 100),
  editorial_recommendation TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.trends ENABLE ROW LEVEL SECURITY;

-- 4. Table key_dates (Dates clés juridiques)
CREATE TABLE public.key_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month_day TEXT NOT NULL, -- Format MM-DD pour récurrence
  title TEXT NOT NULL,
  description TEXT,
  importance TEXT CHECK (importance IN ('high', 'medium', 'low')),
  speaking_opportunities TEXT[],
  recommended_platforms TEXT[],
  category TEXT NOT NULL,
  is_recurring BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.key_dates ENABLE ROW LEVEL SECURITY;

-- 5. Table judicial_events (Événements judiciaires)
CREATE TABLE public.judicial_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  end_date DATE,
  title TEXT NOT NULL,
  description TEXT,
  thematic TEXT NOT NULL,
  sensitivity TEXT CHECK (sensitivity IN ('opportune', 'surveiller', 'eviter')),
  sensitivity_reason TEXT,
  speaking_guidance TEXT,
  linked_trends TEXT[],
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.judicial_events ENABLE ROW LEVEL SECURITY;

-- 6. Table publication_metrics (Métriques par publication)
CREATE TABLE public.publication_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id UUID REFERENCES public.publications(id) ON DELETE CASCADE NOT NULL,
  reach INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  performance_level TEXT CHECK (performance_level IN ('good', 'medium', 'improve')),
  audience_age JSONB,
  audience_location JSONB,
  audience_gender JSONB,
  peak_times JSONB,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.publication_metrics ENABLE ROW LEVEL SECURITY;

-- 7. Table faq
CREATE TABLE public.faq (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  keywords TEXT[],
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;

-- 8. Table support_conversations
CREATE TABLE public.support_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subject TEXT NOT NULL,
  reason TEXT NOT NULL,
  linked_publication_id UUID REFERENCES public.publications(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'pending')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.support_conversations ENABLE ROW LEVEL SECURITY;

-- 9. Table support_messages
CREATE TABLE public.support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.support_conversations(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  sender TEXT CHECK (sender IN ('user', 'cm', 'ai')) NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- 10. Table notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 11. Extension table profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'Avocat';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notification_new_proposals BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notification_reminders BOOLEAN DEFAULT true;

-- ===== RLS POLICIES =====

-- user_roles: only admins can manage roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- trends: public read, admin write
CREATE POLICY "Anyone can view trends"
ON public.trends FOR SELECT
USING (true);

CREATE POLICY "Admins can manage trends"
ON public.trends FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- key_dates: public read, admin write
CREATE POLICY "Anyone can view key dates"
ON public.key_dates FOR SELECT
USING (true);

CREATE POLICY "Admins can manage key dates"
ON public.key_dates FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- judicial_events: public read, admin write
CREATE POLICY "Anyone can view judicial events"
ON public.judicial_events FOR SELECT
USING (true);

CREATE POLICY "Admins can manage judicial events"
ON public.judicial_events FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- publication_metrics: user can view their own publication metrics
CREATE POLICY "Users can view their own publication metrics"
ON public.publication_metrics FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.publications
    WHERE publications.id = publication_metrics.publication_id
    AND publications.user_id = auth.uid()
  )
);

CREATE POLICY "System can insert publication metrics"
ON public.publication_metrics FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.publications
    WHERE publications.id = publication_metrics.publication_id
    AND publications.user_id = auth.uid()
  )
);

-- faq: public read, admin write
CREATE POLICY "Anyone can view active FAQ"
ON public.faq FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage FAQ"
ON public.faq FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- support_conversations: user can view/manage their own
CREATE POLICY "Users can view their own conversations"
ON public.support_conversations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
ON public.support_conversations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
ON public.support_conversations FOR UPDATE
USING (auth.uid() = user_id);

-- support_messages: user can view messages in their conversations
CREATE POLICY "Users can view messages in their conversations"
ON public.support_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.support_conversations
    WHERE support_conversations.id = support_messages.conversation_id
    AND support_conversations.user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages in their conversations"
ON public.support_messages FOR INSERT
WITH CHECK (
  sender = 'user' AND
  EXISTS (
    SELECT 1 FROM public.support_conversations
    WHERE support_conversations.id = support_messages.conversation_id
    AND support_conversations.user_id = auth.uid()
  )
);

-- notifications: user can view/manage their own
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
ON public.notifications FOR DELETE
USING (auth.uid() = user_id);

-- ===== TRIGGERS =====

-- Trigger for updating updated_at on trends
CREATE TRIGGER update_trends_updated_at
BEFORE UPDATE ON public.trends
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updating updated_at on support_conversations
CREATE TRIGGER update_support_conversations_updated_at
BEFORE UPDATE ON public.support_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ===== REALTIME =====

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_messages;
