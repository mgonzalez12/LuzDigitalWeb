import { corsHeaders, jsonError, jsonOk, preflight, requireUser } from '@/lib/api/supabaseApi';

export async function OPTIONS() {
  return preflight();
}

export async function GET(req: Request) {
  const ctx = await requireUser(req);
  if (ctx instanceof Response) return ctx;

  const { data, error } = await ctx.client
    .from('user_settings')
    .select('*')
    .eq('user_id', ctx.userId)
    .maybeSingle();

  if (error) return jsonError(500, error.message);
  return jsonOk(data, { headers: corsHeaders });
}

export async function PUT(req: Request) {
  const ctx = await requireUser(req);
  if (ctx instanceof Response) return ctx;

  const body = (await req.json().catch(() => null)) as
    | {
        preferred_version_code?: string;
        sounds_enabled?: boolean;
        reminders_enabled?: boolean;
        reminder_time?: string;
      }
    | null;
  if (!body) return jsonError(400, 'Invalid JSON body');

  const { data: current } = await ctx.client
    .from('user_settings')
    .select('*')
    .eq('user_id', ctx.userId)
    .maybeSingle();

  const merged = {
    user_id: ctx.userId,
    preferred_version_code: body.preferred_version_code ?? current?.preferred_version_code ?? 'rv1960',
    sounds_enabled: body.sounds_enabled ?? current?.sounds_enabled ?? true,
    reminders_enabled: body.reminders_enabled ?? current?.reminders_enabled ?? true,
    reminder_time: body.reminder_time ?? current?.reminder_time ?? '09:00',
  };

  const { data, error } = await ctx.client
    .from('user_settings')
    .upsert(merged, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) return jsonError(500, error.message);
  return jsonOk(data, { headers: corsHeaders });
}
