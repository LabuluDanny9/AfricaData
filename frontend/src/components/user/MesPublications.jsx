import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Table, Badge, Button, Modal } from 'react-bootstrap';
import { FileText, Eye, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from 'lib/supabase';
import { useAuth } from 'context/AuthContext';
import './MesPublications.css';

const MOCK_PUBLICATIONS = [
  { id: '1', title: 'Impact des changements climatiques sur l\'agriculture durable', type: 'Article', status: 'published', date: '2025-02-06', admin_comment: null },
  { id: '2', title: 'Analyse SIG pour la gestion des ressources naturelles', type: 'Thèse', status: 'pending', date: '2025-02-04', admin_comment: null },
  { id: '3', title: 'Étude épidémiologique des maladies tropicales négligées', type: 'Rapport', status: 'rejected', date: '2025-02-03', admin_comment: 'Veuillez compléter la section méthodologie et ajouter les références manquantes.' },
];

const STATUS_LABELS = {
  draft: { label: 'Brouillon', variant: 'secondary' },
  pending: { label: 'En analyse', variant: 'warning' },
  published: { label: 'Validée', variant: 'success' },
  rejected: { label: 'Rejetée', variant: 'danger' },
};

export default function MesPublications() {
  const { user } = useAuth();
  const [publications, setPublications] = useState(MOCK_PUBLICATIONS);
  const [loading, setLoading] = useState(false);
  const [selectedRejet, setSelectedRejet] = useState(null);

  useEffect(() => {
    if (isSupabaseConfigured() && user?.id) {
      setLoading(true);
      supabase
        .from('publications')
        .select('id, title, type, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (!error && data?.length) {
            setPublications(data.map((p) => ({
              id: p.id,
              title: p.title,
              type: p.type,
              status: p.status || 'pending',
              date: p.created_at?.slice(0, 10) || '',
              admin_comment: null,
            })));
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [user?.id]);

  return (
    <div className="mes-publications">
      <header className="mb-4">
        <h1 className="h3 fw-bold mb-1">Mes publications</h1>
        <p className="text-body-secondary mb-0 small">Suivi de vos soumissions</p>
      </header>

      <Card className="border-0 shadow-sm overflow-hidden">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-danger" role="status" />
              <p className="mt-2 small text-body-secondary">Chargement…</p>
            </div>
          ) : (
            <Table responsive hover className="mb-0 mes-publications-table">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Type</th>
                  <th>Statut</th>
                  <th>Date</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {publications.map((pub) => {
                  const statusInfo = STATUS_LABELS[pub.status] || STATUS_LABELS.pending;
                  return (
                    <tr key={pub.id}>
                      <td>
                        <Link to={`/publication/${pub.id}`} className="fw-semibold text-body text-decoration-none">
                          {pub.title.length > 50 ? pub.title.slice(0, 50) + '…' : pub.title}
                        </Link>
                      </td>
                      <td className="small">{pub.type}</td>
                      <td>
                        <Badge bg={statusInfo.variant} className="rounded-pill">{statusInfo.label}</Badge>
                        {pub.status === 'rejected' && (
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 ms-1 text-danger"
                            onClick={() => setSelectedRejet({ title: pub.title, comment: pub.admin_comment })}
                            title="Voir commentaire admin"
                          >
                            <AlertCircle size={16} />
                          </Button>
                        )}
                      </td>
                      <td className="small text-body-secondary">{pub.date}</td>
                      <td className="text-end">
                        <Button as={Link} to={`/publication/${pub.id}`} variant="outline-danger" size="sm" className="d-inline-flex align-items-center gap-1">
                          <Eye size={14} /> Voir
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
          {!loading && publications.length === 0 && (
            <div className="text-center py-5 text-body-secondary">
              <FileText size={48} className="mb-2 opacity-50" />
              <p className="mb-0">Aucune publication.</p>
              <Link to="/submit" className="btn btn-danger btn-sm mt-3 rounded-pill">Soumettre une publication</Link>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal show={!!selectedRejet} onHide={() => setSelectedRejet(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="small">Commentaire de l'administrateur</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRejet && (
            <>
              <p className="small fw-semibold mb-2">{selectedRejet.title}</p>
              <p className="small text-body-secondary mb-0">{selectedRejet.comment || 'Aucun commentaire fourni.'}</p>
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}
