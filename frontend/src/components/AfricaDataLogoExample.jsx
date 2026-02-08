/**
 * Exemple d’utilisation du logo AfricaData animé.
 *
 * React (CRA) : importer et utiliser dans n’importe quelle page.
 * Next.js : dans app/page.js → import AfricaDataLogo from '@/components/AfricaDataLogo';
 */

import AfricaDataLogo from './AfricaDataLogo';

export default function AfricaDataLogoExample() {
  return (
    <section className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <AfricaDataLogo className="shadow-sm" durationMs={5000} />
    </section>
  );
}
