import { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  LogIn,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  FileText,
  LayoutDashboard,
  Send,
  KeyRound,
} from 'lucide-react';
import AfricadataHeader from 'components/layout/AfricadataHeader';
import AfricadataFooter from 'components/layout/AfricadataFooter';
import { GoogleIcon } from 'components/ui/GoogleIcon';
import { useAuth } from 'context/AuthContext';
import { signIn, signInWithOAuth } from 'services/auth';
import { getProfile } from 'services/profile';
import { isAdminRole } from 'lib/adminRoles';
import { isSupabaseConfigured as hasSupabase } from 'lib/supabase';
import 'components/layout/AfricadataHeader.css';
import 'components/auth.css';
import './connexion.css';

const SIDEBAR_BENEFITS = [
  { icon: FileText, title: 'Vos publications', text: 'Accédez à l\'ensemble de vos travaux et métadonnées' },
  { icon: LayoutDashboard, title: 'Tableau de bord', text: 'Suivez les consultations et téléchargements' },
  { icon: Send, title: 'Soumettre des travaux', text: 'Déposez de nouvelles publications en quelques clics' },
  { icon: Shield, title: 'Données sécurisées', text: 'Environnement conforme et traçable' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const MSG_GOOGLE_NON_CONFIG = 'Connexion Google non configurée. Activez le fournisseur Google dans Supabase (Authentication > Providers) et configurez les identifiants dans Google Cloud Console.';

function ConnexionContent({ onGoogleAuth, googleError, googleLoading }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminLogin = location.pathname === '/connexion-admin';

  if (user) {
    // Depuis la plateforme : tout le monde (y compris admin) va au tableau de bord utilisateur.
    // Depuis /connexion-admin : l'admin va directement à l'interface superadmin.
    if (isAdminLogin && isAdminRole(user.role)) return <Navigate to="/superadmin" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      if (hasSupabase()) {
        const { data } = await signIn({ email: email.trim(), password });
        if (data?.user) {
          const uid = data.user.id;
          const baseUser = {
            id: uid,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
            picture: data.user.user_metadata?.avatar_url,
            sub: uid,
          };
          const { data: profile } = await getProfile(uid);
          const role = profile?.role ?? 'chercheur';
          setUser({ ...baseUser, role });
          // Connexion depuis /connexion-admin en tant qu'admin → interface superadmin.
          // Sinon (plateforme ou non-admin) → tableau de bord utilisateur.
          if (isAdminLogin && isAdminRole(role)) {
            navigate('/superadmin', { replace: true });
          } else if (isAdminLogin && !isAdminRole(role)) {
            navigate('/dashboard', { replace: true, state: { message: 'Accès réservé aux administrateurs. Vous êtes connecté en tant qu\'utilisateur.' } });
          } else {
            navigate('/dashboard', { replace: true });
          }
        }
      } else {
        setAuthError('Connexion email non configurée. Configurez Supabase (voir .env.example).');
      }
    } catch (err) {
      setAuthError(err.message || 'Email ou mot de passe incorrect.');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="auth-page connexion-page min-vh-100 d-flex flex-column">
      <AfricadataHeader />

      <main className="auth-main connexion-main">
        <Container className="w-100">
          <motion.div
            className="text-center mb-4 mb-lg-5"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Badge bg="danger" className="mb-2 px-3 py-2 rounded-pill d-inline-flex align-items-center gap-2">
              <LogIn size={18} />
              {isAdminLogin ? 'Connexion Super Admin' : 'Connexion'}
            </Badge>
            <h1 className="h2 fw-bold mb-2">
              {isAdminLogin ? 'Connexion Super Administrateur' : 'Connexion à AfricaData'}
            </h1>
            <p className="text-body-secondary mb-0">
              {isAdminLogin
                ? 'Accédez au tableau de bord d\'administration de la plateforme.'
                : 'Accédez à votre espace pour gérer vos publications et vos données scientifiques.'}
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
                          <Form onSubmit={handleSubmit} className="auth-form connexion-form">
                            {!isAdminLogin && (
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
                                  {googleLoading ? 'Connexion en cours…' : 'Se connecter avec Google'}
                                </Button>
                              </motion.div>
                            )}
                            {isAdminLogin && (
                              <motion.div variants={itemVariants}>
                                <p className="small text-body-secondary mb-2">
                                  Utilisez votre email et mot de passe du compte administrateur.
                                </p>
                              </motion.div>
                            )}
                            {!isAdminLogin && (
                              <motion.div variants={itemVariants} className="auth-divider my-3">
                                <span className="small text-body-secondary">ou avec email</span>
                              </motion.div>
                            )}
                            {(googleError || authError) && (
                              <p className="small text-danger mb-0 mt-2">{googleError || authError}</p>
                            )}

                            <motion.div variants={itemVariants}>
                              <Form.Group className="mb-3">
                                <Form.Label className="small fw-semibold text-body-secondary d-flex align-items-center gap-1">
                                  <Mail size={14} /> Adresse email
                                </Form.Label>
                                <Form.Control
                                  type="email"
                                  placeholder="prenom.nom@institution.org"
                                  required
                                  size="lg"
                                  className="auth-input"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  disabled={authLoading}
                                />
                              </Form.Group>
                            </motion.div>

                            <motion.div variants={itemVariants}>
                              <Form.Group className="mb-4">
                                <Form.Label className="small fw-semibold text-body-secondary d-flex align-items-center gap-1">
                                  <Lock size={14} /> Mot de passe
                                </Form.Label>
                                <InputGroup size="lg" className="auth-input-group">
                                  <Form.Control
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    required
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
                                <div className="d-flex justify-content-end mt-1">
                                  <Link to="/mot-de-passe-oublie" className="small text-body-secondary text-decoration-none d-flex align-items-center gap-1">
                                    <KeyRound size={14} /> Mot de passe oublié ?
                                  </Link>
                                </div>
                              </Form.Group>
                            </motion.div>

                            <motion.div variants={itemVariants}>
                              <Button
                                type="submit"
                                variant="danger"
                                size="lg"
                                disabled={authLoading}
                                className="w-100 rounded-pill auth-submit-btn d-flex align-items-center justify-content-center gap-2"
                              >
                                {authLoading ? 'Connexion…' : 'Se connecter'}
                                <ArrowRight size={20} />
                              </Button>
                            </motion.div>

                            <motion.div variants={itemVariants} className="auth-divider my-4">
                              <span className="small text-body-secondary">ou</span>
                            </motion.div>

                            <motion.p variants={itemVariants} className="text-center small text-body-secondary mb-0">
                              {!isAdminLogin && (
                                <>
                                  Pas encore de compte ?{' '}
                                  <Link to="/inscription" className="fw-semibold text-danger text-decoration-none">
                                    Créer un compte
                                  </Link>
                                </>
                              )}
                            </motion.p>
                            <motion.p variants={itemVariants} className="text-center small text-body-secondary mb-0 mt-2">
                              {isAdminLogin ? (
                                <Link to="/connexion" className="fw-semibold text-danger text-decoration-none">
                                  Connexion utilisateur
                                </Link>
                              ) : (
                                <Link to="/connexion-admin" className="fw-semibold text-body-secondary text-decoration-none">
                                  Connexion administrateur
                                </Link>
                              )}
                            </motion.p>

                            <motion.div
                              variants={itemVariants}
                              className="d-flex align-items-center justify-content-center gap-2 mt-4 pt-3 border-top border-secondary"
                            >
                              <Shield size={16} className="text-body-secondary" />
                              <span className="small text-body-secondary">Connexion sécurisée</span>
                            </motion.div>
                          </Form>
                        </Card.Body>
                      </Col>

                      {/* Sidebar avantages */}
                      <Col lg="5" className="auth-sidebar-col">
                        <Card.Body className="auth-sidebar p-4 p-lg-5 d-flex flex-column justify-content-center">
                          <h3 className="h6 fw-bold text-white mb-3 d-flex align-items-center gap-2">
                            <LayoutDashboard size={20} />
                            Pourquoi se connecter ?
                          </h3>
                          <ListGroup variant="flush" className="auth-benefits-list">
                            {SIDEBAR_BENEFITS.map((b, i) => {
                              const Icon = b.icon;
                              return (
                                <motion.div
                                  key={b.title}
                                  initial={{ opacity: 0, x: 10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.15 + i * 0.07, duration: 0.3 }}
                                >
                                  <ListGroup.Item className="auth-benefit-item text-white px-0 py-2 d-flex align-items-start gap-3">
                                    <span className="auth-benefit-icon d-flex align-items-center justify-content-center flex-shrink-0">
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
                            Accès selon votre profil : lecteur, auteur ou éditeur.
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

function ConnexionWithSupabase() {
  const [googleError, setGoogleError] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const location = useLocation();
  const isAdminLogin = location.pathname === '/connexion-admin';

  const handleGoogleAuth = async () => {
    setGoogleError(null);
    setGoogleLoading(true);
    try {
      const redirectPath = isAdminLogin ? '/superadmin' : '/dashboard';
      await signInWithOAuth('google', redirectPath);
      // signInWithOAuth redirige vers Google ; si erreur avant redirection, on l'affiche
    } catch (err) {
      setGoogleError(err?.message || 'Connexion Google impossible. Vérifiez que le fournisseur Google est activé dans Supabase.');
      setGoogleLoading(false);
    }
  };

  return (
    <ConnexionContent
      onGoogleAuth={handleGoogleAuth}
      googleError={googleError}
      googleLoading={googleLoading}
    />
  );
}

function ConnexionNoSupabase() {
  const [googleError, setGoogleError] = useState(null);

  const handleGoogleAuth = () => {
    setGoogleError(MSG_GOOGLE_NON_CONFIG);
  };

  return (
    <ConnexionContent
      onGoogleAuth={handleGoogleAuth}
      googleError={googleError}
      googleLoading={false}
    />
  );
}

export default function Connexion() {
  return hasSupabase() ? <ConnexionWithSupabase /> : <ConnexionNoSupabase />;
}
