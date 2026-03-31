-- Create social_connections table for storing OAuth tokens and webhook URLs
CREATE TABLE public.social_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'facebook', 'instagram', 'twitter', 'google_business')),
  connection_type TEXT NOT NULL DEFAULT 'oauth' CHECK (connection_type IN ('oauth', 'webhook')),
  -- OAuth fields
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  -- Account info
  account_id TEXT,
  account_name TEXT,
  account_email TEXT,
  account_avatar_url TEXT,
  -- Webhook fields (for Make.com integration)
  webhook_url TEXT,
  -- Permissions granted
  permissions TEXT[] DEFAULT '{}',
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMPTZ,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Ensure one connection per platform per user
  CONSTRAINT unique_user_platform UNIQUE (user_id, platform)
);

-- Enable RLS
ALTER TABLE public.social_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only see/manage their own connections
CREATE POLICY "Users can view their own social connections"
  ON public.social_connections
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own social connections"
  ON public.social_connections
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own social connections"
  ON public.social_connections
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own social connections"
  ON public.social_connections
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_social_connections_updated_at
  BEFORE UPDATE ON public.social_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create social_publish_logs table for tracking published posts
CREATE TABLE public.social_publish_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  publication_id UUID REFERENCES public.publications(id) ON DELETE SET NULL,
  platform TEXT NOT NULL,
  external_post_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'failed')),
  error_message TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.social_publish_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own publish logs"
  ON public.social_publish_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own publish logs"
  ON public.social_publish_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);