create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'mentor',
  created_at timestamptz not null default now()
);

create table if not exists public.schools (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  county text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.school_members (
  id uuid primary key default uuid_generate_v4(),
  school_id uuid not null references public.schools(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  member_role text not null default 'mentor',
  created_at timestamptz not null default now(),
  unique (school_id, user_id)
);

create table if not exists public.assessments (
  id uuid primary key default uuid_generate_v4(),
  school_id uuid not null references public.schools(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  responses jsonb
);

create table if not exists public.plans (
  id uuid primary key default uuid_generate_v4(),
  school_id uuid not null references public.schools(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete restrict,
  title text not null default '90-Day Action Plan',
  created_at timestamptz not null default now(),
  payload jsonb
);

create table if not exists public.mentor_notes (
  id uuid primary key default uuid_generate_v4(),
  school_id uuid not null references public.schools(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete restrict,
  note text not null,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, '', 'mentor')
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.schools enable row level security;
alter table public.school_members enable row level security;
alter table public.assessments enable row level security;
alter table public.plans enable row level security;
alter table public.mentor_notes enable row level security;

create or replace function public.current_role()
returns text as $$
  select role from public.profiles where id = auth.uid();
$$ language sql stable security definer;

-- profiles
drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read" on public.profiles
for select using (id = auth.uid());

drop policy if exists "profiles admin read" on public.profiles;
create policy "profiles admin read" on public.profiles
for select using (public.current_role() = 'acsi_admin');

drop policy if exists "profiles admin update" on public.profiles;
create policy "profiles admin update" on public.profiles
for update using (public.current_role() = 'acsi_admin');

-- schools
drop policy if exists "schools admin all" on public.schools;
create policy "schools admin all" on public.schools
for all using (public.current_role() = 'acsi_admin')
with check (public.current_role() = 'acsi_admin');

drop policy if exists "schools member read" on public.schools;
create policy "schools member read" on public.schools
for select using (
  public.current_role() = 'acsi_admin'
  or exists (
    select 1 from public.school_members sm
    where sm.school_id = schools.id and sm.user_id = auth.uid()
  )
);

-- members
drop policy if exists "members admin all" on public.school_members;
create policy "members admin all" on public.school_members
for all using (public.current_role() = 'acsi_admin')
with check (public.current_role() = 'acsi_admin');

drop policy if exists "members self read" on public.school_members;
create policy "members self read" on public.school_members
for select using (user_id = auth.uid());

-- assessments
drop policy if exists "assessments admin all" on public.assessments;
create policy "assessments admin all" on public.assessments
for all using (public.current_role() = 'acsi_admin')
with check (public.current_role() = 'acsi_admin');

drop policy if exists "assessments member read" on public.assessments;
create policy "assessments member read" on public.assessments
for select using (
  exists (
    select 1 from public.school_members sm
    where sm.school_id = assessments.school_id and sm.user_id = auth.uid()
  )
);

drop policy if exists "assessments member insert" on public.assessments;
create policy "assessments member insert" on public.assessments
for insert with check (
  exists (
    select 1 from public.school_members sm
    where sm.school_id = assessments.school_id and sm.user_id = auth.uid()
  )
);

-- plans
drop policy if exists "plans admin all" on public.plans;
create policy "plans admin all" on public.plans
for all using (public.current_role() = 'acsi_admin')
with check (public.current_role() = 'acsi_admin');

drop policy if exists "plans member read" on public.plans;
create policy "plans member read" on public.plans
for select using (
  exists (
    select 1 from public.school_members sm
    where sm.school_id = plans.school_id and sm.user_id = auth.uid()
  )
);

drop policy if exists "plans member insert" on public.plans;
create policy "plans member insert" on public.plans
for insert with check (
  exists (
    select 1 from public.school_members sm
    where sm.school_id = plans.school_id and sm.user_id = auth.uid()
  )
);

-- notes
drop policy if exists "notes admin all" on public.mentor_notes;
create policy "notes admin all" on public.mentor_notes
for all using (public.current_role() = 'acsi_admin')
with check (public.current_role() = 'acsi_admin');

drop policy if exists "notes member read" on public.mentor_notes;
create policy "notes member read" on public.mentor_notes
for select using (
  exists (
    select 1 from public.school_members sm
    where sm.school_id = mentor_notes.school_id and sm.user_id = auth.uid()
  )
);

drop policy if exists "notes member insert" on public.mentor_notes;
create policy "notes member insert" on public.mentor_notes
for insert with check (
  exists (
    select 1 from public.school_members sm
    where sm.school_id = mentor_notes.school_id and sm.user_id = auth.uid()
  )
);
