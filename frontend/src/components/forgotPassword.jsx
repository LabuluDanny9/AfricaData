import { useState } from 'react';
import { Link } from 'react-router-dom';
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
} from 'react-bootstrap';
import { Mail, KeyRound, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import AfricadataHeader from 'components/layout/AfricadataHeader';
import AfricadataFooter from 'components/layout/AfricadataFooter';
import { resetPassword } from 'services/auth';
import { isSupabaseConfigured } from 'lib/supabase';
import 'components/layout/AfricadataHeader.css';
import 'components/auth.css';
import './forgotPassword.css';

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        await resetPassword(email.trim());
      }
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Une erreur est survenue. Réessayez plus tard.');
    } finally {
      setLoading(false);
    }
  };

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
              Mot de passe oublié
            </Badge>
            <h1 className="h2 fw-bold mb-2">Réinitialiser votre mot de passe</h1>
            <p className="text-body-secondary mb-0">
              Saisissez l’adresse email associée à votre compte. Nous vous enverrons un lien pour définir un nouveau mot de passe.
            </p>
          </motion.div>

          <Row className="justify-content-center">
            <Col md="8" lg="6" xl="5">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <Card className="auth-card forgot-password-card border-0 shadow-lg overflow-hidden">
                  <Card.Body className="p-4 p-lg-5">
                    {!submitted ? (
                      <Form onSubmit={handleSubmit} className="auth-form forgot-password-form">
                        {error && (
                          <Alert variant="danger" className="small mb-3 py-2">
                            {error}
                          </Alert>
                        )}
                        <motion.div variants={itemVariants}>
                          <Form.Group className="mb-4">
                            <Form.Label className="small fw-semibold text-body-secondary d-flex align-items-center gap-1">
                              <Mail size={14} /> Adresse email
                            </Form.Label>
                            <Form.Control
                              type="email"
                              placeholder="prenom.nom@institution.org"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              size="lg"
                              className="auth-input"
                              autoComplete="email"
                              disabled={loading}
                            />
                          </Form.Group>
                        </motion.div>

                        <motion.div variants={itemVariants}>
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
                                Envoi en cours…
                              </>
                            ) : (
                              <>
                                Envoyer le lien de réinitialisation
                                <ArrowRight size={20} />
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </Form>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.35 }}
                        className="forgot-password-success text-center py-2"
                      >
                        <div className="forgot-password-success-icon mb-3">
                          <CheckCircle size={56} className="text-success" />
                        </div>
                        <h2 className="h5 fw-bold mb-2">Email envoyé</h2>
                        <p className="text-body-secondary small mb-4">
                          Si un compte existe avec l’adresse <strong className="text-body">{email}</strong>, vous recevrez un email contenant un lien pour réinitialiser votre mot de passe. Pensez à vérifier vos spams.
                        </p>
                        <Button
                          as={Link}
                          to="/connexion"
                          variant="outline-danger"
                          size="lg"
                          className="rounded-pill d-inline-flex align-items-center gap-2"
                        >
                          <ArrowLeft size={18} />
                          Retour à la connexion
                        </Button>
                      </motion.div>
                    )}

                    {!submitted && (
                      <div className="auth-divider my-4">
                        <span className="small text-body-secondary">ou</span>
                      </div>
                    )}
                    {!submitted && (
                      <p className="text-center small text-body-secondary mb-0">
                        Vous vous souvenez de votre mot de passe ?{' '}
                        <Link to="/connexion" className="fw-semibold text-danger text-decoration-none">
                          Se connecter
                        </Link>
                      </p>
                    )}
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
