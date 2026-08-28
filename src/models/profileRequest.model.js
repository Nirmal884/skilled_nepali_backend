const prisma = require("../config/db");

const ProfileRequestModel = {
    async createProfileRequest(employerId, jobCategoryId, noOfCandidates) {
        return await prisma.profileRequest.create({
            data: {
                employerId,
                jobCategoryId,
                noOfCandidates: Number(noOfCandidates),
                status: 'PENDING'
            },
            include: {
                jobCategory: true,
                employer: {
                    select: {
                        id: true,
                        fullName: true,
                        companyName: true,
                        email: true
                    }
                }
            }
        });
    },

    async getEmployerProfileRequests(employerId) {
        return await prisma.profileRequest.findMany({
            where: {
                employerId,
                deletedAt: null
            },
            include: {
                jobCategory: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    },

    async getAdminProfileRequests() {
        return await prisma.profileRequest.findMany({
            where: {
                deletedAt: null
            },
            include: {
                jobCategory: true,
                employer: {
                    select: {
                        id: true,
                        fullName: true,
                        companyName: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    },

    async updateProfileRequestStatus(id, status) {
        return await prisma.profileRequest.update({
            where: { id },
            data: { status },
            include: {
                jobCategory: true,
                employer: {
                    select: {
                        id: true,
                        fullName: true,
                        companyName: true,
                        email: true
                    }
                }
            }
        });
    },

    async getProfileRequestById(id) {
        return await prisma.profileRequest.findUnique({
            where: { id },
            include: {
                jobCategory: true
            }
        });
    },

    async getMatchingCandidates(jobCategoryId, limit) {
        // Fetch jobseekers that belong to this category
        const candidates = await prisma.user.findMany({
            where: {
                role: 'JOBSEEKER',
                deletedAt: null,
                jobCategories: {
                    some: {
                        id: jobCategoryId
                    }
                }
            },
            include: {
                skills: true,
                workExperiences: {
                    where: { deletedAt: null }
                },
                certifications: {
                    where: { deletedAt: null }
                },
                educations: {
                    where: { deletedAt: null }
                }
            }
        });

        // Sort candidates by skills count desc, experience desc, certifications count desc
        candidates.sort((a, b) => {
            const skillsA = a.skills?.length || 0;
            const skillsB = b.skills?.length || 0;
            if (skillsB !== skillsA) {
                return skillsB - skillsA;
            }

            const expA = a.experience || 0;
            const expB = b.experience || 0;
            if (expB !== expA) {
                return expB - expA;
            }

            const certsA = a.certifications?.length || 0;
            const certsB = b.certifications?.length || 0;
            return certsB - certsA;
        });

        // Limit the results
        return candidates.slice(0, limit);
    }
};

module.exports = ProfileRequestModel;
