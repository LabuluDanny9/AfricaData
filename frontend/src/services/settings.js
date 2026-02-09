import { supabase, isSupabaseConfigured } from 'lib/supabase';

const KEY_PAYMENT_ENABLED = 'payment_enabled';

/** Récupérer les paramètres plateforme (payment_enabled, etc.) */
export async function getPlatformSettings() {
  if (!isSupabaseConfigured()) {
    return { payment_enabled: true, error: null };
  }
  const { data, error } = await supabase
    .from('platform_settings')
    .select('key, value')
    .in('key', [KEY_PAYMENT_ENABLED]);
  if (error) return { payment_enabled: true, error };
  const paymentRow = data?.find((r) => r.key === KEY_PAYMENT_ENABLED);
  const payment_enabled = paymentRow?.value === true || paymentRow?.value === 'true';
  return { payment_enabled: payment_enabled !== false, error: null };
}

/** Mettre à jour le paramètre paiement (réservé Super Admin) */
export async function updatePaymentEnabled(enabled) {
  if (!isSupabaseConfigured()) return { error: new Error('Non configuré.') };
  const { error } = await supabase
    .from('platform_settings')
    .upsert(
      { key: KEY_PAYMENT_ENABLED, value: !!enabled, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    );
  return { error };
}
