-- iab.investments – Initiales Schema
-- Im Supabase SQL-Editor einmal komplett ausführen.

create extension if not exists pgcrypto;

-- ── Kategorien ─────────────────────────────────────────────
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  icon text,
  sort int default 0,
  is_active boolean default false,
  lead_price_cents int
);

-- ── Angebote ───────────────────────────────────────────────
create table if not exists offers (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete cascade,
  title text not null,
  description text,
  location text,
  min_investment_cents int,
  expected_yield text,          -- "ca. 6 % p.a., laut Anbieter"
  availability text,
  image_url text,
  provider_name text,           -- intern, nicht öffentlich anzeigen
  is_published boolean default false,
  created_at timestamptz default now()
);
create index if not exists offers_category_idx on offers(category_id) where is_published;

-- ── Leads ──────────────────────────────────────────────────
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  company text,
  iab_amount text,              -- lt50 | 50-100 | 100-150 | 150-200
  iab_year int,
  iab_deadline date,
  goal text,                    -- rendite | eigennutzung | steuer
  source text,                  -- check | tile | landing | offer
  offer_id uuid references offers(id) on delete set null,
  landing_path text,
  utm_source text,
  user_agent text,
  consent_text_version text not null,
  consent_privacy boolean not null default false,
  consent_share boolean not null default false,
  consent_at timestamptz not null default now(),
  status text not null default 'neu'
    check (status in ('neu','kontaktiert','qualifiziert','weitergegeben','abgeschlossen','abgelehnt')),
  notes text,
  follow_up_at timestamptz,
  created_at timestamptz default now()
);
create index if not exists leads_created_at_idx on leads(created_at desc);

create table if not exists lead_categories (
  lead_id uuid references leads(id) on delete cascade,
  category_id uuid references categories(id) on delete cascade,
  primary key (lead_id, category_id)
);

-- ── CRM-Aktivitäten (angelehnt an TinyMarket) ─────────────
create table if not exists lead_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  admin_email text not null,
  channel text not null check (channel in ('anruf','email','whatsapp','notiz')),
  outcome text not null check (outcome in ('erreicht','nicht_erreicht','rueckruf','interessiert','kein_interesse','konvertiert')),
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists lead_activities_lead_idx on lead_activities(lead_id, created_at desc);

-- ── RLS ────────────────────────────────────────────────────
-- Öffentlich lesbar: aktive Kategorien und veröffentlichte Angebote.
-- Alle Schreibzugriffe laufen serverseitig über den Secret Key (umgeht RLS).
alter table categories enable row level security;
alter table offers enable row level security;
alter table leads enable row level security;
alter table lead_categories enable row level security;
alter table lead_activities enable row level security;

drop policy if exists "public read active categories" on categories;
create policy "public read active categories" on categories
  for select using (is_active);

drop policy if exists "public read published offers" on offers;
create policy "public read published offers" on offers
  for select using (is_published);

-- provider_name ist intern: Spalte für anon/authenticated nicht freigeben
revoke select on offers from anon, authenticated;
grant select (id, category_id, title, description, location, min_investment_cents,
              expected_yield, availability, image_url, is_published, created_at)
  on offers to anon, authenticated;

-- ── Seed ───────────────────────────────────────────────────
insert into categories (slug, name, icon, sort, is_active) values
  ('photovoltaik-iab',      'PV-Direktinvestment',    '☀️', 1, true),
  ('batteriespeicher-iab',  'Batteriespeicher',       '🔋', 2, true),
  ('tiny-house-iab',        'Mobile Tiny Houses',     '🏡', 3, true),
  ('ladeinfrastruktur-iab', 'Ladeinfrastruktur',      '⚡', 4, true),
  ('mietcontainer-iab',     'Container & Modulräume', '📦', 5, true),
  ('werbeflaechen-iab',     'Digitale Werbeflächen',  '📺', 6, true),
  ('wohnmobil-iab',         'Vermietete Wohnmobile',  '🚐', 7, true)
on conflict (slug) do nothing;

-- ════════════════════════════════════════════════════════════
-- Angebots-Detailseiten & Investorenkonten (Oktober 2026)
-- Kann auf einer bestehenden Datenbank erneut ausgeführt werden.
-- ════════════════════════════════════════════════════════════

-- Öffentlich: gallery. Nur für registrierte Nutzer (serverseitig ausgeliefert): details, facts, documents.
alter table offers add column if not exists gallery text[] not null default '{}';
alter table offers add column if not exists details text;
alter table offers add column if not exists facts jsonb not null default '[]';      -- [{ "label": "...", "value": "..." }]
alter table offers add column if not exists documents jsonb not null default '[]';  -- [{ "label": "...", "url": "..." }]

-- gallery für die öffentliche Liste freigeben; details/facts/documents bleiben gesperrt
grant select (gallery) on offers to anon, authenticated;

-- ── Investorenprofile ─────────────────────────────────────
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  company text,
  consent_privacy_at timestamptz,
  created_at timestamptz not null default now()
);
alter table profiles enable row level security;

drop policy if exists "own profile read" on profiles;
create policy "own profile read" on profiles for select using (auth.uid() = id);
drop policy if exists "own profile update" on profiles;
create policy "own profile update" on profiles for update using (auth.uid() = id);

-- Profil automatisch aus den Registrierungsdaten anlegen
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone, company, consent_privacy_at)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    nullif(new.raw_user_meta_data->>'phone', ''),
    nullif(new.raw_user_meta_data->>'company', ''),
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Leads einem Konto zuordnen
alter table leads add column if not exists user_id uuid references auth.users(id) on delete set null;

-- Welche registrierten Nutzer haben welches Angebot angesehen (für das CRM)
create table if not exists offer_views (
  user_id uuid not null references auth.users(id) on delete cascade,
  offer_id uuid not null references offers(id) on delete cascade,
  first_viewed_at timestamptz not null default now(),
  last_viewed_at timestamptz not null default now(),
  view_count int not null default 1,
  primary key (user_id, offer_id)
);
alter table offer_views enable row level security;

-- Neue Kategorie (Oktober 2026)
insert into categories (slug, name, icon, sort, is_active) values
  ('krypto-mining-hardware-iab', 'Bitcoin-Miner & Krypto-Hardware', '⛏️', 8, true)
on conflict (slug) do nothing;

-- ════════════════════════════════════════════════════════════
-- Anbieter-Einreichungen (Oktober 2026)
-- Anbieter stellen Produkte über /anbieter vor. Das Admin-Team sichtet sie unter
-- /admin/anbieter und schaltet sie frei. Beim Freischalten wird daraus ein
-- veröffentlichtes Angebot (offers) erzeugt. Nur serverseitig (Secret Key) zugänglich.
-- ════════════════════════════════════════════════════════════
create table if not exists provider_submissions (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  contact_name text not null,
  email text not null,
  phone text,
  website text,
  category_slug text,           -- Slug aus lib/categories.ts oder 'sonstige'
  title text not null,
  description text not null,
  location text,
  min_investment_cents int,     -- netto
  expected_yield text,
  availability text,
  image_url text,
  documents_url text,
  consent_text_version text not null,
  consent_privacy_at timestamptz not null default now(),
  status text not null default 'neu' check (status in ('neu','freigeschaltet','abgelehnt')),
  admin_notes text,
  offer_id uuid references offers(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists provider_submissions_created_idx on provider_submissions(created_at desc);
alter table provider_submissions enable row level security;

-- ── Land der Angebote (Oktober 2026) ──────────────────────
-- ISO-Code (DE, AT, NO …), Standard Deutschland. Öffentlich lesbar (Länderfilter im Marktplatz).
alter table offers add column if not exists country text not null default 'DE';
grant select (country) on offers to anon, authenticated;
alter table provider_submissions add column if not exists country text not null default 'DE';

-- ════════════════════════════════════════════════════════════
-- Partnerprogramm für Steuerberater (Oktober 2026)
-- Kanzleien melden sich über /steuerberater an. Beim Freischalten (/admin/partner)
-- wird ein Code vergeben; Mandanten-Anfragen über /empfehlung/<code> tragen
-- leads.utm_source = 'partner:<code>'. Nur serverseitig (Secret Key) zugänglich.
-- ════════════════════════════════════════════════════════════
create table if not exists tax_advisor_partners (
  id uuid primary key default gen_random_uuid(),
  firm text not null,
  contact_name text not null,
  email text not null,
  phone text,
  city text,
  website text,
  message text,
  code text unique,
  status text not null default 'neu' check (status in ('neu','aktiv','abgelehnt')),
  admin_notes text,
  consent_text_version text not null,
  consent_privacy_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists tax_advisor_partners_created_idx on tax_advisor_partners(created_at desc);
alter table tax_advisor_partners enable row level security;

-- ════════════════════════════════════════════════════════════
-- Registrierungen & Kontaktanfragen als Leads (Oktober 2026)
-- leads.source: 'registrierung' (Konto erstellt) | 'kontakt' (Kontakt-Button)
-- Beide ohne Einwilligung zur Weitergabe (consent_share = false).
-- ════════════════════════════════════════════════════════════
alter table leads add column if not exists message text;   -- Freitext aus dem Kontaktformular

-- ════════════════════════════════════════════════════════════
-- Direktanfrage statt Registrierung (Oktober 2026)
-- Angebotsseiten fragen direkt an (Name, E-Mail, Telefon, Rechtsform, Investitionssumme,
-- Zeitpunkt). Das Konto entsteht im Hintergrund per Magic Link. Jede Anfrage speichert
-- getrennte Einwilligungen: Weitergabe (mit Wortlaut) und telefonische Kontaktaufnahme.
-- ════════════════════════════════════════════════════════════
alter table leads add column if not exists legal_form text;          -- einzelunternehmen | freiberufler | personengesellschaft | gmbh | gmbh-co-kg | sonstige
alter table leads add column if not exists investment_cents bigint;  -- geplante Investitionssumme, netto
alter table leads add column if not exists invest_timing text;       -- sofort | dieses-jahr | naechstes-jahr | offen
alter table leads add column if not exists consent_call boolean not null default false;
alter table leads add column if not exists consent_share_text text;  -- exakter Wortlaut der Weitergabe-Einwilligung (Nachweis)
