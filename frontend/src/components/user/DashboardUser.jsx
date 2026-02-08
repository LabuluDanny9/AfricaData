import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Card, Row, Col, ListGroup, Badge, ProgressBar, Alert } from 'react-bootstrap';
import { FileText, Clock, CheckCircle, Star, ArrowRight, PlusCircle, BookOpen } from 'lucide-react';
import './DashboardUser.css';

const KPI_CARDS = [
  { label: 'Mes publications', value: 12, icon: FileText, color: 'primary', to: '/mes-publications' },
  { label: 'En analyse', value: 3, icon: Clock, color: 'warning', to: '/mes-publications' },
  { label: 'Validées', value: 9, icon: CheckCircle, color: 'success', to: '/mes-publications' },
  { label: 'Favoris', value: 5, icon: Star, color: 'danger', to: '/favoris' },
];

const TIMELINE_ITEMS = [
  { id: 1, type: 'validation', title: 'Publication validée', text: '"Impact des changements climatiques..." a été validée et publiée.', date: '2025-02-06 14:30' },
  { id: 2, type: 'comment', title: 'Nouveau commentaire', text: 'Dr. Marie K. a commenté "Analyse SIG pour la gestion...".', date: '2025-02-05 10:15' },
  { id: 3, type: 'soumission', title: 'Publication envoyée', text: '"Étude épidémiologique..." a été soumise pour révision.', date: '2025-02-04 09:00' },
  { id: 4, type: 'rejet', title: 'Rejet avec commentaire', text: '"Sécurité des systèmes..." — voir commentaire de l\'admin.', date: '2025-02-03 16:45' },
];

export default function DashboardUser() {
  const location = useLocation();
  const navigate = useNavigate();
  const [messageFromState, setMessageFromState] = useState(location.state?.message ?? null);

  useEffect(() => {
    if (location.state?.message) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []);

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

      {/* KPI Cards */}
      <Row className="g-3 g-lg-4 mb-4">
        {KPI_CARDS.map(({ label, value, icon: Icon, color, to }) => (
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
        ))}
      </Row>

      <Row>
        <Col lg={7} className="mb-4 mb-lg-0">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-transparent border-0 fw-bold d-flex align-items-center justify-content-between">
              <span>Dernières activités</span>
              <Link to="/mes-publications" className="small text-danger text-decoration-none">Voir tout</Link>
            </Card.Header>
            <Card.Body className="pt-0">
              <ListGroup variant="flush" className="dashboard-user-timeline">
                {TIMELINE_ITEMS.map((item) => (
                  <ListGroup.Item key={item.id} className="border-0 border-bottom px-0 py-3 d-flex gap-3">
                    <div className={`dashboard-user-timeline-dot bg-${item.type === 'validation' ? 'success' : item.type === 'rejet' ? 'danger' : item.type === 'comment' ? 'info' : 'warning'} rounded-circle flex-shrink-0`} />
                    <div className="flex-grow-1 min-w-0">
                      <div className="fw-semibold small">{item.title}</div>
                      <p className="small text-body-secondary mb-1">{item.text}</p>
                      <span className="small text-body-secondary">{item.date}</span>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
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
              <div className="small text-body-secondary mb-2">Publications validées ce mois</div>
              <ProgressBar now={75} variant="danger" className="mb-2" style={{ height: 8 }} />
              <div className="small text-body-secondary">9 validées sur 12 soumises</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
