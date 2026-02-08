import { useState } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Button, ListGroup, Offcanvas, Toast, ToastContainer } from 'react-bootstrap';
import {
  LayoutDashboard, LogOut, FileText, Users, CreditCard, BookOpen, MessageCircle,
  Bell, BarChart3, Settings, ScrollText, Sun, Moon, KeyRound,
} from 'lucide-react';
import { useAuth } from 'context/AuthContext';
import { useTheme } from 'context/ThemeContext';
import { isAdminRole, canAccess, ROLE_LABELS } from 'lib/adminRoles';
import AdminBreadcrumb from 'components/admin/AdminBreadcrumb';
import './AdminLayout.css';

const SIDEBAR_SECTIONS = [
  { to: '/superadmin', icon: LayoutDashboard, label: 'Dashboard', section: 'dashboard' },
  { to: '/superadmin/publications', icon: FileText, label: 'Publications', section: 'publications' },
  { to: '/superadmin/utilisateurs', icon: Users, label: 'Utilisateurs', section: 'users' },
  { to: '/superadmin/paiements', icon: CreditCard, label: 'Paiements', section: 'payments' },
  { to: '/superadmin/codes-publication', icon: KeyRound, label: 'Codes publication gratuite', section: 'waiver_codes' },
  { to: '/superadmin/bibliotheque', icon: BookOpen, label: 'Bibliothèque', section: 'library' },
  { to: '/superadmin/commentaires', icon: MessageCircle, label: 'Commentaires', section: 'comments' },
  { to: '/superadmin/notifications', icon: Bell, label: 'Notifications', section: 'notifications' },
  { to: '/superadmin/statistiques', icon: BarChart3, label: 'Statistiques', section: 'statistics' },
  { to: '/superadmin/parametres', icon: Settings, label: 'Paramètres', section: 'settings' },
  { to: '/superadmin/audit', icon: ScrollText, label: 'Audit logs', section: 'audit' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [notifications] = useState([]);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  // Notifications temps réel : installer socket.io-client et définir REACT_APP_SOCKET_URL pour activer

  if (!user) {
    return <Navigate to="/connexion-admin" replace />;
  }

  if (!isAdminRole(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  const visibleSections = SIDEBAR_SECTIONS.filter((s) => canAccess(user.role, s.section));

  return (
    <div className="admin-layout d-flex min-vh-100">
      {/* Sidebar fixe */}
      <aside className="admin-sidebar d-flex flex-column">
        <div className="admin-sidebar-header d-flex align-items-center gap-2">
          <Link to="/" className="d-flex align-items-center flex-shrink-0" title="Retour à l'accueil de la plateforme" aria-label="Accueil AfricaData">
            <img src="/logo.png" alt="AfricaData" className="admin-sidebar-logo" />
          </Link>
          <Link to="/superadmin" className="d-flex flex-column text-decoration-none flex-grow-1 min-w-0">
            <span className="fw-bold admin-sidebar-header-title">Admin AfricaData</span>
            <span className="small opacity-75">{ROLE_LABELS[user.role] || user.role}</span>
          </Link>
        </div>
        <nav className="admin-sidebar-nav flex-grow-1 overflow-auto" aria-label="Menu admin">
          <div className="px-3 py-2 small text-uppercase text-muted opacity-75" style={{ color: 'rgba(255,255,255,0.6)' }}>Navigation</div>
          <ListGroup variant="flush" className="border-0 px-2 pb-3">
            {visibleSections.map(({ to, icon: Icon, label, section }) => (
              <ListGroup.Item
                key={section}
                as={Link}
                to={to}
                action
                className={`admin-sidebar-item border-0 rounded-3 mb-1 d-flex align-items-center gap-2 ${location.pathname === to ? 'active' : ''}`}
              >
                <Icon size={20} className="flex-shrink-0" />
                <span>{label}</span>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </nav>
      </aside>

      {/* Main panel scrollable */}
      <div className="admin-main-wrap d-flex flex-column flex-grow-1 min-w-0">
        <Navbar className="admin-navbar" data-bs-theme={theme} expand="lg">
          <Container fluid className="px-3 px-lg-4">
            <Navbar.Toggle aria-controls="admin-top-nav" />
            <Navbar.Collapse id="admin-top-nav">
              <Nav className="me-auto" />
              <Nav className="align-items-center gap-2">
                <Button
                  variant="link"
                  className="p-2 text-body rounded-circle"
                  onClick={toggleTheme}
                  aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
                  title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
                >
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </Button>
                <Button
                  variant="light"
                  size="sm"
                  className="position-relative d-inline-flex align-items-center border"
                  onClick={() => setShowOffcanvas(true)}
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                  {notifications.length > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                      {notifications.length > 9 ? '9+' : notifications.length}
                    </span>
                  )}
                </Button>
                <Button as={Link} to="/" variant="outline-primary" size="sm" className="rounded-pill px-3 text-decoration-none">
                  Retour à la plateforme
                </Button>
                <Button variant="outline-danger" size="sm" onClick={logout} className="rounded-pill px-3">
                  <LogOut size={16} className="me-1" />
                  Déconnexion
                </Button>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
        <main className="admin-main flex-grow-1 overflow-auto">
          <Container fluid className="px-3 px-lg-4 px-xl-5">
            <AdminBreadcrumb />
            <Outlet />
          </Container>
        </main>
      </div>

      <Offcanvas show={showOffcanvas} onHide={() => setShowOffcanvas(false)} placement="end" className="admin-notifications-offcanvas">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            <Bell size={20} className="me-2" />
            Notifications
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          {notifications.length === 0 ? (
            <p className="text-body-secondary text-center py-4 mb-0">Aucune notification.</p>
          ) : (
            <ListGroup variant="flush">
              {notifications.map((n, i) => (
                <ListGroup.Item key={`${n.date}-${i}`} className="border-0 border-bottom">
                  <div className="small text-muted">
                    {n.date ? new Date(n.date).toLocaleString('fr-FR') : ''}
                  </div>
                  <div>{n.message}</div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Offcanvas.Body>
      </Offcanvas>

      <ToastContainer position="top-end" className="p-3">
        <Toast show={toast.show} onClose={() => setToast((t) => ({ ...t, show: false }))} bg={toast.type} autohide delay={4000}>
          <Toast.Body>{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
}
