const prisma = require("../config/db");
const razorpay = require("../config/razorpay");
const crypto = require("crypto");

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
        const { razorpay_subscription_id, razorpay_payment_id, razorpay_signature } = data;

        if (!razorpay_subscription_id) {
            throw new Error('Subscription ID is required');
        }

        // 1. Verify HMAC SHA256 signature if payment ID and signature are present
        if (razorpay_signature && razorpay_payment_id) {
            const secret = process.env.PAYMENT_GATEWAY_KEY_SECRET;
            const generatedSignature = crypto
                .createHmac("sha256", secret)
                .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
                .digest("hex");

            if (generatedSignature !== razorpay_signature) {
                throw new Error("Invalid subscription payment signature");
            }
        }

        let razorpaySub = null;
        try {
            razorpaySub = await razorpay.subscriptions.fetch(razorpay_subscription_id);
        } catch (fetchErr) {
            console.warn("Could not fetch subscription from Razorpay API:", fetchErr.message);
        }

        const validStatuses = ['active', 'authenticated', 'created', 'pending', 'completed'];
        const isStatusAcceptable = razorpaySub?.status && validStatuses.includes(razorpaySub.status.toLowerCase());

        if (isStatusAcceptable || (razorpay_payment_id && razorpay_signature)) {
            const currentCycleStart = razorpaySub?.current_start
                ? new Date(razorpaySub.current_start * 1000)
                : new Date();

            const currentCycleEnd = razorpaySub?.current_end
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
            throw new Error(`Subscription is not active (status: ${razorpaySub?.status || 'unknown'})`);
        }
    },

    async getUpgradeQuote(data) {
        const { userId, targetPlanId, targetPlanType } = data;

        const activeSub = await prisma.subscriptions.findFirst({
            where: { userId, status: "ACTIVE" }
        });

        if (!activeSub) {
            throw new Error("No active subscription found to upgrade");
        }

        const currentPlan = await prisma.plan.findFirst({
            where: {
                OR: [
                    { id: activeSub.planId },
                    { razorpayPlanId: activeSub.planId },
                    { planType: activeSub.planType }
                ]
            }
        });

        const targetPlan = await prisma.plan.findFirst({
            where: {
                OR: [
                    ...(targetPlanId ? [{ id: targetPlanId }, { razorpayPlanId: targetPlanId }] : []),
                    ...(targetPlanType ? [{ planType: targetPlanType }] : [])
                ]
            }
        });

        if (!targetPlan) {
            throw new Error("Target plan not found");
        }

        if (!currentPlan) {
            throw new Error("Current active plan details not found");
        }

        if (currentPlan.id === targetPlan.id || currentPlan.planType === targetPlan.planType) {
            throw new Error("You are already subscribed to this plan");
        }

        const now = new Date();
        const cycleStart = activeSub.currentCycleStart ? new Date(activeSub.currentCycleStart) : new Date(activeSub.createdAt);
        const cycleEnd = activeSub.currentCycleEnd ? new Date(activeSub.currentCycleEnd) : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        const totalCycleMs = Math.max(1, cycleEnd.getTime() - cycleStart.getTime());
        const remainingMs = Math.max(0, cycleEnd.getTime() - now.getTime());

        // Calculate unused credit in paise
        const unusedRatio = remainingMs / totalCycleMs;
        const unusedCreditPaise = Math.round(currentPlan.amount * unusedRatio);

        // Net amount to pay today in paise
        const amountToPayInPaise = Math.max(0, targetPlan.amount - unusedCreditPaise);

        return {
            currentPlan: {
                name: currentPlan.name,
                planType: currentPlan.planType,
                amount: currentPlan.amount / 100,
                currentCycleStart: cycleStart,
                currentCycleEnd: cycleEnd,
            },
            targetPlan: {
                id: targetPlan.id,
                razorpayPlanId: targetPlan.razorpayPlanId,
                name: targetPlan.name,
                planType: targetPlan.planType,
                amount: targetPlan.amount / 100,
                period: targetPlan.period,
            },
            remainingDays: Math.ceil(remainingMs / (1000 * 60 * 60 * 24)),
            unusedCredit: unusedCreditPaise / 100,
            unusedCreditPaise: unusedCreditPaise,
            amountToPayToday: amountToPayInPaise / 100,
            amountToPayInPaise: amountToPayInPaise,
        };
    },

    async createUpgradeOrder(data) {
        const { userId, targetPlanId, targetPlanType } = data;
        const quote = await this.getUpgradeQuote({ userId, targetPlanId, targetPlanType });

        const keyId = process.env.PAYMENT_GATEWAY_KEY_ID;

        // If amount to pay is 0 (e.g. credit completely covers new plan)
        if (quote.amountToPayInPaise <= 0) {
            return {
                isFreeUpgrade: true,
                quote,
                keyId
            };
        }

        const razorpayOrder = await razorpay.orders.create({
            amount: quote.amountToPayInPaise,
            currency: "INR",
            receipt: `upg_${userId.slice(0, 8)}_${Date.now()}`,
            notes: {
                userId,
                targetPlanId: quote.targetPlan.id,
                targetPlanType: quote.targetPlan.planType,
                action: "SUBSCRIPTION_UPGRADE"
            }
        });

        return {
            orderId: razorpayOrder.id,
            amount: quote.amountToPayToday,
            amountInPaise: quote.amountToPayInPaise,
            currency: razorpayOrder.currency,
            quote,
            keyId
        };
    },

    async verifyUpgrade(data) {
        const { userId, razorpay_order_id, razorpay_payment_id, razorpay_signature, targetPlanId, targetPlanType } = data;

        const quote = await this.getUpgradeQuote({ userId, targetPlanId, targetPlanType });

        if (quote.amountToPayInPaise > 0) {
            if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
                throw new Error("Payment verification details missing");
            }

            const secret = process.env.PAYMENT_GATEWAY_KEY_SECRET;
            const generatedSignature = crypto
                .createHmac("sha256", secret)
                .update(`${razorpay_order_id}|${razorpay_payment_id}`)
                .digest("hex");

            if (generatedSignature !== razorpay_signature) {
                throw new Error("Invalid payment signature");
            }
        }

        // Cancel previous Razorpay recurring subscription if exists
        const activeSub = await prisma.subscriptions.findFirst({
            where: { userId, status: "ACTIVE" }
        });

        if (activeSub?.razorpaySubId) {
            try {
                await razorpay.subscriptions.cancel(activeSub.razorpaySubId);
            } catch (err) {
                console.warn("Old subscription cancellation notice:", err.message);
            }
        }

        // Create new Razorpay recurring subscription for upcoming renewal cycles
        const isYearly = quote.targetPlan.planType?.includes("YEARLY");
        let newRazorpaySubId = activeSub?.razorpaySubId || `sub_${Date.now()}`;
        try {
            const newRzpSub = await razorpay.subscriptions.create({
                plan_id: quote.targetPlan.razorpayPlanId,
                total_count: isYearly ? 10 : 100,
                quantity: 1,
                customer_notify: 0
            });
            if (newRzpSub?.id) {
                newRazorpaySubId = newRzpSub.id;
            }
        } catch (subErr) {
            console.warn("Could not pre-create future Razorpay recurring subscription:", subErr.message);
        }

        const now = new Date();
        const durationDays = quote.targetPlan.period === 'yearly' || quote.targetPlan.planType.includes('YEARLY') ? 365 : 30;
        const newCycleEnd = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

        const updatedSub = await prisma.subscriptions.update({
            where: { userId },
            data: {
                razorpaySubId: newRazorpaySubId,
                planId: quote.targetPlan.razorpayPlanId || quote.targetPlan.id,
                planType: quote.targetPlan.planType,
                status: "ACTIVE",
                currentCycleStart: now,
                currentCycleEnd: newCycleEnd,
                cancelAtPeriodEnd: false
            }
        });

        return updatedSub;
    }
};

module.exports = SubscriptionModel;