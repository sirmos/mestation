-- MEStation database schema. Run once in the Supabase SQL Editor.

create table if not exists public.chain_events (
  id text primary key,
  contract text not null,
  event text not null,
  block_number bigint not null,
  log_index integer not null,
  tx_hash text not null,
  args jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists chain_events_lookup
  on public.chain_events (contract, event, block_number, log_index);

create index if not exists chain_events_args
  on public.chain_events using gin (args);

create table if not exists public.profiles_index (
  address text primary key,
  name text not null default '',
  handle text not null default '',
  headline text not null default '',
  category text not null default '',
  city text not null default '',
  from_price text,
  jobs integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.bot_state (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.bot_sent (
  key text primary key,
  created_at timestamptz not null default now()
);

create table if not exists public.bot_links (
  platform text not null,
  chat_id text not null,
  address text not null,
  created_at timestamptz not null default now(),
  primary key (platform, chat_id, address)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  deal_id bigint not null,
  sender text not null,
  role text not null,
  kind text not null default 'message',
  audience text not null default 'all',
  body text not null default '',
  file_path text,
  file_name text,
  file_type text,
  created_at timestamptz not null default now()
);

create index if not exists messages_deal
  on public.messages (deal_id, created_at);

-- Only the server (secret key) can read or write. No policies on purpose.
alter table public.chain_events enable row level security;
alter table public.profiles_index enable row level security;
alter table public.bot_state enable row level security;
alter table public.bot_sent enable row level security;
alter table public.bot_links enable row level security;
alter table public.messages enable row level security;

-- New Supabase projects do not grant API roles access to new tables.
grant select, insert, update, delete on public.chain_events to service_role;
grant select, insert, update, delete on public.profiles_index to service_role;
grant select, insert, update, delete on public.bot_state to service_role;
grant select, insert, update, delete on public.bot_sent to service_role;
grant select, insert, update, delete on public.bot_links to service_role;
grant select, insert, update, delete on public.messages to service_role;

-- Private bucket for evidence files. The server hands out short-lived links.
insert into storage.buckets (id, name, public)
values ('evidence', 'evidence', false)
on conflict (id) do nothing;