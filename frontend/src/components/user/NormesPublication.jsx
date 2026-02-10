import { useState, useEffect } from 'react';
import { Card, Spinner } from 'react-bootstrap';
import { FileCheck } from 'lucide-react';
import { getDomainNorms } from 'services/domainNorms';
import { isSupabaseConfigured } from 'lib/supabase';
import './NormesPublication.css';

export default function NormesPublication() {
  const [norms, setNorms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setError('Service non disponible.');
      setLoading(false);
      return;
    }
    getDomainNorms().then(({ data, error: err }) => {
      setLoading(false);
      if (err) setError(err.message || 'Erreur de chargement');
      else setNorms(data || []);
    });
  }, []);

  if (loading) {
    return (
      <div className="normes-publication-page d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="normes-publication-page">
      <header className="normes-header mb-4">
        <h1 className="h3 fw-bold d-flex align-items-center gap-2">
          <FileCheck size={28} />
          Normes et modalités de publication
        </h1>
        <p className="text-body-secondary mb-0">
          Consultez les normes selon votre domaine pour bien préparer votre soumission. Titre, résumé, document PDF et conformité au domaine sont vérifiés lors de l'examen.
        </p>
      </header>

      {error && (
        <div className="alert alert-warning" role="alert">
          {error}
        </div>
      )}

      {norms.length === 0 && !error && (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center text-muted py-5">
            Aucune norme publiée pour le moment. Les normes par domaine seront bientôt disponibles.
          </Card.Body>
        </Card>
      )}

      <div className="d-flex flex-column gap-3">
        {norms.map((n) => (
          <Card key={n.domain} className="normes-domain-card border-0 shadow-sm">
            <Card.Header className="bg-primary bg-opacity-10 text-primary fw-semibold">
              {n.domain}
            </Card.Header>
            <Card.Body>
              <p className="mb-0 small">{n.content || 'Aucune norme définie pour ce domaine.'}</p>
            </Card.Body>
          </Card>
        ))}
      </div>

      <Card className="mt-4 border-0 bg-light">
        <Card.Body className="small text-muted">
          <strong>Conseils généraux :</strong> titre d'au moins 10 caractères, résumé d'au moins 50 caractères, document PDF complet. L'administrateur vérifie la conformité avec les normes du domaine avant validation.
        </Card.Body>
      </Card>
    </div>
  );
}
