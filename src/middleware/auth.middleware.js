const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const token = req.cookies.token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);
    const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;

    if (!token) {
        return res.status(401).json({
            success: false,
            statusCode: 401,
            code: "AUTH_REQUIRED",
            message: "Authentication required"
        });
    }

    try {
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                statusCode: 401,
                code: "TOKEN_EXPIRED",
                message: "Access token expired"
            });
        }

        console.error("JWT Verification Error:", error.message);
        return res.status(401).json({
            success: false,
            statusCode: 401,
            code: "INVALID_TOKEN",
            message: "Invalid token"
        });
    }
};

const optionalAuthenticate = (req, res, next) => {
    const token = req.cookies.token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);
    const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;

    if (!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    } catch (error) {
        console.log("Invalid token:", error.message);
        next();
    }
};

const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                statusCode: 403,
                message: "Forbidden: Access denied"
            });
        }
        next();
    };
};

const blockImpersonatedSession = (req, res, next) => {
    if (req.user && req.user.isImpersonated) {
        return res.status(403).json({
            success: false,
            statusCode: 403,
            message: "Action forbidden: High-security operations are blocked during impersonation."
        });
    }
    next();
};

module.exports = { authenticate, optionalAuthenticate, authorize, blockImpersonatedSession };
