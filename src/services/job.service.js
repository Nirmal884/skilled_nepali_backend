const { gccCountryOptions } = require("../data/countryData")
const JobModel = require("../models/job.model")
const ExcelJS = require("exceljs")

const JobService = {
    async createJob(data) {
        const prisma = require("../config/db");
        const user = await prisma.user.findUnique({ where: { id: data.userId } });
        if (!user) {
            throw new Error("User not found");
        }
        if (!user.isAdminApproved) {
            throw new Error("Forbidden: Your account must be approved by the admin to post jobs");
        }
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

    async updateJobApplicationStatus(applicationId, status) {
        const updatedApplication = await JobModel.updateJobApplicationStatus(applicationId, status)
        return { updatedApplication, message: "Application status updated successfully" }
    },

    async listJobApplicaton(userId, page, limit, search, status, employerId) {
        const { jobAplication, count, inReviewCount, shortlistCount, rejectedCount } = await JobModel.listJobApplicaton(userId, Number(page), Number(limit), search, status, employerId)
        return { jobAplication, count, inReviewCount, shortlistCount, rejectedCount, message: "Job applications fetched successfully" }
    },

    // for web
    async listAllApprovedJobs(page, limit, search, isUrgent, freshersOnly, countryArray, jobCategoryArray, experienceArray, jobTypeArray, isRecommended, userId) {
        const { jobs, totalJobs } = await JobModel.listAllApprovedJobs(Number(page), Number(limit), search, isUrgent, freshersOnly, countryArray, jobCategoryArray, experienceArray, jobTypeArray, isRecommended, userId)
        return { jobs, totalJobs, message: "Jobs fetched successfully" }
    },

    async fetchJobById(jobId, userId) {
        const job = await JobModel.fetchJobById(jobId, userId)
        const countryName = await gccCountryOptions.find((item) => item.value === job.country)
        if (!job) throw new Error("Job not found")
        return { job, countryName }
    },

    //expire jobs wich past deadline
    async expirePastDeadlineJob() {
        const result = await JobModel.expirePastDeadlineJob()
        return { result, message: "Jobs expired successfully" }
    },

    async applyJob(userId, jobId) {
        const jobApplication = await JobModel.applyJob(userId, jobId)
        return { jobApplication, message: "Job applied successfully" }
    },

    async downloadAppliedJobsExcel(userId, search, status, employerId) {
        const jobApplications = await JobModel.downloadAppliedJobsExcel(userId, search, status, employerId);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Applications');

        worksheet.columns = [
            { header: 'SI NO', key: 'sl', width: 10, alignment: { horizontal: 'center' } },
            { header: 'Applicant Name', key: 'applicantName', width: 30 },
            { header: 'Phone', key: 'phone', width: 20 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Position', key: 'position', width: 35 },
            { header: 'Applied Date', key: 'appliedDate', width: 25 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'CV URL', key: 'cvUrl', width: 50 }
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '499A13' },
            color: { argb: 'FFFFFF' },
        };

        jobApplications.forEach((app, index) => {
            worksheet.addRow({
                sl: index + 1,
                applicantName: app.user?.fullName || '',
                phone: app.user?.phone || '',
                email: app.user?.email || '',
                position: app.job?.title || '',
                appliedDate: new Date(app.createdAt).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                }).toLowerCase(),
                status: app.status,
                cvUrl: app.resume || ''
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        return { buffer, message: "Excel sheet generated successfully" };
    }
}

module.exports = JobService;