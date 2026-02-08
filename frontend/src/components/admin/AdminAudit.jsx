import { useState, useEffect } from 'react';
import { Card, Table, Spinner, Form, Row, Col } from 'react-bootstrap';
import { ScrollText, Filter } from 'lucide-react';
import { getAuditLogs } from 'services/admin';
import { isSupabaseConfigured } from 'lib/supabase';
import './AdminPages.css';

export default function AdminAudit() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    getAuditLogs(100).then(({ data, error: err }) => {
      setLoading(false);
      if (err) setError(err.message || 'Erreur chargement');
      else setLogs(data || []);
    });
  }, []);

  return (
    <div className="admin-page admin-audit">
      <header className="admin-page-header">
        <h1>Audit logs</h1>
        <p>Historique des actions critiques : admin, action, cible, IP, date.</p>
      </header>

      <Card className="admin-card admin-section-card">
        <Card.Header className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <span className="d-flex align-items-center gap-2">
            <ScrollText size={20} />
            Journal d'audit
          </span>
          <div className="d-flex gap-2 align-items-center">
            <Filter size={16} className="text-muted" />
            <Form.Select size="sm" className="rounded-pill" style={{ width: 'auto' }}>
              <option value="">Toutes les actions</option>
              <option>validation_publication</option>
              <option>rejet_publication</option>
              <option>suppression_utilisateur</option>
            </Form.Select>
            <Form.Control type="date" size="sm" className="rounded-pill" style={{ width: 'auto' }} />
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="admin-loading py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : error ? (
            <div className="admin-empty-state py-5">
              <div className="admin-empty-state-icon text-warning">
                <ScrollText size={40} />
              </div>
              <h3>Journal d'audit indisponible</h3>
              <p className="small text-muted mb-0">
                La table <code>audit_logs</code> est peut-être absente. Exécutez la migration correspondante pour créer la table, puis rechargez cette page.
              </p>
              <p className="small text-danger mt-2 mb-0">{error}</p>
            </div>
          ) : (
            <Table responsive hover size="sm" className="admin-table mb-0">
              <thead>
                <tr>
                  <th>Date / Heure</th>
                  <th>Admin</th>
                  <th>Action</th>
                  <th>Cible (type)</th>
                  <th>Cible (id)</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="admin-empty-state">
                        <div className="admin-empty-state-icon">
                          <ScrollText size={40} />
                        </div>
                        <h3>Aucun log</h3>
                        <p>Les actions critiques (validation, rejet, suppression) seront enregistrées ici. Créez la table <code>audit_logs</code> et enregistrez les actions côté backend.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td className="small text-nowrap">{log.created_at ? new Date(log.created_at).toLocaleString('fr-FR') : '—'}</td>
                      <td className="small font-monospace">{log.admin_id ? `${log.admin_id.slice(0, 8)}…` : '—'}</td>
                      <td><span className="badge bg-secondary">{log.action || '—'}</span></td>
                      <td className="small">{log.target_type || '—'}</td>
                      <td className="small font-monospace">{log.target_id ? `${log.target_id.slice(0, 8)}…` : '—'}</td>
                      <td className="small">{log.ip || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
