import { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { BarChart3, FileText, Download, Users, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { getAdminStatistics, getAdminStatsByDomain, getAdminMonthlyTrend } from 'services/admin';
import { isSupabaseConfigured } from 'lib/supabase';
import './AdminPages.css';

export default function AdminStatistics() {
  const [stats, setStats] = useState(null);
  const [byDomain, setByDomain] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCharts, setLoadingCharts] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      setLoadingCharts(false);
      return;
    }
    getAdminStatistics().then(({ data, error: err }) => {
      setLoading(false);
      if (err) setError(err.message || 'Erreur chargement');
      else setStats(data ?? null);
    });
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    setLoadingCharts(true);
    Promise.all([getAdminStatsByDomain(), getAdminMonthlyTrend(12)])
      .then(([domainRes, trendRes]) => {
        if (!domainRes.error) setByDomain(domainRes.data || []);
        if (!trendRes.error) setMonthlyTrend(trendRes.data || []);
        setLoadingCharts(false);
      })
      .catch(() => setLoadingCharts(false));
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
              {loadingCharts ? (
                <div className="d-flex align-items-center justify-content-center py-5">
                  <Spinner animation="border" size="sm" variant="primary" />
                </div>
              ) : byDomain.length === 0 ? (
                <div className="admin-empty-state py-4">
                  <div className="admin-empty-state-icon">
                    <BarChart3 size={36} />
                  </div>
                  <h3>Aucune donnée</h3>
                  <p className="small text-muted mb-0">Les publications par domaine apparaîtront ici une fois des publications publiées.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={byDomain} margin={{ top: 12, right: 12, left: 0, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="domain" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ fontSize: 12 }}
                      formatter={(value) => [value, 'Publications']}
                      labelFormatter={(label) => `Domaine : ${label}`}
                    />
                    <Bar dataKey="count" name="Publications" fill="var(--bs-primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card className="admin-card admin-section-card h-100">
            <Card.Header>Activité mensuelle</Card.Header>
            <Card.Body>
              {loadingCharts ? (
                <div className="d-flex align-items-center justify-content-center py-5">
                  <Spinner animation="border" size="sm" variant="primary" />
                </div>
              ) : monthlyTrend.length === 0 ? (
                <div className="admin-empty-state py-4">
                  <div className="admin-empty-state-icon">
                    <TrendingUp size={36} />
                  </div>
                  <h3>Aucune donnée</h3>
                  <p className="small text-muted mb-0">L'évolution des soumissions et validations apparaîtra ici.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={monthlyTrend} margin={{ top: 12, right: 12, left: 0, bottom: 12 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ fontSize: 12 }}
                      formatter={(value, name) => [value, name === 'soumissions' ? 'Soumissions' : name === 'publiees' ? 'Publiées' : name === 'brouillons' ? 'Brouillons' : 'Rejetées']}
                      labelFormatter={(label) => `Mois : ${label}`}
                    />
                    <Legend formatter={(value) => (value === 'soumissions' ? 'Soumissions' : value === 'publiees' ? 'Publiées' : value === 'brouillons' ? 'Brouillons' : 'Rejetées')} />
                    <Line type="monotone" dataKey="soumissions" name="soumissions" stroke="var(--bs-warning)" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="publiees" name="publiees" stroke="var(--bs-success)" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="brouillons" name="brouillons" stroke="var(--bs-secondary)" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="rejetees" name="rejetees" stroke="var(--bs-danger)" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
