import { Link, useLocation } from 'react-router-dom';
import { Breadcrumb } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const ROUTE_KEYS = {
  '/superadmin': 'admin.dashboard',
  '/superadmin/publications': 'admin.publications',
  '/superadmin/utilisateurs': 'admin.users',
  '/superadmin/paiements': 'admin.payments',
  '/superadmin/codes-publication': 'admin.waiverCodes',
  '/superadmin/bibliotheque': 'admin.library',
  '/superadmin/commentaires': 'admin.comments',
  '/superadmin/notifications': 'admin.notifications',
  '/superadmin/statistiques': 'admin.statistics',
  '/superadmin/parametres': 'admin.settings',
  '/superadmin/audit': 'admin.audit',
};

export default function AdminBreadcrumb() {
  const { t } = useTranslation();
  const location = useLocation();
  const pathname = location.pathname;

  if (pathname === '/superadmin') {
    return (
      <Breadcrumb className="admin-breadcrumb mb-3">
        <Breadcrumb.Item active>{t('admin.dashboard')}</Breadcrumb.Item>
      </Breadcrumb>
    );
  }

  const currentLabel = ROUTE_KEYS[pathname] ? t(ROUTE_KEYS[pathname]) : pathname.split('/').pop();
  return (
    <Breadcrumb className="admin-breadcrumb mb-3">
      <Breadcrumb.Item as={Link} to="/superadmin">{t('admin.dashboard')}</Breadcrumb.Item>
      <Breadcrumb.Item active>{currentLabel}</Breadcrumb.Item>
    </Breadcrumb>
  );
}
