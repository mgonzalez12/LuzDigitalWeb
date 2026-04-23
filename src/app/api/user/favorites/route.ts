import { corsHeaders, jsonError, jsonOk, preflight, requireUser } from '@/lib/api/supabaseApi';

export async function OPTIONS() {
  return preflight();
}

export async function GET(req: Request) {
  const ctx = await requireUser(req);
  if (ctx instanceof Response) return ctx;

  const { data, error } = await ctx.client
    .from('user_chapter_favorites')
    .select('version_code,book_slug,chapter_number,created_at')
    .order('created_at', { ascending: false });

  if (error) return jsonError(500, error.message);
  return jsonOk(data, { headers: corsHeaders });
}

export async function POST(req: Request) {
  const ctx = await requireUser(req);
  if (ctx instanceof Response) return ctx;

  const body = (await req.json().catch(() => null)) as
    | { version: string; book: string; chapter: number }
    | null;
  if (!body?.version || !body?.book || !body?.chapter) {
    return jsonError(400, 'Missing version, book or chapter');
  }

  const { data, error } = await ctx.client.rpc('toggle_chapter_favorite', {
    p_version_code: body.version,
    p_book_slug: body.book,
    p_chapter_number: body.chapter,
  });

  if (error) return jsonError(500, error.message);
  return jsonOk({ isFavorite: data }, { headers: corsHeaders });
}
