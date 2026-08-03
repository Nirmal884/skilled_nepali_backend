const PlanModel = require("../models/plan.model");
const razorpay = require("../config/razorpay");

const PlanService = {
    // Create plan on Razorpay and local database
    async createPlan(data) {
        // Amount is sent in standard unit (e.g. Rupees) and converted to Paise (e.g. * 100)
        const amountInPaise = data.amount * 100;
        const currency = data.currency || "INR";

        // 1. Create the plan in Razorpay
        const razorpayPlan = await razorpay.plans.create({
            period: data.period.toLowerCase(), // monthly, yearly, daily, weekly
            interval: data.interval || 1,
            item: {
                name: data.name,
                amount: amountInPaise,
                currency: currency,
                description: data.description || null
            }
        });

        // 2. Save the plan in our database
        const newPlan = await PlanModel.createPlan({
            razorpayPlanId: razorpayPlan.id,
            name: data.name,
            description: data.description,
            amount: amountInPaise,
            currency: currency,
            period: data.period.toUpperCase(),
            interval: data.interval || 1,
            planType: data.planType,
            isActive: true
        });

        return newPlan;
    },

    // Toggle status
    async togglePlanStatus(id, isActive) {
        return await PlanModel.togglePlanStatus(id, isActive);
    },

    // Get all plans
    async getAllPlans(onlyActive) {
        return await PlanModel.getAllPlans(onlyActive);
    }
};

module.exports = PlanService;
