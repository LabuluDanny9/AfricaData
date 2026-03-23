import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './AfricadataFooter.css';

export default function AfricadataFooter() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  return (
    <footer className="africadata-footer">
      <div className="africadata-footer__inner">
        <Link to="/" className="africadata-footer__logo d-inline-block mb-3">
          <img src="/logo.png" alt="AfricaData" className="africadata-footer-logo" />
        </Link>
        <div className="africadata-footer__links">
          <Link to="/">{t('nav.home')}</Link>
          <Link to="/librairie">{t('nav.library')}</Link>
          <Link to="/about">{t('nav.about')}</Link>
          <Link to="/connexion">{t('nav.login')}</Link>
        </div>
        <p className="africadata-footer__copy">{t('footer.copy', { year })}</p>
      </div>
    </footer>
  );
}
