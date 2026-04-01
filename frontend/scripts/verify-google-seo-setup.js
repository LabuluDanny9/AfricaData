/**
 * Vérifie les prérequis pour l’indexation Google (sitemap, robots, API dynamique).
 * Charge automatiquement frontend/.env s’il existe (sans dépendance dotenv).
 *
 * Usage :
 *   npm run verify:seo
 *   npm run verify:seo -- --probe        # teste les URLs en production (HTTPS)
 */

/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const ROOT = path.join(__dirname, '..');

function loadEnvFile() {
  const p = path.join(ROOT, '.env');
  if (!fs.existsSync(p)) return;
  const text = fs.readFileSync(p, 'utf8');
  for (const line of text.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq <= 0) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

function ok(msg) {
  console.log(`\x1b[32m✓\x1b[0m ${msg}`);
}

function warn(msg) {
  console.log(`\x1b[33m!\x1b[0m ${msg}`);
}

function bad(msg) {
  console.log(`\x1b[31m✗\x1b[0m ${msg}`);
}

function fetchUrl(url, timeoutMs = 12000) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { timeout: timeoutMs }, (res) => {
      let data = '';
      res.on('data', (c) => {
        data += c;
        if (data.length > 8000) res.destroy();
      });
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data.slice(0, 4000) }));
    });
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('timeout'));
    });
  });
}

async function main() {
  loadEnvFile();

  const siteUrl = (process.env.REACT_APP_SITE_URL || '').replace(/\/$/, '');
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
  const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
  const probe = process.argv.includes('--probe');

  console.log('\nAfricaData — Vérification SEO / Google\n');

  let errors = 0;

  if (!siteUrl) {
    bad('REACT_APP_SITE_URL manquant (dans .env ou l’environnement).');
    errors++;
  } else {
    ok(`REACT_APP_SITE_URL = ${siteUrl}`);
    if (siteUrl.includes('localhost')) {
      warn('URL locale : normal pour le dev. En production, utilisez https://votre-domaine sur Vercel.');
    }
  }

  if (!supabaseUrl || supabaseUrl.includes('votre-projet')) {
    bad('REACT_APP_SUPABASE_URL manquant ou encore l’exemple .env.example.');
    errors++;
  } else {
    ok('REACT_APP_SUPABASE_URL est défini.');
  }

  if (!anonKey || anonKey === 'votre_anon_key' || anonKey.length < 20) {
    bad('REACT_APP_SUPABASE_ANON_KEY manquant ou encore l’exemple.');
    errors++;
  } else {
    ok('REACT_APP_SUPABASE_ANON_KEY est défini.');
  }

  if (errors === 0) {
    ok('Les variables permettent de générer un sitemap complet au build et sur /api/sitemap (Vercel).');
  }

  console.log('\n— Actions que seul vous pouvez faire (comptes externes) —');
  console.log('  1) Vercel → Projet → Settings → Environment Variables : copier les 3 variables ci-dessus pour Production (et Preview si besoin).');
  console.log('  2) Google Search Console → https://search.google.com/search-console');
  console.log('     · Ajouter une propriété « Préfixe d’URL » avec votre URL HTTPS exacte.');
  console.log('     · Vérifier la propriété (fichier HTML, balise meta ou DNS selon l’assistant Google).');
  if (siteUrl && !siteUrl.includes('localhost')) {
    console.log(`     · Indexation → Sitemaps → ajouter : ${siteUrl}/api/sitemap`);
    console.log(`       (optionnel aussi : ${siteUrl}/sitemap.xml)`);
  } else if (siteUrl) {
    console.log('     · Une fois en prod, soumettre : https://VOTRE-DOMAINE/api/sitemap');
  }

  if (probe && siteUrl.startsWith('https://')) {
    console.log('\n— Test des URLs en ligne (--probe) —\n');
    const urls = [
      [`${siteUrl}/robots.txt`, 'robots.txt'],
      [`${siteUrl}/api/sitemap`, 'api/sitemap (dynamique)'],
      [`${siteUrl}/sitemap.xml`, 'sitemap.xml (build)'],
    ];
    for (const [u, label] of urls) {
      try {
        const r = await fetchUrl(u);
        if (r.status === 200) {
          ok(`${label} → HTTP 200 (${r.body.length} octets reçus)`);
          if (label.startsWith('api/sitemap') && !r.body.includes('urlset') && !r.body.includes('url>')) {
            warn('La réponse ne ressemble pas à du XML sitemap — vérifiez le déploiement Vercel.');
          }
        } else {
          warn(`${label} → HTTP ${r.status}`);
        }
      } catch (e) {
        bad(`${label} → ${e.message || e}`);
      }
    }
  } else if (probe) {
    warn('--probe ignoré : définissez REACT_APP_SITE_URL en https://... pour tester la prod.');
  } else {
    console.log('\nAstuce : après déploiement, lancez  npm run verify:seo -- --probe  pour tester robots + sitemaps.');
  }

  console.log('');

  const isCi = process.env.GITHUB_ACTIONS === 'true' || process.env.CI === 'true';
  if (errors > 0) {
    if (isCi) {
      warn(
        'Variables SEO incomplètes — attendu sur GitHub Actions sans secrets. En local : copiez .env.example vers .env et renseignez les clés.',
      );
      process.exitCode = 0;
    } else {
      process.exitCode = 1;
    }
  }
}

main();
