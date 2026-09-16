alter table confessions add column if not exists kind text not null default 'confession'
  check (kind in ('confession', 'comeback'));
alter table confessions add column if not exists reply_to_number bigint;
