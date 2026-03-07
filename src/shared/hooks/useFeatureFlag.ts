import { useAppSelector } from './redux';
import { isFeatureEnabled } from '@shared/utils/featureFlags';

export const useFeatureFlag = (featureKey: string): boolean => {
  const { user } = useAppSelector((state) => state.auth);
  return isFeatureEnabled(featureKey, user?.role);
};

export const useFeatureFlags = () => {
  const { user } = useAppSelector((state) => state.auth);

  return {
    liveBidding: isFeatureEnabled('LIVE_BIDDING', user?.role),
    oauthLogin: isFeatureEnabled('OAUTH_LOGIN', user?.role),
    realTimeNotifications: isFeatureEnabled('REAL_TIME_NOTIFICATIONS', user?.role),
    mobileOTP: isFeatureEnabled('MOBILE_OTP', user?.role),
    playerAnalytics: isFeatureEnabled('PLAYER_ANALYTICS', user?.role),
    exportData: isFeatureEnabled('EXPORT_DATA', user?.role),
  };
};
