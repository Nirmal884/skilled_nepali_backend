const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    skipSuccessfulRequests: true,
    handler: (req, res, next, options) => {
        return res.status(options.statusCode).json({
            success: false,
            statusCode: options.statusCode,
            message: options.message.message || options.message
        });
    },
    message: {
        status: 429,
        message: "Too many login attempts from this IP, please try again after 15 minutes"
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = loginLimiter;