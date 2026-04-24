import { corsHeaders, jsonError, jsonOk, preflight, requireUser } from '@/lib/api/supabaseApi';

export async function OPTIONS() {
  return preflight();
}

/**
 * GET /api/user/progress?version=&book=&chapter=
 * Returns whether the current user has recorded this chapter as read (reads_count > 0).
 */
export async function GET(req: Request) {
  const ctx = await requireUser(req);
  if (ctx instanceof Response) return ctx;

  const url = new URL(req.url);
  const version = url.searchParams.get('version');
  const book = url.searchParams.get('book');
  const chapterRaw = url.searchParams.get('chapter');
  if (!version || !book || chapterRaw == null || chapterRaw === '') {
    return jsonError(400, 'Missing version, book or chapter');
  }
  const chapter = Number(chapterRaw);
  if (!Number.isFinite(chapter) || chapter < 1) {
    return jsonError(400, 'Invalid chapter');
  }

  const { data, error } = await ctx.client
    .from('user_chapter_progress')
    .select('reads_count')
    .eq('user_id', ctx.userId)
    .eq('version_code', version)
    .eq('book_slug', book)
    .eq('chapter_number', chapter)
    .maybeSingle();

  if (error) return jsonError(500, error.message);
  const isRead = (data?.reads_count ?? 0) > 0;
  return jsonOk({ isRead }, { headers: corsHeaders });
}

/**
 * POST /api/user/progress
 * body: { version, book, chapter }
 * Marks the chapter as read and adds today to the reading streak.
 */
export async function POST(req: Request) {
  const ctx = await requireUser(req);
  if (ctx instanceof Response) return ctx;

  const body = (await req.json().catch(() => null)) as
    | { version: string; book: string; chapter: number }
    | null;
  if (!body?.version || !body?.book || !body?.chapter) {
    return jsonError(400, 'Missing version, book or chapter');
  }

  const { error } = await ctx.client.rpc('mark_chapter_read', {
    p_version_code: body.version,
    p_book_slug: body.book,
    p_chapter_number: body.chapter,
  });

  if (error) return jsonError(500, error.message);
  return jsonOk({ ok: true }, { headers: corsHeaders });
}
