import { useEffect } from 'react';
import { getSiteBaseUrl } from 'lib/siteUrl';
import { DEFAULT_SITE_TITLE, DEFAULT_SITE_DESCRIPTION } from 'lib/seoDefaults';

/**
 * Titre, meta description et canonical pour les pages publiques (librairie, à propos, etc.).
 */
export function useSimplePageSEO({ enabled, title, description, path }) {
  useEffect(() => {
    if (!enabled || !path) return undefined;

    const base = getSiteBaseUrl();
    const canonical = `${base}${path.startsWith('/') ? path : `/${path}`}`;

    const prevTitle = document.title;
    document.title = title || DEFAULT_SITE_TITLE;

    const meta = document.querySelector('meta[name="description"]');
    const prevDesc = meta ? meta.getAttribute('content') : null;
    if (meta && description) meta.setAttribute('content', description);

    let link = document.querySelector('link[rel="canonical"][data-africadata-page]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('data-africadata-page', 'true');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonical);

    return () => {
      document.title = prevTitle || DEFAULT_SITE_TITLE;
      if (meta) {
        if (prevDesc != null) meta.setAttribute('content', prevDesc);
        else meta.setAttribute('content', DEFAULT_SITE_DESCRIPTION);
      }
      if (link?.parentNode) link.parentNode.removeChild(link);
    };
  }, [enabled, title, description, path]);
}
