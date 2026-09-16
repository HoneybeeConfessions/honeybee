-- bank type + creator flag (optional columns for cloud sync)
alter table confessions add column if not exists bank_type text;
alter table confessions add column if not exists is_creator boolean not null default false;
