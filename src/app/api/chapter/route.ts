import { anonClient, corsHeaders, jsonError, jsonOk, preflight } from '@/lib/api/supabaseApi';

const EXTERNAL_API = 'https://bible-api.deno.dev/api';

export async function OPTIONS() {
  return preflight();
}

/**
 * GET /api/chapter?version=rv1960&book=mateo&chapter=4
 *
 * Returns:
 * {
 *   meta: { version_code, book_slug, chapter_number, title, image_url },
 *   verses: [ { number, text }, ... ]
 * }
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const version = searchParams.get('version');
  const book = searchParams.get('book');
  const chapter = Number(searchParams.get('chapter'));

  if (!version || !book || !chapter) {
    return jsonError(400, 'Missing version, book or chapter');
  }

  const supabase = anonClient();

  const [metaRes, versesRes] = await Promise.all([
    supabase
      .from('bible_chapters')
      .select('version_code,book_slug,chapter_number,title,image_url')
      .eq('version_code', version)
      .eq('book_slug', book)
      .eq('chapter_number', chapter)
      .limit(1)
      .maybeSingle(),
    fetch(`${EXTERNAL_API}/read/${version}/${book}/${chapter}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`Upstream ${r.status}`))))
      .catch((e) => ({ error: e.message })),
  ]);

  if (metaRes.error) return jsonError(500, metaRes.error.message);

  const verses = Array.isArray((versesRes as { vers?: unknown[] }).vers)
    ? (versesRes as { vers: Array<{ number: number; verse: string }> }).vers.map((v) => ({
        number: v.number,
        text: v.verse,
      }))
    : [];

  return jsonOk(
    {
      meta: metaRes.data,
      verses,
    },
    { headers: corsHeaders }
  );
}
