const PlanModel = require("../models/plan.model");
const razorpay = require("../config/razorpay");

const PlanService = {
    async createPlan(data) {
        const amountInPaise = data.amount * 100;
        const currency = data.currency || "INR";

        const razorpayPlan = await razorpay.plans.create({
            period: data.period.toLowerCase(),
            interval: data.interval || 1,
            item: {
                name: data.name,
                amount: amountInPaise,
                currency: currency,
                description: data.description || null
            }
        });

        const newPlan = await PlanModel.createPlan({
            razorpayPlanId: razorpayPlan.id,
            name: data.name,
            description: data.description,
            amount: amountInPaise,
            currency: currency,
            period: data.period.toUpperCase(),
            interval: data.interval || 1,
            planType: data.planType,
            forRole: data.forRole,
            isActive: true,
            features: data.features,
            jobPostingLimit: data.jobPostingLimit,
            featuredJobCount: data.featuredJobCount,
            hasResumeAccess: data.hasResumeAccess,
            hasDirectChat: data.hasDirectChat,
            hasCandidateAccess: data.hasCandidateAccess,
            employerVisibilityDuration: data.employerVisibilityDuration,
            searchVisibilityDuration: data.searchVisibilityDuration
        });

        return newPlan;
    },

    // Toggle status
    async togglePlanStatus(id, isActive) {
        return await PlanModel.togglePlanStatus(id, isActive);
    },

    // Get all plans
    async getAllPlans(onlyActive, role) {
        return await PlanModel.getAllPlans(onlyActive, role);
    }
};

module.exports = PlanService;
