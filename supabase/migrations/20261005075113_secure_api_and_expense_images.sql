-- Additive only: preserves every existing committee record.
alter table public.expenses
  add column if not exists images text[] not null default '{}',
  add column if not exists status text not null default 'COMPLETED',
  add column if not exists location text;

-- The application server uses SUPABASE_SERVICE_ROLE_KEY. Direct browser access
-- through the publishable/anon key must not expose or mutate committee data.
alter table public.committee_settings enable row level security;
alter table public.members enable row level security;
alter table public.payments enable row level security;
alter table public.expenses enable row level security;

revoke all on table public.committee_settings from anon, authenticated;
revoke all on table public.members from anon, authenticated;
revoke all on table public.payments from anon, authenticated;
revoke all on table public.expenses from anon, authenticated;

grant all on table public.committee_settings to service_role;
grant all on table public.members to service_role;
grant all on table public.payments to service_role;
grant all on table public.expenses to service_role;
