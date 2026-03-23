/**
 * Rôles administratifs AfricaData — hiérarchie et permissions
 * Spécification officielle Admin
 */

export const ADMIN_ROLES = {
  SUPER_ADMIN: 'admin',
  ADMIN_EDITORIAL: 'admin_editorial',
  MODERATOR: 'moderator',
};

export const ROLE_LABELS = {
  [ADMIN_ROLES.SUPER_ADMIN]: 'Super Admin',
  [ADMIN_ROLES.ADMIN_EDITORIAL]: 'Admin éditorial',
  [ADMIN_ROLES.MODERATOR]: 'Modérateur',
};

/** Rôles autorisés à accéder à l'interface admin */
export const ADMIN_ACCESS_ROLES = [ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.ADMIN_EDITORIAL, ADMIN_ROLES.MODERATOR];

/** Permissions par section (clé = route/section) */
const PERMISSIONS = {
  dashboard: [ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.ADMIN_EDITORIAL, ADMIN_ROLES.MODERATOR],
  publications: [ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.ADMIN_EDITORIAL],
  users: [ADMIN_ROLES.SUPER_ADMIN],
  payments: [ADMIN_ROLES.SUPER_ADMIN],
  waiver_codes: [ADMIN_ROLES.SUPER_ADMIN],
  library: [ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.ADMIN_EDITORIAL],
  comments: [ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.ADMIN_EDITORIAL, ADMIN_ROLES.MODERATOR],
  notifications: [ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.ADMIN_EDITORIAL, ADMIN_ROLES.MODERATOR],
  statistics: [ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.ADMIN_EDITORIAL],
  settings: [ADMIN_ROLES.SUPER_ADMIN],
  audit: [ADMIN_ROLES.SUPER_ADMIN],
};

export function isAdminRole(role) {
  return role && ADMIN_ACCESS_ROLES.includes(role);
}

export function canAccess(role, section) {
  if (!role) return false;
  const allowed = PERMISSIONS[section];
  return allowed && allowed.includes(role);
}

export function canManageUsers(role) {
  return role === ADMIN_ROLES.SUPER_ADMIN;
}

export function canChangeSettings(role) {
  return role === ADMIN_ROLES.SUPER_ADMIN;
}

export function canDeleteAnyContent(role) {
  return role === ADMIN_ROLES.SUPER_ADMIN;
}

export function canValidatePublications(role) {
  return role === ADMIN_ROLES.SUPER_ADMIN || role === ADMIN_ROLES.ADMIN_EDITORIAL;
}

export function canModerateComments(role) {
  return ADMIN_ACCESS_ROLES.includes(role);
}
