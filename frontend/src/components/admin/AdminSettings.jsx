import { useState } from 'react';
import { Card, Row, Col, Form, Button, Toast, ToastContainer } from 'react-bootstrap';
import { Lock, BookOpen, FileType, Tag, Wrench, Mail } from 'lucide-react';
import { useAuth } from 'context/AuthContext';
import { canChangeSettings } from 'lib/adminRoles';
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
