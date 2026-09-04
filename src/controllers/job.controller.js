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
            const statusCode = error.statusCode || 500;
            return res.status(statusCode).json({
                success: false,
                statusCode: statusCode,
                code: error.code,
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
            const { jobs, totalJobs, activeJobs, pendingJobs, totalJobApplications, todaysApplications, message } = await JobService.listJobForDashboard(Number(page), Number(limit), userId)
            return res.status(200).json({
                success: true,
                statusCode: 200,
                data: jobs,
                totalJobs: totalJobs,
                activeJobs: activeJobs,
                pendingJobs: pendingJobs,
                totalJobApplications: totalJobApplications,
                todaysApplications: todaysApplications,
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
    },

    async listJobApplicaton(req, res) {
        try {
            const { page, limit, userId, search, status, employerId } = req.query;
            const statusFilter = status || req.query['status[]'];
            const { jobAplication, count, inReviewCount, shortlistCount, rejectedCount, message } = await JobService.listJobApplicaton(userId, Number(page), Number(limit), search, statusFilter, employerId)
            return res.status(200).json({
                success: true,
                statusCode: 200,
                data: jobAplication,
                count: count,
                inReviewCount: inReviewCount,
                shortlistCount: shortlistCount,
                rejectedCount: rejectedCount,
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

    async updateJobApplicationStatus(req, res) {
        try {
            const { applicationId, status } = req.body;
            const { updatedApplication, message } = await JobService.updateJobApplicationStatus(applicationId, status)
            return res.status(200).json({
                success: true,
                statusCode: 200,
                data: updatedApplication,
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

    // for web
    async listAllApprovedJobs(req, res) {
        try {
            const { page, limit, search, isUrgent, freshersOnly, isRecommended, "countries[]": countryArray, "jobCategories[]": jobCategoryArray, "experience[]": experienceArray, "jobType[]": jobTypeArray } = req.query;
            const userId = req.user?.id;
            const { jobs, totalJobs, message } = await JobService.listAllApprovedJobs(Number(page), Number(limit), search, isUrgent, freshersOnly, countryArray, jobCategoryArray, experienceArray, jobTypeArray, isRecommended, userId)
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

    async fetchJobById(req, res) {
        try {
            const { jobId } = req.params;
            const userId = req.user?.id;
            const { job, countryName } = await JobService.fetchJobById(jobId, userId)
            return res.status(200).json({
                success: true,
                statusCode: 200,
                data: { ...job, countryName: countryName.label },
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

    async applyJob(req, res) {
        try {
            const { jobId } = req.body;
            const userId = req.user.id;
            const { jobApplication, message } = await JobService.applyJob(userId, jobId)
            return res.status(200).json({
                success: true,
                statusCode: 200,
                data: jobApplication,
                message: message
            })
        } catch (error) {
            if (error.code === "PROFILE_INCOMPLETE") {
                return res.status(400).json({
                    success: false,
                    statusCode: 400,
                    message: error.message,
                    missingFields: error.missingFields
                });
            }

            if (error.code === "ALREADY_APPLIED") {
                return res.status(400).json({
                    success: false,
                    statusCode: 400,
                    message: error.message,
                });
            }

            console.log("Error:", error)
            return res.status(500).json({
                success: false,
                statusCode: 500,
                message: error?.message || "Internal server error"
            })
        }
    },

    async downloadAppliedJobsExcel(req, res) {
        try {
            const { userId, search, status, employerId } = req.query;
            const statusFilter = status || req.query['status[]'];

            const { buffer } = await JobService.downloadAppliedJobsExcel(userId, search, statusFilter, employerId);

            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            res.setHeader(
                'Content-Disposition',
                'attachment; filename=applied-jobs.xlsx'
            );

            return res.status(200).send(buffer);
        } catch (error) {
            console.error('Error downloading job applications excel:', error);
            return res.status(500).json({
                success: false,
                statusCode: 500,
                message: error?.message || "Internal server error"
            });
        }
    }
}

module.exports = JobController;