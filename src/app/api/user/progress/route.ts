import { corsHeaders, jsonError, jsonOk, preflight, requireUser } from '@/lib/api/supabaseApi';

export async function OPTIONS() {
  return preflight();
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
