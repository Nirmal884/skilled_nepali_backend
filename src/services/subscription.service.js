const SubscriptionModel = require("../models/subscription.model")

const SubsciptionService = {
    async createSubscription(data) {
        const { subData, keyId, razorpaySubId } = await SubscriptionModel.createSubscription(data)
        return { subData, keyId, razorpaySubId }
    },

    async verifySubscription(data) {
        const updatedSub = await SubscriptionModel.verifySubscription(data);
        return updatedSub;
    }
}

module.exports = SubsciptionService