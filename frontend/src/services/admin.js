import { supabase, isSupabaseConfigured } from 'lib/supabase';

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

// ========== Publications ==========
/** GET /api/admin/publications */
export async function getAllPublicationsForAdmin() {
  if (!isSupabaseConfigured()) return { data: [], error: null };
  const { data, error } = await supabase
    .from('publications')
    .select('id, title, author, type, domain, status, views, downloads, pdf_url, created_at')
    .order('created_at', { ascending: false });
  return { data: data || [], error };
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
  const { error } = await supabase.from('publications').delete().eq('id', id);
  return { error };
}

export async function updatePublicationStatus(publicationId, status) {
  if (!isSupabaseConfigured()) return { error: new Error('Non configuré.') };
  const { error } = await supabase
    .from('publications')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', publicationId);
  return { error };
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
  const { error } = await supabase
    .from('profiles')
    .update({ role: roleValue, updated_at: new Date().toISOString() })
    .eq('id', id);
  return { error };
}

/** DELETE /api/admin/users/:id — suppression du profil (auth.users géré côté Supabase Dashboard) */
export async function deleteUser(id) {
  if (!isSupabaseConfigured()) return { error: new Error('Non configuré.') };
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
