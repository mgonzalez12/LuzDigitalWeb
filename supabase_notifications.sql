-- Tabla para notificaciones de usuario
create table if not exists public.user_notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  message text not null,
  is_read boolean default false,
  type text default 'general', -- 'daily_reminder', 'system', etc.
  created_at timestamptz default now(),
  
  -- Restricción para asegurar que si es 'daily_reminder', solo haya una por usuario (opcional, pero solicitado para ahorrar recursos)
  constraint unique_daily_reminder unique (user_id, type)
);

-- RLS
alter table public.user_notifications enable row level security;

create policy "Users can view their own notifications"
  on public.user_notifications for select
  using (auth.uid() = user_id);

create policy "Users can update their own notifications"
  on public.user_notifications for update
  using (auth.uid() = user_id);

create policy "Users can insert their own notifications"
  on public.user_notifications for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own notifications"
  on public.user_notifications for delete
  using (auth.uid() = user_id);
