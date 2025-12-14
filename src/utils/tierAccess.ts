/**
 * Tier Access Control Utilities
 * Manages feature access based on user subscription tier
 */

export const TIERS = {
  FREE: 'free',
  PREMIUM: 'premium',
  PRO: 'premium', // Alias for PREMIUM
  ELITE: 'elite',
  ENTERPRISE: 'elite' // Alias for ELITE
} as const;

type TierType = typeof TIERS[keyof typeof TIERS];

const TIER_HIERARCHY: Record<string, number> = {
  free: 0,
  premium: 1,
  elite: 2
};

/**
 * Check if user has access to a feature based on tier
 */
export function hasAccess(userTier: string = TIERS.FREE, requiredTier: string): boolean {
  const userLevel = TIER_HIERARCHY[userTier.toLowerCase()] ?? 0;
  const requiredLevel = TIER_HIERARCHY[requiredTier.toLowerCase()] ?? 0;
  return userLevel >= requiredLevel;
}

/**
 * Get upgrade message for a specific tier
 */
export function getUpgradeMessage(tier: string): string {
  const tierMap: Record<string, string> = {
    free: 'Upgrade to Premium to unlock this feature',
    premium: 'Upgrade to Premium ($97/mo) to unlock this feature',
    elite: 'Upgrade to Elite ($297/mo) to unlock unlimited access'
  };
  return tierMap[tier.toLowerCase()] || 'Upgrade your plan to access this feature';
}

/**
 * Get tier limits for direct mail feature
 */
export function getDirectMailLimits(userTier: string = TIERS.FREE) {
  const limits: Record<string, { postcards: number; campaigns: number; name: string }> = {
    free: { postcards: 10, campaigns: 2, name: 'Free' },
    premium: { postcards: 100, campaigns: 10, name: 'Premium' },
    elite: { postcards: -1, campaigns: -1, name: 'Elite' } // -1 = unlimited
  };
  return limits[userTier.toLowerCase()] || limits.free;
}
