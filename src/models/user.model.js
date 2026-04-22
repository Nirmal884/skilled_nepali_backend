const prisma = require("../config/db");
const { countryOptions, gccCountryOptions } = require("../data/countryData");

const UserModel = {
    async createUser(data) {
        const filteredData = {
            fullName: data.fullName,
            email: data.email,
            password: data.password,
            country: data.country,
            role: data.role,
            phone: data.phone,
            experience: data.experience,
            pastExperience: data.pastExperience,
            resume: data.resume,
            companyName: data.companyName,
            designation: data.designation,
            companyLogo: data.companyLogo,
            centreName: data.centreName,
            centreLogo: data.centreLogo,
        };
        if (data.jobCategoryIds) {
            const ids = Array.isArray(data.jobCategoryIds) ? data.jobCategoryIds : [data.jobCategoryIds];
            filteredData.jobCategories = { connect: ids.map(id => ({ id })) };
        }
        if (data.applicantTypeId) {
            filteredData.applicantType = { connect: { id: data.applicantTypeId } };
        }

        if (data.role === "JOBSEEKER") {
            filteredData.isAdminApproved = true;
        }

        const userData = await prisma.user.create({
            data: filteredData
        })
        return userData;
    },

    async updateLogo(userId, role, logo) {
        const data = {};
        if (role === "EMPLOYER") {
            data.companyLogo = logo;
        } else if (role === "TRAINING_CENTRE") {
            data.centreLogo = logo;
        }

        const updatedUser = await prisma.user.update({
            where: {
                id: userId
            },
            data
        })
        return updatedUser;
    },

    async findUserByEmail(email) {
        const userList = await prisma.user.findFirst({
            where: { email: email, deletedAt: null }
        })
        // console.log(userList, "UserList")
        return userList;
    },

    async getAllUsers(role, search, page, limit) {

        const roleCondition = role === 'ADMIN'
            ? { not: 'ADMIN' }
            : role;

        const whereClause = {
            deletedAt: null,
            role: roleCondition
        };

        if (search) {
            whereClause.OR = [
                { fullName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
                { companyName: { contains: search, mode: 'insensitive' } },
                { centreName: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [users, count] = await prisma.$transaction([
            prisma.user.findMany({ where: whereClause, skip: page ? (page - 1) * limit : 0, take: limit ? limit : 10 }),
            prisma.user.count({ where: whereClause })
        ]);
        return { users, count };
    },

    async deleteUser(userId) {
        const deletedUser = await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                deletedAt: new Date()
            }
        })
        return deletedUser;
    },

    async verifyPhone(phone) {
        const userList = await prisma.user.findFirst({
            where: { phone: phone, deletedAt: null }
        })
        console.log(userList, "PHONE VERIFY")
        return userList;

    },

    async getUserProfile(userId) {
        const allCountries = [...countryOptions, ...gccCountryOptions];

        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            include: {
                jobCategories: {
                    select: {
                        id: true,
                        categoryName: true
                    },
                },
                applicantType: {
                    select: {
                        id: true,
                        applicantTypeName: true
                    }
                },
                educations: {
                    where: {
                        deletedAt: null
                    },
                    select: {
                        id: true,
                        institution: true,
                        fieldOfStudy: true,
                        startDate: true,
                        endDate: true,
                        isCompleted: true,
                    },
                    orderBy: {
                        endDate: 'desc'
                    }
                },
                workExperiences: {
                    where: {
                        deletedAt: null
                    },
                    select: {
                        id: true,
                        title: true,
                        companyName: true,
                        startDate: true,
                        endDate: true,
                        isCurrent: true,
                        description: true
                    }
                },
                certifications: {
                    where: {
                        deletedAt: null
                    },
                    select: {
                        id: true,
                        certificationName: true,
                        issuingAuthority: true,
                        issueDate: true,
                    }
                },
                skills: {
                    select: {
                        id: true,
                        skillName: true
                    }
                }
            }
        });

        if (!user) return null;

        const mappedUser = {
            ...user,
            country: allCountries.find(item => item.value === user.country)?.label || user.country,
        };

        delete mappedUser.password;
        delete mappedUser.applicantTypeId;

        return mappedUser;
    },

    async updateProfile(userId, data) {
        const updateUser = await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                ...(data.fullName && { fullName: data.fullName }),
                ...(data.title && { title: data.title }),
                ...(data.bio && { bio: data.bio }),
                ...(data.email && { email: data.email }),
                ...(data.phone && { phone: data.phone }),
                ...(data.skills && {
                    skills: {
                        set: data.skills.map(skill => ({ id: skill.id }))
                    }
                })
            }
        })
        return updateUser;
    },

    async createOrUpdateExperience(userId, data) {
        const { id, title, companyName, startDate, endDate, isCurrent, description } = data;
        if (id) {
            const updatedExperience = await prisma.workExperience.update({
                where: {
                    id: id
                },
                data: {
                    title: title,
                    companyName: companyName,
                    startDate: startDate,
                    endDate: endDate,
                    isCurrent: isCurrent,
                    description: description
                }
            })
            return updatedExperience;
        } else {
            const createdExperience = await prisma.workExperience.create({
                data: {
                    userId: userId,
                    title: title,
                    companyName: companyName,
                    startDate: startDate,
                    endDate: endDate,
                    isCurrent: isCurrent,
                    description: description
                }
            })
            return createdExperience;
        }
    },

    async deleteExperience(experienceId) {
        const deletedExperience = await prisma.workExperience.update({
            where: {
                id: experienceId
            },
            data: {
                deletedAt: new Date()
            }
        })
        return deletedExperience;
    },

    async createOrUpdateEducation(userId, data) {
        const { id, fieldOfStudy, institution, startDate, endDate, isCompleted } = data;
        if (id) {
            const updateEducation = await prisma.education.update({
                where: {
                    id: id
                },
                data: {
                    fieldOfStudy: fieldOfStudy,
                    institution: institution,
                    startDate: startDate,
                    endDate: endDate,
                    isCompleted: isCompleted
                }
            })
            return updateEducation;
        } else {
            const createEducation = await prisma.education.create({
                data: {
                    userId: userId,
                    fieldOfStudy: fieldOfStudy,
                    institution: institution,
                    startDate: startDate,
                    endDate: endDate,
                    isCompleted: isCompleted
                }
            })
            return createEducation;
        }
    },

    async deleteEducation(educationId) {
        const deletedEducation = await prisma.education.update({
            where: {
                id: educationId
            },
            data: {
                deletedAt: new Date()
            }
        })
        return deletedEducation;
    },

    async createOrUpdateCertification(userId, data) {
        const { id, certificationName, issuingAuthority, issueDate } = data;
        if (id) {
            const updateCertification = await prisma.certifications.update({
                where: {
                    id: id
                },
                data: {
                    certificationName: certificationName,
                    issuingAuthority: issuingAuthority,
                    issueDate: issueDate
                }
            })
            return updateCertification;
        } else {
            const createCertification = await prisma.certifications.create({
                data: {
                    userId: userId,
                    certificationName: certificationName,
                    issuingAuthority: issuingAuthority,
                    issueDate: issueDate
                }
            })
            return createCertification;
        }
    },

    async deleteCertification(certificationId) {
        const deletedCertification = await prisma.certifications.update({
            where: {
                id: certificationId
            },
            data: {
                deletedAt: new Date()
            }
        })
        return deletedCertification;
    }

}
module.exports = UserModel;