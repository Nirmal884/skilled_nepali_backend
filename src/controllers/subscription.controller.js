const SubsciptionService = require("../services/subscription.service");

const SubscriptionController = {
    async createSubscription(req, res) {
        try {
            const { planId, planType, total_count } = req.body;
            const userId = req.user.id;
            if (!userId || !planId || !planType) {
                throw new Error("Please provide all the required fields");
            }
            const { subData, keyId, razorpaySubId } = await SubsciptionService.createSubscription({
                userId,
                planId,
                planType,
                total_count
            })
            return res.status(201).json({
                success: true,
                statusCode: 201,
                message: "Subscription created successfully",
                data: { subData, keyId, razorpaySubId }
            });
        } catch (error) {
            console.log("subscription:", error)
            return res.status(500).json({
                success: false,
                statusCode: 500,
                message: "Failed to create subscription",
                error: error.message
            });
        }
    },

    async verifySubscription(req, res) {
        try {
            const { razorpay_subscription_id } = req.body;
            if (!razorpay_subscription_id) {
                throw new Error("Please provide subscription ID");
            }
            const updatedSub = await SubsciptionService.verifySubscription({ razorpay_subscription_id });
            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: "Subscription verified successfully",
                data: updatedSub
            });
        } catch (error) {
            console.log("subscription:", error)
            return res.status(500).json({
                success: false,
                statusCode: 500,
                message: "Failed to verify subscription",
                error: error.message
            });
        }
    }
}

module.exports = SubscriptionController