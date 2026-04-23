import { corsHeaders, jsonError, jsonOk, preflight, requireUser } from '@/lib/api/supabaseApi';

export async function OPTIONS() {
  return preflight();
}

/**
 * POST /api/user/device-tokens
 * body: { token: string, platform: 'ios' | 'android' | 'web' }
 *
 * Requires a table:
 *   user_device_tokens (
 *     user_id uuid,
 *     token text,
 *     platform text,
 *     created_at timestamptz default now(),
 *     primary key (user_id, token)
 *   )
 */
export async function POST(req: Request) {
  const ctx = await requireUser(req);
  if (ctx instanceof Response) return ctx;

  const body = (await req.json().catch(() => null)) as
    | { token: string; platform: string }
    | null;
  if (!body?.token || !body?.platform) {
    return jsonError(400, 'Missing token or platform');
  }

  const { error } = await ctx.client
    .from('user_device_tokens')
    .upsert(
      { user_id: ctx.userId, token: body.token, platform: body.platform },
      { onConflict: 'user_id,token' }
    );

  if (error) return jsonError(500, error.message);
  return jsonOk({ ok: true }, { headers: corsHeaders });
}

export async function DELETE(req: Request) {
  const ctx = await requireUser(req);
  if (ctx instanceof Response) return ctx;

  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  if (!token) return jsonError(400, 'Missing token');

  const { error } = await ctx.client
    .from('user_device_tokens')
    .delete()
    .eq('user_id', ctx.userId)
    .eq('token', token);

  if (error) return jsonError(500, error.message);
  return jsonOk({ ok: true }, { headers: corsHeaders });
}
