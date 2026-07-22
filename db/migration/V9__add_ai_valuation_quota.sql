-- PostgreSQL / Supabase migration: AI valuation usage quota per user.
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS aivaluationusedcount INT NOT NULL DEFAULT 0;
