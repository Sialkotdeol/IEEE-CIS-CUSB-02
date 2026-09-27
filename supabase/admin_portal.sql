-- Admin portal schema.
-- Run AFTER call_for_positions.sql, in the Supabase SQL editor.
-- After running it, add yourself as the first owner (the password is hashed on save):
--   insert into public.admin_users (email, name, role, password)
--   values ('you@example.com', 'Your Name', 'owner', 'choose-a-strong-password');
-- Safe to re-run: every statement is idempotent.
--
-- Every table below has Row Level Security enabled with NO policies, so the
-- public anon key cannot read or write them. The Next.js server talks to them
-- with SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS.

-- ─── Team & access ──────────────────────────────────────────────────────────

create table if not exists public.admin_users (
  email       text primary key check (email = lower(email)),
  name        text not null default '',
  role        text not null default 'reviewer' check (role in ('owner', 'reviewer')),
  disabled    boolean not null default false,
  added_by    text,
  created_at  timestamptz not null default now()
);

-- Portal logins live in this table (no Supabase Auth).
-- To set or reset a password: open admin_users in the Table Editor and type a plain
-- password into the `password` column, or run
--   update public.admin_users set password = 'new-password' where email = 'you@example.com';
-- The trigger below replaces it with a bcrypt hash before it is saved, so plain
-- passwords are never stored.
create extension if not exists pgcrypto with schema extensions;

alter table public.admin_users add column if not exists password text;
comment on column public.admin_users.password is
  'Type a plain password to set it; it is bcrypt-hashed automatically on save.';

create or replace function public.admin_users_hash_password()
returns trigger
language plpgsql
set search_path = public, extensions
as $$
begin
  -- Forgive stray spaces / capitals typed in the Table Editor (runs before the check constraints).
  new.email := lower(trim(new.email));
  new.role := lower(trim(coalesce(new.role, 'reviewer')));
  new.name := trim(coalesce(new.name, ''));

  if new.password is not null and new.password !~ '^\$2[abxy]\$\d\d\$' then
    if length(new.password) < 8 then
      raise exception 'Admin password must be at least 8 characters';
    end if;
    new.password := extensions.crypt(new.password, extensions.gen_salt('bf', 12));
  end if;
  return new;
end;
$$;

drop trigger if exists admin_users_hash_password on public.admin_users;
create trigger admin_users_hash_password
  before insert or update on public.admin_users
  for each row execute function public.admin_users_hash_password();

-- Checks an email + password. Returns the admin if they match and aren't disabled.
-- Only the server (service_role) may call it.
create or replace function public.verify_admin_login(p_email text, p_password text)
returns table (email text, name text, role text)
language sql
stable
security definer
set search_path = public, extensions
as $$
  select u.email, u.name, u.role
  from public.admin_users u
  where u.email = lower(trim(p_email))
    and not u.disabled
    and u.password is not null
    and u.password = extensions.crypt(p_password, u.password);
$$;

revoke all on function public.verify_admin_login(text, text) from public, anon, authenticated;
grant execute on function public.verify_admin_login(text, text) to service_role;

create table if not exists public.admin_sessions (
  id            uuid primary key default gen_random_uuid(),
  admin_email   text not null,
  auth_user_id  uuid,
  created_at    timestamptz not null default now(),
  last_seen_at  timestamptz not null default now(),
  expires_at    timestamptz not null,
  user_agent    text,
  ip            text,
  revoked_at    timestamptz
);
create index if not exists admin_sessions_email_idx on public.admin_sessions (admin_email, created_at desc);

create table if not exists public.admin_activity (
  id           bigint generated always as identity primary key,
  created_at   timestamptz not null default now(),
  actor_email  text not null,
  action       text not null,
  target_type  text,
  target_id    text,
  details      jsonb not null default '{}'::jsonb,
  ip           text
);
create index if not exists admin_activity_created_idx on public.admin_activity (created_at desc);
create index if not exists admin_activity_actor_idx on public.admin_activity (actor_email, created_at desc);

-- ─── Recruitment ────────────────────────────────────────────────────────────

create table if not exists public.site_settings (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now(),
  updated_by  text
);

insert into public.site_settings (key, value)
values ('recruitment', '{"open": true, "deadline": null, "tenure": "2026–27"}'::jsonb)
on conflict (key) do nothing;

create table if not exists public.positions (
  id                text primary key check (id ~ '^[a-z0-9-]+$'),
  title             text not null,
  category          text not null check (category in ('Executive', 'Technical', 'Creative', 'Operations')),
  openings          integer not null default 1 check (openings between 1 and 50),
  summary           text not null default '',
  responsibilities  text[] not null default '{}',
  eligibility       text not null default '',
  sort_order        integer not null default 0,
  is_active         boolean not null default true,
  updated_at        timestamptz not null default now()
);

create table if not exists public.application_scores (
  application_id  uuid not null references public.position_applications (id) on delete cascade,
  reviewer_email  text not null,
  communication   smallint not null check (communication between 1 and 5),
  skills          smallint not null check (skills between 1 and 5),
  commitment      smallint not null check (commitment between 1 and 5),
  comment         text,
  updated_at      timestamptz not null default now(),
  primary key (application_id, reviewer_email)
);

create table if not exists public.application_notes (
  id              uuid primary key default gen_random_uuid(),
  application_id  uuid not null references public.position_applications (id) on delete cascade,
  author_email    text not null,
  author_name     text,
  body            text not null check (length(body) between 1 and 4000),
  created_at      timestamptz not null default now()
);
create index if not exists application_notes_app_idx on public.application_notes (application_id, created_at);

-- ─── Events ─────────────────────────────────────────────────────────────────
-- Events created from the portal. The events already hard-coded in
-- src/data/events.ts keep working; photos can be attached to either kind by slug.

create table if not exists public.events (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title        text not null,
  type         text not null default 'event',
  date_label   text not null default '',
  description  text not null default '',
  tags         text[] not null default '{}',
  link         text,
  status       text not null default 'upcoming' check (status in ('upcoming', 'ongoing', 'past')),
  archived_at  timestamptz,
  created_by   text,
  created_at   timestamptz not null default now()
);

-- Card image and location for the home-page "Ongoing Events" section.
alter table public.events add column if not exists image_url text;
alter table public.events add column if not exists location text not null default 'CU';

-- The two programmes that used to be hard-coded on the home page. Once they're here
-- they can be edited, archived to Past Events, or restored from /admin/events.
insert into public.events (slug, title, type, date_label, description, tags, link, status, image_url, location, created_by)
values
  ('code-warriors', 'C1S C0DE WARR10RS', 'event', 'Ongoing Event',
   'A peer-learning ecosystem focused on building consistency, mastering DSA, and cracking technical placements. Upgrade your logic, optimize your runtime.',
   array['DSA', 'LeetCode', 'Placements'], '/code-warriors', 'ongoing',
   'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop', 'Online / CU', 'seed'),
  ('innovators-hub', 'CIS Innovators Hub', 'event', 'Registration Open',
   'A long-term innovation ecosystem where students build impactful projects, collaborate in teams, and represent IEEE CIS in national and international hackathons.',
   array['Projects', 'Hackathons', 'Teams'], '/innovators-hub', 'ongoing',
   'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop', 'Online / CU', 'seed')
on conflict (slug) do nothing;

create table if not exists public.event_photos (
  id            uuid primary key default gen_random_uuid(),
  event_slug    text not null,
  storage_path  text not null unique,
  url           text not null,
  caption       text,
  uploaded_by   text,
  created_at    timestamptz not null default now()
);
create index if not exists event_photos_slug_idx on public.event_photos (event_slug, created_at);

-- Public bucket: anyone can view photos, only the server (service role) can write.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('event-photos', 'event-photos', true, 10485760,
        array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic'])
on conflict (id) do nothing;

-- ─── Certificates ───────────────────────────────────────────────────────────

create table if not exists public.certificates (
  id               uuid primary key default gen_random_uuid(),
  recipient_name   text not null,
  recipient_email  text not null,
  event_title      text not null,
  event_date       text not null,
  kind             text not null default 'Participation',
  signatories      jsonb not null default '[]'::jsonb,
  issued_by        text not null,
  emailed_at       timestamptz,
  created_at       timestamptz not null default now()
);
create index if not exists certificates_email_idx on public.certificates (lower(recipient_email));

-- Uploaded certificate designs. `fields` says where to print the recipient's name,
-- UID, signatures etc. (positions are fractions of the image, set in the visual editor).
create table if not exists public.certificate_templates (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  file_path   text not null,
  file_type   text not null check (file_type in ('image/png', 'image/jpeg')),
  width       integer not null,
  height      integer not null,
  fields      jsonb not null default '[]'::jsonb,
  created_by  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.certificates add column if not exists recipient_uid text;
alter table public.certificates add column if not exists template_id uuid references public.certificate_templates (id);

-- Private bucket for template images and signature images (never publicly readable).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('certificate-assets', 'certificate-assets', false, 10485760, array['image/png', 'image/jpeg'])
on conflict (id) do nothing;

-- ─── Badges ─────────────────────────────────────────────────────────────────
-- One digital badge per event. The badge art is the event poster, shown cropped to a
-- circle (focus_x / focus_y / zoom pick which part of the poster is in the circle).

create table if not exists public.badges (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique check (slug ~ '^[a-z0-9-]+$'),
  event_slug   text,
  title        text not null,
  description  text not null default '',
  image_path   text,
  image_url    text,
  focus_x      real not null default 0.5 check (focus_x between 0 and 1),
  focus_y      real not null default 0.5 check (focus_y between 0 and 1),
  zoom         real not null default 1 check (zoom between 1 and 3),
  created_by   text,
  created_at   timestamptz not null default now()
);

-- One wallet per person, matched by email. wallet_slug is the public link.
-- Email and UID are never shown publicly.
create table if not exists public.badge_holders (
  id           uuid primary key default gen_random_uuid(),
  wallet_slug  text not null unique check (wallet_slug ~ '^[a-z0-9-]+$'),
  email        text not null unique check (email = lower(email)),
  name         text not null,
  uid          text,
  created_at   timestamptz not null default now()
);

-- Holders control their own wallet's visibility through a private manage link
-- (/badges/manage/<manage_token>) included in their badge emails.
alter table public.badge_holders add column if not exists is_public boolean not null default true;
alter table public.badge_holders add column if not exists manage_token text not null
  default encode(extensions.gen_random_bytes(24), 'hex');
create unique index if not exists badge_holders_manage_token_key on public.badge_holders (manage_token);

create table if not exists public.badge_awards (
  id          uuid primary key default gen_random_uuid(),
  badge_id    uuid not null references public.badges (id) on delete cascade,
  holder_id   uuid not null references public.badge_holders (id) on delete cascade,
  awarded_by  text,
  awarded_at  timestamptz not null default now(),
  emailed_at  timestamptz,
  unique (badge_id, holder_id)
);
create index if not exists badge_awards_holder_idx on public.badge_awards (holder_id, awarded_at desc);

-- Public bucket for badge art (posters), so wallets and LinkedIn previews can show it.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('badges', 'badges', true, 10485760, array['image/png', 'image/jpeg'])
on conflict (id) do nothing;

-- ─── Feedback ───────────────────────────────────────────────────────────────

create table if not exists public.feedback_forms (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  event_slug   text,
  description  text not null default '',
  questions    jsonb not null default '[]'::jsonb,
  is_open      boolean not null default true,
  created_by   text,
  created_at   timestamptz not null default now()
);

create table if not exists public.feedback_responses (
  id                uuid primary key default gen_random_uuid(),
  form_id           uuid not null references public.feedback_forms (id) on delete cascade,
  respondent_name   text,
  respondent_email  text,
  answers           jsonb not null,
  created_at        timestamptz not null default now()
);
create index if not exists feedback_responses_form_idx on public.feedback_responses (form_id, created_at);

-- ─── Tasks & event documents ────────────────────────────────────────────────
-- Tasks assigned to team members, optionally tied to an event and to a document
-- the task should produce (e.g. "m2m"). Uploading that document for the event
-- completes the task automatically.

create table if not exists public.admin_tasks (
  id              uuid primary key default gen_random_uuid(),
  title           text not null check (length(title) between 2 and 160),
  description     text not null default '',
  event_slug      text,
  assignee_email  text,
  due_date        date,
  status          text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  priority        text not null default 'normal' check (priority in ('low', 'normal', 'high')),
  deliverable     text check (deliverable in ('report', 'm2m', 'attendance', 'budget', 'permission', 'media', 'other')),
  created_by      text not null,
  created_at      timestamptz not null default now(),
  completed_at    timestamptz
);
create index if not exists admin_tasks_assignee_idx on public.admin_tasks (assignee_email, status);
create index if not exists admin_tasks_event_idx on public.admin_tasks (event_slug);

-- Reports, minutes of meetings (M2M), attendance, bills etc. for each event.
-- event_slug null = general / core-team documents. Either a file or a link.
create table if not exists public.event_documents (
  id           uuid primary key default gen_random_uuid(),
  event_slug   text,
  doc_type     text not null check (doc_type in ('report', 'm2m', 'attendance', 'budget', 'permission', 'media', 'other')),
  title        text not null,
  notes        text not null default '',
  file_path    text,
  file_name    text,
  file_size    bigint,
  link_url     text,
  uploaded_by  text not null,
  created_at   timestamptz not null default now(),
  check (file_path is not null or link_url is not null)
);
create index if not exists event_documents_event_idx on public.event_documents (event_slug, doc_type);

-- Private bucket: files are only reachable through short-lived links from the portal.
insert into storage.buckets (id, name, public, file_size_limit)
values ('event-docs', 'event-docs', false, 26214400)
on conflict (id) do nothing;

-- ─── Lock everything down ───────────────────────────────────────────────────

alter table public.admin_users         enable row level security;
alter table public.admin_sessions      enable row level security;
alter table public.admin_activity      enable row level security;
alter table public.site_settings       enable row level security;
alter table public.positions           enable row level security;
alter table public.application_scores  enable row level security;
alter table public.application_notes   enable row level security;
alter table public.events              enable row level security;
alter table public.event_photos        enable row level security;
alter table public.certificates        enable row level security;
alter table public.certificate_templates enable row level security;
alter table public.badges              enable row level security;
alter table public.badge_holders       enable row level security;
alter table public.badge_awards        enable row level security;
alter table public.admin_tasks         enable row level security;
alter table public.event_documents     enable row level security;
alter table public.feedback_forms      enable row level security;
alter table public.feedback_responses  enable row level security;

-- ─── Seed roles from src/data/positions.ts ──────────────────────────────────
-- (Generated. Existing rows are left untouched so portal edits survive a re-run.)
insert into public.positions (id, title, category, openings, summary, responsibilities, eligibility, sort_order)
values
  ('chairperson', 'Chairperson', 'Executive', 1, 'Lead the chapter, set the yearly vision, and represent IEEE CIS CUSB at branch and section level.',
   array['Plan the annual roadmap of events and initiatives', 'Coordinate all team leads and run core meetings', 'Liaise with faculty advisors and the IEEE CUSB branch']::text[],
   '3rd/4th year, active IEEE CIS member with prior chapter experience', 0),
  ('vice-chairperson', 'Vice Chairperson', 'Executive', 1, 'Support the Chair in running the chapter and take ownership of cross-team execution.',
   array['Track progress of events and team deliverables', 'Step in for the Chair when required', 'Mentor junior members and coordinators']::text[],
   '2nd year and above, IEEE member preferred', 1),
  ('general-secretary', 'General Secretary', 'Executive', 1, 'Own documentation, reporting, and official communication for the chapter.',
   array['Maintain meeting minutes and event reports', 'Submit activity reports to IEEE (vTools)', 'Draft official letters and permissions']::text[],
   '2nd year and above, strong written communication', 2),
  ('treasurer', 'Treasurer', 'Executive', 1, 'Manage the chapter budget, sponsorships, and financial records.',
   array['Prepare event budgets and track expenses', 'Maintain transparent financial records', 'Coordinate with sponsors on funding']::text[],
   '2nd year and above, detail-oriented', 3),
  ('technical-lead', 'Technical Lead', 'Technical', 2, 'Drive technical workshops, hackathons, and CI/ML projects run by the chapter.',
   array['Design and deliver workshops on AI, ML, and CI topics', 'Mentor project teams in the Innovators Hub', 'Set problem statements for technical events']::text[],
   'Solid grasp of ML/DL or software development; portfolio or GitHub required', 4),
  ('webmaster', 'Webmaster', 'Technical', 1, 'Maintain and extend the chapter website and internal tools like Code Warriors.',
   array['Ship features and fixes on the Next.js site', 'Manage Supabase data and deployments', 'Keep event pages and registrations up to date']::text[],
   'Experience with React/Next.js; GitHub profile required', 5),
  ('design-lead', 'Design Lead', 'Creative', 1, 'Own the chapter''s visual identity across posters, social, and the website.',
   array['Design event posters, certificates, and banners', 'Maintain brand consistency across platforms', 'Guide and review work from design volunteers']::text[],
   'Portfolio (Figma, Canva, Illustrator or similar) required', 6),
  ('content-lead', 'Content & Editorial Lead', 'Creative', 1, 'Write captions, newsletters, blogs, and event write-ups that tell the chapter''s story.',
   array['Write social captions and event announcements', 'Edit the chapter newsletter and blog posts', 'Proofread official communication']::text[],
   'Writing samples preferred', 7),
  ('social-media-lead', 'Social Media Lead', 'Creative', 1, 'Grow the chapter''s presence on Instagram and LinkedIn.',
   array['Plan and schedule the content calendar', 'Cover events live with stories and reels', 'Track engagement and suggest improvements']::text[],
   'Comfortable with Instagram/LinkedIn content creation', 8),
  ('pr-outreach-lead', 'PR & Outreach Lead', 'Operations', 1, 'Build partnerships with other chapters, communities, speakers, and sponsors.',
   array['Reach out to speakers and industry partners', 'Coordinate collaborations with other IEEE chapters', 'Promote events across campus']::text[],
   'Strong communication and networking skills', 9),
  ('event-management-lead', 'Event Management Lead', 'Operations', 2, 'Plan and run the logistics behind every chapter event.',
   array['Book venues and handle permissions', 'Coordinate volunteers on event day', 'Manage registrations, attendance, and feedback']::text[],
   'Prior event volunteering experience preferred', 10),
  ('membership-coordinator', 'Membership Development Coordinator', 'Operations', 1, 'Grow IEEE and CIS membership and help new members get the most out of it.',
   array['Run membership drives and help desks', 'Guide students through the IEEE joining process', 'Track and report membership numbers']::text[],
   'IEEE member preferred', 11)
on conflict (id) do nothing;
