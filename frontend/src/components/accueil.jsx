import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  InputGroup,
  Button,
  Badge,
  ListGroup,
} from 'react-bootstrap';
import {
  Search,
  BookOpen,
  ArrowRight,
  Globe,
  Users,
  Zap,
  FileText,
  TrendingUp,
  Shield,
  BarChart3,
  GraduationCap,
  ClipboardList,
  Mic,
  Database,
  Calendar,
  User,
  Eye,
  Download,
  MapPin,
  Phone,
  Mail,
  Linkedin,
  Twitter,
  Facebook,
  Sparkles,
} from 'lucide-react';
import AfricadataHeader from 'components/layout/AfricadataHeader';
import AfricadataFooter from 'components/layout/AfricadataFooter';
import { getPublications, subscribeToPublications, getPublicStats } from 'services/publications';
import { isSupabaseConfigured } from 'lib/supabase';
import 'components/layout/AfricadataHeader.css';
import './accueil.css';

const HERO_KEYS = [
  { key: 'publicationsCount', label: 'Publications indexées', suffix: '' },
  { key: 'usersCount', label: 'Chercheurs actifs', suffix: '' },
  { key: 'totalViews', label: 'Consultations', suffix: '' },
];

const featureList = [
  { icon: Globe, title: 'Portée africaine', description: 'Hub commun pour connecter les laboratoires du continent.' },
  { icon: Shield, title: 'Qualité certifiée', description: 'Validation éditoriale rigoureuse et traçabilité complète.' },
  { icon: Zap, title: 'Indexation rapide', description: 'Recherche plein texte, filtres et suggestions intelligentes.' },
  { icon: BarChart3, title: 'Analytique temps réel', description: 'Mesurez l\'impact de vos travaux en un coup d\'œil.' },
  { icon: Users, title: 'Rôles et workflows', description: 'Gestion fine : lecteur, auteur, éditeur, admin.' },
  { icon: BookOpen, title: 'Open science', description: 'Conformité Open Access, DOI et intégration ORCID.' },
];

const STAT_KEYS = [
  { key: 'totalViews', icon: FileText, label: 'Consultations', description: 'Lectures et téléchargements' },
  { key: 'totalDownloads', icon: TrendingUp, label: 'Téléchargements', description: 'PDF téléchargés' },
  { key: 'publicationsCount', icon: FileText, label: 'Publications', description: 'En ligne sur la plateforme' },
  { key: 'usersCount', icon: Users, label: 'Utilisateurs', description: 'Inscrits sur AfricaData' },
];

const publicationCategories = [
  { icon: FileText, title: 'Articles scientifiques', description: 'Résultats évalués par les pairs' },
  { icon: GraduationCap, title: 'Thèses & mémoires', description: 'Travaux de fin d\'études et doctorats' },
  { icon: ClipboardList, title: 'Rapports & études', description: 'Rapports techniques et livrables' },
  { icon: Mic, title: 'Actes de conférences', description: 'Présentations et communications' },
  { icon: BookOpen, title: 'Livres & chapitres', description: 'Ouvrages de référence' },
  { icon: Database, title: 'Données ouvertes', description: 'Jeux de données FAIR et protocoles' },
];

const contactInfoCards = [
  { icon: MapPin, title: 'Adresse', lines: ['Centre de collecte de données numériques', 'LUBUMBASHI, RDC'], highlight: null },
  { icon: Phone, title: 'Contact', lines: ['+243 99 123 45 67', 'support@africadata.org'], highlight: 'Support 7j/7' },
  { icon: Mail, title: 'Partenariats', lines: ['partners@africadata.org', 'media@africadata.org'], highlight: 'Réponse sous 4h' },
];

const socialLinks = [
  { icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/company/africadata' },
  { icon: Twitter, label: 'Twitter', href: 'https://twitter.com/africadata' },
  { icon: Facebook, label: 'Facebook', href: 'https://www.facebook.com/africadata' },
];

const RECENT_PUBLICATIONS_LIMIT = 6;

function Accueil() {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentPublications, setRecentPublications] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [publicStats, setPublicStats] = useState(null);
  const navigate = useNavigate();

  const fetchRecent = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    setLoadingRecent(true);
    const { data } = await getPublications({});
    if (data && Array.isArray(data)) {
      setRecentPublications(data.slice(0, RECENT_PUBLICATIONS_LIMIT));
    }
    setLoadingRecent(false);
  }, []);

  useEffect(() => {
    fetchRecent();
  }, [fetchRecent]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    getPublicStats().then(({ data }) => {
      if (data) setPublicStats(data);
    });
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const unsubscribe = subscribeToPublications(() => {
      fetchRecent();
      getPublicStats().then(({ data }) => data && setPublicStats(data));
    });
    return unsubscribe;
  }, [fetchRecent]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/librairie?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="accueil-page min-vh-100 d-flex flex-column">
      <AfricadataHeader />

      {/* Hero — Collecte & publication scientifique */}
      <section className="accueil-hero py-5 py-lg-6">
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg="10" xl="8">
              <img src="/logo.png" alt="AfricaData" className="accueil-hero-logo mx-auto mb-4" />
              <Badge bg="danger" className="mb-3 px-3 py-2 rounded-pill d-inline-flex align-items-center gap-2">
                <Database size={18} />
                Centre de collecte de données scientifiques
              </Badge>
              <h1 className="display-5 fw-bold mb-3 accueil-hero-title">
                Valorisez la recherche africaine avec AfricaData
              </h1>
              <p className="lead text-body-secondary mb-4">
                Collectez, validez et diffusez vos publications dans un environnement stable,
                conforme aux standards Open Science et prêt pour la visibilité internationale.
              </p>
              <Form onSubmit={handleSearch} className="accueil-search-form">
                <InputGroup size="lg" className="shadow-sm rounded-3 overflow-hidden">
                  <InputGroup.Text className="bg-body border-end-0">
                    <Search size={20} className="text-danger" />
                  </InputGroup.Text>
                  <Form.Control
                    type="search"
                    placeholder="Auteur, laboratoire, mot-clé..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-start-0"
                    aria-label="Rechercher une publication"
                  />
                  <Button type="submit" variant="danger" className="px-4">
                    Rechercher
                  </Button>
                </InputGroup>
                <p className="small text-body-secondary mt-2 mb-0">
                  Indexation Google Scholar, DOI et OAI-PMH native.
                </p>
              </Form>
              <Row className="g-3 mt-4 justify-content-center">
                {HERO_KEYS.map((h) => {
                  const raw = publicStats?.[h.key] ?? 0;
                  const value = typeof raw === 'number' && raw >= 1000 ? `${(raw / 1000).toFixed(1).replace('.', ',')}K+` : String(raw);
                  return (
                    <Col xs="6" md="4" key={h.label}>
                      <Card className="accueil-stat-card h-100 border-0 shadow-sm">
                        <Card.Body className="py-3">
                          <span className="d-block fs-4 fw-bold text-danger">{publicStats ? value : '—'}</span>
                          <span className="small text-body-secondary">{h.label}</span>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
              <div className="d-flex flex-wrap justify-content-center gap-3 mt-4 small text-body-secondary">
                <span>Accès auteur sécurisé</span>
                <span className="d-none d-md-inline">•</span>
                <span>Archivage long terme</span>
                <span className="d-none d-md-inline">•</span>
                <span>Support multilingue</span>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Indicateurs */}
      <section className="py-5 bg-body-secondary">
        <Container>
          <div className="text-center mb-4">
            <BarChart3 size={24} className="text-danger me-2" />
            <span className="text-uppercase small fw-semibold text-body-secondary">Indicateurs en temps réel</span>
          </div>
          <Row className="g-4">
            {STAT_KEYS.map((stat) => {
              const Icon = stat.icon;
              const raw = publicStats?.[stat.key] ?? 0;
              const value = typeof raw === 'number' && raw >= 1000 ? `${(raw / 1000).toFixed(1).replace('.', ',')}K+` : String(raw);
              return (
                <Col xs="12" sm="6" lg="3" key={stat.label}>
                  <Card className="accueil-feature-card h-100 border-0 shadow-sm">
                    <Card.Body>
                      <div className="d-flex align-items-start gap-3">
                        <div className="accueil-icon-wrap rounded-3 d-flex align-items-center justify-content-center flex-shrink-0">
                          <Icon size={22} className="text-danger" />
                        </div>
                        <div>
                          <span className="d-block fs-4 fw-bold">{publicStats ? value : '—'}</span>
                          <span className="small fw-medium text-body-secondary">{stat.label}</span>
                          <p className="small text-body-secondary mb-0 mt-1">{stat.description}</p>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Container>
      </section>

      {/* Pourquoi AfricaData */}
      <section className="py-5">
        <Container>
          <Row className="justify-content-center text-center mb-5">
            <Col lg="8">
              <Badge bg="outline-danger" className="mb-2 px-3 py-2 rounded-pill">Pourquoi AfricaData ?</Badge>
              <h2 className="h3 fw-bold mb-3">Un socle unique pour la chaîne de valeur de la recherche</h2>
              <p className="text-body-secondary">
                Outils éditoriaux, workflows sécurisés et tableaux de bord pour auteurs, éditeurs et administrateurs.
              </p>
            </Col>
          </Row>
          <Row className="g-4">
            {featureList.map((f) => {
              const Icon = f.icon;
              return (
                <Col xs="12" md="6" lg="4" key={f.title}>
                  <Card className="accueil-feature-card h-100 border-0 shadow-sm">
                    <Card.Body>
                      <div className="accueil-icon-wrap rounded-3 d-inline-flex align-items-center justify-content-center mb-3">
                        <Icon size={24} className="text-danger" />
                      </div>
                      <Card.Title className="h6 fw-bold">{f.title}</Card.Title>
                      <Card.Text className="small text-body-secondary mb-0">{f.description}</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Container>
      </section>

      {/* Types de publications */}
      <section className="py-5 bg-body-secondary">
        <Container>
          <Row className="align-items-end justify-content-between mb-4">
            <Col lg="8">
              <div className="d-flex align-items-center gap-2 text-body-secondary small text-uppercase fw-semibold mb-2">
                <BookOpen size={18} /> Collections
              </div>
              <h2 className="h4 fw-bold mb-2">Types de publications acceptées</h2>
              <p className="text-body-secondary small mb-0">
                Un répertoire sécurisé, interopérable et prêt pour la diffusion internationale.
              </p>
            </Col>
            <Col lg="4" className="text-lg-end mt-3 mt-lg-0">
              <Button as={Link} to="/librairie" variant="outline-danger" className="rounded-pill">
                Voir la bibliothèque <ArrowRight size={18} className="ms-1" />
              </Button>
            </Col>
          </Row>
          <Row className="g-4">
            {publicationCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Col xs="12" md="6" lg="4" key={cat.title}>
                  <Card className="accueil-feature-card h-100 border-0 shadow-sm">
                    <Card.Body>
                      <div className="accueil-icon-wrap rounded-3 d-inline-flex align-items-center justify-content-center mb-3">
                        <Icon size={22} className="text-danger" />
                      </div>
                      <Card.Title className="h6 fw-bold">{cat.title}</Card.Title>
                      <Card.Text className="small text-body-secondary mb-0">{cat.description}</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Container>
      </section>

      {/* Publications récentes */}
      <section className="py-5">
        <Container>
          <Row className="align-items-end justify-content-between mb-4">
            <Col lg="8">
              <div className="d-flex align-items-center gap-2 text-danger small text-uppercase fw-semibold mb-2">
                <FileText size={18} /> Nouveautés
              </div>
              <h2 className="h4 fw-bold mb-2">Publications récentes</h2>
              <p className="text-body-secondary small mb-0">
                Derniers travaux validés par les comités scientifiques.
              </p>
            </Col>
            <Col lg="4" className="text-lg-end mt-3 mt-lg-0">
              <Button as={Link} to="/librairie" variant="danger" className="rounded-pill">
                Toutes les publications <ArrowRight size={18} className="ms-1" />
              </Button>
            </Col>
          </Row>
          {loadingRecent ? (
            <p className="text-body-secondary small text-center py-4">Chargement des publications récentes…</p>
          ) : (
            <ListGroup variant="flush" className="accueil-publications-list">
              {recentPublications.map((pub) => (
                <ListGroup.Item key={pub.id} className="accueil-pub-item border-0 border-bottom py-4 px-0">
                  <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                    <Badge bg="secondary" className="rounded-pill">{pub.type}</Badge>
                    <Badge bg="light" text="dark" className="rounded-pill">{pub.domain}</Badge>
                    {pub.region && <Badge bg="outline-secondary" className="rounded-pill">{pub.region}</Badge>}
                    <Badge bg="success" className="rounded-pill">Open Access</Badge>
                  </div>
                  <Link to={`/publication/${pub.id}`} className="h6 fw-semibold text-decoration-none accueil-pub-link d-block mb-2">
                    {pub.title}
                  </Link>
                  <div className="d-flex flex-wrap align-items-center gap-3 small text-body-secondary">
                    {pub.author && <span className="d-flex align-items-center gap-1"><User size={14} /> {pub.author}</span>}
                    <span className="d-flex align-items-center gap-1"><Calendar size={14} /> {pub.created_at ? new Date(pub.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : pub.year}</span>
                    <span className="d-flex align-items-center gap-1"><Eye size={14} /> {pub.views ?? 0}</span>
                    <span className="d-flex align-items-center gap-1"><Download size={14} /> {pub.downloads ?? 0}</span>
                  </div>
                  <Button as={Link} to={`/publication/${pub.id}`} variant="link" size="sm" className="p-0 mt-2 text-danger fw-medium">
                    Lire →
                  </Button>
                </ListGroup.Item>
              ))}
              {!loadingRecent && recentPublications.length === 0 && (
                <ListGroup.Item className="accueil-pub-item border-0 py-4 px-0 text-body-secondary text-center">
                  Aucune publication pour le moment. Revenez bientôt.
                </ListGroup.Item>
              )}
            </ListGroup>
          )}
        </Container>
      </section>

      {/* Contact & réseaux */}
      <section className="py-5 bg-body-secondary">
        <Container>
          <div className="text-center mb-4">
            <span className="small text-uppercase fw-semibold text-body-secondary">Coordonnées officielles</span>
            <h2 className="h5 fw-bold mt-2 mb-2">Informations pratiques</h2>
            <p className="text-body-secondary small">Adresse, contacts et réseaux pour rester connectés.</p>
          </div>
          <Row className="g-4">
            {contactInfoCards.map((c) => {
              const Icon = c.icon;
              return (
                <Col xs="12" md="6" lg="4" key={c.title}>
                  <Card className="accueil-feature-card h-100 border-0 shadow-sm">
                    <Card.Body>
                      <div className="accueil-icon-wrap rounded-3 d-inline-flex align-items-center justify-content-center mb-3">
                        <Icon size={22} className="text-danger" />
                      </div>
                      <Card.Title className="h6 fw-bold">{c.title}</Card.Title>
                      <ListGroup variant="flush" className="small text-body-secondary">
                        {c.lines.map((line, i) => (
                          <ListGroup.Item key={i} className="border-0 px-0 py-1 bg-transparent">{line}</ListGroup.Item>
                        ))}
                      </ListGroup>
                      {c.highlight && <p className="small fw-semibold text-danger mb-0 mt-2">{c.highlight}</p>}
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
            <Col xs="12" md="6" lg="4">
              <Card className="accueil-feature-card h-100 border-0 shadow-sm">
                <Card.Body>
                  <div className="accueil-icon-wrap rounded-3 d-inline-flex align-items-center justify-content-center mb-3">
                    <Users size={22} className="text-danger" />
                  </div>
                  <Card.Title className="h6 fw-bold">Réseaux sociaux</Card.Title>
                  <Card.Text className="small text-body-secondary mb-3">
                    Annonces officielles, appels à projets et statistiques en direct.
                  </Card.Text>
                  <div className="d-flex gap-2">
                    {socialLinks.map((s) => {
                      const Icon = s.icon;
                      return (
                        <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="accueil-social-btn rounded-circle d-flex align-items-center justify-content-center" aria-label={`Africadata sur ${s.label}`}>
                          <Icon size={20} />
                        </a>
                      );
                    })}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-5">
        <Container>
          <Card className="accueil-cta-card border-0 overflow-hidden">
            <Card.Body className="p-4 p-lg-5 text-center text-lg-start">
              <Row className="align-items-center">
                <Col lg="8">
                  <div className="d-flex align-items-center gap-2 text-white-50 small text-uppercase mb-2">
                    <Sparkles size={20} /> Action
                  </div>
                  <h2 className="h4 fw-bold text-white mb-2">
                    Prêt(e) à rejoindre la communauté AfricaData ?
                  </h2>
                  <p className="text-white mb-0 opacity-90">
                    Publiez vos travaux, suivez vos évaluations et collaborez avec un réseau d'experts africains.
                  </p>
                </Col>
                <Col lg="4" className="mt-4 mt-lg-0 text-lg-end">
                  <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center justify-content-lg-end">
                    <Button as={Link} to="/inscription" variant="light" size="lg" className="rounded-pill px-4">
                      Créer un compte auteur <ArrowRight size={18} className="ms-1" />
                    </Button>
                    <Button as={Link} to="/about" variant="outline-light" size="lg" className="rounded-pill px-4">
                      Découvrir la mission
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Container>
      </section>

      <AfricadataFooter />
    </div>
  );
}

export default Accueil;
