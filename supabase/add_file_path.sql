-- Add file_path column to invoices table
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS file_path text;

-- Add comment
COMMENT ON COLUMN public.invoices.file_path IS 'Path to the uploaded invoice file in Supabase Storage';
