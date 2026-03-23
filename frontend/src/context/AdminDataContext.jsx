import { createContext, useContext, useState, useCallback } from 'react';
import { getAdminStats, getAllProfiles, getAllPublicationsForAdmin } from 'services/admin';
import { isAdminRole } from 'lib/adminRoles';
import { isSupabaseConfigured } from 'lib/supabase';

const AdminDataContext = createContext(null);

export function AdminDataProvider({ children }) {
  const [stats, setStats] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refetchDashboard = useCallback(() => {
    if (!isSupabaseConfigured()) return Promise.resolve();
    setLoading(true);
    setError('');
    return Promise.all([
      getAdminStats(),
      getAllProfiles(),
      getAllPublicationsForAdmin(),
    ]).then(([statsRes, profilesRes, pubsRes]) => {
      setLoading(false);
      const err = statsRes.error || profilesRes.error || pubsRes.error;
      if (err) setError(err.message || 'Erreur chargement');
      else setError('');
      setStats(statsRes.data ?? null);
      setProfiles(profilesRes.data || []);
      setPublications(pubsRes.data || []);
    });
  }, []);

  const value = {
    stats,
    profiles,
    publications,
    dashboardLoading: loading,
    dashboardError: error,
    setStats,
    setPublications,
    refetchDashboard,
  };

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  const ctx = useContext(AdminDataContext);
  if (!ctx) return { refetchDashboard: () => Promise.resolve() };
  return ctx;
}
