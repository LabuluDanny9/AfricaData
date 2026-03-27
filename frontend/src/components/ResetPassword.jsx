import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Badge,
  InputGroup,
} from 'react-bootstrap';
import { KeyRound, Lock, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AfricadataHeader from 'components/layout/AfricadataHeader';
import AfricadataFooter from 'components/layout/AfricadataFooter';
import { supabase, isSupabaseConfigured } from 'lib/supabase';
import { updateUserPassword } from 'services/auth';
import 'components/layout/AfricadataHeader.css';
import 'components/auth.css';
import './forgotPassword.css';

const MIN_LENGTH = 8;

export default function ResetPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const hashLooksLikeRecovery = useCallback(() => {
    const h = typeof window !== 'undefined' ? window.location.hash || '' : '';
    return (
      h.includes('type=recovery') ||
      h.includes('type%3Drecovery') ||
      (h.includes('access_token') && h.includes('refresh_token'))
    );
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      setChecking(false);
      return;
    }

    let cancelled = false;

    const tryMarkReady = (event) => {
      if (cancelled) return;
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
        setChecking(false);
        return;
      }
      if (event === 'SIGNED_IN' && hashLooksLikeRecovery()) {
        setReady(true);
        setChecking(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      tryMarkReady(event);
    });

    const tick = async () => {
      if (hashLooksLikeRecovery()) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!cancelled && session) {
          setReady(true);
        }
      }
      if (!cancelled) setChecking(false);
    };

    const t0 = window.setTimeout(tick, 100);
    const t1 = window.setTimeout(tick, 600);

    return () => {
      cancelled = true;
      window.clearTimeout(t0);
      window.clearTimeout(t1);
      subscription.unsubscribe();
    };
  }, [hashLooksLikeRecovery]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < MIN_LENGTH) {
      setError(t('auth.resetPasswordTooShort', { min: MIN_LENGTH }));
      return;
    }
    if (password !== confirm) {
      setError(t('auth.resetPasswordMismatch'));
      return;
    }
    setLoading(true);
    try {
      await updateUserPassword(password);
      setDone(true);
      window.setTimeout(() => navigate('/dashboard', { replace: true }), 1500);
    } catch (err) {
      setError(err.message || t('auth.resetPasswordError'));
    } finally {
      setLoading(false);
    }
  };

  if (!isSupabaseConfigured()) {
    return (
      <div className="auth-page min-vh-100 d-flex flex-column">
        <AfricadataHeader />
        <main className="auth-main flex-grow-1 d-flex align-items-center">
          <Container>
            <Alert variant="warning">{t('auth.emailNotConfigured')}</Alert>
          </Container>
        </main>
        <AfricadataFooter />
      </div>
    );
  }

  return (
    <div className="auth-page forgot-password-page min-vh-100 d-flex flex-column">
      <AfricadataHeader />

      <main className="auth-main forgot-password-main">
        <Container className="w-100">
          <motion.div
            className="text-center mb-4 mb-lg-5"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Badge bg="danger" className="mb-2 px-3 py-2 rounded-pill d-inline-flex align-items-center gap-2">
              <KeyRound size={18} />
              {t('auth.resetPasswordBadge')}
            </Badge>
            <h1 className="h2 fw-bold mb-2">{t('auth.resetPasswordTitle')}</h1>
            <p className="text-body-secondary mb-0">{t('auth.resetPasswordLead')}</p>
          </motion.div>

          <Row className="justify-content-center">
            <Col md="8" lg="6" xl="5">
              <Card className="auth-card forgot-password-card border-0 shadow-lg overflow-hidden">
                <Card.Body className="p-4 p-lg-5">
                  {checking && (
                    <div className="text-center py-4 text-body-secondary small">{t('auth.resetPasswordChecking')}</div>
                  )}
                  {!checking && !ready && (
                    <Alert variant="warning" className="mb-0">
                      <p className="mb-2">{t('auth.resetPasswordInvalidLink')}</p>
                      <Button as={Link} to="/mot-de-passe-oublie" variant="danger" size="sm" className="rounded-pill">
                        {t('auth.resetPasswordRequestNewLink')}
                      </Button>
                    </Alert>
                  )}
                  {!checking && ready && !done && (
                    <Form onSubmit={handleSubmit} className="auth-form">
                      {error && (
                        <Alert variant="danger" className="small mb-3 py-2">
                          {error}
                        </Alert>
                      )}
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-semibold text-body-secondary d-flex align-items-center gap-1">
                          <Lock size={14} /> {t('auth.resetPasswordNewLabel')}
                        </Form.Label>
                        <InputGroup size="lg">
                          <Form.Control
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={MIN_LENGTH}
                            autoComplete="new-password"
                            className="auth-input"
                            disabled={loading}
                            placeholder={t('auth.resetPasswordNewPlaceholder')}
                          />
                          <Button
                            type="button"
                            variant="outline-secondary"
                            onClick={() => setShowPassword((v) => !v)}
                            aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </Button>
                        </InputGroup>
                        <Form.Text className="text-muted">{t('auth.resetPasswordMinHint', { min: MIN_LENGTH })}</Form.Text>
                      </Form.Group>
                      <Form.Group className="mb-4">
                        <Form.Label className="small fw-semibold text-body-secondary">{t('auth.confirmPassword')}</Form.Label>
                        <Form.Control
                          type={showPassword ? 'text' : 'password'}
                          value={confirm}
                          onChange={(e) => setConfirm(e.target.value)}
                          required
                          size="lg"
                          autoComplete="new-password"
                          className="auth-input"
                          disabled={loading}
                          placeholder={t('auth.confirmPasswordPlaceholder')}
                        />
                      </Form.Group>
                      <Button
                        type="submit"
                        variant="danger"
                        size="lg"
                        disabled={loading}
                        className="w-100 rounded-pill auth-submit-btn d-flex align-items-center justify-content-center gap-2"
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                            {t('auth.resetPasswordSaving')}
                          </>
                        ) : (
                          <>
                            {t('auth.resetPasswordSubmit')}
                            <ArrowRight size={20} />
                          </>
                        )}
                      </Button>
                    </Form>
                  )}
                  {done && (
                    <div className="forgot-password-success text-center py-2">
                      <CheckCircle size={56} className="text-success mb-3" />
                      <h2 className="h5 fw-bold mb-2">{t('auth.resetPasswordDoneTitle')}</h2>
                      <p className="text-body-secondary small mb-0">{t('auth.resetPasswordDoneRedirect')}</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </main>

      <AfricadataFooter />
    </div>
  );
}
