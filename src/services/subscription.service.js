const SubscriptionModel = require("../models/subscription.model");

const SubscriptionService = {
    async createSubscription(data) {
        const { subData, keyId, razorpaySubId } = await SubscriptionModel.createSubscription(data);
        return { subData, keyId, razorpaySubId };
    },

    async verifySubscription(data) {
        const updatedSub = await SubscriptionModel.verifySubscription(data);
        return updatedSub;
    },

    async getUpgradeQuote(data) {
        return await SubscriptionModel.getUpgradeQuote(data);
    },

    async createUpgradeOrder(data) {
        return await SubscriptionModel.createUpgradeOrder(data);
    },

    async verifyUpgrade(data) {
        return await SubscriptionModel.verifyUpgrade(data);
    }
};

module.exports = SubscriptionService;