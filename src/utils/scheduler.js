const { startJobExpiryCron } = require("../jobs/jobexpiryCron");
const { startCleanupTokensCron } = require("../jobs/cleanupTokensCron");
const { expirePastDeadlineJob } = require("../services/job.service");

module.exports.initSchedulers = async () => {
    try {
        const { result: missedCount } = await expirePastDeadlineJob();
        console.log(`[STARTUP] Catch-up complete. Processed ${missedCount} jobs.`);
    } catch (error) {
        console.log("[SCHEDULER]: Error initializing schedulers", error)
    }

    startJobExpiryCron();
    startCleanupTokensCron();
}