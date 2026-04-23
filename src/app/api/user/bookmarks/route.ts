import { corsHeaders, jsonError, jsonOk, preflight, requireUser } from '@/lib/api/supabaseApi';

export async function OPTIONS() {
  return preflight();
}

export async function GET(req: Request) {
  const ctx = await requireUser(req);
  if (ctx instanceof Response) return ctx;

  const { data, error } = await ctx.client
    .from('user_verse_bookmarks')
    .select('version_code,book_slug,chapter_number,verse_number,note,created_at')
    .order('created_at', { ascending: false });

  if (error) return jsonError(500, error.message);
  return jsonOk(data, { headers: corsHeaders });
}

export async function POST(req: Request) {
  const ctx = await requireUser(req);
  if (ctx instanceof Response) return ctx;

  const body = (await req.json().catch(() => null)) as
    | { version: string; book: string; chapter: number; verse: number; note?: string }
    | null;
  if (!body?.version || !body?.book || !body?.chapter || !body?.verse) {
    return jsonError(400, 'Missing version, book, chapter or verse');
  }

  const { data, error } = await ctx.client.rpc('toggle_verse_bookmark', {
    p_version_code: body.version,
    p_book_slug: body.book,
    p_chapter_number: body.chapter,
    p_verse_number: body.verse,
  });

  if (error) return jsonError(500, error.message);
  return jsonOk({ isBookmarked: data }, { headers: corsHeaders });
}
