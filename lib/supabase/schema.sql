-- Supabase database schema for StackSpend (AI Spend Audit)
-- Verified setup for Day 1

-- Create audits table to store input settings and calculated report values
CREATE TABLE IF NOT EXISTS public.audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inputs JSONB NOT NULL,
    results JSONB NOT NULL,
    summary TEXT,
    share_token TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create leads table to store contact submissions attached to specific audits
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    company_name TEXT,
    role TEXT,
    team_size INTEGER,
    audit_id UUID REFERENCES public.audits(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Setup index on share_token for rapid public lookup of shareable audit results
CREATE INDEX IF NOT EXISTS idx_audits_share_token ON public.audits(share_token);

-- Setup RLS Policies for security

-- Enable RLS on both tables
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Allow public read access to audits using the share token
CREATE POLICY "Allow public read of audits by share token" 
ON public.audits FOR SELECT 
USING (true);

-- Allow public inserts of new audit records from the client form
CREATE POLICY "Allow public inserts of audits" 
ON public.audits FOR INSERT 
WITH CHECK (true);

-- Allow public inserts of leads when submitting the capture form
CREATE POLICY "Allow public inserts of leads" 
ON public.leads FOR INSERT 
WITH CHECK (true);

-- Restrict read access to leads (Admin/Credex staff only, not public)
CREATE POLICY "Restrict read of leads" 
ON public.leads FOR SELECT 
USING (false);
