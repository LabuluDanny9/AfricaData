import { useState, useEffect } from 'react';
import { Card, Table, Badge, Spinner, Alert, Button, Form, Modal, Toast, ToastContainer } from 'react-bootstrap';
import { Search, Eye, CheckCircle, XCircle, Trash2, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAllPublicationsForAdmin, updatePublicationStatus, deletePublication } from 'services/admin';
import { useAuth } from 'context/AuthContext';
import { canValidatePublications, canDeleteAnyContent } from 'lib/adminRoles';
import { isSupabaseConfigured } from 'lib/supabase';
import './AdminPages.css';
import './AdminPublications.css';

export default function AdminPublications() {
  const { user } = useAuth();
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [search, setSearch] = useState('');
  const [rejectModal, setRejectModal] = useState({ show: false, pub: null, comment: '' });
  const [deleteModal, setDeleteModal] = useState({ show: false, pub: null });
  const [toast, setToast] = useState({ show: false, message: '' });

  const canValidate = canValidatePublications(user?.role);
  const canDelete = canDeleteAnyContent(user?.role);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setError('Supabase non configuré.');
      setLoading(false);
      return;
    }
    getAllPublicationsForAdmin().then(({ data, error: err }) => {
      setLoading(false);
      if (err) setError(err.message || 'Erreur chargement');
      else setPublications(data || []);
    });
  }, []);

  const handleStatusChange = async (pubId, newStatus, rejectComment = null) => {
    setUpdatingId(pubId);
    setError('');
    const { error: err } = await updatePublicationStatus(pubId, newStatus, newStatus === 'rejected' ? rejectComment : null);
    setUpdatingId(null);
    setRejectModal({ show: false, pub: null, comment: '' });
    if (err) {
      setError(err.message || 'Erreur lors de la mise à jour.');
      return;
    }
    setPublications((prev) => prev.map((p) => (p.id === pubId ? { ...p, status: newStatus } : p)));
  };

  const openDeleteModal = (pub) => setDeleteModal({ show: true, pub });
  const closeDeleteModal = () => setDeleteModal({ show: false, pub: null });
  const confirmDeletePublication = async () => {
    if (!deleteModal.pub?.id) return;
    setUpdatingId(deleteModal.pub.id);
    setError('');
    const { error: err } = await deletePublication(deleteModal.pub.id);
    setUpdatingId(null);
    closeDeleteModal();
    if (err) {
      setError(err.message || 'Erreur lors de la suppression.');
      return;
    }
    setPublications((prev) => prev.filter((p) => p.id !== deleteModal.pub.id));
  };

  const openRejectModal = (pub) => setRejectModal({ show: true, pub, comment: '' });
  const closeRejectModal = () => setRejectModal({ show: false, pub: null, comment: '' });
  const confirmReject = () => {
    if (!rejectModal.pub || !rejectModal.comment.trim()) return;
    handleStatusChange(rejectModal.pub.id, 'rejected', rejectModal.comment);
  };

  const filtered = publications.filter(
    (p) =>
      !search ||
      (p.title && p.title.toLowerCase().includes(search.toLowerCase())) ||
      (p.author && p.author.toLowerCase().includes(search.toLowerCase())) ||
      (p.domain && p.domain.toLowerCase().includes(search.toLowerCase()))
  );

  const pageSize = 10;
  const [page, setPage] = useState(0);
  const totalPages = Math.max(0, Math.ceil(filtered.length / pageSize) - 1);
  const pageItems = filtered.slice(page * pageSize, (page + 1) * pageSize);

  if (loading) {
    return (
      <div className="admin-loading py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="admin-publications">
      <header className="admin-page-header">
        <h1>Gestion des publications</h1>
        <p>Examiner, valider ou rejeter les soumissions</p>
      </header>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card className="admin-card mb-3">
        <Card.Body className="p-3">
          <div className="admin-search-wrap position-relative">
            <Search size={20} className="position-absolute top-50 start-0 translate-middle-y text-muted ms-3" style={{ pointerEvents: 'none' }} />
            <Form.Control
              type="search"
              placeholder="Rechercher par titre, auteur, domaine…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </Card.Body>
      </Card>

      <Card className="admin-card">
        <Card.Body className="p-0">
          <Table responsive hover className="admin-table mb-0">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Auteur</th>
                <th>Domaine</th>
                <th>Type</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-body-secondary py-4">
                    Aucune publication
                  </td>
                </tr>
              ) : (
                pageItems.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <Link to={`/publication/${p.id}`} className="text-decoration-none fw-semibold">
                        {p.title?.slice(0, 50)}
                        {p.title?.length > 50 ? '…' : ''}
                      </Link>
                    </td>
                    <td>{p.author || '—'}</td>
                    <td>{p.domain || '—'}</td>
                    <td>{p.type || '—'}</td>
                    <td>
                      {p.status === 'published' && <Badge bg="success">Validée</Badge>}
                      {p.status === 'draft' && <Badge bg="warning">En attente</Badge>}
                      {p.status === 'rejected' && <Badge bg="danger">Rejetée</Badge>}
                    </td>
                    <td>{p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR') : '—'}</td>
                    <td>
                      <div className="d-flex flex-wrap gap-1 align-items-center">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          as={Link}
                          to={`/publication/${p.id}`}
                          title="Examiner"
                        >
                          <Eye size={14} />
                        </Button>
                        {p.pdf_url ? (
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            as="a"
                            href={p.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Télécharger le PDF"
                          >
                            <Download size={14} />
                          </Button>
                        ) : (
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            title="PDF non disponible"
                            onClick={() => setToast({ show: true, message: 'PDF non disponible pour cette publication.' })}
                          >
                            <Download size={14} />
                          </Button>
                        )}
                        {canValidate && p.status === 'draft' && (
                          <>
                            {updatingId === p.id ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              <>
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() => handleStatusChange(p.id, 'published')}
                                  title="Valider"
                                >
                                  <CheckCircle size={14} />
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => openRejectModal(p)}
                                  title="Rejeter"
                                >
                                  <XCircle size={14} />
                                </Button>
                              </>
                            )}
                          </>
                        )}
                        {canDelete && (
                          <>
                            {p.status !== 'draft' && (
                              <Button
                                variant="outline-warning"
                                size="sm"
                                onClick={() => handleStatusChange(p.id, 'draft')}
                                title="Retirer (passer en brouillon)"
                              >
                                Retirer
                              </Button>
                            )}
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => openDeleteModal(p)}
                              title="Supprimer définitivement"
                              disabled={updatingId === p.id}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
          {filtered.length > pageSize && (
            <div className="admin-pagination-bar">
              <span className="text-muted">
                {page * pageSize + 1}–{Math.min((page + 1) * pageSize, filtered.length)} / {filtered.length}
              </span>
              <div className="d-flex gap-2">
                <Button size="sm" variant="outline-secondary" disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="rounded-pill">
                  Précédent
                </Button>
                <Button size="sm" variant="outline-secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-pill">
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal show={rejectModal.show} onHide={closeRejectModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Rejeter la publication</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="small text-muted mb-2">
            Le commentaire sera envoyé à l'auteur. Champ obligatoire.
          </p>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Motif du rejet…"
            value={rejectModal.comment}
            onChange={(e) => setRejectModal((prev) => ({ ...prev, comment: e.target.value }))}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeRejectModal}>
            Annuler
          </Button>
          <Button
            variant="danger"
            onClick={confirmReject}
            disabled={!rejectModal.comment.trim() || updatingId === rejectModal.pub?.id}
          >
            Rejeter
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={deleteModal.show} onHide={closeDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Supprimer la publication</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-danger mb-0">
            Supprimer définitivement cette publication ? Cette action est irréversible (titre, métadonnées, PDF).
          </p>
          {deleteModal.pub && (
            <p className="small text-muted mt-2 mb-0">
              « {deleteModal.pub.title?.slice(0, 60)}{deleteModal.pub.title?.length > 60 ? '…' : ''} »
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDeleteModal}>
            Annuler
          </Button>
          <Button
            variant="danger"
            onClick={confirmDeletePublication}
            disabled={updatingId === deleteModal.pub?.id}
          >
            {updatingId === deleteModal.pub?.id ? <Spinner animation="border" size="sm" /> : 'Supprimer définitivement'}
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer position="top-end" className="p-3">
        <Toast show={toast.show} onClose={() => setToast((t) => ({ ...t, show: false }))} autohide delay={4000}>
          <Toast.Body>{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
}
