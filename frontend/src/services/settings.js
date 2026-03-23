import { supabase, isSupabaseConfigured } from 'lib/supabase';

const KEY_PAYMENT_ENABLED = 'payment_enabled';
const STORAGE_PAYMENT_KEY = 'africadata_payment_enabled';

function getPaymentFromStorage() {
  try {
    const v = localStorage.getItem(STORAGE_PAYMENT_KEY);
    if (v === 'false') return false;
    if (v === 'true') return true;
  } catch (_) {}
  return undefined;
}

function setPaymentInStorage(enabled) {
  try {
    localStorage.setItem(STORAGE_PAYMENT_KEY, enabled ? 'true' : 'false');
  } catch (_) {}
}

/** Récupérer les paramètres plateforme (payment_enabled, etc.) */
export async function getPlatformSettings() {
  if (!isSupabaseConfigured()) {
    const fromStorage = getPaymentFromStorage();
    return { payment_enabled: fromStorage !== undefined ? fromStorage : true, error: null };
  }
  const { data, error } = await supabase
    .from('platform_settings')
    .select('key, value')
    .in('key', [KEY_PAYMENT_ENABLED]);
  if (error) {
    const fromStorage = getPaymentFromStorage();
    return { payment_enabled: fromStorage !== undefined ? fromStorage : true, error };
  }
  const paymentRow = data?.find((r) => r.key === KEY_PAYMENT_ENABLED);
  const payment_enabled = paymentRow?.value === true || paymentRow?.value === 'true';
  return { payment_enabled: payment_enabled !== false, error: null };
}

/** Mettre à jour le paramètre paiement (réservé Super Admin) */
export async function updatePaymentEnabled(enabled) {
  const value = !!enabled;
  setPaymentInStorage(value);
  if (!isSupabaseConfigured()) return { error: null };
  const { error } = await supabase
    .from('platform_settings')
    .upsert(
      { key: KEY_PAYMENT_ENABLED, value, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    );
  if (error) return { error };
  return { error: null };
}
