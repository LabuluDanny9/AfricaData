import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Form,
  InputGroup,
  Button,
  Card,
  Accordion,
  Offcanvas,
  Badge,
  Pagination,
} from 'react-bootstrap';
import { Search, Filter, Star, BookOpen, Download, X, Eye, TrendingUp, User } from 'lucide-react';
import AfricadataHeader from 'components/layout/AfricadataHeader';
import AfricadataFooter from 'components/layout/AfricadataFooter';
import RatingStars from 'components/ui/RatingStars';
import { getPublications, getFavorites, toggleFavorite as apiToggleFavorite, subscribeToPublications } from 'services/publications';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'context/AuthContext';
import { isSupabaseConfigured } from 'lib/supabase';
import 'components/layout/AfricadataHeader.css';
import 'components/ui/RatingStars.css';
import './librairie.css';

/* Filtres adaptés à une plateforme internationale (sans référence aux facultés) */
const DOMAINS = ['Informatique', 'IA & Data Science', 'Réseaux & Télécoms', 'Médecine & Santé', 'Sciences agronomiques', 'Sciences économiques', 'Ingénierie', 'Environnement', 'Sciences sociales', 'Énergie'];
const TYPES = ['Article', 'Mémoire', 'Thèse', 'Rapport', 'Prépublication', 'Étude de cas', 'Livre blanc', 'Revue de littérature'];
const LANGUES = ['Français', 'English', 'Español', 'العربية', 'Português'];
const REGIONS = ['Afrique', 'Europe', 'Amériques', 'Asie-Océanie', 'International'];
const ANNEES = ['2025', '2024', '2023', '2022', '2021'];

const RESULTS_PER_PAGE = 10;

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debouncedValue;
}

function truncate(str, maxLines = 2) {
  if (!str) return '';
  const lines = str.split(/\s+/);
  const truncated = lines.slice(0, 15).join(' ');
  return lines.length > 15 ? truncated + '…' : truncated;
}

export default function Librairie({ embedded = false }) {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState('');
  const [domain, setDomain] = useState('');
  const [typeDoc, setTypeDoc] = useState('');
  const [language, setLanguage] = useState('');
  const [region, setRegion] = useState('');
  const [year, setYear] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [publicationsList, setPublicationsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const { user } = useAuth();

  const debouncedSearch = useDebounce(searchInput, 300);

  const refetchPublications = useCallback(() => {
    if (!isSupabaseConfigured()) return;
    setLoading(true);
    getPublications({
      search: debouncedSearch.trim() || undefined,
      domain: domain || undefined,
      type: typeDoc || undefined,
      language: language || undefined,
      region: region || undefined,
      year: year || undefined,
    })
      .then(({ data }) => {
        if (data && data.length >= 0) setPublicationsList(data);
      })
      .finally(() => setLoading(false));
  }, [debouncedSearch, domain, typeDoc, language, region, year]);

  useEffect(() => {
    refetchPublications();
  }, [refetchPublications]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const unsubscribe = subscribeToPublications(() => {
      refetchPublications();
    });
    return unsubscribe;
  }, [refetchPublications]);

  useEffect(() => {
    if (isSupabaseConfigured() && user?.id) {
      getFavorites(user.id).then(({ data }) => {
        if (data) setFavorites(new Set(data));
      });
    }
  }, [user?.id]);

  const filtered = useMemo(() => {
    return publicationsList.filter((p) => {
      const matchSearch = !debouncedSearch.trim() ||
        p.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        p.author.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (p.summary && p.summary.toLowerCase().includes(debouncedSearch.toLowerCase()));
      const matchDomain = !domain || p.domain === domain;
      const matchType = !typeDoc || p.type === typeDoc;
      const matchLanguage = !language || p.language === language;
      const matchRegion = !region || p.region === region;
      const matchYear = !year || p.year === year;
      return matchSearch && matchDomain && matchType && matchLanguage && matchRegion && matchYear;
    });
  }, [publicationsList, debouncedSearch, domain, typeDoc, language, region, year]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / RESULTS_PER_PAGE));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * RESULTS_PER_PAGE;
    return filtered.slice(start, start + RESULTS_PER_PAGE);
  }, [filtered, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, domain, typeDoc, language, region, year]);

  const resetFilters = () => {
    setDomain('');
    setTypeDoc('');
    setLanguage('');
    setRegion('');
    setYear('');
    setSearchInput('');
    setCurrentPage(1);
    setShowFilters(false);
  };

  const toggleFavorite = async (id) => {
    if (isSupabaseConfigured() && user?.id) {
      const { isFavorite } = await apiToggleFavorite(user.id, id);
      setFavorites((prev) => {
        const next = new Set(prev);
        if (isFavorite) next.add(id); else next.delete(id);
        return next;
      });
    } else {
      setFavorites((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
      });
    }
  };

  const hasActiveFilters = domain || typeDoc || language || region || year || searchInput.trim();

  const FiltersContent = () => (
    <>
      <Accordion defaultActiveKey={['0', '1', '2', '3', '4', '5']} alwaysOpen className="librairie-accordion" flush>
        <Accordion.Item eventKey="0">
          <Accordion.Header>📂 {t('library.filterDomain')}</Accordion.Header>
          <Accordion.Body className="librairie-filter-list">
            {DOMAINS.map((d) => (
              <Form.Check key={d} type="radio" id={`domain-${d}`} name="domain" label={d} checked={domain === d} onChange={() => setDomain(d)} />
            ))}
            <Button variant="link" size="sm" className="p-0 mt-1" onClick={() => setDomain('')}>{t('common.all')}</Button>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="1">
          <Accordion.Header>📄 {t('library.filterType')}</Accordion.Header>
          <Accordion.Body className="librairie-filter-list">
            {TYPES.map((typ) => (
              <Form.Check key={typ} type="radio" id={`type-${typ}`} name="typeDoc" label={typ} checked={typeDoc === typ} onChange={() => setTypeDoc(typ)} />
            ))}
            <Button variant="link" size="sm" className="p-0 mt-1" onClick={() => setTypeDoc('')}>{t('common.all')}</Button>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="2">
          <Accordion.Header>🌐 {t('library.filterLanguage')}</Accordion.Header>
          <Accordion.Body className="librairie-filter-list">
            {LANGUES.map((lang) => (
              <Form.Check key={lang} type="radio" id={`lang-${lang}`} name="language" label={lang} checked={language === lang} onChange={() => setLanguage(lang)} />
            ))}
            <Button variant="link" size="sm" className="p-0 mt-1" onClick={() => setLanguage('')}>{t('common.all_female')}</Button>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="3">
          <Accordion.Header>🗺️ {t('library.filterRegion')}</Accordion.Header>
          <Accordion.Body className="librairie-filter-list">
            {REGIONS.map((r) => (
              <Form.Check key={r} type="radio" id={`region-${r}`} name="region" label={r} checked={region === r} onChange={() => setRegion(r)} />
            ))}
            <Button variant="link" size="sm" className="p-0 mt-1" onClick={() => setRegion('')}>{t('common.all_female')}</Button>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="4">
          <Accordion.Header>📅 {t('library.filterYear')}</Accordion.Header>
          <Accordion.Body className="librairie-filter-list">
            {ANNEES.map((y) => (
              <Form.Check key={y} type="radio" id={`year-${y}`} name="year" label={y} checked={year === y} onChange={() => setYear(y)} />
            ))}
            <Button variant="link" size="sm" className="p-0 mt-1" onClick={() => setYear('')}>{t('common.all_female')}</Button>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
      <Button variant="outline-secondary" size="sm" className="w-100 mt-3" onClick={resetFilters}>
        <X size={16} className="me-1" /> {t('library.resetFilters')}
      </Button>
    </>
  );

  return (
    <div className="librairie-page min-vh-100 d-flex flex-column">
      {!embedded && <AfricadataHeader />}

      <Container fluid className="librairie-container flex-grow-1 py-4">
        {/* Barre de recherche globale */}
        <div className="librairie-search-bar mb-4">
          <InputGroup size="lg" className="shadow-sm">
            <InputGroup.Text className="bg-white">
              <Search size={20} className="text-secondary" />
            </InputGroup.Text>
            <Form.Control
              type="search"
              placeholder={t('library.searchPlaceholder')}
              aria-label={t('library.searchAria')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="librairie-search-input"
            />
          </InputGroup>
        </div>

        <Row>
          {/* Filtres — Desktop: colonne gauche */}
          <aside className="col-lg-3 d-none d-lg-block">
            <div className="librairie-filters-card card border-0 shadow-sm sticky-top">
              <Card.Body>
                <h3 className="h6 fw-bold mb-3">{t('library.filters')}</h3>
                <FiltersContent />
              </Card.Body>
            </div>
          </aside>

          {/* Résultats */}
          <main className="col-lg-9">
            {/* Mobile: bouton Filtrer → Offcanvas */}
            <div className="d-lg-none mb-3">
              <Button variant="outline-primary" className="w-100 w-sm-auto" onClick={() => setShowFilters(true)}>
                <Filter size={18} className="me-2" /> {t('library.filterButton')} {hasActiveFilters && `(${[domain, typeDoc, language, region, year].filter(Boolean).length})`}
              </Button>
            </div>

            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
              <p className="text-body-secondary mb-0 small">
                {t('library.publicationsFound', { count: filtered.length })}
              </p>
            </div>

            {/* Recommandations automatiques — 3 publications mises en avant (sans filtre actif) */}
            {filtered.length > 0 && !debouncedSearch.trim() && !domain && !typeDoc && !language && !region && !year && (
              <Card className="border-0 shadow-sm mb-4 librairie-recommendations">
                <Card.Body className="py-3">
                  <h3 className="h6 fw-bold mb-3 d-flex align-items-center gap-2">
                    <TrendingUp size={20} className="text-danger" /> {t('library.recommended')}
                  </h3>
                  <Row className="row-cols-1 row-cols-md-3 g-3">
                    {filtered.slice(0, 3).map((pub) => (
                      <Col key={`rec-${pub.id}`}>
                        <Link to={`/publication/${pub.id}`} className="text-decoration-none text-body">
                          <div className="librairie-rec-card p-3 rounded border h-100">
                            <p className="small fw-semibold mb-1 librairie-rec-title">{pub.title}</p>
                            <div className="d-flex align-items-center gap-2 small text-body-secondary">
                              <RatingStars value={pub.rating} count={pub.ratingCount} size={14} />
                              <span>·</span>
                              <span><Eye size={12} /> {pub.views}</span>
                              <span><Download size={12} /> {pub.downloads}</span>
                            </div>
                          </div>
                        </Link>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
            )}

            {loading ? (
              <Card className="border-0 shadow-sm">
                <Card.Body className="text-center py-5">
                  <div className="spinner-border text-danger mb-2" role="status" aria-hidden="true" />
                  <p className="text-body-secondary mb-0">{t('library.loading')}</p>
                </Card.Body>
              </Card>
            ) : paginated.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <Card.Body className="text-center py-5">
                  <p className="text-body-secondary mb-0">{t('library.noResults')}</p>
                  <Button variant="outline-danger" size="sm" className="mt-3" onClick={resetFilters}>{t('library.resetFilters')}</Button>
                </Card.Body>
              </Card>
            ) : (
              <>
                <Row className="row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
                  {paginated.map((pub) => (
                    <Col key={pub.id}>
                      <Card className="librairie-card h-100 border-0 shadow-sm">
                        <Card.Header className="librairie-card-header bg-transparent border-0 pb-0">
                          <Card.Title className="h6 mb-1 librairie-card-title">
                            <Link to={`/publication/${pub.id}`}>{pub.title}</Link>
                          </Card.Title>
                          <Badge bg="outline-danger" className="librairie-card-badge">{pub.type}</Badge>
                        </Card.Header>
                        <Card.Body className="pt-2">
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <RatingStars value={pub.rating ?? 0} count={pub.ratingCount ?? 0} size={14} />
                          </div>
                          <div className="d-flex align-items-center gap-2 small text-body-secondary mb-1">
                            {pub.author_photo_url ? (
                              <img src={pub.author_photo_url} alt="" className="rounded-circle object-fit-cover" style={{ width: 28, height: 28 }} />
                            ) : (
                              <span className="rounded-circle bg-secondary bg-opacity-25 d-inline-flex align-items-center justify-content-center" style={{ width: 28, height: 28 }}>
                                <User size={14} className="text-secondary" />
                              </span>
                            )}
                            <span>{pub.author}</span>
                          </div>
                          <p className="small text-body-secondary mb-1">{pub.domain}{pub.region ? ` · ${pub.region}` : ''} · {pub.year}</p>
                          <p className="small text-body-secondary librairie-card-summary">{truncate(pub.summary)}</p>
                          <div className="d-flex align-items-center gap-3 mt-2 small text-body-secondary">
                            <span className="d-flex align-items-center gap-1"><Eye size={12} /> {pub.views ?? 0} {t('library.views')}</span>
                            <span className="d-flex align-items-center gap-1"><Download size={12} /> {pub.downloads ?? 0} {t('library.downloads')}</span>
                          </div>
                        </Card.Body>
                        <Card.Footer className="bg-transparent border-0 d-flex justify-content-between align-items-center flex-wrap gap-2">
                          <Link to={`/publication/${pub.id}`} className="btn btn-sm btn-danger">
                            <BookOpen size={14} className="me-1" /> {t('library.read')}
                          </Link>
                          <div className="d-flex gap-1">
                            <Button variant="outline-secondary" size="sm" className="btn-sm" as={Link} to={`/publication/${pub.id}`} title={t('library.download')}>
                              <Download size={14} />
                            </Button>
                            <Button variant={favorites.has(pub.id) ? 'warning' : 'outline-secondary'} size="sm" onClick={() => toggleFavorite(pub.id)} title="Favori">
                              <Star size={14} fill={favorites.has(pub.id) ? 'currentColor' : 'none'} />
                            </Button>
                          </div>
                        </Card.Footer>
                      </Card>
                    </Col>
                  ))}
                </Row>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-4">
                    <Pagination className="librairie-pagination" onSelect={(e) => setCurrentPage(Number(e))}>
                      <Pagination.First disabled={currentPage === 1} onClick={() => setCurrentPage(1)} />
                      <Pagination.Prev disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} />
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Pagination.Item key={page} active={page === currentPage} eventKey={page}>
                          {page}
                        </Pagination.Item>
                      ))}
                      <Pagination.Next disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} />
                      <Pagination.Last disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)} />
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </main>
        </Row>
      </Container>

      {/* Offcanvas filtres — Mobile */}
      <Offcanvas show={showFilters} onHide={() => setShowFilters(false)} placement="start" className="librairie-offcanvas" >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{t('library.filters')}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <FiltersContent />
        </Offcanvas.Body>
      </Offcanvas>

      {!embedded && <AfricadataFooter />}
    </div>
  );
}
