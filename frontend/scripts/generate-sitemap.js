/**
 * Génère public/sitemap.xml et public/robots.txt avant le build (prebuild).
 * Sur Vercel, robots.txt référence aussi /api/sitemap (liste des publications à jour).
 *
 * Variables : REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_ANON_KEY, REACT_APP_SITE_URL
 */

/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { buildSitemapXmlForSite } = require('./sitemap-shared');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');

function buildRobotsTxt(siteUrl, opts = {}) {
  const base = (siteUrl || 'http://localhost:3000').replace(/\/$/, '');
  const lines = [
    '# Généré par scripts/generate-sitemap.js (prebuild)',
    'User-agent: *',
    'Allow: /',
    'Allow: /bibliotheque',
    'Allow: /publication/',
    '',
    'Disallow: /superadmin',
    'Disallow: /dashboard',
    'Disallow: /connexion-admin',
    'Disallow: /mes-publications',
    'Disallow: /favoris',
    'Disallow: /avis',
    'Disallow: /profil',
    'Disallow: /submit',
    'Disallow: /normes-de-publication',
    '',
  ];
  if (opts.includeDynamicApi) {
    lines.push(`Sitemap: ${base}/api/sitemap`);
    lines.push(`Sitemap: ${base}/sitemap.xml`);
  } else {
    lines.push(`Sitemap: ${base}/sitemap.xml`);
  }
  return `${lines.join('\n')}\n`;
}

async function main() {
  let siteUrl = (process.env.REACT_APP_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

  const { xml, pubCount, staticOnly } = await buildSitemapXmlForSite(siteUrl);

  if (staticOnly) {
    console.warn('Sitemap: REACT_APP_SUPABASE_URL ou ANON_KEY absent — pages statiques seulement.');
  } else {
    console.log(`Sitemap: ${pubCount} publication(s) publiée(s) + pages statiques.`);
  }

  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), xml, 'utf8');

  const onVercel = process.env.VERCEL === '1';
  fs.writeFileSync(
    path.join(PUBLIC_DIR, 'robots.txt'),
    buildRobotsTxt(siteUrl, { includeDynamicApi: onVercel }),
    'utf8',
  );

  if (onVercel) {
    console.log('Robots: Sitemap dynamique /api/sitemap ajouté (publications à jour entre deux builds).');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
