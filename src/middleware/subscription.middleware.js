const prisma = require("../config/db");
const { getPlanLimitsForUser } = require("../utils/featureMatrix");

const checkSubscriptionFeature = (featureName) => {
    return async (req, res, next) => {
        try {
            const userId = req.user?.id;
            const role = req.user?.role;
            
            // Only EMPLOYER and TRAINING_CENTRE are subject to subscription checks
            if (role !== "EMPLOYER" && role !== "TRAINING_CENTRE") {
                return next();
            }
            
            // Fetch limits dynamically from Plan table in DB
            const { limits } = await getPlanLimitsForUser(userId, role);
            
            // Check boolean feature access
            if (typeof limits[featureName] === 'boolean' && !limits[featureName]) {
                return res.status(403).json({
                    success: false,
                    statusCode: 403,
                    code: "SUBSCRIPTION_REQUIRED",
                    message: `Upgrade to a premium plan to access this feature.`
                });
            }
            
            req.planLimits = limits;
            next();
        } catch (error) {
            next(error);
        }
    };
};

const checkPostingLimit = (postType) => {
    return async (req, res, next) => {
        try {
            const userId = req.user?.id;
            const role = req.user?.role;

            if (role !== "EMPLOYER" && role !== "TRAINING_CENTRE") {
                return next();
            }

            // If editing an existing job or course, do not enforce new post limit
            if (req.body?.jobId || req.body?.courseId || req.params?.id) {
                return next();
            }
            
            // Fetch limits dynamically from Plan table in DB
            const { limits } = await getPlanLimitsForUser(userId, role);
            const limit = postType === 'job' ? limits.jobPostLimit : limits.courseLimit;
            
            if (postType === 'job') {
                const jobCount = await prisma.jobs.count({
                    where: { userId, deletedAt: null }
                });
                if (jobCount >= limit) {
                    return res.status(403).json({
                        success: false,
                        statusCode: 403,
                        code: "POST_LIMIT_EXCEEDED",
                        message: `You have reached your limit of ${limit} job post(s). Upgrade your plan to post more.`
                    });
                }
            } else if (postType === 'course') {
                const courseCount = await prisma.course.count({
                    where: { trainingCentreId: userId, deletedAt: null }
                });
                if (courseCount >= limit) {
                    return res.status(403).json({
                        success: false,
                        statusCode: 403,
                        code: "POST_LIMIT_EXCEEDED",
                        message: `You have reached your limit of ${limit} course(s). Upgrade your plan to post more.`
                    });
                }
            }
            
            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = { checkSubscriptionFeature, checkPostingLimit };
