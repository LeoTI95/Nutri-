import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Apenas cria o cliente se as variáveis estiverem configuradas
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'nutri-plus-auth',
        flowType: 'pkce'
      }
    })
  : null;

// Helper para verificar se o Supabase está configurado
export const isSupabaseConfigured = () => {
  return supabase !== null;
};

// Helper para verificar autenticação
export const checkAuth = async () => {
  if (!supabase) return null;
  
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};
