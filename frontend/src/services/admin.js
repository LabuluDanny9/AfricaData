import { supabase, isSupabaseConfigured } from 'lib/supabase';
import { isRootSuperadminEmail } from 'lib/adminRoles';

// ========== Dashboard (GET /api/admin/dashboard) ==========
export async function getAdminStats() {
  if (!isSupabaseConfigured()) return { data: null, error: null };
  const [profilesRes, pubsRes, draftRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('publications').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('publications').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
  ]);
  return {
    data: {
      usersCount: profilesRes.count ?? 0,
      publicationsCount: pubsRes.count ?? 0,
      draftCount: draftRes.count ?? 0,
    },
    error: profilesRes.error || pubsRes.error || draftRes.error,
  };
}

/** Alias API: GET /api/admin/dashboard */
export async function getAdminDashboard() {
  return getAdminStats();
}

/** Statistiques étendues pour la page Statistiques (KPI cohérents avec les données) */
export async function getAdminStatistics() {
  if (!isSupabaseConfigured()) return { data: null, error: null };
  const [statsRes, pubsRes] = await Promise.all([
    getAdminStats(),
    supabase.from('publications').select('views, downloads').eq('status', 'published'),
  ]);
  const stats = statsRes.data;
  const pubs = pubsRes.data || [];
  const totalViews = pubs.reduce((acc, p) => acc + (Number(p.views) || 0), 0);
  const totalDownloads = pubs.reduce((acc, p) => acc + (Number(p.downloads) || 0), 0);
  return {
    data: stats ? {
      usersCount: stats.usersCount,
      publicationsCount: stats.publicationsCount,
      draftCount: stats.draftCount,
      totalViews,
      totalDownloads,
    } : null,
    error: statsRes.error || pubsRes.error,
  };
}

/** Publications par domaine (pour graphique « Activité par domaine ») */
export async function getAdminStatsByDomain() {
  if (!isSupabaseConfigured()) return { data: [], error: null };
  const { data, error } = await supabase
    .from('publications')
    .select('domain')
    .eq('status', 'published');
  if (error) return { data: [], error };
  const byDomain = {};
  (data || []).forEach((p) => {
    const d = p.domain || 'Non renseigné';
    byDomain[d] = (byDomain[d] || 0) + 1;
  });
  const result = Object.entries(byDomain)
    .map(([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count);
  return { data: result, error: null };
}

/** Tendance mensuelle : soumissions et publications par mois (pour courbe) */
export async function getAdminMonthlyTrend(monthsBack = 12) {
  if (!isSupabaseConfigured()) return { data: [], error: null };
  const { data, error } = await supabase
    .from('publications')
    .select('created_at, status')
    .order('created_at', { ascending: true });
  if (error) return { data: [], error };
  const now = new Date();
  const monthKeys = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthKeys.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      label: d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
    });
  }
  const byMonth = {};
  monthKeys.forEach((m) => {
    byMonth[m.key] = { ...m, soumissions: 0, publiees: 0, brouillons: 0, rejetees: 0 };
  });
  (data || []).forEach((p) => {
    const created = p.created_at ? new Date(p.created_at) : null;
    if (!created) return;
    const key = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, '0')}`;
    if (!byMonth[key]) return;
    byMonth[key].soumissions += 1;
    if (p.status === 'published') byMonth[key].publiees += 1;
    else if (p.status === 'draft') byMonth[key].brouillons += 1;
    else if (p.status === 'rejected') byMonth[key].rejetees += 1;
  });
  const result = monthKeys.map((k) => byMonth[k.key]);
  return { data: result, error: null };
}

// ========== Publications ==========
/** GET /api/admin/publications */
export async function getAllPublicationsForAdmin() {
  if (!isSupabaseConfigured()) return { data: [], error: null };
  const { data, error } = await supabase
    .from('publications')
    .select('id, title, author, author_photo_url, type, domain, status, views, downloads, pdf_url, summary, admin_comment, admin_recommendations, reference_code, user_id, created_at, payment_proof_url, payment_proof_confirmed, payment_proof_confirmed_at')
    .neq('status', 'deleted')
    .order('created_at', { ascending: false });
  return { data: data || [], error };
}

/**
 * Confirme la preuve de paiement d'une publication (paramètre de base avant étude complète).
 * À appeler par l'admin après vérification du justificatif.
 * @param {string} publicationId
 */
export async function confirmPaymentProof(publicationId) {
  if (!isSupabaseConfigured()) return { error: new Error('Non configuré.') };
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase
    .from('publications')
    .update({
      payment_proof_confirmed: true,
      payment_proof_confirmed_at: new Date().toISOString(),
      payment_proof_confirmed_by: user?.id ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', publicationId);
  return { error };
}

/** GET /api/admin/publications/:id */
export async function getAdminPublicationById(id) {
  if (!isSupabaseConfigured()) return { data: null, error: null };
  const { data, error } = await supabase
    .from('publications')
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
}

/** PUT /api/admin/publications/:id/validate */
export async function validatePublication(id) {
  return updatePublicationStatus(id, 'published');
}

/** PUT /api/admin/publications/:id/reject */
export async function rejectPublication(id) {
  return updatePublicationStatus(id, 'rejected');
}

/** DELETE /api/admin/publications/:id */
export async function deletePublication(id) {
  if (!isSupabaseConfigured()) return { error: new Error('Non configuré.') };
  const { error } = await supabase
    .from('publications')
    .update({ status: 'deleted', updated_at: new Date().toISOString() })
    .eq('id', id);
  return { error };
}

/**
 * Met à jour le statut d'une publication. En cas de rejet, enregistre motifs et recommandations.
 * @param {string} publicationId
 * @param {string} status - 'draft' | 'published' | 'rejected'
 * @param {string} [adminComment] - motifs du rejet (obligatoire si rejet)
 * @param {string} [adminRecommendations] - recommandations pour resoumission (optionnel)
 */
export async function updatePublicationStatus(publicationId, status, adminComment = null, adminRecommendations = null) {
  if (!isSupabaseConfigured()) return { error: new Error('Non configuré.') };
  const updates = { status, updated_at: new Date().toISOString() };
  if (status === 'rejected') {
    if (adminComment != null) updates.admin_comment = adminComment;
    if (adminRecommendations != null) updates.admin_recommendations = adminRecommendations;
  } else {
    updates.admin_comment = null;
    updates.admin_recommendations = null;
  }
  const { error } = await supabase
    .from('publications')
    .update(updates)
    .eq('id', publicationId);
  return { error };
}

/**
 * Déclencher l'envoi d'un email à l'auteur avec la cause du rejet (à appeler après updatePublicationStatus(..., 'rejected', comment)).
 * Nécessite une Edge Function "send-rejection-email" déployée et configurée (voir backend/supabase/GUIDE-EMAIL-REJET.md).
 */
export async function notifyPublicationRejected(publicationId) {
  if (!isSupabaseConfigured()) return { error: null };
  try {
    const { data, error } = await supabase.functions.invoke('send-rejection-email', {
      body: { publicationId },
    });
    if (error) return { error };
    return { data, error: null };
  } catch (err) {
    return { error: err };
  }
}

/**
 * Déclencher l'envoi de l'email de validation officielle à l'auteur (à appeler après updatePublicationStatus(..., 'published')).
 * Nécessite une Edge Function "send-validation-email" déployée (voir backend/supabase/GUIDE-EMAIL-VALIDATION-REJET.md).
 */
export async function notifyPublicationValidated(publicationId) {
  if (!isSupabaseConfigured()) return { error: null };
  try {
    const { data, error } = await supabase.functions.invoke('send-validation-email', {
      body: { publicationId },
    });
    if (error) return { error };
    return { data, error: null };
  } catch (err) {
    return { error: err };
  }
}

/** PATCH /api/admin/publications/:id — mise à jour métadonnées (titre, domaine, type) */
export async function updatePublicationMetadata(publicationId, payload) {
  if (!isSupabaseConfigured()) return { error: new Error('Non configuré.') };
  const updates = { updated_at: new Date().toISOString() };
  if (payload.title !== undefined) updates.title = payload.title;
  if (payload.domain !== undefined) updates.domain = payload.domain;
  if (payload.type !== undefined) updates.type = payload.type;
  if (payload.author !== undefined) updates.author = payload.author;
  const { error } = await supabase
    .from('publications')
    .update(updates)
    .eq('id', publicationId);
  return { error };
}

// ========== Utilisateurs (GET /api/admin/users, etc.) ==========
/** GET /api/admin/users */
export async function getAllProfiles() {
  if (!isSupabaseConfigured()) return { data: [], error: null };
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .order('created_at', { ascending: false });
  return { data: data || [], error };
}

export async function getAdminUsers() {
  return getAllProfiles();
}

/** PUT /api/admin/users/:id/suspend — à implémenter (champ suspended ou ban) */
export async function suspendUser(id) {
  if (!isSupabaseConfigured()) return { error: new Error('Non configuré.') };
  const { error } = await supabase
    .from('profiles')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', id);
  return { error };
}

const ALLOWED_ROLES = ['chercheur', 'lecteur', 'editeur', 'institution', 'admin', 'admin_editorial', 'moderator'];

/** PUT /api/admin/users/:id/role */
export async function updateUserRole(id, role) {
  if (!isSupabaseConfigured()) return { error: new Error('Non configuré.') };
  const roleValue = typeof role === 'string' ? role.trim() : '';
  if (!roleValue || !ALLOWED_ROLES.includes(roleValue)) {
    return { error: new Error(`Rôle invalide. Valeurs autorisées : ${ALLOWED_ROLES.join(', ')}`) };
  }
  const { data: target, error: fetchErr } = await supabase.from('profiles').select('email').eq('id', id).maybeSingle();
  if (fetchErr) return { error: fetchErr };
  if (target && isRootSuperadminEmail(target.email) && roleValue !== 'admin') {
    return { error: new Error('Le super administrateur principal ne peut pas être rétrogradé.') };
  }
  const { error } = await supabase
    .from('profiles')
    .update({ role: roleValue, updated_at: new Date().toISOString() })
    .eq('id', id);
  return { error };
}

/** DELETE /api/admin/users/:id — suppression du profil (auth.users géré côté Supabase Dashboard) */
export async function deleteUser(id) {
  if (!isSupabaseConfigured()) return { error: new Error('Non configuré.') };
  const { data: target, error: fetchErr } = await supabase.from('profiles').select('email').eq('id', id).maybeSingle();
  if (fetchErr) return { error: fetchErr };
  if (target && isRootSuperadminEmail(target.email)) {
    return { error: new Error('Le super administrateur principal ne peut pas être supprimé.') };
  }
  const { error } = await supabase.from('profiles').delete().eq('id', id);
  return { error };
}

// ========== Commentaires modération ==========
/** GET /api/admin/comments */
export async function getAdminComments() {
  if (!isSupabaseConfigured()) return { data: [], error: null };
  const { data, error } = await supabase
    .from('publication_comments')
    .select('id, publication_id, user_id, author_name, content, hidden, created_at, publications(title)')
    .order('created_at', { ascending: false });
  return { data: data || [], error };
}

/** PUT /api/admin/comments/:id/hide */
export async function hideComment(id) {
  if (!isSupabaseConfigured()) return { error: new Error('Non configuré.') };
  const { error } = await supabase
    .from('publication_comments')
    .update({ hidden: true })
    .eq('id', id);
  return { error };
}

/** DELETE /api/admin/comments/:id */
export async function deleteComment(id) {
  if (!isSupabaseConfigured()) return { error: new Error('Non configuré.') };
  const { error } = await supabase.from('publication_comments').delete().eq('id', id);
  return { error };
}

// ========== Paiements ==========
/** GET /api/admin/payments */
export async function getAdminPayments() {
  if (!isSupabaseConfigured()) return { data: [], error: null };
  return { data: [], error: null };
}

// ========== Codes de publication gratuite (Super Admin) ==========
/** GET /api/admin/waiver-codes */
export async function getWaiverCodes(limit = 50) {
  if (!isSupabaseConfigured()) return { data: [], error: null };
  const { data, error } = await supabase
    .from('waiver_codes')
    .select('id, code, created_by, used_at, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  return { data: data || [], error };
}

/** POST Générer un nouveau code (RPC) */
export async function generateWaiverCode() {
  if (!isSupabaseConfigured()) return { data: null, error: new Error('Non configuré.') };
  const { data, error } = await supabase.rpc('generate_waiver_code');
  return { data, error };
}

// ========== Audit logs ==========
/** GET /api/admin/audit-logs */
export async function getAuditLogs(limit = 100) {
  if (!isSupabaseConfigured()) return { data: [], error: null };
  const { data, error } = await supabase
    .from('audit_logs')
    .select('id, admin_id, action, target_type, target_id, ip, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  return { data: data || [], error };
}
