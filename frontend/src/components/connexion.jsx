import { useState, useEffect } from 'react';
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
  Alert,
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
import { useTranslation } from 'react-i18next';
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

const SIDEBAR_BENEFIT_KEYS = [
  { icon: FileText, titleKey: 'auth.benefitPublications', textKey: 'auth.benefitPublicationsDesc' },
  { icon: LayoutDashboard, titleKey: 'auth.benefitDashboard', textKey: 'auth.benefitDashboardDesc' },
  { icon: Send, titleKey: 'auth.benefitSubmit', textKey: 'auth.benefitSubmitDesc' },
  { icon: Shield, titleKey: 'auth.benefitSecure', textKey: 'auth.benefitSecureDesc' },
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

const MSG_GOOGLE_NON_CONFIG_KEY = 'auth.googleNotConfigured';

function ConnexionContent({ onGoogleAuth, googleError, googleLoading }) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [signupConfirmMessage, setSignupConfirmMessage] = useState(null);
  const { user, setUser, authLoading: authLoadingContext } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminLogin = location.pathname === '/connexion-admin';

  // Message de confirmation après inscription : state de la navigation ou sessionStorage (secours)
  useEffect(() => {
    const fromState = location.state?.message;
    if (fromState) {
      setSignupConfirmMessage(fromState);
      return;
    }
    try {
      if (sessionStorage.getItem('africadata-signup-pending-confirm') === '1') {
        sessionStorage.removeItem('africadata-signup-pending-confirm');
        setSignupConfirmMessage(t('auth.signupSuccessMessage'));
      }
    } catch (_) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.message]);

  if (authLoadingContext) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="spinner-border text-danger" role="status"><span className="visually-hidden">{t('common.loading')}</span></div>
      </div>
    );
  }
  // Arrivée depuis l'inscription : afficher le message de confirmation email puis accès au tableau de bord
  const fromSignupWithMessage = location.state?.fromSignup && location.state?.message;
  if (user && fromSignupWithMessage && !isAdminLogin) {
    const message = location.state.message;
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
                {t('auth.login')}
              </Badge>
              <h1 className="h2 fw-bold mb-2">{t('auth.loginToAfricaData')}</h1>
              <p className="text-body-secondary mb-0">{t('auth.loginSubtitle')}</p>
            </motion.div>
            <Row className="justify-content-center">
              <Col lg="8" xl="7">
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45 }}
                >
                  <Card className="auth-card border-0 shadow-lg overflow-hidden">
                    <Card.Body className="p-4 p-lg-5 text-center">
                      <Alert variant="info" className="mb-4">
                        {message}
                      </Alert>
                      <p className="text-body-secondary small mb-4">
                        Une fois votre email confirmé, vous pourrez vous connecter avec votre mot de passe. Vous pouvez aussi accéder à votre espace si vous êtes déjà connecté.
                      </p>
                      <Button
                        variant="danger"
                        size="lg"
                        className="rounded-pill px-4 d-inline-flex align-items-center gap-2"
                        onClick={() => navigate('/dashboard', { replace: true })}
                      >
                        Accéder au tableau de bord
                        <ArrowRight size={18} />
                      </Button>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            </Row>
          </Container>
        </main>
        <AfricadataFooter />
      </div>
    );
  }
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
          // Redirection après mise à jour du contexte (setUser asynchrone)
          const redirectPath = isAdminLogin && isAdminRole(role) ? '/superadmin' : '/dashboard';
          const redirectState = isAdminLogin && !isAdminRole(role) ? { message: t('auth.adminOnlyAccess') } : undefined;
          setTimeout(() => navigate(redirectPath, { replace: true, state: redirectState }), 0);
        }
      } else {
        setAuthError(t('auth.emailNotConfigured'));
      }
    } catch (err) {
      setAuthError(err.message || t('auth.emailOrPasswordInvalid'));
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
              {isAdminLogin ? t('auth.loginSuperAdmin') : t('auth.login')}
            </Badge>
            <h1 className="h2 fw-bold mb-2">
              {isAdminLogin ? t('auth.loginSuperAdminTitle') : t('auth.loginToAfricaData')}
            </h1>
            <p className="text-body-secondary mb-0">
              {isAdminLogin ? t('auth.loginAdminSubtitle') : t('auth.loginSubtitle')}
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
                          {!isAdminLogin && signupConfirmMessage && (
                            <Alert variant="info" className="mb-3 mb-lg-4 small">
                              {signupConfirmMessage}
                            </Alert>
                          )}
                          <Form onSubmit={handleSubmit} className="auth-form connexion-form">
                            {/* Connexion Google directement (utilisateur et admin) */}
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
                                {googleLoading ? t('auth.signingIn') : t('auth.signInWithGoogle')}
                              </Button>
                            </motion.div>
                            {isAdminLogin && (
                              <motion.div variants={itemVariants}>
                                <p className="small text-body-secondary mb-2">
                                  {t('auth.useAdminCredentials')}
                                </p>
                              </motion.div>
                            )}
                            {!isAdminLogin && (
                              <motion.div variants={itemVariants} className="auth-divider my-3">
                                <span className="small text-body-secondary">{t('auth.orWithEmail')}</span>
                              </motion.div>
                            )}
                            {(googleError || authError) && (
                              <p className="small text-danger mb-0 mt-2">{googleError || authError}</p>
                            )}

                            <motion.div variants={itemVariants}>
                              <Form.Group className="mb-3">
                                <Form.Label className="small fw-semibold text-body-secondary d-flex align-items-center gap-1">
                                  <Mail size={14} /> {t('auth.email')}
                                </Form.Label>
                                <Form.Control
                                  type="email"
                                  placeholder={t('auth.emailPlaceholder')}
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
                                  <Lock size={14} /> {t('auth.password')}
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
                                    aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                                  >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                  </Button>
                                </InputGroup>
                                <div className="d-flex justify-content-end mt-1">
                                  <Link to="/mot-de-passe-oublie" className="small text-body-secondary text-decoration-none d-flex align-items-center gap-1">
                                    <KeyRound size={14} /> {t('auth.forgotPassword')}
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
                                {authLoading ? t('auth.signingIn') : t('auth.connectButton')}
                                <ArrowRight size={20} />
                              </Button>
                            </motion.div>

                            <motion.div variants={itemVariants} className="auth-divider my-4">
                              <span className="small text-body-secondary">{t('auth.or')}</span>
                            </motion.div>

                            <motion.p variants={itemVariants} className="text-center small text-body-secondary mb-0">
                              {!isAdminLogin && (
                                <>
                                  {t('auth.noAccountYet')}{' '}
                                  <Link to="/inscription" className="fw-semibold text-danger text-decoration-none">
                                    {t('auth.createAccountLink')}
                                  </Link>
                                </>
                              )}
                            </motion.p>
                            {/* Lien "Connexion administrateur" masqué sur la page connexion publique ; les admins peuvent toujours aller sur /connexion-admin directement */}
                            {isAdminLogin && (
                              <motion.p variants={itemVariants} className="text-center small text-body-secondary mb-0 mt-2">
                                <Link to="/connexion" className="fw-semibold text-danger text-decoration-none">
                                  {t('auth.loginUser')}
                                </Link>
                              </motion.p>
                            )}

                            <motion.div
                              variants={itemVariants}
                              className="d-flex align-items-center justify-content-center gap-2 mt-4 pt-3 border-top border-secondary"
                            >
                              <Shield size={16} className="text-body-secondary" />
                              <span className="small text-body-secondary">{t('auth.secureLogin')}</span>
                            </motion.div>
                          </Form>
                        </Card.Body>
                      </Col>

                      {/* Sidebar avantages */}
                      <Col lg="5" className="auth-sidebar-col">
                        <Card.Body className="auth-sidebar p-4 p-lg-5 d-flex flex-column justify-content-center">
                          <h3 className="h6 fw-bold text-white mb-3 d-flex align-items-center gap-2">
                            <LayoutDashboard size={20} />
                            {t('auth.whySignIn')}
                          </h3>
                          <ListGroup variant="flush" className="auth-benefits-list">
                            {SIDEBAR_BENEFIT_KEYS.map((b, i) => {
                              const Icon = b.icon;
                              return (
                                <motion.div
                                  key={b.titleKey}
                                  initial={{ opacity: 0, x: 10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.15 + i * 0.07, duration: 0.3 }}
                                >
                                  <ListGroup.Item className="auth-benefit-item text-white px-0 py-2 d-flex align-items-start gap-3">
                                    <span className="auth-benefit-icon d-flex align-items-center justify-content-center flex-shrink-0">
                                      <Icon size={18} />
                                    </span>
                                    <div>
                                      <span className="fw-semibold small d-block">{t(b.titleKey)}</span>
                                      <span className="small opacity-85">{t(b.textKey)}</span>
                                    </div>
                                  </ListGroup.Item>
                                </motion.div>
                              );
                            })}
                          </ListGroup>
                          <p className="small text-white opacity-75 mt-4 mb-0">
                            {t('auth.benefitDashboardDesc')}
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
  const { t } = useTranslation();
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
      setGoogleError(err?.message || t('auth.googleNotConfigured'));
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
  const { t } = useTranslation();
  const [googleError, setGoogleError] = useState(null);

  const handleGoogleAuth = () => {
    setGoogleError(t(MSG_GOOGLE_NON_CONFIG_KEY));
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
