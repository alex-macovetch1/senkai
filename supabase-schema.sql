-- Senkai — Supabase schema. Paste this into the Supabase SQL Editor and Run.

create table if not exists users (
  id         text primary key,
  username   text not null,
  salt       text not null,
  hash       text not null,
  created_at bigint not null
);
create index if not exists users_username_idx on users (lower(username));

create table if not exists sessions (
  token      text primary key,
  user_id    text not null,
  created_at bigint not null
);
create index if not exists sessions_user_idx on sessions (user_id);

create table if not exists library (
  user_id    text  not null,
  key        text  not null,
  media      jsonb not null,
  status     text  not null,
  rating     int   not null default 0,
  updated_at bigint not null,
  primary key (user_id, key)
);
create index if not exists library_user_idx on library (user_id);

-- LeadBot (same Supabase project) — captured chat leads.
create table if not exists leads (
  id            text primary key,
  lang          text,
  deal          text,
  property_type text,
  zone          text,
  budget        text,
  name          text,
  phone         text,
  created_at    bigint not null
);
create index if not exists leads_created_idx on leads (created_at desc);
