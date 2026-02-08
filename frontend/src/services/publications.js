import { supabase, isSupabaseConfigured } from 'lib/supabase';
import { getProfile } from 'services/profile';

function mapPublication(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    author_photo_url: row.author_photo_url || null,
    type: row.type,
    domain: row.domain,
    language: row.language || null,
    region: row.region || null,
    year: row.year || null,
    summary: row.summary || row.abstract || '',
    abstract: row.abstract || row.summary || '',
    pdf_url: row.pdf_url || null,
    views: row.views ?? 0,
    downloads: row.downloads ?? 0,
    rating: Number(row.rating_avg) || 0,
    ratingCount: row.rating_count ?? 0,
    created_at: row.created_at,
  };
}

/**
 * Statistiques publiques pour l'accueil (sans auth).
 * Retourne les comptes réels : publications publiées, utilisateurs, vues, téléchargements.
 */
export async function getPublicStats() {
  if (!isSupabaseConfigured()) return { data: null, error: null };
  const [pubsCountRes, profilesRes, viewsRes] = await Promise.all([
    supabase.from('publications').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('publications').select('views, downloads').eq('status', 'published'),
  ]);
  const totalViews = (viewsRes.data || []).reduce((acc, p) => acc + (Number(p.views) || 0), 0);
  const totalDownloads = (viewsRes.data || []).reduce((acc, p) => acc + (Number(p.downloads) || 0), 0);
  return {
    data: {
      publicationsCount: pubsCountRes.count ?? 0,
      usersCount: profilesRes.count ?? 0,
      totalViews,
      totalDownloads,
    },
    error: pubsCountRes.error || profilesRes.error || viewsRes.error,
  };
}

/**
 * Statistiques de l'utilisateur connecté : mes publications (par statut) et favoris.
 */
export async function getMyPublicationStats(userId) {
  if (!isSupabaseConfigured() || !userId) return { data: null, error: null };
  const [myPubsRes, favRes] = await Promise.all([
    supabase.from('publications').select('id, status').eq('user_id', userId),
    supabase.from('favorites').select('publication_id', { count: 'exact', head: true }).eq('user_id', userId),
  ]);
  const myPubs = myPubsRes.data || [];
  const total = myPubs.length;
  const draft = myPubs.filter((p) => p.status === 'draft').length;
  const published = myPubs.filter((p) => p.status === 'published').length;
  const rejected = myPubs.filter((p) => p.status === 'rejected').length;
  const inReview = myPubs.filter((p) => p.status !== 'draft' && p.status !== 'published' && p.status !== 'rejected').length;
  const inAnalysis = draft + inReview;
  return {
    data: {
      total,
      draft,
      published,
      rejected,
      inAnalysis: inAnalysis || (total - published - rejected),
      favoritesCount: favRes.count ?? 0,
    },
    error: myPubsRes.error || favRes.error,
  };
}

export async function getPublications(filters = {}) {
  if (!isSupabaseConfigured()) return { data: null, error: null };

  let query = supabase
    .from('publications')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (filters.domain) query = query.eq('domain', filters.domain);
  if (filters.type) query = query.eq('type', filters.type);
  if (filters.language) query = query.eq('language', filters.language);
  if (filters.region) query = query.eq('region', filters.region);
  if (filters.year) query = query.eq('year', filters.year);
  if (filters.search && filters.search.trim()) {
    query = query.or(`title.ilike.%${filters.search.trim()}%,author.ilike.%${filters.search.trim()}%,summary.ilike.%${filters.search.trim()}%`);
  }

  const { data, error } = await query;
  return {
    data: (data || []).map(mapPublication),
    error,
  };
}

export async function getPublicationById(id) {
  if (!isSupabaseConfigured()) return { data: null, error: null };

  const { data, error } = await supabase
    .from('publications')
    .select('*')
    .eq('id', id)
    .single();

  return { data: data ? mapPublication(data) : null, error };
}

export async function incrementView(publicationId) {
  if (!isSupabaseConfigured()) return { error: null };
  const { error: rpcError } = await supabase.rpc('increment_views', { pub_id: publicationId });
  if (rpcError) {
    const { data: row } = await supabase.from('publications').select('views').eq('id', publicationId).single();
    if (row != null) {
      await supabase.from('publications').update({ views: (row.views ?? 0) + 1 }).eq('id', publicationId);
    }
  }
  return { error: null };
}

export async function incrementDownload(publicationId) {
  if (!isSupabaseConfigured()) return { error: null };
  const { data: row, error: fetchErr } = await supabase
    .from('publications')
    .select('downloads')
    .eq('id', publicationId)
    .single();
  if (fetchErr || row == null) return { error: fetchErr };
  const { error } = await supabase
    .from('publications')
    .update({ downloads: (row.downloads ?? 0) + 1 })
    .eq('id', publicationId);
  return { error };
}

export async function addRating(publicationId, userId, value) {
  if (!isSupabaseConfigured()) return { error: null };
  const { error } = await supabase
    .from('publication_ratings')
    .upsert({ publication_id: publicationId, user_id: userId, value }, { onConflict: 'publication_id,user_id' });
  return { error };
}

export async function getComments(publicationId) {
  if (!isSupabaseConfigured()) return { data: [], error: null };
  const { data, error } = await supabase
    .from('publication_comments')
    .select('*')
    .eq('publication_id', publicationId)
    .order('created_at', { ascending: true });
  return {
    data: (data || []).map((c) => ({
      id: c.id,
      author: c.author_name,
      date: c.created_at,
      content: c.content,
    })),
    error,
  };
}

export async function addComment(publicationId, userId, authorName, content) {
  if (!isSupabaseConfigured()) return { data: null, error: null };
  const { data, error } = await supabase
    .from('publication_comments')
    .insert({ publication_id: publicationId, user_id: userId, author_name: authorName, content })
    .select()
    .single();
  return {
    data: data ? { id: data.id, author: data.author_name, date: data.created_at, content: data.content } : null,
    error,
  };
}

export async function getFavorites(userId) {
  if (!isSupabaseConfigured() || !userId) return { data: [], error: null };
  const { data, error } = await supabase
    .from('favorites')
    .select('publication_id')
    .eq('user_id', userId);
  return {
    data: (data || []).map((r) => r.publication_id),
    error,
  };
}

export async function toggleFavorite(userId, publicationId) {
  if (!isSupabaseConfigured() || !userId) return { isFavorite: false, error: null };
  const { data: existing } = await supabase
    .from('favorites')
    .select('publication_id')
    .eq('user_id', userId)
    .eq('publication_id', publicationId)
    .maybeSingle();

  if (existing) {
    await supabase.from('favorites').delete().eq('user_id', userId).eq('publication_id', publicationId);
    return { isFavorite: false, error: null };
  }
  await supabase.from('favorites').insert({ user_id: userId, publication_id: publicationId });
  return { isFavorite: true, error: null };
}

const STORAGE_BUCKET = 'publications';

/**
 * Upload un fichier PDF vers Supabase Storage et retourne l'URL publique.
 * Crée un bucket "publications" avec politique de lecture publique si nécessaire.
 * @param {File} file - Fichier PDF
 * @param {string} [userId] - ID utilisateur pour le chemin
 * @returns {{ data: string | null, error: Error | null }}
 */
export async function uploadPublicationPdf(file, userId = 'anonymous') {
  if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase non configuré.') };
  if (!file || file.type !== 'application/pdf') {
    return { data: null, error: new Error('Fichier PDF requis.') };
  }
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100);
  const path = `${userId}/${Date.now()}-${safeName}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { contentType: 'application/pdf', upsert: false });
  if (uploadError) return { data: null, error: uploadError };
  const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(uploadData.path);
  return { data: urlData?.publicUrl ?? null, error: null };
}

/**
 * Upload la photo de l'auteur (optionnel). Stocke dans le bucket publications, chemin author-photos/.
 * @param {File} file - Image (JPEG, PNG, WebP)
 * @param {string} [userId] - ID utilisateur pour le chemin
 * @returns {{ data: string | null, error: Error | null }}
 */
export async function uploadAuthorPhoto(file, userId = 'anonymous') {
  if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase non configuré.') };
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!file || !allowed.includes(file.type)) {
    return { data: null, error: new Error('Format accepté : JPG, PNG ou WebP.') };
  }
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `author-photos/${userId}/${Date.now()}-author.${ext}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) return { data: null, error: uploadError };
  const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(uploadData.path);
  return { data: urlData?.publicUrl ?? null, error: null };
}

export async function createPublication(payload) {
  if (!isSupabaseConfigured()) return { data: null, error: new Error('Supabase non configuré.') };
  const { data: { user } } = await supabase.auth.getUser();
  const status = payload.status === 'published' ? 'published' : 'draft';
  let authorPhotoUrl = payload.author_photo_url || null;
  if (!authorPhotoUrl && user?.id) {
    const { data: profile } = await getProfile(user.id);
    authorPhotoUrl = profile?.avatar_url || null;
  }
  const { data, error } = await supabase
    .from('publications')
    .insert({
      user_id: user?.id ?? null,
      title: payload.title,
      author: payload.author,
      author_photo_url: authorPhotoUrl,
      type: payload.type || 'Article',
      domain: payload.domain || 'Sciences économiques',
      language: payload.language || null,
      region: payload.region || null,
      year: payload.year || new Date().getFullYear().toString(),
      summary: payload.summary || payload.description || '',
      abstract: payload.abstract || payload.summary || payload.description || '',
      pdf_url: payload.pdf_url || null,
      status,
    })
    .select()
    .single();
  return { data: data ? mapPublication(data) : null, error };
}

/**
 * Abonnement Realtime aux changements sur les publications publiées (nouvelle publication ou mise à jour).
 * Utile pour actualiser la librairie et l'accueil sans recharger la page.
 * @param {(payload: { event: 'INSERT'|'UPDATE'|'DELETE', new?: object, old?: object }) => void} onPayload
 * @returns {() => void} fonction pour se désabonner
 */
export function subscribeToPublications(onPayload) {
  if (!supabase || !onPayload) return () => {};
  const channel = supabase
    .channel('publications-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'publications',
      },
      (payload) => {
        const newRow = payload.new;
        const status = newRow?.status;
        if (payload.eventType === 'INSERT' && status === 'published') {
          onPayload({ event: 'INSERT', new: newRow });
        }
        if (payload.eventType === 'UPDATE' && status === 'published') {
          onPayload({ event: 'UPDATE', new: newRow });
        }
        if (payload.eventType === 'DELETE') {
          onPayload({ event: 'DELETE', old: payload.old });
        }
      }
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

export async function getRecommendations(publicationId, domain, typeDoc, max = 4) {
  if (!isSupabaseConfigured()) return { data: [], error: null };
  const { data: byDomain } = await supabase
    .from('publications')
    .select('*')
    .eq('status', 'published')
    .eq('domain', domain)
    .neq('id', publicationId)
    .limit(max);
  const seen = new Set((byDomain || []).map((p) => p.id));
  let result = (byDomain || []).map(mapPublication);
  if (result.length < max && typeDoc) {
    const { data: byType } = await supabase
      .from('publications')
      .select('*')
      .eq('status', 'published')
      .eq('type', typeDoc)
      .neq('id', publicationId)
      .limit(max + 5);
    for (const p of byType || []) {
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      result.push(mapPublication(p));
      if (result.length >= max) break;
    }
  }
  return { data: result.slice(0, max), error: null };
}
