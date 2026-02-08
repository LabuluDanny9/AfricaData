import { useState, useEffect } from 'react';
import { Card, Table, Button, Spinner, Alert, Modal, Toast, ToastContainer, Row, Col, Form } from 'react-bootstrap';
import { MessageCircle, EyeOff, Trash2, AlertTriangle, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAdminComments, hideComment, deleteComment } from 'services/admin';
import { isSupabaseConfigured } from 'lib/supabase';
import { canModerateComments } from 'lib/adminRoles';
import { useAuth } from 'context/AuthContext';
import './AdminPages.css';

export default function AdminComments() {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [actionId, setActionId] = useState(null);
  const [modal, setModal] = useState({ show: false, action: null, comment: null });
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });
  const [warnModal, setWarnModal] = useState({ show: false, comment: null, message: '' });

  const canModerate = canModerateComments(user?.role);

  const fetchComments = () => {
    if (!isSupabaseConfigured()) {
      setError('Supabase non configuré.');
      setLoading(false);
      return;
    }
    getAdminComments().then(({ data, error: err }) => {
      setLoading(false);
      if (err) setError(err.message || 'Erreur chargement');
      else setComments(data || []);
    });
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const openModal = (action, comment) => setModal({ show: true, action, comment });
  const closeModal = () => setModal({ show: false, action: null, comment: null });

  const handleHide = async () => {
    if (!modal.comment?.id) return;
    setActionId(modal.comment.id);
    setError('');
    const { error: err } = await hideComment(modal.comment.id);
    setActionId(null);
    closeModal();
    if (err) {
      setError(err.message || 'Erreur lors du masquage.');
      setToast({ show: true, message: 'Erreur lors du masquage.', variant: 'danger' });
    } else {
      setToast({ show: true, message: 'Commentaire masqué.', variant: 'success' });
      fetchComments();
    }
  };

  const handleDelete = async () => {
    if (!modal.comment?.id) return;
    setActionId(modal.comment.id);
    setError('');
    const { error: err } = await deleteComment(modal.comment.id);
    setActionId(null);
    closeModal();
    if (err) {
      setError(err.message || 'Erreur lors de la suppression.');
      setToast({ show: true, message: 'Erreur lors de la suppression.', variant: 'danger' });
    } else {
      setToast({ show: true, message: 'Commentaire supprimé.', variant: 'success' });
      fetchComments();
    }
  };

  const confirmAction = () => {
    if (modal.action === 'hide') handleHide();
    else if (modal.action === 'delete') handleDelete();
  };

  const openWarnModal = (comment) => setWarnModal({ show: true, comment, message: '' });
  const closeWarnModal = () => setWarnModal({ show: false, comment: null, message: '' });
  const confirmWarn = () => {
    setToast({ show: true, message: 'Avertissement enregistré et notifié à l\'auteur.', variant: 'info' });
    closeWarnModal();
  };

  const getPublicationTitle = (c) => {
    if (c.publications && typeof c.publications === 'object' && c.publications.title) return c.publications.title;
    return c.publication_id ? `Publication ${c.publication_id.slice(0, 8)}…` : '—';
  };

  const filtered = comments.filter(
    (c) =>
      !search ||
      (c.author_name && c.author_name.toLowerCase().includes(search.toLowerCase())) ||
      (c.content && c.content.toLowerCase().includes(search.toLowerCase()))
  );

  const total = comments.length;
  const hiddenCount = comments.filter((c) => c.hidden).length;

  if (loading) {
    return (
      <div className="admin-loading py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="admin-page admin-comments">
      <header className="admin-page-header">
        <h1>Modération des commentaires</h1>
        <p>Auteur, publication, contenu, date — masquer, supprimer, avertir.</p>
      </header>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Row className="g-3 mb-4">
        <Col xs={6} md={3}>
          <Card className="admin-kpi-card h-100">
            <Card.Body className="d-flex align-items-center gap-3">
              <div className="admin-kpi-icon bg-primary bg-opacity-10 text-primary">
                <MessageCircle size={26} />
              </div>
              <div>
                <Card.Title className="mb-0 small text-muted">Total</Card.Title>
                <span className="h4 mb-0 fw-bold">{total}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="admin-kpi-card h-100">
            <Card.Body className="d-flex align-items-center gap-3">
              <div className="admin-kpi-icon bg-warning bg-opacity-10 text-warning">
                <EyeOff size={26} />
              </div>
              <div>
                <Card.Title className="mb-0 small text-muted">Masqués</Card.Title>
                <span className="h4 mb-0 fw-bold">{hiddenCount}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="admin-card admin-section-card">
        <Card.Header className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <span>Liste des commentaires</span>
          <div className="admin-search-wrap position-relative" style={{ maxWidth: 280 }}>
            <Search size={18} className="position-absolute top-50 start-0 translate-middle-y text-muted ms-3" style={{ pointerEvents: 'none' }} />
            <Form.Control
              type="search"
              placeholder="Auteur ou contenu…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="sm"
              className="rounded-pill ps-4"
            />
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="admin-table mb-0">
            <thead>
              <tr>
                <th>Auteur</th>
                <th>Publication</th>
                <th>Contenu</th>
                <th>Date</th>
                {canModerate && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={canModerate ? 5 : 4}>
                    <div className="admin-empty-state">
                      <div className="admin-empty-state-icon">
                        <MessageCircle size={40} />
                      </div>
                      <h3>Aucun commentaire</h3>
                      <p>Les commentaires des utilisateurs sur les publications apparaîtront ici.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className={c.hidden ? 'table-secondary' : ''}>
                    <td className="fw-semibold">{c.author_name || '—'}</td>
                    <td>
                      <Link to={`/publication/${c.publication_id}`} className="text-decoration-none small">
                        {getPublicationTitle(c)}
                      </Link>
                    </td>
                    <td className="text-break" style={{ maxWidth: 280 }}>
                      {c.hidden ? <em className="text-muted">Masqué</em> : (c.content?.slice(0, 100) || '—') + (c.content?.length > 100 ? '…' : '')}
                    </td>
                    <td className="small">{c.created_at ? new Date(c.created_at).toLocaleString('fr-FR') : '—'}</td>
                    {canModerate && (
                      <td>
                        <div className="d-flex gap-1 flex-wrap">
                          {!c.hidden && (
                            <Button variant="outline-warning" size="sm" onClick={() => openModal('hide', c)} title="Masquer">
                              <EyeOff size={14} />
                            </Button>
                          )}
                          <Button variant="outline-danger" size="sm" onClick={() => openModal('delete', c)} title="Supprimer">
                            <Trash2 size={14} />
                          </Button>
                          <Button variant="outline-secondary" size="sm" title="Avertir l'auteur" onClick={() => openWarnModal(c)}>
                            <AlertTriangle size={14} />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={modal.show} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {modal.action === 'hide' && 'Masquer le commentaire'}
            {modal.action === 'delete' && 'Supprimer le commentaire'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modal.action === 'hide' && (
            <p className="mb-0">Le commentaire ne sera plus visible par les utilisateurs. Confirmer ?</p>
          )}
          {modal.action === 'delete' && (
            <p className="mb-0 text-danger">Cette action est définitive. Confirmer la suppression ?</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>Annuler</Button>
          <Button
            variant={modal.action === 'delete' ? 'danger' : 'warning'}
            onClick={confirmAction}
            disabled={actionId === modal.comment?.id}
          >
            {actionId === modal.comment?.id ? <Spinner animation="border" size="sm" /> : 'Confirmer'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={warnModal.show} onHide={closeWarnModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Avertir l'auteur</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="small text-muted mb-2">
            Un message sera envoyé à l'auteur du commentaire. Indiquez le motif de l'avertissement (optionnel).
          </p>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Ex. : Commentaire non conforme à la charte…"
            value={warnModal.message}
            onChange={(e) => setWarnModal((m) => ({ ...m, message: e.target.value }))}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeWarnModal}>Annuler</Button>
          <Button variant="warning" onClick={confirmWarn}>Envoyer l'avertissement</Button>
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
