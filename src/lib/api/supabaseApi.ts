import { NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

export function jsonError(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

/**
 * Anonymous server client — use for unauthenticated routes (public bible catalog).
 */
export function anonClient(): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Extract the bearer token from the request and return a Supabase client
 * bound to that user — RLS will execute as them.
 *
 * Returns `null` when the caller is not authenticated.
 */
export async function userClient(
  req: Request
): Promise<{ client: SupabaseClient; userId: string } | null> {
  const auth = req.headers.get('authorization');
  if (!auth?.toLowerCase().startsWith('bearer ')) return null;
  const token = auth.slice(7).trim();
  if (!token) return null;

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) return null;
  return { client, userId: data.user.id };
}

export async function requireUser(
  req: Request
): Promise<{ client: SupabaseClient; userId: string } | Response> {
  const ctx = await userClient(req);
  if (!ctx) return jsonError(401, 'Unauthorized');
  return ctx;
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function preflight() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}
