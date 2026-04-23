import { anonClient, corsHeaders, jsonError, jsonOk, preflight } from '@/lib/api/supabaseApi';

export async function OPTIONS() {
  return preflight();
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const version = searchParams.get('version') ?? 'rv1960';

  const supabase = anonClient();
  const { data, error } = await supabase
    .from('bible_books')
    .select('version_code,slug,name,testament,book_order,chapter_count')
    .eq('version_code', version)
    .order('book_order');

  if (error) return jsonError(500, error.message);
  return jsonOk(data, { headers: corsHeaders });
}
