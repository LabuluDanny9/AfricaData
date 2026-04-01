/**
 * Logique partagée : sitemap statique (prebuild) et route /api/sitemap (Vercel).
 */
const { createClient } = require('@supabase/supabase-js');

const STATIC_PAGES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/bibliotheque', changefreq: 'daily', priority: '0.95' },
  { path: '/about', changefreq: 'monthly', priority: '0.7' },
  { path: '/connexion', changefreq: 'monthly', priority: '0.4' },
  { path: '/inscription', changefreq: 'monthly', priority: '0.5' },
];

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

function lastmodFromRow(row) {
  const u = row.updated_at ? new Date(row.updated_at).getTime() : 0;
  const c = row.created_at ? new Date(row.created_at).getTime() : 0;
  const t = Math.max(u, c);
  if (!t) return undefined;
  return new Date(t).toISOString().slice(0, 10);
}

function getStaticEntries(siteUrl) {
  const base = String(siteUrl || '').replace(/\/$/, '');
  return STATIC_PAGES.map((p) => ({
    loc: `${base}${p.path}`,
    changefreq: p.changefreq,
    priority: p.priority,
  }));
}

async function fetchAllPublished(supabase) {
  const pageSize = 1000;
  const all = [];
  let from = 0;
  for (;;) {
    const { data, error } = await supabase
      .from('publications')
      .select('id, updated_at, created_at')
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

function publicationUrlEntries(siteUrl, pubs) {
  const base = String(siteUrl || '').replace(/\/$/, '');
  return pubs.map((p) => ({
    loc: `${base}/publication/${p.id}`,
    lastmod: lastmodFromRow(p),
    changefreq: 'weekly',
    priority: '0.85',
  }));
}

/**
 * @param {string} siteUrl
 * @param {{ id: string, updated_at?: string, created_at?: string }[]} pubs
 */
function mergeSitemapEntries(siteUrl, pubs) {
  return [...getStaticEntries(siteUrl), ...publicationUrlEntries(siteUrl, pubs)];
}

async function buildSitemapXmlForSite(siteUrl) {
  const url = process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.REACT_APP_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return { xml: buildSitemapXml(getStaticEntries(siteUrl)), pubCount: 0, staticOnly: true };
  }
  const supabase = createClient(url, key);
  const pubs = await fetchAllPublished(supabase);
  const entries = mergeSitemapEntries(siteUrl, pubs);
  return { xml: buildSitemapXml(entries), pubCount: pubs.length, staticOnly: false };
}

module.exports = {
  STATIC_PAGES,
  escapeXml,
  buildSitemapXml,
  getStaticEntries,
  fetchAllPublished,
  publicationUrlEntries,
  mergeSitemapEntries,
  buildSitemapXmlForSite,
  lastmodFromRow,
};
