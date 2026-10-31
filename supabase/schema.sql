-- Side Desk shared rooms.
-- Run this once in the Supabase SQL editor after creating a free project.
-- Authentication → Providers → Email stays on. Turn off "Confirm email" until you add an email service.

create extension if not exists pgcrypto;

-- ─── Accounts and offices ────────────────────────────────────────────────────

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  avatar jsonb not null,
  status_message text,
  muted_nudges boolean not null default false,
  muted_sounds boolean not null default false,
  blocked_users text[] not null default '{}',
  joined_at timestamptz not null default now()
);

create table if not exists public.offices (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  theme text not null,
  layout text not null,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  invite_code text not null unique,
  cover_emoji text,
  created_at timestamptz not null default now()
);

create table if not exists public.memberships (
  user_id uuid not null references public.profiles (id) on delete cascade,
  office_id uuid not null references public.offices (id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member')),
  desk_id text,
  joined_at timestamptz not null default now(),
  primary key (user_id, office_id)
);

create index if not exists memberships_office_idx on public.memberships (office_id);

-- ─── Chat ────────────────────────────────────────────────────────────────────

create table if not exists public.messages (
  id text primary key,
  office_id uuid not null references public.offices (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  author_name text not null,
  author_avatar jsonb not null,
  content text not null,
  type text not null,
  dm_to uuid references public.profiles (id) on delete cascade,
  reactions jsonb not null default '{}'::jsonb,
  link_preview jsonb,
  created_at timestamptz not null default now()
);

create index if not exists messages_office_idx on public.messages (office_id, created_at);

-- ─── Personal records ────────────────────────────────────────────────────────

create table if not exists public.focus_sessions (
  id text primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  topic text,
  duration integer not null,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  completed boolean not null default false
);

create index if not exists focus_sessions_user_idx on public.focus_sessions (user_id, ended_at);

create table if not exists public.barista_stats (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  stats jsonb not null,
  updated_at timestamptz not null default now()
);

-- ─── Shared room documents ───────────────────────────────────────────────────

create table if not exists public.boards (
  office_id uuid not null references public.offices (id) on delete cascade,
  design_id text not null,
  room_id text not null,
  doc jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (office_id, design_id, room_id)
);

create table if not exists public.discussions (
  office_id uuid not null references public.offices (id) on delete cascade,
  design_id text not null,
  room_id text not null,
  doc jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (office_id, design_id, room_id)
);

create table if not exists public.task_boards (
  office_id uuid primary key references public.offices (id) on delete cascade,
  doc jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.arcade_docs (
  office_id uuid primary key references public.offices (id) on delete cascade,
  doc jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.office_music (
  office_id uuid primary key references public.offices (id) on delete cascade,
  doc jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.notice_docs (
  office_id uuid primary key references public.offices (id) on delete cascade,
  doc jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.desk_notes (
  office_id uuid not null references public.offices (id) on delete cascade,
  design_id text not null,
  doc jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (office_id, design_id)
);

create table if not exists public.plants (
  office_id uuid not null references public.offices (id) on delete cascade,
  design_id text not null,
  doc jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (office_id, design_id)
);

-- ─── Helpers ─────────────────────────────────────────────────────────────────

create or replace function public.is_member(office uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.memberships
    where office_id = office and user_id = auth.uid()
  );
$$;

create or replace function public.shares_office(office uuid, person uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships mine
    join public.memberships theirs on theirs.office_id = mine.office_id
    where mine.office_id = office
      and mine.user_id = auth.uid()
      and theirs.user_id = person
  );
$$;

create or replace function public.can_edit_office(office uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.memberships
    where office_id = office
      and user_id = auth.uid()
      and role in ('owner', 'admin')
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, avatar)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'name', ''), split_part(new.email, '@', 1), 'Member'),
    coalesce(new.email, ''),
    coalesce(
      new.raw_user_meta_data->'avatar',
      '{"skinTone":"#D08B5B","hairStyle":"bun","hairColor":"#2C1810","outfit":"tshirt","outfitColor":"#658B86","accessory":"none"}'::jsonb
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.create_office(
  p_name text,
  p_description text,
  p_theme text,
  p_layout text,
  p_invite text,
  p_emoji text
)
returns public.offices
language plpgsql
security definer
set search_path = public
as $$
declare
  created public.offices;
begin
  if auth.uid() is null then
    raise exception 'Sign in required';
  end if;
  insert into public.offices (name, description, theme, layout, owner_id, invite_code, cover_emoji)
  values (
    left(btrim(p_name), 80),
    left(coalesce(btrim(p_description), ''), 200),
    p_theme,
    p_layout,
    auth.uid(),
    upper(btrim(p_invite)),
    p_emoji
  )
  returning * into created;
  insert into public.memberships (user_id, office_id, role)
  values (auth.uid(), created.id, 'owner');
  return created;
end;
$$;

create or replace function public.join_office(p_code text)
returns public.offices
language plpgsql
security definer
set search_path = public
as $$
declare
  found public.offices;
begin
  if auth.uid() is null then
    raise exception 'Sign in required';
  end if;
  select * into found from public.offices where invite_code = upper(btrim(p_code));
  if not found then
    raise exception 'No office uses that code';
  end if;
  insert into public.memberships (user_id, office_id, role)
  values (auth.uid(), found.id, 'member')
  on conflict (user_id, office_id) do nothing;
  return found;
end;
$$;

create or replace function public.protect_message()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is distinct from old.author_id then
    new.content := old.content;
    new.author_id := old.author_id;
    new.author_name := old.author_name;
    new.author_avatar := old.author_avatar;
    new.office_id := old.office_id;
    new.dm_to := old.dm_to;
    new.type := old.type;
    new.created_at := old.created_at;
    new.link_preview := old.link_preview;
  end if;
  new.id := old.id;
  return new;
end;
$$;

drop trigger if exists protect_message on public.messages;
create trigger protect_message
  before update on public.messages
  for each row execute function public.protect_message();

create or replace function public.keep_membership()
returns trigger
language plpgsql
as $$
begin
  new.user_id := old.user_id;
  new.office_id := old.office_id;
  new.role := old.role;
  new.joined_at := old.joined_at;
  return new;
end;
$$;

drop trigger if exists keep_membership on public.memberships;
create trigger keep_membership
  before update on public.memberships
  for each row execute function public.keep_membership();

create or replace view public.my_offices
with (security_invoker = true) as
select
  o.id,
  o.name,
  o.description,
  o.theme,
  o.layout,
  o.owner_id,
  o.invite_code,
  o.cover_emoji,
  o.created_at,
  m.role,
  (select count(*)::int from public.memberships c where c.office_id = o.id) as member_count
from public.offices o
join public.memberships m on m.office_id = o.id
where m.user_id = auth.uid();

-- ─── Row security ────────────────────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.offices enable row level security;
alter table public.memberships enable row level security;
alter table public.messages enable row level security;
alter table public.focus_sessions enable row level security;
alter table public.barista_stats enable row level security;
alter table public.boards enable row level security;
alter table public.discussions enable row level security;
alter table public.task_boards enable row level security;
alter table public.arcade_docs enable row level security;
alter table public.office_music enable row level security;
alter table public.notice_docs enable row level security;
alter table public.desk_notes enable row level security;
alter table public.plants enable row level security;

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (
    id = auth.uid()
    or exists (
      select 1
      from public.memberships mine
      join public.memberships theirs on theirs.office_id = mine.office_id
      where mine.user_id = auth.uid() and theirs.user_id = profiles.id
    )
  );

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists offices_select on public.offices;
create policy offices_select on public.offices
  for select using (public.is_member(id));

drop policy if exists offices_update on public.offices;
create policy offices_update on public.offices
  for update using (public.can_edit_office(id)) with check (public.can_edit_office(id));

drop policy if exists memberships_select on public.memberships;
create policy memberships_select on public.memberships
  for select using (public.is_member(office_id));

drop policy if exists memberships_update on public.memberships;
create policy memberships_update on public.memberships
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists messages_select on public.messages;
create policy messages_select on public.messages
  for select using (
    public.shares_office(office_id, auth.uid())
    and (dm_to is null or author_id = auth.uid() or dm_to = auth.uid())
  );

drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages
  for insert with check (
    author_id = auth.uid()
    and public.shares_office(office_id, auth.uid())
    and (dm_to is null or public.shares_office(office_id, dm_to))
  );

drop policy if exists messages_update on public.messages;
create policy messages_update on public.messages
  for update using (
    public.shares_office(office_id, auth.uid())
    and (dm_to is null or author_id = auth.uid() or dm_to = auth.uid())
  );

drop policy if exists focus_all on public.focus_sessions;
create policy focus_all on public.focus_sessions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists barista_all on public.barista_stats;
create policy barista_all on public.barista_stats
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists boards_all on public.boards;
create policy boards_all on public.boards
  for all using (public.is_member(office_id)) with check (public.is_member(office_id));

drop policy if exists discussions_all on public.discussions;
create policy discussions_all on public.discussions
  for all using (public.is_member(office_id)) with check (public.is_member(office_id));

drop policy if exists tasks_all on public.task_boards;
create policy tasks_all on public.task_boards
  for all using (public.is_member(office_id)) with check (public.is_member(office_id));

drop policy if exists arcade_all on public.arcade_docs;
create policy arcade_all on public.arcade_docs
  for all using (public.is_member(office_id)) with check (public.is_member(office_id));

drop policy if exists music_all on public.office_music;
create policy music_all on public.office_music
  for all using (public.is_member(office_id)) with check (public.is_member(office_id));

drop policy if exists notices_all on public.notice_docs;
create policy notices_all on public.notice_docs
  for all using (public.is_member(office_id)) with check (public.is_member(office_id));

drop policy if exists notes_all on public.desk_notes;
create policy notes_all on public.desk_notes
  for all using (public.is_member(office_id)) with check (public.is_member(office_id));

drop policy if exists plants_all on public.plants;
create policy plants_all on public.plants
  for all using (public.is_member(office_id)) with check (public.is_member(office_id));

grant select, update on public.profiles to authenticated;
grant select, update on public.offices to authenticated;
grant select, update on public.memberships to authenticated;
grant select, insert, update on public.messages to authenticated;
grant select, insert, update, delete on public.focus_sessions to authenticated;
grant select, insert, update, delete on public.barista_stats to authenticated;
grant select, insert, update, delete on public.boards to authenticated;
grant select, insert, update, delete on public.discussions to authenticated;
grant select, insert, update, delete on public.task_boards to authenticated;
grant select, insert, update, delete on public.arcade_docs to authenticated;
grant select, insert, update, delete on public.office_music to authenticated;
grant select, insert, update, delete on public.notice_docs to authenticated;
grant select, insert, update, delete on public.desk_notes to authenticated;
grant select, insert, update, delete on public.plants to authenticated;
grant select on public.my_offices to authenticated;

revoke all on function public.is_member(uuid) from public, anon;
revoke all on function public.shares_office(uuid, uuid) from public, anon;
revoke all on function public.can_edit_office(uuid) from public, anon;
grant execute on function public.is_member(uuid) to authenticated;
grant execute on function public.shares_office(uuid, uuid) to authenticated;
grant execute on function public.can_edit_office(uuid) to authenticated;
grant execute on function public.create_office(text, text, text, text, text, text) to authenticated;
grant execute on function public.join_office(text) to authenticated;

-- ─── Photos ──────────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('board-assets', 'board-assets', false)
on conflict (id) do nothing;

drop policy if exists board_assets_read on storage.objects;
create policy board_assets_read on storage.objects
  for select to authenticated
  using (
    bucket_id = 'board-assets'
    and public.is_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists board_assets_write on storage.objects;
create policy board_assets_write on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'board-assets'
    and public.is_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists board_assets_update on storage.objects;
create policy board_assets_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'board-assets'
    and public.is_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists board_assets_delete on storage.objects;
create policy board_assets_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'board-assets'
    and public.is_member(((storage.foldername(name))[1])::uuid)
  );

-- ─── Live updates ────────────────────────────────────────────────────────────

alter table public.messages replica identity full;
alter table public.boards replica identity full;
alter table public.discussions replica identity full;
alter table public.task_boards replica identity full;
alter table public.arcade_docs replica identity full;
alter table public.office_music replica identity full;
alter table public.notice_docs replica identity full;
alter table public.desk_notes replica identity full;
alter table public.plants replica identity full;

do $$
declare
  t text;
begin
  foreach t in array array[
    'messages', 'boards', 'discussions', 'task_boards', 'arcade_docs',
    'office_music', 'notice_docs', 'desk_notes', 'plants'
  ]
  loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception
      when duplicate_object then null;
    end;
  end loop;
end $$;
