import { useState } from 'react';
import { Card, ListGroup, Badge, Tab, Tabs } from 'react-bootstrap';
import { Bell, FileText, CreditCard, AlertCircle } from 'lucide-react';
import './AdminPages.css';

const NOTIFICATION_TYPES = [
  { key: 'all', label: 'Toutes', icon: Bell },
  { key: 'submissions', label: 'Soumissions', icon: FileText },
  { key: 'payments', label: 'Paiements', icon: CreditCard },
  { key: 'errors', label: 'Erreurs', icon: AlertCircle },
];

export default function AdminNotifications() {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="admin-page admin-notifications">
      <header className="admin-page-header">
        <h1>Notifications</h1>
        <p>Alertes en temps réel : nouvelles soumissions, paiements reçus, erreurs système.</p>
      </header>

      <Card className="admin-card admin-section-card">
        <Card.Header className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <span>Centre de notifications</span>
          <Badge bg="secondary" className="rounded-pill">0 nouveau</Badge>
        </Card.Header>
        <Card.Body>
          <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'all')} className="mb-3 border-0">
            {NOTIFICATION_TYPES.map(({ key, label, icon: Icon }) => (
              <Tab eventKey={key} key={key} title={
                <span className="d-flex align-items-center gap-2">
                  <Icon size={16} />
                  {label}
                </span>
              } />
            ))}
          </Tabs>
          <ListGroup variant="flush" className="rounded">
            <ListGroup.Item className="d-flex align-items-center justify-content-center py-5 border-0">
              <div className="admin-empty-state py-0">
                <div className="admin-empty-state-icon">
                  <Bell size={40} />
                </div>
                <h3>Aucune notification</h3>
                <p>Les alertes (nouvelles soumissions, paiements, erreurs) s'afficheront ici. Connectez le module temps réel (Socket.IO) pour les recevoir en direct.</p>
              </div>
            </ListGroup.Item>
          </ListGroup>
        </Card.Body>
      </Card>
    </div>
  );
}
