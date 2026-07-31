const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const prisma = require('../config/db')


router.post('/razorpay', async (req, res) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const razorpaySignature = req.headers['x-razorpay-signature'];

        // 1. Verify Webhook Signature for Security
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(req.body)
            .digest('hex');

        if (expectedSignature !== razorpaySignature) {
            console.error('Invalid Webhook Signature');
            return res.status(400).json({ status: 'failure', message: 'Invalid signature' });
        }

        // 2. Parse the verified payload
        const event = JSON.parse(req.body.toString());
        const eventType = event.event;

        console.log(`Received Razorpay Webhook Event: ${eventType}`);

        // 3. Handle Subscription Events
        switch (eventType) {
            case 'subscription.authenticated':
            case 'subscription.activated':
            case 'subscription.charged': {
                const subEntity = event.payload.subscription.entity;

                // Convert Unix timestamps (seconds) to JavaScript Date objects
                const currentCycleStart = subEntity.current_start
                    ? new Date(subEntity.current_start * 1000)
                    : new Date();

                const currentCycleEnd = subEntity.current_end
                    ? new Date(subEntity.current_end * 1000)
                    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

                // Update Subscription in DB
                await prisma.subscriptions.update({
                    where: { razorpaySubId: subEntity.id },
                    data: {
                        status: 'ACTIVE',
                        currentCycleStart: currentCycleStart,
                        currentCycleEnd: currentCycleEnd,
                    },
                });
                break;
            }

            case 'subscription.halted':
            case 'subscription.cancelled': {
                const subEntity = event.payload.subscription.entity;

                await prisma.subscriptions.update({
                    where: { razorpaySubId: subEntity.id },
                    data: {
                        status: 'CANCELLED',
                    },
                });
                break;
            }

            default:
                console.log(`Unhandled event type: ${eventType}`);
        }

        // Always acknowledge receipt to Razorpay with a 200 OK
        return res.status(200).json({ status: 'ok' });

    } catch (error) {
        console.error('Webhook processing error:', error);
        return res.status(500).json({ message: 'Webhook handler failed' });
    }
});

module.exports = router;
