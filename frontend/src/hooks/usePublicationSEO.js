import { useEffect } from 'react';
import { getPublicationCanonicalUrl, getSiteBaseUrl } from 'lib/siteUrl';
import { DEFAULT_SITE_TITLE, DEFAULT_SITE_DESCRIPTION } from 'lib/seoDefaults';

const JSON_LD_ID = 'africadata-publication-jsonld';

const NON_INDEXABLE_STATUS = new Set(['draft', 'rejected', 'deleted']);

function truncateText(text, maxLen) {
  if (!text || typeof text !== 'string') return '';
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen - 1).trim()}…`;
}

function removeDynamicSeoTags() {
  document.querySelectorAll('[data-africadata-seo]').forEach((el) => el.remove());
  const script = document.getElementById(JSON_LD_ID);
  if (script?.parentNode) script.parentNode.removeChild(script);
}

function upsertMetaName(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function appendMetaProperty(property, content) {
  const el = document.createElement('meta');
  el.setAttribute('property', property);
  el.setAttribute('content', content);
  el.setAttribute('data-africadata-seo', 'true');
  document.head.appendChild(el);
}

function appendMetaName(name, content) {
  const el = document.createElement('meta');
  el.setAttribute('name', name);
  el.setAttribute('content', content);
  el.setAttribute('data-africadata-seo', 'true');
  document.head.appendChild(el);
}

function setCanonical(href) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
  el.setAttribute('data-africadata-seo', 'true');
}

function upsertRobots(content) {
  upsertMetaName('robots', content);
}

/**
 * Met à jour title, meta description, Open Graph, Twitter et JSON-LD pour le référencement
 * (Google peut indexer les SPA après rendu ; les balises renforcent titre + extrait dans les résultats).
 * @param {boolean} isLoading - tant que true, on n'applique pas noindex (évite de marquer la page avant chargement).
 */
export function usePublicationSEO(publication, publicationId, isLoading = false) {
  useEffect(() => {
    if (isLoading) return;

    const hasId = publicationId != null && publicationId !== '';

    if (!hasId) {
      removeDynamicSeoTags();
      document.title = DEFAULT_SITE_TITLE;
      upsertMetaName('description', DEFAULT_SITE_DESCRIPTION);
      upsertRobots('index, follow');
      const canon = document.querySelector('link[rel="canonical"][data-africadata-seo]');
      if (canon?.parentNode) canon.parentNode.removeChild(canon);
      return;
    }

    const shouldNoIndex =
      !publication || NON_INDEXABLE_STATUS.has(publication.status);

    if (shouldNoIndex) {
      removeDynamicSeoTags();
      document.title = DEFAULT_SITE_TITLE;
      upsertMetaName('description', DEFAULT_SITE_DESCRIPTION);
      upsertRobots('noindex, nofollow');
      const canon = document.querySelector('link[rel="canonical"][data-africadata-seo]');
      if (canon?.parentNode) canon.parentNode.removeChild(canon);
      return;
    }

    const base = getSiteBaseUrl();
    const canonical = getPublicationCanonicalUrl(publicationId) || `${base}/publication/${publicationId}`;
    const rawAbstract = publication.abstract || publication.summary || '';
    const description = truncateText(rawAbstract, 160) || truncateText(publication.title, 160);
    const pageTitle = `${publication.title} | AfricaData`;
    const imageUrl = publication.author_photo_url
      ? publication.author_photo_url
      : `${base}/logo512.png`;

    removeDynamicSeoTags();

    document.title = pageTitle;
    upsertMetaName('description', description);
    upsertRobots('index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    setCanonical(canonical);

    appendMetaProperty('og:title', pageTitle);
    appendMetaProperty('og:description', description);
    appendMetaProperty('og:url', canonical);
    appendMetaProperty('og:type', 'article');
    appendMetaProperty('og:site_name', 'AfricaData');
    appendMetaProperty('og:locale', publication.language && String(publication.language).toLowerCase().startsWith('en') ? 'en_US' : 'fr_FR');
    if (imageUrl) appendMetaProperty('og:image', imageUrl);

    appendMetaName('twitter:card', 'summary_large_image');
    appendMetaName('twitter:title', pageTitle);
    appendMetaName('twitter:description', description);
    if (imageUrl) appendMetaName('twitter:image', imageUrl);

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'ScholarlyArticle',
      headline: publication.title,
      name: publication.title,
      url: canonical,
      description,
      inLanguage: publication.language || 'fr',
      ...(publication.created_at && { datePublished: publication.created_at }),
      ...(publication.domain && { about: { '@type': 'Thing', name: publication.domain } }),
      ...(publication.pdf_url && {
        encodingFormat: 'application/pdf',
        associatedMedia: { '@type': 'MediaObject', contentUrl: publication.pdf_url },
      }),
      ...(publication.reference_code && { identifier: publication.reference_code }),
      author: {
        '@type': 'Person',
        name: (publication.author && String(publication.author).trim()) || 'Auteur',
      },
      publisher: {
        '@type': 'Organization',
        name: 'AfricaData',
        url: base,
      },
    };

    const script = document.createElement('script');
    script.id = JSON_LD_ID;
    script.type = 'application/ld+json';
    script.setAttribute('data-africadata-seo', 'true');
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    return () => {
      removeDynamicSeoTags();
      document.title = DEFAULT_SITE_TITLE;
      upsertMetaName('description', DEFAULT_SITE_DESCRIPTION);
      upsertRobots('index, follow');
    };
  }, [publication, publicationId, isLoading]);
}
