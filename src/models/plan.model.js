const prisma = require("../config/db");

const PlanModel = {
    // Create new plan
    async createPlan(data) {
        return await prisma.plan.create({
            data: {
                razorpayPlanId: data.razorpayPlanId,
                name: data.name,
                description: data.description || null,
                amount: data.amount,
                currency: data.currency || "INR",
                period: data.period,
                interval: data.interval || 1,
                planType: data.planType,
                isActive: data.isActive !== undefined ? data.isActive : true,
            }
        });
    },

    // Find plan by database ID
    async findPlanById(id) {
        return await prisma.plan.findUnique({
            where: { id }
        });
    },

    // Find plan by Razorpay plan ID
    async findPlanByRazorpayId(razorpayPlanId) {
        return await prisma.plan.findUnique({
            where: { razorpayPlanId }
        });
    },

    // Toggle plan active/inactive status
    async togglePlanStatus(id, isActive) {
        return await prisma.plan.update({
            where: { id },
            data: { isActive }
        });
    },

    // Get all plans
    async getAllPlans(onlyActive = false) {
        const whereClause = onlyActive ? { isActive: true } : {};
        return await prisma.plan.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" }
        });
    }
};

module.exports = PlanModel;
