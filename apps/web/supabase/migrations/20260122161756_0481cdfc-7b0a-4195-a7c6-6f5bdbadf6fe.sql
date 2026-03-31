-- Create demo_requests table for storing demo booking requests
CREATE TABLE public.demo_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  firm_name TEXT,
  specialty TEXT NOT NULL,
  firm_size TEXT NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  message TEXT,
  terms_accepted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.demo_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public form)
CREATE POLICY "Anyone can submit demo request"
ON public.demo_requests
FOR INSERT
WITH CHECK (true);

-- Only authenticated super_admin can view demo requests
CREATE POLICY "Super admin can view demo requests"
ON public.demo_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles_v2
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  )
);

-- Super admin can update demo requests status
CREATE POLICY "Super admin can update demo requests"
ON public.demo_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles_v2
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_demo_requests_updated_at
BEFORE UPDATE ON public.demo_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();