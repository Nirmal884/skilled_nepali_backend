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
        const where = {
            deletedAt: null,
            OR: [
                { deletionReason: "" },
                { deletionReason: null }
            ]
        }
        if (userId) {
            where.userId = userId
        }
        if (status) {
            where.adminApprovalStatus = status
        }
        const jobs = await prisma.jobs.findMany({
            where: where,
            include: {
                user: {
                    select: {
                        companyName: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip: (page - 1) * limit,
            take: limit
        })

        const totalJobs = await prisma.jobs.count({
            where: where
        })
        return { jobs, totalJobs };
    },

    async listJobForDashboard(page, limit, userId) {
        const skip = (page - 1) * limit;

        const whereCondition = {
            deletedAt: null,
            userId,
            OR: [
                { deletionReason: "" },
                { deletionReason: null }
            ]
        };

        const [jobs, totalJobs, activeJobs, pendingJobs] = await prisma.$transaction([
            prisma.jobs.findMany({
                where: whereCondition,
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
                skip,
                take: limit
            }),

            prisma.jobs.count({
                where: whereCondition
            }),

            prisma.jobs.count({
                where: {
                    ...whereCondition,
                    adminApprovalStatus: "APPROVED"
                }
            }),

            prisma.jobs.count({
                where: {
                    ...whereCondition,
                    adminApprovalStatus: "PENDING"
                }
            })
        ]);

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
                deletedAt: null,
                OR: [
                    { deletionReason: "" },
                    { deletionReason: null }
                ]
            },
            include: {
                jobCategory: true
            }
        })
        return job;
    },

    async deleteJobRequest(jobId, reason) {
        const jobData = await prisma.jobs.update({
            where: {
                id: jobId
            },
            data: {
                deletionReason: reason,
                deleteRequestedOn: new Date()
            }
        })

        return jobData;
    },

    async listDeleteRequestedJobs(page, limit) {
        const skip = page ? (page - 1) * limit : 0;
        const take = limit ? limit : 10;

        const [jobs, totalJobs] = await prisma.$transaction([
            prisma.jobs.findMany({
                where: {
                    deletedAt: null,
                    AND: [
                        { deletionReason: { not: null } },
                        { deletionReason: { not: "" } }
                    ]
                },
                skip,
                take,
                select: {
                    id: true,
                    title: true,
                    deletionReason: true,
                    createdAt: true,
                    location: true,
                    deadLine: true,
                    adminApprovalStatus: true,
                    deleteRequestedOn: true,
                    user: {
                        select: {
                            companyName: true,
                            fullName: true
                        }
                    }
                }
            }),
            prisma.jobs.count({
                where: {
                    deletedAt: null,
                    AND: [
                        { deletionReason: { not: null } },
                        { deletionReason: { not: "" } }
                    ]
                }
            })
        ]);

        return { jobs, totalJobs };
    },

    async approveDeletion(jobId) {
        const jobData = await prisma.jobs.update({
            where: {
                id: jobId
            },
            data: {
                deletedAt: new Date()
            }
        });
        return jobData;
    },

    async cancelDeletionRequest(jobId) {
        const jobData = await prisma.jobs.update({
            where: {
                id: jobId
            },
            data: {
                deletionReason: ""
            }
        });
        return jobData;
    }
}

module.exports = JobModel;