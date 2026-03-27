/**
 * URL publique du site (SEO, partage, liens canoniques).
 * Définir REACT_APP_SITE_URL en production (ex. https://africa-data.vercel.app).
 */
export function getSiteBaseUrl() {
  if (typeof window === 'undefined') {
    const env = process.env.REACT_APP_SITE_URL;
    return env && String(env).trim() ? String(env).trim().replace(/\/$/, '') : '';
  }
  const fromEnv = process.env.REACT_APP_SITE_URL;
  if (fromEnv && String(fromEnv).trim()) {
    return String(fromEnv).trim().replace(/\/$/, '');
  }
  return window.location.origin;
}

export function getPublicationCanonicalUrl(publicationId) {
  const base = getSiteBaseUrl();
  if (!base || !publicationId) return '';
  return `${base}/publication/${publicationId}`;
}
