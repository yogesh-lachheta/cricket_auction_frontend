// Feature Flags system

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description: string;
  roles?: string[]; // If specified, only these roles can access
}

// Define all feature flags
export const FEATURE_FLAGS: Record<string, FeatureFlag> = {
  LIVE_BIDDING: {
    key: 'LIVE_BIDDING',
    enabled: true,
    description: 'Enable live bidding functionality',
    roles: ['team_owner', 'auctioneer', 'admin'],
  },
  OAUTH_LOGIN: {
    key: 'OAUTH_LOGIN',
    enabled: false, // Coming soon
    description: 'Enable Google/Microsoft OAuth login',
  },
  REAL_TIME_NOTIFICATIONS: {
    key: 'REAL_TIME_NOTIFICATIONS',
    enabled: true,
    description: 'Enable WebSocket real-time notifications',
  },
  MOBILE_OTP: {
    key: 'MOBILE_OTP',
    enabled: true,
    description: 'Enable mobile OTP verification',
  },
  PLAYER_ANALYTICS: {
    key: 'PLAYER_ANALYTICS',
    enabled: false,
    description: 'Advanced player statistics and analytics',
    roles: ['auctioneer', 'admin'],
  },
  EXPORT_DATA: {
    key: 'EXPORT_DATA',
    enabled: false,
    description: 'Export auction data to CSV/Excel',
    roles: ['admin'],
  },
};

/**
 * Check if a feature is enabled
 */
export const isFeatureEnabled = (
  featureKey: string,
  userRole?: string
): boolean => {
  const feature = FEATURE_FLAGS[featureKey];
  
  if (!feature) return false;
  if (!feature.enabled) return false;
  
  // Check role-based access
  if (feature.roles && userRole) {
    return feature.roles.includes(userRole);
  }
  
  return true;
};

/**
 * Get all enabled features for a role
 */
export const getEnabledFeatures = (userRole?: string): string[] => {
  return Object.keys(FEATURE_FLAGS).filter((key) =>
    isFeatureEnabled(key, userRole)
  );
};
