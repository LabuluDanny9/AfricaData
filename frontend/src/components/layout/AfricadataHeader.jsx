import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { Sun, Moon, LogOut, User, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'context/ThemeContext';
import { useAuth } from 'context/AuthContext';
import { googleLogout } from '@react-oauth/google';

const LANG_STORAGE_KEY = 'africadata-lang';

export default function AfricadataHeader() {
  const { t, i18n: i18nInstance } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const pathname = location.pathname || '';
  const [avatarError, setAvatarError] = useState(false);

  const setLanguage = (lng) => {
    i18nInstance.changeLanguage(lng);
    if (typeof window !== 'undefined') window.localStorage.setItem(LANG_STORAGE_KEY, lng);
  };

  const isActive = (path, exact = false) =>
    exact ? pathname === path : pathname === path || pathname.startsWith(path + '/');

  useEffect(() => {
    setAvatarError(false);
  }, [user?.picture]);

  const handleLogout = () => {
    if (process.env.REACT_APP_GOOGLE_CLIENT_ID) {
      try { googleLogout(); } catch (_) {}
    }
    logout();
  };

  return (
    <Navbar expand="lg" className="africadata-navbar shadow-sm" data-bs-theme={theme}>
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2 fw-bold" title={t('nav.backToHome')} aria-label="AfricaData">
          <img src="/logo.png" alt="AfricaData" className="africadata-header-logo" />
          <span className="d-none d-sm-inline">AfricaData</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="ms-auto align-items-lg-center gap-2">
            <Nav.Link as={Link} to="/" className={isActive('/', true) ? 'active' : ''}>{t('nav.home')}</Nav.Link>
            <Nav.Link as={Link} to="/librairie" className={isActive('/librairie') ? 'active' : ''}>{t('nav.library')}</Nav.Link>
            <Nav.Link as={Link} to="/about" className={isActive('/about') ? 'active' : ''}>{t('nav.about')}</Nav.Link>
            {user ? (
              <>
                <Nav.Link as={Link} to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>{t('nav.dashboard')}</Nav.Link>
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
                        width={32}
                        height={32}
                        className="rounded-circle"
                        referrerPolicy="no-referrer"
                        onError={() => setAvatarError(true)}
                      />
                    ) : (
                      <span className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white" style={{ width: 32, height: 32 }}>
                        <User size={18} />
                      </span>
                    )}
                    <span className="d-none d-md-inline small">{user.name || user.email}</span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Header className="small">{user.email}</Dropdown.Header>
                    <Dropdown.Item as={Link} to="/dashboard">
                      <User size={16} className="me-2" />
                      {t('nav.myAccount')}
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout} className="text-danger">
                      <LogOut size={16} className="me-2" />
                      {t('nav.logout')}
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/connexion" className={pathname === '/connexion' || pathname === '/connexion-admin' ? 'active' : ''}>{t('nav.login')}</Nav.Link>
                <Button as={Link} to="/inscription" variant="danger" size="sm" className={`rounded-pill px-3 ${pathname === '/inscription' ? 'active' : ''}`}>
                  {t('nav.signup')}
                </Button>
              </>
            )}
            <Dropdown align="end" className="d-flex align-items-center">
              <Dropdown.Toggle variant="link" className="text-body p-2 rounded-circle d-flex align-items-center justify-content-center" id="lang-dropdown" aria-label={t('common.language')}>
                <Globe size={20} />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setLanguage('fr')} active={i18nInstance.language === 'fr'}>{t('common.fr')}</Dropdown.Item>
                <Dropdown.Item onClick={() => setLanguage('en')} active={i18nInstance.language === 'en'}>{t('common.en')}</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Button
              variant="link"
              size="sm"
              className="text-body p-2 rounded-circle d-flex align-items-center justify-content-center theme-toggle"
              onClick={toggleTheme}
              aria-label={theme === 'light' ? t('common.switchToDark') : t('common.switchToLight')}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
