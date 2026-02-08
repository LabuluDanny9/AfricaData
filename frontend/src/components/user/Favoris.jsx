import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Button, Badge } from 'react-bootstrap';
import { Star, BookOpen, Download, User } from 'lucide-react';
import RatingStars from 'components/ui/RatingStars';
import { getFavorites, getPublications, toggleFavorite } from 'services/publications';
import { useAuth } from 'context/AuthContext';
import { isSupabaseConfigured } from 'lib/supabase';
import 'components/ui/RatingStars.css';
import './Favoris.css';

export default function Favoris() {
  const { user } = useAuth();
  const [, setFavoriteIds] = useState([]);
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      setPublications([]);
      setFavoriteIds([]);
      return;
    }
    if (!isSupabaseConfigured()) {
      setPublications([]);
      setFavoriteIds([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    getFavorites(user.id)
      .then(({ data }) => {
        setFavoriteIds(data || []);
        if (data?.length) {
          return getPublications({}).then(({ data: list }) => {
            const favs = (list || []).filter((p) => data.includes(p.id));
            setPublications(favs);
          });
        }
        setPublications([]);
      })
      .catch(() => {
        setFavoriteIds([]);
        setPublications([]);
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  const handleRemoveFavorite = async (pubId) => {
    if (!user?.id) return;
    if (isSupabaseConfigured()) {
      await toggleFavorite(user.id, pubId);
      setFavoriteIds((prev) => prev.filter((id) => id !== pubId));
      setPublications((prev) => prev.filter((p) => p.id !== pubId));
    } else {
      setFavoriteIds((prev) => prev.filter((id) => id !== pubId));
      setPublications((prev) => prev.filter((p) => p.id !== pubId));
    }
  };

  return (
    <div className="favoris-page">
      <header className="mb-4">
        <h1 className="h3 fw-bold mb-1">Favoris</h1>
        <p className="text-body-secondary mb-0 small">Publications sauvegardées</p>
      </header>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status" />
          <p className="mt-2 small text-body-secondary">Chargement…</p>
        </div>
      ) : publications.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <Star size={48} className="text-warning mb-2 opacity-50" />
            <p className="text-body-secondary mb-0">Aucun favori.</p>
            <Link to="/librairie" className="btn btn-danger btn-sm mt-3 rounded-pill">Explorer la bibliothèque</Link>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-3 g-lg-4">
          {publications.map((pub) => (
            <Col key={pub.id} xs={12} sm={6} lg={4}>
              <Card className="favoris-card border-0 shadow-sm h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Badge bg="outline-danger" className="rounded-pill small">{pub.type}</Badge>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 text-warning"
                      onClick={() => handleRemoveFavorite(pub.id)}
                      title="Retirer des favoris"
                    >
                      <Star size={18} fill="currentColor" />
                    </Button>
                  </div>
                  <Card.Title as={Link} to={`/publication/${pub.id}`} className="h6 fw-semibold text-body text-decoration-none d-block mb-2">
                    {pub.title?.length > 60 ? pub.title.slice(0, 60) + '…' : pub.title}
                  </Card.Title>
                  <div className="d-flex align-items-center gap-2 small text-body-secondary mb-2">
                    {pub.author_photo_url ? (
                      <img src={pub.author_photo_url} alt="" className="rounded-circle object-fit-cover" style={{ width: 24, height: 24 }} />
                    ) : (
                      <span className="rounded-circle bg-secondary bg-opacity-25 d-inline-flex align-items-center justify-content-center" style={{ width: 24, height: 24 }}>
                        <User size={12} className="text-secondary" />
                      </span>
                    )}
                    <span>{pub.author} · {pub.year}</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 small text-body-secondary mb-3">
                    <RatingStars value={pub.rating ?? 0} count={pub.ratingCount ?? 0} size={14} />
                    <span>{pub.views ?? 0} vues · {pub.downloads ?? 0} téléch.</span>
                  </div>
                  <div className="d-flex gap-2">
                    <Button as={Link} to={`/publication/${pub.id}`} variant="danger" size="sm" className="rounded-pill d-inline-flex align-items-center gap-1">
                      <BookOpen size={14} /> Lire
                    </Button>
                    <Button as={Link} to={`/publication/${pub.id}`} variant="outline-secondary" size="sm" className="rounded-pill">
                      <Download size={14} />
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
