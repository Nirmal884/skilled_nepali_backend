const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 30;
const REFRESH_TOKEN_EXPIRY_MS = REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

class TokenService {

    static hashToken(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }

    static buildAccessPayload(user) {
        return {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.fullName || user.name,
            companyName: user.companyName,
            companyLogo: user.companyLogo,
            centreName: user.centreName,
            centreLogo: user.centreLogo,
            resume: user.resume,
        };
    }

    static signAccessToken(payload) {
        const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
        return jwt.sign(payload, secret, { expiresIn: ACCESS_TOKEN_EXPIRY });
    }

    static async generateTokens(user, { userAgent = '', ipAddress = '' } = {}) {
        const payload = this.buildAccessPayload(user);
        const accessToken = this.signAccessToken(payload);

        const rawRefreshToken = crypto.randomBytes(40).toString('hex');
        const tokenHash = this.hashToken(rawRefreshToken);
        const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);

        await prisma.refreshToken.create({
            data: {
                tokenHash,
                userId: user.id,
                expiresAt,
                userAgent: userAgent ? String(userAgent).slice(0, 500) : null,
                ipAddress: ipAddress ? String(ipAddress).slice(0, 100) : null,
            }
        });

        return {
            accessToken,
            rawRefreshToken,
            accessCookieOptions: this.getAccessCookieOptions(),
            refreshCookieOptions: this.getRefreshCookieOptions(),
        };
    }

    static async rotateRefreshToken(rawToken, { userAgent = '', ipAddress = '' } = {}) {
        if (!rawToken) {
            const error = new Error('Refresh token is required');
            error.statusCode = 401;
            error.code = 'REFRESH_TOKEN_REQUIRED';
            throw error;
        }

        const tokenHash = this.hashToken(rawToken);

        const existingToken = await prisma.refreshToken.findUnique({
            where: { tokenHash },
            include: { user: true }
        });

        if (!existingToken) {
            const error = new Error('Invalid refresh token');
            error.statusCode = 401;
            error.code = 'INVALID_REFRESH_TOKEN';
            throw error;
        }

        // Reuse detection: If token was already revoked or replaced, revoke all tokens for this user
        if (existingToken.revokedAt || existingToken.replacedBy) {
            console.warn(`[SECURITY ALERT]: Refresh token reuse detected for user ${existingToken.userId}`);
            await this.revokeAllUserTokens(existingToken.userId);
            const error = new Error('Compromised refresh token detected. All sessions terminated.');
            error.statusCode = 401;
            error.code = 'REFRESH_TOKEN_REUSE_DETECTED';
            throw error;
        }

        // Check expiration
        if (new Date() > existingToken.expiresAt) {
            await prisma.refreshToken.update({
                where: { id: existingToken.id },
                data: { revokedAt: new Date() }
            });
            const error = new Error('Refresh token has expired');
            error.statusCode = 401;
            error.code = 'REFRESH_TOKEN_EXPIRED';
            throw error;
        }

        // Validate user is active
        const user = existingToken.user;
        if (!user || user.deletedAt) {
            const error = new Error('User no longer exists or has been deactivated');
            error.statusCode = 401;
            error.code = 'USER_NOT_FOUND';
            throw error;
        }

        // Generate new refresh token
        const newRawRefreshToken = crypto.randomBytes(40).toString('hex');
        const newTokenHash = this.hashToken(newRawRefreshToken);
        const newExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);

        // Transaction: mark old as replaced, create new token
        await prisma.$transaction([
            prisma.refreshToken.update({
                where: { id: existingToken.id },
                data: {
                    revokedAt: new Date(),
                    replacedBy: newTokenHash,
                }
            }),
            prisma.refreshToken.create({
                data: {
                    tokenHash: newTokenHash,
                    userId: user.id,
                    expiresAt: newExpiresAt,
                    userAgent: userAgent ? String(userAgent).slice(0, 500) : null,
                    ipAddress: ipAddress ? String(ipAddress).slice(0, 100) : null,
                }
            })
        ]);

        const payload = this.buildAccessPayload(user);
        const newAccessToken = this.signAccessToken(payload);

        return {
            accessToken: newAccessToken,
            rawRefreshToken: newRawRefreshToken,
            user,
            accessCookieOptions: this.getAccessCookieOptions(),
            refreshCookieOptions: this.getRefreshCookieOptions(),
        };
    }

    /**
     * Revoke single refresh token on logout
     */
    static async revokeRefreshToken(rawToken) {
        if (!rawToken) return;
        const tokenHash = this.hashToken(rawToken);
        try {
            await prisma.refreshToken.updateMany({
                where: { tokenHash, revokedAt: null },
                data: { revokedAt: new Date() }
            });
        } catch (error) {
            console.error('Error revoking refresh token:', error);
        }
    }

    /**
     * Revoke all refresh tokens for a user (password reset, account deletion, security events)
     */
    static async revokeAllUserTokens(userId) {
        if (!userId) return;
        try {
            await prisma.refreshToken.updateMany({
                where: { userId, revokedAt: null },
                data: { revokedAt: new Date() }
            });
        } catch (error) {
            console.error('Error revoking all user tokens:', error);
        }
    }

    /**
     * Standard cookie options for access token
     */
    static getAccessCookieOptions() {
        return {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
            maxAge: 15 * 60 * 1000, // 15 minutes
            path: '/',
        };
    }

    /**
     * Standard cookie options for refresh token
     */
    static getRefreshCookieOptions() {
        return {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
            maxAge: REFRESH_TOKEN_EXPIRY_MS, // 30 days
            path: '/api/v1/refresh-token',
        };
    }
}

module.exports = TokenService;
