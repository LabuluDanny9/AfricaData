import { supabase, isSupabaseConfigured } from 'lib/supabase';

/** Récupérer toutes les normes par domaine */
export async function getDomainNorms() {
  if (!isSupabaseConfigured()) return { data: [], error: null };
  const { data, error } = await supabase
    .from('domain_norms')
    .select('domain, content, updated_at')
    .order('domain');
  return { data: data || [], error };
}

/** Récupérer les normes d'un domaine */
export async function getDomainNorm(domain) {
  if (!isSupabaseConfigured() || !domain) return { data: null, error: null };
  const { data, error } = await supabase
    .from('domain_norms')
    .select('domain, content, updated_at')
    .eq('domain', domain)
    .maybeSingle();
  return { data, error };
}

/** Mettre à jour les normes d'un domaine (réservé Super Admin) */
export async function updateDomainNorm(domain, content) {
  if (!isSupabaseConfigured() || !domain) return { error: new Error('Domaine requis.') };
  const { error } = await supabase
    .from('domain_norms')
    .upsert({ domain, content: content || '', updated_at: new Date().toISOString() }, { onConflict: 'domain' });
  return { error };
}
