-- ==============================================
-- Daily Journal – Supabase SQL Migration
-- Supabaseのダッシュボード > SQL Editorで実行
-- ==============================================

-- ---- diary_entries ----
create table if not exists public.diary_entries (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  date             text not null,  -- YYYY-MM-DD
  mood_morning     text,           -- excellent/good/neutral/bad/awful
  mood_afternoon   text,
  mood_evening     text,
  comfort_morning  int2 default 3, -- 1-5
  energy_level     int2 default 3, -- 1-5
  meal_breakfast   text default '',
  meal_lunch       text default '',
  meal_dinner      text default '',
  note             text default '',
  weather          text,           -- sunny/cloudy/rainy/snowy/windy
  created_at       timestamptz default now(),
  updated_at       timestamptz default now(),
  unique(user_id, date)
);

-- ---- diary_trash ----
create table if not exists public.diary_trash (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  original_id      uuid,
  date             text not null,
  mood_morning     text,
  mood_afternoon   text,
  mood_evening     text,
  comfort_morning  int2 default 0,
  energy_level     int2 default 0,
  meal_breakfast   text default '',
  meal_lunch       text default '',
  meal_dinner      text default '',
  note             text default '',
  weather          text,
  deleted_at       timestamptz default now(),
  auto_delete      boolean default true
);

-- ---- app_settings ----
create table if not exists public.app_settings (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  key        text not null,
  value      text not null,
  unique(user_id, key)
);

-- ---- Row Level Security ----
alter table public.diary_entries  enable row level security;
alter table public.diary_trash    enable row level security;
alter table public.app_settings   enable row level security;

-- diary_entries policies
create policy "Users can manage their own entries"
  on public.diary_entries
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- diary_trash policies
create policy "Users can manage their own trash"
  on public.diary_trash
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- app_settings policies
create policy "Users can manage their own settings"
  on public.app_settings
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---- Auto-set user_id on insert ----
create or replace function public.set_user_id()
returns trigger language plpgsql security definer as $$
begin
  new.user_id := auth.uid();
  return new;
end;
$$;

create trigger set_diary_entries_user_id
  before insert on public.diary_entries
  for each row execute function public.set_user_id();

create trigger set_diary_trash_user_id
  before insert on public.diary_trash
  for each row execute function public.set_user_id();

create trigger set_app_settings_user_id
  before insert on public.app_settings
  for each row execute function public.set_user_id();

-- ---- updated_at auto-update ----
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger update_diary_entries_updated_at
  before update on public.diary_entries
  for each row execute function public.update_updated_at();
