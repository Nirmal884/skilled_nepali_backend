const cron = require('node-cron');
const { expirePastDeadlineJob } = require('../services/job.service');


module.exports.startJobExpiryCron = () => {
    cron.schedule('0 0 * * *', async () => {
        console.log('Job Expiry Cron', new Date().toTimeString());
        try {
            const { result: count } = await expirePastDeadlineJob();
            console.log(`[CRON] Successfully expired ${count} jobs.`);
        } catch (error) {
            console.log('[CRON ERROR]: Failed to expire job', error)
        }
    })
}