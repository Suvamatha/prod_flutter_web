-- FlutterShow production schema
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  slug text not null unique,
  demo_id uuid not null unique default gen_random_uuid(),
  name text not null,
  description text not null default '',
  repository_url text not null,
  github_owner text not null,
  github_repo text not null,
  branch text not null default 'main',
  commit_sha text,
  app_path text,
  status text not null default 'building'
    check (status in ('not_built', 'queued', 'building', 'live', 'failed')),
  demo_url text,
  preview_image_url text,
  flutter_version text,
  screens jsonb not null default '[]'::jsonb,
  selected_demo jsonb,
  theme text not null default 'default',
  chrome jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, repository_url)
);

create table if not exists public.builds (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'queued'
    check (status in ('queued', 'running', 'succeeded', 'failed', 'cancelled')),
  step integer not null default 0 check (step between 0 and 4),
  commit_sha text,
  demo_url text,
  logs jsonb not null default '[]'::jsonb,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists projects_user_updated_idx on public.projects(user_id, updated_at desc);
create index if not exists projects_demo_idx on public.projects(demo_id);
create index if not exists builds_user_created_idx on public.builds(user_id, created_at desc);
create index if not exists builds_project_created_idx on public.builds(project_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.builds enable row level security;

create policy "Public profiles are readable"
  on public.profiles for select using (true);
create policy "Users update their profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Owners read projects"
  on public.projects for select using (auth.uid() = user_id);
create policy "Public reads live demos"
  on public.projects for select using (status = 'live');
create policy "Owners create projects"
  on public.projects for insert with check (auth.uid() = user_id);
create policy "Owners update projects"
  on public.projects for update using (auth.uid() = user_id);
create policy "Owners delete projects"
  on public.projects for delete using (auth.uid() = user_id);

create policy "Owners read builds"
  on public.builds for select using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'user_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    username = excluded.username,
    full_name = excluded.full_name,
    avatar_url = excluded.avatar_url,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update on auth.users
  for each row execute procedure public.handle_new_user();

-- Public bucket for immutable compiled Flutter artifacts. Only the service role
-- uploads; users interact through FlutterShow API routes.
insert into storage.buckets (id, name, public, file_size_limit)
values ('demos', 'demos', true, 52428800)
on conflict (id) do update set public = true;