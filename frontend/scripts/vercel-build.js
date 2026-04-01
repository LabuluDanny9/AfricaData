/**
 * Commande de build utilisée sur Vercel (voir vercel.json → buildCommand).
 * Si REACT_APP_SITE_URL n'est pas défini, utilise VERCEL_URL (fourni par Vercel)
 * pour générer robots.txt / sitemap avec la bonne origine (évite localhost).
 *
 * En Production avec domaine personnalisé : définissez quand même
 * REACT_APP_SITE_URL=https://africadatas.com dans Vercel → Environment Variables
 * (sinon les URLs canoniques pointeront vers *.vercel.app).
 */
/* eslint-disable no-console */
const { execSync } = require('child_process');

const existing = (process.env.REACT_APP_SITE_URL || '').trim();
const vercelHost = (process.env.VERCEL_URL || '').replace(/^https?:\/\//i, '').replace(/\/$/, '');

if (!existing && vercelHost) {
  process.env.REACT_APP_SITE_URL = `https://${vercelHost}`;
  console.log(`[vercel-build] REACT_APP_SITE_URL ← https://${vercelHost} (VERCEL_URL)`);
} else if (existing) {
  console.log(`[vercel-build] REACT_APP_SITE_URL déjà défini : ${existing}`);
} else {
  console.warn(
    '[vercel-build] Ni REACT_APP_SITE_URL ni VERCEL_URL : prebuild risque d’utiliser http://localhost:3000.',
  );
}

execSync('npm run build', { stdio: 'inherit', env: process.env });
