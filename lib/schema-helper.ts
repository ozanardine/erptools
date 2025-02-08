import { supabase } from './supabase';

export async function getUserSchema() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Não autenticado');
  
  return `client_${session.user.id.replace(/-/g, '_')}`;
}

export async function queryUserSchema(table: string) {
  const schema = await getUserSchema();
  return supabase.schema(schema).from(table);
}