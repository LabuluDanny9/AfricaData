import { Link, useLocation } from 'react-router-dom';
import { Breadcrumb } from 'react-bootstrap';

const ROUTES = {
  '/superadmin': 'Dashboard',
  '/superadmin/publications': 'Publications',
  '/superadmin/utilisateurs': 'Utilisateurs',
  '/superadmin/paiements': 'Paiements',
  '/superadmin/codes-publication': 'Codes publication gratuite',
  '/superadmin/bibliotheque': 'Bibliothèque',
  '/superadmin/commentaires': 'Commentaires',
  '/superadmin/notifications': 'Notifications',
  '/superadmin/statistiques': 'Statistiques',
  '/superadmin/parametres': 'Paramètres',
  '/superadmin/audit': 'Audit logs',
};

export default function AdminBreadcrumb() {
  const location = useLocation();
  const pathname = location.pathname;

  if (pathname === '/superadmin') {
    return (
      <Breadcrumb className="admin-breadcrumb mb-3">
        <Breadcrumb.Item active>Dashboard</Breadcrumb.Item>
      </Breadcrumb>
    );
  }

  const currentLabel = ROUTES[pathname] || pathname.split('/').pop();
  return (
    <Breadcrumb className="admin-breadcrumb mb-3">
      <Breadcrumb.Item as={Link} to="/superadmin">Dashboard</Breadcrumb.Item>
      <Breadcrumb.Item active>{currentLabel}</Breadcrumb.Item>
    </Breadcrumb>
  );
}
