import { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Toast, ToastContainer, Spinner } from 'react-bootstrap';
import { Lock, BookOpen, FileType, Tag, Wrench, Mail, CreditCard } from 'lucide-react';
import { useAuth } from 'context/AuthContext';
import { canChangeSettings } from 'lib/adminRoles';
import { getPlatformSettings, updatePaymentEnabled } from 'services/settings';
import './AdminPages.css';

const SECTIONS = [
  { icon: BookOpen, title: 'Domaines scientifiques', desc: 'Liste des domaines proposés aux auteurs.', placeholder: 'Sciences agronomiques, Médecine, Ingénierie…' },
  { icon: FileType, title: 'Types de documents', desc: 'Article, Thèse, Rapport, etc.', placeholder: 'Article, Thèse, Mémoire, Rapport…' },
  { icon: Tag, title: 'Tarifs publication', desc: 'Prix par type ou forfait.', placeholder: 'Montant en FC ou USD' },
  { icon: Wrench, title: 'Mode maintenance', desc: 'Activer/désactiver l\'accès public.', placeholder: 'Site en maintenance' },
  { icon: Mail, title: 'Email système', desc: 'Adresse d\'envoi des notifications.', placeholder: 'noreply@africadata.org' },
];

export default function AdminSettings() {
  const { user } = useAuth();
  const canEdit = canChangeSettings(user?.role);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [paymentEnabled, setPaymentEnabled] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSaving, setPaymentSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setPaymentLoading(true);
    getPlatformSettings().then(({ payment_enabled, error }) => {
      if (!cancelled) {
        setPaymentLoading(false);
        if (!error) setPaymentEnabled(payment_enabled !== false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const handlePaymentToggle = async (enabled) => {
    if (!canEdit) return;
    setPaymentSaving(true);
    const { error } = await updatePaymentEnabled(enabled);
    setPaymentSaving(false);
    if (error) {
      setToast({ show: true, message: 'Erreur : ' + (error.message || 'impossible d\'enregistrer.') });
      return;
    }
    setPaymentEnabled(enabled);
    setToast({ show: true, message: enabled ? 'Paiement activé.' : 'Paiement désactivé — les utilisateurs peuvent soumettre gratuitement.' });
  };

  const handleSave = () => {
    setToast({ show: true, message: 'Paramètres enregistrés.' });
  };

  return (
    <div className="admin-page admin-settings">
      <header className="admin-page-header">
        <h1>Paramètres</h1>
        <p>Super Admin uniquement : domaines, types de documents, tarifs, maintenance, email système.</p>
      </header>

      {!canEdit && (
        <Card className="admin-card border-warning mb-4">
          <Card.Body className="d-flex align-items-center gap-3">
            <div className="admin-kpi-icon bg-warning bg-opacity-10 text-warning">
              <Lock size={24} />
            </div>
            <div>
              <h3 className="h6 mb-1 fw-bold">Accès réservé au Super Admin</h3>
              <p className="mb-0 small text-muted">Vous n'avez pas les droits pour modifier les paramètres globaux de la plateforme.</p>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Paiement : activer / désactiver (soumission gratuite) */}
      <Card className="admin-card admin-section-card mb-4 border-primary">
        <Card.Header className="d-flex align-items-center gap-2">
          <CreditCard size={18} />
          Paiement à la soumission
        </Card.Header>
        <Card.Body>
          <p className="small text-muted mb-3">
            Désactiver le paiement permet aux utilisateurs de soumettre une publication gratuitement. Un message de confirmation et un email avec les détails de paiement (banque / mobile money) leur seront envoyés.
          </p>
          {paymentLoading ? (
            <Spinner animation="border" size="sm" />
          ) : canEdit ? (
            <Form.Check
              type="switch"
              id="payment-enabled"
              label={paymentEnabled ? 'Paiement activé' : 'Paiement désactivé (soumission gratuite)'}
              checked={paymentEnabled}
              disabled={paymentSaving}
              onChange={(e) => handlePaymentToggle(e.target.checked)}
            />
          ) : (
            <p className="small text-muted mb-0">{paymentEnabled ? 'Paiement activé' : 'Paiement désactivé'}</p>
          )}
        </Card.Body>
      </Card>

      <Row className="g-3">
        {SECTIONS.map(({ icon: Icon, title, desc, placeholder }) => (
          <Col xs={12} md={6} key={title}>
            <Card className="admin-card admin-section-card h-100">
              <Card.Header className="d-flex align-items-center gap-2">
                <Icon size={18} />
                {title}
              </Card.Header>
              <Card.Body>
                <p className="small text-muted mb-3">{desc}</p>
                {canEdit ? (
                  <>
                    <Form.Control as="textarea" rows={2} placeholder={placeholder} className="mb-2" />
                    <Button variant="primary" size="sm" className="rounded-pill" onClick={handleSave}>Enregistrer</Button>
                  </>
                ) : (
                  <p className="small text-muted mb-0">—</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <ToastContainer position="top-end" className="p-3">
        <Toast show={toast.show} onClose={() => setToast((t) => ({ ...t, show: false }))} bg="success" autohide delay={4000}>
          <Toast.Body>{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
}
