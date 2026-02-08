import { useState, useEffect } from 'react';
import { Card, Table, Badge, Spinner, Alert, Button, Form, Modal, Toast, ToastContainer } from 'react-bootstrap';
import { Search, Trash2, UserCog } from 'lucide-react';
import { getAllProfiles, deleteUser, updateUserRole } from 'services/admin';
import { useAuth } from 'context/AuthContext';
import { canManageUsers, ROLE_LABELS } from 'lib/adminRoles';
import { isSupabaseConfigured } from 'lib/supabase';
import './AdminPages.css';
import './AdminUsers.css';

const USER_ROLES_OPTIONS = [
  { value: 'chercheur', label: 'Chercheur' },
  { value: 'lecteur', label: 'Lecteur' },
  { value: 'editeur', label: 'Éditeur' },
  { value: 'institution', label: 'Institution' },
  { value: 'admin', label: 'Super Admin' },
  { value: 'admin_editorial', label: 'Admin éditorial' },
  { value: 'moderator', label: 'Modérateur' },
];

export default function AdminUsers() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [actionId, setActionId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, profile: null });
  const [roleModal, setRoleModal] = useState({ show: false, profile: null, newRole: '' });
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

  const canManage = canManageUsers(user?.role);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setError('Supabase non configuré.');
      setLoading(false);
      return;
    }
    getAllProfiles().then(({ data, error: err }) => {
      setLoading(false);
      if (err) setError(err.message || 'Erreur chargement');
      else setProfiles(data || []);
    });
  }, []);

  const filtered = profiles.filter(
    (p) =>
      !search ||
      (p.full_name && p.full_name.toLowerCase().includes(search.toLowerCase())) ||
      (p.email && p.email.toLowerCase().includes(search.toLowerCase()))
  );

  const pageSize = 10;
  const [page, setPage] = useState(0);
  const totalPages = Math.max(0, Math.ceil(filtered.length / pageSize) - 1);
  const pageItems = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const openDeleteModal = (profile) => setDeleteModal({ show: true, profile });
  const closeDeleteModal = () => setDeleteModal({ show: false, profile: null });
  const confirmDeleteUser = async () => {
    if (!deleteModal.profile?.id) return;
    setActionId(deleteModal.profile.id);
    setError('');
    const { error: err } = await deleteUser(deleteModal.profile.id);
    setActionId(null);
    closeDeleteModal();
    if (err) {
      setError(err.message || 'Erreur lors de la suppression.');
      return;
    }
    setProfiles((prev) => prev.filter((p) => p.id !== deleteModal.profile.id));
  };

  const openRoleModal = (profile) => setRoleModal({ show: true, profile, newRole: profile.role || 'chercheur' });
  const closeRoleModal = () => setRoleModal({ show: false, profile: null, newRole: '' });
  const confirmChangeRole = async () => {
    if (!roleModal.profile?.id || !roleModal.newRole) return;
    setActionId(roleModal.profile.id);
    setError('');
    const { error: err } = await updateUserRole(roleModal.profile.id, roleModal.newRole);
    setActionId(null);
    closeRoleModal();
    if (err) {
      setError(err.message || 'Erreur lors du changement de rôle.');
      setToast({ show: true, message: err.message || 'Erreur lors du changement de rôle.', variant: 'danger' });
      return;
    }
    setProfiles((prev) => prev.map((p) => (p.id === roleModal.profile.id ? { ...p, role: roleModal.newRole } : p)));
    const roleLabel = USER_ROLES_OPTIONS.find((r) => r.value === roleModal.newRole)?.label || roleModal.newRole;
    setToast({ show: true, message: `Rôle mis à jour : ${roleLabel}`, variant: 'success' });
  };

  const isCurrentUser = (profileId) => user?.id === profileId;

  if (loading) {
    return (
      <div className="admin-loading py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="admin-users">
      <header className="admin-page-header">
        <h1>Gestion des utilisateurs</h1>
        <p>
          {canManage ? 'Suspendre, supprimer ou modifier les rôles (Super Admin uniquement).' : 'Consultation des comptes.'}
        </p>
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
              placeholder="Rechercher par nom ou email…"
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
                <th>Nom</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Inscription</th>
                {canManage && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 5 : 4} className="text-center text-body-secondary py-4">
                    Aucun utilisateur
                  </td>
                </tr>
              ) : (
                pageItems.map((pr) => (
                  <tr key={pr.id}>
                    <td className="fw-semibold">{pr.full_name || '—'}</td>
                    <td>{pr.email || '—'}</td>
                    <td>
                      <Badge bg={pr.role === 'admin' ? 'danger' : 'secondary'}>
                        {ROLE_LABELS[pr.role] || pr.role}
                      </Badge>
                    </td>
                    <td>{pr.created_at ? new Date(pr.created_at).toLocaleDateString('fr-FR') : '—'}</td>
                    {canManage && (
                      <td>
                        <div className="d-flex flex-wrap gap-1 align-items-center">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => openRoleModal(pr)}
                            title="Modifier le rôle"
                          >
                            <UserCog size={14} />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => openDeleteModal(pr)}
                            title="Supprimer l'utilisateur"
                            disabled={isCurrentUser(pr.id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                          {isCurrentUser(pr.id) && (
                            <span className="small text-muted">(vous)</span>
                          )}
                        </div>
                      </td>
                    )}
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
                <Button size="sm" variant="outline-secondary" disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="rounded-pill">Précédent</Button>
                <Button size="sm" variant="outline-secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-pill">Suivant</Button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal show={deleteModal.show} onHide={closeDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Supprimer l'utilisateur</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-danger mb-0">
            Supprimer définitivement cet utilisateur ? Le profil sera supprimé de la plateforme.
          </p>
          <p className="small text-muted mt-2 mb-0">
            Pour révoquer complètement la connexion, supprimez aussi le compte dans Supabase Dashboard → Authentication → Users.
          </p>
          {deleteModal.profile && (
            <p className="fw-semibold mt-2 mb-0">
              {deleteModal.profile.full_name || '—'} ({deleteModal.profile.email})
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDeleteModal}>
            Annuler
          </Button>
          <Button
            variant="danger"
            onClick={confirmDeleteUser}
            disabled={actionId === deleteModal.profile?.id}
          >
            {actionId === deleteModal.profile?.id ? <Spinner animation="border" size="sm" /> : 'Supprimer'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={roleModal.show} onHide={closeRoleModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Modifier le rôle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {roleModal.profile && (
            <p className="mb-2">
              <strong>{roleModal.profile.full_name || '—'}</strong> ({roleModal.profile.email})
            </p>
          )}
          <Form.Group>
            <Form.Label className="small">Nouveau rôle</Form.Label>
            <Form.Select
              value={roleModal.newRole}
              onChange={(e) => setRoleModal((prev) => ({ ...prev, newRole: e.target.value }))}
            >
              {USER_ROLES_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeRoleModal}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={confirmChangeRole}
            disabled={!roleModal.newRole || actionId === roleModal.profile?.id}
          >
            {actionId === roleModal.profile?.id ? <Spinner animation="border" size="sm" /> : 'Enregistrer'}
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
