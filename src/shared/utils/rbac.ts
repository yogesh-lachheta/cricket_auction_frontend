// Role-based Access Control utilities

export type Role = 'viewer' | 'team_owner' | 'auctioneer' | 'admin';

export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
}

// Role hierarchy (higher roles inherit lower role permissions)
export const ROLE_HIERARCHY: Record<Role, number> = {
  viewer: 1,
  team_owner: 2,
  auctioneer: 3,
  admin: 4,
};

// Define permissions for each role
export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  viewer: [
    'auctions:read',
    'players:read',
    'teams:read',
  ],
  team_owner: [
    'auctions:read',
    'players:read',
    'teams:read',
    'teams:create',
    'teams:update',
    'bids:create',
    'bids:read',
  ],
  auctioneer: [
    'auctions:read',
    'auctions:create',
    'auctions:update',
    'auctions:manage', // start, end, cancel
    'players:read',
    'players:create',
    'players:update',
    'teams:read',
    'bids:read',
  ],
  admin: [
    'auctions:*',
    'players:*',
    'teams:*',
    'bids:*',
    'users:*',
  ],
};

/**
 * Check if a role has a specific permission
 */
export const hasPermission = (
  userRole: Role,
  permission: string,
  isSuperuser: boolean = false
): boolean => {
  if (isSuperuser) return true;

  const permissions = ROLE_PERMISSIONS[userRole] || [];
  
  // Check exact match
  if (permissions.includes(permission)) return true;
  
  // Check wildcard permissions (e.g., 'auctions:*')
  const [resource, action] = permission.split(':');
  const wildcardPermission = `${resource}:*`;
  
  return permissions.includes(wildcardPermission);
};

/**
 * Check if user role is at least the required role
 */
export const hasRole = (
  userRole: Role,
  requiredRole: Role,
  isSuperuser: boolean = false
): boolean => {
  if (isSuperuser) return true;
  
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};

/**
 * Check if user can access a route
 */
export const canAccessRoute = (
  userRole: Role,
  allowedRoles: Role[],
  isSuperuser: boolean = false
): boolean => {
  if (isSuperuser) return true;
  
  return allowedRoles.includes(userRole);
};
