import { supabase, isSupabaseConfigured } from 'lib/supabase';

/**
 * Récupère les notifications de l'utilisateur (plus récentes en premier).
 * @param {string} userId
 * @param {{ limit?: number }} options
 */
export async function getNotifications(userId, options = {}) {
  if (!isSupabaseConfigured() || !userId) return { data: [], error: null };
  const limit = options.limit ?? 50;
  const { data, error } = await supabase
    .from('notifications')
    .select('id, type, title, message, publication_id, read_at, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return {
    data: (data || []).map((row) => ({
      id: row.id,
      type: row.type,
      title: row.title,
      message: row.message,
      publicationId: row.publication_id,
      readAt: row.read_at,
      createdAt: row.created_at,
    })),
    error,
  };
}

/**
 * Marque une notification comme lue.
 * @param {string} notificationId
 * @param {string} userId — pour vérifier que la notification appartient à l'utilisateur
 */
export async function markNotificationAsRead(notificationId, userId) {
  if (!isSupabaseConfigured() || !userId || !notificationId) return { error: null };
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', userId);
  return { error };
}

/**
 * Marque toutes les notifications de l'utilisateur comme lues.
 * @param {string} userId
 */
export async function markAllNotificationsAsRead(userId) {
  if (!isSupabaseConfigured() || !userId) return { error: null };
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('read_at', null);
  return { error };
}

/**
 * Abonnement Realtime aux nouvelles notifications pour un utilisateur.
 * @param {string} userId
 * @param {(payload) => void} onNotification
 * @returns {() => void} fonction pour se désabonner
 */
export function subscribeToNotifications(userId, onNotification) {
  if (!supabase || !userId) return () => {};
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        const row = payload.new;
        if (row && onNotification) {
          onNotification({
            id: row.id,
            type: row.type,
            title: row.title,
            message: row.message,
            publicationId: row.publication_id,
            readAt: row.read_at,
            createdAt: row.created_at,
          });
        }
      }
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
