import { corsHeaders, jsonError, jsonOk, preflight, requireUser } from '@/lib/api/supabaseApi';

export async function OPTIONS() {
  return preflight();
}

/**
 * POST /api/user/reading-day
 * body: { day?: "YYYY-MM-DD" } — por defecto hoy (UTC, alineado con la web).
 * Inserta en user_reading_days (idempotente: duplicado PK → ok).
 */
export async function POST(req: Request) {
  const ctx = await requireUser(req);
  if (ctx instanceof Response) return ctx;

  const body = (await req.json().catch(() => ({}))) as { day?: string };
  const day = (body.day && /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(body.day)
    ? body.day
    : new Date().toISOString().slice(0, 10)) as string;

  const { error } = await ctx.client.from('user_reading_days').insert({
    user_id: ctx.userId,
    day,
  });

  if (error && (error as { code?: string }).code !== '23505') {
    return jsonError(500, error.message);
  }
  return jsonOk({ ok: true }, { headers: corsHeaders });
}
