-- Call for Positions applications table.
-- Run this once in the Supabase SQL editor (Dashboard → SQL Editor → New query).

create table if not exists public.position_applications (
  id                   uuid primary key default gen_random_uuid(),
  created_at           timestamptz not null default now(),

  full_name            text not null,
  uid                  text not null,
  email                text not null,
  phone                text not null,
  department           text not null,
  year_of_study        text not null,

  is_ieee_member       boolean not null default false,
  ieee_member_id       text,

  first_preference     text not null,
  second_preference    text,

  why_this_role        text not null,
  relevant_experience  text not null,
  hours_per_week       text not null,
  linkedin_url         text,
  portfolio_url        text,
  resume_url           text,

  status               text not null default 'pending'
    check (status in ('pending', 'shortlisted', 'interview', 'selected', 'rejected')),

  constraint position_applications_prefs_differ
    check (second_preference is null or second_preference <> first_preference)
);

-- One application per student (UID is stored upper-cased by the API).
create unique index if not exists position_applications_uid_key
  on public.position_applications (uid);

create index if not exists position_applications_first_pref_idx
  on public.position_applications (first_preference);

-- Row Level Security: the public (anon) key may only INSERT.
-- Nobody can read applications with the anon key; view them in the dashboard
-- or with the service_role key.
alter table public.position_applications enable row level security;

drop policy if exists "Anyone can apply" on public.position_applications;
create policy "Anyone can apply"
  on public.position_applications
  for insert
  to anon, authenticated
  with check (status = 'pending');
