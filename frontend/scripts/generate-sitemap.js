/**
 * Génère public/sitemap.xml et public/robots.txt avant le build (prebuild).
 * Utilise l'anon key Supabase : les publications en status=published sont lisibles par tous (RLS).
 *
 * Variables : REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_ANON_KEY, REACT_APP_SITE_URL
 */

/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildSitemapXml(entries) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];
  for (const e of entries) {
    lines.push('  <url>');
    lines.push(`    <loc>${escapeXml(e.loc)}</loc>`);
    if (e.lastmod) lines.push(`    <lastmod>${e.lastmod}</lastmod>`);
    if (e.changefreq) lines.push(`    <changefreq>${e.changefreq}</changefreq>`);
    if (e.priority != null) lines.push(`    <priority>${e.priority}</priority>`);
    lines.push('  </url>');
  }
  lines.push('</urlset>');
  return `${lines.join('\n')}\n`;
}

function buildRobotsTxt(siteUrl) {
  const base = siteUrl || 'http://localhost:3000';
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
    `Sitemap: ${base.replace(/\/$/, '')}/sitemap.xml`,
  ];
  return `${lines.join('\n')}\n`;
}

async function fetchAllPublished(supabase) {
  const pageSize = 1000;
  const all = [];
  let from = 0;
  for (;;) {
    const { data, error } = await supabase
      .from('publications')
      .select('id, updated_at')
      .eq('status', 'published')
      .order('updated_at', { ascending: false })
      .range(from, from + pageSize - 1);

    if (error) throw error;
    if (!data?.length) break;
    all.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return all;
}

async function main() {
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
  let siteUrl = (process.env.REACT_APP_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

  const staticPages = [
    { path: '/', changefreq: 'weekly', priority: '1.0' },
    { path: '/bibliotheque', changefreq: 'daily', priority: '0.95' },
    { path: '/about', changefreq: 'monthly', priority: '0.7' },
    { path: '/connexion', changefreq: 'monthly', priority: '0.4' },
    { path: '/inscription', changefreq: 'monthly', priority: '0.5' },
  ];

  const entries = staticPages.map((p) => ({
    loc: `${siteUrl}${p.path}`,
    changefreq: p.changefreq,
    priority: p.priority,
  }));

  let pubCount = 0;

  if (supabaseUrl && anonKey) {
    try {
      const supabase = createClient(supabaseUrl, anonKey);
      const pubs = await fetchAllPublished(supabase);
      pubCount = pubs.length;
      for (const p of pubs) {
        const lastmod = p.updated_at
          ? new Date(p.updated_at).toISOString().slice(0, 10)
          : undefined;
        entries.push({
          loc: `${siteUrl}/publication/${p.id}`,
          lastmod,
          changefreq: 'weekly',
          priority: '0.85',
        });
      }
      console.log(`Sitemap: ${pubCount} publication(s) publiée(s) + pages statiques.`);
    } catch (e) {
      console.warn('Sitemap: impossible de lire Supabase, pages statiques seulement.', e.message || e);
    }
  } else {
    console.warn('Sitemap: REACT_APP_SUPABASE_URL ou ANON_KEY absent — pages statiques seulement.');
  }

  const xml = buildSitemapXml(entries);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), xml, 'utf8');

  fs.writeFileSync(path.join(PUBLIC_DIR, 'robots.txt'), buildRobotsTxt(siteUrl), 'utf8');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
