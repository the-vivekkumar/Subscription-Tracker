-- Subscription Tracker Database Schema
-- Run this in the Supabase SQL Editor (full script is safe to re-run)

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  company_name text,
  avatar_url text,
  notification_email boolean not null default true,
  notification_days integer[] not null default array[30, 14, 7, 3, 1, 0],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  vendor text,
  category text not null check (category in (
    'Productivity', 'Design', 'Marketing', 'Sales',
    'Dev Tools', 'Communication', 'Finance', 'Other'
  )),
  cost numeric(12, 2) not null default 0 check (cost >= 0),
  currency text not null default 'USD',
  billing_cycle text not null check (billing_cycle in ('monthly', 'yearly', 'quarterly')),
  next_renewal date not null,
  owner text,
  status text not null default 'active' check (status in ('active', 'cancelled', 'under_review')),
  notes text,
  last_reviewed date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);
create index if not exists subscriptions_next_renewal_idx on public.subscriptions(next_renewal);
create index if not exists subscriptions_status_idx on public.subscriptions(status);

create table if not exists public.team_members (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  email text not null,
  created_at timestamptz not null default now(),
  unique (user_id, email)
);

create index if not exists team_members_user_id_idx on public.team_members(user_id);

create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null check (type in ('renewal', 'review', 'system')),
  read boolean not null default false,
  related_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_id_idx on public.notifications(user_id);
create index if not exists notifications_read_idx on public.notifications(read);

create table if not exists public.alert_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  renewal_date date not null,
  days_before integer not null,
  created_at timestamptz not null default now(),
  unique (subscription_id, renewal_date, days_before)
);

create index if not exists alert_logs_lookup_idx
  on public.alert_logs(subscription_id, renewal_date, days_before);

-- ---------------------------------------------------------------------------
-- Triggers (fixed search_path for Security Advisor)
-- ---------------------------------------------------------------------------

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

drop trigger if exists subscriptions_updated_at on public.subscriptions;
create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.handle_updated_at();

-- Creates a profile row when a new auth user is created
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, company_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.raw_user_meta_data->>'company_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.team_members enable row level security;
alter table public.notifications enable row level security;
alter table public.alert_logs enable row level security;

-- Profiles: users can read/insert/update only their own row
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Subscriptions
drop policy if exists "Users can view own subscriptions" on public.subscriptions;
create policy "Users can view own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own subscriptions" on public.subscriptions;
create policy "Users can insert own subscriptions"
  on public.subscriptions for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own subscriptions" on public.subscriptions;
create policy "Users can update own subscriptions"
  on public.subscriptions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own subscriptions" on public.subscriptions;
create policy "Users can delete own subscriptions"
  on public.subscriptions for delete
  using (auth.uid() = user_id);

-- Team members
drop policy if exists "Users can view own team members" on public.team_members;
create policy "Users can view own team members"
  on public.team_members for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own team members" on public.team_members;
create policy "Users can insert own team members"
  on public.team_members for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own team members" on public.team_members;
create policy "Users can update own team members"
  on public.team_members for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own team members" on public.team_members;
create policy "Users can delete own team members"
  on public.team_members for delete
  using (auth.uid() = user_id);

-- Notifications (no USING (true) policies — service_role bypasses RLS)
drop policy if exists "Users can view own notifications" on public.notifications;
create policy "Users can view own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

drop policy if exists "Users can update own notifications" on public.notifications;
create policy "Users can update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own notifications" on public.notifications;
create policy "Users can delete own notifications"
  on public.notifications for delete
  using (auth.uid() = user_id);

drop policy if exists "Service role can insert notifications" on public.notifications;

-- Alert logs
drop policy if exists "Users can view own alert logs" on public.alert_logs;
create policy "Users can view own alert logs"
  on public.alert_logs for select
  using (auth.uid() = user_id);

drop policy if exists "Service role can manage alert logs" on public.alert_logs;

-- ---------------------------------------------------------------------------
-- Backfill: create profiles for existing auth users missing a profile
-- ---------------------------------------------------------------------------
insert into public.profiles (id, full_name)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', split_part(u.email, '@', 1), '')
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;
