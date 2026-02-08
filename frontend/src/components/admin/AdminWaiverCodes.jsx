import { useState, useEffect } from 'react';
import { Card, Table, Button, Spinner, Alert, Badge, Modal, Form, InputGroup } from 'react-bootstrap';
import { KeyRound, Plus, Copy, Check } from 'lucide-react';
import { getWaiverCodes, generateWaiverCode } from 'services/admin';
import { isSupabaseConfigured } from 'lib/supabase';
import './AdminPages.css';

export default function AdminWaiverCodes() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [newCode, setNewCode] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchCodes = () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    getWaiverCodes(100).then(({ data, error: err }) => {
      setLoading(false);
      if (err) setError(err.message || 'Erreur chargement');
      else setCodes(data || []);
    });
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    const { data, error: err } = await generateWaiverCode();
    setGenerating(false);
    if (err) {
      setError(err.message || 'Erreur lors de la génération.');
      return;
    }
    setNewCode(data);
    fetchCodes();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const closeNewCodeModal = () => setNewCode(null);

  return (
    <div className="admin-page admin-waiver-codes">
      <header className="admin-page-header">
        <h1>Codes de publication gratuite</h1>
        <p>
          Générez des codes pour permettre une soumission ou publication sans paiement. Chaque code est utilisable une seule fois.
        </p>
      </header>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card className="admin-card admin-section-card mb-4">
        <Card.Header className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <span className="d-flex align-items-center gap-2">
            <KeyRound size={20} />
            Générer un code
          </span>
          <Button
            variant="primary"
            size="sm"
            className="rounded-pill d-flex align-items-center gap-2"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? <Spinner animation="border" size="sm" /> : <Plus size={18} />}
            Générer un code
          </Button>
        </Card.Header>
        <Card.Body>
          <p className="small text-muted mb-0">
            Le code généré s'affichera dans une fenêtre. Communiquez-le à l'utilisateur ou à l'admin qui souhaite publier sans payer. À saisir à l'étape « Paiement » du formulaire de soumission.
          </p>
        </Card.Body>
      </Card>

      <Card className="admin-card">
        <Card.Header className="d-flex align-items-center gap-2">
          <KeyRound size={20} />
          Codes récents
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="admin-loading py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <Table responsive hover className="admin-table mb-0">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Créé le</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {codes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-body-secondary py-4">
                      Aucun code généré. Cliquez sur « Générer un code » pour en créer un.
                    </td>
                  </tr>
                ) : (
                  codes.map((row) => (
                    <tr key={row.id}>
                      <td className="fw-monospace">{row.code}</td>
                      <td className="small">{row.created_at ? new Date(row.created_at).toLocaleString('fr-FR') : '—'}</td>
                      <td>
                        {row.used_at ? (
                          <Badge bg="secondary">Utilisé</Badge>
                        ) : (
                          <Badge bg="success">Disponible</Badge>
                        )}
                      </td>
                      <td>
                        {!row.used_at && (
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            className="rounded-pill"
                            onClick={() => copyToClipboard(row.code)}
                            title="Copier le code"
                          >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal show={!!newCode} onHide={closeNewCodeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center gap-2">
            <KeyRound size={24} />
            Code généré
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="small text-muted mb-3">
            Communiquez ce code à la personne qui souhaite soumettre ou publier sans paiement. Elle devra le saisir à l'étape « Paiement » du formulaire de soumission.
          </p>
          <Form.Group>
            <Form.Label className="small fw-semibold">Code à usage unique</Form.Label>
            <InputGroup>
              <Form.Control
                readOnly
                value={newCode || ''}
                className="fw-bold font-monospace fs-5 text-center"
              />
              <Button variant="outline-primary" onClick={() => copyToClipboard(newCode || '')}>
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </Button>
            </InputGroup>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={closeNewCodeModal} className="rounded-pill">
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
