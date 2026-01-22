-- Luz Digital - Supabase schema (Biblia + Viaje Espiritual)
-- Ejecutar en Supabase SQL Editor. Incluye RLS y funciones RPC.
--
-- Notas:
-- - Las tablas `bible_*` son de lectura pública (select).
-- - Las tablas `user_*` son privadas por usuario (auth.uid()).
-- - `bible_chapters.image_url` guarda la URL pública del Storage.

begin;

-- ---------- Helpers ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- Bible catalog ----------
create table if not exists public.bible_versions (
  code text primary key,
  name text not null,
  language text not null default 'es',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_bible_versions_updated_at on public.bible_versions;
create trigger trg_bible_versions_updated_at
before update on public.bible_versions
for each row execute function public.set_updated_at();

create table if not exists public.bible_books (
  version_code text not null references public.bible_versions(code) on delete cascade,
  slug text not null,
  name text not null,
  testament text not null check (testament in ('old', 'new')),
  book_order int not null,
  chapter_count int not null check (chapter_count > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (version_code, slug)
);

drop trigger if exists trg_bible_books_updated_at on public.bible_books;
create trigger trg_bible_books_updated_at
before update on public.bible_books
for each row execute function public.set_updated_at();

create table if not exists public.bible_chapters (
  version_code text not null,
  book_slug text not null,
  chapter_number int not null check (chapter_number > 0),
  title text null,
  image_url text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (version_code, book_slug, chapter_number),
  constraint fk_bible_chapters_book
    foreign key (version_code, book_slug)
    references public.bible_books(version_code, slug)
    on delete cascade
);

drop trigger if exists trg_bible_chapters_updated_at on public.bible_chapters;
create trigger trg_bible_chapters_updated_at
before update on public.bible_chapters
for each row execute function public.set_updated_at();

create index if not exists idx_bible_chapters_lookup
on public.bible_chapters (version_code, book_slug, chapter_number);

-- ---------- User personalization (Viaje Espiritual) ----------
create table if not exists public.user_chapter_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  version_code text not null,
  book_slug text not null,
  chapter_number int not null check (chapter_number > 0),
  first_read_at timestamptz not null default now(),
  last_read_at timestamptz not null default now(),
  reads_count int not null default 1 check (reads_count >= 1),
  primary key (user_id, version_code, book_slug, chapter_number)
);

create index if not exists idx_user_chapter_progress_user
on public.user_chapter_progress (user_id, version_code, book_slug);

-- Días leídos (para racha)
create table if not exists public.user_reading_days (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  created_at timestamptz not null default now(),
  primary key (user_id, day)
);

-- Favoritos de capítulo
create table if not exists public.user_chapter_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  version_code text not null,
  book_slug text not null,
  chapter_number int not null check (chapter_number > 0),
  created_at timestamptz not null default now(),
  primary key (user_id, version_code, book_slug, chapter_number)
);

-- Marcadores por versículo (bookmark)
create table if not exists public.user_verse_bookmarks (
  user_id uuid not null references auth.users(id) on delete cascade,
  version_code text not null,
  book_slug text not null,
  chapter_number int not null check (chapter_number > 0),
  verse_number int not null check (verse_number > 0),
  note text null,
  created_at timestamptz not null default now(),
  primary key (user_id, version_code, book_slug, chapter_number, verse_number)
);

-- Preferencias del usuario (para Dashboard / Configuración rápida)
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  preferred_version_code text not null default 'rv1960' references public.bible_versions(code) on delete restrict,
  sounds_enabled boolean not null default true,
  reminders_enabled boolean not null default true,
  reminder_time time not null default '09:00',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_user_settings_updated_at on public.user_settings;
create trigger trg_user_settings_updated_at
before update on public.user_settings
for each row execute function public.set_updated_at();

-- ---------- RLS ----------
alter table public.bible_versions enable row level security;
alter table public.bible_books enable row level security;
alter table public.bible_chapters enable row level security;
alter table public.user_chapter_progress enable row level security;
alter table public.user_reading_days enable row level security;
alter table public.user_chapter_favorites enable row level security;
alter table public.user_verse_bookmarks enable row level security;
alter table public.user_settings enable row level security;

-- Bible catalog: lectura pública
drop policy if exists "public_read_bible_versions" on public.bible_versions;
create policy "public_read_bible_versions"
on public.bible_versions
for select
to anon, authenticated
using (true);

drop policy if exists "public_read_bible_books" on public.bible_books;
create policy "public_read_bible_books"
on public.bible_books
for select
to anon, authenticated
using (true);

drop policy if exists "public_read_bible_chapters" on public.bible_chapters;
create policy "public_read_bible_chapters"
on public.bible_chapters
for select
to anon, authenticated
using (true);

-- User tables: solo dueño
drop policy if exists "user_select_own_chapter_progress" on public.user_chapter_progress;
create policy "user_select_own_chapter_progress"
on public.user_chapter_progress
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "user_upsert_own_chapter_progress" on public.user_chapter_progress;
create policy "user_upsert_own_chapter_progress"
on public.user_chapter_progress
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "user_update_own_chapter_progress" on public.user_chapter_progress;
create policy "user_update_own_chapter_progress"
on public.user_chapter_progress
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "user_select_own_reading_days" on public.user_reading_days;
create policy "user_select_own_reading_days"
on public.user_reading_days
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "user_insert_own_reading_days" on public.user_reading_days;
create policy "user_insert_own_reading_days"
on public.user_reading_days
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "user_delete_own_reading_days" on public.user_reading_days;
create policy "user_delete_own_reading_days"
on public.user_reading_days
for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists "user_select_own_chapter_favorites" on public.user_chapter_favorites;
create policy "user_select_own_chapter_favorites"
on public.user_chapter_favorites
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "user_insert_own_chapter_favorites" on public.user_chapter_favorites;
create policy "user_insert_own_chapter_favorites"
on public.user_chapter_favorites
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "user_delete_own_chapter_favorites" on public.user_chapter_favorites;
create policy "user_delete_own_chapter_favorites"
on public.user_chapter_favorites
for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists "user_select_own_verse_bookmarks" on public.user_verse_bookmarks;
create policy "user_select_own_verse_bookmarks"
on public.user_verse_bookmarks
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "user_insert_own_verse_bookmarks" on public.user_verse_bookmarks;
create policy "user_insert_own_verse_bookmarks"
on public.user_verse_bookmarks
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "user_update_own_verse_bookmarks" on public.user_verse_bookmarks;
create policy "user_update_own_verse_bookmarks"
on public.user_verse_bookmarks
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "user_delete_own_verse_bookmarks" on public.user_verse_bookmarks;
create policy "user_delete_own_verse_bookmarks"
on public.user_verse_bookmarks
for delete
to authenticated
using (user_id = auth.uid());

-- user_settings: solo dueño
drop policy if exists "user_select_own_settings" on public.user_settings;
create policy "user_select_own_settings"
on public.user_settings
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "user_insert_own_settings" on public.user_settings;
create policy "user_insert_own_settings"
on public.user_settings
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "user_update_own_settings" on public.user_settings;
create policy "user_update_own_settings"
on public.user_settings
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- ---------- Seed: versions ----------
insert into public.bible_versions (code, name, language)
values
  ('rv1960', 'Reina Valera 1960', 'es'),
  ('rv1995', 'Reina Valera 1995', 'es'),
  ('nvi', 'Nueva versión internacional', 'es'),
  ('dhh', 'Dios habla hoy', 'es'),
  ('pdt', 'Palabra de Dios para todos', 'es'),
  ('kjv', 'King James Version', 'en')
on conflict (code) do update set
  name = excluded.name,
  language = excluded.language,
  updated_at = now();

-- ---------- Seed function: books + chapters ----------
-- Crea/actualiza los 66 libros y genera capítulos 1..chapter_count en bible_chapters.
create or replace function public.seed_bible_structure(p_version_code text)
returns void
language plpgsql
security definer
as $$
declare
  v_exists boolean;
begin
  select exists(select 1 from public.bible_versions where code = p_version_code) into v_exists;
  if not v_exists then
    raise exception 'Version % no existe en bible_versions', p_version_code;
  end if;

  -- Lista canónica de libros (slug, name, testament, order, chapter_count)
  with books(slug, name, testament, book_order, chapter_count) as (
    values
      -- Antiguo Testamento (39)
      ('genesis','Génesis','old',1,50),
      ('exodo','Éxodo','old',2,40),
      ('levitico','Levítico','old',3,27),
      ('numeros','Números','old',4,36),
      ('deuteronomio','Deuteronomio','old',5,34),
      ('josue','Josué','old',6,24),
      ('jueces','Jueces','old',7,21),
      ('rut','Rut','old',8,4),
      ('1-samuel','1 Samuel','old',9,31),
      ('2-samuel','2 Samuel','old',10,24),
      ('1-reyes','1 Reyes','old',11,22),
      ('2-reyes','2 Reyes','old',12,25),
      ('1-cronicas','1 Crónicas','old',13,29),
      ('2-cronicas','2 Crónicas','old',14,36),
      ('esdras','Esdras','old',15,10),
      ('nehemias','Nehemías','old',16,13),
      ('ester','Ester','old',17,10),
      ('job','Job','old',18,42),
      ('salmos','Salmos','old',19,150),
      ('proverbios','Proverbios','old',20,31),
      ('eclesiastes','Eclesiastés','old',21,12),
      ('cantares','Cantares','old',22,8),
      ('isaias','Isaías','old',23,66),
      ('jeremias','Jeremías','old',24,52),
      ('lamentaciones','Lamentaciones','old',25,5),
      ('ezequiel','Ezequiel','old',26,48),
      ('daniel','Daniel','old',27,12),
      ('oseas','Oseas','old',28,14),
      ('joel','Joel','old',29,3),
      ('amos','Amós','old',30,9),
      ('abdias','Abdías','old',31,1),
      ('jonas','Jonás','old',32,4),
      ('miqueas','Miqueas','old',33,7),
      ('nahum','Nahúm','old',34,3),
      ('habacuc','Habacuc','old',35,3),
      ('sofonias','Sofonías','old',36,3),
      ('hageo','Hageo','old',37,2),
      ('zacarias','Zacarías','old',38,14),
      ('malaquias','Malaquías','old',39,4),
      -- Nuevo Testamento (27)
      ('mateo','Mateo','new',40,28),
      ('marcos','Marcos','new',41,16),
      ('lucas','Lucas','new',42,24),
      ('juan','Juan','new',43,21),
      ('hechos','Hechos','new',44,28),
      ('romanos','Romanos','new',45,16),
      ('1-corintios','1 Corintios','new',46,16),
      ('2-corintios','2 Corintios','new',47,13),
      ('galatas','Gálatas','new',48,6),
      ('efesios','Efesios','new',49,6),
      ('filipenses','Filipenses','new',50,4),
      ('colosenses','Colosenses','new',51,4),
      ('1-tesalonicenses','1 Tesalonicenses','new',52,5),
      ('2-tesalonicenses','2 Tesalonicenses','new',53,3),
      ('1-timoteo','1 Timoteo','new',54,6),
      ('2-timoteo','2 Timoteo','new',55,4),
      ('tito','Tito','new',56,3),
      ('filemon','Filemón','new',57,1),
      ('hebreos','Hebreos','new',58,13),
      ('santiago','Santiago','new',59,5),
      ('1-pedro','1 Pedro','new',60,5),
      ('2-pedro','2 Pedro','new',61,3),
      ('1-juan','1 Juan','new',62,5),
      ('2-juan','2 Juan','new',63,1),
      ('3-juan','3 Juan','new',64,1),
      ('judas','Judas','new',65,1),
      ('apocalipsis','Apocalipsis','new',66,22)
  )
  insert into public.bible_books (version_code, slug, name, testament, book_order, chapter_count)
  select p_version_code, slug, name, testament, book_order, chapter_count from books
  on conflict (version_code, slug) do update set
    name = excluded.name,
    testament = excluded.testament,
    book_order = excluded.book_order,
    chapter_count = excluded.chapter_count,
    updated_at = now();

  -- Generar capítulos 1..chapter_count
  insert into public.bible_chapters (version_code, book_slug, chapter_number)
  select
    p_version_code,
    b.slug,
    gs.chapter_number
  from (
    select slug, chapter_count
    from public.bible_books
    where version_code = p_version_code
  ) b
  cross join lateral (
    select generate_series(1, b.chapter_count) as chapter_number
  ) gs
  on conflict (version_code, book_slug, chapter_number) do nothing;
end;
$$;

-- Permitir ejecutar seed solo desde roles admin/service (en Supabase se usa el SQL editor)
-- Si prefieres no usar security definer, quita esa línea y ejecuta con owner.

-- ---------- RPC: marcar capítulo leído (progreso + día) ----------
create or replace function public.mark_chapter_read(
  p_version_code text,
  p_book_slug text,
  p_chapter_number int
)
returns void
language plpgsql
security definer
as $$
declare
  v_user uuid;
begin
  v_user := auth.uid();
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.user_chapter_progress (user_id, version_code, book_slug, chapter_number)
  values (v_user, p_version_code, p_book_slug, p_chapter_number)
  on conflict (user_id, version_code, book_slug, chapter_number)
  do update set
    last_read_at = now(),
    reads_count = public.user_chapter_progress.reads_count + 1;

  insert into public.user_reading_days (user_id, day)
  values (v_user, current_date)
  on conflict (user_id, day) do nothing;
end;
$$;

-- ---------- RPC: toggle favorito de capítulo ----------
create or replace function public.toggle_chapter_favorite(
  p_version_code text,
  p_book_slug text,
  p_chapter_number int
)
returns boolean
language plpgsql
security definer
as $$
declare
  v_user uuid;
  v_exists boolean;
begin
  v_user := auth.uid();
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  select exists(
    select 1 from public.user_chapter_favorites
    where user_id = v_user
      and version_code = p_version_code
      and book_slug = p_book_slug
      and chapter_number = p_chapter_number
  ) into v_exists;

  if v_exists then
    delete from public.user_chapter_favorites
    where user_id = v_user
      and version_code = p_version_code
      and book_slug = p_book_slug
      and chapter_number = p_chapter_number;
    return false;
  else
    insert into public.user_chapter_favorites (user_id, version_code, book_slug, chapter_number)
    values (v_user, p_version_code, p_book_slug, p_chapter_number)
    on conflict do nothing;
    return true;
  end if;
end;
$$;

-- ---------- RPC: toggle bookmark de versículo ----------
create or replace function public.toggle_verse_bookmark(
  p_version_code text,
  p_book_slug text,
  p_chapter_number int,
  p_verse_number int
)
returns boolean
language plpgsql
security definer
as $$
declare
  v_user uuid;
  v_exists boolean;
begin
  v_user := auth.uid();
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  select exists(
    select 1 from public.user_verse_bookmarks
    where user_id = v_user
      and version_code = p_version_code
      and book_slug = p_book_slug
      and chapter_number = p_chapter_number
      and verse_number = p_verse_number
  ) into v_exists;

  if v_exists then
    delete from public.user_verse_bookmarks
    where user_id = v_user
      and version_code = p_version_code
      and book_slug = p_book_slug
      and chapter_number = p_chapter_number
      and verse_number = p_verse_number;
    return false;
  else
    insert into public.user_verse_bookmarks (user_id, version_code, book_slug, chapter_number, verse_number)
    values (v_user, p_version_code, p_book_slug, p_chapter_number, p_verse_number)
    on conflict do nothing;
    return true;
  end if;
end;
$$;

-- ---------- View: progreso por libro (solo filas del usuario actual) ----------
create or replace view public.user_book_progress as
select
  p.version_code,
  p.book_slug,
  b.name as book_name,
  b.chapter_count,
  count(*)::int as read_chapters,
  round((count(*)::numeric / b.chapter_count::numeric) * 100, 2) as progress_percent
from public.user_chapter_progress p
join public.bible_books b
  on b.version_code = p.version_code
 and b.slug = p.book_slug
where p.user_id = auth.uid()
group by p.version_code, p.book_slug, b.name, b.chapter_count;

grant select on public.user_book_progress to anon, authenticated;

-- ---------- Auto-seed: libros + capítulos ----------
-- Esto deja `bible_books` y `bible_chapters` llenas para todas las versiones registradas.
-- Es seguro re-ejecutarlo (usa upsert + on conflict do nothing).
do $$
declare
  v record;
begin
  for v in (select code from public.bible_versions) loop
    perform public.seed_bible_structure(v.code);
  end loop;
end;
$$;

commit;

