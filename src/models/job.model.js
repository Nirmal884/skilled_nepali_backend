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
            isUrgent: Boolean(data.isUrgent),
            isFeatured: Boolean(data.isFeatured),
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
                },
                _count: {
                    select: {
                        jobApplications: true
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

        const [jobs, totalJobs, activeJobs, pendingJobs, totalJobApplications, todaysApplications] = await prisma.$transaction([
            prisma.jobs.findMany({
                where: whereCondition,
                select: {
                    id: true,
                    title: true,
                    type: true,
                    createdAt: true,
                    adminApprovalStatus: true,
                    _count: {
                        select: {
                            jobApplications: true
                        }
                    }
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
            }),
            prisma.jobApplication.count({
                where: {
                    job: {
                        userId: userId
                    }
                }
            }),
            prisma.jobApplication.count({
                where: {
                    job: {
                        userId: userId
                    },
                    createdAt: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0))
                    }
                }
            })
        ]);

        return { jobs, totalJobs, activeJobs, pendingJobs, totalJobApplications, todaysApplications };
    },

    async adminApproveJob(jobId, status) {
        const jobData = await prisma.jobs.update({
            where: {
                id: jobId
            },
            data: {
                adminApprovalStatus: status,
                adminApprovedOn: new Date(),
                jobStatus: "ACTIVE"
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
    },

    async updateJobApplicationStatus(applicationId, status) {
        const updatedApplication = await prisma.jobApplication.update({
            where: { id: applicationId },
            data: { status }
        });
        return updatedApplication;
    },

    async listJobApplicaton(userId, page, limit, search, status, employerId) {
        const skip = page ? (page - 1) * limit : 0;
        const take = limit ? limit : 10;

        let statusFilter = null;
        if (status) {
            const statusList = Array.isArray(status)
                ? status
                : status.split(',');
            const cleanArray = statusList
                .map(s => s.trim())
                .filter(s => s !== "" && s !== "undefined" && s !== "null");
            if (cleanArray.length > 0) {
                statusFilter = { in: cleanArray };
            }
        }

        const whereClause = {
            ...(userId && { userId: userId }),
            ...(employerId && {
                job: {
                    userId: employerId
                }
            }),
            ...(statusFilter && { status: statusFilter }),
            ...(search && {
                OR: [
                    {
                        job: {
                            title: {
                                contains: search,
                                mode: 'insensitive'
                            }
                        }
                    },
                    {
                        user: {
                            fullName: {
                                contains: search,
                                mode: 'insensitive'
                            }
                        }
                    }
                ]
            })
        };

        const [jobAplication, count, inReviewCount, shortlistCount, rejectedCount] = await prisma.$transaction([
            prisma.jobApplication.findMany({
                where: whereClause,
                include: {
                    user: {
                        select: {
                            fullName: true,
                            email: true,
                            phone: true
                        }
                    },
                    job: {
                        include: {
                            user: {
                                select: {
                                    companyName: true,
                                    fullName: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take
            }),
            prisma.jobApplication.count({
                where: whereClause
            }),
            prisma.jobApplication.count({
                where: {
                    ...whereClause,
                    status: "REVIEWING"
                }
            }),
            prisma.jobApplication.count({
                where: {
                    ...whereClause,
                    status: "SHORTLISTED"
                }
            }),
            prisma.jobApplication.count({
                where: {
                    ...whereClause,
                    status: "REJECTED"
                }
            })
        ])
        return { jobAplication, count, inReviewCount, shortlistCount, rejectedCount }
    },


    // for web 

    async listAllApprovedJobs(page, limit, search, isUrgent, freshersOnly, countryArray, jobCategoryArray, experienceArray, jobTypeArray, isRecommended, userId) {
        const skip = page ? (page - 1) * limit : 0;
        const take = limit ? limit : 10;

        const where = {
            adminApprovalStatus: "APPROVED",
            jobStatus: "ACTIVE",
            deletedAt: null,
            OR: [
                { deletionReason: "" },
                { deletionReason: null }
            ]
        }

        let filterCategoryIds = [];
        if (isRecommended === true || isRecommended === 'true') {
            if (userId) {
                const user = await prisma.user.findUnique({
                    where: { id: userId },
                    include: { jobCategories: true }
                });
                if (user && user.jobCategories.length > 0) {
                    filterCategoryIds = user.jobCategories.map(cat => cat.id);
                }
            }
        }

        if (isUrgent === true || isUrgent === 'true') {
            where.isUrgent = true
        }

        if (freshersOnly === true || freshersOnly === 'true') {
            where.experience = "Entry-level"
        }

        if (countryArray) {
            const countryList = Array.isArray(countryArray)
                ? countryArray.map(Number)
                : countryArray.split(',').map(Number);
            const cleanArray = countryList.filter(n => !isNaN(n));
            if (cleanArray.length > 0) {
                where.country = { in: cleanArray };
            }
        }

        if (jobCategoryArray) {
            const jobCategoryList = Array.isArray(jobCategoryArray)
                ? jobCategoryArray
                : jobCategoryArray.split(',');
            const cleanArray = jobCategoryList
                .map(id => id.trim())
                .filter(id => id !== "" && id !== "undefined" && id !== "null");

            if (cleanArray.length > 0) {
                if (filterCategoryIds.length > 0) {
                    filterCategoryIds = cleanArray.filter(id => filterCategoryIds.includes(id));
                } else {
                    filterCategoryIds = cleanArray;
                }
            }
        }

        if (filterCategoryIds.length > 0) {
            where.jobCategoryId = { in: filterCategoryIds };
        }

        if (experienceArray) {
            const experienceList = Array.isArray(experienceArray)
                ? experienceArray
                : experienceArray.split(',');
            const cleanArray = experienceList
                .map(id => id.trim())
                .filter(id => id !== "" && id !== "undefined" && id !== "null");
            if (cleanArray.length > 0) {
                where.experience = { in: cleanArray };
            }
        }

        if (jobTypeArray) {
            const jobTypeList = Array.isArray(jobTypeArray)
                ? jobTypeArray
                : jobTypeArray.split(',');
            const cleanArray = jobTypeList
                .map(id => id.trim())
                .filter(id => id !== "" && id !== "undefined" && id !== "null");
            if (cleanArray.length > 0) {
                where.type = { in: cleanArray };
            }
        }

        if (search) {
            where.title = {
                contains: search,
                mode: "insensitive"
            }
        }
        const [jobs, totalJobs] = await prisma.$transaction([
            prisma.jobs.findMany({
                where: where,
                include: {
                    jobCategory: true,
                    user: {
                        select: {
                            companyName: true,
                            isVerified: true
                        }
                    },
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take
            }),
            prisma.jobs.count({
                where: where
            })
        ]);
        return { jobs, totalJobs };
    },

    async fetchJobById(jobId, userId) {
        const job = await prisma.jobs.findUnique({
            where: {
                id: jobId
            },
            include: {
                jobCategory: true,
                user: {
                    select: {
                        companyName: true,
                        isVerified: true
                    }
                },
                ...(userId ? {
                    jobApplications: {
                        where: {
                            userId: userId
                        },
                        select: {
                            status: true
                        }
                    }
                } : {})
            }
        })

        return job
    },

    async expirePastDeadlineJob() {
        const { count } = await prisma.jobs.updateMany({
            where: {
                deadLine: {
                    lt: new Date()
                },
                jobStatus: {
                    in: ["ACTIVE", "PENDING"]
                },
                adminApprovalStatus: "APPROVED",
                deletedAt: null
            },
            data: {
                jobStatus: "EXPIRED",
            }
        })

        return count;
    },

    async applyJob(userId, jobId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                email: true,
                phone: true,
                title: true,
                country: true,
                resume: true,
                experience: true,
                workExperiences: {
                    where: { deletedAt: null },
                    select: { id: true }
                },
                skills: {
                    where: { deletedAt: null },
                    select: { id: true }
                },
                educations: {
                    where: { deletedAt: null },
                    select: { id: true }
                }
            }
        });

        if (!user) {
            throw {
                code: "USER_NOT_FOUND",
                message: "User not found"
            };
        }

        const missingFields = [];
        if (!user.email) missingFields.push("Email");
        if (!user.phone || user.phone.trim() === "") missingFields.push("Phone");
        if (!user.title) missingFields.push("Title");
        if (user.country === null || user.country === undefined) missingFields.push("Country");
        if (user.skills.length === 0) missingFields.push("Skills");
        if (user.educations.length === 0) missingFields.push("Education");

        if (missingFields.length > 0) {
            throw {
                code: "PROFILE_INCOMPLETE",
                message: "Complete your profile before applying",
                missingFields
            };
        }

        try {
            return await prisma.jobApplication.create({
                data: { userId, jobId, resume: user.resume }
            });
        } catch (error) {
            if (error.code === "P2002") {
                throw {
                    code: "ALREADY_APPLIED",
                    message: "You have already applied for this job"
                };
            }
            throw error;
        }
    },

    async downloadAppliedJobsExcel(userId, search, status, employerId) {
        let statusFilter = null;
        if (status) {
            const statusList = Array.isArray(status)
                ? status
                : status.split(',');
            const cleanArray = statusList
                .map(s => s.trim())
                .filter(s => s !== "" && s !== "undefined" && s !== "null");
            if (cleanArray.length > 0) {
                statusFilter = { in: cleanArray };
            }
        }

        const whereClause = {
            ...(userId && { userId: userId }),
            ...(employerId && {
                job: {
                    userId: employerId
                }
            }),
            ...(statusFilter && { status: statusFilter }),
            ...(search && {
                OR: [
                    {
                        job: {
                            title: {
                                contains: search,
                                mode: 'insensitive'
                            }
                        }
                    },
                    {
                        user: {
                            fullName: {
                                contains: search,
                                mode: 'insensitive'
                            }
                        }
                    }
                ]
            })
        };

        const jobApplications = await prisma.jobApplication.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        fullName: true,
                        email: true,
                        phone: true
                    }
                },
                job: {
                    select: {
                        title: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return jobApplications;
    }
}

module.exports = JobModel;