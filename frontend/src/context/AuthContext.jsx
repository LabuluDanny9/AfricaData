import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChange, getSession, signOut as supabaseSignOut } from 'services/auth';
import { getProfile } from 'services/profile';
import { isSupabaseConfigured } from 'lib/supabase';

const AUTH_STORAGE_KEY = 'africadata_user';

const AuthContext = createContext(null);

function userFromSession(session) {
  if (!session?.user) return null;
  const u = session.user;
  return {
    id: u.id,
    email: u.email,
    name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'Utilisateur',
    picture: u.user_metadata?.avatar_url || u.user_metadata?.picture,
    sub: u.id,
  };
}

async function userWithProfile(session) {
  const base = userFromSession(session);
  if (!base?.id || !isSupabaseConfigured()) return base;
  const { data: profile } = await getProfile(base.id);
  return {
    ...base,
    name: profile?.full_name || base.name,
    picture: profile?.avatar_url || base.picture,
    role: profile?.role ?? 'chercheur',
  };
}

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [authLoading, setAuthLoading] = useState(!!isSupabaseConfigured());

  useEffect(() => {
    if (isSupabaseConfigured()) {
      getSession()
        .then((res) => {
          const session = res?.data?.session ?? null;
          return userWithProfile(session).then(setUserState);
        })
        .catch(() => setUserState(null))
        .finally(() => setAuthLoading(false));
      const unsubscribe = onAuthStateChange((_event, session) => {
        userWithProfile(session).then(setUserState);
      });
      return unsubscribe;
    }
    setAuthLoading(false);
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) setUserState(JSON.parse(stored));
    } catch (_) {}
  }, []);

  const setUser = (userData) => {
    setUserState(userData);
    if (userData) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      await supabaseSignOut();
    }
    setUserState(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
