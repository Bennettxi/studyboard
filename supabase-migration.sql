-- ============================================
-- StudyBoard Database Migration
-- Run this in Supabase SQL Editor
-- ============================================

-- Profiles (auto-created on signup)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- User preferences (theme, dark mode)
create table if not exists user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  dark_mode boolean default false,
  theme text default 'default'
);

alter table user_preferences enable row level security;
create policy "Users can CRUD own preferences" on user_preferences for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto-create preferences on signup
create or replace function public.handle_new_user_preferences()
returns trigger as $$
begin
  insert into public.user_preferences (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created_preferences
  after insert on auth.users
  for each row execute procedure public.handle_new_user_preferences();

-- Courses
create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  color text not null,
  teacher text,
  created_at timestamptz default now()
);

alter table courses enable row level security;
create policy "Users can CRUD own courses" on courses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Folders
create table if not exists folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  color text not null,
  course_id uuid references courses(id) on delete set null,
  created_at timestamptz default now()
);

alter table folders enable row level security;
create policy "Users can CRUD own folders" on folders for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Assignments
create table if not exists assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  course_id uuid references courses(id) on delete cascade not null,
  folder_id uuid references folders(id) on delete set null,
  due_date date not null,
  priority text not null check (priority in ('low', 'medium', 'high', 'urgent')),
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  tags text[] default '{}',
  grade numeric,
  grade_max numeric,
  recurring text check (recurring in ('weekly', 'biweekly', 'monthly')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table assignments enable row level security;
create policy "Users can CRUD own assignments" on assignments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Subtasks
create table if not exists subtasks (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid references assignments(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  completed boolean default false,
  sort_order int default 0
);

alter table subtasks enable row level security;
create policy "Users can CRUD own subtasks" on subtasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Pomodoro sessions
create table if not exists pomodoro_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  assignment_id uuid references assignments(id) on delete set null,
  duration int not null,
  started_at timestamptz not null,
  completed_at timestamptz
);

alter table pomodoro_sessions enable row level security;
create policy "Users can CRUD own sessions" on pomodoro_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Updated_at trigger for assignments
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger assignments_updated_at
  before update on assignments
  for each row execute procedure update_updated_at();
