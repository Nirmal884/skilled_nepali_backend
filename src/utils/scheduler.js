const { startJobExpiryCron } = require("../jobs/jobexpiryCron");

module.exports.initSchedulers = () => {
    startJobExpiryCron();
    console.log("[SCHEDULER]: Schedulers Initialized")
}