const prisma = require("../config/db")

const JobModel = {
    async createJob(data) {
        const filteredData = {
            title: data.title,
            type: data.type,
            country: data.country,
            location: data.location,
            minSalary: Number(data.minSalary) || 0,
            maxSalary: Number(data.maxSalary) || 0,
            currency: data.currency,
            experience: data.experience,
            description: data.description,
            requirements: data.requirements,
            benefits: data.benefits,
            responsibilities: data.responsibilities,
            deadLine: data.deadLine ? new Date(data.deadLine) : null,
            isUrgent: data.isUrgent,
            noOfOpenings: Number(data.noOfOpenings) || 1,
            userId: data.userId,
            jobCategoryId: data.jobCategoryId,
        }

        if (data.jobId) {
            const updatedJob = await prisma.jobs.update({
                where: {
                    id: data.jobId
                },
                data: { ...filteredData, adminApprovalStatus: "PENDING" }
            })
            return { jobData: updatedJob, isUpdated: true };
        }

        const jobData = await prisma.jobs.create({
            data: filteredData
        })
        return { jobData, isUpdated: false };
    },

    async listAllJobs(userId, status, page, limit) {
        const jobs = await prisma.jobs.findMany({
            where: {
                userId: userId,
                deletedAt: null,
                adminApprovalStatus: status
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip: (page - 1) * limit,
            take: limit
        })

        const totalJobs = await prisma.jobs.count({
            where: {
                userId: userId,
                deletedAt: null,
                adminApprovalStatus: status
            }
        })
        return { jobs, totalJobs };
    },

    async listJobForDashboard(page, limit) {
        const jobs = await prisma.jobs.findMany({
            where: {
                deletedAt: null,
            },
            select: {
                id: true,
                title: true,
                type: true,
                createdAt: true,
                adminApprovalStatus: true,
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip: (page - 1) * limit,
            take: limit
        })

        const totalJobs = await prisma.jobs.count({
            where: {
                deletedAt: null,
            }
        })

        const activeJobs = await prisma.jobs.count({
            where: {
                deletedAt: null,
                adminApprovalStatus: "APPROVED"
            }
        })

        const pendingJobs = await prisma.jobs.count({
            where: {
                deletedAt: null,
                adminApprovalStatus: "PENDING"
            }
        })

        // const totalApplications = await prisma.applications.count({
        //     where: {
        //         deletedAt: null,
        //     }
        // })

        // const todaysApplications = await prisma.applications.count({
        //     where: {
        //         deletedAt: null,
        //         createdAt: {
        //             gte: new Date(new Date().setHours(0, 0, 0, 0))
        //         }
        //     }
        // })
        return { jobs, totalJobs, activeJobs, pendingJobs };
    },

    async adminApproveJob(jobId, status) {
        const jobData = await prisma.jobs.update({
            where: {
                id: jobId
            },
            data: {
                adminApprovalStatus: status
            }
        })
        return jobData;
    },

    async getJobById(jobId) {
        const job = await prisma.jobs.findUnique({
            where: {
                id: jobId,
                deletedAt: null
            },
            include: {
                jobCategory: true
            }
        })
        return job;
    }
}

module.exports = JobModel;