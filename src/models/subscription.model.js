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
            customer_notify: 0
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
    },

    async verifySubscription(data) {
        const { razorpay_subscription_id } = data;

        if (!razorpay_subscription_id) {
            throw new Error('Subscription ID is required');
        }

        const razorpaySub = await razorpay.subscriptions.fetch(razorpay_subscription_id);

        if (!razorpaySub) {
            throw new Error('Subscription not found');
        }

        if (razorpaySub.status === 'active' || razorpaySub.status === 'authenticated') {
            const currentCycleStart = razorpaySub.current_start
                ? new Date(razorpaySub.current_start * 1000)
                : new Date();

            const currentCycleEnd = razorpaySub.current_end
                ? new Date(razorpaySub.current_end * 1000)
                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

            const updateSub = await prisma.subscriptions.update({
                where: { razorpaySubId: razorpay_subscription_id },
                data: {
                    status: 'ACTIVE',
                    currentCycleStart: currentCycleStart,
                    currentCycleEnd: currentCycleEnd
                }
            });

            return updateSub;
        } else {
            throw new Error('Subscription is not active');
        }
    }
};

module.exports = SubscriptionModel;