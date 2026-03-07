import { useAppSelector } from './redux';
import { hasPermission, hasRole, type Role } from '@shared/utils/rbac';

export const usePermissions = () => {
  const { user } = useAppSelector((state) => state.auth);

  const checkPermission = (permission: string): boolean => {
    if (!user) return false;
    return hasPermission(user.role as Role, permission, user.is_superuser);
  };

  const checkRole = (requiredRole: Role): boolean => {
    if (!user) return false;
    return hasRole(user.role as Role, requiredRole, user.is_superuser);
  };

  const can = {
    // Auctions
    createAuction: () => checkPermission('auctions:create'),
    updateAuction: () => checkPermission('auctions:update'),
    deleteAuction: () => checkPermission('auctions:delete'),
    manageAuction: () => checkPermission('auctions:manage'),
    
    // Players
    createPlayer: () => checkPermission('players:create'),
    updatePlayer: () => checkPermission('players:update'),
    deletePlayer: () => checkPermission('players:delete'),
    
    // Teams
    createTeam: () => checkPermission('teams:create'),
    updateTeam: () => checkPermission('teams:update'),
    deleteTeam: () => checkPermission('teams:delete'),
    
    // Bids
    placeBid: () => checkPermission('bids:create'),
    
    // Users
    manageUsers: () => checkPermission('users:*'),
  };

  return {
    can,
    checkPermission,
    checkRole,
    isAdmin: user?.is_superuser || user?.role === 'admin',
    isAuctioneer: user?.role === 'auctioneer' || user?.is_superuser,
    isTeamOwner: user?.role === 'team_owner',
    isViewer: user?.role === 'viewer',
  };
};
