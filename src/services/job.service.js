const { gccCountryOptions } = require("../data/countryData")
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
        const { jobs, totalJobs, activeJobs, pendingJobs, totalJobApplications, todaysApplications } = await JobModel.listJobForDashboard(Number(page), Number(limit), userId)
        return { jobs, totalJobs, activeJobs, pendingJobs, totalJobApplications, todaysApplications, message: "Jobs fetched successfully" }
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
    },

    async listJobApplicaton(userId, page, limit, search, status, employerId) {
        const { jobAplication, count } = await JobModel.listJobApplicaton(userId, Number(page), Number(limit), search, status, employerId)
        return { jobAplication, count, message: "Job applications fetched successfully" }
    },

    // for web
    async listAllApprovedJobs(page, limit, search, isUrgent, freshersOnly, countryArray, jobCategoryArray, experienceArray, jobTypeArray) {
        const { jobs, totalJobs } = await JobModel.listAllApprovedJobs(Number(page), Number(limit), search, isUrgent, freshersOnly, countryArray, jobCategoryArray, experienceArray, jobTypeArray)
        return { jobs, totalJobs, message: "Jobs fetched successfully" }
    },

    async fetchJobById(jobId, userId) {
        const job = await JobModel.fetchJobById(jobId, userId)
        const countryName = await gccCountryOptions.find((item) => item.value === job.country)
        if (!job) throw new Error("Job not found")
        return { job, countryName }
    },

    async applyJob(userId, jobId) {
        const jobApplication = await JobModel.applyJob(userId, jobId)
        return { jobApplication, message: "Job applied successfully" }
    }
}

module.exports = JobService;