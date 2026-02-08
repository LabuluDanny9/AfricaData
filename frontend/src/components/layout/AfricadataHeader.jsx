import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { Sun, Moon, LogOut, User } from 'lucide-react';
import { useTheme } from 'context/ThemeContext';
import { useAuth } from 'context/AuthContext';
import { googleLogout } from '@react-oauth/google';

export default function AfricadataHeader() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [avatarError, setAvatarError] = useState(false);

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
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2 fw-bold" title="Retour à l'accueil" aria-label="Accueil AfricaData">
          <img src="/logo.png" alt="AfricaData" className="africadata-header-logo" />
          <span className="d-none d-sm-inline">AfricaData</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="ms-auto align-items-lg-center gap-2">
            <Nav.Link as={Link} to="/">Accueil</Nav.Link>
            <Nav.Link as={Link} to="/librairie">Librairie</Nav.Link>
            <Nav.Link as={Link} to="/about">À propos</Nav.Link>
            {user ? (
              <>
                <Nav.Link as={Link} to="/dashboard">Tableau de bord</Nav.Link>
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
                      Mon compte
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout} className="text-danger">
                      <LogOut size={16} className="me-2" />
                      Se déconnecter
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/connexion">Connexion</Nav.Link>
                <Button as={Link} to="/inscription" variant="danger" size="sm" className="rounded-pill px-3">
                  S'inscrire
                </Button>
              </>
            )}
            <Button
              variant="link"
              size="sm"
              className="text-body p-2 rounded-circle d-flex align-items-center justify-content-center theme-toggle"
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'Passer en mode sombre' : 'Passer en mode clair'}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
