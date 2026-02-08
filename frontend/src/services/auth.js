import { supabase, isSupabaseConfigured } from 'lib/supabase';

export async function signUp({ email, password, fullName, role = 'chercheur' }) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase non configuré. Ajoutez REACT_APP_SUPABASE_URL et REACT_APP_SUPABASE_ANON_KEY.');
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role },
    },
  });
  if (error) throw error;
  return data;
}

export async function signIn({ email, password }) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase non configuré.');
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!isSupabaseConfigured()) return;
  await supabase.auth.signOut();
}

export async function resetPassword(email) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase non configuré.');
  }
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/connexion`,
  });
  if (error) throw error;
  return data;
}

export async function getSession() {
  if (!isSupabaseConfigured()) return { data: { session: null }, error: null };
  return supabase.auth.getSession();
}

export async function signInWithOAuth(provider = 'google') {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase non configuré.');
  }
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/`,
      queryParams: { access_type: 'offline', prompt: 'consent' },
    },
  });
  if (error) throw error;
  return data;
}

export function onAuthStateChange(callback) {
  if (!isSupabaseConfigured()) return () => {};
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
  return () => subscription?.unsubscribe();
}
