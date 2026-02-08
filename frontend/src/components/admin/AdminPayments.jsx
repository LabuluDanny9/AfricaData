import { Card, Table, Row, Col, Badge, Form } from 'react-bootstrap';
import { CreditCard, TrendingUp, Clock, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import './AdminPages.css';

export default function AdminPayments() {
  return (
    <div className="admin-page admin-payments">
      <header className="admin-page-header">
        <h1>Paiements</h1>
        <p>Suivi des transactions : utilisateur, téléphone, opérateur, montant, statut.</p>
      </header>

      <Row className="g-3 mb-4">
        <Col xs={12} md={4}>
          <Card className="admin-kpi-card h-100">
            <Card.Body className="d-flex align-items-center gap-3">
              <div className="admin-kpi-icon bg-success bg-opacity-10 text-success">
                <TrendingUp size={26} />
              </div>
              <div>
                <Card.Title className="mb-0 small text-muted">Total reçu</Card.Title>
                <span className="h4 mb-0 fw-bold">—</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={4}>
          <Card className="admin-kpi-card h-100">
            <Card.Body className="d-flex align-items-center gap-3">
              <div className="admin-kpi-icon bg-warning bg-opacity-10 text-warning">
                <Clock size={26} />
              </div>
              <div>
                <Card.Title className="mb-0 small text-muted">En attente</Card.Title>
                <span className="h4 mb-0 fw-bold">—</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={4}>
          <Card className="admin-kpi-card h-100">
            <Card.Body className="d-flex align-items-center gap-3">
              <div className="admin-kpi-icon bg-primary bg-opacity-10 text-primary">
                <Calendar size={26} />
              </div>
              <div>
                <Card.Title className="mb-0 small text-muted">Ce mois</Card.Title>
                <span className="h4 mb-0 fw-bold">—</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="admin-card admin-section-card">
        <Card.Header>Transactions récentes</Card.Header>
        <Card.Body className="p-0">
          <div className="p-3 border-bottom bg-light">
            <Row className="g-2">
              <Col md={4}>
                <Form.Control type="date" size="sm" className="rounded-pill" placeholder="Du" />
              </Col>
              <Col md={4}>
                <Form.Control type="date" size="sm" className="rounded-pill" placeholder="Au" />
              </Col>
              <Col md={4}>
                <Form.Select size="sm" className="rounded-pill">
                  <option value="">Tous les statuts</option>
                  <option>Réussi</option>
                  <option>En attente</option>
                  <option>Échoué</option>
                </Form.Select>
              </Col>
            </Row>
          </div>
          <Table responsive hover className="admin-table mb-0">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Téléphone</th>
                <th>Opérateur</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={7} className="p-0">
                  <div className="admin-empty-state">
                    <div className="admin-empty-state-icon">
                      <CreditCard size={40} />
                    </div>
                    <h3>Aucune transaction</h3>
                    <p>Les paiements liés aux publications apparaîtront ici une fois le module connecté.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
}
