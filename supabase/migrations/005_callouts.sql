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
