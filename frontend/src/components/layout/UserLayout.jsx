import { useState, useEffect, useCallback } from 'react';
import { Link, Outlet, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Dropdown, Offcanvas, Form, InputGroup, ListGroup } from 'react-bootstrap';
import {
  Sun, Moon, LogOut, User, Bell, Search, LayoutDashboard, BookOpen, PlusCircle, FileText, Star, MessageCircle, Settings, Menu, Shield,
} from 'lucide-react';
import { useTheme } from 'context/ThemeContext';
import { useAuth } from 'context/AuthContext';
import { isAdminRole } from 'lib/adminRoles';
import { googleLogout } from '@react-oauth/google';
import { getNotifications, markNotificationAsRead, subscribeToNotifications } from 'services/notifications';
import { isSupabaseConfigured } from 'lib/supabase';
import 'components/layout/AfricadataHeader.css';
import './UserLayout.css';

const SIDEBAR_LINKS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/librairie', icon: BookOpen, label: 'Explorer les publications' },
  { to: '/submit', icon: PlusCircle, label: 'Soumettre une publication' },
  { to: '/mes-publications', icon: FileText, label: 'Mes publications' },
  { to: '/favoris', icon: Star, label: 'Favoris' },
  { to: '/avis', icon: MessageCircle, label: 'Avis & commentaires' },
  { to: '/profil', icon: User, label: 'Profil' },
];

export default function UserLayout() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSidebarMobile, setShowSidebarMobile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id || !isSupabaseConfigured()) return;
    const { data } = await getNotifications(user.id);
    if (data) setNotifications(data);
  }, [user?.id]);

  useEffect(() => {
    setAvatarError(false);
  }, [user?.picture]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!user?.id || !isSupabaseConfigured()) return;
    const unsubscribe = subscribeToNotifications(user.id, (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
    });
    return unsubscribe;
  }, [user?.id]);

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const handleNotificationClick = async (n) => {
    if (user?.id && n.id && !n.readAt) {
      await markNotificationAsRead(n.id, user.id);
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x)));
    }
    if (n.publicationId) navigate(`/publication/${n.publicationId}`);
    setShowNotifications(false);
  };

  const handleLogout = () => {
    if (process.env.REACT_APP_GOOGLE_CLIENT_ID) {
      try { googleLogout(); } catch (_) {}
    }
    logout();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/librairie?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  if (!user) {
    return <Navigate to="/connexion" replace />;
  }

  // Les admins accèdent ici comme tout utilisateur : tableau de bord, librairie, soumission, etc.
  // Ils ne jouent leur rôle admin que lorsqu'ils vont sur /superadmin (lien « Administration »).

  return (
    <div className="user-layout d-flex flex-column min-vh-100">
      {/* Navbar fixe */}
      <Navbar fixed="top" expand="lg" className="user-navbar shadow-sm" data-bs-theme={theme}>
        <Container fluid className="px-3 px-lg-4">
          <Button
            variant="link"
            className="d-lg-none me-2 p-2 text-body"
            onClick={() => setShowSidebarMobile(true)}
            aria-label="Menu"
          >
            <Menu size={24} />
          </Button>
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2 fw-bold me-3" title="Retour à l'accueil">
            <img src="/logo.png" alt="AfricaData" className="user-layout-logo" />
            <span className="d-none d-sm-inline">AfricaData</span>
          </Navbar.Brand>

          <Form onSubmit={handleSearch} className="flex-grow-1 mx-3 d-none d-md-block" style={{ maxWidth: 400 }}>
            <InputGroup size="sm">
              <Form.Control
                type="search"
                placeholder="Rechercher dans la bibliothèque..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="user-navbar-search"
              />
              <Button type="submit" variant="outline-secondary" aria-label="Rechercher">
                <Search size={18} />
              </Button>
            </InputGroup>
          </Form>

          <Nav className="ms-auto align-items-center gap-1">
            <Button
              variant="link"
              className="position-relative p-2 text-body rounded-circle"
              onClick={() => setShowNotifications(true)}
              aria-label="Notifications"
            >
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Button>
            <Button variant="link" className="p-2 text-body rounded-circle" onClick={toggleTheme} aria-label="Thème">
              {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
            </Button>
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="link"
                className="text-body text-decoration-none d-flex align-items-center gap-2 p-2 rounded-pill"
                id="user-dropdown"
              >
                {user.picture && !avatarError ? (
                  <img
                    src={user.picture}
                    alt=""
                    width={36}
                    height={36}
                    className="rounded-circle"
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <span className="rounded-circle bg-danger d-flex align-items-center justify-content-center text-white" style={{ width: 36, height: 36 }}>
                    <User size={20} />
                  </span>
                )}
                <span className="d-none d-lg-inline small fw-medium">{user.name || user.email}</span>
              </Dropdown.Toggle>
              <Dropdown.Menu align="end" className="shadow">
                <Dropdown.Header className="small">{user.email}</Dropdown.Header>
                <Dropdown.Item as={Link} to="/dashboard"><LayoutDashboard size={16} className="me-2" /> Tableau de bord</Dropdown.Item>
                <Dropdown.Item as={Link} to="/profil"><User size={16} className="me-2" /> Profil</Dropdown.Item>
                {isAdminRole(user.role) && (
                  <Dropdown.Item as={Link} to="/superadmin" className="text-danger fw-semibold">
                    <Shield size={16} className="me-2" /> Administration
                  </Dropdown.Item>
                )}
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout} className="text-danger">
                  <LogOut size={16} className="me-2" /> Se déconnecter
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Container>
      </Navbar>

      <div className="user-layout-body d-flex flex-grow-1">
        {/* Sidebar desktop */}
        <aside className="user-sidebar d-none d-lg-block">
          <nav className="user-sidebar-nav">
            <ListGroup variant="flush" className="rounded-0 border-0">
              {SIDEBAR_LINKS.map(({ to, icon: Icon, label }) => (
                <ListGroup.Item
                  key={to}
                  as={Link}
                  to={to}
                  action
                  className={`user-sidebar-item d-flex align-items-center gap-2 rounded-3 mx-2 my-1 ${location.pathname === to ? 'active' : ''}`}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  <span>{label}</span>
                </ListGroup.Item>
              ))}
              {isAdminRole(user.role) && (
                <ListGroup.Item
                  as={Link}
                  to="/superadmin"
                  action
                  className={`user-sidebar-item d-flex align-items-center gap-2 rounded-3 mx-2 my-1 text-danger ${location.pathname === '/superadmin' ? 'active' : ''}`}
                >
                  <Shield size={20} className="flex-shrink-0" />
                  <span>Administration</span>
                </ListGroup.Item>
              )}
            </ListGroup>
          </nav>
        </aside>

        {/* Main content */}
        <main className="user-main flex-grow-1 overflow-auto">
          <div className="user-main-inner p-3 p-lg-4">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Offcanvas sidebar mobile */}
      <Offcanvas show={showSidebarMobile} onHide={() => setShowSidebarMobile(false)} placement="start" className="user-offcanvas-sidebar" data-bs-theme={theme}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title className="d-flex align-items-center gap-2">
            <img src="/logo.png" alt="" width={32} height={32} />
            Menu
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          <ListGroup variant="flush">
            {SIDEBAR_LINKS.map(({ to, icon: Icon, label }) => (
              <ListGroup.Item
                key={to}
                as={Link}
                to={to}
                action
                className={`d-flex align-items-center gap-2 rounded-0 border-0 px-3 py-3 ${location.pathname === to ? 'bg-danger bg-opacity-10 text-danger' : ''}`}
                onClick={() => setShowSidebarMobile(false)}
              >
                <Icon size={20} />
                {label}
              </ListGroup.Item>
            ))}
            {isAdminRole(user.role) && (
              <ListGroup.Item
                as={Link}
                to="/superadmin"
                action
                className={`d-flex align-items-center gap-2 rounded-0 border-0 px-3 py-3 ${location.pathname === '/superadmin' ? 'bg-danger bg-opacity-10 text-danger' : ''}`}
                onClick={() => setShowSidebarMobile(false)}
              >
                <Shield size={20} />
                Administration
              </ListGroup.Item>
            )}
          </ListGroup>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Offcanvas notifications */}
      <Offcanvas show={showNotifications} onHide={() => setShowNotifications(false)} placement="end" className="user-offcanvas-notifications" data-bs-theme={theme}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title className="d-flex align-items-center gap-2">
            <Bell size={22} />
            Notifications
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          <ListGroup variant="flush">
            {notifications.map((n) => (
              <ListGroup.Item
                key={n.id}
                action
                className={`border-0 border-bottom py-3 px-3 ${!n.readAt ? 'bg-opacity-10 bg-primary' : ''}`}
                onClick={() => handleNotificationClick(n)}
              >
                <p className="small mb-1 fw-medium">{n.title}</p>
                {n.message && <p className="small mb-1 text-body-secondary">{n.message}</p>}
                {n.publicationId && (
                  <span className="small text-danger">Voir la publication →</span>
                )}
                <span className="d-block text-body-secondary small mt-1">
                  {n.createdAt ? new Date(n.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
              </ListGroup.Item>
            ))}
            {notifications.length === 0 && (
              <ListGroup.Item className="border-0 text-center text-body-secondary py-5">
                Aucune notification. Les nouvelles publications apparaîtront ici.
              </ListGroup.Item>
            )}
          </ListGroup>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
}
