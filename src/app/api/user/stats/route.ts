import { corsHeaders, jsonError, jsonOk, preflight, requireUser } from '@/lib/api/supabaseApi';

export async function OPTIONS() {
  return preflight();
}

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
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
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 6);
  const twoWeeksAgo = new Date(today);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 13);

  const [chaptersRes, versesRes, daysRes, recentRes] = await Promise.all([
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
      .limit(60),
    ctx.client
      .from('user_chapter_progress')
      .select('last_read_at')
      .gte('last_read_at', twoWeeksAgo.toISOString()),
  ]);

  if (chaptersRes.error) return jsonError(500, chaptersRes.error.message);
  if (versesRes.error) return jsonError(500, versesRes.error.message);
  if (daysRes.error) return jsonError(500, daysRes.error.message);
  if (recentRes.error) return jsonError(500, recentRes.error.message);

  // Streak calculation
  const days = (daysRes.data ?? [])
    .map((r) => new Date(`${r.day}T00:00:00`))
    .sort((a, b) => b.getTime() - a.getTime());
  let streak = 0;
  let cursor = new Date(today);
  for (const d of days) {
    if (isoDate(d) === isoDate(cursor)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else if (d < cursor) {
      break;
    }
  }

  // Weekly minutes approximation: 4 min per chapter read.
  const recent = recentRes.data ?? [];
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 6);
  const currentMinutes =
    recent.filter((r) => new Date(r.last_read_at) >= weekAgo).length * 4;
  const previousMinutes =
    recent.filter((r) => new Date(r.last_read_at) < weekAgo).length * 4;

  // Reading week (7-day grid)
  const readSet = new Set((daysRes.data ?? []).map((r) => r.day));
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return {
      day: isoDate(d),
      weekday: ['L', 'M', 'M', 'J', 'V', 'S', 'D'][(d.getDay() + 6) % 7],
      is_read: readSet.has(isoDate(d)),
      is_today: isoDate(d) === isoDate(today),
    };
  });

  return jsonOk(
    {
      chapters_read: chaptersRes.count ?? 0,
      verses_saved: versesRes.count ?? 0,
      streak_days: streak,
      weekly_minutes_current: currentMinutes,
      weekly_minutes_previous: previousMinutes,
      week,
    },
    { headers: corsHeaders }
  );
}
