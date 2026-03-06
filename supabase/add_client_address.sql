-- Add client_address column to invoices table
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS client_address text;

-- Add comment
COMMENT ON COLUMN public.invoices.client_address IS 'Client business address for invoice';
