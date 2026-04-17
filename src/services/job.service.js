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
    },

    async deleteJobRequest(jobId, reason) {
        const jobResponse = await JobModel.deleteJobRequest(jobId, reason)
        return { jobResponse, message: "Job deletion request sent successfully" }
    },

    async listDeleteRequestedJobs(page, limit) {
        const { jobs, totalJobs } = await JobModel.listDeleteRequestedJobs(page, limit)
        return { jobs, totalJobs, message: "Delete requested jobs fetched successfully" }
    },

    async approveDeletion(jobId) {
        const jobResponse = await JobModel.approveDeletion(jobId)
        return { jobResponse, message: "Job deletion approved successfully" }
    },

    async cancelDeletionRequest(jobId) {
        const jobResponse = await JobModel.cancelDeletionRequest(jobId)
        return { jobResponse, message: "Job deletion request cancelled successfully" }
    }
}

module.exports = JobService;