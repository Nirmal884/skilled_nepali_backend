const JobService = require("../services/job.service");

const JobController = {
    async createJob(req, res) {
        try {
            const data = req.body;
            const { jobResponse, message } = await JobService.createJob(data)
            return res.status(200).json({
                success: true,
                data: jobResponse,
                message: message
            })
        } catch (error) {
            console.log("Error:", error)
            return res.status(500).json({
                success: false,
                message: error?.message || "Internal server error"
            })
        }
    },

    async listAllJobs(req, res) {
        try {
            const { userId, status, page, limit } = req.query;
            const { jobs, totalJobs, message } = await JobService.listAllJobs(userId, status, page, limit)
            return res.status(200).json({
                success: true,
                statusCode: 200,
                data: jobs,
                count: totalJobs,
                message: message
            })
        } catch (error) {
            console.log("Error:", error)
            return res.status(500).json({
                success: false,
                statusCode: 500,
                message: error?.message || "Internal server error"
            })
        }
    },

    async listJobForDashboard(req, res) {
        try {
            const { page, limit, userId } = req.query;
            const { jobs, totalJobs, activeJobs, pendingJobs, message } = await JobService.listJobForDashboard(Number(page), Number(limit), userId)
            return res.status(200).json({
                success: true,
                statusCode: 200,
                data: jobs,
                totalJobs: totalJobs,
                activeJobs: activeJobs,
                pendingJobs: pendingJobs,
                message: message
            })
        } catch (error) {
            console.log("Error:", error)
            return res.status(500).json({
                success: false,
                statusCode: 500,
                message: error?.message || "Internal server error"
            })
        }
    },

    async adminApproveJob(req, res) {
        try {
            const { jobId, status } = req.body;
            const { jobResponse, message } = await JobService.adminApproveJob(jobId, status)
            return res.status(200).json({
                success: true,
                statusCode: 200,
                data: jobResponse,
                message: message
            })
        } catch (error) {
            console.log("Error:", error)
            return res.status(500).json({
                success: false,
                statusCode: 500,
                message: error?.message || "Internal server error"
            })
        }
    },

    async getJobById(req, res) {
        try {
            const { id } = req.params;
            const job = await JobService.getJobById(id);
            return res.status(200).json({
                success: true,
                statusCode: 200,
                data: job,
                message: "Job fetched successfully"
            })
        } catch (error) {
            console.log("Error:", error)
            return res.status(500).json({
                success: false,
                statusCode: 500,
                message: error?.message || "Internal server error"
            })
        }
    },

    async deleteJobRequest(req, res) {
        try {
            const { jobId, reason } = req.body;
            const { jobResponse, message } = await JobService.deleteJobRequest(jobId, reason)
            return res.status(200).json({
                success: true,
                statusCode: 200,
                data: jobResponse,
                message: message
            })
        } catch (error) {
            console.log("Error:", error)
            return res.status(500).json({
                success: false,
                statusCode: 500,
                message: error?.message || "Internal server error"
            })
        }
    },

    async listDeleteRequestedJobs(req, res) {
        try {
            const { page, limit } = req.query;
            const { jobs, totalJobs, message } = await JobService.listDeleteRequestedJobs(Number(page), Number(limit))
            return res.status(200).json({
                success: true,
                statusCode: 200,
                data: jobs,
                count: totalJobs,
                message: message
            })
        } catch (error) {
            console.log("Error:", error)
            return res.status(500).json({
                success: false,
                statusCode: 500,
                message: error?.message || "Internal server error"
            })
        }
    },

    async approveDeletion(req, res) {
        try {
            const { jobId } = req.body;
            const { jobResponse, message } = await JobService.approveDeletion(jobId)
            return res.status(200).json({
                success: true,
                statusCode: 200,
                data: jobResponse,
                message: message
            })
        } catch (error) {
            console.log("Error:", error)
            return res.status(500).json({
                success: false,
                statusCode: 500,
                message: error?.message || "Internal server error"
            })
        }
    },

    async cancelDeletionRequest(req, res) {
        try {
            const { jobId } = req.body;
            const { jobResponse, message } = await JobService.cancelDeletionRequest(jobId)
            return res.status(200).json({
                success: true,
                statusCode: 200,
                data: jobResponse,
                message: message
            })
        } catch (error) {
            console.log("Error:", error)
            return res.status(500).json({
                success: false,
                statusCode: 500,
                message: error?.message || "Internal server error"
            })
        }
    }
}

module.exports = JobController;