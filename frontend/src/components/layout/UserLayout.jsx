import { useState, useEffect, useCallback } from 'react';
import { Link, Outlet, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Dropdown, Offcanvas, Form, InputGroup, ListGroup, Modal } from 'react-bootstrap';
import {
  Sun, Moon, LogOut, User, Bell, Search, LayoutDashboard, BookOpen, PlusCircle, FileText, Star, MessageCircle, Menu, Shield, Globe, FileCheck, Trash2, ExternalLink,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'context/ThemeContext';
import { useAuth } from 'context/AuthContext';
import { PUBLIC_LIBRARY_PATH } from 'lib/publicRoutes';
import { isAdminRole } from 'lib/adminRoles';
import { getNotifications, markNotificationAsRead, subscribeToNotifications, deleteNotification } from 'services/notifications';
import { isSupabaseConfigured } from 'lib/supabase';
import 'components/layout/AfricadataHeader.css';
import './UserLayout.css';

const SIDEBAR_LINKS = [
  { to: '/dashboard', icon: LayoutDashboard, labelKey: 'user.dashboard' },
  { to: PUBLIC_LIBRARY_PATH, icon: BookOpen, labelKey: 'user.explorePublications' },
  { to: '/submit', icon: PlusCircle, labelKey: 'user.submitPublication' },
  { to: '/normes-de-publication', icon: FileCheck, labelKey: 'user.publicationNorms' },
  { to: '/mes-publications', icon: FileText, labelKey: 'user.myPublications' },
  { to: '/favoris', icon: Star, labelKey: 'user.favorites' },
  { to: '/avis', icon: MessageCircle, labelKey: 'user.reviewsComments' },
  { to: '/profil', icon: User, labelKey: 'user.profile' },
];

const LANG_STORAGE_KEY = 'africadata-lang';

export default function UserLayout() {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const setLanguage = (lng) => {
    i18n.changeLanguage(lng);
    if (typeof window !== 'undefined') window.localStorage.setItem(LANG_STORAGE_KEY, lng);
  };
  const { user, logout, authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSidebarMobile, setShowSidebarMobile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [deletingNotificationId, setDeletingNotificationId] = useState(null);
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
      // Alerte : son + notification navigateur si l'utilisateur est en ligne (onglet actif ou non)
      try {
        if (typeof window !== 'undefined' && 'AudioContext' in window) {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = 880;
          osc.type = 'sine';
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.15);
        }
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          new Notification(newNotif.title || 'Africadata', {
            body: (newNotif.message || '').slice(0, 200) + (newNotif.message && newNotif.message.length > 200 ? '…' : ''),
            icon: '/favicon.ico',
          });
        }
      } catch (_) {}
    });
    return unsubscribe;
  }, [user?.id]);

  // Demander la permission des notifications navigateur au premier chargement (pour alerte même si onglet en arrière-plan)
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const handleNotificationClick = async (n) => {
    if (user?.id && n.id && !n.readAt) {
      await markNotificationAsRead(n.id, user.id);
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x)));
    }
    setSelectedNotification(n);
    setShowNotifications(false);
  };

  const handleCloseNotificationModal = () => setSelectedNotification(null);

  const handleGoToPublication = () => {
    if (selectedNotification?.publicationId) {
      navigate(`/publication/${selectedNotification.publicationId}`);
      setSelectedNotification(null);
    }
  };

  const handleDeleteNotification = async (notificationOrEvent) => {
    const n = typeof notificationOrEvent?.id !== 'undefined'
      ? notificationOrEvent
      : selectedNotification;
    if (!n?.id || !user?.id) return;
    setDeletingNotificationId(n.id);
    const { error } = await deleteNotification(n.id, user.id);
    setDeletingNotificationId(null);
    if (!error) {
      setNotifications((prev) => prev.filter((x) => x.id !== n.id));
      if (selectedNotification?.id === n.id) setSelectedNotification(null);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`${PUBLIC_LIBRARY_PATH}?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  if (authLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="spinner-border text-danger" role="status"><span className="visually-hidden">{t('common.loading')}</span></div>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/connexion" replace />;
  }

  // Les admins accèdent ici comme tout utilisateur : tableau de bord, bibliothèque, soumission, etc.
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
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2 fw-bold me-3" title={t('nav.backToHome')}>
            <img src="/logo.png" alt="AfricaData" className="user-layout-logo" />
            <span className="d-none d-sm-inline">AfricaData</span>
          </Navbar.Brand>

          <Form onSubmit={handleSearch} className="flex-grow-1 mx-3 d-none d-md-block" style={{ maxWidth: 400 }}>
            <InputGroup size="sm">
              <Form.Control
                type="search"
                placeholder={t('user.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="user-navbar-search"
              />
              <Button type="submit" variant="outline-secondary" aria-label={t('common.search')}>
                <Search size={18} />
              </Button>
            </InputGroup>
          </Form>

          <Nav className="ms-auto align-items-center gap-1">
            <Dropdown align="end" className="d-flex align-items-center">
              <Dropdown.Toggle variant="link" className="text-body p-2 rounded-circle d-flex align-items-center justify-content-center" id="user-lang-dropdown" aria-label={t('common.language')}>
                <Globe size={22} />
              </Dropdown.Toggle>
              <Dropdown.Menu align="end">
                <Dropdown.Item onClick={() => setLanguage('fr')} active={i18n.language === 'fr' || (i18n.language || '').startsWith('fr')}>{t('common.fr')}</Dropdown.Item>
                <Dropdown.Item onClick={() => setLanguage('en')} active={i18n.language === 'en'}>{t('common.en')}</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Button
              variant="link"
              className="position-relative p-2 text-body rounded-circle"
              onClick={() => setShowNotifications(true)}
              aria-label={t('user.notifications')}
            >
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Button>
            <Button variant="link" className="p-2 text-body rounded-circle" onClick={toggleTheme} aria-label={theme === 'dark' ? t('common.switchToLight') : t('common.switchToDark')}>
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
                <Dropdown.Item as={Link} to="/dashboard"><LayoutDashboard size={16} className="me-2" /> {t('user.dashboard')}</Dropdown.Item>
                <Dropdown.Item as={Link} to="/profil"><User size={16} className="me-2" /> {t('user.profile')}</Dropdown.Item>
                {isAdminRole(user.role) && (
                  <Dropdown.Item as={Link} to="/superadmin" className="text-danger fw-semibold">
                    <Shield size={16} className="me-2" /> {t('nav.admin')}
                  </Dropdown.Item>
                )}
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout} className="text-danger">
                  <LogOut size={16} className="me-2" /> {t('nav.logout')}
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
              {SIDEBAR_LINKS.map(({ to, icon: Icon, labelKey }) => (
                <ListGroup.Item
                  key={to}
                  as={Link}
                  to={to}
                  action
                  className={`user-sidebar-item d-flex align-items-center gap-2 rounded-3 mx-2 my-1 ${location.pathname === to ? 'active' : ''}`}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  <span>{t(labelKey)}</span>
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
                  <span>{t('nav.admin')}</span>
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
            {t('user.menu')}
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          <Form onSubmit={handleSearch} className="d-lg-none p-3 border-bottom">
            <InputGroup size="sm">
              <Form.Control
                type="search"
                placeholder={t('user.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" variant="outline-secondary" aria-label={t('common.search')}>
                <Search size={18} />
              </Button>
            </InputGroup>
          </Form>
          <ListGroup variant="flush">
            {SIDEBAR_LINKS.map(({ to, icon: Icon, labelKey }) => (
              <ListGroup.Item
                key={to}
                as={Link}
                to={to}
                action
                className={`d-flex align-items-center gap-2 rounded-0 border-0 px-3 py-3 ${location.pathname === to ? 'bg-danger bg-opacity-10 text-danger' : ''}`}
                onClick={() => setShowSidebarMobile(false)}
              >
                <Icon size={20} />
                {t(labelKey)}
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
                {t('nav.admin')}
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
            {t('user.notifications')}
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          <ListGroup variant="flush">
            {notifications.map((n) => (
              <ListGroup.Item
                key={n.id}
                action
                className={`border-0 border-bottom py-3 px-3 position-relative ${!n.readAt ? 'bg-opacity-10 bg-primary' : ''} ${n.type === 'publication_validated' || n.type === 'publication_online' ? 'notification-validation' : ''} ${n.type === 'publication_rejected' ? 'notification-rejection' : ''}`}
                onClick={() => handleNotificationClick(n)}
              >
                <div className="d-flex justify-content-between align-items-start gap-2">
                  <div className="flex-grow-1 min-w-0">
                    <p className="small mb-1 fw-medium">{n.title}</p>
                    {n.message && (
                      <p className={`small mb-1 text-body-secondary text-truncate ${n.type === 'publication_validated' || n.type === 'publication_online' || n.type === 'publication_rejected' ? 'notification-validation-message' : ''}`} style={{ maxWidth: '100%' }}>
                        {n.message}
                      </p>
                    )}
                    {n.publicationId && (
                      <span className="small text-danger">{t('user.viewPublication')} →</span>
                    )}
                    <span className="d-block text-body-secondary small mt-1">
                      {n.createdAt ? new Date(n.createdAt).toLocaleDateString((i18n.language || 'fr').startsWith('en') ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="flex-shrink-0 p-1 rounded user-notification-delete-btn"
                    onClick={(e) => { e.stopPropagation(); handleDeleteNotification(n); }}
                    disabled={deletingNotificationId === n.id}
                    aria-label={t('user.deleteNotification') || 'Supprimer'}
                    title={t('user.deleteNotification') || 'Supprimer'}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </ListGroup.Item>
            ))}
            {notifications.length === 0 && (
              <ListGroup.Item className="border-0 text-center text-body-secondary py-5">
                {t('user.noNotificationsEmpty')}
              </ListGroup.Item>
            )}
          </ListGroup>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Modal lecture complète d'une notification */}
      <Modal
        show={!!selectedNotification}
        onHide={handleCloseNotificationModal}
        centered
        className="user-notification-modal"
        data-bs-theme={theme}
      >
        <Modal.Header closeButton>
          <Modal.Title className="small fw-bold d-flex align-items-center gap-2">
            <Bell size={20} />
            {selectedNotification?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="user-notification-modal-body">
          {selectedNotification?.message && (
            <p className="mb-3 text-body user-notification-modal-message" style={{ whiteSpace: 'pre-line' }}>
              {selectedNotification.message}
            </p>
          )}
          <p className="small text-body-secondary mb-0">
            {selectedNotification?.createdAt
              ? new Date(selectedNotification.createdAt).toLocaleDateString((i18n.language || 'fr').startsWith('en') ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
              : ''}
          </p>
        </Modal.Body>
        <Modal.Footer className="d-flex flex-wrap gap-2 justify-content-between">
          <div className="d-flex gap-2">
            {selectedNotification?.publicationId && (
              <Button variant="danger" size="sm" className="d-inline-flex align-items-center gap-1" onClick={handleGoToPublication}>
                <ExternalLink size={16} />
                {t('user.viewPublication')}
              </Button>
            )}
          </div>
          <div className="d-flex gap-2">
            <Button
              variant="outline-danger"
              size="sm"
              className="d-inline-flex align-items-center gap-1"
              onClick={() => handleDeleteNotification(selectedNotification)}
              disabled={deletingNotificationId === selectedNotification?.id}
            >
              <Trash2 size={16} />
              {t('user.deleteNotification') || 'Supprimer'}
            </Button>
            <Button variant="secondary" size="sm" onClick={handleCloseNotificationModal}>
              {t('common.close') || 'Fermer'}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
