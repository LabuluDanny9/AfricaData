import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Card, Row, Col, ListGroup, ProgressBar, Alert, Spinner } from 'react-bootstrap';
import { FileText, Clock, CheckCircle, Star, ArrowRight, PlusCircle, BookOpen } from 'lucide-react';
import { getMyPublicationStats } from 'services/publications';
import { useAuth } from 'context/AuthContext';
import { isSupabaseConfigured } from 'lib/supabase';
import { supabase } from 'lib/supabase';
import './DashboardUser.css';

const KPI_CONFIG = [
  { key: 'total', label: 'Mes publications', icon: FileText, color: 'primary', to: '/mes-publications' },
  { key: 'inAnalysis', label: 'En analyse', icon: Clock, color: 'warning', to: '/mes-publications' },
  { key: 'published', label: 'Validées', icon: CheckCircle, color: 'success', to: '/mes-publications' },
  { key: 'favoritesCount', label: 'Favoris', icon: Star, color: 'danger', to: '/favoris' },
];

export default function DashboardUser() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messageFromState, setMessageFromState] = useState(location.state?.message ?? null);
  const [stats, setStats] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingTimeline, setLoadingTimeline] = useState(true);

  useEffect(() => {
    if (location.state?.message) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state?.message, navigate]);

  useEffect(() => {
    if (!isSupabaseConfigured() || !user?.id) {
      setLoadingStats(false);
      return;
    }
    getMyPublicationStats(user.id).then(({ data }) => {
      setStats(data || { total: 0, inAnalysis: 0, published: 0, favoritesCount: 0 });
      setLoadingStats(false);
    }).catch(() => setLoadingStats(false));
  }, [user?.id]);

  useEffect(() => {
    if (!isSupabaseConfigured() || !user?.id) {
      setLoadingTimeline(false);
      return;
    }
    supabase
      .from('publications')
      .select('id, title, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(8)
      .then(({ data }) => {
        const items = (data || []).map((p) => {
          const type = p.status === 'published' ? 'validation' : p.status === 'rejected' ? 'rejet' : 'soumission';
          const title = p.status === 'published' ? 'Publication validée' : p.status === 'rejected' ? 'Rejet avec commentaire' : 'Publication envoyée';
          const text = p.status === 'published'
            ? `« ${(p.title || '').slice(0, 50)}… » a été publiée.`
            : p.status === 'rejected'
              ? `« ${(p.title || '').slice(0, 50)}… » — voir commentaire de l'admin.`
              : `« ${(p.title || '').slice(0, 50)}… » en cours de révision.`;
          return { id: p.id, type, title, text, date: p.created_at };
        });
        setTimeline(items);
        setLoadingTimeline(false);
      })
      .catch(() => setLoadingTimeline(false));
  }, [user?.id]);

  return (
    <div className="dashboard-user">
      {messageFromState && (
        <Alert variant="info" dismissible onClose={() => setMessageFromState(null)} className="mb-4">
          {messageFromState}
        </Alert>
      )}
      <header className="dashboard-user-header mb-4">
        <h1 className="h3 fw-bold mb-1">Tableau de bord</h1>
        <p className="text-body-secondary mb-0 small">Vue d'ensemble de votre activité</p>
      </header>

      {/* KPI Cards — données réelles */}
      <Row className="g-3 g-lg-4 mb-4">
        {KPI_CONFIG.map(({ key, label, icon: Icon, color, to }) => {
          const value = loadingStats ? '—' : (stats && stats[key] !== undefined ? stats[key] : 0);
          return (
            <Col key={label} xs={6} lg={3}>
              <Card as={Link} to={to} className="dashboard-user-kpi border-0 shadow-sm h-100 text-decoration-none text-body">
                <Card.Body className="d-flex align-items-center gap-3">
                  <div className={`dashboard-user-kpi-icon bg-${color} bg-opacity-10 text-${color} rounded-3 p-2`}>
                    <Icon size={24} />
                  </div>
                  <div className="flex-grow-1 min-w-0">
                    <div className="fw-bold fs-4">{value}</div>
                    <div className="small text-body-secondary">{label}</div>
                  </div>
                  <ArrowRight size={18} className="text-body-secondary flex-shrink-0" />
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      <Row>
        <Col lg={7} className="mb-4 mb-lg-0">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-transparent border-0 fw-bold d-flex align-items-center justify-content-between">
              <span>Dernières activités</span>
              <Link to="/mes-publications" className="small text-danger text-decoration-none">Voir tout</Link>
            </Card.Header>
            <Card.Body className="pt-0">
              {loadingTimeline ? (
                <div className="text-center py-4">
                  <Spinner animation="border" size="sm" variant="danger" />
                  <p className="small text-body-secondary mt-2 mb-0">Chargement des activités…</p>
                </div>
              ) : (
                <ListGroup variant="flush" className="dashboard-user-timeline">
                  {timeline.length === 0 ? (
                    <ListGroup.Item className="border-0 px-0 py-4 text-center text-body-secondary small">
                      Aucune activité récente. Vos soumissions et validations apparaîtront ici.
                    </ListGroup.Item>
                  ) : (
                    timeline.map((item) => (
                      <ListGroup.Item key={item.id} className="border-0 border-bottom px-0 py-3 d-flex gap-3">
                        <div className={`dashboard-user-timeline-dot bg-${item.type === 'validation' ? 'success' : item.type === 'rejet' ? 'danger' : 'warning'} rounded-circle flex-shrink-0`} />
                        <div className="flex-grow-1 min-w-0">
                          <div className="fw-semibold small">{item.title}</div>
                          <p className="small text-body-secondary mb-1">{item.text}</p>
                          <span className="small text-body-secondary">
                            {item.date ? new Date(item.date).toLocaleString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                      </ListGroup.Item>
                    ))
                  )}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={5}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <h3 className="h6 fw-bold mb-3">Soumission & publication</h3>
              <p className="small text-body-secondary mb-3">Soumettez un travail pour validation ou explorez les publications déjà en ligne.</p>
              <div className="d-grid gap-2">
                <Link to="/submit" className="btn btn-danger rounded-pill d-flex align-items-center justify-content-center gap-2">
                  <PlusCircle size={20} />
                  Soumettre une publication
                </Link>
                <Link to="/mes-publications" className="btn btn-outline-danger rounded-pill d-flex align-items-center justify-content-center gap-2">
                  <FileText size={20} />
                  Mes publications
                </Link>
                <Link to="/librairie" className="btn btn-outline-secondary rounded-pill d-flex align-items-center justify-content-center gap-2">
                  <BookOpen size={20} />
                  Explorer la bibliothèque
                </Link>
              </div>
            </Card.Body>
          </Card>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h3 className="h6 fw-bold mb-3">Progression</h3>
              <div className="small text-body-secondary mb-2">Publications validées</div>
              <ProgressBar
                now={stats && stats.total > 0 ? Math.round((stats.published / stats.total) * 100) : 0}
                variant="danger"
                className="mb-2"
                style={{ height: 8 }}
              />
              <div className="small text-body-secondary">
                {loadingStats ? '—' : `${stats?.published ?? 0} validées sur ${stats?.total ?? 0} soumises`}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
