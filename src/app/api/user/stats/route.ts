import { corsHeaders, jsonError, jsonOk, preflight, requireUser } from '@/lib/api/supabaseApi';
import { buildReadingWeekUtc } from '@/lib/readingStreakUtc';

export async function OPTIONS() {
  return preflight();
}

function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export async function GET(req: Request) {
  const ctx = await requireUser(req);
  if (ctx instanceof Response) return ctx;

  const today = startOfDay(new Date());
  const twoWeeksAgo = new Date(today);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 13);

  const [
    chaptersRes,
    versesRes,
    daysRes,
    activeDaysRes,
    recentRes,
    allProgressRes,
    chaptersForBooksRes,
    lastReadRes,
    settingsRes,
  ] = await Promise.all([
      ctx.client
        .from('user_chapter_progress')
        .select('*', { head: true, count: 'exact' }),
      ctx.client
        .from('user_verse_bookmarks')
        .select('*', { head: true, count: 'exact' }),
      ctx.client
        .from('user_reading_days')
        .select('day')
        .order('day', { ascending: false })
        .limit(400),
      ctx.client
        .from('user_reading_days')
        .select('*', { head: true, count: 'exact' }),
      ctx.client
        .from('user_chapter_progress')
        .select('last_read_at')
        .gte('last_read_at', twoWeeksAgo.toISOString()),
      ctx.client
        .from('user_book_progress')
        .select('version_code, book_slug, book_name, chapter_count, read_chapters, progress_percent'),
      ctx.client
        .from('user_chapter_progress')
        .select('version_code, book_slug, last_read_at')
        .order('last_read_at', { ascending: false })
        .limit(2000),
      ctx.client
        .from('user_chapter_progress')
        .select('version_code, book_slug, chapter_number, last_read_at')
        .order('last_read_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      ctx.client
        .from('user_settings')
        .select('preferred_version_code')
        .maybeSingle(),
    ]);

  if (chaptersRes.error) return jsonError(500, chaptersRes.error.message);
  if (versesRes.error) return jsonError(500, versesRes.error.message);
  if (daysRes.error) return jsonError(500, daysRes.error.message);
  if (activeDaysRes.error) return jsonError(500, activeDaysRes.error.message);
  if (recentRes.error) return jsonError(500, recentRes.error.message);
  if (allProgressRes.error) return jsonError(500, allProgressRes.error.message);
  if (chaptersForBooksRes.error) return jsonError(500, chaptersForBooksRes.error.message);
  if (lastReadRes.error) return jsonError(500, lastReadRes.error.message);

  const dayStrings = (daysRes.data ?? []).map((r) => String((r as { day: string }).day));
  const { week, streak, todayKey } = buildReadingWeekUtc(dayStrings);

  // Weekly minutes approximation: 4 min per chapter read.
  const recent = recentRes.data ?? [];
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 6);
  const currentMinutes =
    recent.filter((r) => new Date(r.last_read_at) >= weekAgo).length * 4;
  const previousMinutes =
    recent.filter((r) => new Date(r.last_read_at) < weekAgo).length * 4;

  const readSet = new Set(dayStrings);
  const hasReadToday = readSet.has(todayKey);

  const allProgress = (allProgressRes.data ?? []) as Array<{
    version_code: string;
    book_slug: string;
    book_name: string;
    chapter_count: number;
    read_chapters: number;
    progress_percent: number;
  }>;

  const progressByKey = new Map(allProgress.map((r) => [`${r.version_code}|${r.book_slug}`, r]));
  const lastByKey = new Map<string, string>();
  for (const r of chaptersForBooksRes.data ?? []) {
    const row = r as { version_code: string; book_slug: string; last_read_at: string };
    const k = `${row.version_code}|${row.book_slug}`;
    const t = row.last_read_at;
    const prev = lastByKey.get(k);
    if (!prev || t > prev) lastByKey.set(k, t);
  }

  let orderedKeys = [...lastByKey.entries()]
    .sort((a, b) => b[1].localeCompare(a[1]))
    .map(([k]) => k);

  if (orderedKeys.length === 0) {
    orderedKeys = allProgress
      .filter((r) => Number(r.read_chapters ?? 0) > 0)
      .sort((a, b) => Number(b.progress_percent ?? 0) - Number(a.progress_percent ?? 0))
      .slice(0, 4)
      .map((r) => `${r.version_code}|${r.book_slug}`);
  }

  const booksProgress = orderedKeys
    .slice(0, 4)
    .map((k) => progressByKey.get(k))
    .filter(Boolean)
    .map((row: any) => ({
      book_name: row.book_name as string,
      chapter_count: Number(row.chapter_count ?? 0),
      read_chapters: Number(row.read_chapters ?? 0),
      progress_percent: Number(row.progress_percent ?? 0),
    }));

  // Siguiente lectura (misma lógica que dashboard web: último capítulo + 1)
  let next_reading: {
    label: string;
    version_code: string;
    book_slug: string;
    chapter: number;
  } = {
    label: 'Génesis 1',
    version_code: 'rv1960',
    book_slug: 'genesis',
    chapter: 1,
  };

  const lr = lastReadRes.data as
    | { version_code: string; book_slug: string; chapter_number: number }
    | null
    | undefined;
  if (lr) {
    const bookMeta = await ctx.client
      .from('bible_books')
      .select('name, chapter_count')
      .eq('version_code', lr.version_code)
      .eq('slug', lr.book_slug)
      .maybeSingle();

    if (!bookMeta.error && bookMeta.data) {
      const name = String(bookMeta.data.name ?? lr.book_slug);
      const nextCh = lr.chapter_number + 1;
      next_reading = {
        label: `${name} ${nextCh}`,
        version_code: lr.version_code,
        book_slug: lr.book_slug,
        chapter: nextCh,
      };
    } else {
      next_reading = {
        label: `${lr.book_slug} ${lr.chapter_number + 1}`,
        version_code: lr.version_code,
        book_slug: lr.book_slug,
        chapter: lr.chapter_number + 1,
      };
    }
  }

  // Logros adicionales: requieren la versión preferida del usuario.
  const preferredVersion = ((settingsRes.data ?? null) as { preferred_version_code?: string } | null)
    ?.preferred_version_code || 'rv1960';

  // Salmista — capítulos leídos de Salmos en la versión preferida vs total del libro.
  const psalmsBookRes = await ctx.client
    .from('bible_books')
    .select('chapter_count')
    .eq('version_code', preferredVersion)
    .eq('slug', 'salmos')
    .maybeSingle();
  const psalmsTotalChapters = (psalmsBookRes.data as { chapter_count?: number } | null)?.chapter_count ?? 150;

  const psalmsReadRes = await ctx.client
    .from('user_chapter_progress')
    .select('*', { head: true, count: 'exact' })
    .eq('version_code', preferredVersion)
    .eq('book_slug', 'salmos');
  const psalmsCompleted = (psalmsReadRes.count ?? 0) >= psalmsTotalChapters;

  // Nuevo Testamento — capítulos leídos vs total de NT en la versión preferida.
  const ntBooksRes = await ctx.client
    .from('bible_books')
    .select('slug, chapter_count')
    .eq('version_code', preferredVersion)
    .eq('testament', 'new');
  const ntBooks = (ntBooksRes.data ?? []) as Array<{ slug: string; chapter_count: number }>;
  const ntTotalChapters = ntBooks.reduce((sum, b) => sum + (b.chapter_count || 0), 0);
  const ntSlugs = ntBooks.map((b) => b.slug);

  let ntReadCount = 0;
  if (ntSlugs.length > 0) {
    const ntReadRes = await ctx.client
      .from('user_chapter_progress')
      .select('*', { head: true, count: 'exact' })
      .eq('version_code', preferredVersion)
      .in('book_slug', ntSlugs);
    ntReadCount = ntReadRes.count ?? 0;
  }
  const ntCompleted = ntTotalChapters > 0 && ntReadCount >= ntTotalChapters;

  return jsonOk(
    {
      chapters_read: chaptersRes.count ?? 0,
      verses_saved: versesRes.count ?? 0,
      streak_days: streak,
      weekly_minutes_current: currentMinutes,
      weekly_minutes_previous: previousMinutes,
      week,
      has_read_today: hasReadToday,
      books_progress: booksProgress,
      next_reading,
      // Datos adicionales para alimentar los 8 logros (paridad con la web):
      active_days: activeDaysRes.count ?? 0,
      psalms_completed: psalmsCompleted,
      nt_completed: ntCompleted,
    },
    { headers: corsHeaders }
  );
}
