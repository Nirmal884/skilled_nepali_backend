const SubscriptionService = require("../services/subscription.service");

const SubscriptionController = {
    async createSubscription(req, res) {
        try {
            const { planId, planType, total_count } = req.body;
            const userId = req.user?.id;
            if (!userId || !planId || !planType) {
                throw new Error("Please provide all the required fields");
            }
            const { subData, keyId, razorpaySubId } = await SubscriptionService.createSubscription({
                userId,
                planId,
                planType,
                total_count
            });
            return res.status(201).json({
                success: true,
                statusCode: 201,
                message: "Subscription created successfully",
                data: { subData, keyId, razorpaySubId }
            });
        } catch (error) {
            console.log("subscription:", error);
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
            const { razorpay_subscription_id, razorpay_payment_id, razorpay_signature } = req.body;
            if (!razorpay_subscription_id) {
                throw new Error("Please provide subscription ID");
            }
            const updatedSub = await SubscriptionService.verifySubscription({
                razorpay_subscription_id,
                razorpay_payment_id,
                razorpay_signature
            });
            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: "Subscription verified successfully",
                data: updatedSub
            });
        } catch (error) {
            console.log("subscription:", error);
            return res.status(500).json({
                success: false,
                statusCode: 500,
                message: "Failed to verify subscription",
                error: error.message
            });
        }
    },

    async getUpgradeQuote(req, res) {
        try {
            const userId = req.user?.id;
            const { targetPlanId, targetPlanType } = req.body;
            if (!userId) {
                return res.status(401).json({ success: false, statusCode: 401, message: "Unauthorized" });
            }
            const quote = await SubscriptionService.getUpgradeQuote({
                userId,
                targetPlanId,
                targetPlanType
            });
            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: "Upgrade quote calculated successfully",
                data: quote
            });
        } catch (error) {
            console.error("upgrade quote error:", error);
            return res.status(400).json({
                success: false,
                statusCode: 400,
                message: error.message || "Failed to calculate upgrade quote",
                error: error.message
            });
        }
    },

    async createUpgradeOrder(req, res) {
        try {
            const userId = req.user?.id;
            const { targetPlanId, targetPlanType } = req.body;
            if (!userId) {
                return res.status(401).json({ success: false, statusCode: 401, message: "Unauthorized" });
            }
            const orderData = await SubscriptionService.createUpgradeOrder({
                userId,
                targetPlanId,
                targetPlanType
            });
            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: "Upgrade order created successfully",
                data: orderData
            });
        } catch (error) {
            console.error("create upgrade order error:", error);
            return res.status(400).json({
                success: false,
                statusCode: 400,
                message: error.message || "Failed to create upgrade order",
                error: error.message
            });
        }
    },

    async verifyUpgrade(req, res) {
        try {
            const userId = req.user?.id;
            const {
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                targetPlanId,
                targetPlanType
            } = req.body;

            if (!userId) {
                return res.status(401).json({ success: false, statusCode: 401, message: "Unauthorized" });
            }

            const updatedSub = await SubscriptionService.verifyUpgrade({
                userId,
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                targetPlanId,
                targetPlanType
            });

            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: "Subscription upgraded successfully",
                data: updatedSub
            });
        } catch (error) {
            console.error("verify upgrade error:", error);
            return res.status(400).json({
                success: false,
                statusCode: 400,
                message: error.message || "Failed to verify upgrade",
                error: error.message
            });
        }
    }
};

module.exports = SubscriptionController;