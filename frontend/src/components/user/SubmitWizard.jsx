import { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Card, Form, Button, Row, Col, Nav, InputGroup, OverlayTrigger, Tooltip, Toast, ToastContainer, Spinner, Badge, Modal,
} from 'react-bootstrap';
import { FileText, GraduationCap, Upload, CreditCard, Info, CheckCircle2, User } from 'lucide-react';
import { createPublication, uploadPublicationPdf, uploadAuthorPhoto } from 'services/publications';
import { checkWaiverCode, consumeWaiverCode } from 'services/waiverCodes';
import { useAuth } from 'context/AuthContext';
import { isAdminRole } from 'lib/adminRoles';
import { isSupabaseConfigured } from 'lib/supabase';
import './SubmitWizard.css';

const MAX_PDF_MB = 20;
const MAX_PDF_BYTES = MAX_PDF_MB * 1024 * 1024;
const MIN_TITLE_LENGTH = 10;
const MIN_SUMMARY_LENGTH = 50;
const DRAFT_STORAGE_KEY = 'africadata_submit_draft';

// Téléphone RDC : 9 chiffres commençant par 8 ou 9 (ex. 8XX XXX XXX)
function validatePhoneRDC(phone) {
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.length === 9 && /^[89]/.test(digits)) return true;
  if (digits.length === 12 && digits.startsWith('243')) return /^[89]/.test(digits.slice(3));
  return false;
}

function getPhoneErrorMessage(phone) {
  if (!phone || !phone.trim()) return 'Veuillez saisir votre numéro de téléphone (format RDC : 8XX XXX XXX).';
  return 'Le numéro doit contenir 9 chiffres et commencer par 8 ou 9 (ex. 812 345 678).';
}

function parseAmount(value) {
  const n = Number(String(value).replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : NaN;
}

function isValidAmount(value) {
  const n = parseAmount(value);
  return n >= AMOUNT_MIN;
}

const STEPS = [
  { id: 1, key: 'info', title: 'Informations', icon: FileText },
  { id: 2, key: 'academic', title: 'Académique', icon: GraduationCap },
  { id: 3, key: 'document', title: 'Document', icon: Upload },
  { id: 4, key: 'payment', title: 'Paiement', icon: CreditCard },
];

const DOMAINS = [
  'Informatique', 'IA & Data Science', 'Médecine & Santé', 'Sciences agronomiques',
  'Sciences économiques', 'Ingénierie', 'Environnement', 'Sciences sociales',
];

const TYPES = [
  'Article', 'Mémoire', 'Thèse', 'Rapport', 'Prépublication', 'Étude de cas', 'Livre blanc',
];

const ACADEMIC_TYPES = ['Mémoire', 'Thèse'];

const AMOUNT_MIN = 1;

export default function SubmitWizard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [showDraftToast, setShowDraftToast] = useState(false);
  const [showPaymentFailureModal, setShowPaymentFailureModal] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [paymentPending, setPaymentPending] = useState(false);
  const pdfPreviewUrlRef = useRef(null);
  const draftToastShownRef = useRef(false);
  const [form, setForm] = useState({
    title: '',
    summary: '',
    domain: 'Sciences économiques',
    type: 'Article',
    institution: '',
    year: new Date().getFullYear().toString(),
    studentName: '',
    faculty: '',
    supervisor: '',
    pdf_url: '',
    operator: 'orange',
    phone: '',
    currency: 'FC',
    amount: '',
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [authorPhotoFile, setAuthorPhotoFile] = useState(null);
  const [authorPhotoPreview, setAuthorPhotoPreview] = useState(null);
  const [waiverCodeInput, setWaiverCodeInput] = useState('');
  const [waiverCodeValid, setWaiverCodeValid] = useState(null);
  const [waiverCodeChecking, setWaiverCodeChecking] = useState(false);
  const [submitAsPublished, setSubmitAsPublished] = useState(false);

  // Validation instantanée
  const titleInvalid = form.title.trim().length > 0 && form.title.trim().length < MIN_TITLE_LENGTH;
  const titleError = titleInvalid ? `Veuillez saisir un titre d'au moins ${MIN_TITLE_LENGTH} caractères.` : null;
  const summaryInvalid = form.summary.trim().length > 0 && form.summary.trim().length < MIN_SUMMARY_LENGTH;
  const summaryError = summaryInvalid ? `Veuillez saisir un résumé d'au moins ${MIN_SUMMARY_LENGTH} caractères.` : null;
  const phoneInvalid = form.phone.trim().length > 0 && !validatePhoneRDC(form.phone);
  const phoneError = phoneInvalid ? getPhoneErrorMessage(form.phone) : null;
  const amountInvalid = form.amount.trim().length > 0 && !isValidAmount(form.amount);
  const amountError = amountInvalid ? `Veuillez saisir un montant valide (min. ${AMOUNT_MIN} ${form.currency === 'USD' ? 'USD' : 'FCFA'}).` : null;

  const isAcademicType = useMemo(() => ACADEMIC_TYPES.includes(form.type), [form.type]);

  // Brouillon : chargement au montage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.form) setForm((prev) => ({ ...prev, ...d.form, currency: d.form.currency ?? 'FC', amount: d.form.amount ?? '' }));
        if (d.step >= 1 && d.step <= 4) setStep(d.step);
      }
    } catch (_) {}
  }, []);

  // Brouillon : sauvegarde automatique toutes les 5 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ form, step }));
        if (!draftToastShownRef.current) {
          draftToastShownRef.current = true;
          setShowDraftToast(true);
          setTimeout(() => setShowDraftToast(false), 2500);
        }
      } catch (_) {}
    }, 5000);
    return () => clearInterval(interval);
  }, [form, step]);

  // Nettoyer l'URL de prévisualisation PDF à la fermeture
  useEffect(() => {
    return () => {
      if (pdfPreviewUrlRef.current) URL.revokeObjectURL(pdfPreviewUrlRef.current);
    };
  }, []);

  const completedSteps = useMemo(() => {
    const s = new Set();
    if (step > 1) s.add(1);
    if (step > 2 || (step > 1 && !isAcademicType)) s.add(2);
    if (step > 3) s.add(3);
    return s;
  }, [step, isAcademicType]);

  const goNext = () => {
    setError('');
    if (step === 1 && !isAcademicType) {
      setStep(3);
      return;
    }
    if (step === 4) {
      handleSubmit();
      return;
    }
    setStep(step + 1);
  };

  const goPrev = () => {
    setError('');
    if (step === 3 && !isAcademicType) {
      setStep(1);
      return;
    }
    setStep(Math.max(1, step - 1));
  };

  const isAdmin = isAdminRole(user?.role);
  const skipPayment = isAdmin || waiverCodeValid === true;

  const handleSubmit = async () => {
    setError('');
    if (!skipPayment && step === 4 && !validatePhoneRDC(form.phone)) {
      setError(getPhoneErrorMessage(form.phone));
      return;
    }
    if (!skipPayment && step === 4 && !isValidAmount(form.amount)) {
      setError(amountError || `Veuillez saisir un montant valide (min. ${AMOUNT_MIN}).`);
      return;
    }
    setLoading(true);
    setPaymentPending(true);
    try {
      if (isSupabaseConfigured()) {
        let pdfUrl = form.pdf_url?.trim() || null;
        if (pdfFile) {
          setUploadingPdf(true);
          const { data: uploadedUrl, error: uploadErr } = await uploadPublicationPdf(pdfFile, user?.id);
          setUploadingPdf(false);
          if (uploadErr) throw uploadErr;
          if (uploadedUrl) pdfUrl = uploadedUrl;
        }
        if (waiverCodeValid && waiverCodeInput.trim()) {
          const { success, error: useErr } = await consumeWaiverCode(waiverCodeInput.trim());
          if (!success || useErr) throw new Error(useErr?.message || 'Code déjà utilisé ou invalide.');
        }
        let authorPhotoUrl = null;
        if (authorPhotoFile) {
          const { data: photoUrl, error: photoErr } = await uploadAuthorPhoto(authorPhotoFile, user?.id);
          if (photoErr) throw photoErr;
          authorPhotoUrl = photoUrl || null;
        }
        const status = isAdmin && submitAsPublished ? 'published' : 'draft';
        const { data, error: err } = await createPublication({
          title: form.title.trim(),
          author: user?.name || form.studentName || 'Anonyme',
          author_photo_url: authorPhotoUrl,
          type: form.type,
          domain: form.domain,
          year: form.year,
          summary: form.summary.trim(),
          abstract: form.summary.trim(),
          pdf_url: pdfUrl,
          status,
        });
        if (err) throw err;
        setPaymentPending(false);
        setShowToast(true);
        try { localStorage.removeItem(DRAFT_STORAGE_KEY); } catch (_) {}
        const pubId = data?.id;
        setTimeout(() => {
          if (pubId) navigate(`/publication/${pubId}`);
          else navigate('/dashboard');
        }, 2200);
      } else {
        setPaymentPending(false);
        setError('Soumission non configurée. Configurez Supabase.');
      }
    } catch (err) {
      setPaymentPending(false);
      setSubmitError(err?.message || 'Erreur lors de la soumission.');
      setShowPaymentFailureModal(true);
      setError(err?.message || 'Erreur lors de la soumission.');
    } finally {
      setLoading(false);
      setUploadingPdf(false);
    }
  };

  const handleSubmitErrorRetry = () => {
    setShowPaymentFailureModal(false);
    setSubmitError('');
    setError('');
  };

  const submitErrorMessage =
    submitError && submitError.toLowerCase().includes('bucket')
      ? 'Le bucket de stockage des PDF n\'existe pas. Créez le bucket « publications » dans Supabase Dashboard > Storage > New bucket (Public).'
      : submitError;

  const validateFile = (file) => {
    if (!file) return null;
    if (file.type !== 'application/pdf') return 'Veuillez sélectionner un fichier PDF uniquement.';
    if (file.size > MAX_PDF_BYTES) return `Taille max : ${MAX_PDF_MB} Mo.`;
    return null;
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    const msg = validateFile(file);
    if (msg) {
      setError(msg);
      return;
    }
    if (file) {
      setPdfFile(file);
      setForm((f) => ({ ...f, pdf_url: '' }));
      setError('');
    }
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    const msg = validateFile(file);
    if (msg) {
      setError(msg);
      return;
    }
    if (file) {
      setPdfFile(file);
      setForm((f) => ({ ...f, pdf_url: '' }));
      setError('');
    }
    e.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const canProceedStep1 = form.title.trim().length >= MIN_TITLE_LENGTH && form.summary.trim().length >= MIN_SUMMARY_LENGTH;
  const canProceedStep3 = pdfFile || (form.pdf_url?.trim?.()?.length > 0);
  const canProceedStep4 = skipPayment || (validatePhoneRDC(form.phone) && isValidAmount(form.amount));

  const openPdfPreview = () => {
    if (!pdfFile) return;
    if (pdfPreviewUrlRef.current) URL.revokeObjectURL(pdfPreviewUrlRef.current);
    const url = URL.createObjectURL(pdfFile);
    pdfPreviewUrlRef.current = url;
    setPdfPreviewUrl(url);
    setShowPdfPreview(true);
  };

  const closePdfPreview = () => {
    setShowPdfPreview(false);
    if (pdfPreviewUrlRef.current) {
      URL.revokeObjectURL(pdfPreviewUrlRef.current);
      pdfPreviewUrlRef.current = null;
    }
    setPdfPreviewUrl(null);
  };

  const handleVerifyWaiverCode = async () => {
    const code = waiverCodeInput.trim();
    if (!code) {
      setError('Saisissez un code pour le vérifier.');
      return;
    }
    setWaiverCodeChecking(true);
    setError('');
    const { valid, error: err } = await checkWaiverCode(code);
    setWaiverCodeChecking(false);
    if (err) setError(err.message || 'Erreur de vérification.');
    else setWaiverCodeValid(valid);
  };

  const renderLabelWithTooltip = (label, tooltipText) => (
    <Form.Label className="d-flex align-items-center gap-1">
      {label}
      <OverlayTrigger placement="top" overlay={<Tooltip>{tooltipText}</Tooltip>}>
        <span className="text-body-secondary" style={{ cursor: 'help' }}>
          <Info size={14} />
        </span>
      </OverlayTrigger>
    </Form.Label>
  );

  return (
    <div className="submit-wizard submit-wizard-container">
      <header className="submit-wizard-header">
        <h1 className="submit-wizard-title">Soumettre une publication</h1>
        <p className="submit-wizard-subtitle">
          Veuillez compléter les informations ci-dessous pour publier votre travail scientifique.
        </p>
      </header>

      <Nav variant="pills" className="submit-wizard-stepper mb-4" as="ul">
        {STEPS.map((s) => {
          const isActive = step === s.id;
          const isCompleted = completedSteps.has(s.id);
          const disabled = s.id === 2 && !isAcademicType;
          const canGoToStep = step >= s.id || (step === 1 && s.id === 2 && isAcademicType);
          return (
            <Nav.Item as="li" key={s.id} className="submit-wizard-stepper-item">
              <Nav.Link
                active={isActive}
                disabled={disabled || !canGoToStep}
                className={`submit-wizard-pill ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${disabled ? 'step-disabled' : ''}`}
                onClick={() => {
                  if (disabled || !canGoToStep) return;
                  setStep(s.id);
                }}
              >
                <span className="submit-wizard-pill-num">{isCompleted ? <CheckCircle2 size={16} /> : s.id}</span>
                <span className="submit-wizard-pill-title">{s.title}</span>
              </Nav.Link>
            </Nav.Item>
          );
        })}
      </Nav>

      <Card className="submit-wizard-card border-0 shadow-sm">
        <Card.Body className="p-4 p-lg-5">
          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="submit-wizard-step">
              <h2 className="submit-wizard-step-title">
                <FileText size={22} className="me-2" />
                Informations générales
              </h2>
              <Form.Group className="mb-3">
                {renderLabelWithTooltip('Titre', 'Titre complet de la publication (au moins 10 caractères)')}
                <Form.Control
                  type="text"
                  placeholder="Ex. : Impact des changements climatiques sur l'agriculture durable"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className={`submit-wizard-input ${titleInvalid ? 'is-invalid' : ''}`}
                  isInvalid={titleInvalid}
                />
                {titleError && <Form.Control.Feedback type="invalid">{titleError}</Form.Control.Feedback>}
              </Form.Group>
              <Form.Group className="mb-3">
                {renderLabelWithTooltip('Résumé', 'Résumé ou abstract (au moins 50 caractères)')}
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Résumez en quelques lignes le contenu et les conclusions de votre travail..."
                  value={form.summary}
                  onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                  className={`submit-wizard-input ${summaryInvalid ? 'is-invalid' : ''}`}
                  isInvalid={summaryInvalid}
                />
                {summaryError && <Form.Control.Feedback type="invalid">{summaryError}</Form.Control.Feedback>}
              </Form.Group>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Domaine</Form.Label>
                    <Form.Select
                      value={form.domain}
                      onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))}
                      className="submit-wizard-input"
                    >
                      {DOMAINS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    {renderLabelWithTooltip('Type de document', 'Mémoire et Thèse affichent l\'étape académique')}
                    <Form.Select
                      value={form.type}
                      onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                      className="submit-wizard-input"
                    >
                      {TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label className="d-flex align-items-center gap-2">
                  <User size={18} /> Photo de l'auteur <span className="text-muted small">(optionnel)</span>
                </Form.Label>
                <Form.Control
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setAuthorPhotoFile(f);
                      setAuthorPhotoPreview(URL.createObjectURL(f));
                    } else {
                      setAuthorPhotoFile(null);
                      if (authorPhotoPreview) URL.revokeObjectURL(authorPhotoPreview);
                      setAuthorPhotoPreview(null);
                    }
                    e.target.value = '';
                  }}
                  className="submit-wizard-input"
                />
                {authorPhotoPreview && (
                  <div className="mt-2 d-flex align-items-center gap-2">
                    <img src={authorPhotoPreview} alt="Aperçu auteur" className="rounded-circle object-fit-cover" style={{ width: 40, height: 40 }} />
                    <Button type="button" variant="outline-secondary" size="sm" onClick={() => { setAuthorPhotoFile(null); URL.revokeObjectURL(authorPhotoPreview); setAuthorPhotoPreview(null); }}>Retirer</Button>
                  </div>
                )}
              </Form.Group>
            </div>
          )}

          {step === 2 && isAcademicType && (
            <div className="submit-wizard-step">
              <h2 className="submit-wizard-step-title">
                <GraduationCap size={22} className="me-2" />
                Informations académiques
              </h2>
              <p className="small text-body-secondary mb-3">
                Ces informations permettent un classement correct dans la bibliothèque.
              </p>
              <Form.Group className="mb-3">
                <Form.Label>Nom de l'étudiant</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nom et prénom"
                  value={form.studentName}
                  onChange={(e) => setForm((f) => ({ ...f, studentName: e.target.value }))}
                  className="submit-wizard-input"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Faculté / Institution</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ex. : Faculté des sciences, Université de..."
                  value={form.institution}
                  onChange={(e) => setForm((f) => ({ ...f, institution: e.target.value }))}
                  className="submit-wizard-input"
                />
              </Form.Group>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Année académique</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="2024"
                      value={form.year}
                      onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                      className="submit-wizard-input"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Encadreur</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nom du directeur / encadreur"
                      value={form.supervisor}
                      onChange={(e) => setForm((f) => ({ ...f, supervisor: e.target.value }))}
                      className="submit-wizard-input"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>
          )}

          {step === 3 && (
            <div className="submit-wizard-step">
              <h2 className="submit-wizard-step-title">
                <Upload size={22} className="me-2" />
                Document PDF
              </h2>
              <Form.Group className="mb-3">
                <Form.Label>URL du document (optionnel si vous uploadez un fichier)</Form.Label>
                <Form.Control
                  type="url"
                  placeholder="https://..."
                  value={form.pdf_url}
                  onChange={(e) => setForm((f) => ({ ...f, pdf_url: e.target.value }))}
                  disabled={!!pdfFile}
                  className="submit-wizard-input"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Déposez votre PDF ici</Form.Label>
                <div
                  className={`submit-wizard-dropzone ${dragOver ? 'drag-over' : ''} ${pdfFile ? 'has-file' : ''}`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => document.getElementById('pdf-file-input')?.click()}
                >
                  <input
                    id="pdf-file-input"
                    type="file"
                    accept=".pdf,application/pdf"
                    className="d-none"
                    onChange={handleFileChange}
                  />
                  {uploadingPdf ? (
                    <div className="d-flex flex-column align-items-center gap-2">
                      <Spinner animation="border" variant="danger" />
                      <span className="small">Upload en cours…</span>
                    </div>
                  ) : pdfFile ? (
                    <div className="d-flex flex-column align-items-center gap-2 w-100">
                      <Badge bg="success" className="submit-wizard-badge-file">Fichier chargé</Badge>
                      <span className="small fw-semibold text-break">{pdfFile.name}</span>
                      <span className="small text-body-secondary">
                        {(pdfFile.size / 1024).toFixed(1)} Ko · PDF uniquement, max {MAX_PDF_MB} Mo
                      </span>
                      <div className="d-flex gap-2 mt-1 flex-wrap justify-content-center">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); openPdfPreview(); }}
                        >
                          Voir
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); setPdfFile(null); }}
                        >
                          Modifier le fichier
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload size={40} className="submit-wizard-dropzone-icon mb-2" />
                      <p className="mb-0 small text-body-secondary">
                        Cliquez ou glissez-déposez votre fichier PDF
                      </p>
                      <p className="mb-0 small text-body-secondary mt-1">PDF uniquement · max {MAX_PDF_MB} Mo</p>
                    </>
                  )}
                </div>
              </Form.Group>
            </div>
          )}

          {step === 4 && (
            <div className="submit-wizard-step">
              <h2 className="submit-wizard-step-title">
                <CreditCard size={22} className="me-2" />
                {skipPayment ? 'Soumission' : 'Paiement & soumission'}
              </h2>

              <Card className="submit-wizard-summary-card mb-4 bg-body-secondary bg-opacity-50">
                <Card.Body className="py-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="small text-body-secondary">Résumé</span>
                    <Button variant="link" size="sm" className="p-0 text-danger text-decoration-none" onClick={() => setStep(1)}>
                      Modifier les informations
                    </Button>
                  </div>
                  <p className="mb-1 fw-semibold small">{form.title || '—'}</p>
                  <p className="mb-0 small text-body-secondary">
                    {form.domain} · {form.type}
                    {pdfFile && ` · ${pdfFile.name}`}
                  </p>
                </Card.Body>
              </Card>

              {isAdmin && (
                <>
                  <div className="alert alert-info mb-4 d-flex align-items-start gap-2">
                    <Info size={20} className="flex-shrink-0 mt-1" />
                    <div>
                      <strong>Publication sans paiement</strong>
                      <p className="mb-0 small">En tant qu'administrateur, vous pouvez soumettre ou publier directement sans payer.</p>
                    </div>
                  </div>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">Choisir l'action</Form.Label>
                    <div className="d-flex gap-3 flex-wrap">
                      <div className={`submit-wizard-radio-card rounded-3 p-3 ${!submitAsPublished ? 'selected' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setSubmitAsPublished(false)}>
                        <Form.Check
                          type="radio"
                          name="admin-submit-mode"
                          label="Soumettre en attente de validation"
                          checked={!submitAsPublished}
                          onChange={() => setSubmitAsPublished(false)}
                          className="mb-0"
                        />
                        <span className="small text-body-secondary d-block mt-1">La publication sera en attente de validation.</span>
                      </div>
                      <div className={`submit-wizard-radio-card rounded-3 p-3 ${submitAsPublished ? 'selected' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setSubmitAsPublished(true)}>
                        <Form.Check
                          type="radio"
                          name="admin-submit-mode"
                          label="Publier directement"
                          checked={submitAsPublished}
                          onChange={() => setSubmitAsPublished(true)}
                          className="mb-0"
                        />
                        <span className="small text-body-secondary d-block mt-1">La publication sera visible dans la bibliothèque.</span>
                      </div>
                    </div>
                  </Form.Group>
                  <Button
                    variant="danger"
                    size="lg"
                    className="submit-wizard-btn-submit w-100 py-3 rounded-3 fw-semibold"
                    onClick={goNext}
                    disabled={loading || uploadingPdf}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Traitement en cours…
                      </>
                    ) : (
                      <>Soumettre la publication</>
                    )}
                  </Button>
                </>
              )}

              {!isAdmin && waiverCodeValid === true && (
                <>
                  <div className="alert alert-success mb-4 d-flex align-items-center gap-2">
                    <CheckCircle2 size={20} className="flex-shrink-0" />
                    <span><strong>Code valide.</strong> Publication gratuite — le formulaire de paiement n'est pas nécessaire.</span>
                  </div>
                  <Button
                    variant="danger"
                    size="lg"
                    className="submit-wizard-btn-submit w-100 py-3 rounded-3 fw-semibold"
                    onClick={goNext}
                    disabled={loading || uploadingPdf}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Traitement en cours…
                      </>
                    ) : (
                      <>Soumettre la publication</>
                    )}
                  </Button>
                </>
              )}

              {!isAdmin && waiverCodeValid !== true && (
                <>
                  <Form.Group className="mb-4">
                    <Form.Label className="d-flex align-items-center gap-1">
                      Code de publication gratuite (optionnel)
                      <OverlayTrigger placement="top" overlay={<Tooltip>Code fourni par un administrateur pour publier sans payer</Tooltip>}>
                        <span className="text-body-secondary" style={{ cursor: 'help' }}><Info size={14} /></span>
                      </OverlayTrigger>
                    </Form.Label>
                    <InputGroup className="mb-2">
                      <Form.Control
                        type="text"
                        placeholder="Ex. : ABC12XYZ"
                        value={waiverCodeInput}
                        onChange={(e) => { setWaiverCodeInput(e.target.value.toUpperCase()); setWaiverCodeValid(null); }}
                        className="font-monospace"
                        maxLength={12}
                      />
                      <Button variant="outline-secondary" onClick={handleVerifyWaiverCode} disabled={waiverCodeChecking || !waiverCodeInput.trim()}>
                        {waiverCodeChecking ? <Spinner animation="border" size="sm" /> : 'Vérifier le code'}
                      </Button>
                    </InputGroup>
                    {waiverCodeValid === false && <Form.Text className="text-danger small">Code invalide ou déjà utilisé.</Form.Text>}
                  </Form.Group>

                  <hr className="my-4" />
                  <p className="small text-body-secondary mb-3">Ou procéder au paiement :</p>

              <Form.Group className="mb-3">
                <Form.Label>Opérateur de paiement</Form.Label>
                <div className="d-flex gap-3 flex-wrap">
                  <div className={`submit-wizard-radio-card rounded-3 p-3 ${form.operator === 'orange' ? 'selected' : ''}`} onClick={() => setForm((f) => ({ ...f, operator: 'orange' }))}>
                    <Form.Check
                      type="radio"
                      id="op-orange"
                      name="operator"
                      label="Orange Money"
                      value="orange"
                      checked={form.operator === 'orange'}
                      onChange={(e) => setForm((f) => ({ ...f, operator: e.target.value }))}
                      className="mb-0"
                    />
                  </div>
                  <div className={`submit-wizard-radio-card rounded-3 p-3 ${form.operator === 'airtel' ? 'selected' : ''}`} onClick={() => setForm((f) => ({ ...f, operator: 'airtel' }))}>
                    <Form.Check
                      type="radio"
                      id="op-airtel"
                      name="operator"
                      label="Airtel Money"
                      value="airtel"
                      checked={form.operator === 'airtel'}
                      onChange={(e) => setForm((f) => ({ ...f, operator: e.target.value }))}
                      className="mb-0"
                    />
                  </div>
                </div>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Devise</Form.Label>
                <div className="d-flex gap-3 flex-wrap">
                  <div className={`submit-wizard-radio-card rounded-3 p-3 ${form.currency === 'FC' ? 'selected' : ''}`} onClick={() => setForm((f) => ({ ...f, currency: 'FC' }))}>
                    <Form.Check
                      type="radio"
                      id="cur-fc"
                      name="currency"
                      label="FC (FCFA)"
                      value="FC"
                      checked={form.currency === 'FC'}
                      onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                      className="mb-0"
                    />
                  </div>
                  <div className={`submit-wizard-radio-card rounded-3 p-3 ${form.currency === 'USD' ? 'selected' : ''}`} onClick={() => setForm((f) => ({ ...f, currency: 'USD' }))}>
                    <Form.Check
                      type="radio"
                      id="cur-usd"
                      name="currency"
                      label="Dollars (USD)"
                      value="USD"
                      checked={form.currency === 'USD'}
                      onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                      className="mb-0"
                    />
                  </div>
                </div>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Montant</Form.Label>
                <InputGroup className={amountInvalid ? 'is-invalid' : ''}>
                  <Form.Control
                    type="number"
                    min={AMOUNT_MIN}
                    step={form.currency === 'USD' ? '0.01' : '1'}
                    placeholder={form.currency === 'USD' ? 'Ex. 5' : 'Ex. 2000'}
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                    isInvalid={amountInvalid}
                  />
                  <InputGroup.Text>{form.currency === 'USD' ? 'USD' : 'FCFA'}</InputGroup.Text>
                </InputGroup>
                {amountError && <Form.Text className="text-danger d-block small">{amountError}</Form.Text>}
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label>Téléphone (RDC)</Form.Label>
                <InputGroup className={phoneInvalid ? 'is-invalid' : ''}>
                  <InputGroup.Text>+243</InputGroup.Text>
                  <Form.Control
                    type="tel"
                    placeholder="8XX XXX XXX"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    isInvalid={phoneInvalid}
                  />
                </InputGroup>
                {phoneError && <Form.Text className="text-danger d-block small">{phoneError}</Form.Text>}
              </Form.Group>

              <Button
                variant="danger"
                size="lg"
                className="submit-wizard-btn-submit w-100 py-3 rounded-3 fw-semibold"
                onClick={goNext}
                disabled={loading || uploadingPdf || !canProceedStep4}
              >
                {paymentPending ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Veuillez confirmer sur votre téléphone…
                  </>
                ) : loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Traitement en cours…
                  </>
                ) : (
                  <>Confirmer & payer</>
                )}
              </Button>
                </>
              )}
            </div>
          )}

          {step !== 4 && (
            <div className="submit-wizard-actions d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
              <Button
                variant="outline-secondary"
                onClick={goPrev}
                disabled={step === 1}
                className="rounded-pill px-4"
              >
                Précédent
              </Button>
              <Button
                variant="danger"
                onClick={goNext}
                disabled={
                  loading ||
                  uploadingPdf ||
                  (step === 1 && !canProceedStep1) ||
                  (step === 3 && !canProceedStep3)
                }
                className="rounded-pill px-4"
              >
                {uploadingPdf ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Upload…
                  </>
                ) : step === 3 ? 'Suivant' : 'Suivant'}
              </Button>
            </div>
          )}

          <div className="text-center mt-3">
            <Link to="/dashboard" className="small text-body-secondary text-decoration-none">
              Annuler
            </Link>
          </div>
        </Card.Body>
      </Card>

      <ToastContainer position="top-center" className="p-3">
        <Toast show={showToast} onClose={() => setShowToast(false)} bg="success" autohide delay={3000}>
          <Toast.Header closeButton>
            <strong className="me-auto">Publication enregistrée</strong>
          </Toast.Header>
          <Toast.Body>Redirection en cours…</Toast.Body>
        </Toast>
        <Toast show={showDraftToast} onClose={() => setShowDraftToast(false)} className="bg-body-secondary">
          <Toast.Body className="small">Brouillon sauvegardé automatiquement</Toast.Body>
        </Toast>
      </ToastContainer>

      <Modal show={showPaymentFailureModal} onHide={() => { setShowPaymentFailureModal(false); setSubmitError(''); setError(''); }} centered>
        <Modal.Header closeButton>
          <Modal.Title>Erreur lors de la soumission</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-0">{submitErrorMessage}</p>
          <p className="small text-muted mt-2 mb-0">Souhaitez-vous réessayer ?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => { setShowPaymentFailureModal(false); setSubmitError(''); setError(''); }}>
            Fermer
          </Button>
          <Button variant="danger" onClick={handleSubmitErrorRetry}>
            Réessayer
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showPdfPreview} onHide={closePdfPreview} size="lg" centered scrollable>
        <Modal.Header closeButton>
          <Modal.Title>Prévisualisation du document</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {pdfPreviewUrl && (
            <iframe
              src={pdfPreviewUrl}
              title="Aperçu PDF"
              width="100%"
              height="500"
              className="border-0"
              style={{ minHeight: '70vh' }}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={closePdfPreview}>
            Modifier le fichier
          </Button>
          <Button variant="danger" onClick={() => { closePdfPreview(); goNext(); }}>
            Continuer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
