const PlanService = require("../services/plan.service");

const PlanController = {
    // Create subscription plan (Admin only)
    async createPlan(req, res) {
        try {
            const {
                name,
                description,
                amount,
                period,
                interval,
                planType,
                forRole,
                features,
                jobPostingLimit,
                featuredJobCount,
                hasResumeAccess,
                hasDirectChat
            } = req.body;

            // Validation
            if (!name || !amount || !period || !planType) {
                return res.status(400).json({
                    success: false,
                    statusCode: 400,
                    message: "Please provide all required fields: name, amount, period, planType"
                });
            }

            const allowedPeriods = ["daily", "weekly", "monthly", "yearly"];
            if (!allowedPeriods.includes(period.toLowerCase())) {
                return res.status(400).json({
                    success: false,
                    statusCode: 400,
                    message: "Invalid period. Period must be daily, weekly, monthly, or yearly."
                });
            }

            const allowedPlanTypes = ["MONTHLY_ELITE", "MONTHLY_PLATINUM", "YEARLY_ELITE", "YEARLY_PLATINUM"];
            if (!allowedPlanTypes.includes(planType)) {
                return res.status(400).json({
                    success: false,
                    statusCode: 400,
                    message: `Invalid planType. Must be one of: ${allowedPlanTypes.join(", ")}`
                });
            }

            const allowedRoles = ["EMPLOYER", "TRAINING_CENTRE", "JOBSEEKER"];
            const resolvedRole = forRole ? forRole.toUpperCase() : "EMPLOYER";
            if (!allowedRoles.includes(resolvedRole)) {
                return res.status(400).json({
                    success: false,
                    statusCode: 400,
                    message: `Invalid forRole. Must be one of: ${allowedRoles.join(", ")}`
                });
            }

            const createdPlan = await PlanService.createPlan({
                name,
                description,
                amount: Number(amount),
                period,
                interval: interval ? Number(interval) : 1,
                planType,
                forRole: resolvedRole,
                features: Array.isArray(features) ? features : [],
                jobPostingLimit: jobPostingLimit !== undefined ? Number(jobPostingLimit) : 5,
                featuredJobCount: featuredJobCount !== undefined ? Number(featuredJobCount) : 1,
                hasResumeAccess: hasResumeAccess === true || hasResumeAccess === "true",
                hasDirectChat: hasDirectChat === true || hasDirectChat === "true"
            });

            return res.status(201).json({
                success: true,
                statusCode: 201,
                message: "Subscription plan created successfully",
                data: createdPlan
            });

        } catch (error) {
            console.error("Error creating plan:", error);
            return res.status(500).json({
                success: false,
                statusCode: 500,
                message: "Failed to create plan",
                error: error.message
            });
        }
    },

    // Toggle active status (Admin only)
    async togglePlanStatus(req, res) {
        try {
            const { id } = req.params;
            const { isActive } = req.body;

            if (isActive === undefined || typeof isActive !== "boolean") {
                return res.status(400).json({
                    success: false,
                    statusCode: 400,
                    message: "Please provide a boolean isActive field in the body"
                });
            }

            const updatedPlan = await PlanService.togglePlanStatus(id, isActive);

            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: `Plan status updated successfully to ${isActive ? "Active" : "Inactive"}`,
                data: updatedPlan
            });

        } catch (error) {
            console.error("Error toggling plan status:", error);
            return res.status(500).json({
                success: false,
                statusCode: 500,
                message: "Failed to update plan status",
                error: error.message
            });
        }
    },

    // Get all plans (Public/Admin)
    async getPlans(req, res) {
        try {
            // Default to returning only active plans, unless explicitly asked otherwise
            const onlyActive = req.query.onlyActive !== "false";
            const role = req.query.role;

            const plans = await PlanService.getAllPlans(onlyActive, role);

            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: "Plans retrieved successfully",
                data: plans
            });

        } catch (error) {
            console.error("Error retrieving plans:", error);
            return res.status(500).json({
                success: false,
                statusCode: 500,
                message: "Failed to retrieve plans",
                error: error.message
            });
        }
    }
};

module.exports = PlanController;
