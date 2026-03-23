import { useState, useEffect } from 'react';
import { Card, Table, Badge, Spinner, Form, Button, Modal, Toast, ToastContainer } from 'react-bootstrap';
import { BookOpen, Search, Edit2, ExternalLink, ArrowDownFromLine, Download, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAllPublicationsForAdmin, updatePublicationStatus, updatePublicationMetadata } from 'services/admin';
import { isSupabaseConfigured } from 'lib/supabase';
import { canValidatePublications } from 'lib/adminRoles';
import { useAuth } from 'context/AuthContext';
import './AdminPages.css';

export default function AdminLibrary() {
  const { user } = useAuth();
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [editModal, setEditModal] = useState({ show: false, pub: null, title: '', domain: '', type: '' });
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

  const canRetirer = canValidatePublications(user?.role);

  const fetchPublications = () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    getAllPublicationsForAdmin().then(({ data, error }) => {
      setLoading(false);
      if (!error) setPublications((data || []).filter((p) => p.status === 'published'));
    });
  };

  useEffect(() => {
    fetchPublications();
  }, []);

  const handleRetirer = async (id) => {
    setUpdatingId(id);
    const { error } = await updatePublicationStatus(id, 'draft');
    setUpdatingId(null);
    if (!error) setPublications((prev) => prev.filter((p) => p.id !== id));
  };

  const openEditModal = (pub) => setEditModal({ show: true, pub, title: pub.title || '', domain: pub.domain || '', type: pub.type || '' });
  const closeEditModal = () => setEditModal({ show: false, pub: null, title: '', domain: '', type: '' });

  const handleSaveMetadata = async () => {
    if (!editModal.pub?.id) return;
    setUpdatingId(editModal.pub.id);
    const { error } = await updatePublicationMetadata(editModal.pub.id, {
      title: editModal.title.trim() || editModal.pub.title,
      domain: editModal.domain.trim() || editModal.pub.domain,
      type: editModal.type.trim() || editModal.pub.type,
    });
    setUpdatingId(null);
    closeEditModal();
    if (error) {
      setToast({ show: true, message: error.message || 'Erreur lors de la mise à jour.', variant: 'danger' });
    } else {
      setToast({ show: true, message: 'Métadonnées enregistrées.', variant: 'success' });
      setPublications((prev) =>
        prev.map((p) =>
          p.id === editModal.pub.id
            ? { ...p, title: editModal.title.trim() || p.title, domain: editModal.domain.trim() || p.domain, type: editModal.type.trim() || p.type }
            : p
        )
      );
    }
  };

  const filtered = publications.filter(
    (p) =>
      !search ||
      (p.title && p.title.toLowerCase().includes(search.toLowerCase())) ||
      (p.author && p.author.toLowerCase().includes(search.toLowerCase())) ||
      (p.domain && p.domain.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="admin-page admin-library">
      <header className="admin-page-header">
        <h1>Bibliothèque (mode admin)</h1>
        <p>Consulter et modifier les documents publiés : domaines, métadonnées, suppression.</p>
      </header>

      <Card className="admin-card admin-section-card mb-4">
        <Card.Header className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <span>Documents publiés</span>
          <div className="admin-search-wrap position-relative" style={{ maxWidth: 320 }}>
            <Search size={18} className="position-absolute top-50 start-0 translate-middle-y text-muted ms-3" style={{ pointerEvents: 'none' }} />
            <Form.Control
              type="search"
              placeholder="Rechercher par titre, auteur, domaine…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="sm"
              className="rounded-pill ps-4"
            />
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="admin-loading py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <Table responsive hover className="admin-table mb-0">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Auteur</th>
                  <th>Domaine</th>
                  <th>Type</th>
                  <th>Vues</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="admin-empty-state">
                        <div className="admin-empty-state-icon">
                          <BookOpen size={40} />
                        </div>
                        <h3>Aucun document publié</h3>
                        <p>Les publications validées apparaissent ici. Validez des soumissions depuis la section Publications.</p>
                        <Button as={Link} to="/superadmin/publications" variant="primary" size="sm" className="rounded-pill">
                          Voir les publications
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <Link to={`/publication/${p.id}`} className="text-decoration-none fw-semibold text-dark">
                          {p.title?.slice(0, 50)}
                          {p.title?.length > 50 ? '…' : ''}
                        </Link>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {p.author_photo_url ? (
                            <img src={p.author_photo_url} alt="" className="rounded-circle object-fit-cover" style={{ width: 28, height: 28 }} />
                          ) : (
                            <span className="rounded-circle bg-secondary bg-opacity-25 d-inline-flex align-items-center justify-content-center" style={{ width: 28, height: 28 }}>
                              <User size={14} className="text-secondary" />
                            </span>
                          )}
                          <span>{p.author || '—'}</span>
                        </div>
                      </td>
                      <td><Badge bg="light" text="dark">{p.domain || '—'}</Badge></td>
                      <td className="small">{p.type || '—'}</td>
                      <td>{p.views ?? 0}</td>
                      <td className="small">{p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR') : '—'}</td>
                      <td>
                        <div className="d-flex gap-1 flex-wrap">
                          <Button variant="outline-primary" size="sm" as={Link} to={`/publication/${p.id}`} title="Voir">
                            <ExternalLink size={14} />
                          </Button>
                          {p.pdf_url ? (
                            <Button variant="outline-secondary" size="sm" as="a" href={p.pdf_url} target="_blank" rel="noopener noreferrer" title="Télécharger le PDF">
                              <Download size={14} />
                            </Button>
                          ) : (
                            <Button variant="outline-secondary" size="sm" title="PDF non disponible" onClick={() => setToast({ show: true, message: 'PDF non disponible pour cette publication.', variant: 'warning' })}>
                              <Download size={14} />
                            </Button>
                          )}
                          {canRetirer && (
                            <Button
                              variant="outline-warning"
                              size="sm"
                              onClick={() => handleRetirer(p.id)}
                              title="Retirer de la bibliothèque (passer en brouillon)"
                              disabled={updatingId === p.id}
                            >
                              {updatingId === p.id ? <Spinner animation="border" size="sm" /> : <ArrowDownFromLine size={14} />}
                            </Button>
                          )}
                          <Button variant="outline-secondary" size="sm" title="Modifier métadonnées" onClick={() => openEditModal(p)} disabled={updatingId === p.id}>
                            <Edit2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal show={editModal.show} onHide={closeEditModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Modifier les métadonnées</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Titre</Form.Label>
            <Form.Control value={editModal.title} onChange={(e) => setEditModal((m) => ({ ...m, title: e.target.value }))} placeholder="Titre de la publication" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Domaine</Form.Label>
            <Form.Control value={editModal.domain} onChange={(e) => setEditModal((m) => ({ ...m, domain: e.target.value }))} placeholder="Domaine scientifique" />
          </Form.Group>
          <Form.Group className="mb-0">
            <Form.Label>Type</Form.Label>
            <Form.Control value={editModal.type} onChange={(e) => setEditModal((m) => ({ ...m, type: e.target.value }))} placeholder="Article, Thèse, etc." />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeEditModal}>Annuler</Button>
          <Button variant="primary" onClick={handleSaveMetadata} disabled={updatingId === editModal.pub?.id}>
            {updatingId === editModal.pub?.id ? <Spinner animation="border" size="sm" /> : 'Enregistrer'}
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer position="top-end" className="p-3">
        <Toast show={toast.show} onClose={() => setToast((t) => ({ ...t, show: false }))} bg={toast.variant} autohide delay={4000}>
          <Toast.Body>{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
}
