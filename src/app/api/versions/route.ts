import { anonClient, corsHeaders, jsonError, jsonOk, preflight } from '@/lib/api/supabaseApi';

export async function OPTIONS() {
  return preflight();
}

export async function GET() {
  const supabase = anonClient();
  const { data, error } = await supabase
    .from('bible_versions')
    .select('code,name,language')
    .order('name');
  if (error) return jsonError(500, error.message);
  return jsonOk(data, { headers: corsHeaders });
}
