-- ============================================================
-- Veya — profiles table
-- Run this once in Supabase → SQL Editor → New query.
-- Matches the field mapping in js/profile-store.js
-- (profileToSupabaseRow / supabaseRowToProfile).
-- ============================================================

create table if not exists public.profiles (
  id                          uuid primary key references auth.users(id) on delete cascade,
  citizenship                 text,
  level_now                   text,
  gpa                         numeric,
  major                       text,
  degree_target               text,
  financial_need              text,
  pell_eligible                boolean,
  college_readiness_program   text,
  target_university           text,
  ethnicity                   text,
  gender                      text,
  family_income                integer,
  updated_at                   timestamptz not null default now()
);

-- Row Level Security: every user can only ever see/edit their own row.
alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Optional: let a user delete their own profile (e.g. account deletion flow).
create policy "Users can delete their own profile"
  on public.profiles for delete
  using (auth.uid() = id);
