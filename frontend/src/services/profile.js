import { supabase, isSupabaseConfigured } from 'lib/supabase';

const AVATARS_BUCKET = 'avatars';

function mapProfile(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email ?? null,
    full_name: row.full_name ?? null,
    avatar_url: row.avatar_url ?? null,
    bio: row.bio ?? null,
    phone: row.phone ?? null,
    location: row.location ?? null,
    website: row.website ?? null,
    linkedin_url: row.linkedin_url ?? null,
    twitter_url: row.twitter_url ?? null,
    institution: row.institution ?? null,
    domain_interest: row.domain_interest ?? null,
    role: row.role ?? 'chercheur',
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function getProfile(userId) {
  if (!isSupabaseConfigured() || !userId) return { data: null, error: null };
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data: data ? mapProfile(data) : null, error };
}

export async function updateProfile(userId, payload) {
  if (!isSupabaseConfigured() || !userId) return { data: null, error: new Error('Non configuré ou utilisateur manquant.') };
  const updates = {
    id: userId,
    updated_at: new Date().toISOString(),
  };
  if (payload.full_name !== undefined) updates.full_name = payload.full_name;
  if (payload.email !== undefined) updates.email = payload.email;
  if (payload.avatar_url !== undefined) updates.avatar_url = payload.avatar_url;
  if (payload.bio !== undefined) updates.bio = payload.bio;
  if (payload.phone !== undefined) updates.phone = payload.phone;
  if (payload.location !== undefined) updates.location = payload.location;
  if (payload.website !== undefined) updates.website = payload.website;
  if (payload.linkedin_url !== undefined) updates.linkedin_url = payload.linkedin_url;
  if (payload.twitter_url !== undefined) updates.twitter_url = payload.twitter_url;
  if (payload.institution !== undefined) updates.institution = payload.institution;
  if (payload.domain_interest !== undefined) updates.domain_interest = payload.domain_interest;
  if (payload.role !== undefined) updates.role = payload.role;

  const { data, error } = await supabase
    .from('profiles')
    .upsert(updates, { onConflict: 'id' })
    .select()
    .single();
  return { data: data ? mapProfile(data) : null, error };
}

/**
 * Upload une photo de profil (image) vers le bucket Supabase "avatars".
 * Retourne l'URL publique. Formats acceptés : image/jpeg, image/png, image/webp.
 */
export async function uploadAvatar(file, userId) {
  if (!isSupabaseConfigured() || !userId) return { data: null, error: new Error('Non configuré ou utilisateur manquant.') };
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!file || !allowed.includes(file.type)) {
    return { data: null, error: new Error('Format accepté : JPG, PNG ou WebP.') };
  }
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${userId}/${Date.now()}-avatar.${ext}`;

  let uploadData;
  let uploadError;
  ({ data: uploadData, error: uploadError } = await supabase.storage
    .from(AVATARS_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: true }));

  if (uploadError) {
    const isBucketNotFound = uploadError.message?.toLowerCase?.().includes('bucket') && uploadError.message?.toLowerCase?.().includes('not found');
    if (isBucketNotFound) {
      const { error: createErr } = await supabase.storage.createBucket(AVATARS_BUCKET, { public: true });
      if (!createErr) {
        ({ data: uploadData, error: uploadError } = await supabase.storage
          .from(AVATARS_BUCKET)
          .upload(path, file, { contentType: file.type, upsert: true }));
      }
      if (uploadError) {
        const msg = 'Le bucket "avatars" n\'existe pas. Créez-le dans Supabase : Storage → New bucket → nom "avatars" → Public. Voir backend/supabase/STORAGE-SETUP.md';
        return { data: null, error: { ...uploadError, message: msg } };
      }
    } else {
      const msg = uploadError.message || 'Erreur lors de l\'upload.';
      return { data: null, error: { ...uploadError, message: msg } };
    }
  }

  const { data: urlData } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(uploadData.path);
  return { data: urlData?.publicUrl ?? null, error: null };
}
