const prisma = require("../config/db");
const razorpay = require("../config/razorpay");

const SubscriptionModel = {
    async createSubscription(data) {
        const keyId = process.env.PAYMENT_GATEWAY_KEY_ID;

        const existingSub = await prisma.subscriptions.findUnique({
            where: { userId: data.userId }
        });

        if (existingSub && existingSub.status === "ACTIVE") {
            throw new Error("User already has an active subscription.");
        }
        const isYearly = data?.planType?.includes('YEARLY');

        const razorpaySubscription = await razorpay.subscriptions.create({
            plan_id: data?.planId,
            total_count: isYearly ? 10 : 100,
            quantity: 1,
            customer_notify: 1
        });

        console.log(razorpaySubscription, "RZP_Payment details *****")

        const subData = await prisma.subscriptions.upsert({
            where: { userId: data.userId },
            update: {
                razorpaySubId: razorpaySubscription.id,
                planId: data.planId,
                planType: data.planType,
                status: "CREATED",
                cancelAtPeriodEnd: false,
                currentCycleStart: null,
                currentCycleEnd: null,
            },
            create: {
                userId: data.userId,
                razorpaySubId: razorpaySubscription.id,
                planId: data.planId,
                planType: data.planType,
                status: "CREATED",
                cancelAtPeriodEnd: false,
                currentCycleStart: null,
                currentCycleEnd: null,
            }
        });

        return { subData, keyId, razorpaySubId: razorpaySubscription.id };
    }
};

module.exports = SubscriptionModel;