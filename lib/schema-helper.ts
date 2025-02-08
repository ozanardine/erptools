import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function getUserSchema() {
  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Não autenticado');
  
  return `client_${session.user.id.replace(/-/g, '_')}`;
}

export function getSupabaseClient() {
  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}

export async function queryUserSchema(table: string) {
  const schema = await getUserSchema();
  const supabase = getSupabaseClient();
  return supabase.from(`${schema}.${table}`);
}