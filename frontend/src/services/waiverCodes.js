import { supabase, isSupabaseConfigured } from 'lib/supabase';

/** Vérifier si un code de publication gratuite est valide (non encore utilisé) */
export async function checkWaiverCode(code) {
  if (!isSupabaseConfigured()) return { valid: false, error: new Error('Non configuré.') };
  const trimmed = typeof code === 'string' ? code.trim() : '';
  if (!trimmed) return { valid: false, error: null };
  const { data, error } = await supabase.rpc('check_waiver_code', { p_code: trimmed });
  return { valid: data === true, error };
}

/** Utiliser un code (le marquer comme utilisé). À appeler au moment de la soumission. */
export async function consumeWaiverCode(code) {
  if (!isSupabaseConfigured()) return { success: false, error: new Error('Non configuré.') };
  const trimmed = typeof code === 'string' ? code.trim() : '';
  if (!trimmed) return { success: false, error: new Error('Code requis.') };
  const { data, error } = await supabase.rpc('use_waiver_code', { p_code: trimmed });
  return { success: data === true, error };
}
