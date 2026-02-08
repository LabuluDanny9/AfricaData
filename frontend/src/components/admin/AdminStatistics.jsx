import { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { BarChart3, FileText, Download, Users, TrendingUp } from 'lucide-react';
import { getAdminStatistics } from 'services/admin';
import { isSupabaseConfigured } from 'lib/supabase';
import './AdminPages.css';

export default function AdminStatistics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    getAdminStatistics().then(({ data, error: err }) => {
      setLoading(false);
      if (err) setError(err.message || 'Erreur chargement');
      else setStats(data ?? null);
    });
  }, []);

  if (loading) {
    return (
      <div className="admin-loading py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="admin-page admin-statistics">
      <header className="admin-page-header">
        <h1>Statistiques</h1>
        <p>Vue d'ensemble : publications, téléchargements, utilisateurs, vues (données en temps réel).</p>
      </header>

      {error && (
        <Alert variant="warning" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Row className="g-3 mb-4">
        <Col xs={6} md={3}>
          <Card className="admin-kpi-card h-100">
            <Card.Body className="d-flex align-items-center gap-3">
              <div className="admin-kpi-icon bg-primary bg-opacity-10 text-primary">
                <FileText size={26} />
              </div>
              <div>
                <Card.Title className="mb-0 small text-muted">Publications</Card.Title>
                <span className="h4 mb-0 fw-bold">{stats?.publicationsCount ?? '—'}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="admin-kpi-card h-100">
            <Card.Body className="d-flex align-items-center gap-3">
              <div className="admin-kpi-icon bg-success bg-opacity-10 text-success">
                <Download size={26} />
              </div>
              <div>
                <Card.Title className="mb-0 small text-muted">Téléchargements</Card.Title>
                <span className="h4 mb-0 fw-bold">{stats?.totalDownloads ?? '—'}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="admin-kpi-card h-100">
            <Card.Body className="d-flex align-items-center gap-3">
              <div className="admin-kpi-icon bg-info bg-opacity-10 text-info">
                <Users size={26} />
              </div>
              <div>
                <Card.Title className="mb-0 small text-muted">Utilisateurs</Card.Title>
                <span className="h4 mb-0 fw-bold">{stats?.usersCount ?? '—'}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="admin-kpi-card h-100">
            <Card.Body className="d-flex align-items-center gap-3">
              <div className="admin-kpi-icon bg-warning bg-opacity-10 text-warning">
                <TrendingUp size={26} />
              </div>
              <div>
                <Card.Title className="mb-0 small text-muted">Vues (total)</Card.Title>
                <span className="h4 mb-0 fw-bold">{stats?.totalViews ?? '—'}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3">
        <Col xs={12} lg={6}>
          <Card className="admin-card admin-section-card h-100">
            <Card.Header>Activité par domaine</Card.Header>
            <Card.Body>
              <div className="admin-empty-state py-4">
                <div className="admin-empty-state-icon">
                  <BarChart3 size={36} />
                </div>
                <h3>Graphique à brancher</h3>
                <p className="small text-muted mb-0">Publications par domaine scientifique. Connectez une source de données ou un outil de reporting.</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card className="admin-card admin-section-card h-100">
            <Card.Header>Activité mensuelle</Card.Header>
            <Card.Body>
              <div className="admin-empty-state py-4">
                <div className="admin-empty-state-icon">
                  <TrendingUp size={36} />
                </div>
                <h3>Graphique à brancher</h3>
                <p className="small text-muted mb-0">Évolution des soumissions et validations. Idéal pour un tableau de bord analytique.</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
