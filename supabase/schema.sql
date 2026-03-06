-- FINORA DATABASE SCHEMA
-- Run this FIRST in your Supabase SQL Editor to create all tables

-- Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  business_name text,
  full_name text,
  avatar_url text,
  logo_url text,
  website text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- Clients / Suppliers (Counterparties)
create table if not exists public.counterparties (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  type text check (type in ('client', 'supplier')) not null,
  email text,
  phone text,
  address text,
  vat_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.counterparties enable row level security;
create policy "Users can view own counterparties" on counterparties for all using (auth.uid() = user_id);

-- Invoices
create table if not exists public.invoices (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  counterparty_id uuid references public.counterparties,
  type text check (type in ('in', 'out')) not null,
  invoice_number text not null,
  issue_date date not null,
  due_date date,
  currency text default 'MAD',
  subtotal numeric not null default 0,
  vat_amount numeric not null default 0,
  total_amount numeric not null default 0,
  status text check (status in ('draft', 'pending', 'paid', 'overdue', 'cancelled')) default 'draft',
  file_url text,
  client_name text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.invoices enable row level security;
create policy "Users can view own invoices" on invoices for all using (auth.uid() = user_id);

-- Invoice Line Items
create table if not exists public.invoice_items (
  id uuid default gen_random_uuid() primary key,
  invoice_id uuid references public.invoices on delete cascade not null,
  description text not null,
  quantity numeric default 1,
  unit_price numeric not null,
  vat_rate numeric default 0.20,
  total numeric generated always as (quantity * unit_price) stored
);

alter table public.invoice_items enable row level security;
create policy "Users can view own invoice items" on invoice_items
  for all using (
    exists (
      select 1 from invoices
      where invoices.id = invoice_items.invoice_id
      and invoices.user_id = auth.uid()
    )
  );

-- Transactions (Bank)
create table if not exists public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  date date not null,
  description text not null,
  amount numeric not null,
  type text check (type in ('income', 'expense')),
  category text,
  status text check (status in ('pending', 'reconciled')) default 'pending',
  matched_invoice_id uuid references public.invoices,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.transactions enable row level security;
create policy "Users can view own transactions" on transactions for all using (auth.uid() = user_id);

-- Payment Links (For Client Invoices)
create table if not exists public.payment_links (
  id uuid default gen_random_uuid() primary key,
  invoice_id uuid references public.invoices not null,
  url_token text unique not null,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.payment_links enable row level security;
create policy "Users view own payment links" on payment_links
  for all using (
    exists (
      select 1 from invoices
      where invoices.id = payment_links.invoice_id
      and invoices.user_id = auth.uid()
    )
  );
