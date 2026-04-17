const JobModel = require("../models/job.model")

const JobService = {
    async createJob(data) {
        const { jobData, isUpdated } = await JobModel.createJob(data)
        return { jobResponse: jobData, message: isUpdated ? "Job updated successfully" : "Job created successfully" }
    },

    async getJobById(jobId) {
        const job = await JobModel.getJobById(jobId)
        if (!job) throw new Error("Job not found")
        return job
    },

    async listAllJobs(userId, status, page, limit) {
        const { jobs, totalJobs } = await JobModel.listAllJobs(userId, status, Number(page), Number(limit))
        return { jobs, totalJobs, message: "Jobs fetched successfully" }
    },

    async listJobForDashboard(page, limit, userId) {
        const { jobs, totalJobs, activeJobs, pendingJobs } = await JobModel.listJobForDashboard(Number(page), Number(limit), userId)
        return { jobs, totalJobs, activeJobs, pendingJobs, message: "Jobs fetched successfully" }
    },

    async adminApproveJob(jobId, status) {
        const jobResponse = await JobModel.adminApproveJob(jobId, status)
        return { jobResponse, message: "Job approved successfully" }
    }
}

module.exports = JobService;