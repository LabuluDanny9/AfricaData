import React from 'react';
import { Link } from 'react-router-dom';
import './AfricadataFooter.css';

export default function AfricadataFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="africadata-footer">
      <div className="africadata-footer__inner">
        <Link to="/" className="africadata-footer__logo d-inline-block mb-3">
          <img src="/logo.png" alt="AfricaData" className="africadata-footer-logo" />
        </Link>
        <div className="africadata-footer__links">
          <Link to="/">Accueil</Link>
          <Link to="/librairie">Librairie</Link>
          <Link to="/about">À propos</Link>
          <Link to="/connexion">Connexion</Link>
        </div>
        <p className="africadata-footer__copy">© {year} AfricaData — Rayonnement scientifique panafricain.</p>
      </div>
    </footer>
  );
}
