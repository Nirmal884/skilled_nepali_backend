const cron = require('node-cron');
const prisma = require('../config/db');

module.exports.startCleanupTokensCron = () => {
    // Run every day at 03:00 AM
    cron.schedule('0 3 * * *', async () => {
        try {
            const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const { count } = await prisma.refreshToken.deleteMany({
                where: {
                    OR: [
                        { expiresAt: { lt: new Date() } },
                        { revokedAt: { lt: cutoffDate } }
                    ]
                }
            });
            if (count > 0) {
                console.log(`[CRON] Cleaned up ${count} expired or revoked refresh tokens.`);
            }
        } catch (error) {
            console.error('[CRON ERROR]: Failed to clean up refresh tokens:', error.message);
        }
    });
};
