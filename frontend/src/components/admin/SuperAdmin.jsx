import { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Badge, Tab, Tabs, Spinner, Alert, Button } from 'react-bootstrap';
import { Users, Clock, CheckCircle, User } from 'lucide-react';
import { getAdminStats, getAllProfiles, getAllPublicationsForAdmin, updatePublicationStatus } from 'services/admin';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'context/AuthContext';
import { isAdminRole, ROLE_LABELS } from 'lib/adminRoles';
import { isSupabaseConfigured } from 'lib/supabase';
import { Link } from 'react-router-dom';
import './AdminPages.css';
import './SuperAdmin.css';

export default function SuperAdmin() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (!user?.id || !isAdminRole(user.role)) return;
    if (!isSupabaseConfigured()) {
      setError('Supabase non configuré.');
      setLoading(false);
      return;
    }
    Promise.all([
      getAdminStats(),
      getAllProfiles(),
      getAllPublicationsForAdmin(),
    ]).then(([statsRes, profilesRes, pubsRes]) => {
      setLoading(false);
      const err = statsRes.error || profilesRes.error || pubsRes.error;
      if (err) setError(err.message || 'Erreur chargement');
      else setError('');
      setStats(statsRes.data ?? null);
      setProfiles(profilesRes.data || []);
      setPublications(pubsRes.data || []);
    });
  }, [user?.id, user?.role]);

  const handleStatusChange = async (pubId, newStatus) => {
    setUpdatingId(pubId);
    setError('');
    const { error: err } = await updatePublicationStatus(pubId, newStatus);
    setUpdatingId(null);
    if (err) {
      setError(err.message || 'Erreur lors de la mise à jour.');
      return;
    }
    setPublications((prev) => prev.map((p) => (p.id === pubId ? { ...p, status: newStatus } : p)));
    if (stats) {
      if (newStatus === 'published') setStats((s) => ({ ...s, publicationsCount: s.publicationsCount + 1, draftCount: Math.max(0, s.draftCount - 1) }));
      else setStats((s) => ({ ...s, publicationsCount: Math.max(0, s.publicationsCount - 1), draftCount: s.draftCount + 1 }));
    }
  };

  if (loading) {
    return (
      <div className="superadmin-loading d-flex align-items-center justify-content-center py-5">
        <Spinner animation="border" variant="danger" />
      </div>
    );
  }

  return (
    <div className="superadmin-page">
      <header className="admin-page-header d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div>
          <h1>Tableau de bord Admin</h1>
          <p>Vue synthétique de la plateforme AfricaData</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="primary" size="sm" as={Link} to="/superadmin/publications" className="rounded-pill px-3">Publications</Button>
          <Button variant="outline-secondary" size="sm" as={Link} to="/superadmin/utilisateurs" className="rounded-pill px-3">Utilisateurs</Button>
        </div>
      </header>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {stats && (
        <Row className="g-3 mb-4">
          <Col xs={12} md={4}>
            <Card className="admin-kpi-card h-100">
              <Card.Body className="d-flex align-items-center gap-3">
                <div className="admin-kpi-icon bg-primary bg-opacity-10 text-primary">
                  <Users size={26} />
                </div>
                <div>
                  <Card.Title className="mb-0">{stats.usersCount}</Card.Title>
                  <Card.Text className="text-body-secondary mb-0">Utilisateurs</Card.Text>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={4}>
            <Card className="admin-kpi-card h-100">
              <Card.Body className="d-flex align-items-center gap-3">
                <div className="admin-kpi-icon bg-success bg-opacity-10 text-success">
                  <CheckCircle size={26} />
                </div>
                <div>
                  <Card.Title className="mb-0">{stats.publicationsCount}</Card.Title>
                  <Card.Text className="text-body-secondary mb-0">Publications publiées</Card.Text>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={4}>
            <Card className="admin-kpi-card h-100">
              <Card.Body className="d-flex align-items-center gap-3">
                <div className="admin-kpi-icon bg-warning bg-opacity-10 text-warning">
                  <Clock size={26} />
                </div>
                <div>
                  <Card.Title className="mb-0">{stats.draftCount}</Card.Title>
                  <Card.Text className="text-body-secondary mb-0">En attente (brouillons)</Card.Text>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Tabs defaultActiveKey="publications" className="admin-tabs mb-4">
        <Tab eventKey="publications" title="Publications">
          <Card className="admin-card">
            <Card.Body className="p-0">
              <Table responsive hover className="admin-table mb-0">
                <thead>
                  <tr>
                    <th>Titre</th>
                    <th>Auteur</th>
                    <th>Type</th>
                    <th>Domaine</th>
                    <th>Statut</th>
                    <th>Vues</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {publications.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center text-body-secondary py-4">
                        Aucune publication
                      </td>
                    </tr>
                  ) : (
                    publications.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <Link to={`/publication/${p.id}`} className="text-decoration-none fw-semibold">
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
                        <td>{p.type}</td>
                        <td>{p.domain}</td>
                        <td>
                          {p.status === 'published' ? (
                            <Badge bg="success">Publié</Badge>
                          ) : (
                            <Badge bg="warning">Brouillon</Badge>
                          )}
                        </td>
                        <td>{p.views ?? 0}</td>
                        <td>{p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR') : '—'}</td>
                        <td>
                          {updatingId === p.id ? (
                            <Spinner animation="border" size="sm" />
                          ) : p.status === 'draft' ? (
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleStatusChange(p.id, 'published')}
                            >
                              Publier
                            </Button>
                          ) : (
                            <Button
                              variant="outline-warning"
                              size="sm"
                              onClick={() => handleStatusChange(p.id, 'draft')}
                            >
                              Retirer
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>
        <Tab eventKey="users" title="Utilisateurs">
          <Card className="admin-card">
            <Card.Body className="p-0">
              <Table responsive hover className="admin-table mb-0">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>{t('admin.signupDate')}</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center text-body-secondary py-4">
                        Aucun utilisateur
                      </td>
                    </tr>
                  ) : (
                    profiles.map((pr) => (
                      <tr key={pr.id}>
                        <td className="fw-semibold">{pr.full_name || '—'}</td>
                        <td>{pr.email || '—'}</td>
                        <td>
                          <Badge bg={pr.role === 'admin' ? 'danger' : 'secondary'}>{ROLE_LABELS[pr.role] || pr.role}</Badge>
                        </td>
                        <td>{pr.created_at ? new Date(pr.created_at).toLocaleDateString('fr-FR') : '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
}
