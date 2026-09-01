const prisma = require("../config/db");

const DEFAULT_FREE_LIMITS = {
  jobPostLimit: 1,
  courseLimit: 1,
  hasDirectChat: false,
  hasExcelDownloads: false,
  hasResumeAccess: false,
  hasCandidateAccess: false,
  viewCv: false,
  featuredJobCount: 0,
  features: []
};

/**
 * Fetches the user's active subscription and maps limits/privileges directly from the Plan table in database.
 * All counts and flags (jobPostLimit, courseLimit, hasDirectChat, hasResumeAccess, etc.) are fetched
 * directly from the Plan table without any hardcoded plan-type limits.
 * 
 * @param {string} userId 
 * @param {string} role 
 * @returns {Promise<{planType: string, planName: string, limits: object}>}
 */
const getPlanLimitsForUser = async (userId, role) => {
  try {
    if (!userId) {
      return {
        planType: "FREE",
        planName: "Free Tier",
        limits: DEFAULT_FREE_LIMITS
      };
    }

    // 1. Fetch active subscription for user
    const subscription = await prisma.subscriptions.findFirst({
      where: {
        userId,
        status: "ACTIVE"
      }
    });

    // If user has no active subscription, they are on the default free tier
    if (!subscription) {
      return {
        planType: "FREE",
        planName: "Free Tier",
        limits: DEFAULT_FREE_LIMITS
      };
    }

    // 2. Fetch the corresponding plan record from the Plan database table
    let plan = null;

    if (subscription.planId) {
      plan = await prisma.plan.findFirst({
        where: {
          OR: [
            { id: subscription.planId },
            { razorpayPlanId: subscription.planId }
          ]
        }
      });
    }

    if (!plan && subscription.planType) {
      plan = await prisma.plan.findFirst({
        where: {
          planType: subscription.planType,
          ...(role ? { forRole: role } : {})
        }
      });
    }

    if (!plan) {
      return {
        planType: subscription.planType || "FREE",
        planName: subscription.planType || "Active Plan",
        limits: DEFAULT_FREE_LIMITS
      };
    }

    // 3. Extract limits directly from Plan table data
    const jobPostLimit = plan.jobPostingLimit !== undefined && plan.jobPostingLimit !== null
      ? plan.jobPostingLimit
      : DEFAULT_FREE_LIMITS.jobPostLimit;

    const courseLimit = plan.jobPostingLimit !== undefined && plan.jobPostingLimit !== null
      ? plan.jobPostingLimit
      : DEFAULT_FREE_LIMITS.courseLimit;

    const hasDirectChat = Boolean(plan.hasDirectChat);
    const hasResumeAccess = Boolean(plan.hasResumeAccess);
    const hasCandidateAccess = Boolean(plan.hasCandidateAccess);
    const hasExcelDownloads = hasResumeAccess || hasCandidateAccess;
    const viewCv = hasResumeAccess || hasCandidateAccess;

    return {
      planType: plan.planType,
      planName: plan.name,
      limits: {
        jobPostLimit,
        courseLimit,
        hasDirectChat,
        hasExcelDownloads,
        hasResumeAccess,
        hasCandidateAccess,
        viewCv,
        featuredJobCount: plan.featuredJobCount || 0,
        searchVisibilityDuration: plan.searchVisibilityDuration,
        employerVisibilityDuration: plan.employerVisibilityDuration,
        features: plan.features || []
      }
    };
  } catch (error) {
    console.error("Error resolving user plan limits from DB Plan table:", error);
    return {
      planType: "FREE",
      planName: "Free Tier",
      limits: DEFAULT_FREE_LIMITS
    };
  }
};

module.exports = {
  DEFAULT_FREE_LIMITS,
  getPlanLimitsForUser
};
