/**
 * Sitemap XML généré à la demande (Vercel Serverless).
 * Liste toutes les publications publiées : toujours à jour sans redéployer.
 * Variables : REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_ANON_KEY, REACT_APP_SITE_URL (recommandé en prod).
 */
const { buildSitemapXmlForSite } = require('../scripts/sitemap-shared');

module.exports = async (req, res) => {
  if (req.method === 'HEAD') {
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    return res.status(200).end();
  }
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).send('Method Not Allowed');
  }

  let siteUrl = (process.env.REACT_APP_SITE_URL || '').replace(/\/$/, '');
  if (!siteUrl) {
    const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
    const host = (req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
    if (host) siteUrl = `${proto}://${host}`.replace(/\/$/, '');
  }
  if (!siteUrl) {
    siteUrl = 'http://localhost:3000';
  }

  try {
    const { xml, pubCount, staticOnly } = await buildSitemapXmlForSite(siteUrl);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader(
      'Cache-Control',
      staticOnly ? 'public, s-maxage=600, stale-while-revalidate=3600' : 'public, s-maxage=1800, stale-while-revalidate=86400',
    );
    if (!staticOnly) {
      res.setHeader('X-Sitemap-Publications', String(pubCount));
    }
    return res.status(200).send(xml);
  } catch (e) {
    console.error('[api/sitemap]', e);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(500).send('Sitemap generation failed');
  }
};
