const Razorpay = require("razorpay");

const razorpay = new Razorpay({
    key_id: process.env.PAYMENT_GATEWAY_KEY_ID,
    key_secret: process.env.PAYMENT_GATEWAY_KEY_SECRET
})

module.exports = razorpay;