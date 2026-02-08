import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Card, Button, Form, Badge, ListGroup, Row, Col } from 'react-bootstrap';
import { ArrowLeft, Download, Star, MessageCircle, FileText, User, Calendar, Eye, ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react';
import AfricadataHeader from 'components/layout/AfricadataHeader';
import AfricadataFooter from 'components/layout/AfricadataFooter';
import RatingStars from 'components/ui/RatingStars';
import { getPublicationById, getComments, addComment as apiAddComment, addRating as apiAddRating, getRecommendations as apiGetRecommendations, incrementView, incrementDownload, toggleFavorite as apiToggleFavorite, getFavorites } from 'services/publications';
import { useAuth } from 'context/AuthContext';
import { isSupabaseConfigured } from 'lib/supabase';
import 'components/layout/AfricadataHeader.css';
import 'components/ui/RatingStars.css';
import './publicationDetails.css';

const SAMPLE_PUBLICATIONS = {
  1: { id: 1, title: 'Impact des changements climatiques sur l\'agriculture durable en Afrique centrale', author: 'Prof. Jean-Marie Kabongo, Dr. Marie Ntumba', type: 'Article', domain: 'Sciences agronomiques', language: 'Français', region: 'Afrique', year: '2024', abstract: 'Cette étude analyse les effets des changements climatiques sur les pratiques agricoles durables en Afrique centrale. Elle propose des recommandations pour l\'adaptation des systèmes de production. Méthodologie mixte : enquêtes terrain et modélisation. Résultats significatifs sur la résilience des cultures.', rating: 4.5, ratingCount: 12, views: 342, downloads: 89 },
  2: { id: 2, title: 'Analyse SIG pour la gestion des ressources naturelles', author: 'Dr. Patrick Mbuya', type: 'Thèse', domain: 'Ingénierie', language: 'Français', region: 'Afrique', year: '2024', abstract: 'Travail de recherche sur l\'utilisation des systèmes d\'information géographique pour une gestion durable des ressources naturelles. Applications cartographiques et recommandations pour les décideurs.', rating: 4.8, ratingCount: 8, views: 156, downloads: 45 },
  3: { id: 3, title: 'Étude épidémiologique des maladies tropicales négligées', author: 'Prof. Christine Mulamba, Dr. David Tshimanga', type: 'Rapport', domain: 'Médecine & Santé', language: 'Français', region: 'Afrique', year: '2024', abstract: 'Rapport d\'enquête épidémiologique sur les maladies tropicales négligées. Données de terrain, analyse statistique et propositions d\'interventions.', rating: 4.2, ratingCount: 15, views: 521, downloads: 120 },
  4: { id: 4, title: 'L\'entrepreneuriat féminin comme levier de développement local', author: 'Prof. Jeanne Mutombo', type: 'Article', domain: 'Sciences économiques', language: 'Français', region: 'Afrique', year: '2024', abstract: 'Analyse du rôle de l\'entrepreneuriat féminin dans le développement économique local en Afrique subsaharienne. Études de cas et recommandations politiques.', rating: 4.6, ratingCount: 22, views: 678, downloads: 98 },
  5: { id: 5, title: 'Intelligence artificielle et diagnostic médical', author: 'Dr. Amara Okonkwo', type: 'Article', domain: 'IA & Data Science', language: 'English', region: 'International', year: '2025', abstract: 'Application des modèles de deep learning pour l\'aide au diagnostic des pathologies tropicales. Résultats prometteurs sur des jeux de données internationaux.', rating: 4.9, ratingCount: 18, views: 890, downloads: 234 },
  6: { id: 6, title: 'Réseaux 5G et couverture rurale', author: 'Dr. Hassan Al-Rashid', type: 'Mémoire', domain: 'Réseaux & Télécoms', language: 'English', region: 'Asie-Océanie', year: '2024', abstract: 'Évaluation des stratégies de déploiement 5G pour les zones rurales. Comparaison Afrique, Asie et Amériques.', rating: 4.0, ratingCount: 6, views: 203, downloads: 56 },
  7: { id: 7, title: 'Sécurité des systèmes d\'information de santé', author: 'Zainab Mohamed', type: 'Étude de cas', domain: 'Informatique', language: 'Français', region: 'Europe', year: '2023', abstract: 'Audit de sécurité et recommandations pour les systèmes d\'information des établissements de santé.', rating: 4.3, ratingCount: 9, views: 412, downloads: 67 },
  8: { id: 8, title: 'Partenariats académiques Nord-Sud', author: 'Jean-Pierre Dubois', type: 'Rapport', domain: 'Sciences économiques', language: 'Français', region: 'International', year: '2025', abstract: 'Analyse des partenariats universitaires entre institutions africaines et européennes.', rating: 4.1, ratingCount: 11, views: 287, downloads: 43 },
  9: { id: 9, title: 'Deep learning pour la reconnaissance des cultures', author: 'Dr. Marie Ntumba', type: 'Article', domain: 'IA & Data Science', language: 'English', region: 'Afrique', year: '2025', abstract: 'Modèles de vision par ordinateur pour l\'identification des cultures à partir d\'images satellite.', rating: 4.7, ratingCount: 14, views: 445, downloads: 112 },
  10: { id: 10, title: 'Épidémiologie des maladies vectorielles', author: 'Dr. David Tshimanga', type: 'Article', domain: 'Médecine & Santé', language: 'Français', region: 'Afrique', year: '2024', abstract: 'Synthèse des données épidémiologiques sur le paludisme et la dengue en zone urbaine.', rating: 4.4, ratingCount: 19, views: 567, downloads: 145 },
};

const PDF_SAMPLE_URL = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

const MOCK_COMMENTS = [
  { id: 1, author: 'Dr. Marie K.', date: '2025-01-15', content: 'Travail très pertinent pour notre projet. Merci pour le partage.' },
  { id: 2, author: 'Prof. Jean M.', date: '2025-01-18', content: 'Les données méthodologiques sont claires. Une référence pour les étudiants.' },
];

const allPublicationsList = Object.entries(SAMPLE_PUBLICATIONS).map(([k, v]) => ({ id: Number(k), ...v }));

function getRecommendations(currentId, domain, typeDoc, max = 4) {
  return allPublicationsList
    .filter((p) => p.id !== currentId && (p.domain === domain || p.type === typeDoc))
    .slice(0, max);
}

export default function PublicationDetails() {
  const { id } = useParams();
  const [publication, setPublication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorite, setFavorite] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [userRating, setUserRating] = useState(null);
  const [pdfZoom, setPdfZoom] = useState(100);
  const [pdfFullscreen, setPdfFullscreen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!id) {
      setPublication(null);
      setLoading(false);
      return;
    }
    if (isSupabaseConfigured()) {
      setLoading(true);
      getPublicationById(id).then(({ data }) => {
        setPublication(data || null);
        setLoading(false);
        if (data) {
          incrementView(id);
          apiGetRecommendations(id, data.domain, data.type, 4).then(({ data: recs }) => setRecommendations(recs || []));
        }
      });
      getComments(id).then(({ data }) => setComments(data || []));
      if (user?.id) {
        getFavorites(user.id).then(({ data }) => setFavorite(data?.includes(id) ?? false));
      }
    } else {
      const num = Number(id);
      const pub = SAMPLE_PUBLICATIONS[num] || null;
      setPublication(pub);
      setComments(MOCK_COMMENTS);
      setRecommendations(pub ? getRecommendations(num, pub.domain, pub.type, 4) : []);
      setLoading(false);
    }
  }, [id, user?.id]);

  if (loading) {
    return (
      <div className="publication-details-page min-vh-100 d-flex flex-column">
        <AfricadataHeader />
        <Container className="flex-grow-1 py-5 text-center">
          <div className="spinner-border text-danger" role="status" />
          <p className="mt-2 text-body-secondary">Chargement…</p>
        </Container>
        <AfricadataFooter />
      </div>
    );
  }

  if (!publication) {
    return (
      <div className="publication-details-page min-vh-100 d-flex flex-column">
        <AfricadataHeader />
        <Container className="flex-grow-1 py-5">
          <Link to="/librairie" className="publication-details-back d-inline-flex align-items-center gap-2 mb-4">
            <ArrowLeft size={18} /> Retour à la librairie
          </Link>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center py-5">
              <p className="text-body-secondary mb-0">Publication introuvable.</p>
            </Card.Body>
          </Card>
        </Container>
        <AfricadataFooter />
      </div>
    );
  }

  const handlePublishComment = async (e) => {
    e.preventDefault();
    if (!comment.trim() || !publication?.id) return;
    if (isSupabaseConfigured() && user?.id) {
      const { data } = await apiAddComment(publication.id, user.id, user.name || 'Utilisateur', comment.trim());
      if (data) setComments((prev) => [...prev, { id: data.id, author: data.author, date: data.date, content: data.content }]);
      setComment('');
    } else {
      setComments((prev) => [...prev, { id: Date.now(), author: 'Vous', date: new Date().toLocaleDateString('fr-FR'), content: comment.trim() }]);
      setComment('');
    }
  };

  const handleRating = (value) => {
    setUserRating(value);
    if (isSupabaseConfigured() && user?.id && publication?.id) apiAddRating(publication.id, user.id, value);
  };

  const handleToggleFavorite = async () => {
    if (isSupabaseConfigured() && user?.id && publication?.id) {
      const { isFavorite } = await apiToggleFavorite(user.id, publication.id);
      setFavorite(isFavorite);
    } else {
      setFavorite((f) => !f);
    }
  };

  return (
    <div className="publication-details-page min-vh-100 d-flex flex-column">
      <AfricadataHeader />

      <Container className="publication-details-container flex-grow-1 py-4">
        <Link to="/librairie" className="publication-details-back d-inline-flex align-items-center gap-2 mb-4">
          <ArrowLeft size={18} /> Retour à la librairie
        </Link>

        {/* Titre + Métadonnées */}
        <Card className="publication-details-card border-0 shadow-sm mb-4">
          <Card.Body className="p-4">
            <h1 className="publication-details-title h2 fw-bold mb-3">{publication.title}</h1>
            <div className="d-flex flex-wrap gap-2 mb-3">
              <Badge bg="outline-danger" className="publication-details-badge">{publication.type}</Badge>
              <Badge bg="secondary" className="publication-details-badge">{publication.domain}</Badge>
              {publication.language && <Badge bg="info" className="publication-details-badge">{publication.language}</Badge>}
              {publication.region && <Badge bg="light" text="dark" className="publication-details-badge">{publication.region}</Badge>}
            </div>
            <div className="publication-details-meta text-body-secondary small d-flex flex-wrap gap-3">
              <span className="d-flex align-items-center gap-1"><User size={14} /> {publication.author}</span>
              <span className="d-flex align-items-center gap-1"><Calendar size={14} /> {publication.year}</span>
              <span className="d-flex align-items-center gap-1"><Eye size={14} /> {publication.views ?? 0} vues</span>
              <span className="d-flex align-items-center gap-1"><Download size={14} /> {publication.downloads ?? 0} téléchargements</span>
            </div>
            <div className="mt-2">
              <RatingStars value={publication.rating ?? 0} count={publication.ratingCount ?? 0} size={18} />
            </div>
          </Card.Body>
        </Card>

        {/* Notation par l'utilisateur */}
        <Card className="publication-details-card border-0 shadow-sm mb-4">
          <Card.Body className="py-3">
            <p className="small fw-semibold mb-2">Donnez votre note</p>
            <RatingStars
              value={userRating ?? publication.rating ?? 0}
              interactive
              onChange={handleRating}
              size={22}
            />
            {userRating != null && <p className="small text-body-secondary mt-2 mb-0">Merci pour votre avis.</p>}
          </Card.Body>
        </Card>

        {/* Résumé complet */}
        <Card className="publication-details-card border-0 shadow-sm mb-4">
          <Card.Header className="bg-transparent border-0 d-flex align-items-center gap-2 fw-bold">
            <FileText size={18} /> Résumé
          </Card.Header>
          <Card.Body className="pt-0">
            <p className="publication-details-abstract mb-0">{publication.abstract}</p>
          </Card.Body>
        </Card>

        {/* Actions */}
        <div className="d-flex flex-wrap gap-2 mb-4">
          <Button variant="danger" className="d-inline-flex align-items-center gap-2">
            <Download size={18} /> Télécharger le PDF
          </Button>
          <Button variant={favorite ? 'warning' : 'outline-secondary'} onClick={handleToggleFavorite} className="d-inline-flex align-items-center gap-2">
            <Star size={18} fill={favorite ? 'currentColor' : 'none'} /> {favorite ? 'Dans les favoris' : 'Ajouter aux favoris'}
          </Button>
        </div>

        {/* Lecture PDF inline avec barre d'outils */}
        <Card className={`publication-details-card border-0 shadow-sm mb-4 ${pdfFullscreen ? 'publication-details-pdf-fullscreen' : ''}`}>
          <Card.Header className="bg-transparent border-0 d-flex align-items-center justify-content-between flex-wrap gap-2 py-2">
            <span className="fw-bold">Document PDF</span>
            <div className="d-flex align-items-center gap-2 publication-details-pdf-toolbar">
              <Button variant="outline-secondary" size="sm" onClick={() => setPdfZoom((z) => Math.max(50, z - 25))} title="Réduire" aria-label="Réduire zoom">
                <ZoomOut size={16} />
              </Button>
              <span className="small text-body-secondary" style={{ minWidth: '3rem' }}>{pdfZoom}%</span>
              <Button variant="outline-secondary" size="sm" onClick={() => setPdfZoom((z) => Math.min(150, z + 25))} title="Agrandir" aria-label="Agrandir zoom">
                <ZoomIn size={16} />
              </Button>
              <Button variant="outline-secondary" size="sm" onClick={() => setPdfFullscreen((f) => !f)} title={pdfFullscreen ? 'Réduire' : 'Plein écran'} aria-label={pdfFullscreen ? 'Quitter plein écran' : 'Plein écran'}>
                {pdfFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </Button>
              {publication.pdf_url ? (
                <Button variant="outline-danger" size="sm" as="a" href={publication.pdf_url} download target="_blank" rel="noopener noreferrer" title="Télécharger le PDF" onClick={() => isSupabaseConfigured() && publication?.id && incrementDownload(publication.id)}>
                  <Download size={16} /> Télécharger
                </Button>
              ) : (
                <span className="small text-body-secondary">PDF non disponible</span>
              )}
            </div>
          </Card.Header>
          <Card.Body className="publication-details-pdf-area p-0">
            {publication.pdf_url ? (
              <div
                className="publication-details-pdf-wrapper"
                style={{
                  height: pdfFullscreen ? '85vh' : 420,
                  width: '100%',
                }}
              >
                <iframe
                  title="Aperçu PDF"
                  src={publication.pdf_url}
                  className="publication-details-pdf-iframe"
                  style={{
                    width: `${pdfZoom}%`,
                    height: `${pdfZoom}%`,
                    minHeight: '100%',
                  }}
                />
              </div>
            ) : (
              <div className="d-flex align-items-center justify-content-center text-body-secondary py-5" style={{ minHeight: 280 }}>
                <div className="text-center">
                  <FileText size={48} className="mb-2 opacity-50" />
                  <p className="mb-0 small">Aucun fichier PDF associé à cette publication.</p>
                </div>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Section Avis / Commentaires */}
        <Card className="publication-details-card border-0 shadow-sm mb-4">
          <Card.Header className="bg-transparent border-0 d-flex align-items-center gap-2 fw-bold">
            <MessageCircle size={18} /> Avis et commentaires ({comments.length})
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handlePublishComment} className="mb-4">
              <Form.Group className="mb-2">
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Partagez votre avis ou posez une question..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="publication-details-comment-input"
                />
              </Form.Group>
              <Button type="submit" variant="danger" size="sm">Publier</Button>
            </Form>
            <ListGroup variant="flush" className="publication-details-comments">
              {comments.map((c) => (
                <ListGroup.Item key={c.id} className="publication-details-comment-item d-flex gap-3 border-0 px-0">
                  <div className="publication-details-comment-avatar rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center bg-secondary text-white small fw-bold">
                    {c.author.charAt(0)}
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 small text-body-secondary mb-1">
                      <span className="fw-semibold text-body">{c.author}</span>
                      <span>{c.date ? (typeof c.date === 'string' ? new Date(c.date).toLocaleDateString('fr-FR') : c.date) : ''}</span>
                    </div>
                    <p className="mb-0 small">{c.content}</p>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card.Body>
        </Card>

        {/* Publications similaires (recommandations automatiques) */}
        {recommendations.length > 0 && (
          <Card className="publication-details-card border-0 shadow-sm mb-4">
            <Card.Header className="bg-transparent border-0 fw-bold">Publications similaires</Card.Header>
            <Card.Body className="pt-0">
              <Row className="row-cols-1 row-cols-md-2 g-3">
                {recommendations.map((rec) => (
                  <Col key={rec.id}>
                    <Link to={`/publication/${rec.id}`} className="text-decoration-none text-body">
                      <div className="publication-details-rec-card p-3 rounded border h-100">
                        <p className="small fw-semibold mb-1">{rec.title}</p>
                        <div className="d-flex align-items-center gap-2 small text-body-secondary">
                          <RatingStars value={rec.rating ?? 0} count={rec.ratingCount ?? 0} size={14} />
                          <span>·</span>
                          <span><Eye size={12} /> {rec.views ?? 0}</span>
                          <span><Download size={12} /> {rec.downloads ?? 0}</span>
                        </div>
                      </div>
                    </Link>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        )}
      </Container>

      <AfricadataFooter />
    </div>
  );
}
