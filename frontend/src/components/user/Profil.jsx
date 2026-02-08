import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Card, Form, Button, Row, Col, ListGroup, Tab, Tabs, Badge } from 'react-bootstrap';
import { User, Mail, Camera, FileText, CreditCard, MapPin, Globe, Linkedin, Twitter, GraduationCap, BookOpen } from 'lucide-react';
import { useAuth } from 'context/AuthContext';
import { getProfile, updateProfile, uploadAvatar } from 'services/profile';
import { supabase, isSupabaseConfigured } from 'lib/supabase';
import './Profil.css';

const DOMAIN_INTERESTS = ['Informatique', 'IA & Data Science', 'Médecine & Santé', 'Sciences agronomiques', 'Sciences économiques', 'Ingénierie', 'Environnement', 'Sciences sociales'];

export default function Profil() {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef(null);
  const [profile, setProfileState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [avatarImageError, setAvatarImageError] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    bio: '',
    phone: '',
    location: '',
    website: '',
    linkedin_url: '',
    twitter_url: '',
    institution: '',
    domain_interest: '',
  });
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      setForm((f) => ({ ...f, full_name: user?.name || '', email: user?.email || '' }));
      return;
    }
    if (isSupabaseConfigured()) {
      getProfile(user.id).then(({ data, error: err }) => {
        setLoading(false);
        if (err) {
          setError('Impossible de charger le profil.');
          setForm((f) => ({ ...f, full_name: user?.name || '', email: user?.email || '' }));
          return;
        }
        setProfileState(data);
        if (data) {
          setForm({
            full_name: data.full_name ?? user?.name ?? '',
            email: data.email ?? user?.email ?? '',
            bio: data.bio ?? '',
            phone: data.phone ?? '',
            location: data.location ?? '',
            website: data.website ?? '',
            linkedin_url: data.linkedin_url ?? '',
            twitter_url: data.twitter_url ?? '',
            institution: data.institution ?? '',
            domain_interest: data.domain_interest ?? '',
          });
        } else {
          setForm((f) => ({ ...f, full_name: user?.name || '', email: user?.email || '' }));
        }
      });
    } else {
      setLoading(false);
      setForm((f) => ({ ...f, full_name: user?.name || '', email: user?.email || '' }));
    }
  }, [user?.id, user?.name, user?.email]);

  const avatarUrl = profile?.avatar_url || user?.picture || null;

  useEffect(() => {
    setAvatarImageError(false);
  }, [avatarUrl]);

  useEffect(() => {
    if (!isSupabaseConfigured() || !user?.id) {
      setHistory([]);
      return;
    }
    setLoadingHistory(true);
    supabase
      .from('publications')
      .select('id, title, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data, error }) => {
        if (!error && data) {
          setHistory(data.map((p) => ({
            type: 'publication',
            id: p.id,
            title: (p.title || '').length > 50 ? (p.title || '').slice(0, 50) + '…' : p.title,
            date: p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
            status: p.status === 'published' ? 'Validée' : p.status === 'rejected' ? 'Rejetée' : 'En analyse',
          })));
        } else {
          setHistory([]);
        }
        setLoadingHistory(false);
      })
      .catch(() => {
        setHistory([]);
        setLoadingHistory(false);
      });
  }, [user?.id]);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setError('Format accepté : JPG, PNG ou WebP.');
      return;
    }
    setError('');
    setUploadingPhoto(true);
    uploadAvatar(file, user.id).then(({ data: url, error: uploadErr }) => {
      setUploadingPhoto(false);
      if (uploadErr) {
        setError(uploadErr.message || 'Erreur lors de l\'upload.');
        return;
      }
      if (!url) return;
      updateProfile(user.id, { avatar_url: url }).then(({ data, error: updateErr }) => {
        if (updateErr) {
          setError(updateErr.message || 'Erreur lors de la mise à jour.');
          return;
        }
        setProfileState((p) => (p ? { ...p, avatar_url: url } : { avatar_url: url }));
        setUser({ ...user, picture: url, name: form.full_name || user?.name });
        setMessage('Photo mise à jour.');
        setTimeout(() => setMessage(''), 3000);
      });
    });
    e.target.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!user?.id) {
      setMessage('Profil mis à jour localement (connexion requise pour enregistrer).');
      setSaving(false);
      return;
    }
    setSaving(true);
    updateProfile(user.id, {
      full_name: form.full_name.trim() || null,
      email: form.email.trim() || null,
      bio: form.bio.trim() || null,
      phone: form.phone.trim() || null,
      location: form.location.trim() || null,
      website: form.website.trim() || null,
      linkedin_url: form.linkedin_url.trim() || null,
      twitter_url: form.twitter_url.trim() || null,
      institution: form.institution.trim() || null,
      domain_interest: form.domain_interest || null,
    }).then(({ data, error: err }) => {
      setSaving(false);
      if (err) {
        setError(err.message || 'Erreur lors de l\'enregistrement.');
        return;
      }
      if (data) setProfileState(data);
      setUser({ ...user, name: form.full_name.trim() || user?.name, picture: profile?.avatar_url || user?.picture });
      setMessage('Profil enregistré.');
      setTimeout(() => setMessage(''), 4000);
    });
  };

  if (loading) {
    return (
      <div className="profil-page">
        <div className="text-center py-5 text-body-secondary">Chargement du profil…</div>
      </div>
    );
  }

  return (
    <div className="profil-page">
      <header className="mb-4">
        <h1 className="h3 fw-bold mb-1">Mon profil</h1>
        <p className="text-body-secondary mb-0 small">Complétez votre présentation et consultez l'historique</p>
      </header>

      <Row>
        <Col lg={6} className="mb-4 mb-lg-0">
          <Card className="border-0 shadow-sm profil-card">
            <Card.Body className="p-4">
              {/* Bloc photo + identité visuelle */}
              <div className="profil-hero text-center mb-4">
                <div
                  className="profil-avatar-wrap position-relative d-inline-block"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {avatarUrl && !avatarImageError ? (
                    <img
                      src={avatarUrl}
                      alt=""
                      className="profil-avatar rounded-circle"
                      width={120}
                      height={120}
                      referrerPolicy="no-referrer"
                      onError={() => setAvatarImageError(true)}
                    />
                  ) : (
                    <div className="profil-avatar profil-avatar-placeholder rounded-circle d-flex align-items-center justify-content-center bg-secondary text-white">
                      <User size={56} />
                    </div>
                  )}
                  <div className="profil-avatar-overlay rounded-circle">
                    {uploadingPhoto ? (
                      <span className="small text-white">Upload…</span>
                    ) : (
                      <>
                        <Camera size={24} className="text-white mb-1" />
                        <span className="small text-white">Changer</span>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="d-none"
                    onChange={handlePhotoChange}
                  />
                </div>
                <h2 className="h5 fw-bold mt-3 mb-1">{form.full_name || 'Utilisateur'}</h2>
                <p className="text-body-secondary small mb-0">{form.email || user?.email}</p>
                {profile?.role && (
                  <Badge bg="danger" className="rounded-pill mt-2">{profile.role}</Badge>
                )}
              </div>

              <Form onSubmit={handleSubmit}>
                <Tabs defaultActiveKey="identity" className="profil-tabs mb-3">
                  <Tab eventKey="identity" title={<><User size={16} className="me-1" /> Identité</>}>
                    <div className="pt-3">
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-semibold">Nom complet</Form.Label>
                        <Form.Control
                          type="text"
                          value={form.full_name}
                          onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                          placeholder="Votre nom"
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-semibold">Email</Form.Label>
                        <Form.Control
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                          placeholder="email@exemple.org"
                        />
                      </Form.Group>
                    </div>
                  </Tab>
                  <Tab eventKey="bio" title={<><FileText size={16} className="me-1" /> Biographie</>}>
                    <div className="pt-3">
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-semibold">Présentation</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={5}
                          value={form.bio}
                          onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                          placeholder="Décrivez votre parcours, vos domaines de recherche ou votre activité en quelques lignes..."
                        />
                        <Form.Text className="text-muted">Visible sur votre profil public.</Form.Text>
                      </Form.Group>
                    </div>
                  </Tab>
                  <Tab eventKey="contact" title={<><Globe size={16} className="me-1" /> Contact & réseaux</>}>
                    <div className="pt-3">
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-semibold d-flex align-items-center gap-1"><Mail size={14} /> Téléphone</Form.Label>
                        <Form.Control
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                          placeholder="+243 8XX XXX XXX"
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-semibold d-flex align-items-center gap-1"><MapPin size={14} /> Ville / Pays</Form.Label>
                        <Form.Control
                          type="text"
                          value={form.location}
                          onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                          placeholder="Kinshasa, RDC"
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-semibold d-flex align-items-center gap-1"><Globe size={14} /> Site web</Form.Label>
                        <Form.Control
                          type="url"
                          value={form.website}
                          onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                          placeholder="https://..."
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-semibold d-flex align-items-center gap-1"><Linkedin size={14} /> LinkedIn</Form.Label>
                        <Form.Control
                          type="url"
                          value={form.linkedin_url}
                          onChange={(e) => setForm((f) => ({ ...f, linkedin_url: e.target.value }))}
                          placeholder="https://linkedin.com/in/..."
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-semibold d-flex align-items-center gap-1"><Twitter size={14} /> Twitter / X</Form.Label>
                        <Form.Control
                          type="url"
                          value={form.twitter_url}
                          onChange={(e) => setForm((f) => ({ ...f, twitter_url: e.target.value }))}
                          placeholder="https://twitter.com/..."
                        />
                      </Form.Group>
                    </div>
                  </Tab>
                  <Tab eventKey="academic" title={<><GraduationCap size={16} className="me-1" /> Académique</>}>
                    <div className="pt-3">
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-semibold d-flex align-items-center gap-1"><BookOpen size={14} /> Institution</Form.Label>
                        <Form.Control
                          type="text"
                          value={form.institution}
                          onChange={(e) => setForm((f) => ({ ...f, institution: e.target.value }))}
                          placeholder="Université, laboratoire, organisation..."
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-semibold">Domaine(s) d'intérêt</Form.Label>
                        <Form.Select
                          value={form.domain_interest}
                          onChange={(e) => setForm((f) => ({ ...f, domain_interest: e.target.value }))}
                        >
                          <option value="">— Choisir —</option>
                          {DOMAIN_INTERESTS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </div>
                  </Tab>
                </Tabs>

                {error && <div className="alert alert-danger small py-2 mb-3">{error}</div>}
                {message && <div className="alert alert-success small py-2 mb-3">{message}</div>}
                <Button type="submit" variant="danger" className="rounded-pill" disabled={saving}>
                  {saving ? 'Enregistrement…' : 'Enregistrer le profil'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-transparent border-0 fw-bold d-flex align-items-center gap-2">
              <CreditCard size={20} />
              Historique
            </Card.Header>
            <Card.Body className="pt-0">
              {loadingHistory ? (
                <div className="text-center py-4 small text-body-secondary">Chargement de l'historique…</div>
              ) : history.length === 0 ? (
                <div className="text-center py-4 small text-body-secondary">Aucune activité récente. Vos publications apparaîtront ici.</div>
              ) : (
                <ListGroup variant="flush">
                  {history.map((item) => (
                    <ListGroup.Item key={item.id || item.date} className="border-0 border-bottom px-0 py-3 d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-2 flex-grow-1 min-w-0">
                        <FileText size={18} className="text-body-secondary flex-shrink-0" />
                        <div className="min-w-0">
                          <Link to={`/publication/${item.id}`} className="small fw-semibold text-body text-decoration-none d-block text-truncate">
                            {item.title}
                          </Link>
                          <div className="small text-body-secondary">{item.date}</div>
                        </div>
                      </div>
                      {item.status && (
                        <Badge
                          bg={item.status === 'Validée' ? 'success' : item.status === 'Rejetée' ? 'danger' : 'warning'}
                          className="rounded-pill flex-shrink-0 ms-2"
                        >
                          {item.status}
                        </Badge>
                      )}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
