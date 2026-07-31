const SubscriptionModel = require("../models/subscription.model")

const SubsciptionService = {
    async createSubscription(data) {
        const { subData, keyId, razorpaySubId } = await SubscriptionModel.createSubscription(data)
        return { subData, keyId, razorpaySubId }
    }
}

module.exports = SubsciptionService