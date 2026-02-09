import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
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
import { useTranslation } from 'react-i18next';
import AfricadataHeader from 'components/layout/AfricadataHeader';
import AfricadataFooter from 'components/layout/AfricadataFooter';
import { GoogleIcon } from 'components/ui/GoogleIcon';
import { useAuth } from 'context/AuthContext';
import { signUp, signInWithOAuth } from 'services/auth';
import { getProfile, updateProfile } from 'services/profile';
import { isSupabaseConfigured as hasSupabase } from 'lib/supabase';
import 'components/layout/AfricadataHeader.css';
import 'components/auth.css';
import './inscription.css';

const ROLES = [
  { value: 'chercheur', labelKey: 'auth.roleResearcher', descKey: 'auth.roleResearcherDesc' },
  { value: 'lecteur', labelKey: 'auth.roleReader', descKey: 'auth.roleReaderDesc' },
  { value: 'editeur', labelKey: 'auth.roleEditor', descKey: 'auth.roleEditorDesc' },
];

const SIDEBAR_BENEFIT_KEYS = [
  { icon: Shield, titleKey: 'auth.sidebarSecure', textKey: 'auth.sidebarSecureDesc' },
  { icon: BookOpen, titleKey: 'auth.sidebarOpenScience', textKey: 'auth.sidebarOpenScienceDesc' },
  { icon: GraduationCap, titleKey: 'auth.sidebarNetwork', textKey: 'auth.sidebarNetworkDesc' },
  { icon: Fingerprint, titleKey: 'auth.sidebarOrcid', textKey: 'auth.sidebarOrcidDesc' },
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

const MSG_GOOGLE_NON_CONFIG_KEY = 'auth.signupGoogleNotConfigured';

function InscriptionContent({ onGoogleAuth, googleError, googleLoading }) {
  const { t } = useTranslation();
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
  const [signupSuccessNeedsConfirm, setSignupSuccessNeedsConfirm] = useState(false);
  const navigate = useNavigate();
  const { user, setUser, authLoading: authLoadingContext } = useAuth();

  if (authLoadingContext) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="spinner-border text-danger" role="status"><span className="visually-hidden">{t('common.loading')}</span></div>
      </div>
    );
  }
  if (user) {
    // Sur la plateforme (inscription), tout le monde va au tableau de bord utilisateur.
    return <Navigate to="/dashboard" replace />;
  }

  if (signupSuccessNeedsConfirm) {
    return (
      <div className="auth-page inscription-page min-vh-100 d-flex flex-column">
        <AfricadataHeader />
        <main className="auth-main inscription-main">
          <Container className="w-100">
            <Row className="justify-content-center">
              <Col lg="6" xl="5">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="auth-card border-0 shadow-lg overflow-hidden">
                    <Card.Body className="p-4 p-lg-5 text-center">
                      <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10 text-success mb-3" style={{ width: 64, height: 64 }}>
                        <Mail size={32} />
                      </div>
                      <h2 className="h5 fw-bold mb-3">{t('auth.signupSuccessTitle')}</h2>
                      <p className="text-body-secondary mb-4">
                        {t('auth.signupSuccessMessage')}
                      </p>
                      <p className="small text-body-secondary mb-4">
                        Une fois l’email confirmé, cliquez sur le bouton {t('auth.signupSuccessNext')}
                      </p>
                      <Button
                        as={Link}
                        to={{ pathname: '/connexion', state: { fromSignup: true, message: t('auth.signupSuccessMessage') } }}
                        variant="danger"
                        size="lg"
                        className="rounded-pill px-4 d-inline-flex align-items-center gap-2"
                      >
                        {t('nav.login')}
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (password !== confirmPassword) {
      setAuthError(t('auth.passwordMismatch'));
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
        const uid = data?.user?.id;
        const session = data?.session;

        // Confirmation email activée dans Supabase : pas de session → on affiche le message
        // "Rendez-vous sur votre boîte email, puis cliquez sur Se connecter" (sans tenter de connexion auto)
        if (data?.user && !session) {
          setAuthLoading(false);
          setSignupSuccessNeedsConfirm(true);
          try {
            sessionStorage.setItem('africadata-signup-pending-confirm', '1');
          } catch (_) {}
          return;
        }

        // Pas de confirmation email : session présente → connexion directe et redirection
        if (uid && session) {
          const baseUser = {
            id: uid,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
            picture: data.user.user_metadata?.avatar_url,
            sub: uid,
          };
          const { data: profile, error: profileErr } = await getProfile(uid);
          let userRole = profile?.role ?? role;
          if (profileErr && !profile) {
            await updateProfile(uid, { full_name: baseUser.name, email: data.user.email, role });
            userRole = role;
          }
          setUser({ ...baseUser, role: userRole });
          setTimeout(() => navigate('/dashboard', { replace: true }), 0);
        } else if (data?.user) {
          setAuthLoading(false);
          setSignupSuccessNeedsConfirm(true);
          try {
            sessionStorage.setItem('africadata-signup-pending-confirm', '1');
          } catch (_) {}
          return;
        }
      } else {
        setAuthError(t('auth.signupNotConfigured'));
      }
    } catch (err) {
      const msg = err?.message || '';
      if (/invalid login credentials|email not confirmed|confirm your email|signup/i.test(msg)) {
        setSignupSuccessNeedsConfirm(true);
        try {
          sessionStorage.setItem('africadata-signup-pending-confirm', '1');
        } catch (_) {}
      } else {
        setAuthError(msg || t('auth.signupFailed'));
      }
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
              {t('auth.signupBadge')}
            </Badge>
            <h1 className="h2 fw-bold mb-2">{t('auth.signupTitle')}</h1>
            <p className="text-body-secondary mb-0">
              {t('auth.signupSubtitle')}
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
                              {googleLoading ? t('auth.signupInProgress') : t('auth.signUpWithGoogle')}
                            </Button>
                            {(googleError || authError) && (
                              <p className="small text-danger mb-0 mt-2">{googleError || authError}</p>
                            )}
                          </motion.div>

                          <motion.div variants={itemVariants} className="auth-divider my-3">
                            <span className="small text-body-secondary">{t('auth.orWithForm')}</span>
                          </motion.div>

                          <motion.div variants={itemVariants} className="row g-3">
                            <Col xs="12" sm="6">
                              <Form.Group>
                                <Form.Label className="small fw-semibold text-body-secondary d-flex align-items-center gap-1">
                                  <User size={14} /> {t('auth.firstName')}
                                </Form.Label>
                                <Form.Control
                                  type="text"
                                  placeholder={t('auth.firstName')}
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
                                  <User size={14} /> {t('auth.lastName')}
                                </Form.Label>
                                <Form.Control
                                  type="text"
                                  placeholder={t('auth.lastName')}
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
                                <Mail size={14} /> {t('auth.professionalEmail')}
                              </Form.Label>
                              <Form.Control
                                type="email"
                                placeholder={t('auth.emailPlaceholder')}
                                required
                                className="auth-input"
                                size="lg"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={authLoading}
                              />
                              <Form.Text className="small text-body-secondary">
                                {t('auth.institutionalPreferred')}
                              </Form.Text>
                            </Form.Group>
                          </motion.div>

                          <motion.div variants={itemVariants}>
                            <Form.Group className="mt-3">
                              <Form.Label className="small fw-semibold text-body-secondary d-flex align-items-center gap-1">
                                <Sparkles size={14} /> {t('auth.profileType')}
                              </Form.Label>
                              <Form.Select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                size="lg"
                                className="auth-input"
                              >
                                {ROLES.map((r) => (
                                  <option key={r.value} value={r.value}>
                                    {t(r.labelKey)}
                                  </option>
                                ))}
                              </Form.Select>
                              <Form.Text className="small text-body-secondary">
                                {t(ROLES.find((r) => r.value === role)?.descKey || '')}
                              </Form.Text>
                            </Form.Group>
                          </motion.div>

                          <motion.div variants={itemVariants}>
                            <Form.Group className="mt-3">
                              <Form.Label className="small fw-semibold text-body-secondary d-flex align-items-center gap-1">
                                <Building2 size={14} /> {t('auth.institution')} <span className="text-muted fw-normal">({t('auth.institutionOptional')})</span>
                              </Form.Label>
                              <Form.Control
                                type="text"
                                placeholder={t('auth.institutionPlaceholder')}
                                className="auth-input"
                                size="lg"
                              />
                            </Form.Group>
                          </motion.div>

                          <motion.div variants={itemVariants}>
                            <Form.Group className="mt-3">
                              <Form.Label className="small fw-semibold text-body-secondary d-flex align-items-center gap-1">
                                <Fingerprint size={14} /> ORCID <span className="text-muted fw-normal">({t('auth.orcidOptional')})</span>
                              </Form.Label>
                              <Form.Control
                                type="text"
                                placeholder={t('auth.orcidPlaceholder')}
                                className="auth-input"
                                size="lg"
                              />
                              <Form.Text className="small text-body-secondary">
                                {t('auth.orcidHelp')}
                              </Form.Text>
                            </Form.Group>
                          </motion.div>

                          <motion.div variants={itemVariants}>
                            <Form.Group className="mt-3">
                              <Form.Label className="small fw-semibold text-body-secondary d-flex align-items-center gap-1">
                                <Lock size={14} /> {t('auth.password')}
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
                                  aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
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
                                {t('auth.confirmPassword')}
                              </Form.Label>
                              <Form.Control
                                type={showPassword ? 'text' : 'password'}
                                placeholder={t('auth.confirmPasswordPlaceholder')}
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
                                    {t('auth.termsAccept')}
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
                              {authLoading ? t('auth.signupInProgress') : t('auth.createAccount')}
                              <ArrowRight size={20} />
                            </Button>
                          </motion.div>

                          <motion.p variants={itemVariants} className="text-center small text-body-secondary mt-4 mb-0">
                            {t('auth.alreadyAccount')}{' '}
                            <Link to="/connexion" className="fw-semibold text-danger text-decoration-none">
                              {t('nav.login')}
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
                          {t('auth.whySignUp')}
                        </h3>
                        <ListGroup variant="flush" className="auth-benefits-list">
                          {SIDEBAR_BENEFIT_KEYS.map((b, i) => {
                            const Icon = b.icon;
                            return (
                              <motion.div
                                key={b.titleKey}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + i * 0.08, duration: 0.3 }}
                              >
                                <ListGroup.Item className="auth-benefit-item border-0 bg-transparent text-white px-0 py-2 d-flex align-items-start gap-3">
                                  <span className="auth-benefit-icon rounded-2 d-flex align-items-center justify-content-center flex-shrink-0">
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
                          {t('auth.signupFreeNote')}
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

function InscriptionWithSupabase() {
  const { t } = useTranslation();
  const [googleError, setGoogleError] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleAuth = async () => {
    setGoogleError(null);
    setGoogleLoading(true);
    try {
      await signInWithOAuth('google', '/dashboard');
      // signInWithOAuth redirige vers Google ; après connexion, Supabase redirige vers /dashboard avec session
    } catch (err) {
      setGoogleError(err?.message || t('auth.signupGoogleNotConfigured'));
      setGoogleLoading(false);
    }
  };

  return (
    <InscriptionContent
      onGoogleAuth={handleGoogleAuth}
      googleError={googleError}
      googleLoading={googleLoading}
    />
  );
}

function InscriptionNoSupabase() {
  const { t } = useTranslation();
  const [googleError, setGoogleError] = useState(null);

  const handleGoogleAuth = () => {
    setGoogleError(t(MSG_GOOGLE_NON_CONFIG_KEY));
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
  return hasSupabase() ? <InscriptionWithSupabase /> : <InscriptionNoSupabase />;
}
