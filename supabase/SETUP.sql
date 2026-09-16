-- Honeybee full schema — paste once in Supabase SQL Editor, then Run
-- Project: cousvocgeyxoyxygfisw

create table if not exists confessions (
  id uuid primary key default gen_random_uuid(),
  number bigserial unique not null,
  location_raw text not null,
  location_norm text not null,
  body text not null,
  tags text[] not null default '{}',
  author_key text,
  hug_count int not null default 0,
  flag_count int not null default 0,
  status text not null default 'visible' check (status in ('visible', 'hidden')),
  needs_help boolean not null default false,
  email text,
  whatsapp text,
  account_details text,
  created_at timestamptz not null default now()
);

create index if not exists confessions_status_created_idx
  on confessions (status, created_at desc);

create index if not exists confessions_author_key_idx
  on confessions (author_key)
  where author_key is not null;

create table if not exists confession_hugs (
  id uuid primary key default gen_random_uuid(),
  confession_id uuid not null references confessions(id) on delete cascade,
  device_id text not null,
  created_at timestamptz not null default now(),
  unique (confession_id, device_id)
);

create table if not exists confession_comments (
  id uuid primary key default gen_random_uuid(),
  confession_id uuid not null references confessions(id) on delete cascade,
  body text not null,
  device_id text not null,
  flag_count int not null default 0,
  status text not null default 'visible' check (status in ('visible', 'hidden')),
  created_at timestamptz not null default now()
);

create index if not exists confession_comments_confession_idx
  on confession_comments (confession_id, created_at);

create table if not exists confession_updates (
  id uuid primary key default gen_random_uuid(),
  confession_id uuid not null references confessions(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists awareness_stats (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  metric text not null,
  value numeric not null,
  source_url text not null,
  note text not null default '',
  created_at timestamptz not null default now()
);

alter table confessions add column if not exists bank_type text;
alter table confessions add column if not exists is_creator boolean not null default false;
alter table confessions add column if not exists kind text not null default 'confession';
alter table confessions add column if not exists reply_to_number bigint;
alter table confessions add column if not exists life_stage text;

do $$ begin
  alter table confessions add constraint confessions_kind_check
    check (kind in ('confession', 'comeback'));
exception when duplicate_object then null;
end $$;

alter table confessions enable row level security;
alter table confession_hugs enable row level security;
alter table confession_comments enable row level security;
alter table confession_updates enable row level security;
alter table awareness_stats enable row level security;

-- Open anon policies for Phase 1 MVP (tighten before public launch)
do $$ begin
  create policy "confessions read" on confessions for select using (true);
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "confessions insert" on confessions for insert with check (true);
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "confessions update" on confessions for update using (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "hugs read" on confession_hugs for select using (true);
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "hugs insert" on confession_hugs for insert with check (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "comments read" on confession_comments for select using (true);
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "comments insert" on confession_comments for insert with check (true);
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "comments update" on confession_comments for update using (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "updates read" on confession_updates for select using (true);
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "updates insert" on confession_updates for insert with check (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "awareness read" on awareness_stats for select using (true);
exception when duplicate_object then null;
end $$;
-- Call outs: pattern call-outs with Seconds (not hugs)

create table if not exists callouts (
  id uuid primary key default gen_random_uuid(),
  number bigserial unique not null,
  body text not null,
  location_raw text not null default '',
  location_norm text not null default '',
  author_key text,
  second_count int not null default 0,
  flag_count int not null default 0,
  status text not null default 'visible' check (status in ('visible', 'hidden')),
  created_at timestamptz not null default now()
);

create index if not exists callouts_status_seconds_idx
  on callouts (status, second_count desc, created_at desc);

create table if not exists callout_seconds (
  id uuid primary key default gen_random_uuid(),
  callout_id uuid not null references callouts(id) on delete cascade,
  device_id text not null,
  created_at timestamptz not null default now(),
  unique (callout_id, device_id)
);

alter table callouts enable row level security;
alter table callout_seconds enable row level security;

do $$ begin
  create policy "callouts read" on callouts for select using (true);
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "callouts insert" on callouts for insert with check (true);
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "callouts update" on callouts for update using (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "callout seconds read" on callout_seconds for select using (true);
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "callout seconds insert" on callout_seconds for insert with check (true);
exception when duplicate_object then null;
end $$;

-- (appended 005_callouts)
