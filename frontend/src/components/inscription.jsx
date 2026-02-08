import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  InputGroup,
  ListGroup,
  Badge,
} from 'react-bootstrap';
import {
  UserPlus,
  Shield,
  BookOpen,
  GraduationCap,
  Building2,
  Fingerprint,
  Lock,
  Mail,
  User,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';
import AfricadataHeader from 'components/layout/AfricadataHeader';
import AfricadataFooter from 'components/layout/AfricadataFooter';
import { GoogleIcon } from 'components/ui/GoogleIcon';
import { useAuth } from 'context/AuthContext';
import { signUp } from 'services/auth';
import { getProfile } from 'services/profile';
import { isSupabaseConfigured as hasSupabase } from 'lib/supabase';
import 'components/layout/AfricadataHeader.css';
import 'components/auth.css';
import './inscription.css';

const ROLES = [
  { value: 'chercheur', label: 'Chercheur / Auteur', desc: 'Soumettre et gérer vos publications' },
  { value: 'lecteur', label: 'Lecteur', desc: 'Consulter et télécharger les publications' },
  { value: 'editeur', label: 'Éditeur', desc: 'Valider et gérer les soumissions' },
];

const SIDEBAR_BENEFITS = [
  { icon: Shield, title: 'Environnement sécurisé', text: 'Données protégées et conformes RGPD' },
  { icon: BookOpen, title: 'Open Science', text: 'DOI, OAI-PMH et indexation internationale' },
  { icon: GraduationCap, title: 'Réseau international', text: 'Partenaires et institutions du monde entier' },
  { icon: Fingerprint, title: 'ORCID optionnel', text: 'Liez votre identifiant chercheur' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const MSG_GOOGLE_NON_CONFIG = 'Inscription Google non configurée. Ajoutez REACT_APP_GOOGLE_CLIENT_ID dans le fichier .env (voir .env.example).';

function InscriptionContent({ onGoogleAuth, googleError, googleLoading }) {
  const [role, setRole] = useState('chercheur');
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  if (user) {
    // Sur la plateforme (inscription), tout le monde va au tableau de bord utilisateur.
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (password !== confirmPassword) {
      setAuthError('Les deux mots de passe ne correspondent pas.');
      return;
    }
    setAuthLoading(true);
    try {
      if (hasSupabase()) {
        const { data } = await signUp({
          email: email.trim(),
          password,
          fullName: `${firstName.trim()} ${lastName.trim()}`.trim(),
          role,
        });
        setAuthError('');
        if (data?.user && data?.session) {
          const uid = data.user.id;
          const baseUser = {
            id: uid,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
            picture: data.user.user_metadata?.avatar_url,
            sub: uid,
          };
          const { data: profile } = await getProfile(uid);
          const userRole = profile?.role ?? role;
          setUser({ ...baseUser, role: userRole });
          // Après inscription sur la plateforme → tableau de bord utilisateur.
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/connexion', { replace: true, state: { message: 'Compte créé. Connectez-vous pour accéder à votre tableau de bord.' } });
        }
      } else {
        setAuthError('Inscription non configurée. Configurez Supabase (voir .env.example).');
      }
    } catch (err) {
      setAuthError(err.message || 'Inscription impossible. Réessayez.');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="auth-page inscription-page min-vh-100 d-flex flex-column">
      <AfricadataHeader />

      <main className="auth-main inscription-main">
        <Container className="w-100">
          <motion.div
            className="text-center mb-4 mb-lg-5"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Badge bg="danger" className="mb-2 px-3 py-2 rounded-pill d-inline-flex align-items-center gap-2 inscription-badge">
              <UserPlus size={18} />
              Créer un compte
            </Badge>
            <h1 className="h2 fw-bold mb-2">Inscription à AfricaData</h1>
            <p className="text-body-secondary mb-0">
              Rejoignez la plateforme de collecte et de publication scientifiques. Compte gratuit.
            </p>
          </motion.div>

          <Row className="justify-content-center">
            <Col lg="8" xl="7">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="auth-card-wrapper"
              >
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                <Card className="auth-card border-0 shadow-lg overflow-hidden">
                  <Row className="g-0">
                    {/* Formulaire */}
                    <Col lg="7">
                      <Card.Body className="p-4 p-lg-5">
                        <Form onSubmit={handleSubmit} className="auth-form inscription-form">
                          <motion.div variants={itemVariants}>
                            <Button
                              type="button"
                              variant="light"
                              size="lg"
                              className="w-100 auth-google-btn mb-2"
                              onClick={onGoogleAuth}
                              disabled={googleLoading}
                            >
                              <GoogleIcon size={22} />
                              {googleLoading ? 'Inscription en cours…' : "S'inscrire avec Google"}
                            </Button>
                            {(googleError || authError) && (
                              <p className="small text-danger mb-0 mt-2">{googleError || authError}</p>
                            )}
                          </motion.div>

                          <motion.div variants={itemVariants} className="auth-divider my-3">
                            <span className="small text-body-secondary">ou avec le formulaire</span>
                          </motion.div>

                          <motion.div variants={itemVariants} className="row g-3">
                            <Col xs="12" sm="6">
                              <Form.Group>
                                <Form.Label className="small fw-semibold text-body-secondary d-flex align-items-center gap-1">
                                  <User size={14} /> Prénom
                                </Form.Label>
                                <Form.Control
                                  type="text"
                                  placeholder="Prénom"
                                  required
                                  className="auth-input"
                                  size="lg"
                                  value={firstName}
                                  onChange={(e) => setFirstName(e.target.value)}
                                  disabled={authLoading}
                                />
                              </Form.Group>
                            </Col>
                            <Col xs="12" sm="6">
                              <Form.Group>
                                <Form.Label className="small fw-semibold text-body-secondary d-flex align-items-center gap-1">
                                  <User size={14} /> Nom
                                </Form.Label>
                                <Form.Control
                                  type="text"
                                  placeholder="Nom"
                                  required
                                  className="auth-input"
                                  size="lg"
                                  value={lastName}
                                  onChange={(e) => setLastName(e.target.value)}
                                  disabled={authLoading}
                                />
                              </Form.Group>
                            </Col>
                          </motion.div>

                          <motion.div variants={itemVariants}>
                            <Form.Group className="mt-3">
                              <Form.Label className="small fw-semibold text-body-secondary d-flex align-items-center gap-1">
                                <Mail size={14} /> Adresse email professionnelle
                              </Form.Label>
                              <Form.Control
                                type="email"
                                placeholder="prenom.nom@institution.org"
                                required
                                className="auth-input"
                                size="lg"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={authLoading}
                              />
                              <Form.Text className="small text-body-secondary">
                                De préférence une adresse institutionnelle.
                              </Form.Text>
                            </Form.Group>
                          </motion.div>

                          <motion.div variants={itemVariants}>
                            <Form.Group className="mt-3">
                              <Form.Label className="small fw-semibold text-body-secondary d-flex align-items-center gap-1">
                                <Sparkles size={14} /> Profil d'utilisation
                              </Form.Label>
                              <Form.Select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                size="lg"
                                className="auth-input"
                              >
                                {ROLES.map((r) => (
                                  <option key={r.value} value={r.value}>
                                    {r.label}
                                  </option>
                                ))}
                              </Form.Select>
                              <Form.Text className="small text-body-secondary">
                                {ROLES.find((r) => r.value === role)?.desc}
                              </Form.Text>
                            </Form.Group>
                          </motion.div>

                          <motion.div variants={itemVariants}>
                            <Form.Group className="mt-3">
                              <Form.Label className="small fw-semibold text-body-secondary d-flex align-items-center gap-1">
                                <Building2 size={14} /> Institution <span className="text-muted fw-normal">(optionnel)</span>
                              </Form.Label>
                              <Form.Control
                                type="text"
                                placeholder="Université, laboratoire, organisation"
                                className="auth-input"
                                size="lg"
                              />
                            </Form.Group>
                          </motion.div>

                          <motion.div variants={itemVariants}>
                            <Form.Group className="mt-3">
                              <Form.Label className="small fw-semibold text-body-secondary d-flex align-items-center gap-1">
                                <Fingerprint size={14} /> ORCID <span className="text-muted fw-normal">(optionnel)</span>
                              </Form.Label>
                              <Form.Control
                                type="text"
                                placeholder="0000-0000-0000-0000"
                                className="auth-input"
                                size="lg"
                              />
                              <Form.Text className="small text-body-secondary">
                                Identifiant chercheur pour lier vos publications.
                              </Form.Text>
                            </Form.Group>
                          </motion.div>

                          <motion.div variants={itemVariants}>
                            <Form.Group className="mt-3">
                              <Form.Label className="small fw-semibold text-body-secondary d-flex align-items-center gap-1">
                                <Lock size={14} /> Mot de passe
                              </Form.Label>
                              <InputGroup size="lg" className="auth-input-group">
                                <Form.Control
                                  type={showPassword ? 'text' : 'password'}
                                  placeholder="Minimum 8 caractères"
                                  required
                                  minLength={8}
                                  className="auth-input border-end-0"
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  disabled={authLoading}
                                />
                                <Button
                                  type="button"
                                  variant="outline-secondary"
                                  className="auth-password-toggle border-start-0 d-flex align-items-center justify-content-center"
                                  onClick={() => setShowPassword(!showPassword)}
                                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                                >
                                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </Button>
                              </InputGroup>
                              <Form.Text className="small text-body-secondary">
                                Majuscule, minuscule, chiffre et caractère spécial recommandés.
                              </Form.Text>
                            </Form.Group>
                          </motion.div>

                          <motion.div variants={itemVariants}>
                            <Form.Group className="mt-3">
                              <Form.Label className="small fw-semibold text-body-secondary">
                                Confirmer le mot de passe
                              </Form.Label>
                              <Form.Control
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Saisissez à nouveau le mot de passe"
                                required
                                minLength={8}
                                className="auth-input"
                                size="lg"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={authLoading}
                              />
                            </Form.Group>
                          </motion.div>

                          <motion.div variants={itemVariants}>
                            <Form.Group className="mt-4">
                              <Form.Check
                                type="checkbox"
                                id="cgu"
                                label={
                                  <span className="small">
                                    J'accepte les{' '}
                                    <Link to="/about" className="text-danger text-decoration-none">
                                      conditions d'utilisation
                                    </Link>{' '}
                                    et la politique de confidentialité d'AfricaData, plateforme de publication scientifique.
                                  </span>
                                }
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                required
                                className="inscription-check"
                              />
                            </Form.Group>
                          </motion.div>

                          <motion.div variants={itemVariants}>
                            <Button
                              type="submit"
                              variant="danger"
                              size="lg"
                              className="w-100 mt-4 rounded-pill auth-submit-btn inscription-submit-btn d-flex align-items-center justify-content-center gap-2"
                              disabled={!agreed || authLoading}
                            >
                              {authLoading ? 'Inscription…' : 'Créer mon compte'}
                              <ArrowRight size={20} />
                            </Button>
                          </motion.div>

                          <motion.p variants={itemVariants} className="text-center small text-body-secondary mt-4 mb-0">
                            Déjà un compte ?{' '}
                            <Link to="/connexion" className="fw-semibold text-danger text-decoration-none">
                              Se connecter
                            </Link>
                          </motion.p>
                        </Form>
                      </Card.Body>
                    </Col>

                    {/* Sidebar avantages */}
                    <Col lg="5" className="auth-sidebar-col">
                      <Card.Body className="auth-sidebar p-4 p-lg-5 d-flex flex-column justify-content-center">
                        <h3 className="h6 fw-bold text-white mb-3 d-flex align-items-center gap-2">
                          <CheckCircle2 size={20} />
                          Pourquoi s'inscrire ?
                        </h3>
                        <ListGroup variant="flush" className="auth-benefits-list">
                          {SIDEBAR_BENEFITS.map((b, i) => {
                            const Icon = b.icon;
                            return (
                              <motion.div
                                key={b.title}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + i * 0.08, duration: 0.3 }}
                              >
                                <ListGroup.Item className="auth-benefit-item border-0 bg-transparent text-white px-0 py-2 d-flex align-items-start gap-3">
                                  <span className="auth-benefit-icon rounded-2 d-flex align-items-center justify-content-center flex-shrink-0">
                                    <Icon size={18} />
                                  </span>
                                  <div>
                                    <span className="fw-semibold small d-block">{b.title}</span>
                                    <span className="small opacity-85">{b.text}</span>
                                  </div>
                                </ListGroup.Item>
                              </motion.div>
                            );
                          })}
                        </ListGroup>
                        <p className="small text-white opacity-75 mt-4 mb-0">
                          Inscription gratuite. Accès aux publications selon votre profil.
                        </p>
                      </Card.Body>
                    </Col>
                  </Row>
                </Card>
                </motion.div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </main>

      <AfricadataFooter />
    </div>
  );
}

function InscriptionWithGoogle() {
  const [googleError, setGoogleError] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const googleLogin = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (tokenResponse) => {
      setGoogleError(null);
      setGoogleLoading(true);
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        if (!res.ok) throw new Error('Impossible de récupérer le profil Google');
        const userInfo = await res.json();
        setUser({
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          sub: userInfo.sub,
        });
        navigate('/', { replace: true });
      } catch (err) {
        setGoogleError(err.message || 'Inscription Google échouée');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: (err) => {
      setGoogleError(err?.error_description || err?.error || 'Inscription Google annulée ou refusée');
      setGoogleLoading(false);
    },
  });

  return (
    <InscriptionContent
      onGoogleAuth={googleLogin}
      googleError={googleError}
      googleLoading={googleLoading}
    />
  );
}

function InscriptionNoGoogle() {
  const [googleError, setGoogleError] = useState(null);

  const handleGoogleAuth = () => {
    setGoogleError(MSG_GOOGLE_NON_CONFIG);
  };

  return (
    <InscriptionContent
      onGoogleAuth={handleGoogleAuth}
      googleError={googleError}
      googleLoading={false}
    />
  );
}

export default function Inscription() {
  return process.env.REACT_APP_GOOGLE_CLIENT_ID ? <InscriptionWithGoogle /> : <InscriptionNoGoogle />;
}
