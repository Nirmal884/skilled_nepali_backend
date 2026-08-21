const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            success: false,
            statusCode: 401,
            message: "Authentication required"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("JWT Verification Error:", error);
        return res.status(401).json({
            success: false,
            statusCode: 401,
            message: "Invalid or expired token"
        });
    }
};

const optionalAuthenticate = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
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
