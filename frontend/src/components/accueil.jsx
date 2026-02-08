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
import { useTranslation } from 'react-i18next';
import AfricadataHeader from 'components/layout/AfricadataHeader';
import AfricadataFooter from 'components/layout/AfricadataFooter';
import { getPublications, subscribeToPublications, getPublicStats } from 'services/publications';
import { isSupabaseConfigured } from 'lib/supabase';
import 'components/layout/AfricadataHeader.css';
import './accueil.css';

const HERO_KEYS = [
  { key: 'publicationsCount', labelKey: 'home.indexedPublications' },
  { key: 'usersCount', labelKey: 'home.activeResearchers' },
  { key: 'totalViews', labelKey: 'home.views' },
];

const FEATURE_KEYS = [
  { icon: Globe, titleKey: 'home.africanReach', descKey: 'home.africanReachDesc' },
  { icon: Shield, titleKey: 'home.certifiedQuality', descKey: 'home.certifiedQualityDesc' },
  { icon: Zap, titleKey: 'home.fastIndexing', descKey: 'home.fastIndexingDesc' },
  { icon: BarChart3, titleKey: 'home.realtimeAnalytics', descKey: 'home.realtimeAnalyticsDesc' },
  { icon: Users, titleKey: 'home.rolesWorkflows', descKey: 'home.rolesWorkflowsDesc' },
  { icon: BookOpen, titleKey: 'home.openScience', descKey: 'home.openScienceDesc' },
];

const STAT_KEYS = [
  { key: 'totalViews', icon: FileText, labelKey: 'home.statsViews', descKey: 'home.statsViewsDesc' },
  { key: 'totalDownloads', icon: TrendingUp, labelKey: 'home.statsDownloads', descKey: 'home.statsDownloadsDesc' },
  { key: 'publicationsCount', icon: FileText, labelKey: 'home.statsPublications', descKey: 'home.statsPublicationsDesc' },
  { key: 'usersCount', icon: Users, labelKey: 'home.statsUsers', descKey: 'home.statsUsersDesc' },
];

const PUB_CATEGORY_KEYS = [
  { icon: FileText, titleKey: 'home.catScientificArticles', descKey: 'home.catScientificArticlesDesc' },
  { icon: GraduationCap, titleKey: 'home.catTheses', descKey: 'home.catThesesDesc' },
  { icon: ClipboardList, titleKey: 'home.catReports', descKey: 'home.catReportsDesc' },
  { icon: Mic, titleKey: 'home.catProceedings', descKey: 'home.catProceedingsDesc' },
  { icon: BookOpen, titleKey: 'home.catBooks', descKey: 'home.catBooksDesc' },
  { icon: Database, titleKey: 'home.catOpenData', descKey: 'home.catOpenDataDesc' },
];

const socialLinks = [
  { icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/company/africadata' },
  { icon: Twitter, label: 'Twitter', href: 'https://twitter.com/africadata' },
  { icon: Facebook, label: 'Facebook', href: 'https://www.facebook.com/africadata' },
];

const RECENT_PUBLICATIONS_LIMIT = 6;

function Accueil() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentPublications, setRecentPublications] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [publicStats, setPublicStats] = useState(null);
  const navigate = useNavigate();

  const contactInfoCards = [
    { icon: MapPin, titleKey: 'home.address', lines: [t('home.addressLine1'), t('home.addressLine2')], highlightKey: null },
    { icon: Phone, titleKey: 'home.contact', lines: ['+243 99 123 45 67', 'support@africadata.org'], highlightKey: 'home.support247' },
    { icon: Mail, titleKey: 'home.partnerships', lines: ['partners@africadata.org', 'media@africadata.org'], highlightKey: 'home.response4h' },
  ];

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
                {t('home.heroBadge')}
              </Badge>
              <h1 className="display-5 fw-bold mb-3 accueil-hero-title">
                {t('home.heroTitle')}
              </h1>
              <p className="lead text-body-secondary mb-4">
                {t('home.heroLead')}
              </p>
              <Form onSubmit={handleSearch} className="accueil-search-form">
                <InputGroup size="lg" className="shadow-sm rounded-3 overflow-hidden">
                  <InputGroup.Text className="bg-body border-end-0">
                    <Search size={20} className="text-danger" />
                  </InputGroup.Text>
                  <Form.Control
                    type="search"
                    placeholder={t('home.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-start-0"
                    aria-label={t('home.searchButton')}
                  />
                  <Button type="submit" variant="danger" className="px-4">
                    {t('home.searchButton')}
                  </Button>
                </InputGroup>
                <p className="small text-body-secondary mt-2 mb-0">
                  {t('home.indexingNote')}
                </p>
              </Form>
              <Row className="g-3 mt-4 justify-content-center">
                {HERO_KEYS.map((h) => {
                  const raw = publicStats?.[h.key] ?? 0;
                  const value = typeof raw === 'number' && raw >= 1000 ? `${(raw / 1000).toFixed(1).replace('.', ',')}K+` : String(raw);
                  return (
                    <Col xs="6" md="4" key={h.labelKey}>
                      <Card className="accueil-stat-card h-100 border-0 shadow-sm">
                        <Card.Body className="py-3">
                          <span className="d-block fs-4 fw-bold text-danger">{publicStats ? value : '—'}</span>
                          <span className="small text-body-secondary">{t(h.labelKey)}</span>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
              <div className="d-flex flex-wrap justify-content-center gap-3 mt-4 small text-body-secondary">
                <span>{t('home.secureAccess')}</span>
                <span className="d-none d-md-inline">•</span>
                <span>{t('home.longTermArchive')}</span>
                <span className="d-none d-md-inline">•</span>
                <span>{t('home.multilingualSupport')}</span>
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
            <span className="text-uppercase small fw-semibold text-body-secondary">{t('home.realtimeIndicators')}</span>
          </div>
          <Row className="g-4">
            {STAT_KEYS.map((stat) => {
              const Icon = stat.icon;
              const raw = publicStats?.[stat.key] ?? 0;
              const value = typeof raw === 'number' && raw >= 1000 ? `${(raw / 1000).toFixed(1).replace('.', ',')}K+` : String(raw);
              return (
                <Col xs="12" sm="6" lg="3" key={stat.labelKey}>
                  <Card className="accueil-feature-card h-100 border-0 shadow-sm">
                    <Card.Body>
                      <div className="d-flex align-items-start gap-3">
                        <div className="accueil-icon-wrap rounded-3 d-flex align-items-center justify-content-center flex-shrink-0">
                          <Icon size={22} className="text-danger" />
                        </div>
                        <div>
                          <span className="d-block fs-4 fw-bold">{publicStats ? value : '—'}</span>
                          <span className="small fw-medium text-body-secondary">{t(stat.labelKey)}</span>
                          <p className="small text-body-secondary mb-0 mt-1">{t(stat.descKey)}</p>
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
              <Badge bg="outline-danger" className="mb-2 px-3 py-2 rounded-pill">{t('home.featuresTitle')}</Badge>
              <h2 className="h3 fw-bold mb-3">{t('home.uniquePlatform')}</h2>
              <p className="text-body-secondary">
                {t('home.uniquePlatformDesc')}
              </p>
            </Col>
          </Row>
          <Row className="g-4">
            {FEATURE_KEYS.map((f) => {
              const Icon = f.icon;
              return (
                <Col xs="12" md="6" lg="4" key={f.titleKey}>
                  <Card className="accueil-feature-card h-100 border-0 shadow-sm">
                    <Card.Body>
                      <div className="accueil-icon-wrap rounded-3 d-inline-flex align-items-center justify-content-center mb-3">
                        <Icon size={24} className="text-danger" />
                      </div>
                      <Card.Title className="h6 fw-bold">{t(f.titleKey)}</Card.Title>
                      <Card.Text className="small text-body-secondary mb-0">{t(f.descKey)}</Card.Text>
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
                <BookOpen size={18} /> {t('home.collections')}
              </div>
              <h2 className="h4 fw-bold mb-2">{t('home.publicationTypesTitle')}</h2>
              <p className="text-body-secondary small mb-0">
                {t('home.publicationTypesDesc')}
              </p>
            </Col>
            <Col lg="4" className="text-lg-end mt-3 mt-lg-0">
              <Button as={Link} to="/librairie" variant="outline-danger" className="rounded-pill">
                {t('home.viewLibrary')} <ArrowRight size={18} className="ms-1" />
              </Button>
            </Col>
          </Row>
          <Row className="g-4">
            {PUB_CATEGORY_KEYS.map((cat) => {
              const Icon = cat.icon;
              return (
                <Col xs="12" md="6" lg="4" key={cat.titleKey}>
                  <Card className="accueil-feature-card h-100 border-0 shadow-sm">
                    <Card.Body>
                      <div className="accueil-icon-wrap rounded-3 d-inline-flex align-items-center justify-content-center mb-3">
                        <Icon size={22} className="text-danger" />
                      </div>
                      <Card.Title className="h6 fw-bold">{t(cat.titleKey)}</Card.Title>
                      <Card.Text className="small text-body-secondary mb-0">{t(cat.descKey)}</Card.Text>
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
                <FileText size={18} /> {t('home.recentBadge')}
              </div>
              <h2 className="h4 fw-bold mb-2">{t('home.recentPublications')}</h2>
              <p className="text-body-secondary small mb-0">
                {t('home.recentDesc')}
              </p>
            </Col>
            <Col lg="4" className="text-lg-end mt-3 mt-lg-0">
              <Button as={Link} to="/librairie" variant="danger" className="rounded-pill">
                {t('home.viewAllPublications')} <ArrowRight size={18} className="ms-1" />
              </Button>
            </Col>
          </Row>
          {loadingRecent ? (
            <p className="text-body-secondary small text-center py-4">{t('home.loadingRecent')}</p>
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
                    {pub.author && (
                      <span className="d-flex align-items-center gap-2">
                        {pub.author_photo_url ? (
                          <img src={pub.author_photo_url} alt="" className="rounded-circle object-fit-cover" style={{ width: 24, height: 24 }} />
                        ) : (
                          <span className="rounded-circle bg-secondary bg-opacity-25 d-inline-flex align-items-center justify-content-center" style={{ width: 24, height: 24 }}>
                            <User size={12} className="text-secondary" />
                          </span>
                        )}
                        {pub.author}
                      </span>
                    )}
                    <span className="d-flex align-items-center gap-1"><Calendar size={14} /> {pub.created_at ? new Date(pub.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : pub.year}</span>
                    <span className="d-flex align-items-center gap-1"><Eye size={14} /> {pub.views ?? 0}</span>
                    <span className="d-flex align-items-center gap-1"><Download size={14} /> {pub.downloads ?? 0}</span>
                  </div>
                  <Button as={Link} to={`/publication/${pub.id}`} variant="link" size="sm" className="p-0 mt-2 text-danger fw-medium">
                    {t('home.readMore')}
                  </Button>
                </ListGroup.Item>
              ))}
              {!loadingRecent && recentPublications.length === 0 && (
                <ListGroup.Item className="accueil-pub-item border-0 py-4 px-0 text-body-secondary text-center">
                  {t('home.noPublicationsYet')}
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
            <span className="small text-uppercase fw-semibold text-body-secondary">{t('home.contactOfficial')}</span>
            <h2 className="h5 fw-bold mt-2 mb-2">{t('home.contactPractical')}</h2>
            <p className="text-body-secondary small">{t('home.contactPracticalDesc')}</p>
          </div>
          <Row className="g-4">
            {contactInfoCards.map((c) => {
              const Icon = c.icon;
              return (
                <Col xs="12" md="6" lg="4" key={c.titleKey}>
                  <Card className="accueil-feature-card h-100 border-0 shadow-sm">
                    <Card.Body>
                      <div className="accueil-icon-wrap rounded-3 d-inline-flex align-items-center justify-content-center mb-3">
                        <Icon size={22} className="text-danger" />
                      </div>
                      <Card.Title className="h6 fw-bold">{t(c.titleKey)}</Card.Title>
                      <ListGroup variant="flush" className="small text-body-secondary">
                        {c.lines.map((line, i) => (
                          <ListGroup.Item key={i} className="border-0 px-0 py-1 bg-transparent">{line}</ListGroup.Item>
                        ))}
                      </ListGroup>
                      {c.highlightKey && <p className="small fw-semibold text-danger mb-0 mt-2">{t(c.highlightKey)}</p>}
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
                  <Card.Title className="h6 fw-bold">{t('home.socialNetworks')}</Card.Title>
                  <Card.Text className="small text-body-secondary mb-3">
                    {t('home.socialNetworksDesc')}
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
                    <Sparkles size={20} /> {t('home.ctaAction')}
                  </div>
                  <h2 className="h4 fw-bold text-white mb-2">
                    {t('home.ctaTitleAlt')}
                  </h2>
                  <p className="text-white mb-0 opacity-90">
                    {t('home.ctaSubtitleAlt')}
                  </p>
                </Col>
                <Col lg="4" className="mt-4 mt-lg-0 text-lg-end">
                  <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center justify-content-lg-end">
                    <Button as={Link} to="/inscription" variant="light" size="lg" className="rounded-pill px-4">
                      {t('home.ctaButtonAuthor')} <ArrowRight size={18} className="ms-1" />
                    </Button>
                    <Button as={Link} to="/about" variant="outline-light" size="lg" className="rounded-pill px-4">
                      {t('home.discoverMission')}
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
