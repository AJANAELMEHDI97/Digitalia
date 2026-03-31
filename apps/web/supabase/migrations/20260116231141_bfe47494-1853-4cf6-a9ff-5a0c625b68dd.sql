-- Create table for Google Business Profile connections
CREATE TABLE public.google_business_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  account_id TEXT,
  location_id TEXT,
  location_name TEXT,
  email TEXT,
  connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.google_business_connections ENABLE ROW LEVEL SECURITY;

-- Users can only see their own connection
CREATE POLICY "Users can view their own Google Business connection"
ON public.google_business_connections
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own connection
CREATE POLICY "Users can create their own Google Business connection"
ON public.google_business_connections
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own connection
CREATE POLICY "Users can update their own Google Business connection"
ON public.google_business_connections
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own connection
CREATE POLICY "Users can delete their own Google Business connection"
ON public.google_business_connections
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_google_business_connections_updated_at
BEFORE UPDATE ON public.google_business_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create table for caching Google Business reviews
CREATE TABLE public.google_business_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  review_id TEXT NOT NULL,
  reviewer_name TEXT,
  reviewer_photo_url TEXT,
  star_rating INTEGER,
  comment TEXT,
  review_reply TEXT,
  reply_updated_at TIMESTAMP WITH TIME ZONE,
  create_time TIMESTAMP WITH TIME ZONE,
  update_time TIMESTAMP WITH TIME ZONE,
  synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, review_id)
);

-- Enable RLS
ALTER TABLE public.google_business_reviews ENABLE ROW LEVEL SECURITY;

-- Users can only see their own reviews
CREATE POLICY "Users can view their own Google Business reviews"
ON public.google_business_reviews
FOR SELECT
USING (auth.uid() = user_id);

-- Users can manage their own reviews cache
CREATE POLICY "Users can insert their own Google Business reviews"
ON public.google_business_reviews
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Google Business reviews"
ON public.google_business_reviews
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Google Business reviews"
ON public.google_business_reviews
FOR DELETE
USING (auth.uid() = user_id);

-- Create table for Google Business posts
CREATE TABLE public.google_business_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id TEXT,
  post_type TEXT NOT NULL DEFAULT 'STANDARD',
  summary TEXT NOT NULL,
  media_url TEXT,
  call_to_action_type TEXT,
  call_to_action_url TEXT,
  event_title TEXT,
  event_start_date DATE,
  event_end_date DATE,
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TIMESTAMP WITH TIME ZONE,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.google_business_posts ENABLE ROW LEVEL SECURITY;

-- Users can only see their own posts
CREATE POLICY "Users can view their own Google Business posts"
ON public.google_business_posts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own Google Business posts"
ON public.google_business_posts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Google Business posts"
ON public.google_business_posts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Google Business posts"
ON public.google_business_posts
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_google_business_posts_updated_at
BEFORE UPDATE ON public.google_business_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();