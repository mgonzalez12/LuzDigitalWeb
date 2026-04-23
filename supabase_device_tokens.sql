-- Device tokens for push notifications (APNs / FCM).
-- Run this once in Supabase SQL Editor after applying supabase_schema.sql.

create table if not exists public.user_device_tokens (
  user_id uuid not null references auth.users(id) on delete cascade,
  token text not null,
  platform text not null check (platform in ('ios', 'android', 'web')),
  created_at timestamptz not null default now(),
  primary key (user_id, token)
);

alter table public.user_device_tokens enable row level security;

drop policy if exists "user_select_own_device_tokens" on public.user_device_tokens;
create policy "user_select_own_device_tokens"
on public.user_device_tokens
for select to authenticated
using (user_id = auth.uid());

drop policy if exists "user_insert_own_device_tokens" on public.user_device_tokens;
create policy "user_insert_own_device_tokens"
on public.user_device_tokens
for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists "user_delete_own_device_tokens" on public.user_device_tokens;
create policy "user_delete_own_device_tokens"
on public.user_device_tokens
for delete to authenticated
using (user_id = auth.uid());
